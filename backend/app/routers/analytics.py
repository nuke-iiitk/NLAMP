"""Analytics endpoints — read-only aggregate figures for the portal."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_session
from ..models import CentreStatus, ProcurementCentre, QueueEntry, QueueEntryStatus
from ..schemas.common import AnalyticsSummary

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
async def summary(db: AsyncSession = Depends(get_session)) -> AnalyticsSummary:
    """Live portal figures for the homepage status panel.

    All numbers derive from existing tables — no new state is invented:
    - farmers_processed: completed queue entries (all time)
    - capacity_used_percent: today's joined entries vs sum of centre capacity
    - active_centres: centres currently in OPEN status
    """
    day = datetime.now(timezone.utc).date()

    completed = await db.scalar(
        select(func.count()).select_from(QueueEntry).where(
            QueueEntry.status == QueueEntryStatus.COMPLETED
        )
    )

    joined_today = await db.scalar(
        select(func.count()).select_from(QueueEntry).where(
            func.date(QueueEntry.joined_at) == day,
            QueueEntry.status.in_(
                [QueueEntryStatus.WAITING, QueueEntryStatus.CALLED,
                 QueueEntryStatus.IN_PROGRESS, QueueEntryStatus.COMPLETED]
            ),
        )
    )

    capacity = await db.scalar(
        select(func.coalesce(func.sum(ProcurementCentre.capacity_per_day), 0)).where(
            ProcurementCentre.status == CentreStatus.OPEN
        )
    )

    active_centres = await db.scalar(
        select(func.count()).select_from(ProcurementCentre).where(
            ProcurementCentre.status == CentreStatus.OPEN
        )
    )

    capacity_used = 0
    if capacity and int(capacity) > 0:
        capacity_used = min(100, round((int(joined_today or 0) / int(capacity)) * 100))

    return AnalyticsSummary(
        farmers_processed=int(completed or 0),
        capacity_used_percent=capacity_used,
        active_centres=int(active_centres or 0),
        generated_at=datetime.now(timezone.utc),
    )
