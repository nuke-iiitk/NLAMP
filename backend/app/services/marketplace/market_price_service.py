"""Market Price Service - fetches/caches daily commodity prices."""

from __future__ import annotations

import logging
from datetime import date, timedelta
from decimal import Decimal
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ...models import MarketPrice
from ...schemas.marketplace import MarketPriceCreate, MarketPriceSummary

logger = logging.getLogger(__name__)


class MarketPriceService:
    """Service for fetching and managing market price data."""

    # Default price data for demo purposes (simulating Agmarknet data)
    DEFAULT_PRICES = {
        ("Paddy", "Kottayam", "Kerala"): (1800, 1950, 1875),
        ("Coconut", "Kottayam", "Kerala"): (2800, 3200, 3000),
        ("Pepper", "Kottayam", "Kerala"): (45000, 52000, 48500),
        ("Banana", "Kottayam", "Kerala"): (900, 1200, 1050),
        ("Rubber", "Kottayam", "Kerala"): (14000, 16000, 15000),
        ("Maize", "Coimbatore", "Tamil Nadu"): (1600, 1800, 1700),
        ("Wheat", "Mysuru", "Karnataka"): (2100, 2300, 2200),
        ("Paddy", "Mysuru", "Karnataka"): (1750, 1900, 1825),
        ("Coconut", "Coimbatore", "Tamil Nadu"): (2700, 3100, 2900),
        ("Paddy", "Changanassery", "Kerala"): (1820, 1970, 1895),
    }

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create_demo_prices(self) -> list[MarketPrice]:
        """Create demo market prices if none exist."""
        today = date.today()
        created = []

        for (crop, region, state), (min_p, max_p, modal_p) in self.DEFAULT_PRICES.items():
            # Add some variation for the last 30 days
            for days_ago in range(30):
                price_date = today - timedelta(days=days_ago)
                # Add small random variation (±5%)
                import random
                variation = 1 + (random.random() - 0.5) * 0.1
                
                existing = await self.db.execute(
                    select(MarketPrice).where(
                        MarketPrice.crop == crop,
                        MarketPrice.region == region,
                        MarketPrice.state == state,
                        MarketPrice.price_date == price_date,
                    )
                )
                if existing.scalar_one_or_none():
                    continue

                mp = MarketPrice(
                    crop=crop,
                    region=region,
                    state=state,
                    district=region,  # Use region as district for demo
                    market_name=f"{region} Mandi",
                    grade="FAQ",
                    price_date=price_date,
                    min_price=Decimal(str(round(min_p * variation, 2))),
                    max_price=Decimal(str(round(max_p * variation, 2))),
                    modal_price=Decimal(str(round(modal_p * variation, 2))),
                    unit="QUINTAL",
                    source="AGMARKNET",
                )
                self.db.add(mp)
                created.append(mp)

        if created:
            await self.db.commit()
            for mp in created:
                await self.db.refresh(mp)
            logger.info(f"Created {len(created)} demo market price records")

        return created

    async def get_latest_price(
        self, crop: str, region: str, state: str, grade: str = "FAQ"
    ) -> Optional[MarketPrice]:
        """Get the latest market price for a crop/region/grade."""
        stmt = (
            select(MarketPrice)
            .where(
                MarketPrice.crop == crop,
                MarketPrice.region == region,
                MarketPrice.state == state,
                MarketPrice.grade == grade,
            )
            .order_by(MarketPrice.price_date.desc())
            .limit(1)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_price_summary(
        self, crop: str, region: str, state: str, grade: str = "FAQ"
    ) -> Optional[MarketPriceSummary]:
        """Get price summary with 30-day statistics."""
        latest = await self.get_latest_price(crop, region, state, grade)
        if not latest:
            return None

        # Get 30-day statistics
        thirty_days_ago = date.today() - timedelta(days=30)
        stmt = select(
            func.avg(MarketPrice.modal_price),
            func.min(MarketPrice.modal_price),
            func.max(MarketPrice.modal_price),
        ).where(
            MarketPrice.crop == crop,
            MarketPrice.region == region,
            MarketPrice.state == state,
            MarketPrice.grade == grade,
            MarketPrice.price_date >= thirty_days_ago,
        )
        result = await self.db.execute(stmt)
        avg_30d, min_30d, max_30d = result.one()

        return MarketPriceSummary(
            crop=latest.crop,
            region=latest.region,
            state=latest.state,
            price_date=latest.price_date,
            min_price=latest.min_price,
            max_price=latest.max_price,
            modal_price=latest.modal_price,
            unit=latest.unit,
            price_30d_avg=Decimal(str(round(float(avg_30d), 2))) if avg_30d else None,
            price_30d_min=min_30d,
            price_30d_max=max_30d,
        )

    async def create_price(self, data: MarketPriceCreate) -> MarketPrice:
        """Create a new market price record."""
        mp = MarketPrice(**data.model_dump())
        self.db.add(mp)
        await self.db.commit()
        await self.db.refresh(mp)
        return mp

    async def get_prices_for_crop_region(
        self, crop: str, region: str, state: str, days: int = 30
    ) -> list[MarketPrice]:
        """Get price history for a crop/region."""
        since = date.today() - timedelta(days=days)
        stmt = (
            select(MarketPrice)
            .where(
                MarketPrice.crop == crop,
                MarketPrice.region == region,
                MarketPrice.state == state,
                MarketPrice.price_date >= since,
            )
            .order_by(MarketPrice.price_date.desc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
