"""Marketplace API endpoints for Fair Price Discovery & Smart Matching."""

from __future__ import annotations

import uuid
from datetime import date
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_session
from ..models import (
    Buyer,
    BuyerRequirement,
    BuyerRequirementStatus,
    Offer,
    OfferStatus,
)
from ..schemas.marketplace import (
    BuyerCreate,
    BuyerOut,
    BuyerRequirementCreate,
    BuyerRequirementOut,
    BuyerRequirementUpdate,
    BuyerUpdate,
    FairPriceIndicator,
    MarketPriceCreate,
    MarketPriceOut,
    MarketPriceSummary,
    MatchedBuyerRequirement,
    MatchedFarmerListing,
    OfferCreate,
    OfferOut,
    OfferUpdate,
    PooledLotCreate,
    PooledLotMemberCreate,
    PooledLotOut,
)
from ..services.errors import ConflictError, NotFoundError
from ..services.marketplace import (
    FairPriceService,
    MatchingEngine,
    MarketPriceService,
    PoolingService,
)
from ..services.resolvers import resolve_buyer, resolve_buyer_requirement

router = APIRouter(prefix="/marketplace", tags=["marketplace"])


# ==================== Market Price Endpoints ====================

@router.get(
    "/market-price",
    response_model=MarketPriceSummary,
    summary="Get current market price for a crop/region",
)
async def get_market_price(
    crop: str = Query(..., min_length=1, max_length=64),
    region: str = Query(..., min_length=1, max_length=128),
    state: str = Query(..., min_length=1, max_length=64),
    grade: str = Query(default="FAQ", max_length=32),
    db: AsyncSession = Depends(get_session),
) -> MarketPriceSummary:
    """Get current market price with 30-day statistics.
    
    Returns min/max/modal price, unit, and 30-day avg/min/max.
    """
    service = MarketPriceService(db)
    summary = await service.get_price_summary(crop, region, state, grade)
    if not summary:
        # Try to create demo prices and retry
        await service.get_or_create_demo_prices()
        summary = await service.get_price_summary(crop, region, state, grade)
    
    if not summary:
        raise HTTPException(
            status_code=404,
            detail=f"No market price data for {crop} in {region}, {state}",
        )
    return summary


@router.post(
    "/market-price",
    response_model=MarketPriceOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create market price record (admin)",
)
async def create_market_price(
    data: MarketPriceCreate,
    db: AsyncSession = Depends(get_session),
) -> MarketPriceOut:
    """Create a new market price record."""
    service = MarketPriceService(db)
    mp = await service.create_price(data)
    return MarketPriceOut.from_model(mp)


@router.get(
    "/market-price/history",
    response_model=list[MarketPriceOut],
    summary="Get price history for a crop/region",
)
async def get_price_history(
    crop: str = Query(..., min_length=1, max_length=64),
    region: str = Query(..., min_length=1, max_length=128),
    state: str = Query(..., min_length=1, max_length=64),
    days: int = Query(default=30, ge=1, le=365),
    db: AsyncSession = Depends(get_session),
) -> list[MarketPriceOut]:
    """Get price history for the last N days."""
    service = MarketPriceService(db)
    prices = await service.get_prices_for_crop_region(crop, region, state, days)
    return [MarketPriceOut.from_model(p) for p in prices]


# ==================== Fair Price Indicator ====================

@router.get(
    "/fair-price",
    response_model=FairPriceIndicator,
    summary="Get fair price indicator for an offer",
)
async def get_fair_price(
    offer_price: Decimal = Query(..., gt=0),
    crop: str = Query(..., min_length=1, max_length=64),
    region: str = Query(..., min_length=1, max_length=128),
    state: str = Query(..., min_length=1, max_length=64),
    grade: str = Query(default="FAQ", max_length=32),
    db: AsyncSession = Depends(get_session),
) -> FairPriceIndicator:
    """Compute fair price indicator for a given offer price.
    
    Returns market average, deviation %, status, badge color, and message.
    """
    service = FairPriceService(db)
    indicator = await service.get_fair_price_indicator(
        offer_price, crop, region, state, grade
    )
    if not indicator:
        # Try to create demo prices
        market_service = MarketPriceService(db)
        await market_service.get_or_create_demo_prices()
        indicator = await service.get_fair_price_indicator(
            offer_price, crop, region, state, grade
        )
    if not indicator:
        raise HTTPException(
            status_code=404,
            detail=f"Cannot compute fair price - no market data for {crop} in {region}, {state}",
        )
    return indicator


