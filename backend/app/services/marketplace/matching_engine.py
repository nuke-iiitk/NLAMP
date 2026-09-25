"""Smart Matching Engine - matches farmers to buyers and vice versa."""

from __future__ import annotations

import math
from decimal import Decimal
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ...models import (
    Buyer,
    BuyerRequirement,
    BuyerRequirementStatus,
    Farmer,
    ProcurementCentre,
)
from ...schemas.marketplace import (
    BuyerRequirementOut,
    FairPriceIndicator,
    MatchScore,
    MatchedBuyerRequirement,
    MatchedFarmerListing,
)
from ..resolvers import resolve_farmer
from .fair_price_service import FairPriceService


class MatchingEngine:
    """Smart matching engine with configurable weights."""

    # Default weights for matching (can be tuned)
    DEFAULT_WEIGHTS = {
        "price": 0.35,
        "distance": 0.25,
        "quantity": 0.20,
        "reliability": 0.20,
    }

    def __init__(self, db: AsyncSession, weights: Optional[dict] = None):
        self.db = db
        self.weights = weights or self.DEFAULT_WEIGHTS
        self.fair_price_service = FairPriceService(db)

    def _haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two lat/lon points in km."""
        R = 6371  # Earth radius in km
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2) ** 2
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def _calculate_distance_score(
        self, farmer_lat: float, farmer_lon: float, buyer_lat: float, buyer_lon: float, max_distance: Optional[int]
    ) -> float:
        """Calculate distance score (0-1, higher is better)."""
        if None in (farmer_lat, farmer_lon, buyer_lat, buyer_lon):
            return 0.5  # Unknown location
        
        distance = self._haversine_distance(farmer_lat, farmer_lon, buyer_lat, buyer_lon)
        if max_distance and distance > max_distance:
            return 0.0
        # Score decreases with distance
        max_d = max_distance or 200
        return max(0.0, 1.0 - (distance / max_d))

    def _calculate_price_score(self, offer_price: Decimal, market_avg: Decimal) -> float:
        """Calculate price score (0-1, higher is better for farmer)."""
        if market_avg == 0:
            return 0.5
        ratio = float(offer_price / market_avg)
        if ratio >= 1.0:
            return min(1.0, ratio)  # Above market is good
        else:
            return ratio  # Below market penalized

    def _calculate_quantity_score(self, farmer_qty: Decimal, buyer_min: Decimal, buyer_max: Decimal) -> float:
        """Calculate quantity fit score (0-1)."""
        if buyer_min <= farmer_qty <= buyer_max:
            return 1.0
        elif farmer_qty < buyer_min:
            return float(farmer_qty / buyer_min)
        else:
            # Farmer has more than buyer max - still good but partial
            return min(1.0, float(buyer_max / farmer_qty))

    def _calculate_reliability_score(self, reliability: int) -> float:
        """Normalize reliability score (0-100) to 0-1."""
        return reliability / 100.0

    async def match_farmer_to_buyers(
        self,
        farmer_id: str,
        crop: str,
        quantity_kg: Decimal,
        state: str,
        district: str,
        farmer_lat: Optional[float] = None,
        farmer_lon: Optional[float] = None,
        grade: str = "FAQ",
        limit: int = 5,
    ) -> list[MatchedBuyerRequirement]:
        """Find top matching buyer requirements for a farmer's produce."""
        # Get active buyer requirements matching crop and state
        stmt = (
            select(BuyerRequirement)
            .join(Buyer, Buyer.id == BuyerRequirement.buyer_id)
            .where(
                BuyerRequirement.crop == crop,
                BuyerRequirement.state == state,
                BuyerRequirement.status == BuyerRequirementStatus.ACTIVE,
                Buyer.is_active == True,
            )
            .order_by(BuyerRequirement.offered_price_per_quintal.desc())
        )
        result = await self.db.execute(stmt)
        requirements = result.scalars().all()

        # Get farmer location if not provided
        if farmer_lat is None or farmer_lon is None:
            farmer_obj = await resolve_farmer(self.db, farmer_id)
            # Try to get from procurement centre
            if farmer_obj.preferred_centre_id:
                centre = await self.db.execute(
                    select(ProcurementCentre).where(
                        ProcurementCentre.id == farmer_obj.preferred_centre_id
                    )
                )
                centre_obj = centre.scalar_one_or_none()
                if centre_obj and centre_obj.latitude and centre_obj.longitude:
                    farmer_lat = float(centre_obj.latitude)
                    farmer_lon = float(centre_obj.longitude)

        matches = []
        for req in requirements:
            # Get buyer location
            buyer = await self.db.execute(select(Buyer).where(Buyer.id == req.buyer_id))
            buyer_obj = buyer.scalar_one_or_none()
            
            buyer_lat = None
            buyer_lon = None
            if buyer_obj:
                # Could add lat/lon to buyer model, for now use centre
                pass

            # Calculate match scores
            price_score = 0.5
            fair_price = None
            
            if req.offered_price_per_quintal:
                fair_price = await self.fair_price_service.get_fair_price_indicator(
                    req.offered_price_per_quintal,
                    crop,
                    district,  # Use district as region
                    state,
                    grade,
                )
                if fair_price:
                    price_score = self._calculate_price_score(
                        req.offered_price_per_quintal,
                        fair_price.market_avg_price
                    )

            distance_score = self._calculate_distance_score(
                farmer_lat, farmer_lon, buyer_lat, buyer_lon,
                req.max_distance_km,
            )
            quantity_score = self._calculate_quantity_score(
                quantity_kg, req.min_quantity_kg, req.max_quantity_kg
            )
            reliability_score = self._calculate_reliability_score(
                buyer_obj.reliability_score if buyer_obj else 50
            )

            # Weighted total
            total = (
                self.weights["price"] * price_score
                + self.weights["distance"] * distance_score
                + self.weights["quantity"] * quantity_score
                + self.weights["reliability"] * reliability_score
            )

            match_score = MatchScore(
                price_score=round(price_score, 3),
                distance_score=round(distance_score, 3),
                quantity_score=round(quantity_score, 3),
                reliability_score=round(reliability_score, 3),
                total_score=round(total, 3),
            )

            req_out = BuyerRequirementOut.from_model(req)
            matches.append(
                MatchedBuyerRequirement(
                    requirement=req_out,
                    match_score=match_score,
                    fair_price=fair_price or FairPriceIndicator(
                        market_avg_price=Decimal("0"),
                        offer_price=Decimal("0"),
                        deviation_pct=0.0,
                        status="unknown",
                        badge_color="gray",
                        message="Market data unavailable",
                    ),
                )
            )

        # Sort by total score descending
        matches.sort(key=lambda m: m.match_score.total_score, reverse=True)
        return matches[:limit]

    async def match_buyer_to_farmers(
        self,
        requirement_id: str,
        limit: int = 5,
    ) -> list[MatchedFarmerListing]:
        """Find top matching farmer listings for a buyer's requirement."""
        req = await self.db.execute(
            select(BuyerRequirement).where(BuyerRequirement.id == requirement_id)
        )
        req_obj = req.scalar_one_or_none()
        if not req_obj:
            return []

        # Get farmers with matching produce in the same state
        # This would typically query a listings table - for now use farmer profiles
        stmt = select(Farmer).where(
            Farmer.preferred_crop == req_obj.crop,
            Farmer.state == req_obj.state,
            Farmer.is_active == True,
        )
        result = await self.db.execute(stmt)
        farmers = result.scalars().all()

        # Get buyer location (simplified)
        buyer_lat, buyer_lon = None, None

        matches = []
        for farmer in farmers:
            if not farmer.quantity_kg:
                continue

            # Get farmer location
            farmer_lat, farmer_lon = None, None
            if farmer.preferred_centre_id:
                centre = await self.db.execute(
                    select(ProcurementCentre).where(ProcurementCentre.id == farmer.preferred_centre_id)
                )
                centre_obj = centre.scalar_one_or_none()
                if centre_obj and centre_obj.latitude and centre_obj.longitude:
                    farmer_lat = float(centre_obj.latitude)
                    farmer_lon = float(centre_obj.longitude)

            # Calculate scores
            price_score = 0.5
            fair_price = None
            
            # For farmers, we don't have an explicit offer price yet
            # Use market average as reference
            if req_obj.offered_price_per_quintal:
                fair_price = await self.fair_price_service.get_fair_price_indicator(
                    req_obj.offered_price_per_quintal,
                    req_obj.crop,
                    farmer.district or farmer.state,
                    farmer.state,
                    "FAQ",
                )
                if fair_price:
                    price_score = self._calculate_price_score(
                        req_obj.offered_price_per_quintal,
                        fair_price.market_avg_price
                    )

            distance_score = self._calculate_distance_score(
                farmer_lat, farmer_lon, buyer_lat, buyer_lon,
                req_obj.max_distance_km,
            )
            quantity_score = self._calculate_quantity_score(
                farmer.quantity_kg, req_obj.min_quantity_kg, req_obj.max_quantity_kg
            )
            reliability_score = 0.7  # Default for farmers

            total = (
                self.weights["price"] * price_score
                + self.weights["distance"] * distance_score
                + self.weights["quantity"] * quantity_score
                + self.weights["reliability"] * reliability_score
            )

            match_score = MatchScore(
                price_score=round(price_score, 3),
                distance_score=round(distance_score, 3),
                quantity_score=round(quantity_score, 3),
                reliability_score=round(reliability_score, 3),
                total_score=round(total, 3),
            )

            matches.append(
                MatchedFarmerListing(
                    farmer_id=str(farmer.id),
                    farmer_name=farmer.name,
                    crop=farmer.preferred_crop or "",
                    quantity_kg=farmer.quantity_kg or Decimal("0"),
                    state=farmer.state or "",
                    district=farmer.district or "",
                    price_per_quintal=None,
                    match_score=match_score,
                    fair_price=fair_price or FairPriceIndicator(
                        market_avg_price=Decimal("0"),
                        offer_price=Decimal("0"),
                        deviation_pct=0.0,
                        status="unknown",
                        badge_color="gray",
                        message="Market data unavailable",
                    ),
                )
            )

        matches.sort(key=lambda m: m.match_score.total_score, reverse=True)
        return matches[:limit]
