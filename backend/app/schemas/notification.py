"""Notification and portal-notice schemas."""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from ..models.enums import NotificationType


class NoticeCreate(BaseModel):
    """Officer-facing payload for publishing a portal notice."""

    title: str = Field(min_length=1, max_length=200)
    dept: str = Field(default="Department of Consumer Affairs", max_length=120)
    body: str = Field(default="", max_length=4000)
    tag: Optional[str] = Field(default=None, max_length=24)
    is_urgent: bool = False
    is_published: bool = True


class NoticeOut(BaseModel):
    """Shape mirrors the frontend `PortalNotice` type plus a body."""

    id: str
    title: str
    dept: str
    body: str
    tag: Optional[str] = None
    is_urgent: bool
    date: str  # formatted for direct display, e.g. "29 Aug 2026"
    created_at: datetime


class NotificationCreate(BaseModel):
    farmer_id: Optional[str] = None  # uuid or farmer_code; None = broadcast later
    type: NotificationType = NotificationType.INFO
    title: str = Field(min_length=1, max_length=160)
    message: str = Field(min_length=1, max_length=1000)


class NotificationReadAllRequest(BaseModel):
    farmer_id: str


class NotificationOut(BaseModel):
    """Shape mirrors the frontend `AppNotification` type."""

    id: str
    farmer_id: Optional[str] = None
    type: str  # 'success' | 'info' | 'warning' | 'error'
    title: str
    message: str
    read: bool
    timestamp: int  # epoch milliseconds
    created_at: datetime
