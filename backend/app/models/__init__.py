"""Domain models registry."""
from app.db.base import FirestoreBaseModel
from app.models.user import User
from app.models.restaurant import Restaurant
from app.models.table import Table
from app.models.reservation import Reservation
from app.models.waitlist import WaitlistEntry
from app.models.scheduled_booking import ScheduledBooking
from app.models.feedback import Feedback
from app.models.insight import RestaurantInsight

__all__ = [
    "FirestoreBaseModel",
    "User",
    "Restaurant",
    "Table",
    "Reservation",
    "WaitlistEntry",
    "ScheduledBooking",
    "Feedback",
    "RestaurantInsight",
]
