"""Marketplace schemas for Fair Price Discovery & Smart Matching."""

from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import inspect as sa_inspect


def _loaded_relation(obj: object, name: str) -> list:
    """Read an ORM relationship only when it is already loaded.

    Pooled-lot queries eager-load their members (`lazy="selectin"`), so the
    collection is populated in practice; this guard guarantees that response
    building never emits an implicit lazy load, which would raise
    MissingGreenlet on the async engine.
    """
    state = sa_inspect(obj, raiseerr=False)
    if state is None or name in state.unloaded:
        return []
    return list(state.attrs[name].value or [])


class MarketPriceBase(BaseModel):
    crop: str = Field(min_length=1, max_length=64)
    region: str = Field(min_length=1, max_length=128)
    state: str = Field(min_length=1, max_length=64)
    district: Optional[str] = Field(default=None, max_length=64)
    market_name: Optional[str] = Field(default=None, max_length=128)
    grade: Optional[str] = Field(default=None, max_length=32)
    price_date: date
    min_price: Decimal = Field(ge=0)
    max_price: Decimal = Field(ge=0)
    modal_price: Decimal = Field(ge=0)
    unit: str = Field(default="QUINTAL", max_length=16)
    source: str = Field(default="AGMARKNET", max_length=64)


class MarketPriceCreate(MarketPriceBase):
    pass


class MarketPriceOut(MarketPriceBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, mp: object) -> "MarketPriceOut":
        return cls(
            id=str(mp.id),  # type: ignore[attr-defined]
            crop=mp.crop,  # type: ignore[attr-defined]
            region=mp.region,  # type: ignore[attr-defined]
            state=mp.state,  # type: ignore[attr-defined]
            district=mp.district,  # type: ignore[attr-defined]
            market_name=mp.market_name,  # type: ignore[attr-defined]
            grade=mp.grade,  # type: ignore[attr-defined]
            price_date=mp.price_date,  # type: ignore[attr-defined]
            min_price=mp.min_price,  # type: ignore[attr-defined]
            max_price=mp.max_price,  # type: ignore[attr-defined]
            modal_price=mp.modal_price,  # type: ignore[attr-defined]
            unit=mp.unit,  # type: ignore[attr-defined]
            source=mp.source,  # type: ignore[attr-defined]
            created_at=mp.created_at,  # type: ignore[attr-defined]
            updated_at=mp.updated_at,  # type: ignore[attr-defined]
        )


class MarketPriceSummary(BaseModel):
    """Summary response for /api/market-price endpoint."""
    crop: str
    region: str
    state: str
    price_date: date
    min_price: Decimal
    max_price: Decimal
    modal_price: Decimal
    unit: str
    price_30d_avg: Optional[Decimal] = None
    price_30d_min: Optional[Decimal] = None
    price_30d_max: Optional[Decimal] = None


class BuyerBase(BaseModel):
    name: str = Field(min_length=3, max_length=160)
    company_name: Optional[str] = Field(default=None, max_length=160)
    contact_person: Optional[str] = Field(default=None, max_length=120)
    phone: str = Field(pattern=r"^[6-9]\d{9}$")
    email: Optional[str] = Field(default=None, max_length=255)
    address: Optional[str] = Field(default=None, max_length=400)
    state: Optional[str] = Field(default=None, max_length=64)
    district: Optional[str] = Field(default=None, max_length=64)
    gstin: Optional[str] = Field(default=None, max_length=32)
    license_number: Optional[str] = Field(default=None, max_length=64)


class BuyerCreate(BuyerBase):
    password: str = Field(min_length=6, max_length=128)


class BuyerUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=3, max_length=160)
    company_name: Optional[str] = Field(default=None, max_length=160)
    contact_person: Optional[str] = Field(default=None, max_length=120)
    email: Optional[str] = Field(default=None, max_length=255)
    address: Optional[str] = Field(default=None, max_length=400)
    state: Optional[str] = Field(default=None, max_length=64)
    district: Optional[str] = Field(default=None, max_length=64)
    gstin: Optional[str] = Field(default=None, max_length=32)
    license_number: Optional[str] = Field(default=None, max_length=64)
    password: Optional[str] = Field(default=None, min_length=6, max_length=128)


class BuyerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    buyer_code: str
    name: str
    company_name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    gstin: Optional[str] = None
    license_number: Optional[str] = None
    reliability_score: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, buyer: object) -> "BuyerOut":
        return cls(
            id=str(buyer.id),  # type: ignore[attr-defined]
            buyer_code=buyer.buyer_code,  # type: ignore[attr-defined]
            name=buyer.name,  # type: ignore[attr-defined]
            company_name=buyer.company_name,  # type: ignore[attr-defined]
            contact_person=buyer.contact_person,  # type: ignore[attr-defined]
            phone=buyer.phone,  # type: ignore[attr-defined]
            email=buyer.email,  # type: ignore[attr-defined]
            address=buyer.address,  # type: ignore[attr-defined]
            state=buyer.state,  # type: ignore[attr-defined]
            district=buyer.district,  # type: ignore[attr-defined]
            gstin=buyer.gstin,  # type: ignore[attr-defined]
            license_number=buyer.license_number,  # type: ignore[attr-defined]
            reliability_score=buyer.reliability_score,  # type: ignore[attr-defined]
            is_active=buyer.is_active,  # type: ignore[attr-defined]
            created_at=buyer.created_at,  # type: ignore[attr-defined]
            updated_at=buyer.updated_at,  # type: ignore[attr-defined]
        )


class BuyerRequirementBase(BaseModel):
    crop: str = Field(min_length=1, max_length=64)
    variety: Optional[str] = Field(default=None, max_length=64)
    grade: Optional[str] = Field(default=None, max_length=32)
    min_quantity_kg: Decimal = Field(gt=0, le=1_000_000)
    max_quantity_kg: Decimal = Field(gt=0, le=1_000_000)
    offered_price_per_quintal: Decimal = Field(ge=0)
    state: str = Field(min_length=1, max_length=64)
    district: Optional[str] = Field(default=None, max_length=64)
    max_distance_km: Optional[int] = Field(default=None, ge=0, le=1000)
    delivery_deadline: Optional[date] = None
    quality_requirements: Optional[str] = Field(default=None, max_length=500)
    valid_until: Optional[date] = None


class BuyerRequirementCreate(BuyerRequirementBase):
    pass


class BuyerRequirementUpdate(BaseModel):
    variety: Optional[str] = Field(default=None, max_length=64)
    grade: Optional[str] = Field(default=None, max_length=32)
    min_quantity_kg: Optional[Decimal] = Field(default=None, gt=0, le=1_000_000)
    max_quantity_kg: Optional[Decimal] = Field(default=None, gt=0, le=1_000_000)
    offered_price_per_quintal: Optional[Decimal] = Field(default=None, ge=0)
    district: Optional[str] = Field(default=None, max_length=64)
    max_distance_km: Optional[int] = Field(default=None, ge=0, le=1000)
    delivery_deadline: Optional[date] = None
    quality_requirements: Optional[str] = Field(default=None, max_length=500)
    status: Optional[str] = Field(default=None, max_length=16)
    valid_until: Optional[date] = None


class BuyerRequirementOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    buyer_id: str
    crop: str
    variety: Optional[str] = None
    grade: Optional[str] = None
    min_quantity_kg: Decimal
    max_quantity_kg: Decimal
    offered_price_per_quintal: Decimal
    state: str
    district: Optional[str] = None
    max_distance_km: Optional[int] = None
    delivery_deadline: Optional[date] = None
    quality_requirements: Optional[str] = None
    status: str
    valid_until: Optional[date] = None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, req: object) -> "BuyerRequirementOut":
        return cls(
            id=str(req.id),  # type: ignore[attr-defined]
            buyer_id=str(req.buyer_id),  # type: ignore[attr-defined]
            crop=req.crop,  # type: ignore[attr-defined]
            variety=req.variety,  # type: ignore[attr-defined]
            grade=req.grade,  # type: ignore[attr-defined]
            min_quantity_kg=req.min_quantity_kg,  # type: ignore[attr-defined]
            max_quantity_kg=req.max_quantity_kg,  # type: ignore[attr-defined]
            offered_price_per_quintal=req.offered_price_per_quintal,  # type: ignore[attr-defined]
            state=req.state,  # type: ignore[attr-defined]
            district=req.district,  # type: ignore[attr-defined]
            max_distance_km=req.max_distance_km,  # type: ignore[attr-defined]
            delivery_deadline=req.delivery_deadline,  # type: ignore[attr-defined]
            quality_requirements=req.quality_requirements,  # type: ignore[attr-defined]
            status=req.status,  # type: ignore[attr-defined]
            valid_until=req.valid_until,  # type: ignore[attr-defined]
            created_at=req.created_at,  # type: ignore[attr-defined]
            updated_at=req.updated_at,  # type: ignore[attr-defined]
        )