@router.post(
    "/check-low-offer",
    summary="Check if offer is below market and get counter suggestion",
)
async def check_low_offer(
    offer_price: Decimal,
    crop: str,
    region: str,
    state: str,
    grade: str = "FAQ",
    db: AsyncSession = Depends(get_session),
):
    """Check if offer is more than 10% below market average.
    
    Returns alert info with suggested counter price if low.
    """
    service = FairPriceService(db)
    result = await service.check_low_offer_alert(
        offer_price, crop, region, state, grade
    )
    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"Cannot check - no market data for {crop} in {region}, {state}",
        )
    return result


# ==================== Buyer Endpoints ====================

@router.post(
    "/buyers",
    response_model=BuyerOut,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new buyer",
)
async def create_buyer(
    data: BuyerCreate,
    db: AsyncSession = Depends(get_session),
) -> BuyerOut:
    """Register a new buyer (trader, processor, exporter)."""
    # Check for duplicate phone
    existing = await db.execute(select(Buyer).where(Buyer.phone == data.phone))
    if existing.scalar_one_or_none():
        raise ConflictError(
            "A buyer with this mobile number is already registered",
            code="phone_taken",
        )

    from ..services.security import hash_password
    buyer = Buyer(
        buyer_code=f"BYR-{date.today().year}-{uuid.uuid4().hex[:6].upper()}",
        **data.model_dump(exclude={"password"}),
        password_hash=hash_password(data.password),
    )
    db.add(buyer)
    await db.commit()
    await db.refresh(buyer)
    return BuyerOut.from_model(buyer)


@router.get(
    "/buyers/{buyer_id}",
    response_model=BuyerOut,
    summary="Get buyer by ID",
)
async def get_buyer(
    buyer_id: str,
    db: AsyncSession = Depends(get_session),
) -> BuyerOut:
    buyer = await resolve_buyer(db, buyer_id)
    return BuyerOut.from_model(buyer)


@router.put(
    "/buyers/{buyer_id}",
    response_model=BuyerOut,
    summary="Update buyer profile",
)
async def update_buyer(
    buyer_id: str,
    data: BuyerUpdate,
    db: AsyncSession = Depends(get_session),
) -> BuyerOut:
    buyer = await resolve_buyer(db, buyer_id)
    update_data = data.model_dump(exclude_unset=True)
    if "password" in update_data:
        from ..services.security import hash_password
        update_data["password_hash"] = hash_password(update_data.pop("password"))
    for field, value in update_data.items():
        setattr(buyer, field, value)
    await db.commit()
    await db.refresh(buyer)
    return BuyerOut.from_model(buyer)


# ==================== Buyer Requirement Endpoints ====================

@router.post(
    "/buyers/{buyer_id}/requirements",
    response_model=BuyerRequirementOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a buyer requirement",
)
async def create_buyer_requirement(
    buyer_id: str,
    data: BuyerRequirementCreate,
    db: AsyncSession = Depends(get_session),
) -> BuyerRequirementOut:
    """Post a new procurement requirement."""
    buyer = await resolve_buyer(db, buyer_id)
    req = BuyerRequirement(buyer_id=buyer.id, **data.model_dump())
    db.add(req)
    await db.commit()
    await db.refresh(req)
    return BuyerRequirementOut.from_model(req)


@router.get(
    "/buyers/{buyer_id}/requirements",
    response_model=list[BuyerRequirementOut],
    summary="List buyer's requirements",
)
async def list_buyer_requirements(
    buyer_id: str,
    status: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_session),
) -> list[BuyerRequirementOut]:
    buyer = await resolve_buyer(db, buyer_id)
    stmt = select(BuyerRequirement).where(BuyerRequirement.buyer_id == buyer.id)
    if status:
        stmt = stmt.where(BuyerRequirement.status == status.upper())
    result = await db.execute(stmt)
    return [BuyerRequirementOut.from_model(r) for r in result.scalars().all()]


@router.get(
    "/requirements",
    response_model=list[BuyerRequirementOut],
    summary="List all active buyer requirements (marketplace)",
)
async def list_all_requirements(
    crop: Optional[str] = Query(default=None),
    state: Optional[str] = Query(default=None),
    district: Optional[str] = Query(default=None),
    status: str = Query(default="ACTIVE"),
    db: AsyncSession = Depends(get_session),
) -> list[BuyerRequirementOut]:
    """List all active buyer requirements for marketplace browsing."""
    stmt = select(BuyerRequirement).join(Buyer).where(
        BuyerRequirement.status == BuyerRequirementStatus.ACTIVE,
        Buyer.is_active == True,
    )
    if crop:
        stmt = stmt.where(BuyerRequirement.crop == crop)
    if state:
        stmt = stmt.where(BuyerRequirement.state == state)
    if district:
        stmt = stmt.where(BuyerRequirement.district == district)
    result = await db.execute(stmt)
    return [BuyerRequirementOut.from_model(r) for r in result.scalars().all()]


