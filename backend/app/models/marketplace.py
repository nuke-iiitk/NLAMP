"""New models for Fair Price Discovery & Smart Matching."""

from __future__ import annotations

import uuid
from datetime import date
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    CheckConstraint,
    Date,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base
from .enums import BuyerRequirementStatus, OfferStatus, PooledLotStatus
from .mixins import TimestampMixin


class MarketPrice(Base, TimestampMixin):
    """Daily commodity market price from government sources (e.g., Agmarknet)."""

    __tablename__ = "market_prices"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4
    )
    crop: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    region: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    state: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    district: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    market_name: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    grade: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    price_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    min_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    max_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    modal_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    unit: Mapped[str] = mapped_column(String(16), default="QUINTAL", nullable=False)
    source: Mapped[str] = mapped_column(String(64), default="AGMARKNET", nullable=False)

    __table_args__ = (
        UniqueConstraint(
            "crop", "region", "grade", "price_date", name="uq_market_price_daily"
        ),
        Index("ix_market_prices_crop_region_date", "crop", "region", "price_date"),
        Index("ix_market_prices_state_district", "state", "district"),
    )

    def __repr__(self) -> str:
        return f"<MarketPrice {self.crop} {self.region} {self.price_date} modal={self.modal_price}>"
class Buyer(Base, TimestampMixin):
    """Buyer entity - can be a trader, processor, exporter, etc."""

    __tablename__ = "buyers"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4
    )
    buyer_code: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    company_name: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
    contact_person: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    phone: Mapped[str] = mapped_column(String(15), unique=True, index=True, nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    state: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    district: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    gstin: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    license_number: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    reliability_score: Mapped[int] = mapped_column(Integer, default=50, nullable=False)  # 0-100
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)
    password_hash: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)

    requirements = relationship(
        "BuyerRequirement", back_populates="buyer", cascade="all, delete-orphan"
    )
    offers = relationship("Offer", back_populates="buyer")

    __table_args__ = (
        Index("ix_buyers_state_district", "state", "district"),
        CheckConstraint("reliability_score >= 0 AND reliability_score <= 100", name="ck_buyer_reliability"),
    )

    def __repr__(self) -> str:
        return f"<Buyer {self.buyer_code} {self.name}>"


class BuyerRequirement(Base, TimestampMixin):
    """Buyer's requirement for a specific crop/quantity/quality."""

    __tablename__ = "buyer_requirements"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4
    )
    buyer_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("buyers.id", ondelete="CASCADE"), nullable=False
    )
    crop: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    variety: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    grade: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    min_quantity_kg: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    max_quantity_kg: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    offered_price_per_quintal: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    state: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    district: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    max_distance_km: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    delivery_deadline: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    quality_requirements: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[BuyerRequirementStatus] = mapped_column(
        String(16), default=BuyerRequirementStatus.ACTIVE, nullable=False, index=True
    )
    valid_until: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    buyer = relationship("Buyer", back_populates="requirements")
    offers = relationship("Offer", back_populates="requirement")

    __table_args__ = (
        Index("ix_buyer_req_crop_state", "crop", "state"),
        Index("ix_buyer_req_status_crop", "status", "crop"),
    )

    def __repr__(self) -> str:
        return f"<BuyerRequirement {self.id} {self.crop} {self.min_quantity_kg}-{self.max_quantity_kg}kg>"
class PooledLot(Base, TimestampMixin):
    """Aggregated lot from multiple small farmers for bulk buyers."""

    __tablename__ = "pooled_lots"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4
    )
    lot_code: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    crop: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    variety: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    grade: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    state: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    district: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    total_quantity_kg: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    target_quantity_kg: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[PooledLotStatus] = mapped_column(
        String(16), default=PooledLotStatus.FORMING, nullable=False, index=True
    )
    suggested_price_per_quintal: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    matched_requirement_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("buyer_requirements.id", ondelete="SET NULL"), nullable=True
    )
    expires_at: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    members = relationship(
        "PooledLotMember",
        back_populates="pooled_lot",
        cascade="all, delete-orphan",
        # Eager (async-safe) load: pooled lots are always served together with
        # their members, and an implicit lazy load would raise MissingGreenlet
        # on the async engine.
        lazy="selectin",
    )
    matched_requirement = relationship("BuyerRequirement", foreign_keys=[matched_requirement_id])

    __table_args__ = (
        Index("ix_pooled_lots_crop_state_status", "crop", "state", "status"),
    )

    def __repr__(self) -> str:
        return f"<PooledLot {self.lot_code} {self.crop} {self.total_quantity_kg}kg {self.status}>"


class PooledLotMember(Base, TimestampMixin):
    """Farmer's contribution to a pooled lot."""

    __tablename__ = "pooled_lot_members"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4
    )
    pooled_lot_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("pooled_lots.id", ondelete="CASCADE"), nullable=False
    )
    farmer_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("farmers.id", ondelete="CASCADE"), nullable=False
    )
    quantity_kg: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    agreed_price_per_quintal: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    is_confirmed: Mapped[bool] = mapped_column(default=False, nullable=False)
    confirmed_at: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    pooled_lot = relationship("PooledLot", back_populates="members")
    farmer = relationship("Farmer")

    __table_args__ = (
        UniqueConstraint("pooled_lot_id", "farmer_id", name="uq_pooled_lot_farmer"),
    )

    def __repr__(self) -> str:
        return f"<PooledLotMember lot={self.pooled_lot_id} farmer={self.farmer_id} {self.quantity_kg}kg>"


class Offer(Base, TimestampMixin):
    """Offer/counter-offer between buyer and farmer/pooled lot."""

    __tablename__ = "offers"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, default=uuid.uuid4
    )
    buyer_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("buyers.id", ondelete="CASCADE"), nullable=False
    )
    requirement_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("buyer_requirements.id", ondelete="CASCADE"), nullable=False
    )
    farmer_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("farmers.id", ondelete="SET NULL"), nullable=True
    )
    pooled_lot_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("pooled_lots.id", ondelete="SET NULL"), nullable=True
    )
    price_per_quintal: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    quantity_kg: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[OfferStatus] = mapped_column(
        String(16), default=OfferStatus.PENDING, nullable=False, index=True
    )
    market_avg_price: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    deviation_pct: Mapped[Optional[float]] = mapped_column(Numeric(6, 2), nullable=True)
    is_counter: Mapped[bool] = mapped_column(default=False, nullable=False)
    parent_offer_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("offers.id", ondelete="SET NULL"), nullable=True
    )
    expires_at: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    responded_at: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    buyer = relationship("Buyer", back_populates="offers")
    requirement = relationship("BuyerRequirement", back_populates="offers")
    farmer = relationship("Farmer")
    pooled_lot = relationship("PooledLot")
    parent_offer = relationship("Offer", remote_side=[id], backref="counter_offers")

    __table_args__ = (
        Index("ix_offers_farmer_status", "farmer_id", "status"),
        Index("ix_offers_lot_status", "pooled_lot_id", "status"),
        Index("ix_offers_requirement_status", "requirement_id", "status"),
    )

    def __repr__(self) -> str:
        target = f"farmer={self.farmer_id}" if self.farmer_id else f"lot={self.pooled_lot_id}"
        return f"<Offer {self.id} {target} ₹{self.price_per_quintal}/q {self.status}>"