class PooledLotBase(BaseModel):
    crop: str = Field(min_length=1, max_length=64)
    variety: Optional[str] = Field(default=None, max_length=64)
    grade: Optional[str] = Field(default=None, max_length=32)
    state: str = Field(min_length=1, max_length=64)
    district: str = Field(min_length=1, max_length=64)
    target_quantity_kg: Decimal = Field(gt=0, le=1_000_000)
    suggested_price_per_quintal: Optional[Decimal] = Field(default=None, ge=0)
    expires_at: Optional[date] = None


class PooledLotCreate(PooledLotBase):
    pass


class PooledLotOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    lot_code: str
    crop: str
    variety: Optional[str] = None
    grade: Optional[str] = None
    state: str
    district: str
    total_quantity_kg: Decimal
    target_quantity_kg: Decimal
    status: str
    suggested_price_per_quintal: Optional[Decimal] = None
    matched_requirement_id: Optional[str] = None
    expires_at: Optional[date] = None
    created_at: datetime
    updated_at: datetime
    members: list["PooledLotMemberOut"] = Field(default_factory=list)

    @classmethod
    def from_model(cls, lot: object) -> "PooledLotOut":
        return cls(
            id=str(lot.id),  # type: ignore[attr-defined]
            lot_code=lot.lot_code,  # type: ignore[attr-defined]
            crop=lot.crop,  # type: ignore[attr-defined]
            variety=lot.variety,  # type: ignore[attr-defined]
            grade=lot.grade,  # type: ignore[attr-defined]
            state=lot.state,  # type: ignore[attr-defined]
            district=lot.district,  # type: ignore[attr-defined]
            total_quantity_kg=lot.total_quantity_kg,  # type: ignore[attr-defined]
            target_quantity_kg=lot.target_quantity_kg,  # type: ignore[attr-defined]
            status=lot.status,  # type: ignore[attr-defined]
            suggested_price_per_quintal=lot.suggested_price_per_quintal,  # type: ignore[attr-defined]
            matched_requirement_id=(
                str(lot.matched_requirement_id)  # type: ignore[attr-defined]
                if lot.matched_requirement_id  # type: ignore[attr-defined]
                else None
            ),
            expires_at=lot.expires_at,  # type: ignore[attr-defined]
            created_at=lot.created_at,  # type: ignore[attr-defined]
            updated_at=lot.updated_at,  # type: ignore[attr-defined]
            members=[
                PooledLotMemberOut.from_model(member)
                for member in _loaded_relation(lot, "members")
            ],
        )


class PooledLotMemberBase(BaseModel):
    farmer_id: str = Field(min_length=1, max_length=64)
    quantity_kg: Decimal = Field(gt=0, le=1_000_000)
    agreed_price_per_quintal: Optional[Decimal] = Field(default=None, ge=0)


class PooledLotMemberCreate(PooledLotMemberBase):
    pass


class PooledLotMemberOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    pooled_lot_id: str
    farmer_id: str
    quantity_kg: Decimal
    agreed_price_per_quintal: Optional[Decimal] = None
    is_confirmed: bool
    confirmed_at: Optional[date] = None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, member: object) -> "PooledLotMemberOut":
        return cls(
            id=str(member.id),  # type: ignore[attr-defined]
            pooled_lot_id=str(member.pooled_lot_id),  # type: ignore[attr-defined]
            farmer_id=str(member.farmer_id),  # type: ignore[attr-defined]
            quantity_kg=member.quantity_kg,  # type: ignore[attr-defined]
            agreed_price_per_quintal=member.agreed_price_per_quintal,  # type: ignore[attr-defined]
            is_confirmed=member.is_confirmed,  # type: ignore[attr-defined]
            confirmed_at=member.confirmed_at,  # type: ignore[attr-defined]
            created_at=member.created_at,  # type: ignore[attr-defined]
            updated_at=member.updated_at,  # type: ignore[attr-defined]
        )


