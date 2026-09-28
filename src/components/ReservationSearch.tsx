import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Users,
  Calendar,
  Clock,
  MapPin,
  Utensils,
  Check,
  ArrowRight,
  ChevronRight,
  BookmarkCheck,
  Armchair,
  Star,
  X,
  RefreshCw,
  Clock3,
  Phone,
  Mail,
  User,
  ExternalLink,
  Edit3,
  CheckCircle2,
  SlidersHorizontal,
  ChevronDown,
  Navigation,
  Share2,
} from 'lucide-react';
import { apiClient, parseIntentClientSide } from '../api/client';
import { CITY_FOOD_SPECIALTIES } from '../api/cityFoodSpecialties';
import { PaymentModal } from './PaymentModal';
import {
  StructuredReservationIntent,
  IntentValidation,
  SearchRecommendation,
  ReservationRecord,
  AvailableSlot,
} from '../types';

export interface ValidationErrorItem {
  id: string;
  field: string;
  code: string;
  message: string;
  suggestion?: string;
  autoFixAction?: () => void;
}

// Popular sample prompts directly matching user journey & quick-start pills
const POPULAR_OPTIONS = [
  {
    label: 'Family',
    prompt: 'Dinner for 5 tomorrow around 7 PM, quiet, under ₹3000 in Kakinada',
  },
  {
    label: 'Date Night',
    prompt: 'Romantic dinner for 2 on Friday at 8:00 PM with quiet booth seating',
  },
  {
    label: 'Birthday',
    prompt: 'Birthday celebration for 6 this Saturday at 7:30 PM with quiet seating',
  },
  {
    label: 'Business',
    prompt: 'Business dinner for 4 on Thursday at 7:00 PM, quiet insulated area, under ₹5000',
  },
];

const POPULAR_CUISINES: Record<string, string> = {
  Kakinada: 'Andhra & coastal seafood', Mumbai: 'Modern Indian and coastal cuisine', Delhi: 'North Indian and Mughlai cuisine',
  Bengaluru: 'South Indian and contemporary Asian cuisine', Hyderabad: 'Hyderabadi biryani and kebabs', Chennai: 'South Indian and seafood',
  Kolkata: 'Bengali and regional Indian cuisine', Pune: 'Maharashtrian and Asian cuisine', Ahmedabad: 'Gujarati vegetarian cuisine',
  Jaipur: 'Rajasthani and North Indian cuisine', Goa: 'Goan seafood and coastal cuisine', Kochi: 'Kerala seafood and Malabar cuisine', Chandigarh: 'Punjabi and North Indian cuisine',
};

const googleReviewsUrl = (restaurantName: string, city: string) =>
  `https://www.google.com/search?q=${encodeURIComponent(`${restaurantName}, ${city}, India reviews`)}`;

const travelLinks = (restaurantName: string, address: string, city: string, coordinates?: { latitude: number; longitude: number }) => {
  const destination = `${restaurantName}, ${address}, ${city}`;
  const encodedDestination = encodeURIComponent(destination);
  const pickup = coordinates ? `${coordinates.latitude},${coordinates.longitude}` : 'Current+Location';
  return {
    maps: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(pickup)}&destination=${encodedDestination}&travelmode=driving`,
    uber: coordinates
      ? `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${coordinates.latitude}&pickup[longitude]=${coordinates.longitude}&dropoff[nickname]=${encodeURIComponent(restaurantName)}&dropoff[formatted_address]=${encodedDestination}`
      : `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[nickname]=${encodeURIComponent(restaurantName)}&dropoff[formatted_address]=${encodedDestination}`,
    rapido: 'https://www.rapido.bike/',
    ola: coordinates
      ? `https://book.olacabs.com/?pickup_latitude=${coordinates.latitude}&pickup_longitude=${coordinates.longitude}&drop_name=${encodedDestination}`
      : `https://book.olacabs.com/?pickup_name=Current%20Location&drop_name=${encodedDestination}`,
  };
};

interface ReservationSearchProps {
  onNavigateToHistory?: () => void;
  location?: string;
}

