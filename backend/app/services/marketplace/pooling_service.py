"""Pooling Service - aggregates small farmers into pooled lots."""

from __future__ import annotations

import uuid
from datetime import date, timedelta
from decimal import Decimal
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ...models import (
    BuyerRequirement,
    BuyerRequirementStatus,
    Farmer,
    PooledLot,
    PooledLotMember,
    PooledLotStatus,
)
from ...schemas.marketplace import PooledLotCreate, PooledLotMemberCreate
from .market_price_service import MarketPriceService
from .fair_price_service import FairPriceService


class PoolingService:
    """Service for auto-grouping small farmers into pooled lots."""

    # Configuration
    DEFAULT_BULK_THRESHOLD_KG = Decimal("5000")  # 50 quintals = bulk order
    DEFAULT_RADIUS_KM = 25
    DEFAULT_EXPIRY_DAYS = 7

    def __init__(self, db: AsyncSession):
        self.db = db
        self.market_price_service = MarketPriceService(db)
        self.fair_price_service = FairPriceService(db)

    def _generate_lot_code(self) -> str:
        """Generate a unique lot code."""
        return f"PL-{date.today().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

    async def find_pooling_candidates(
        self,
        crop: str,
        state: str,
        district: str,
        bulk_threshold_kg: Decimal = DEFAULT_BULK_THRESHOLD_KG,
        radius_km: int = DEFAULT_RADIUS_KM,
    ) -> list[Farmer]:
        """Find farmers eligible for pooling."""
        # Find farmers with same crop, in same district, with quantity below threshold
        stmt = select(Farmer).where(
            Farmer.preferred_crop == crop,
            Farmer.state == state,
            Farmer.district == district,
            Farmer.quantity_kg < bulk_threshold_kg,
            Farmer.quantity_kg > 0,
            Farmer.is_active == True,
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def create_pooled_lot(
        self,
        crop: str,
        state: str,
        district: str,
        target_quantity_kg: Decimal,
        variety: Optional[str] = None,
        grade: Optional[str] = None,
        suggested_price_per_quintal: Optional[Decimal] = None,
        expiry_days: int = DEFAULT_EXPIRY_DAYS,
    ) -> PooledLot:
        """Create a new pooled lot."""
        lot = PooledLot(
            lot_code=self._generate_lot_code(),
            crop=crop,
            variety=variety,
            grade=grade,
            state=state,
            district=district,
            target_quantity_kg=target_quantity_kg,
            suggested_price_per_quintal=suggested_price_per_quintal,
            expires_at=date.today() + timedelta(days=expiry_days),
            status=PooledLotStatus.FORMING,
        )
        self.db.add(lot)
        await self.db.commit()
        await self.db.refresh(lot)
        return lot

    async def add_farmer_to_lot(
        self,
        lot_id: str,
        farmer_id: str,
        quantity_kg: Decimal,
        agreed_price_per_quintal: Optional[Decimal] = None,
    ) -> PooledLotMember:
        """Add a farmer to a pooled lot."""
        member = PooledLotMember(
            pooled_lot_id=lot_id,
            farmer_id=farmer_id,
            quantity_kg=quantity_kg,
            agreed_price_per_quintal=agreed_price_per_quintal,
        )
        self.db.add(member)

        # Update lot total
        lot = await self.db.execute(select(PooledLot).where(PooledLot.id == lot_id))
        lot_obj = lot.scalar_one()
        lot_obj.total_quantity_kg += quantity_kg
        
        # Check if lot is ready
        if lot_obj.total_quantity_kg >= lot_obj.target_quantity_kg:
            lot_obj.status = PooledLotStatus.READY

        await self.db.commit()
        await self.db.refresh(member)
        return member

    async def auto_create_pooled_lot(
        self,
        crop: str,
        state: str,
        district: str,
        bulk_threshold_kg: Decimal = DEFAULT_BULK_THRESHOLD_KG,
        radius_km: int = DEFAULT_RADIUS_KM,
    ) -> Optional[PooledLot]:
        """Automatically create a pooled lot from eligible farmers."""
        candidates = await self.find_pooling_candidates(
            crop, state, district, bulk_threshold_kg, radius_km
        )

        if len(candidates) < 2:
            return None  # Need at least 2 farmers

        total_qty = sum(f.quantity_kg or Decimal("0") for f in candidates)
        if total_qty < bulk_threshold_kg:
            return None  # Not enough combined quantity

        # Get market price for suggested price
        price_summary = await self.market_price_service.get_price_summary(
            crop, district, state
        )
        suggested_price = price_summary.modal_price if price_summary else None

        # Create the lot
        lot = await self.create_pooled_lot(
            crop=crop,
            state=state,
            district=district,
            target_quantity_kg=min(total_qty, bulk_threshold_kg * 2),
            suggested_price_per_quintal=suggested_price,
        )

        # Add farmers to lot
        for farmer in candidates:
            await self.add_farmer_to_lot(
                lot_id=str(lot.id),
                farmer_id=str(farmer.id),
                quantity_kg=farmer.quantity_kg or Decimal("0"),
                agreed_price_per_quintal=suggested_price,
            )

        # Refresh and return
        await self.db.refresh(lot)
        return lot

    async def match_lot_to_requirement(
        self,
        lot_id: str,
        requirement_id: str,
    ) -> bool:
        """Match a ready pooled lot to a buyer requirement."""
        lot = await self.db.execute(select(PooledLot).where(PooledLot.id == lot_id))
        lot_obj = lot.scalar_one_or_none()
        if not lot_obj or lot_obj.status != PooledLotStatus.READY:
            return False

        req = await self.db.execute(
            select(BuyerRequirement).where(BuyerRequirement.id == requirement_id)
        )
        req_obj = req.scalar_one_or_none()
        if not req_obj or req_obj.status != BuyerRequirementStatus.ACTIVE:
            return False

        # Check compatibility
        if req_obj.crop != lot_obj.crop:
            return False
        if req_obj.state != lot_obj.state:
            return False
        if lot_obj.total_quantity_kg < req_obj.min_quantity_kg:
            return False
        if lot_obj.total_quantity_kg > req_obj.max_quantity_kg:
            return False

        # Match them
        lot_obj.status = PooledLotStatus.MATCHED
        lot_obj.matched_requirement_id = requirement_id
        req_obj.status = BuyerRequirementStatus.FILLED

        await self.db.commit()
        return True

    async def get_pooled_lot_with_members(self, lot_id: str) -> Optional[PooledLot]:
        """Get pooled lot with all members loaded."""
        stmt = (
            select(PooledLot)
            .options(selectinload(PooledLot.members))
            .where(PooledLot.id == lot_id)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def confirm_farmer_participation(
        self,
        lot_id: str,
        farmer_id: str,
    ) -> bool:
        """Farmer confirms participation in pooled lot."""
        stmt = select(PooledLotMember).where(
            PooledLotMember.pooled_lot_id == lot_id,
            PooledLotMember.farmer_id == farmer_id,
        )
        result = await self.db.execute(stmt)
        member = result.scalar_one_or_none()
        if not member:
            return False

        member.is_confirmed = True
        member.confirmed_at = date.today()
        await self.db.commit()
        return True

    async def calculate_payout_split(self, lot_id: str) -> list[dict]:
        """Calculate proportional payout for each farmer in a matched lot."""
        lot = await self.get_pooled_lot_with_members(lot_id)
        if not lot or not lot.matched_requirement_id:
            return []

        req = await self.db.execute(
            select(BuyerRequirement).where(BuyerRequirement.id == lot.matched_requirement_id)
        )
        req_obj = req.scalar_one_or_none()
        if not req_obj:
            return []

        total_qty = lot.total_quantity_kg
        if total_qty == 0:
            return []

        payouts = []
        for member in lot.members:
            share = float(member.quantity_kg / total_qty)
            amount = req_obj.offered_price_per_quintal * member.quantity_kg / Decimal("100")  # Convert kg to quintals
            payouts.append({
                "farmer_id": str(member.farmer_id),
                "quantity_kg": member.quantity_kg,
                "share_pct": round(share * 100, 2),
                "amount": round(amount, 2),
                "price_per_quintal": member.agreed_price_per_quintal or req_obj.offered_price_per_quintal,
            })

        return payouts
