"""add marketplace tables for fair price discovery & smart matching

Revision ID: 0003
Revises: 0002
Create Date: 2026-09-25
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # buyers table
    op.create_table(
        "buyers",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("buyer_code", sa.String(length=32), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("company_name", sa.String(length=160), nullable=True),
        sa.Column("contact_person", sa.String(length=120), nullable=True),
        sa.Column("phone", sa.String(length=15), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("state", sa.String(length=64), nullable=True),
        sa.Column("district", sa.String(length=64), nullable=True),
        sa.Column("gstin", sa.String(length=32), nullable=True),
        sa.Column("license_number", sa.String(length=64), nullable=True),
        sa.Column("reliability_score", sa.Integer(), nullable=False, default=50),
        sa.Column("is_active", sa.Boolean(), nullable=False, default=True),
        sa.Column("password_hash", sa.String(length=256), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("reliability_score >= 0 AND reliability_score <= 100", name="ck_buyer_reliability"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("buyer_code", name="uq_buyer_code"),
        sa.UniqueConstraint("phone", name="uq_buyer_phone"),
    )
    op.create_index("ix_buyers_state_district", "buyers", ["state", "district"])

    # market_prices table
    op.create_table(
        "market_prices",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("crop", sa.String(length=64), nullable=False),
        sa.Column("region", sa.String(length=128), nullable=False),
        sa.Column("state", sa.String(length=64), nullable=False),
        sa.Column("district", sa.String(length=64), nullable=True),
        sa.Column("market_name", sa.String(length=128), nullable=True),
        sa.Column("grade", sa.String(length=32), nullable=True),
        sa.Column("price_date", sa.Date(), nullable=False),
        sa.Column("min_price", sa.Numeric(10, 2), nullable=False),
        sa.Column("max_price", sa.Numeric(10, 2), nullable=False),
        sa.Column("modal_price", sa.Numeric(10, 2), nullable=False),
        sa.Column("unit", sa.String(length=16), nullable=False, default="QUINTAL"),
        sa.Column("source", sa.String(length=64), nullable=False, default="AGMARKNET"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "crop", "region", "grade", "price_date", name="uq_market_price_daily"
        ),
    )
    op.create_index("ix_market_prices_crop", "market_prices", ["crop"])
    op.create_index("ix_market_prices_region", "market_prices", ["region"])
    op.create_index("ix_market_prices_state", "market_prices", ["state"])
    op.create_index("ix_market_prices_price_date", "market_prices", ["price_date"])
    op.create_index("ix_market_prices_crop_region_date", "market_prices", ["crop", "region", "price_date"])
    op.create_index("ix_market_prices_state_district", "market_prices", ["state", "district"])

    # buyer_requirements table
    op.create_table(
        "buyer_requirements",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("buyer_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("crop", sa.String(length=64), nullable=False),
        sa.Column("variety", sa.String(length=64), nullable=True),
        sa.Column("grade", sa.String(length=32), nullable=True),
        sa.Column("min_quantity_kg", sa.Numeric(10, 2), nullable=False),
        sa.Column("max_quantity_kg", sa.Numeric(10, 2), nullable=False),
        sa.Column("offered_price_per_quintal", sa.Numeric(10, 2), nullable=False),
        sa.Column("state", sa.String(length=64), nullable=False),
        sa.Column("district", sa.String(length=64), nullable=True),
        sa.Column("max_distance_km", sa.Integer(), nullable=True),
        sa.Column("delivery_deadline", sa.Date(), nullable=True),
        sa.Column("quality_requirements", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=16), nullable=False, default="ACTIVE"),
        sa.Column("valid_until", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["buyer_id"], ["buyers.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_buyer_req_crop_state", "buyer_requirements", ["crop", "state"])
    op.create_index("ix_buyer_req_status_crop", "buyer_requirements", ["status", "crop"])

    # pooled_lots table
    op.create_table(
        "pooled_lots",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("lot_code", sa.String(length=32), nullable=False),
        sa.Column("crop", sa.String(length=64), nullable=False),
        sa.Column("variety", sa.String(length=64), nullable=True),
        sa.Column("grade", sa.String(length=32), nullable=True),
        sa.Column("state", sa.String(length=64), nullable=False),
        sa.Column("district", sa.String(length=64), nullable=False),
        sa.Column("total_quantity_kg", sa.Numeric(12, 2), nullable=False, default=0),
        sa.Column("target_quantity_kg", sa.Numeric(12, 2), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False, default="FORMING"),
        sa.Column("suggested_price_per_quintal", sa.Numeric(10, 2), nullable=True),
        sa.Column("matched_requirement_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("expires_at", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["matched_requirement_id"], ["buyer_requirements.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("lot_code", name="uq_pooled_lot_code"),
    )
    op.create_index("ix_pooled_lots_crop", "pooled_lots", ["crop"])
    op.create_index("ix_pooled_lots_state", "pooled_lots", ["state"])
    op.create_index("ix_pooled_lots_district", "pooled_lots", ["district"])
    op.create_index("ix_pooled_lots_status", "pooled_lots", ["status"])
    op.create_index("ix_pooled_lots_lot_code", "pooled_lots", ["lot_code"])
    op.create_index("ix_pooled_lots_crop_state_status", "pooled_lots", ["crop", "state", "status"])

    # pooled_lot_members table
    op.create_table(
        "pooled_lot_members",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("pooled_lot_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("farmer_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("quantity_kg", sa.Numeric(10, 2), nullable=False),
        sa.Column("agreed_price_per_quintal", sa.Numeric(10, 2), nullable=True),
        sa.Column("is_confirmed", sa.Boolean(), nullable=False, default=False),
        sa.Column("confirmed_at", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["pooled_lot_id"], ["pooled_lots.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["farmer_id"], ["farmers.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("pooled_lot_id", "farmer_id", name="uq_pooled_lot_farmer"),
    )

    # offers table
    op.create_table(
        "offers",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("buyer_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("requirement_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("farmer_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("pooled_lot_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("price_per_quintal", sa.Numeric(10, 2), nullable=False),
        sa.Column("quantity_kg", sa.Numeric(10, 2), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False, default="PENDING"),
        sa.Column("market_avg_price", sa.Numeric(10, 2), nullable=True),
        sa.Column("deviation_pct", sa.Numeric(6, 2), nullable=True),
        sa.Column("is_counter", sa.Boolean(), nullable=False, default=False),
        sa.Column("parent_offer_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("expires_at", sa.Date(), nullable=True),
        sa.Column("responded_at", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["buyer_id"], ["buyers.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["requirement_id"], ["buyer_requirements.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["farmer_id"], ["farmers.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["pooled_lot_id"], ["pooled_lots.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["parent_offer_id"], ["offers.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_offers_farmer_status", "offers", ["farmer_id", "status"])
    op.create_index("ix_offers_lot_status", "offers", ["pooled_lot_id", "status"])
    op.create_index("ix_offers_requirement_status", "offers", ["requirement_id", "status"])
    op.create_index("ix_offers_status", "offers", ["status"])


def downgrade() -> None:
    op.drop_index("ix_offers_status", table_name="offers")
    op.drop_index("ix_offers_requirement_status", table_name="offers")
    op.drop_index("ix_offers_lot_status", table_name="offers")
    op.drop_index("ix_offers_farmer_status", table_name="offers")
    op.drop_table("offers")

    op.drop_table("pooled_lot_members")

    op.drop_index("ix_pooled_lots_crop_state_status", table_name="pooled_lots")
    op.drop_index("ix_pooled_lots_lot_code", table_name="pooled_lots")
    op.drop_index("ix_pooled_lots_status", table_name="pooled_lots")
    op.drop_index("ix_pooled_lots_district", table_name="pooled_lots")
    op.drop_index("ix_pooled_lots_state", table_name="pooled_lots")
    op.drop_index("ix_pooled_lots_crop", table_name="pooled_lots")
    op.drop_table("pooled_lots")

    op.drop_index("ix_buyer_req_status_crop", table_name="buyer_requirements")
    op.drop_index("ix_buyer_req_crop_state", table_name="buyer_requirements")
    op.drop_table("buyer_requirements")

    op.drop_index("ix_market_prices_state_district", table_name="market_prices")
    op.drop_index("ix_market_prices_crop_region_date", table_name="market_prices")
    op.drop_index("ix_market_prices_price_date", table_name="market_prices")
    op.drop_index("ix_market_prices_state", table_name="market_prices")
    op.drop_index("ix_market_prices_region", table_name="market_prices")
    op.drop_index("ix_market_prices_crop", table_name="market_prices")
    op.drop_table("market_prices")

    op.drop_index("ix_buyers_state_district", table_name="buyers")
    op.drop_table("buyers")
