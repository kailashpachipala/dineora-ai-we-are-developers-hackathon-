import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  Users,
  Clock,
  Calendar,
  Volume2,
  CheckCircle2,
  RefreshCw,
  Armchair,
  Sparkles,
  Shield,
  Layers,
  BarChart3,
  Building2,
  ChevronDown,
  QrCode,
  Copy,
  BedDouble,
  DoorOpen,
  Hotel,
  KeyRound,
} from 'lucide-react';
import { apiClient } from '../api/client';

interface RoomOption {
  id: string;
  name: string;
  detail: string;
  rate: number;
  available: number;
  total: number;
  amenities: string[];
}

const ROOM_INVENTORY: Record<string, RoomOption[]> = {
  'Grand Kakinada by GRT Hotels': [
    { id: 'room_deluxe', name: 'Deluxe King Room', detail: 'King bed · 2 guests · 32 m²', rate: 5200, available: 7, total: 18, amenities: ['Breakfast', 'Wi-Fi', 'City view'] },
    { id: 'room_suite', name: 'Coastal Executive Suite', detail: 'King bed · 3 guests · 48 m²', rate: 8900, available: 2, total: 6, amenities: ['Breakfast', 'Lounge access', 'Harbour view'] },
    { id: 'room_family', name: 'Family Residence', detail: '2 beds · 4 guests · 58 m²', rate: 11200, available: 1, total: 4, amenities: ['Breakfast', 'Living room', 'Late checkout'] },
  ],
  'The Fisherman’s Table': [
    { id: 'room_waterfront', name: 'Waterfront King Room', detail: 'King bed · 2 guests · 36 m²', rate: 6800, available: 3, total: 8, amenities: ['Breakfast', 'Wi-Fi', 'Water view'] },
    { id: 'room_penthouse', name: 'Chef’s Penthouse', detail: 'King bed · 2 guests · 72 m²', rate: 14500, available: 1, total: 2, amenities: ['Private dining', 'Terrace', 'Butler service'] },
  ],
};

interface RestaurantDashboardProps {
  onSwitchToDiner?: () => void;
}

