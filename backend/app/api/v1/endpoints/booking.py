"""Practical booking APIs used by the demo and local development environment.

The production adapter can replace the in-memory repository later; the domain rules
live here so the UI never receives a table that is already reserved.
"""
from datetime import date, datetime, time, timedelta
import re
import uuid
from typing import Any, Optional

from fastapi import APIRouter, Header, HTTPException, status
from pydantic import BaseModel, Field

router = APIRouter()

RESTAURANTS = [
    {"id": "rest_01", "name": "The Fisherman's Table", "cuisine_type": "Seafood · Fine Dining", "city": "Kakinada", "neighborhood": "Riverfront", "average_spend_per_person": 520, "rating": 4.6, "review_count": 1200, "distance_km": 2.4, "currency_symbol": "₹", "address": "12 Harbour Road", "seating_options": ["quiet", "booth", "outdoor"], "tables": [{"id": "tbl_01", "table_number": "T1", "min_capacity": 1, "max_capacity": 2, "seating_area": "quiet"}, {"id": "tbl_02", "table_number": "T2", "min_capacity": 2, "max_capacity": 6, "seating_area": "indoor"}]},
    {"id": "rest_02", "name": "Spice Garden", "cuisine_type": "Indian · Family Dining", "city": "Kakinada", "neighborhood": "City Center", "average_spend_per_person": 480, "rating": 4.4, "review_count": 856, "distance_km": 3.1, "currency_symbol": "₹", "address": "88 Market Street", "seating_options": ["family", "quiet", "outdoor"], "tables": [{"id": "tbl_03", "table_number": "T3", "min_capacity": 2, "max_capacity": 6, "seating_area": "indoor"}, {"id": "tbl_04", "table_number": "T4", "min_capacity": 4, "max_capacity": 8, "seating_area": "outdoor"}]},
    {"id": "rest_03", "name": "Urban Bites", "cuisine_type": "Italian · Casual", "city": "Kakinada", "neighborhood": "Uptown", "average_spend_per_person": 560, "rating": 4.2, "review_count": 642, "distance_km": 4.2, "currency_symbol": "₹", "address": "4 Garden Lane", "seating_options": ["outdoor", "indoor"], "tables": [{"id": "tbl_05", "table_number": "T5", "min_capacity": 1, "max_capacity": 4, "seating_area": "indoor"}, {"id": "tbl_06", "table_number": "T6", "min_capacity": 4, "max_capacity": 8, "seating_area": "outdoor"}]},
]
RESERVATIONS: list[dict[str, Any]] = []
WAITLIST: list[dict[str, Any]] = []
CITY_VENUES = {
    "Kakinada": ["Subbayya Gari Hotel", "The Costa Grill", "Grand Kakinada by GRT Hotels", "Garden Cafe", "Royal Park", "Amrutham Family Restaurant"],
    "Mumbai": ["Ekaa", "Jamavar", "The Table"], "Delhi": ["Indian Accent", "Bukhara", "Gulati"],
    "Bengaluru": ["Bengaluru Oota Company", "Farzi Cafe", "Karavalli"], "Hyderabad": ["AnTeRa Kitchen & Bar", "Bawarchi", "Mehfil"],
    "Chennai": ["Avartana", "Dakshin", "The Marina"], "Kolkata": ["6 Ballygunge Place", "Peter Cat", "Kosha"],
    "Pune": ["Malaka Spice", "Shabree", "The Daily All Day"], "Ahmedabad": ["Agashiye", "Vishalla", "Seva Cafe"],
    "Jaipur": ["1135 AD", "Suvarna Mahal", "Lassiwala"], "Goa": ["Gunpowder", "Mum’s Kitchen", "The Fisherman’s Wharf"],
    "Kochi": ["Fort House Restaurant", "Kashi Art Cafe", "Paragon"], "Chandigarh": ["Indian Coffee House", "Nik Baker’s", "Whistling Duck"],
}
POPULAR_CUISINES = {
    "Kakinada": "Andhra and coastal seafood", "Mumbai": "Modern Indian and coastal cuisine", "Delhi": "North Indian and Mughlai cuisine",
    "Bengaluru": "South Indian and contemporary Asian cuisine", "Hyderabad": "Hyderabadi biryani and kebabs", "Chennai": "South Indian and seafood",
    "Kolkata": "Bengali and regional Indian cuisine", "Pune": "Maharashtrian and Asian cuisine", "Ahmedabad": "Gujarati vegetarian cuisine",
    "Jaipur": "Rajasthani and North Indian cuisine", "Goa": "Goan seafood and coastal cuisine", "Kochi": "Kerala seafood and Malabar cuisine", "Chandigarh": "Punjabi and North Indian cuisine",
}


