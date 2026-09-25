"""add notices table for portal announcements

Revision ID: 0004
Revises: 0003
Create Date: 2026-09-25

The `Notice` model (app/models/notification.py) backs the /api/notices
endpoints (homepage notice board), but the table was never created by any
migration — 0001 skipped it and later revisions never added it. Both the
development and test databases were therefore missing `notices`, which made
`/api/notices` fail and caused the test-suite TRUNCATE (driven from
Base.metadata) to error out on every test teardown.
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Idempotent: environments where the table was created out-of-band keep it.
    if sa.inspect(op.get_bind()).has_table("notices"):
        return

    op.create_table(
        "notices",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("dept", sa.String(length=120), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("tag", sa.String(length=24), nullable=True),
        sa.Column("is_urgent", sa.Boolean(), nullable=False),
        sa.Column("is_published", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_notices_is_published", "notices", ["is_published"])


def downgrade() -> None:
    op.drop_index("ix_notices_is_published", table_name="notices")
    op.drop_table("notices")
