"""Pydantic v2 request/response schemas (DTOs).

SQLAlchemy models are never returned directly from routes — always through
these schemas so only intended fields are exposed and input is validated.
"""

from .auth import (
    AuthToken,
    FarmerAuthResponse,
    FarmerLoginRequest,
    FarmerRegisterRequest,
    OfficerAuthResponse,
    OfficerLoginRequest,
    OfficerOut,
)
from .centre import CentreOut
from .common import ApiMessage, HealthResponse
from .farmer import FarmerCreate, FarmerOut, FarmerUpdate
from .marketplace import (
    BuyerCreate,
    BuyerOut,
    BuyerRequirementCreate,
    BuyerRequirementOut,
    BuyerUpdate,
    FairPriceIndicator,
    MarketPriceOut,
    MarketPriceSummary,
    MatchedBuyerRequirement,
    MatchedFarmerListing,
    MatchScore,
    OfferCreate,
    OfferOut,
    PooledLotCreate,
    PooledLotMemberCreate,
    PooledLotMemberOut,
    PooledLotOut,
)
from .notification import NotificationCreate, NotificationOut, NotificationReadAllRequest
from .payment import PaymentCreate, PaymentOut
from .procurement import ProcurementCreate, ProcurementOut, ProcurementUpdate
from .queue import (
    AdvanceResponse,
    QueueCentreResponse,
    QueueEntryOut,
    QueueJoinRequest,
    QueueSlotMoveRequest,
    QueueStatusUpdate,
)
from .slot import SlotCreate, SlotOut, SlotUpdate

__all__ = [
    "AdvanceResponse",
    "ApiMessage",
    "AuthToken",
    "BuyerCreate",
    "BuyerOut",
    "BuyerRequirementCreate",
    "BuyerRequirementOut",
    "BuyerUpdate",
    "CentreOut",
    "FairPriceIndicator",
    "FarmerAuthResponse",
    "FarmerCreate",
    "FarmerLoginRequest",
    "FarmerOut",
    "FarmerRegisterRequest",
    "FarmerUpdate",
    "HealthResponse",
    "MarketPriceOut",
    "MarketPriceSummary",
    "MatchedBuyerRequirement",
    "MatchedFarmerListing",
    "MatchScore",
    "NotificationCreate",
    "NotificationOut",
    "NotificationReadAllRequest",
    "OfferCreate",
    "OfferOut",
    "OfficerAuthResponse",
    "OfficerLoginRequest",
    "OfficerOut",
    "PaymentCreate",
    "PaymentOut",
    "PooledLotCreate",
    "PooledLotMemberCreate",
    "PooledLotMemberOut",
    "PooledLotOut",
    "ProcurementCreate",
    "ProcurementOut",
    "ProcurementUpdate",
    "QueueCentreResponse",
    "QueueEntryOut",
    "QueueJoinRequest",
    "QueueSlotMoveRequest",
    "QueueStatusUpdate",
    "SlotCreate",
    "SlotOut",
    "SlotUpdate",
]
