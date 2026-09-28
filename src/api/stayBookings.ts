export interface StayBooking {
  id: string;
  hotel_name: string;
  room_name: string;
  city: string;
  detail: string;
  rate: number;
  amenities: string[];
  status: 'confirmed' | 'cancelled';
  booked_at: string;
}

const STORAGE_KEY = 'stk_stay_bookings';

export function getStayBookings(): StayBooking[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as StayBooking[];
  } catch {
    return [];
  }
}

export function saveStayBooking(booking: StayBooking): void {
  const existing = getStayBookings().filter((item) => item.id !== booking.id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([booking, ...existing]));
}
