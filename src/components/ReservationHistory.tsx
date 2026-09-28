import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  XCircle,
  Clock3,
  RefreshCw,
  Navigation,
  ExternalLink,
  X,
  Plus,
  Star,
  Check,
  MessageSquare,
  ChevronRight,
  BookmarkCheck,
  ShieldCheck,
  AlertTriangle,
  BedDouble,
} from 'lucide-react';
import { apiClient } from '../api/client';
import { ReservationRecord } from '../types';
import { getStayBookings, StayBooking } from '../api/stayBookings';

interface ReservationHistoryProps {
  onNavigateToBooking?: () => void;
}

const bookingTravelUrl = (service: 'maps' | 'uber' | 'ola' | 'rapido', booking: ReservationRecord, coordinates?: { latitude: number; longitude: number }) => {
  const destination = `${booking.restaurant_name}, ${booking.address || 'Kakinada'}`;
  const encodedDestination = encodeURIComponent(destination);
  if (service === 'maps') {
    const origin = coordinates ? `${coordinates.latitude},${coordinates.longitude}` : 'Current+Location';
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodedDestination}&travelmode=driving`;
  }
  if (service === 'uber') {
    return coordinates
      ? `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${coordinates.latitude}&pickup[longitude]=${coordinates.longitude}&dropoff[nickname]=${encodeURIComponent(booking.restaurant_name)}&dropoff[formatted_address]=${encodedDestination}`
      : `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[nickname]=${encodeURIComponent(booking.restaurant_name)}&dropoff[formatted_address]=${encodedDestination}`;
  }
  if (service === 'rapido') return 'https://www.rapido.bike/';
  return coordinates
    ? `https://book.olacabs.com/?pickup_latitude=${coordinates.latitude}&pickup_longitude=${coordinates.longitude}&drop_name=${encodedDestination}`
    : `https://book.olacabs.com/?pickup_name=Current%20Location&drop_name=${encodedDestination}`;
};

const bookingGoogleReviewsUrl = (booking: ReservationRecord) =>
  `https://www.google.com/search?q=${encodeURIComponent(`${booking.restaurant_name}, ${booking.address || 'Kakinada'}, India reviews`)}`;

