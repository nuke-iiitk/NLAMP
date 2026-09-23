"""Shared/common schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class ApiMessage(BaseModel):
    """Simple `{ "message": ... }` response."""

    message: str


class HealthResponse(BaseModel):
    status: str
    database: str
    version: str


class AnalyticsSummary(BaseModel):
    """Aggregate figures for the homepage status panel."""

    farmers_processed: int
    capacity_used_percent: int
    active_centres: int
    generated_at: datetime