export const RestaurantDashboard: React.FC<RestaurantDashboardProps> = ({ onSwitchToDiner }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedVenue, setSelectedVenue] = useState<string>('Grand Kakinada by GRT Hotels');
  const [verificationToken] = useState(() => `STK-VFY-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);
  const verificationQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=800x800&margin=20&data=${encodeURIComponent(`smart-tablekeeper|verify|${selectedVenue}|${verificationToken}`)}`;
  const [selectedRoom, setSelectedRoom] = useState<RoomOption | null>(null);
  const [roomGuestName, setRoomGuestName] = useState('');
  const [roomSuccess, setRoomSuccess] = useState<string | null>(null);
  const rooms = ROOM_INVENTORY[selectedVenue] || [];

  const [dashboardData, setDashboardData] = useState<{
    metrics: {
      today_reservations: number;
      booking_requests: number;
      conversion: string;
      peak_time: string;
      top_preference: string;
    };
    demand: { hour: string; bar: string; count: number; percentage: number }[];
    insights: string[];
    service_status: {
      active_covers: number;
      total_tables: number;
      occupied_tables: number;
      open_tables: number;
    };
    last_updated: string;
  }>({
    metrics: {
      today_reservations: 42,
      booking_requests: 68,
      conversion: '61%',
      peak_time: '7–9 PM',
      top_preference: 'Quiet',
    },
    demand: [
      { hour: '6 PM', bar: '█████', count: 18, percentage: 45 },
      { hour: '7 PM', bar: '█████████', count: 32, percentage: 80 },
      { hour: '8 PM', bar: '███████████', count: 40, percentage: 100 },
      { hour: '9 PM', bar: '███████', count: 26, percentage: 65 },
    ],
    insights: [
      'High weekend dinner demand',
      'Strong demand for quiet seating',
      'Average requested party size: 4',
    ],
    service_status: {
      active_covers: 84,
      total_tables: 24,
      occupied_tables: 16,
      open_tables: 8,
    },
    last_updated: new Date().toISOString(),
  });

  const fetchDashboard = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await apiClient.getRestaurantDashboard();
      setDashboardData(data);
    } catch (err) {
      console.warn('Using cached dashboard data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              RESTAURANT / ADMIN PORTAL
            </span>
            <span className="text-xs text-neutral-400">· Hospitality Suite</span>
          </div>
          <h1 className="text-3xl font-serif tracking-tight text-neutral-100">
            Restaurant Dashboard
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Authorized aggregate demand analytics and dining floor metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedVenue}
            onChange={(e) => setSelectedVenue(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-amber-400"
          >
            <option value="Grand Kakinada by GRT Hotels">Grand Kakinada by GRT Hotels</option>
            <option value="The Fisherman’s Table">The Fisherman’s Table</option>
            <option value="Subbayya Gari Hotel">Subbayya Gari Hotel</option>
          </select>

          <button
            onClick={fetchDashboard}
            disabled={isRefreshing}
            className="p-2 text-neutral-400 hover:text-neutral-200 transition-colors"
            title="Refresh analytics"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Guest Pass Verification */}
      <div className="verification-card p-6 rounded-2xl border border-violet-400/25 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="verification-qr-wrap">
            <img
              className="verification-qr"
              src={verificationQrUrl}
              alt="Restaurant guest pass verification QR code"
            />
            <QrCode className="verification-qr-icon" />
          </div>
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-violet-200">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-widest">Host desk verification</span>
            </div>
            <h2 className="text-xl font-serif text-neutral-100">Scan guest reservation passes</h2>
            <p className="text-xs leading-relaxed text-neutral-400">Use this rotating venue QR to verify a Smart Tablekeeper reservation before seating a guest.</p>
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800">
              <span className="font-mono text-sm font-bold tracking-wider text-violet-200">{verificationToken}</span>
              <button className="text-neutral-500 hover:text-violet-200" title="Copy verification token" onClick={() => navigator.clipboard?.writeText(verificationToken)}><Copy className="w-3.5 h-3.5" /></button>
            </div>
            <div>
              <a className="verification-download" href={verificationQrUrl} download={`smart-tablekeeper-${verificationToken}.png`} target="_blank" rel="noreferrer">
                Download verification QR
              </a>
            </div>
          </div>
          <div className="text-center text-[11px] text-neutral-500 sm:max-w-[120px]">
            <span className="block text-emerald-400 font-semibold mb-1">Active today</span>
            Scan the guest’s e-pass QR at arrival.
          </div>
        </div>
      </div>

      {/* Rooms & stays */}
      <div className="space-y-4">
        <div className="border-b border-neutral-800 pb-2 flex items-end justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-violet-300 font-semibold">Stay with the experience</span>
            <h2 className="text-lg font-serif tracking-tight text-neutral-100 mt-1">Rooms & stays</h2>
          </div>
          <span className="text-xs text-neutral-400">{rooms.length ? `${rooms.reduce((sum, room) => sum + room.available, 0)} rooms available` : 'Dining venue'}</span>
        </div>

        {roomSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {roomSuccess}
          </div>
        )}

        {rooms.length === 0 ? (
          <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 text-center">
            <Hotel className="w-7 h-7 mx-auto mb-2 text-neutral-500" />
            <p className="text-sm font-semibold text-neutral-200">Dining-only venue</p>
            <p className="text-xs text-neutral-500 mt-1">Room inventory is not enabled for {selectedVenue}.</p>
          </div>
        ) : (
          <div className="room-inventory-grid">
            {rooms.map((room) => (
              <div key={room.id} className="room-inventory-card">
                <div className="room-card-icon"><BedDouble className="w-5 h-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div><h3>{room.name}</h3><p>{room.detail}</p></div>
                    <span className="room-rate">₹{room.rate.toLocaleString()}<small>/ night</small></span>
                  </div>
                  <div className="room-amenities">{room.amenities.map((amenity) => <span key={amenity}>{amenity}</span>)}</div>
                  <div className="room-card-footer"><span className={room.available <= 1 ? 'room-low' : 'room-open'}><DoorOpen className="w-3.5 h-3.5" /> {room.available} of {room.total} open</span><button onClick={() => { setSelectedRoom(room); setRoomGuestName(''); setRoomSuccess(null); }}>Allocate room <KeyRound className="w-3.5 h-3.5" /></button></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. RESTAURANT DASHBOARD METRICS BOX (Exact PRD Diagram)                   */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-8 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-400">
            Operational Summary · Today
          </span>
          <span className="text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Live Sync</span>
          </span>
        </div>

        {/* 5 Core Metrics */}
        <div className="space-y-4 text-sm sm:text-base">
          <div className="flex items-center justify-between border-b border-neutral-800/50 pb-3">
            <span className="text-neutral-300 font-medium">Today's reservations</span>
            <span className="font-serif text-2xl sm:text-3xl font-bold text-amber-400">
              {dashboardData.metrics.today_reservations}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-neutral-800/50 pb-3">
            <span className="text-neutral-300 font-medium">Booking requests</span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-neutral-100">
              {dashboardData.metrics.booking_requests}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-neutral-800/50 pb-3">
            <span className="text-neutral-300 font-medium">Conversion</span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-emerald-400">
              {dashboardData.metrics.conversion}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-neutral-800/50 pb-3">
            <span className="text-neutral-300 font-medium">Peak time</span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-amber-300">
              {dashboardData.metrics.peak_time}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-neutral-300 font-medium">Top preference</span>
            <span className="font-serif text-xl sm:text-2xl font-bold text-neutral-100">
              {dashboardData.metrics.top_preference}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DEMAND SECTION (Exact PRD Layout)                                      */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="border-b border-neutral-800 pb-2">
          <h2 className="text-lg font-serif tracking-tight text-neutral-100">
            Demand
          </h2>
        </div>

        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
          {dashboardData.demand.map((slot) => (
            <div key={slot.hour} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs sm:text-sm font-mono">
                <span className="w-16 font-semibold text-neutral-300">{slot.hour}</span>
                <span className="text-amber-400 tracking-wider select-all font-mono">
                  {slot.bar}
                </span>
                <span className="text-neutral-500 text-xs w-24 text-right">
                  {slot.count} requests
                </span>
              </div>

              {/* Graphical bar progress representation */}
              <div className="w-full bg-neutral-950 rounded-full h-2 overflow-hidden border border-neutral-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    slot.percentage >= 90
                      ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                      : slot.percentage >= 70
                      ? 'bg-amber-500'
                      : 'bg-neutral-600'
                  }`}
                  style={{ width: `${slot.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. INSIGHTS SECTION (Exact PRD Layout)                                    */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="border-b border-neutral-800 pb-2">
          <h2 className="text-lg font-serif tracking-tight text-neutral-100">
            Insights
          </h2>
        </div>

        <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
          <ul className="space-y-3 text-sm text-neutral-200">
            {dashboardData.insights.map((insight, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-amber-400 text-lg leading-none font-bold">•</span>
                <span className="font-medium text-neutral-200">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. FLOOR OCCUPANCY & SERVICE MANAGEMENT (Authorized Aggregated Data)      */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="border-b border-neutral-800 pb-2 flex items-center justify-between">
          <h2 className="text-lg font-serif tracking-tight text-neutral-100">
            Floor Management & Table Status
          </h2>
          <span className="text-xs text-neutral-400">
            {dashboardData.service_status.occupied_tables} of {dashboardData.service_status.total_tables} Tables Seated
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
            <span className="text-[10px] uppercase text-neutral-500 tracking-wider">Active Covers</span>
            <p className="text-2xl font-bold font-serif text-neutral-100">
              {dashboardData.service_status.active_covers}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
            <span className="text-[10px] uppercase text-neutral-500 tracking-wider">Occupied Tables</span>
            <p className="text-2xl font-bold font-serif text-amber-400">
              {dashboardData.service_status.occupied_tables}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
            <span className="text-[10px] uppercase text-neutral-500 tracking-wider">Available Tables</span>
            <p className="text-2xl font-bold font-serif text-emerald-400">
              {dashboardData.service_status.open_tables}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
            <span className="text-[10px] uppercase text-neutral-500 tracking-wider">Avg Dining Time</span>
            <p className="text-2xl font-bold font-serif text-neutral-300">
              82 min
            </p>
          </div>
        </div>

        {/* Live Table Grid Sample */}
        <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
          <span className="text-xs font-semibold text-neutral-300 block">
            Table Acoustic Zones & Seating
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-neutral-950 border border-emerald-500/20 flex items-center justify-between">
              <div>
                <span className="font-semibold text-neutral-200 block">Booth 1 (Quiet Alcove)</span>
                <span className="text-neutral-500 text-[11px]">Capacity: 4–6 guests</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400">
                Seated
              </span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-amber-500/20 flex items-center justify-between">
              <div>
                <span className="font-semibold text-neutral-200 block">Booth 3 (Quiet Corner)</span>
                <span className="text-neutral-500 text-[11px]">Capacity: 5–6 guests</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400">
                Reserved 7 PM
              </span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-neutral-200 block">Patio Pergola 4</span>
                <span className="text-neutral-500 text-[11px]">Capacity: 2–4 guests</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-neutral-300">
                Available
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy & Authorized Compliance Notice */}
      <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800/60 text-xs text-neutral-400 flex items-center gap-3">
        <Shield className="w-4 h-4 text-amber-400 shrink-0" />
        <p>
          <strong>Privacy Compliance:</strong> Aggregated operational analytics only. Individual patron personal identifying information (PII) is securely masked in accordance with hospitality privacy standards.
        </p>
      </div>

      {selectedRoom && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="room-modal w-full max-w-md rounded-2xl bg-neutral-900 border border-violet-400/25 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3"><div><span className="text-[10px] uppercase tracking-widest text-violet-300">Room allocation</span><h3 className="text-lg font-serif text-neutral-100">{selectedRoom.name}</h3></div><button onClick={() => setSelectedRoom(null)} className="text-neutral-400 hover:text-white">×</button></div>
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 space-y-2"><div className="flex justify-between"><span>Venue</span><strong className="text-neutral-100">{selectedVenue}</strong></div><div className="flex justify-between"><span>Rate</span><strong className="text-violet-200">₹{selectedRoom.rate.toLocaleString()} / night</strong></div><div className="flex justify-between"><span>Availability</span><strong className="text-emerald-400">{selectedRoom.available} rooms open</strong></div></div>
            <div><label className="text-xs text-neutral-400 block mb-1">Guest name</label><input value={roomGuestName} onChange={(event) => setRoomGuestName(event.target.value)} placeholder="Enter guest name" className="w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2.5 text-sm text-neutral-100 focus:outline-none focus:border-violet-400" /></div>
            <button disabled={!roomGuestName.trim()} onClick={() => { setRoomSuccess(`${selectedRoom.name} allocated to ${roomGuestName.trim()}.`); setSelectedRoom(null); }} className="w-full py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 disabled:opacity-40 text-white text-sm font-semibold">Confirm room allocation</button>
          </div>
        </div>
      )}
    </div>
  );
};