# PooledLotOut's `members` field forward-references PooledLotMemberOut, which
# is only defined above at this point.
PooledLotOut.model_rebuild()


class OfferBase(BaseModel):
    price_per_quintal: Decimal = Field(ge=0)
    quantity_kg: Decimal = Field(gt=0, le=1_000_000)
    expires_at: Optional[date] = None


class OfferCreate(OfferBase):
    requirement_id: str = Field(min_length=1, max_length=64)
    farmer_id: Optional[str] = Field(default=None, min_length=1, max_length=64)
    pooled_lot_id: Optional[str] = Field(default=None, min_length=1, max_length=64)
    parent_offer_id: Optional[str] = Field(default=None, min_length=1, max_length=64)


class OfferUpdate(BaseModel):
    price_per_quintal: Optional[Decimal] = Field(default=None, ge=0)
    quantity_kg: Optional[Decimal] = Field(default=None, gt=0, le=1_000_000)
    status: Optional[str] = Field(default=None, max_length=16)
    expires_at: Optional[date] = None


class OfferOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    buyer_id: str
    requirement_id: str
    farmer_id: Optional[str] = None
    pooled_lot_id: Optional[str] = None
    price_per_quintal: Decimal
    quantity_kg: Decimal
    status: str
    market_avg_price: Optional[Decimal] = None
    deviation_pct: Optional[float] = None
    is_counter: bool
    parent_offer_id: Optional[str] = None
    expires_at: Optional[date] = None
    responded_at: Optional[date] = None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_model(cls, offer: object) -> "OfferOut":
        return cls(
            id=str(offer.id),  # type: ignore[attr-defined]
            buyer_id=str(offer.buyer_id),  # type: ignore[attr-defined]
            requirement_id=str(offer.requirement_id),  # type: ignore[attr-defined]
            farmer_id=str(offer.farmer_id) if offer.farmer_id else None,  # type: ignore[attr-defined]
            pooled_lot_id=str(offer.pooled_lot_id) if offer.pooled_lot_id else None,  # type: ignore[attr-defined]
            price_per_quintal=offer.price_per_quintal,  # type: ignore[attr-defined]
            quantity_kg=offer.quantity_kg,  # type: ignore[attr-defined]
            status=offer.status,  # type: ignore[attr-defined]
            market_avg_price=offer.market_avg_price,  # type: ignore[attr-defined]
            deviation_pct=offer.deviation_pct,  # type: ignore[attr-defined]
            is_counter=offer.is_counter,  # type: ignore[attr-defined]
            parent_offer_id=(
                str(offer.parent_offer_id)  # type: ignore[attr-defined]
                if offer.parent_offer_id  # type: ignore[attr-defined]
                else None
            ),
            expires_at=offer.expires_at,  # type: ignore[attr-defined]
            responded_at=offer.responded_at,  # type: ignore[attr-defined]
            created_at=offer.created_at,  # type: ignore[attr-defined]
            updated_at=offer.updated_at,  # type: ignore[attr-defined]
        )


class FairPriceIndicator(BaseModel):
    """Fair price indicator for listings/offers."""
    market_avg_price: Decimal
    offer_price: Decimal
    deviation_pct: float
    status: str  # "fair", "below_market", "above_market"
    badge_color: str  # "green", "yellow", "red"
    message: str


class MatchScore(BaseModel):
    """Match score breakdown for smart matching."""
    price_score: float
    distance_score: float
    quantity_score: float
    reliability_score: float
    total_score: float


class MatchedBuyerRequirement(BaseModel):
    """Matched buyer requirement for a farmer's listing."""
    requirement: BuyerRequirementOut
    match_score: MatchScore
    fair_price: FairPriceIndicator


class MatchedFarmerListing(BaseModel):
    """Matched farmer listing for a buyer's requirement."""
    farmer_id: str
    farmer_name: str
    crop: str
    quantity_kg: Decimal
    state: str
    district: str
    price_per_quintal: Optional[Decimal] = None
    match_score: MatchScore
    fair_price: FairPriceIndicator
