"""Marketplace tests: fair price discovery, smart matching, pooled lots."""

from __future__ import annotations

from decimal import Decimal

from conftest import register_farmer

import app.database as database
from app.services.marketplace import MarketPriceService

PRICE_PARAMS = {"crop": "Paddy", "region": "Kottayam", "state": "Kerala"}


async def seed_prices() -> None:
    """Create the demo 30-day market price history inside the test's DB."""
    async with database.SessionLocal() as db:
        await MarketPriceService(db).get_or_create_demo_prices()


async def create_buyer(client, phone: str = "9876543211"):
    resp = await client.post(
        "/api/marketplace/buyers",
        json={
            "name": "Test Buyer",
            "company_name": "Test Agro Traders",
            "phone": phone,
            "state": "Kerala",
            "district": "Kottayam",
            "password": "buyer1234",
        },
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


async def create_requirement(client, buyer_id: str, **overrides):
    payload = {
        "crop": "Paddy",
        "min_quantity_kg": 100,
        "max_quantity_kg": 10000,
        "offered_price_per_quintal": 1900,
        "state": "Kerala",
        "district": "Kottayam",
        "max_distance_km": 100,
    }
    payload.update(overrides)
    resp = await client.post(
        f"/api/marketplace/buyers/{buyer_id}/requirements", json=payload
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


# ----------------------------------------------------------- market price


async def test_market_price_summary_and_history(client):
    resp = await client.get("/api/marketplace/market-price", params=PRICE_PARAMS)
    assert resp.status_code == 200, resp.text
    summary = resp.json()
    assert summary["crop"] == "Paddy"
    assert summary["unit"] == "QUINTAL"
    assert Decimal(summary["modal_price"]) > 0
    assert Decimal(summary["min_price"]) <= Decimal(summary["modal_price"])
    assert Decimal(summary["modal_price"]) <= Decimal(summary["max_price"])
    assert Decimal(summary["price_30d_avg"]) > 0
    assert Decimal(summary["price_30d_min"]) <= Decimal(summary["price_30d_max"])

    # Unknown crop/region has no data even after the demo bootstrap -> 404
    missing = await client.get(
        "/api/marketplace/market-price",
        params={"crop": "Saffron", "region": "Pampore", "state": "Jammu"},
    )
    assert missing.status_code == 404

    history = await client.get(
        "/api/marketplace/market-price/history", params={**PRICE_PARAMS, "days": 30}
    )
    assert history.status_code == 200
    rows = history.json()
    assert len(rows) >= 1
    assert rows == sorted(rows, key=lambda r: r["price_date"], reverse=True)
    assert all(r["crop"] == "Paddy" and r["region"] == "Kottayam" for r in rows)


# ----------------------------------------------------------- fair price


async def test_fair_price_indicator_classification(client):
    await seed_prices()
    summary = (
        await client.get("/api/marketplace/market-price", params=PRICE_PARAMS)
    ).json()
    avg = Decimal(summary["modal_price"])

    below = (
        await client.get(
            "/api/marketplace/fair-price", params={**PRICE_PARAMS, "offer_price": 1500}
        )
    ).json()
    assert below["status"] == "below_market"
    assert below["badge_color"] == "red"
    assert below["deviation_pct"] <= -10
    assert Decimal(below["market_avg_price"]) == avg
    assert "below market" in below["message"].lower()

    above = (
        await client.get(
            "/api/marketplace/fair-price", params={**PRICE_PARAMS, "offer_price": 2500}
        )
    ).json()
    assert above["status"] == "above_market"
    assert above["badge_color"] == "green"
    assert above["deviation_pct"] >= 5

    # An offer exactly at the market modal price is "near_market"
    at_market = (
        await client.get(
            "/api/marketplace/fair-price",
            params={**PRICE_PARAMS, "offer_price": str(avg)},
        )
    ).json()
    assert at_market["status"] == "near_market"
    assert at_market["badge_color"] == "yellow"
    assert abs(at_market["deviation_pct"]) < 0.01


# ----------------------------------------------------------- low offer alert


async def test_low_offer_alert_and_counter_suggestion(client):
    await seed_prices()
    low = await client.post(
        "/api/marketplace/check-low-offer", params={**PRICE_PARAMS, "offer_price": 1500}
    )
    assert low.status_code == 200, low.text
    alert = low.json()
    assert alert["is_low_offer"] is True
    assert Decimal(str(alert["suggested_counter_price"])) > 1500
    assert "below market" in alert["message"].lower()

    fair = await client.post(
        "/api/marketplace/check-low-offer", params={**PRICE_PARAMS, "offer_price": 1900}
    )
    assert fair.status_code == 200
    assert fair.json()["is_low_offer"] is False


# ----------------------------------------------------------- buyers / requirements


async def test_buyer_crud_and_duplicate_phone(client):
    buyer = await create_buyer(client)
    assert buyer["buyer_code"].startswith("BYR-")
    assert "password" not in buyer and "password_hash" not in buyer

    duplicate = await client.post(
        "/api/marketplace/buyers",
        json={"name": "Copy Buyer", "phone": "9876543211", "password": "buyer1234"},
    )
    assert duplicate.status_code == 409

    fetched = await client.get(f"/api/marketplace/buyers/{buyer['buyer_code']}")
    assert fetched.status_code == 200
    assert fetched.json()["id"] == buyer["id"]

    updated = await client.put(
        f"/api/marketplace/buyers/{buyer['id']}",
        json={"company_name": "Renamed Traders"},
    )
    assert updated.status_code == 200
    assert updated.json()["company_name"] == "Renamed Traders"


async def test_requirement_crud_and_listing(client):
    buyer = await create_buyer(client)
    req = await create_requirement(client, buyer["id"])
    assert req["status"] == "ACTIVE"
    assert Decimal(req["offered_price_per_quintal"]) == Decimal("1900")

    listed = await client.get(
        "/api/marketplace/requirements", params={"crop": "Paddy", "state": "Kerala"}
    )
    assert listed.status_code == 200
    assert any(r["id"] == req["id"] for r in listed.json())

    updated = await client.put(
        f"/api/marketplace/requirements/{req['id']}",
        json={"offered_price_per_quintal": 1950},
    )
    assert updated.status_code == 200
    assert Decimal(updated.json()["offered_price_per_quintal"]) == Decimal("1950")

    single = await client.get(f"/api/marketplace/requirements/{req['id']}")
    assert single.status_code == 200
    assert single.json()["id"] == req["id"]


# ----------------------------------------------------------- smart matching


async def test_match_farmer_to_buyers(client):
    await seed_prices()
    buyer = await create_buyer(client)
    req = await create_requirement(client, buyer["id"])
    farmer = (await register_farmer(client, "9812345678"))["farmer"]

    resp = await client.get(
        f"/api/marketplace/match/farmer/{farmer['farmer_code']}",
        params={
            "crop": "Paddy",
            "quantity_kg": 500,
            "state": "Kerala",
            "district": "Kottayam",
        },
    )
    assert resp.status_code == 200, resp.text
    matches = resp.json()
    assert len(matches) == 1
    match = matches[0]
    assert match["requirement"]["id"] == req["id"]
    score = match["match_score"]
    for key in (
        "price_score",
        "distance_score",
        "quantity_score",
        "reliability_score",
        "total_score",
    ):
        assert 0.0 <= score[key] <= 1.0, key
    assert match["fair_price"]["status"] in (
        "below_market",
        "near_market",
        "above_market",
    )
    # Sorted best-first
    totals = [m["match_score"]["total_score"] for m in matches]
    assert totals == sorted(totals, reverse=True)

    unknown = await client.get(
        "/api/marketplace/match/farmer/does-not-exist",
        params={
            "crop": "Paddy",
            "quantity_kg": 500,
            "state": "Kerala",
            "district": "Kottayam",
        },
    )
    assert unknown.status_code == 404


async def test_match_buyer_to_farmers(client):
    await seed_prices()
    buyer = await create_buyer(client)
    req = await create_requirement(client, buyer["id"])
    farmer = (await register_farmer(client, "9812345678"))["farmer"]

    resp = await client.get(f"/api/marketplace/match/buyer/{req['id']}")
    assert resp.status_code == 200, resp.text
    matches = resp.json()
    assert len(matches) == 1
    listing = matches[0]
    assert listing["farmer_id"] == farmer["id"]
    assert listing["crop"] == "Paddy"
    assert Decimal(listing["quantity_kg"]) == Decimal("500")
    assert 0.0 <= listing["match_score"]["total_score"] <= 1.0
    assert Decimal(listing["fair_price"]["market_avg_price"]) > 0


# ----------------------------------------------------------- offers


async def test_offer_records_fair_price_and_counter(client):
    await seed_prices()
    buyer = await create_buyer(client)
    req = await create_requirement(client, buyer["id"])
    farmer = (await register_farmer(client, "9812345678"))["farmer"]

    resp = await client.post(
        "/api/marketplace/offers",
        json={
            "requirement_id": req["id"],
            "farmer_id": farmer["id"],
            "price_per_quintal": 1500,
            "quantity_kg": 500,
        },
    )
    assert resp.status_code == 201, resp.text
    offer = resp.json()
    assert offer["is_counter"] is False
    assert offer["buyer_id"] == buyer["id"]
    assert Decimal(offer["market_avg_price"]) > 0
    assert offer["deviation_pct"] <= -10  # recorded as a below-market offer

    counter = await client.post(
        "/api/marketplace/offers",
        json={
            "requirement_id": req["id"],
            "farmer_id": farmer["id"],
            "parent_offer_id": offer["id"],
            "price_per_quintal": 1850,
            "quantity_kg": 500,
        },
    )
    assert counter.status_code == 201, counter.text
    assert counter.json()["is_counter"] is True
    assert counter.json()["parent_offer_id"] == offer["id"]

    fetched = await client.get(f"/api/marketplace/offers/{offer['id']}")
    assert fetched.status_code == 200
    assert fetched.json()["id"] == offer["id"]


# ----------------------------------------------------------- pooled lots


async def test_auto_pooling_matching_and_payout(client):
    # 10 small farmers x 500 kg = 5000 kg, the bulk-order threshold
    for i in range(10):
        await register_farmer(client, f"9812345{i:03d}", name=f"Small Farmer {i}")

    lot_resp = await client.post(
        "/api/marketplace/pooled-lots/auto-create",
        params={"crop": "Paddy", "state": "Kerala", "district": "Kottayam"},
    )
    assert lot_resp.status_code == 200, lot_resp.text
    lot = lot_resp.json()
    assert lot["crop"] == "Paddy"
    assert Decimal(lot["total_quantity_kg"]) > 0

    fetched_lot = await client.get(f"/api/marketplace/pooled-lots/{lot['id']}")
    assert fetched_lot.status_code == 200
    assert fetched_lot.json()["id"] == lot["id"]

    # Add + confirm one extra member
    farmer_id = (await register_farmer(client, "9812345999"))["farmer"]["id"]
    added = await client.post(
        f"/api/marketplace/pooled-lots/{lot['id']}/members",
        json={"farmer_id": farmer_id, "quantity_kg": 300},
    )
    assert added.status_code == 200, added.text
    total_after_add = Decimal(added.json()["total_quantity_kg"])
    assert total_after_add >= Decimal(lot["total_quantity_kg"])

    confirmed = await client.post(
        f"/api/marketplace/pooled-lots/{lot['id']}/confirm/{farmer_id}"
    )
    assert confirmed.status_code == 200, confirmed.text
    assert confirmed.json()["success"] is True

    # Manual pooled lot creation still works
    manual = await client.post(
        "/api/marketplace/pooled-lots",
        json={
            "crop": "Coconut",
            "state": "Kerala",
            "district": "Kottayam",
            "target_quantity_kg": 2000,
        },
    )
    assert manual.status_code == 201, manual.text
    assert manual.json()["status"] == "FORMING"


async def test_pooled_lot_matches_requirement_and_splits_payout(client):
    for i in range(10):
        await register_farmer(client, f"9812346{i:03d}", name=f"Pool Farmer {i}")

    lot = (
        await client.post(
            "/api/marketplace/pooled-lots/auto-create",
            params={"crop": "Paddy", "state": "Kerala", "district": "Kottayam"},
        )
    ).json()
    assert Decimal(lot["total_quantity_kg"]) == Decimal("5000")
    assert lot["status"] == "READY"

    buyer = await create_buyer(client)
    req = await create_requirement(
        client, buyer["id"], min_quantity_kg=1000, max_quantity_kg=10000
    )

    match = await client.post(
        f"/api/marketplace/pooled-lots/{lot['id']}/match/{req['id']}"
    )
    assert match.status_code == 200, match.text
    assert match.json()["success"] is True

    after = (await client.get(f"/api/marketplace/pooled-lots/{lot['id']}")).json()
    assert after["status"] == "MATCHED"
    assert after["matched_requirement_id"] == req["id"]
    assert len(after["members"]) == 10

    payout = await client.get(f"/api/marketplace/pooled-lots/{lot['id']}/payout")
    assert payout.status_code == 200, payout.text
    payouts = payout.json()["payouts"]
    assert len(payouts) == 10
    assert abs(sum(p["share_pct"] for p in payouts) - 100.0) < 0.01
    for p in payouts:
        # 500 kg of 5000 kg at Rs 1900/quintal = Rs 9500
        assert Decimal(str(p["amount"])) == Decimal("9500.00")

    # Incompatible requirement (wrong crop) cannot be matched
    other = await create_requirement(client, buyer["id"], crop="Coconut")
    bad = await client.post(
        f"/api/marketplace/pooled-lots/{lot['id']}/match/{other['id']}"
    )
    assert bad.status_code == 400


# ----------------------------------------------------------- listings


async def test_buyer_directory_and_offer_inbox(client):
    """The three browse endpoints that back the buyer console and offer inbox."""
    await seed_prices()

    # Buyer directory starts empty, then lists the registered buyer only.
    assert (await client.get("/api/marketplace/buyers")).json() == []

    buyer = await create_buyer(client, phone="9876500001")
    req = await create_requirement(client, buyer["id"])

    directory = await client.get("/api/marketplace/buyers", params={"crop": "Paddy"})
    assert directory.status_code == 200, directory.text
    assert [b["id"] for b in directory.json()] == [buyer["id"]]
    assert (await client.get("/api/marketplace/buyers", params={"crop": "Coconut"})).json() == []
    assert (await client.get("/api/marketplace/buyers", params={"district": "Kottayam"})).json()

    # Requirements list honours ACTIVE (default) and ALL.
    active = await client.get("/api/marketplace/requirements", params={"status": "ACTIVE"})
    assert req["id"] in [r["id"] for r in active.json()]
    every = await client.get("/api/marketplace/requirements", params={"status": "ALL"})
    assert every.status_code == 200
    assert req["id"] in [r["id"] for r in every.json()]

    # A farmer's inbox is filterable by farmer_code, id and status.
    farmer = (await register_farmer(client, "9876500002", name="Inbox Farmer"))["farmer"]
    offer = (
        await client.post(
            "/api/marketplace/offers",
            json={
                "requirement_id": req["id"],
                "farmer_id": farmer["id"],
                "price_per_quintal": 1500,
                "quantity_kg": 500,
            },
        )
    ).json()
    assert offer["status"] == "PENDING"

    for params in ({"farmer_id": farmer["farmer_code"]}, {"farmer_id": farmer["id"]}):
        inbox = await client.get("/api/marketplace/offers", params=params)
        assert inbox.status_code == 200, inbox.text
        assert [o["id"] for o in inbox.json()] == [offer["id"]]
        assert Decimal(inbox.json()[0]["market_avg_price"]) > 0

    outbox = await client.get("/api/marketplace/offers", params={"buyer_id": buyer["id"]})
    assert outbox.status_code == 200
    assert [o["id"] for o in outbox.json()] == [offer["id"]]

    # Accepting the offer moves it out of the PENDING inbox view.
    pending = {"farmer_id": farmer["id"], "status": "PENDING"}
    assert [o["id"] for o in (await client.get("/api/marketplace/offers", params=pending)).json()] == [
        offer["id"]
    ]
    accepted = await client.put(
        f"/api/marketplace/offers/{offer['id']}", json={"status": "accepted"}
    )
    assert accepted.status_code == 200, accepted.text
    assert accepted.json()["status"] == "ACCEPTED"
    assert (await client.get("/api/marketplace/offers", params=pending)).json() == []

    # An unrelated farmer sees an empty inbox.
    other = (await register_farmer(client, "9876500003", name="Unrelated Farmer"))["farmer"]
    assert (await client.get("/api/marketplace/offers", params={"farmer_id": other["id"]})).json() == []


async def test_pooled_lot_browsing_endpoint(client):
    """Open pools can be browsed, filtered, and are served with their members."""
    for i in range(10):
        await register_farmer(client, f"9876510{i:03d}", name=f"Pool Browser {i}")

    lot = (
        await client.post(
            "/api/marketplace/pooled-lots/auto-create",
            params={"crop": "Paddy", "state": "Kerala", "district": "Kottayam"},
        )
    ).json()
    assert Decimal(lot["total_quantity_kg"]) >= Decimal("5000")

    listed = await client.get(
        "/api/marketplace/pooled-lots",
        params={"crop": "Paddy", "state": "Kerala", "status": lot["status"]},
    )
    assert listed.status_code == 200, listed.text
    ids = [l["id"] for l in listed.json()]
    assert lot["id"] in ids

    # Members arrive with the list (no async lazy-load), so counts agree.
    found = next(l for l in listed.json() if l["id"] == lot["id"])
    assert len(found["members"]) == len(lot["members"]) > 0
    assert {m["farmer_id"] for m in found["members"]} == {
        m["farmer_id"] for m in lot["members"]
    }

    # Filtering by a member farmer returns exactly the pools they belong to.
    member_farmer_id = found["members"][0]["farmer_id"]
    mine = await client.get(
        "/api/marketplace/pooled-lots", params={"farmer_id": member_farmer_id}
    )
    assert mine.status_code == 200
    assert [l["id"] for l in mine.json()] == [lot["id"]]

    # Unmatched filters return an empty list rather than an error.
    assert (await client.get("/api/marketplace/pooled-lots", params={"crop": "Coconut"})).json() == []
    assert (
        await client.get("/api/marketplace/pooled-lots", params={"district": "Idukki"})
    ).json() == []