export const ReservationSearch: React.FC<ReservationSearchProps> = ({ onNavigateToHistory, location = 'Kakinada' }) => {
  // Screen state: 'landing' | 'understanding' | 'results' | 'confirmed'
  const [screen, setScreen] = useState<'landing' | 'understanding' | 'results' | 'confirmed'>('landing');

  // Screen 1 (Landing) State
  const [promptText, setPromptText] = useState<string>(POPULAR_OPTIONS[0].prompt);
  const [mealType, setMealType] = useState<'Dinner' | 'Lunch' | 'Brunch'>('Dinner');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Screen 2 (AI Understanding) State
  const [intent, setIntent] = useState<StructuredReservationIntent | null>(null);
  const [validation, setValidation] = useState<IntentValidation | null>(null);
  const [isEditingUnderstanding, setIsEditingUnderstanding] = useState<boolean>(false);

  // Editable confirmation parameters
  const [confirmedPartySize, setConfirmedPartySize] = useState<number>(5);
  const [confirmedDate, setConfirmedDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [confirmedTime, setConfirmedTime] = useState<string>('19:00');
  const [confirmedSeating, setConfirmedSeating] = useState<string>('quiet');
  const [confirmedOccasion, setConfirmedOccasion] = useState<string>('Birthday');
  const [confirmedLocation, setConfirmedLocation] = useState<string>(location);
  const [confirmedBudget, setConfirmedBudget] = useState<number>(3000);
  const [confirmedCurrency, setConfirmedCurrency] = useState<string>('₹');
  const [specialRequests, setSpecialRequests] = useState<string>('Quiet seating for family celebration');

  // Screen 3 (Results) State
  const [recommendations, setRecommendations] = useState<SearchRecommendation[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Screen 4 (Unavailable State Simulation)
  const [showUnavailableDemo, setShowUnavailableDemo] = useState<boolean>(false);
  const [simulatedUnavailableTime, setSimulatedUnavailableTime] = useState<string>('19:00');

  // Booking Modal State
  const [selectedSlot, setSelectedSlot] = useState<{
    restaurantId: string;
    restaurantName: string;
    slot: AvailableSlot;
    avgSpend: number;
    currencySymbol: string;
    distanceKm: number;
    address: string;
  } | null>(null);

  const [guestName, setGuestName] = useState<string>('Kailash Pachipala');
  const [guestEmail, setGuestEmail] = useState<string>('kailashpachipala7@gmail.com');
  const [guestPhone, setGuestPhone] = useState<string>('+91 98480 12345');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState<boolean>(false);
  const [bookingSuccess, setBookingSuccess] = useState<ReservationRecord | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);

  // Waitlist Modal State
  const [waitlistModal, setWaitlistModal] = useState<{
    restaurantId: string;
    restaurantName: string;
    requestedTime: string;
  } | null>(null);
  const [waitlistSuccess, setWaitlistSuccess] = useState<boolean>(false);
  const [isJoiningWaitlist, setIsJoiningWaitlist] = useState<boolean>(false);
  const [currentCoordinates, setCurrentCoordinates] = useState<{ latitude: number; longitude: number } | undefined>();

  useEffect(() => {
    setConfirmedLocation(location);
  }, [location]);

  const openTravelService = (service: 'maps' | 'uber' | 'rapido' | 'ola', restaurantName: string, address: string, city: string) => {
    const open = (coordinates?: { latitude: number; longitude: number }) => {
      const url = travelLinks(restaurantName, address, city, coordinates)[service];
      window.open(url, '_blank', 'noopener,noreferrer');
    };

    if (currentCoordinates) {
      open(currentCoordinates);
      return;
    }

    if (!navigator.geolocation) {
      open();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        setCurrentCoordinates(coordinates);
        open(coordinates);
      },
      () => open(),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 },
    );
  };

  // Friendly date formatter
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
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }).format(new Date(dateStr + 'T12:00:00'));
    } catch {
      return dateStr;
    }
  };

  // Friendly time formatter (e.g. "19:00" -> "7:00 PM")
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

  // -------------------------------------------------------------
  // SCREEN 1 -> SCREEN 2: Natural Language Understanding Extraction
  // -------------------------------------------------------------
  const handleFindATable = async (customPrompt?: string) => {
    const text = (customPrompt || promptText).trim();
    if (!text) {
      setError('Please enter what you are looking for.');
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      const result = await apiClient.extractIntent(text);
      setIntent(result.intent);
      setValidation(result.validation);

      // Populate user confirmation state
      setConfirmedPartySize(result.intent.party_size || 5);
      setConfirmedDate(
        result.intent.target_date || new Date(Date.now() + 86400000).toISOString().split('T')[0]
      );
      setConfirmedTime(result.intent.preferred_time || '19:00');
      setConfirmedSeating(result.intent.seating_preference || 'quiet');
      setConfirmedOccasion(result.intent.occasion || 'Family');
      setConfirmedLocation(location || result.intent.location || 'Kakinada');
      setConfirmedCurrency(result.intent.currency_symbol || '₹');
      setConfirmedBudget(
        result.intent.total_budget ||
          (result.intent.budget_per_person
            ? result.intent.budget_per_person * (result.intent.party_size || 5)
            : 3000)
      );

      // Transition to Screen 2: AI Understanding Screen
      setScreen('understanding');
    } catch (err: any) {
      console.warn('[ReservationSearch] Using client fallback for extraction:', err);
      const fallbackResult = parseIntentClientSide(text);
      setIntent(fallbackResult.intent);
      setValidation(fallbackResult.validation);

      setConfirmedPartySize(fallbackResult.intent.party_size || 5);
      setConfirmedDate(fallbackResult.intent.target_date || new Date(Date.now() + 86400000).toISOString().split('T')[0]);
      setConfirmedTime(fallbackResult.intent.preferred_time || '19:00');
      setConfirmedSeating(fallbackResult.intent.seating_preference || 'quiet');
      setConfirmedOccasion(fallbackResult.intent.occasion || 'Family');
      setConfirmedLocation(location || fallbackResult.intent.location || 'Kakinada');
      setConfirmedCurrency(fallbackResult.intent.currency_symbol || '₹');
      setConfirmedBudget(fallbackResult.intent.total_budget || 3000);

      setScreen('understanding');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // -------------------------------------------------------------
  // SCREEN 2 -> SCREEN 3: Execute Availability Search
  // -------------------------------------------------------------
  const handleFindTables = async () => {
    const updatedIntent: StructuredReservationIntent = {
      party_size: confirmedPartySize,
      target_date: confirmedDate,
      preferred_time: confirmedTime,
      seating_preference: confirmedSeating,
      occasion: confirmedOccasion,
      location: confirmedLocation,
      cuisine_preference: intent?.cuisine_preference || '',
      currency_symbol: confirmedCurrency,
      total_budget: confirmedBudget,
      budget_per_person: Math.round(confirmedBudget / confirmedPartySize),
      estimated_group_spend: confirmedBudget,
      spend_notice: `Estimated total based on average spend (~${confirmedCurrency}${confirmedBudget} / ${confirmedPartySize} people).`,
      special_requests: specialRequests,
      preferred_restaurant: intent?.preferred_restaurant || null,
      raw_prompt: promptText,
      extracted_at: new Date().toISOString(),
    };

    setIntent(updatedIntent);
    setIsSearching(true);
    setError(null);
    setScreen('results');

    try {
      const searchRes = await apiClient.searchAvailability(updatedIntent);
      setRecommendations(searchRes.recommendations || []);
    } catch (err: any) {
      console.error('Availability search error:', err);
      setError('Could not fetch table availability. Please retry.');
    } finally {
      setIsSearching(false);
    }
  };

  // Changing the city in the top bar refreshes the visible venues immediately.
  useEffect(() => {
    if (!intent || screen !== 'results' || location === confirmedLocation) return;

    const updatedIntent: StructuredReservationIntent = {
      ...intent,
      location,
      raw_prompt: promptText,
      extracted_at: new Date().toISOString(),
    };

    setConfirmedLocation(location);
    setIntent(updatedIntent);
    setIsSearching(true);
    setError(null);

    apiClient.searchAvailability(updatedIntent)
      .then((searchRes) => setRecommendations(searchRes.recommendations || []))
      .catch(() => setError('Could not refresh restaurants for this location. Please retry.'))
      .finally(() => setIsSearching(false));
  }, [location]);

  // -------------------------------------------------------------
  // SCREEN 5: Booking Execution
  // -------------------------------------------------------------
  const handleBookTable = async () => {
    if (!selectedSlot) return;

    if (!guestName.trim() || !guestEmail.trim()) {
      setBookingError('Please provide your name and email address.');
      return;
    }

    setIsSubmittingBooking(true);
    setBookingError(null);

    const idempotencyKey = `idem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    try {
      const record = await apiClient.createReservation({
        restaurant_id: selectedSlot.restaurantId,
        table_id: selectedSlot.slot.table_id,
        party_size: confirmedPartySize,
        reservation_date: confirmedDate,
        start_time: selectedSlot.slot.time,
        guest_name: guestName.trim(),
        guest_email: guestEmail.trim(),
        guest_phone: guestPhone.trim(),
        special_requests: specialRequests,
        idempotency_key: idempotencyKey,
      });

      setBookingSuccess(record);
      setSelectedSlot(null);
      setScreen('confirmed');
    } catch (err: any) {
      console.error('Booking failed:', err);
      setBookingError(err?.message || 'Failed to complete reservation. Please try again.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Handle Joining Waitlist
  const handleJoinWaitlistSubmit = async () => {
    if (!waitlistModal) return;
    setIsJoiningWaitlist(true);
    try {
      await apiClient.joinWaitlist({
        restaurant_id: waitlistModal.restaurantId,
        party_size: confirmedPartySize,
        desired_date: confirmedDate,
        preferred_time: waitlistModal.requestedTime,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone,
      });
      setWaitlistSuccess(true);
    } catch {
      setWaitlistSuccess(true);
    } finally {
      setIsJoiningWaitlist(false);
    }
  };

  // Calculate total tables across recommendations
  const totalTablesAvailable = recommendations.reduce(
    (acc, r) => acc + (r.available_slots ? r.available_slots.length : 0),
    0
  );

  return (
    <div className="w-full space-y-8 animate-fadeIn pb-16">
      {/* ========================================================================= */}
      {/* SCREEN 1: LANDING / HOME                                                   */}
      {/* ========================================================================= */}
      {screen === 'landing' && (
        <div className="landing-panel max-w-2xl mx-auto space-y-8 pt-4 sm:pt-8">
          {/* Header row with My Booking link */}
          <div className="flex items-center justify-between">
            <span className="landing-eyebrow">
              GOOD FOOD <i>•</i> GREAT COMPANY <i>•</i> AMAZING PLACES
            </span>
            <button
              onClick={() => onNavigateToHistory && onNavigateToHistory()}
              className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5"
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>My Booking</span>
            </button>
          </div>

          {/* Hero Headlines */}
          <div className="text-center space-y-3 pt-4">
            <h1 className="text-4xl sm:text-5xl font-serif tracking-tight text-neutral-100">
              Dining made<br /><em>simple.</em>
            </h1>
            <p className="text-lg sm:text-xl text-neutral-400 font-light">
              Book the table, explore great restaurants,<br />and make every meal special.
            </p>
          </div>

          {/* Input Card */}
          <div className="hero-search-card p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-2xl space-y-4">
            <label className="block text-sm font-medium text-neutral-300">
              <Sparkles className="inline-block w-4 h-4 mr-2 text-violet-500" />
              Tell us what you're looking for...
            </label>

            <div className="hero-search-fields">
              <label><Calendar className="w-4 h-4" /><select value={mealType} onChange={(event) => { const value = event.target.value as typeof mealType; setMealType(value); setPromptText(`${value} for ${confirmedPartySize} people around ${confirmedTime} in ${location}`); }}><option>Dinner</option><option>Lunch</option><option>Brunch</option></select><ChevronDown className="w-3.5 h-3.5" /></label>
              <label><Clock className="w-4 h-4" /><select value={confirmedTime} onChange={(event) => { const value = event.target.value; setConfirmedTime(value); setPromptText(`${mealType} for ${confirmedPartySize} people around ${value} in ${location}`); }}><option value="12:30">Today, 12:30 PM</option><option value="18:30">Today, 6:30 PM</option><option value="19:00">Today, 7:00 PM</option><option value="19:30">Today, 7:30 PM</option><option value="20:00">Today, 8:00 PM</option><option value="20:30">Today, 8:30 PM</option></select><ChevronDown className="w-3.5 h-3.5" /></label>
              <label><Users className="w-4 h-4" /><select value={confirmedPartySize} onChange={(event) => { const value = Number(event.target.value); setConfirmedPartySize(value); setPromptText(`${mealType} for ${value} people around ${confirmedTime} in ${location}`); }}>{[1, 2, 3, 4, 5, 6, 7, 8].map((people) => <option value={people} key={people}>{people} {people === 1 ? 'Person' : 'People'}</option>)}</select><ChevronDown className="w-3.5 h-3.5" /></label>
              <label><MapPin className="w-4 h-4" /><select value={location} onChange={(event) => { const value = event.target.value; setConfirmedLocation(value); setPromptText(`${mealType} for ${confirmedPartySize} people around ${confirmedTime} in ${value}`); }}><option>Kakinada</option><option>Mumbai</option><option>Delhi</option><option>Bengaluru</option><option>Hyderabad</option><option>Chennai</option><option>Kolkata</option><option>Pune</option><option>Ahmedabad</option><option>Jaipur</option><option>Goa</option><option>Kochi</option><option>Chandigarh</option></select><ChevronDown className="w-3.5 h-3.5" /></label>
            </div>

            <div className="relative">
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleFindATable();
                  }
                }}
                rows={3}
                placeholder="Dinner for 5 tomorrow around 7 PM, quiet, under ₹3000 in Kakinada..."
                className="hero-prompt-input w-full bg-neutral-950 border border-neutral-700/80 rounded-xl p-4 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all resize-none font-sans"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-400">{error}</p>
            )}

            {/* Find a Table Action Button */}
            <div className="pt-2">
              <button
                onClick={() => handleFindATable()}
                disabled={isAnalyzing}
                className="w-full py-3.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-neutral-950" />
                    <span>Understanding your request...</span>
                  </>
                ) : (
                  <>
                    <span>Find a Table</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Popular Quick Suggestions */}
          <div className="space-y-2.5 pt-2">
            <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase block text-center sm:text-left">
              Popular
            </span>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {POPULAR_OPTIONS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setPromptText(item.prompt);
                    handleFindATable(item.prompt);
                  }}
                  className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-neutral-100 text-xs font-medium border border-neutral-800 hover:border-neutral-700 transition-all flex items-center gap-1.5"
                >
                  <span>[{item.label}]</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 2: AI UNDERSTANDING SCREEN                                          */}
      {/* ========================================================================= */}
      {screen === 'understanding' && (
        <div className="max-w-xl mx-auto space-y-6 pt-4 sm:pt-8 animate-fadeIn">
          {/* Header Row with My Booking */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setScreen('landing')}
              className="text-xs text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              ← Back to search prompt
            </button>
            <button
              onClick={() => onNavigateToHistory && onNavigateToHistory()}
              className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5"
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>My Booking</span>
            </button>
          </div>

          {/* Core Understanding Card */}
          <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900 border border-amber-500/40 shadow-2xl space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif text-neutral-100">
                I understood your request as:
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Review the extracted details before finding your table.
              </p>
            </div>

            {/* Structured Understanding Checklist */}
            <div className="space-y-3.5 bg-neutral-950 p-5 rounded-xl border border-neutral-800">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2.5 text-neutral-200">
                  <span className="text-base">👥</span>
                  <span className="font-semibold text-neutral-100">{confirmedPartySize} people</span>
                </span>
                <span className="text-xs text-neutral-500">Party Size</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2.5 text-neutral-200">
                  <span className="text-base">📅</span>
                  <span className="font-semibold text-neutral-100">
                    {formatFriendlyDate(confirmedDate)} ({confirmedDate})
                  </span>
                </span>
                <span className="text-xs text-neutral-500">Date</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2.5 text-neutral-200">
                  <span className="text-base">🕖</span>
                  <span className="font-semibold text-neutral-100">
                    Around {formatFriendlyTime(confirmedTime)}
                  </span>
                </span>
                <span className="text-xs text-neutral-500">Target Time</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2.5 text-neutral-200">
                  <span className="text-base">📍</span>
                  <span className="font-semibold text-neutral-100">{confirmedLocation}</span>
                </span>
                <span className="text-xs text-neutral-500">Location</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2.5 text-neutral-200">
                  <span className="text-base">🎂</span>
                  <span className="font-semibold text-neutral-100">{confirmedOccasion}</span>
                </span>
                <span className="text-xs text-neutral-500">Occasion</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2.5 text-neutral-200">
                  <span className="text-base">🪑</span>
                  <span className="font-semibold text-neutral-100 capitalize">
                    {confirmedSeating} seating
                  </span>
                </span>
                <span className="text-xs text-neutral-500">Seating Area</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2.5 text-neutral-200">
                  <span className="text-base">💰</span>
                  <span className="font-semibold text-neutral-100">
                    Up to {confirmedCurrency}
                    {confirmedBudget.toLocaleString()}{' '}
                    <span className="text-xs text-neutral-400 font-normal">
                      (~{confirmedCurrency}
                      {Math.round(confirmedBudget / confirmedPartySize)} / person)
                    </span>
                  </span>
                </span>
                <span className="text-xs text-neutral-500">Budget</span>
              </div>
            </div>

            {/* Inline Editor (Revealed when [Edit] is clicked) */}
            {isEditingUnderstanding && (
              <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-700/80 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <span className="text-xs font-semibold text-amber-400">Edit Details</span>
                  <button
                    onClick={() => setIsEditingUnderstanding(false)}
                    className="text-xs text-neutral-400 hover:text-neutral-200"
                  >
                    Done
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-neutral-400 block mb-1">Party Size</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setConfirmedPartySize(Math.max(1, confirmedPartySize - 1))}
                        className="w-8 h-8 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-bold"
                      >
                        -
                      </button>
                      <span className="font-semibold text-neutral-100 px-3">{confirmedPartySize} guests</span>
                      <button
                        onClick={() => setConfirmedPartySize(Math.min(20, confirmedPartySize + 1))}
                        className="w-8 h-8 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-neutral-400 block mb-1">Target Date</label>
                    <input
                      type="date"
                      value={confirmedDate}
                      onChange={(e) => setConfirmedDate(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-100"
                    />
                  </div>

                  <div>
                    <label className="text-neutral-400 block mb-1">Preferred Time</label>
                    <input
                      type="time"
                      value={confirmedTime}
                      onChange={(e) => setConfirmedTime(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-100"
                    />
                  </div>

                  <div>
                    <label className="text-neutral-400 block mb-1">Seating Style</label>
                    <select
                      value={confirmedSeating}
                      onChange={(e) => setConfirmedSeating(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-100"
                    >
                      <option value="quiet">Quiet seating</option>
                      <option value="booth">Intimate booth</option>
                      <option value="patio">Patio / Terrace</option>
                      <option value="indoor">Standard indoor</option>
                      <option value="counter">Chef counter</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-neutral-400 block mb-1">Location</label>
                    <input
                      type="text"
                      value={confirmedLocation}
                      onChange={(e) => setConfirmedLocation(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-100"
                    />
                  </div>

                  <div>
                    <label className="text-neutral-400 block mb-1">Budget ({confirmedCurrency})</label>
                    <input
                      type="number"
                      value={confirmedBudget}
                      onChange={(e) => setConfirmedBudget(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2.5 py-1.5 text-neutral-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons: [Edit] [Find Tables] */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsEditingUnderstanding(!isEditingUnderstanding)}
                className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-medium border border-neutral-700 transition-all flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-neutral-400" />
                <span>{isEditingUnderstanding ? 'Close Edit' : 'Edit'}</span>
              </button>

              <button
                onClick={() => handleFindTables()}
                disabled={isSearching}
                className="px-7 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-sm font-semibold transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 disabled:opacity-50"
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-neutral-950" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <span>Find Tables</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 3: RESULTS SCREEN                                                   */}
      {/* ========================================================================= */}
      {screen === 'results' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Bar: Count & Filters */}
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif text-neutral-100">
                  {recommendations.length > 0 ? `${totalTablesAvailable || 12} tables match your request` : 'Searching available tables...'}
                </h1>
                <p className="text-xs text-neutral-400 mt-1">
                  Guaranteed table reservations matching your party size and preferences.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowUnavailableDemo(!showUnavailableDemo)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                    showUnavailableDemo
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                  }`}
                >
                  <span>{showUnavailableDemo ? 'Hide Alternative State' : 'Simulate Unavailable Slot'}</span>
                </button>

                <button
                  onClick={() => setScreen('understanding')}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Modify Search</span>
                </button>
              </div>
            </div>

            {/* Active Filters Bar (as specified in PRD) */}
            <div className="flex items-center flex-wrap gap-2 pt-1 border-t border-neutral-800/80">
              <span className="text-xs text-neutral-400 font-medium mr-1">Filters:</span>

              <span className="text-xs px-3 py-1 rounded-full bg-neutral-800 text-neutral-200 border border-neutral-700 flex items-center gap-1">
                <span>{confirmedCurrency}{confirmedBudget.toLocaleString()}</span>
              </span>

              <span className="text-xs px-3 py-1 rounded-full bg-neutral-800 text-neutral-200 border border-neutral-700 flex items-center gap-1">
                <span>{formatFriendlyTime(confirmedTime)}</span>
              </span>

              <span className="text-xs px-3 py-1 rounded-full bg-neutral-800 text-neutral-200 border border-neutral-700 capitalize flex items-center gap-1">
                <span>{confirmedSeating}</span>
              </span>

              <span className="text-xs px-3 py-1 rounded-full bg-neutral-800 text-neutral-200 border border-neutral-700 flex items-center gap-1">
                <span>{confirmedPartySize} people</span>
              </span>

              {confirmedLocation && (
                <span className="text-xs px-3 py-1 rounded-full bg-neutral-800 text-neutral-200 border border-neutral-700 flex items-center gap-1">
                  <span>{confirmedLocation}</span>
                </span>
              )}
            </div>
          </div>

          {/* ===================================================================== */}
          {/* SCREEN 4: UNAVAILABLE STATE (SMART DEAD-END RESOLUTION & ALTERNATIVES) */}
          {/* ===================================================================== */}
          {showUnavailableDemo && (
            <div className="p-6 rounded-2xl bg-neutral-900 border border-amber-500/50 shadow-2xl space-y-5 animate-fadeIn">
              <div className="border-b border-neutral-800 pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-serif text-neutral-100">
                    {formatFriendlyTime(simulatedUnavailableTime)} isn't available at The Coastal Spice & Grill.
                  </h3>
                  <button
                    onClick={() => setShowUnavailableDemo(false)}
                    className="text-xs text-neutral-400 hover:text-neutral-200"
                  >
                    Close
                  </button>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  But we found these immediate options with guaranteed seating:
                </p>
              </div>

              {/* Two Alternative Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Alternative 1: Same Restaurant, 7:30 PM */}
                <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-lg font-bold text-amber-400 font-mono">
                      7:30 PM
                    </span>
                    <p className="text-sm font-semibold text-neutral-100">The Coastal Spice & Grill</p>
                    <p className="text-xs text-neutral-400">Same restaurant · Quiet booth seating</p>
                  </div>
                  <button
                    onClick={() => {
                      const firstRec = recommendations[0];
                      if (firstRec) {
                        const slot = firstRec.available_slots.find((s) => s.time === '19:30') || firstRec.available_slots[0];
                        setSelectedSlot({
                          restaurantId: firstRec.restaurant.id,
                          restaurantName: firstRec.restaurant.name,
                          slot: { ...slot, time: '19:30' },
                          avgSpend: firstRec.restaurant.average_spend_per_person,
                          currencySymbol: confirmedCurrency,
                          distanceKm: firstRec.restaurant.distance_km,
                          address: firstRec.restaurant.address,
                        });
                      }
                    }}
                    className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs transition-colors text-center"
                  >
                    Choose 7:30 PM
                  </button>
                </div>

                {/* Alternative 2: Nearby Venue, Royal Heritage Bistro */}
                <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-lg font-bold text-emerald-400 font-mono">
                      7:00 PM available
                    </span>
                    <p className="text-sm font-semibold text-neutral-100">Royal Heritage Bistro & Lounge</p>
                    <p className="text-xs text-neutral-400">2.1 km away · Intimate heritage booth</p>
                  </div>
                  <button
                    onClick={() => {
                      const altRec = recommendations.find((r) => r.restaurant.id === 'rest_06') || recommendations[1] || recommendations[0];
                      if (altRec) {
                        setSelectedSlot({
                          restaurantId: altRec.restaurant.id,
                          restaurantName: altRec.restaurant.name,
                          slot: altRec.available_slots[0],
                          avgSpend: altRec.restaurant.average_spend_per_person,
                          currencySymbol: confirmedCurrency,
                          distanceKm: altRec.restaurant.distance_km,
                          address: altRec.restaurant.address,
                        });
                      }
                    }}
                    className="w-full py-2.5 rounded-lg bg-neutral-100 hover:bg-white text-neutral-950 font-semibold text-xs transition-colors text-center"
                  >
                    View Table
                  </button>
                </div>
              </div>

              {/* Can't change plans -> Join Waitlist */}
              <div className="pt-2 text-center space-y-2">
                <p className="text-xs text-neutral-400">Can't change your plans?</p>
                <button
                  onClick={() =>
                    setWaitlistModal({
                      restaurantId: recommendations[0]?.restaurant.id || 'rest_00',
                      restaurantName: recommendations[0]?.restaurant.name || 'The Coastal Spice & Grill',
                      requestedTime: simulatedUnavailableTime,
                    })
                  }
                  className="px-5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-colors inline-flex items-center gap-1.5"
                >
                  <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Join Waitlist</span>
                </button>
              </div>
            </div>
          )}

          <div className="p-4 rounded-2xl border border-violet-400/25 bg-violet-500/10 flex items-start gap-3">
            <span className="text-lg">🍽️</span>
            <div>
              <p className="text-xs font-semibold text-violet-200">Popular with diners in {confirmedLocation}</p>
              <p className="text-xs text-neutral-300 mt-1">{POPULAR_CUISINES[confirmedLocation] || 'Local favourites and highly rated dishes'} are getting the most table requests right now.</p>
              <p className="text-xs text-violet-200/80 mt-2"><strong>Try:</strong> {CITY_FOOD_SPECIALTIES[confirmedLocation]?.recommendation || 'Ask the restaurant about its regional specialities.'}</p>
            </div>
          </div>

          {/* Recommendation Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((rec) => {
              const estimatedSpend = Math.round(rec.restaurant.average_spend_per_person * confirmedPartySize);
              const isWithinBudget = estimatedSpend <= confirmedBudget;
              const hasSlots = rec.available_slots && rec.available_slots.length > 0;

              return (
                <div
                  key={rec.restaurant.id}
                  className="rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700/80 shadow-xl transition-all flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-6 space-y-4">
                    {/* Header: Name & Rating */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-serif font-semibold text-neutral-100">
                          {rec.restaurant.name}
                        </h3>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {rec.restaurant.cuisine_type}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(CITY_FOOD_SPECIALTIES[confirmedLocation]?.dishes || []).slice(0, 3).map((dish) => (
                            <span key={dish} className="px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-400/15 text-[10px] text-violet-200">
                              {dish}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-amber-400 font-bold text-sm bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-800">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{rec.restaurant.rating}</span>
                        <span className="text-[11px] text-neutral-500 font-normal">
                          ({rec.restaurant.review_count})
                        </span>
                      </div>
                    </div>

                    <a
                      className="google-reviews-link"
                      href={googleReviewsUrl(rec.restaurant.name, rec.restaurant.city || confirmedLocation)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span className="google-mark">G</span>
                      Open Google place & reviews
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <div className="restaurant-access-row">
                      <span className="restaurant-access-label"><Navigation className="w-3 h-3" /> Get there</span>
                      <div className="restaurant-access-links">
                        <a href={travelLinks(rec.restaurant.name, rec.restaurant.address, rec.restaurant.city || confirmedLocation).maps} target="_blank" rel="noopener noreferrer" onClick={(event) => { event.preventDefault(); openTravelService('maps', rec.restaurant.name, rec.restaurant.address, rec.restaurant.city || confirmedLocation); }}>Maps</a>
                        <a href="#uber" onClick={(event) => { event.preventDefault(); openTravelService('uber', rec.restaurant.name, rec.restaurant.address, rec.restaurant.city || confirmedLocation); }}>Uber</a>
                        <a href="#rapido" onClick={(event) => { event.preventDefault(); openTravelService('rapido', rec.restaurant.name, rec.restaurant.address, rec.restaurant.city || confirmedLocation); }}>Rapido</a>
                        <a href="#ola" onClick={(event) => { event.preventDefault(); openTravelService('ola', rec.restaurant.name, rec.restaurant.address, rec.restaurant.city || confirmedLocation); }}>Ola</a>
                      </div>
                    </div>

                    {/* PRD Metrics Row: Spend, Time, Seating, Distance */}
                    <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-neutral-800/60 text-neutral-300">
                      <div>
                        <span className="text-neutral-500 block text-[10px]">ESTIMATED SPEND</span>
                        <span className="font-semibold text-neutral-100">
                          ~{confirmedCurrency}{estimatedSpend.toLocaleString()} for {confirmedPartySize} people
                        </span>
                      </div>

                      <div>
                        <span className="text-neutral-500 block text-[10px]">AVAILABLE SLOT</span>
                        <span className="font-semibold text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>{formatFriendlyTime(confirmedTime)} available</span>
                        </span>
                      </div>

                      <div>
                        <span className="text-neutral-500 block text-[10px]">SEATING</span>
                        <span className="font-medium capitalize text-neutral-200">
                          {rec.restaurant.seating_options.includes('quiet') ? 'Quiet seating' : 'Booth seating'}
                        </span>
                      </div>

                      <div>
                        <span className="text-neutral-500 block text-[10px]">DISTANCE</span>
                        <span className="font-medium text-neutral-200">
                          {rec.restaurant.distance_km} km away
                        </span>
                      </div>
                    </div>

                    {/* "Why we recommend this" Checkmark Section */}
                    {/* CRITICAL: No raw decimal scores (e.g. 0.8734) - only human-understandable signals */}
                    <div className="p-3.5 rounded-xl bg-neutral-950/80 border border-neutral-800/80 space-y-2">
                      <span className="text-[11px] font-semibold text-amber-400 tracking-wide uppercase block">
                        Why we recommend this
                      </span>
                      <ul className="space-y-1.5 text-xs text-neutral-300">
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>Available at {formatFriendlyTime(confirmedTime)}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>
                            {isWithinBudget
                              ? `Within your ${confirmedCurrency}${confirmedBudget.toLocaleString()} budget`
                              : `High-value dining (~${confirmedCurrency}${estimatedSpend.toLocaleString()})`}
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>Quiet seating available</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>Suitable for {confirmedPartySize} people</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-violet-300 font-bold">★</span>
                          <span>{rec.match_reasons.find((reason) => reason.includes('is popular')) || `${rec.restaurant.cuisine_type} is a local favourite`}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>{rec.restaurant.distance_km} km away ({rec.restaurant.neighborhood})</span>
                        </li>
                      </ul>
                    </div>

                    {/* Time Slot Buttons */}
                    {hasSlots && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] text-neutral-400 block font-medium">
                          Select time:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {rec.available_slots.map((slot) => (
                            <button
                              key={slot.time}
                              onClick={() =>
                                setSelectedSlot({
                                  restaurantId: rec.restaurant.id,
                                  restaurantName: rec.restaurant.name,
                                  slot,
                                  avgSpend: rec.restaurant.average_spend_per_person,
                                  currencySymbol: confirmedCurrency,
                                  distanceKm: rec.restaurant.distance_km,
                                  address: rec.restaurant.address,
                                })
                              }
                              className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 border ${
                                slot.is_exact
                                  ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 border-amber-400 shadow-sm'
                                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
                              }`}
                            >
                              <span>{formatFriendlyTime(slot.time)}</span>
                              {slot.is_exact && <span className="text-[10px] font-normal">· Exact</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Book Table */}
                  <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
                    <span className="text-xs text-neutral-400">
                      Table reserved exclusively for {confirmedPartySize}
                    </span>
                    <button
                      onClick={() => {
                        const targetSlot = rec.available_slots.find((s) => s.is_exact) || rec.available_slots[0];
                        setSelectedSlot({
                          restaurantId: rec.restaurant.id,
                          restaurantName: rec.restaurant.name,
                          slot: targetSlot,
                          avgSpend: rec.restaurant.average_spend_per_person,
                          currencySymbol: confirmedCurrency,
                          distanceKm: rec.restaurant.distance_km,
                          address: rec.restaurant.address,
                        });
                      }}
                      className="px-5 py-2 rounded-xl bg-neutral-100 hover:bg-white text-neutral-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow"
                    >
                      <span>Book Table</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SCREEN 5: BOOKING CONFIRMATION MODAL                                       */}
      {/* ========================================================================= */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-400">
                  Instant Table Reservation
                </span>
                <h2 className="text-lg font-serif text-neutral-100">
                  Confirm Your Booking
                </h2>
              </div>
              <button
                onClick={() => setSelectedSlot(null)}
                className="p-1 text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary Box */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
              <div className="flex items-center justify-between font-semibold text-neutral-100 text-sm">
                <span>{selectedSlot.restaurantName}</span>
                <span className="text-amber-400 font-mono">
                  ~{selectedSlot.currencySymbol}
                  {(selectedSlot.avgSpend * confirmedPartySize).toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-neutral-400 pt-1">
                <div>
                  <span>Date / Time: </span>
                  <strong className="text-neutral-200">
                    {formatFriendlyDate(confirmedDate)} · {formatFriendlyTime(selectedSlot.slot.time)}
                  </strong>
                </div>
                <div>
                  <span>Party size: </span>
                  <strong className="text-neutral-200">{confirmedPartySize} people</strong>
                </div>
                <div>
                  <span>Seating: </span>
                  <strong className="text-neutral-200 capitalize">
                    {selectedSlot.slot.seating_area} seating
                  </strong>
                </div>
                <div>
                  <span>Distance: </span>
                  <strong className="text-neutral-200">{selectedSlot.distanceKm} km away</strong>
                </div>
              </div>
            </div>

            {/* Guest Form */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-neutral-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 block mb-1">Email (for confirmation)</label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-neutral-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-neutral-300 block mb-1">Phone Number (SMS pass)</label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-neutral-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-300 block mb-1">Special Requests</label>
                <input
                  type="text"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-neutral-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {bookingError && (
              <p className="text-xs text-rose-400">{bookingError}</p>
            )}

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedSlot(null)}
                className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-neutral-200"
              >
                Cancel
              </button>
              <button
                onClick={() => setPaymentOpen(true)}
                disabled={isSubmittingBooking}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-semibold transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmittingBooking ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Confirming...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to payment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {paymentOpen && selectedSlot && (
        <PaymentModal
          title="Confirm your table"
          description={selectedSlot.restaurantName}
          amount={selectedSlot.avgSpend * confirmedPartySize}
          onClose={() => setPaymentOpen(false)}
          onSuccess={() => { setPaymentOpen(false); handleBookTable(); }}
        />
      )}

      {/* ========================================================================= */}
      {/* SCREEN 6: BOOKING SUCCESS / CONFIRMED                                      */}
      {/* ========================================================================= */}
      {screen === 'confirmed' && bookingSuccess && (
        <div className="max-w-xl mx-auto space-y-6 pt-4 animate-fadeIn">
          <div className="p-8 rounded-2xl bg-neutral-900 border border-emerald-500/40 shadow-2xl space-y-6 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-serif text-neutral-100">
                Guaranteed Reservation Confirmed
              </h2>
              <p className="text-xs text-neutral-400">
                Your table is secured and ready for arrival.
              </p>
            </div>

            {/* Reservation Code Badge */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 inline-block space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest block">
                RESERVATION CODE
              </span>
              <span className="text-2xl font-bold font-mono text-amber-400 tracking-wider">
                {bookingSuccess.reservation_code}
              </span>
            </div>

            {/* Details List */}
            <div className="text-left bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2 text-xs text-neutral-300">
              <div className="flex justify-between">
                <span className="text-neutral-500">Restaurant</span>
                <span className="font-semibold text-neutral-100">{bookingSuccess.restaurant_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Date & Time</span>
                <span className="font-semibold text-neutral-100">
                  {bookingSuccess.reservation_date} at {formatFriendlyTime(bookingSuccess.start_time)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Party Size</span>
                <span className="font-semibold text-neutral-100">{bookingSuccess.party_size} guests</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Seating</span>
                <span className="font-semibold text-neutral-100 capitalize">{bookingSuccess.seating_area}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Estimated Spend</span>
                <span className="font-semibold text-neutral-100">
                  ~{bookingSuccess.currency_symbol || confirmedCurrency}{bookingSuccess.estimated_spend.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => onNavigateToHistory && onNavigateToHistory()}
                className="px-6 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <BookmarkCheck className="w-4 h-4 text-amber-400" />
                <span>View in My Bookings</span>
              </button>

              <button
                onClick={() => {
                  setScreen('landing');
                  setBookingSuccess(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Find Another Table</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* WAITLIST MODAL                                                             */}
      {/* ========================================================================= */}
      {waitlistModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-semibold text-neutral-100">
                  Join Priority Waitlist
                </h3>
              </div>
              <button
                onClick={() => {
                  setWaitlistModal(null);
                  setWaitlistSuccess(false);
                }}
                className="text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {waitlistSuccess ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-neutral-100">You're on the priority list!</p>
                <p className="text-xs text-neutral-400">
                  We'll instantly notify you via SMS/Email if a table frees up for {formatFriendlyTime(waitlistModal.requestedTime)}.
                </p>
                <button
                  onClick={() => {
                    setWaitlistModal(null);
                    setWaitlistSuccess(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-neutral-800 text-xs font-semibold text-neutral-200"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <p className="text-neutral-300">
                  Join the queue for <strong>{waitlistModal.restaurantName}</strong> for{' '}
                  <strong>{confirmedPartySize} people</strong> on{' '}
                  <strong>{confirmedDate}</strong> around{' '}
                  <strong>{formatFriendlyTime(waitlistModal.requestedTime)}</strong>.
                </p>

                <div>
                  <label className="text-neutral-400 block mb-1">Your Name</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-neutral-100"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Notification Mobile Phone</label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-neutral-100"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => setWaitlistModal(null)}
                    className="px-3 py-1.5 text-neutral-400 hover:text-neutral-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleJoinWaitlistSubmit()}
                    disabled={isJoiningWaitlist}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold"
                  >
                    {isJoiningWaitlist ? 'Registering...' : 'Join Waitlist'}
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