export const ReservationHistory: React.FC<ReservationHistoryProps> = ({ onNavigateToBooking }) => {
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [stayBookings, setStayBookings] = useState<StayBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Modals state
  const [viewModalItem, setViewModalItem] = useState<ReservationRecord | null>(null);
  const [cancelModalItem, setCancelModalItem] = useState<ReservationRecord | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [directionsModalItem, setDirectionsModalItem] = useState<ReservationRecord | null>(null);
  const [feedbackModalItem, setFeedbackModalItem] = useState<ReservationRecord | null>(null);

  // Feedback form state
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState<string>('Exceptional food and tranquil acoustic atmosphere.');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  const openBookingTravel = (service: 'maps' | 'uber' | 'ola' | 'rapido', booking: ReservationRecord) => {
    const open = (coordinates?: { latitude: number; longitude: number }) => {
      window.open(bookingTravelUrl(service, booking, coordinates), '_blank', 'noopener,noreferrer');
    };
    if (!navigator.geolocation) {
      open();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => open({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => open(),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 },
    );
  };

  // Fetch reservations from client/backend
  const fetchReservations = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await apiClient.getReservations();
      setReservations(data);
      setStayBookings(getStayBookings());
    } catch (err) {
      console.error('Failed to load reservations:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // Handle Cancellation
  const handleConfirmCancel = async () => {
    if (!cancelModalItem) return;
    setCancellingId(cancelModalItem.id);
    try {
      await apiClient.cancelReservation(cancelModalItem.id);
      setActionSuccessMessage(
        `Reservation ${cancelModalItem.reservation_code} at ${cancelModalItem.restaurant_name} has been cancelled. Table released.`
      );
      setCancelModalItem(null);
      await fetchReservations();
      setTimeout(() => setActionSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Cancellation failed:', err);
    } finally {
      setCancellingId(null);
    }
  };

  // Submit Feedback
  const handleSubmitFeedback = () => {
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackSubmitted(false);
      setFeedbackModalItem(null);
      setActionSuccessMessage('Thank you! Your dining feedback has been recorded.');
      setTimeout(() => setActionSuccessMessage(null), 4000);
    }, 1200);
  };

  // Friendly date & time helpers
  const formatFriendlyTime = (timeStr: string) => {
    try {
      const [h, m] = timeStr.split(':').map(Number);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const formattedHour = h % 12 || 12;
      return `${formattedHour}:${String(m).padStart(2, '0')} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  const formatFriendlyDate = (dateStr: string) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const target = new Date(dateStr);
      target.setHours(0, 0, 0, 0);
      const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Tomorrow';
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
      }).format(new Date(dateStr + 'T12:00:00'));
    } catch {
      return dateStr;
    }
  };

  const isPast = (record: ReservationRecord) => {
    if (record.status === 'completed') return true;
    try {
      const today = new Date().toISOString().split('T')[0];
      return record.reservation_date < today;
    } catch {
      return false;
    }
  };

  // Partition into Upcoming vs Past
  const upcomingReservations = reservations.filter(
    (r) => r.status !== 'cancelled' && !isPast(r)
  );

  const pastReservations = reservations.filter(
    (r) => r.status === 'completed' || isPast(r) || r.status === 'cancelled'
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase text-neutral-400">
            PATRON PORTAL
          </span>
          <h1 className="text-3xl font-serif tracking-tight text-neutral-100">
            MY BOOKINGS
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchReservations}
            disabled={isRefreshing}
            className="p-2 text-neutral-400 hover:text-neutral-200 transition-colors"
            title="Refresh bookings"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          {onNavigateToBooking && (
            <button
              onClick={onNavigateToBooking}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Find a Table</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button
            onClick={() => setActionSuccessMessage(null)}
            className="text-emerald-400 hover:text-emerald-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: UPCOMING                                                       */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="border-b border-neutral-800 pb-2">
          <h2 className="text-lg font-serif tracking-tight text-neutral-100">
            Upcoming
          </h2>
        </div>

        {upcomingReservations.length === 0 ? (
          <div className="p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 text-center space-y-3">
            <p className="text-sm text-neutral-400">You have no upcoming reservations.</p>
            {onNavigateToBooking && (
              <button
                onClick={onNavigateToBooking}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs inline-flex items-center gap-1.5"
              >
                <span>Find a Table</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingReservations.map((booking) => (
              <div
                key={booking.id}
                className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700/80 shadow-xl transition-all space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-serif font-semibold text-neutral-100">
                      {booking.restaurant_name}
                    </h3>
                    <p className="text-sm text-amber-400 font-medium">
                      {formatFriendlyDate(booking.reservation_date)} • {formatFriendlyTime(booking.start_time)}
                    </p>
                    <p className="text-xs text-neutral-400 flex items-center gap-3 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-neutral-500" />
                        <span>{booking.party_size} people</span>
                      </span>
                      <span>·</span>
                      <span className="capitalize">{booking.seating_area} seating</span>
                      <span>·</span>
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Confirmed</span>
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-neutral-950 border border-neutral-800 text-neutral-300">
                      {booking.reservation_code}
                    </span>
                    <span className="text-[11px] font-semibold text-violet-200">
                      Table {booking.table_number || 'Assigned'}
                    </span>
                  </div>
                </div>

                {/* PRD Action Buttons: [View] [Cancel] [Directions] */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-800/80">
                  <button
                    onClick={() => setViewModalItem(booking)}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-colors"
                  >
                    View
                  </button>

                  <button
                    onClick={() => setCancelModalItem(booking)}
                    className="px-4 py-2 rounded-xl bg-neutral-950 hover:bg-red-950/40 text-neutral-400 hover:text-red-300 text-xs font-semibold border border-neutral-800 hover:border-red-900/60 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => setDirectionsModalItem(booking)}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-colors flex items-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5 text-amber-400" />
                    <span>Directions</span>
                  </button>
                  <a
                    href={bookingGoogleReviewsUrl(booking)}
                    target="_blank"
                    rel="noreferrer"
                    className="booking-quick-link booking-review-link"
                  >
                    <Star className="w-3.5 h-3.5" /> Reviews
                  </a>
                  <button className="booking-quick-link" onClick={() => openBookingTravel('uber', booking)}>Uber</button>
                  <button className="booking-quick-link" onClick={() => openBookingTravel('rapido', booking)}>Rapido</button>
                  <button className="booking-quick-link" onClick={() => openBookingTravel('ola', booking)}>Ola</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ROOM STAYS */}
      <div className="space-y-4 pt-2">
        <div className="border-b border-neutral-800 pb-2 flex items-center justify-between">
          <h2 className="text-lg font-serif tracking-tight text-neutral-100">Room stays</h2>
          <span className="text-xs text-neutral-500">{stayBookings.length} booking{stayBookings.length === 1 ? '' : 's'}</span>
        </div>
        {stayBookings.length === 0 ? (
          <p className="text-xs text-neutral-500 italic">No room stays booked yet.</p>
        ) : (
          <div className="space-y-3">
            {stayBookings.map((stay) => (
              <div key={stay.id} className="stay-booking-row">
                <div className="stay-booking-icon"><BedDouble className="w-5 h-5" /></div>
                <div className="flex-1"><h3>{stay.room_name}</h3><p>{stay.hotel_name} · {stay.city}</p><span>{stay.detail} · Breakfast included</span></div>
                <div className="stay-booking-side"><strong>₹{stay.rate.toLocaleString()}</strong><small>per night</small><em><CheckCircle2 className="w-3 h-3" /> Confirmed</em></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: PAST                                                           */}
      {/* ========================================================================= */}
      <div className="space-y-4 pt-6">
        <div className="border-b border-neutral-800 pb-2">
          <h2 className="text-lg font-serif tracking-tight text-neutral-100">
            Past
          </h2>
        </div>

        {pastReservations.length === 0 ? (
          <p className="text-xs text-neutral-500 italic">No past reservations recorded.</p>
        ) : (
          <div className="space-y-4">
            {pastReservations.map((booking) => (
              <div
                key={booking.id}
                className="p-6 rounded-2xl bg-neutral-900/70 border border-neutral-800/80 shadow-md space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-serif font-semibold text-neutral-200">
                      {booking.restaurant_name}
                    </h3>
                    <p className="text-sm text-neutral-400">
                      {new Intl.DateTimeFormat('en-US', {
                        day: 'numeric',
                        month: 'short',
                      }).format(new Date(booking.reservation_date + 'T12:00:00'))}{' '}
                      • {formatFriendlyTime(booking.start_time)}
                    </p>
                    <p className="text-xs text-neutral-500 flex items-center gap-3 pt-0.5">
                      <span>{booking.party_size} people</span>
                      <span>·</span>
                      <span className="capitalize">{booking.seating_area} seating</span>
                      <span>·</span>
                      <span className={booking.status === 'cancelled' ? 'text-red-400' : 'text-neutral-400'}>
                        {booking.status === 'cancelled' ? 'Cancelled' : 'Completed'}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-400">
                      {booking.reservation_code}
                    </span>
                    <span className="text-[11px] font-semibold text-violet-200">
                      Table {booking.table_number || 'Assigned'}
                    </span>
                  </div>
                </div>

                {/* PRD Action Buttons: [View] [Give Feedback] */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-800/80">
                  <button
                    onClick={() => setViewModalItem(booking)}
                    className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-colors"
                  >
                    View
                  </button>

                  {booking.status !== 'cancelled' && (
                    <button
                      onClick={() => setFeedbackModalItem(booking)}
                      className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors flex items-center gap-1.5"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>Give Feedback</span>
                    </button>
                  )}
                  <a
                    href={bookingGoogleReviewsUrl(booking)}
                    target="_blank"
                    rel="noreferrer"
                    className="booking-quick-link booking-review-link"
                  >
                    <Star className="w-3.5 h-3.5" /> Google Reviews
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: VIEW DETAILS                                                     */}
      {/* ========================================================================= */}
      {viewModalItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="epass-ticket w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 space-y-5 animate-fadeIn">
            <div className="epass-header flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-violet-300 font-semibold">
                  Dineora · e-pass
                </span>
                <h3 className="text-lg font-serif text-neutral-100">
                  {viewModalItem.restaurant_name}
                </h3>
              </div>
              <button
                onClick={() => setViewModalItem(null)}
                className="text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="epass-code-row p-4 rounded-xl bg-neutral-950 border border-neutral-800">
              <div className="text-center">
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">Reservation pass</span>
                <span className="text-2xl font-bold font-mono text-violet-300">{viewModalItem.reservation_code}</span>
              </div>
              <img
                className="epass-qr"
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=4&data=${encodeURIComponent(`smart-tablekeeper|${viewModalItem.reservation_code}|${viewModalItem.restaurant_name}|${viewModalItem.reservation_date}|${viewModalItem.start_time}|Table ${viewModalItem.table_number || 'Assigned'}`)}`}
                alt={`QR code for reservation ${viewModalItem.reservation_code}`}
              />
            </div>

            <div className="epass-details space-y-2 text-xs text-neutral-300 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
              <div className="flex justify-between">
                <span className="text-neutral-500">Date</span>
                <span className="font-semibold text-neutral-100">{viewModalItem.reservation_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Time</span>
                <span className="font-semibold text-neutral-100">{formatFriendlyTime(viewModalItem.start_time)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Party Size</span>
                <span className="font-semibold text-neutral-100">{viewModalItem.party_size} guests</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Table & Seating</span>
                <span className="font-semibold text-neutral-100">{viewModalItem.table_number} ({viewModalItem.seating_area})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Address</span>
                <span className="font-semibold text-neutral-100">{viewModalItem.address || 'Kakinada Center'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Estimated Spend</span>
                <span className="font-semibold text-neutral-100">
                  ~{viewModalItem.currency_symbol || '₹'}{viewModalItem.estimated_spend.toLocaleString()}
                </span>
              </div>
              {viewModalItem.special_requests && (
                <div className="pt-2 border-t border-neutral-800">
                  <span className="text-neutral-500 block mb-0.5">Special Requests</span>
                  <span className="text-neutral-200">{viewModalItem.special_requests}</span>
                </div>
              )}
            </div>

            <div className="epass-scan-note">Show this QR code at the host desk to check in</div>

            <div className="flex justify-end">
              <button
                onClick={() => setViewModalItem(null)}
                className="px-5 py-2 rounded-xl bg-neutral-800 text-xs font-semibold text-neutral-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CANCEL RESERVATION                                               */}
      {/* ========================================================================= */}
      {cancelModalItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-semibold text-neutral-100">
                Cancel Reservation?
              </h3>
            </div>

            <p className="text-xs text-neutral-300">
              Are you sure you want to cancel your reservation for <strong>{cancelModalItem.party_size} people</strong> at{' '}
              <strong>{cancelModalItem.restaurant_name}</strong> on {cancelModalItem.reservation_date} at{' '}
              {formatFriendlyTime(cancelModalItem.start_time)}?
            </p>

            <p className="text-[11px] text-neutral-500">
              Your table will be instantly released and made available to patrons on the standby waitlist.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModalItem(null)}
                className="px-4 py-2 text-xs text-neutral-400 hover:text-neutral-200"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancellingId === cancelModalItem.id}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                {cancellingId === cancelModalItem.id ? 'Releasing Table...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DIRECTIONS                                                       */}
      {/* ========================================================================= */}
      {directionsModalItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-semibold text-neutral-100">
                  Getting to {directionsModalItem.restaurant_name}
                </h3>
              </div>
              <button
                onClick={() => setDirectionsModalItem(null)}
                className="text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-300">
              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                <span className="text-neutral-500 text-[10px] uppercase tracking-wider block">Address</span>
                <p className="text-sm font-semibold text-neutral-100">
                  {directionsModalItem.address || '14 Beach Road, Port Promenade, Kakinada'}
                </p>
                <p className="text-xs text-amber-400 font-medium">
                  ~{directionsModalItem.distance_km || 2.4} km from central area
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <span className="text-neutral-500 text-[10px] uppercase tracking-wider block">Arrival Instructions</span>
                <p className="text-neutral-300">
                  Complimentary valet parking available at the main port entrance. Present your booking code{' '}
                  <strong className="text-amber-400 font-mono">{directionsModalItem.reservation_code}</strong> at the host stand.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <div className="booking-travel-links">
                <button onClick={() => openBookingTravel('maps', directionsModalItem)}>Maps</button>
                <button onClick={() => openBookingTravel('uber', directionsModalItem)}>Uber</button>
                <button onClick={() => openBookingTravel('rapido', directionsModalItem)}>Rapido</button>
                <button onClick={() => openBookingTravel('ola', directionsModalItem)}>Ola</button>
              </div>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  directionsModalItem.restaurant_name + ' ' + (directionsModalItem.address || 'Kakinada')
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 inline-flex items-center gap-1.5"
              >
                <span>Open Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setDirectionsModalItem(null)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: GIVE FEEDBACK                                                    */}
      {/* ========================================================================= */}
      {feedbackModalItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold">
                  Diner Review
                </span>
                <h3 className="text-base font-semibold text-neutral-100">
                  {feedbackModalItem.restaurant_name}
                </h3>
              </div>
              <button
                onClick={() => setFeedbackModalItem(null)}
                className="text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {feedbackSubmitted ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="text-sm font-semibold text-neutral-100">Feedback Submitted!</p>
                <p className="text-xs text-neutral-400">
                  Your review helps future patrons find the perfect dining atmosphere.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-neutral-400 block mb-2">Overall Experience</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= feedbackRating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-neutral-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-neutral-300 font-semibold ml-2">
                      {feedbackRating} of 5 Stars
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Dining Notes & Atmosphere</label>
                  <textarea
                    rows={3}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Tell us about the table seating, sound levels, and dining hospitality..."
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-neutral-100 text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setFeedbackModalItem(null)}
                    className="px-4 py-2 text-neutral-400 hover:text-neutral-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitFeedback}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold"
                  >
                    Submit Feedback
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