class IntentRequest(BaseModel):
    prompt: str = Field(..., min_length=3, max_length=500)


class SearchRequest(BaseModel):
    intent: dict[str, Any]


class BookingRequest(BaseModel):
    restaurant_id: str
    table_id: str
    party_size: int = Field(..., ge=1, le=20)
    reservation_date: date
    start_time: time
    end_time: Optional[time] = None
    guest_name: str = Field(..., min_length=2, max_length=100)
    guest_email: str = Field(..., min_length=5, max_length=200)
    guest_phone: str = Field("", max_length=30)
    special_requests: Optional[str] = Field(None, max_length=500)
    idempotency_key: str = Field(..., min_length=8, max_length=128)


class WaitlistRequest(BaseModel):
    restaurant_id: str
    party_size: int = Field(..., ge=1, le=20)
    desired_date: date
    preferred_time: time
    guest_name: str = Field(..., min_length=2)
    guest_email: str = Field(..., min_length=5)
    guest_phone: str = ""


def _parse_time(value: str) -> time:
    try:
        return time.fromisoformat(value)
    except ValueError:
        return time(19, 0)


def _plus_minutes(value: time, minutes: int) -> time:
    total = min(23 * 60 + 59, value.hour * 60 + value.minute + minutes)
    return time(total // 60, total % 60)


def _intent(prompt: str) -> dict[str, Any]:
    text = prompt.lower()
    match = re.search(r"(?:for|party of)\s+(\d+)|([0-9]+)\s*(?:people|guests|pax)", text)
    party = max(1, min(20, int(next(g for g in (match.groups() if match else ()) if g)))) if match else 2
    time_match = re.search(r"(\d{1,2})(?::(\d{2}))?\s*(am|pm)", text)
    hour, minute = (19, 0)
    if time_match:
        hour, minute = int(time_match.group(1)), int(time_match.group(2) or 0)
        if time_match.group(3).lower() == "pm" and hour < 12: hour += 12
        if time_match.group(3).lower() == "am" and hour == 12: hour = 0
    target = date.today() + timedelta(days=1)
    if "today" in text or "tonight" in text: target = date.today()
    occasion = "Casual Dining"
    for word, value in (("birthday", "Birthday"), ("anniversary", "Anniversary"), ("business", "Business"), ("romantic", "Date Night")):
        if word in text: occasion = value; break
    seating = "quiet" if "quiet" in text else ("booth" if "booth" in text else "indoor")
    budget_match = re.search(r"(?:under|below|budget)\s*(?:₹|rs\.?|inr)?\s*([0-9]{3,5})", text)
    total = int(budget_match.group(1)) if budget_match else 500 * party
    return {"party_size": party, "target_date": target.isoformat(), "preferred_time": f"{hour:02d}:{minute:02d}", "occasion": occasion, "seating_preference": seating, "location": "Kakinada", "cuisine_preference": "", "currency_symbol": "₹", "budget_per_person": round(total / party), "total_budget": total, "estimated_group_spend": total, "special_requests": prompt, "preferred_restaurant": None, "raw_prompt": prompt, "extracted_at": datetime.utcnow().isoformat()}


def _conflicts(table_id: str, day: date, start: time, end: time) -> bool:
    return any(r["table_id"] == table_id and r["reservation_date"] == day.isoformat() and r["status"] in ("confirmed", "seated") and r["start_time"] < end.isoformat() and start.isoformat() < r["end_time"] for r in RESERVATIONS)


@router.post("/intent/extract")
async def extract_intent(payload: IntentRequest):
    return {"intent": _intent(payload.prompt), "validation": {"is_valid": True, "errors": [], "warnings": [], "passed_invariants": ["Party size is within 1–20 guests.", "Date and time are normalized."]}}


@router.post("/restaurants/search")
async def search_restaurants(payload: SearchRequest):
    intent = payload.intent
    party = int(intent.get("party_size", 2)); requested = _parse_time(intent.get("preferred_time", "19:00")); day = intent.get("target_date", (date.today() + timedelta(days=1)).isoformat())
    selected_city = str(intent.get("location", "Kakinada"))
    restaurants = RESTAURANTS
    if selected_city in CITY_VENUES:
        restaurants = []
        for index, name in enumerate(CITY_VENUES[selected_city]):
            base = RESTAURANTS[index % len(RESTAURANTS)].copy()
            base["id"] = f"{selected_city.lower().replace(' ', '_')}_{index + 1}"
            base["name"] = name
            base["city"] = selected_city
            base["neighborhood"] = ["Central", "Uptown", "Riverside", "Old Town", "Market District", "Riverside East"][index % 6]
            base["address"] = f"{base['neighborhood']}, {selected_city}"
            base["tables"] = [{**table, "id": f"{selected_city.lower().replace(' ', '_')}_table_{index + 1}_{table_index + 1}"} for table_index, table in enumerate(base["tables"])]
            restaurants.append(base)
    results = []
    for restaurant in restaurants:
        slots = []
        for delta in (0, -30, 30, 60):
            mins = requested.hour * 60 + requested.minute + delta
            slot_time = time(mins // 60, mins % 60)
            for table in restaurant["tables"]:
                if table["min_capacity"] <= party <= table["max_capacity"] and not _conflicts(table["id"], date.fromisoformat(day), slot_time, _plus_minutes(slot_time, 120)):
                    slots.append({"time": slot_time.strftime("%H:%M"), "table_id": table["id"], "table_number": table["table_number"], "seating_area": table["seating_area"], "is_exact": delta == 0, "is_available": True, "estimated_spend": restaurant["average_spend_per_person"] * party}); break
        score = min(99, 72 + (15 if intent.get("seating_preference") in restaurant["seating_options"] else 0) + (8 if restaurant["city"].lower() == str(intent.get("location", "")).lower() else 0))
        results.append({"restaurant": restaurant, "match_score": score, "match_reasons": [f"{restaurant['distance_km']} km away", "Matches your party size", f"{len(slots)} available time slots", f"{POPULAR_CUISINES.get(selected_city, restaurant['cuisine_type'])} is popular in {selected_city}"], "available_slots": slots, "waitlist_available": True})
    return {"recommendations": sorted(results, key=lambda x: x["match_score"], reverse=True), "total_candidates": len(results), "search_timestamp": datetime.utcnow().isoformat()}


@router.post("/reservations", status_code=status.HTTP_201_CREATED)
async def create_reservation(payload: BookingRequest, idempotency_key: Optional[str] = Header(None)):
    key = idempotency_key or payload.idempotency_key
    existing = next((r for r in RESERVATIONS if r["idempotency_key"] == key), None)
    if existing: return existing
    restaurant = next((r for r in RESTAURANTS if r["id"] == payload.restaurant_id), None)
    if not restaurant:
        for city, names in CITY_VENUES.items():
            city_key = city.lower().replace(" ", "_")
            if payload.restaurant_id.startswith(f"{city_key}_"):
                index = int(payload.restaurant_id.rsplit("_", 1)[-1]) - 1
                if 0 <= index < len(names):
                    restaurant = RESTAURANTS[index % len(RESTAURANTS)].copy()
                    neighborhood = ["Central", "Uptown", "Riverside", "Old Town", "Market District", "Riverside East"][index % 6]
                    restaurant.update({"id": payload.restaurant_id, "name": names[index], "city": city, "neighborhood": neighborhood, "address": f"{neighborhood}, {city}"})
                    restaurant["tables"] = [{**table, "id": f"{city_key}_table_{index + 1}_{table_index + 1}"} for table_index, table in enumerate(restaurant["tables"])]
                break
    table = next((t for t in (restaurant or {}).get("tables", []) if t["id"] == payload.table_id), None)
    if not restaurant or not table: raise HTTPException(404, "Restaurant or table not found")
    if not table["min_capacity"] <= payload.party_size <= table["max_capacity"]: raise HTTPException(422, "Table capacity does not fit this party")
    end = payload.end_time or _plus_minutes(payload.start_time, 120)
    if _conflicts(payload.table_id, payload.reservation_date, payload.start_time, end): raise HTTPException(409, "That table is no longer available")
    record = {"id": f"res_{uuid.uuid4().hex[:12]}", "reservation_code": f"STK-{datetime.utcnow():%y%m%d}-{uuid.uuid4().hex[:4].upper()}", "restaurant_id": restaurant["id"], "restaurant_name": restaurant["name"], "table_id": table["id"], "table_number": table["table_number"], "seating_area": table["seating_area"], "party_size": payload.party_size, "reservation_date": payload.reservation_date.isoformat(), "start_time": payload.start_time.isoformat(), "end_time": end.isoformat(), "status": "confirmed", "guest_name": payload.guest_name, "guest_email": payload.guest_email, "guest_phone": payload.guest_phone, "special_requests": payload.special_requests, "estimated_spend": restaurant["average_spend_per_person"] * payload.party_size, "currency_symbol": restaurant["currency_symbol"], "address": restaurant["address"], "distance_km": restaurant["distance_km"], "idempotency_key": key, "created_at": datetime.utcnow().isoformat()}
    RESERVATIONS.append(record); return record


@router.get("/reservations")
async def list_reservations(): return RESERVATIONS


@router.post("/reservations/{reservation_id}/cancel")
async def cancel_reservation(reservation_id: str):
    record = next((r for r in RESERVATIONS if r["id"] == reservation_id), None)
    if not record: raise HTTPException(404, "Reservation not found")
    record["status"] = "cancelled"; return {"success": True, "id": reservation_id}


@router.post("/waitlist")
async def join_waitlist(payload: WaitlistRequest):
    restaurant = next((r for r in RESTAURANTS if r["id"] == payload.restaurant_id), None)
    if not restaurant: raise HTTPException(404, "Restaurant not found")
    entry = {"id": f"wait_{uuid.uuid4().hex[:10]}", "restaurant_id": restaurant["id"], "restaurant_name": restaurant["name"], **payload.model_dump(mode="json"), "status": "active", "priority_score": 85, "created_at": datetime.utcnow().isoformat()}
    WAITLIST.append(entry); return entry


@router.get("/restaurant/dashboard")
async def dashboard():
    confirmed = [r for r in RESERVATIONS if r["status"] == "confirmed"]
    return {"metrics": {"today_reservations": len([r for r in confirmed if r["reservation_date"] == date.today().isoformat()]), "booking_requests": len(confirmed), "conversion": "61%", "peak_time": "7–9 PM", "top_preference": "Quiet"}, "demand": [{"hour": h, "bar": "", "count": c, "percentage": p} for h, c, p in (("6 PM", 18, 45), ("7 PM", 32, 80), ("8 PM", 40, 100), ("9 PM", 26, 65))], "insights": ["High weekend dinner demand", "Quiet seating is the most requested preference"], "service_status": {"active_covers": sum(r["party_size"] for r in confirmed), "total_tables": sum(len(r["tables"]) for r in RESTAURANTS), "occupied_tables": len(confirmed), "open_tables": 3}, "last_updated": datetime.utcnow().isoformat()}