@router.get(
    "/requirements/{requirement_id}",
    response_model=BuyerRequirementOut,
    summary="Get buyer requirement by ID",
)
async def get_requirement(
    requirement_id: str,
    db: AsyncSession = Depends(get_session),
) -> BuyerRequirementOut:
    req = await resolve_buyer_requirement(db, requirement_id)
    return BuyerRequirementOut.from_model(req)


@router.put(
    "/requirements/{requirement_id}",
    response_model=BuyerRequirementOut,
    summary="Update buyer requirement",
)
async def update_requirement(
    requirement_id: str,
    data: BuyerRequirementUpdate,
    db: AsyncSession = Depends(get_session),
) -> BuyerRequirementOut:
    req = await resolve_buyer_requirement(db, requirement_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(req, field, value)
    await db.commit()
    await db.refresh(req)
    return BuyerRequirementOut.from_model(req)


# ==================== Smart Matching Endpoints ====================

@router.get(
    "/match/farmer/{farmer_id}",
    response_model=list[MatchedBuyerRequirement],
    summary="Find matching buyers for a farmer's produce",
)
async def match_farmer_to_buyers(
    farmer_id: str,
    crop: str = Query(..., min_length=1),
    quantity_kg: Decimal = Query(..., gt=0),
    state: str = Query(..., min_length=1),
    district: str = Query(..., min_length=1),
    grade: str = Query(default="FAQ"),
    limit: int = Query(default=5, ge=1, le=20),
    db: AsyncSession = Depends(get_session),
) -> list[MatchedBuyerRequirement]:
    """Smart matching: find top 5 buyers for farmer's listing.
    
    Ranked by: price offered, distance, quantity fit, buyer reliability.
    """
    engine = MatchingEngine(db)
    matches = await engine.match_farmer_to_buyers(
        farmer_id=farmer_id,
        crop=crop,
        quantity_kg=quantity_kg,
        state=state,
        district=district,
        grade=grade,
        limit=limit,
    )
    return matches


@router.get(
    "/match/buyer/{requirement_id}",
    response_model=list[MatchedFarmerListing],
    summary="Find matching farmers for a buyer's requirement",
)
async def match_buyer_to_farmers(
    requirement_id: str,
    limit: int = Query(default=5, ge=1, le=20),
    db: AsyncSession = Depends(get_session),
) -> list[MatchedFarmerListing]:
    """Smart matching: find top 5 farmers for buyer's requirement."""
    engine = MatchingEngine(db)
    matches = await engine.match_buyer_to_farmers(
        requirement_id=requirement_id,
        limit=limit,
    )
    return matches


# ==================== Offer Endpoints ====================

@router.post(
    "/offers",
    response_model=OfferOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create an offer (or counter-offer)",
)
async def create_offer(
    data: OfferCreate,
    db: AsyncSession = Depends(get_session),
) -> OfferOut:
    """Create an offer from buyer to farmer/pooled lot."""
    # Verify requirement exists
    req = await resolve_buyer_requirement(db, data.requirement_id)
    
    # Check if counter-offer
    is_counter = data.parent_offer_id is not None
    
    # Get fair price info
    fair_price_service = FairPriceService(db)
    fair_price = await fair_price_service.get_fair_price_indicator(
        data.price_per_quintal,
        req.crop,
        req.district or req.state,
        req.state,
    )
    
    offer = Offer(
        buyer_id=req.buyer_id,
        requirement_id=req.id,
        farmer_id=data.farmer_id,
        pooled_lot_id=data.pooled_lot_id,
        price_per_quintal=data.price_per_quintal,
        quantity_kg=data.quantity_kg,
        is_counter=is_counter,
        parent_offer_id=data.parent_offer_id,
        expires_at=data.expires_at,
        market_avg_price=fair_price.market_avg_price if fair_price else None,
        deviation_pct=fair_price.deviation_pct if fair_price else None,
    )
    db.add(offer)
    await db.commit()
    await db.refresh(offer)
    return OfferOut.from_model(offer)


@router.get(
    "/offers/{offer_id}",
    response_model=OfferOut,
    summary="Get offer by ID",
)
async def get_offer(
    offer_id: str,
    db: AsyncSession = Depends(get_session),
) -> OfferOut:
    stmt = select(Offer).where(Offer.id == offer_id)
    result = await db.execute(stmt)
    offer = result.scalar_one_or_none()
    if not offer:
        raise NotFoundError("Offer not found")
    return OfferOut.from_model(offer)


@router.put(
    "/offers/{offer_id}",
    response_model=OfferOut,
    summary="Update offer (accept/reject/counter)",
)
async def update_offer(
    offer_id: str,
    data: OfferUpdate,
    db: AsyncSession = Depends(get_session),
) -> OfferOut:
    stmt = select(Offer).where(Offer.id == offer_id)
    result = await db.execute(stmt)
    offer = result.scalar_one_or_none()
    if not offer:
        raise NotFoundError("Offer not found")

    update_data = data.model_dump(exclude_unset=True)
    if "status" in update_data:
        offer.status = update_data["status"].upper()
        if offer.status in (OfferStatus.ACCEPTED, OfferStatus.REJECTED):
            offer.responded_at = date.today()
    for field in ("price_per_quintal", "quantity_kg", "expires_at"):
        if field in update_data:
            setattr(offer, field, update_data[field])
    await db.commit()
    await db.refresh(offer)
    return OfferOut.from_model(offer)


# ==================== Pooled Lot Endpoints ====================

@router.post(
    "/pooled-lots",
    response_model=PooledLotOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a pooled lot",
)
async def create_pooled_lot(
    data: PooledLotCreate,
    db: AsyncSession = Depends(get_session),
) -> PooledLotOut:
    """Create a new pooled lot for bulk selling."""
    service = PoolingService(db)
    lot = await service.create_pooled_lot(
        crop=data.crop,
        state=data.state,
        district=data.district,
        target_quantity_kg=data.target_quantity_kg,
        variety=data.variety,
        grade=data.grade,
        suggested_price_per_quintal=data.suggested_price_per_quintal,
    )
    return PooledLotOut.from_model(lot)


@router.post(
    "/pooled-lots/auto-create",
    response_model=PooledLotOut,
    summary="Auto-create pooled lot from nearby small farmers",
)
async def auto_create_pooled_lot(
    crop: str = Query(..., min_length=1),
    state: str = Query(..., min_length=1),
    district: str = Query(..., min_length=1),
    bulk_threshold_kg: Decimal = Query(default=5000, gt=0),
    radius_km: int = Query(default=25, gt=0),
    db: AsyncSession = Depends(get_session),
) -> PooledLotOut:
    """Automatically group nearby small farmers into a pooled lot."""
    service = PoolingService(db)
    lot = await service.auto_create_pooled_lot(
        crop=crop,
        state=state,
        district=district,
        bulk_threshold_kg=bulk_threshold_kg,
        radius_km=radius_km,
    )
    if not lot:
        raise HTTPException(
            status_code=400,
            detail="Not enough eligible farmers to form a pooled lot",
        )
    return PooledLotOut.from_model(lot)


@router.post(
    "/pooled-lots/{lot_id}/members",
    response_model=PooledLotOut,
    summary="Add farmer to pooled lot",
)
async def add_farmer_to_lot(
    lot_id: str,
    data: PooledLotMemberCreate,
    db: AsyncSession = Depends(get_session),
) -> PooledLotOut:
    service = PoolingService(db)
    await service.add_farmer_to_lot(
        lot_id=lot_id,
        farmer_id=data.farmer_id,
        quantity_kg=data.quantity_kg,
        agreed_price_per_quintal=data.agreed_price_per_quintal,
    )
    lot = await service.get_pooled_lot_with_members(lot_id)
    return PooledLotOut.from_model(lot)


@router.post(
    "/pooled-lots/{lot_id}/match/{requirement_id}",
    summary="Match pooled lot to buyer requirement",
)
async def match_lot_to_requirement(
    lot_id: str,
    requirement_id: str,
    db: AsyncSession = Depends(get_session),
):
    service = PoolingService(db)
    success = await service.match_lot_to_requirement(lot_id, requirement_id)
    if not success:
        raise HTTPException(
            status_code=400,
            detail="Cannot match - check lot status and requirement compatibility",
        )
    return {"success": True, "message": "Pooled lot matched to buyer requirement"}


@router.get(
    "/pooled-lots/{lot_id}",
    response_model=PooledLotOut,
    summary="Get pooled lot with members",
)
async def get_pooled_lot(
    lot_id: str,
    db: AsyncSession = Depends(get_session),
) -> PooledLotOut:
    service = PoolingService(db)
    lot = await service.get_pooled_lot_with_members(lot_id)
    if not lot:
        raise NotFoundError("Pooled lot not found")
    return PooledLotOut.from_model(lot)


@router.post(
    "/pooled-lots/{lot_id}/confirm/{farmer_id}",
    summary="Farmer confirms participation in pooled lot",
)
async def confirm_participation(
    lot_id: str,
    farmer_id: str,
    db: AsyncSession = Depends(get_session),
):
    service = PoolingService(db)
    success = await service.confirm_farmer_participation(lot_id, farmer_id)
    if not success:
        raise HTTPException(status_code=400, detail="Member not found")
    return {"success": True, "message": "Participation confirmed"}


@router.get(
    "/pooled-lots/{lot_id}/payout",
    summary="Calculate payout split for matched lot",
)
async def calculate_payout(
    lot_id: str,
    db: AsyncSession = Depends(get_session),
):
    service = PoolingService(db)
    payouts = await service.calculate_payout_split(lot_id)
    return {"payouts": payouts}
