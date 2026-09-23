"""Notification endpoints + portal notice endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_session
from ..models import Notice, Notification
from ..schemas.notification import (
    NoticeCreate,
    NoticeOut,
    NotificationCreate,
    NotificationOut,
    NotificationReadAllRequest,
)
from ..dependencies import require_officer
from ..services.errors import NotFoundError
from ..services.presenters import notification_out
from ..services.resolvers import resolve_farmer

router = APIRouter(prefix="/notifications", tags=["notifications"])

notices_router = APIRouter(prefix="/notices", tags=["notices"])


def _notice_out(notice: Notice) -> NoticeOut:
    return NoticeOut(
        id=str(notice.id),
        title=notice.title,
        dept=notice.dept,
        body=notice.body,
        tag=notice.tag,
        is_urgent=notice.is_urgent,
        date=notice.created_at.astimezone(timezone.utc).strftime("%d %b %Y").lstrip("0"),
        created_at=notice.created_at,
    )


@notices_router.get("", response_model=list[NoticeOut])
async def list_notices(
    limit: int = Query(default=50, ge=1, le=200),
    db: AsyncSession = Depends(get_session),
) -> list[NoticeOut]:
    """Published notices, newest first (unauthenticated — shown on the homepage)."""
    stmt = (
        select(Notice)
        .where(Notice.is_published.is_(True))
        .order_by(Notice.created_at.desc())
        .limit(limit)
    )
    return [_notice_out(n) for n in (await db.execute(stmt)).scalars().all()]


@notices_router.post("", response_model=NoticeOut, status_code=201)
async def create_notice(
    payload: NoticeCreate,
    _officer: None = Depends(require_officer),
    db: AsyncSession = Depends(get_session),
) -> NoticeOut:
    """Publish a portal notice (officer-only, gated by REQUIRE_OFFICER_AUTH)."""
    notice = Notice(
        title=payload.title,
        dept=payload.dept,
        body=payload.body,
        tag=payload.tag,
        is_urgent=payload.is_urgent,
        is_published=payload.is_published,
    )
    db.add(notice)
    await db.commit()
    await db.refresh(notice)
    return _notice_out(notice)


@notices_router.get("/urgent", response_model=Optional[NoticeOut])
async def latest_urgent_notice(
    db: AsyncSession = Depends(get_session),
) -> Optional[NoticeOut]:
    """Single most recent urgent, published notice — powers the homepage strip."""
    stmt = (
        select(Notice)
        .where(Notice.is_published.is_(True), Notice.is_urgent.is_(True))
        .order_by(Notice.created_at.desc())
        .limit(1)
    )
    notice = (await db.execute(stmt)).scalars().first()
    return _notice_out(notice) if notice else None


@router.get("", response_model=list[NotificationOut])
async def list_notifications(
    farmer_id: Optional[str] = Query(default=None),
    unread_only: bool = Query(default=False),
    limit: int = Query(default=50, ge=1, le=200),
    db: AsyncSession = Depends(get_session),
) -> list[NotificationOut]:
    stmt = select(Notification).order_by(Notification.created_at.desc()).limit(limit)
    farmer_uuid = None
    if farmer_id:
        farmer = await resolve_farmer(db, farmer_id)
        farmer_uuid = farmer.id
        stmt = stmt.where(Notification.farmer_id == farmer_uuid)
    if unread_only:
        stmt = stmt.where(Notification.read.is_(False))
    notes = (await db.execute(stmt)).scalars().all()
    return [
        notification_out(n, farmer_id=str(farmer_uuid) if farmer_uuid else None) for n in notes
    ]


@router.post("", response_model=NotificationOut, status_code=201)
async def create_notification(
    payload: NotificationCreate,
    db: AsyncSession = Depends(get_session),
) -> NotificationOut:
    farmer_uuid = None
    if payload.farmer_id:
        farmer = await resolve_farmer(db, payload.farmer_id)
        farmer_uuid = farmer.id
    note = Notification(
        farmer_id=farmer_uuid,
        type=payload.type,
        title=payload.title,
        message=payload.message,
    )
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return notification_out(note, farmer_id=str(farmer_uuid) if farmer_uuid else None)


@router.patch("/read-all", response_model=dict)
async def read_all(
    payload: NotificationReadAllRequest,
    db: AsyncSession = Depends(get_session),
) -> dict:
    farmer = await resolve_farmer(db, payload.farmer_id)
    result = await db.execute(
        update(Notification)
        .where(Notification.farmer_id == farmer.id, Notification.read.is_(False))
        .values(read=True)
    )
    await db.commit()
    return {"updated": result.rowcount or 0}


@router.patch("/{notification_id}/read", response_model=NotificationOut)
async def read_one(
    notification_id: str,
    db: AsyncSession = Depends(get_session),
) -> NotificationOut:
    try:
        note_uuid = uuid.UUID(notification_id)
    except ValueError as exc:
        raise NotFoundError(
            f"Notification {notification_id!r} not found", code="notification_not_found"
        ) from exc
    note = await db.get(Notification, note_uuid)
    if note is None:
        raise NotFoundError(
            f"Notification {notification_id!r} not found", code="notification_not_found"
        )
    note.read = True
    await db.commit()
    await db.refresh(note)
    return notification_out(note)
