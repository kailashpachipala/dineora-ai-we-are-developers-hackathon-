import React, { useState } from 'react';
import { BedDouble, Check, ChevronRight, ExternalLink, Hotel, MapPin } from 'lucide-react';
import { saveStayBooking } from '../api/stayBookings';
import { PaymentModal } from './PaymentModal';

const KAKINADA_STAYS = [
  { name: 'Grand Kakinada by GRT Hotels', city: 'Kakinada', room: 'Deluxe King Room', detail: 'King bed · 2 guests · 32 m²', price: 5200, amenities: ['Breakfast', 'Wi-Fi', 'City view'], image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=85' },
  { name: 'The Fisherman’s Table', city: 'Kakinada', room: 'Waterfront King Room', detail: 'King bed · 2 guests · 36 m²', price: 6800, amenities: ['Breakfast', 'Wi-Fi', 'Water view'], image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1000&q=85' },
  { name: 'Grand Kakinada by GRT Hotels', city: 'Kakinada', room: 'Coastal Executive Suite', detail: 'King bed · 3 guests · 48 m²', price: 8900, amenities: ['Breakfast', 'Lounge access', 'Harbour view'], image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=85' },
];

const CITY_STAYS: Record<string, typeof KAKINADA_STAYS> = {
  Mumbai: [
    { name: 'The Taj Mahal Palace', city: 'Mumbai', room: 'Harbour View King Room', detail: 'King bed · 2 guests · 38 m²', price: 24000, amenities: ['Breakfast', 'Wi-Fi', 'Sea view'], image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1000&q=85' },
    { name: 'The Leela Mumbai', city: 'Mumbai', room: 'Executive Club Room', detail: 'King bed · 2 guests · 40 m²', price: 14500, amenities: ['Breakfast', 'Club lounge', 'Airport access'], image: 'https://images.unsplash.com/photo-1582719478250-c89 ca?auto=format&fit=crop&w=1000&q=85'.replace(' ', '') },
  ],
  Delhi: [
    { name: 'The Imperial New Delhi', city: 'Delhi', room: 'Heritage Deluxe Room', detail: 'King bed · 2 guests · 42 m²', price: 18500, amenities: ['Breakfast', 'Butler service', 'City centre'], image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=85' },
    { name: 'The Lodhi New Delhi', city: 'Delhi', room: 'Garden Terrace Room', detail: 'King bed · 2 guests · 48 m²', price: 22000, amenities: ['Breakfast', 'Terrace', 'Pool access'], image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=85' },
  ],
  Bengaluru: [
    { name: 'The Leela Palace Bengaluru', city: 'Bengaluru', room: 'Palace Deluxe Room', detail: 'King bed · 2 guests · 45 m²', price: 16500, amenities: ['Breakfast', 'Pool', 'Wi-Fi'], image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=85' },
    { name: 'Taj West End', city: 'Bengaluru', room: 'Garden View Room', detail: 'King bed · 2 guests · 36 m²', price: 12800, amenities: ['Breakfast', 'Garden view', 'Gym'], image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=85' },
  ],
  Hyderabad: [
    { name: 'Taj Falaknuma Palace', city: 'Hyderabad', room: 'Palace Heritage Room', detail: 'King bed · 2 guests · 44 m²', price: 28000, amenities: ['Breakfast', 'Palace access', 'City view'], image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1000&q=85' },
    { name: 'ITC Kohenur', city: 'Hyderabad', room: 'Luxury Garden Room', detail: 'King bed · 2 guests · 40 m²', price: 14500, amenities: ['Breakfast', 'Lake view', 'Pool'], image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1000&q=85' },
  ],
  Chennai: [
    { name: 'ITC Grand Chola', city: 'Chennai', room: 'Luxury Tower Room', detail: 'King bed · 2 guests · 44 m²', price: 15000, amenities: ['Breakfast', 'Pool', 'Spa access'], image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=85' },
    { name: 'Taj Coromandel', city: 'Chennai', room: 'Premium City Room', detail: 'King bed · 2 guests · 35 m²', price: 11800, amenities: ['Breakfast', 'Wi-Fi', 'Gym'], image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=85' },
  ],
  Kolkata: [
    { name: 'The Oberoi Grand Kolkata', city: 'Kolkata', room: 'Luxury Heritage Room', detail: 'King bed · 2 guests · 38 m²', price: 13000, amenities: ['Breakfast', 'Pool', 'Heritage wing'], image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1000&q=85' },
    { name: 'ITC Sonar', city: 'Kolkata', room: 'Deluxe Garden Room', detail: 'King bed · 2 guests · 40 m²', price: 10500, amenities: ['Breakfast', 'Garden view', 'Spa'], image: 'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=1000&q=85' },
  ],
  Pune: [
    { name: 'JW Marriott Hotel Pune', city: 'Pune', room: 'Deluxe King Room', detail: 'King bed · 2 guests · 38 m²', price: 9800, amenities: ['Breakfast', 'Pool', 'City view'], image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=85' },
    { name: 'Conrad Pune', city: 'Pune', room: 'Executive King Room', detail: 'King bed · 2 guests · 42 m²', price: 11200, amenities: ['Breakfast', 'Lounge access', 'Gym'], image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=85' },
  ],
  Ahmedabad: [
    { name: 'ITC Narmada', city: 'Ahmedabad', room: 'Luxury King Room', detail: 'King bed · 2 guests · 40 m²', price: 10500, amenities: ['Breakfast', 'Pool', 'City view'], image: 'https://images.unsplash.com/photo-1544986581-efac024faf62?auto=format&fit=crop&w=1000&q=85' },
    { name: 'Hyatt Regency Ahmedabad', city: 'Ahmedabad', room: 'Regency Club Room', detail: 'King bed · 2 guests · 37 m²', price: 8500, amenities: ['Breakfast', 'Club lounge', 'Wi-Fi'], image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=85' },
  ],
  Jaipur: [
    { name: 'Rambagh Palace', city: 'Jaipur', room: 'Palace Luxury Room', detail: 'King bed · 2 guests · 46 m²', price: 32000, amenities: ['Breakfast', 'Butler service', 'Garden view'], image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1000&q=85' },
    { name: 'ITC Rajputana', city: 'Jaipur', room: 'Rajputana Deluxe Room', detail: 'King bed · 2 guests · 39 m²', price: 11000, amenities: ['Breakfast', 'Pool', 'Spa access'], image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1000&q=85' },
  ],
  Goa: [
    { name: 'Taj Exotica Resort & Spa Goa', city: 'Goa', room: 'Garden Villa', detail: 'King bed · 2 guests · 48 m²', price: 18500, amenities: ['Breakfast', 'Garden', 'Beach access'], image: 'https://images.unsplash.com/photo-1582610116397-edb318620f90?auto=format&fit=crop&w=1000&q=85' },
    { name: 'W Goa', city: 'Goa', room: 'Wonderful Garden View Room', detail: 'King bed · 2 guests · 45 m²', price: 21000, amenities: ['Breakfast', 'Pool', 'Beach access'], image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1000&q=85' },
  ],
  Kochi: [
    { name: 'Brunton Boatyard', city: 'Kochi', room: 'Harbour View Room', detail: 'King bed · 2 guests · 35 m²', price: 12500, amenities: ['Breakfast', 'Harbour view', 'Pool'], image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=85' },
    { name: 'Grand Hyatt Kochi Bolgatty', city: 'Kochi', room: 'Lake View Room', detail: 'King bed · 2 guests · 42 m²', price: 13500, amenities: ['Breakfast', 'Lake view', 'Spa'], image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=85' },
  ],
  Chandigarh: [
    { name: 'The Lalit Chandigarh', city: 'Chandigarh', room: 'Deluxe King Room', detail: 'King bed · 2 guests · 38 m²', price: 8200, amenities: ['Breakfast', 'Wi-Fi', 'Gym'], image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=85' },
    { name: 'Hyatt Regency Chandigarh', city: 'Chandigarh', room: 'Regency Club Room', detail: 'King bed · 2 guests · 40 m²', price: 9600, amenities: ['Breakfast', 'Lounge access', 'Pool'], image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=85' },
  ],
};

export const StaysPage: React.FC<{ location: string }> = ({ location }) => {
  const [booked, setBooked] = useState<string | null>(null);
  const [paymentStay, setPaymentStay] = useState<(typeof stays)[number] | null>(null);
  const stays = location === 'Kakinada' ? KAKINADA_STAYS : (CITY_STAYS[location] || []);

  return (
    <div className="stays-page space-y-7 animate-fadeIn">
      <div className="stays-hero"><div><span className="events-section-kicker">Stay a little longer</span><h1>Rooms with a<br /><span>seat at the table.</span></h1><p>Pair your reservation with a considered stay at selected dining destinations.</p><div className="events-location"><MapPin size={14} /> Showing stays near <strong>{location}</strong></div></div><Hotel className="stays-hero-icon" /></div>
      <div className="flex items-end justify-between"><div><span className="events-section-kicker">Selected stays</span><h2 className="text-xl font-semibold text-neutral-100 mt-1">Book a room with your dinner</h2></div><span className="text-xs text-neutral-500">{stays.length} rooms found</span></div>
      <div className="stays-grid">
        {stays.map((stay) => <article className="stay-card" key={stay.room}><div className="stay-image" style={{ backgroundImage: `linear-gradient(180deg, transparent, rgba(4, 11, 20, .8)), url(${stay.image})` }}><span><BedDouble size={13} /> Room stay</span></div><div className="p-4"><div className="flex justify-between gap-3"><div><h3>{stay.room}</h3><p className="stay-venue">{stay.name}</p></div><strong className="stay-price">₹{stay.price.toLocaleString()}<small>/ night</small></strong></div><p className="stay-detail">{stay.detail}</p><div className="stay-amenities">{stay.amenities.map((amenity) => <span key={amenity}>{amenity}</span>)}</div><div className="stay-actions"><a href={`https://www.google.com/search?q=${encodeURIComponent(`${stay.name}, ${stay.city}, India reviews`)}`} target="_blank" rel="noopener noreferrer"><MapPin size={13} /> Google reviews</a><button className="stay-book" onClick={() => setPaymentStay(stay)}>Book this room <ChevronRight size={15} /></button></div></div></article>)}
      </div>
      {booked && <div className="stay-toast"><span><Check size={15} /></span><div><strong>Room request received</strong><p>{booked} is ready for confirmation.</p></div><button onClick={() => setBooked(null)}>Close</button></div>}
      {paymentStay && <PaymentModal title="Reserve your room" description={`${paymentStay.room} · ${paymentStay.name}`} amount={paymentStay.price} onClose={() => setPaymentStay(null)} onSuccess={() => { saveStayBooking({ id: `stay_${Date.now()}`, hotel_name: paymentStay.name, room_name: paymentStay.room, city: paymentStay.city, detail: paymentStay.detail, rate: paymentStay.price, amenities: paymentStay.amenities, status: 'confirmed', booked_at: new Date().toISOString() }); setBooked(paymentStay.room); setPaymentStay(null); }} />}
    </div>
  );
};
