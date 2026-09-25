"""Fair Price Service - computes fair price indicators."""

from __future__ import annotations

from decimal import Decimal
from typing import Optional

from ...models import MarketPrice
from ...schemas.marketplace import FairPriceIndicator
from .market_price_service import MarketPriceService


class FairPriceService:
    """Service for computing fair price indicators and deviations."""

    # Thresholds for classification
    BELOW_MARKET_THRESHOLD = -10.0  # % below market avg
    ABOVE_MARKET_THRESHOLD = 5.0    # % above market avg

    def __init__(self, db):
        self.market_price_service = MarketPriceService(db)

    def compute_deviation_pct(self, offer_price: Decimal, market_avg: Decimal) -> float:
        """Compute percentage deviation from market average."""
        if market_avg == 0:
            return 0.0
        return float((offer_price - market_avg) / market_avg * 100)

    def classify_price(self, deviation_pct: float) -> tuple[str, str]:
        """Classify price based on deviation.
        Returns (status, badge_color).
        """
        if deviation_pct <= self.BELOW_MARKET_THRESHOLD:
            return ("below_market", "red")
        elif deviation_pct >= self.ABOVE_MARKET_THRESHOLD:
            return ("above_market", "green")
        else:
            return ("near_market", "yellow")

    def generate_message(self, deviation_pct: float, status: str) -> str:
        """Generate human-readable message."""
        abs_dev = abs(deviation_pct)
        if status == "below_market":
            return f"⚠ {abs_dev:.1f}% below market average"
        elif status == "above_market":
            return f"✓ {abs_dev:.1f}% above market average"
        else:
            return f"≈ {abs_dev:.1f}% from market average"

    async def get_fair_price_indicator(
        self,
        offer_price: Decimal,
        crop: str,
        region: str,
        state: str,
        grade: str = "FAQ",
    ) -> Optional[FairPriceIndicator]:
        """Get fair price indicator for an offer."""
        price_summary = await self.market_price_service.get_price_summary(
            crop, region, state, grade
        )
        if not price_summary:
            return None

        market_avg = price_summary.modal_price
        deviation = self.compute_deviation_pct(offer_price, market_avg)
        status, badge_color = self.classify_price(deviation)
        message = self.generate_message(deviation, status)

        return FairPriceIndicator(
            market_avg_price=market_avg,
            offer_price=offer_price,
            deviation_pct=round(deviation, 2),
            status=status,
            badge_color=badge_color,
            message=message,
        )

    async def check_low_offer_alert(
        self,
        offer_price: Decimal,
        crop: str,
        region: str,
        state: str,
        grade: str = "FAQ",
    ) -> Optional[dict]:
        """Check if offer is too low and suggest counter price."""
        indicator = await self.get_fair_price_indicator(
            offer_price, crop, region, state, grade
        )
        if not indicator:
            return None

        if indicator.deviation_pct <= self.BELOW_MARKET_THRESHOLD:
            # Suggest counter at market average
            suggested_price = indicator.market_avg_price
            return {
                "is_low_offer": True,
                "deviation_pct": indicator.deviation_pct,
                "suggested_counter_price": suggested_price,
                "market_avg": indicator.market_avg_price,
                "message": f"Offer is {abs(indicator.deviation_pct):.1f}% below market. Suggested counter: ₹{suggested_price}/quintal",
            }
        return {"is_low_offer": False}
