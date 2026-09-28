import React, { useMemo, useState } from 'react';
import { CalendarDays, Check, ChevronRight, Clock3, Crown, MapPin, Minus, Music2, Plus, Sparkles, Ticket, Users, X } from 'lucide-react';
import { PaymentModal } from './PaymentModal';

type EventCategory = 'All events' | 'Live music' | 'DJ nights' | 'Weekend parties';

interface DiningEvent {
  id: string;
  title: string;
  restaurant: string;
  city: string;
  date: string;
  time: string;
  category: Exclude<EventCategory, 'All events'>;
  description: string;
  price: number;
  capacity: string;
  image: string;
  accent: string;
  featured?: boolean;
}

const EVENTS: DiningEvent[] = [
  {
    id: 'evt_01', title: 'Moonlit Frequencies', restaurant: "The Fisherman's Table", city: 'Kakinada', date: 'Sat, 28 Sep', time: '8:00 PM – 12:00 AM', category: 'DJ nights',
    description: 'A late-night coastal set with cocktails, chef-led small plates and a waterfront dance floor.', price: 1499, capacity: 'Limited to 120 guests',
    image: 'https://images.unsplash.com/photo-1571266028243-d220c9c3b2de?auto=format&fit=crop&w=1200&q=85', accent: '#b79cff', featured: true,
  },
  {
    id: 'evt_02', title: 'Sunday Soul Sessions', restaurant: 'Spice Garden', city: 'Kakinada', date: 'Sun, 29 Sep', time: '7:00 PM – 10:30 PM', category: 'Live music',
    description: 'An intimate live set by local artists, paired with a family-style tasting menu.', price: 999, capacity: 'Limited to 80 guests',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=85', accent: '#f0a97d',
  },
  {
    id: 'evt_03', title: 'Golden Hour Social', restaurant: 'Urban Bites', city: 'Kakinada', date: 'Fri, 4 Oct', time: '6:30 PM – 11:00 PM', category: 'Weekend parties',
    description: 'Start the weekend with rooftop views, signature pours and a rotating guest DJ lineup.', price: 1199, capacity: 'Limited to 100 guests',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85', accent: '#76d7ce',
  },
  {
    id: 'evt_04', title: 'Indie Under the Stars', restaurant: 'The Green Room', city: 'Kakinada', date: 'Sat, 5 Oct', time: '7:30 PM – 11:00 PM', category: 'Live music',
    description: 'Three independent acts, garden tables and a seasonal menu made for lingering evenings.', price: 899, capacity: 'Limited to 70 guests',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=85', accent: '#8ed4ff',
  },
  {
    id: 'evt_05', title: 'Neon Bollywood', restaurant: 'Spice Garden', city: 'Kakinada', date: 'Sat, 12 Oct', time: '8:30 PM – 1:00 AM', category: 'DJ nights',
    description: 'Bollywood anthems, neon lights and a full-service late-night kitchen for the dance floor.', price: 1299, capacity: 'Limited to 150 guests',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=85', accent: '#ff9ac1',
  },
  {
    id: 'evt_06', title: 'The Sunday Table', restaurant: "The Fisherman's Table", city: 'Kakinada', date: 'Sun, 13 Oct', time: '12:30 PM – 4:00 PM', category: 'Weekend parties',
    description: 'A long-table coastal lunch with acoustic music, shared plates and a slow Sunday mood.', price: 1599, capacity: 'Limited to 60 guests',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=85', accent: '#ffc778',
  },
  {
    id: 'evt_07', title: 'House of Disco', restaurant: 'Urban Bites', city: 'Kakinada', date: 'Fri, 18 Oct', time: '9:00 PM – 1:00 AM', category: 'DJ nights',
    description: 'A high-energy disco night with vinyl selectors, mirrorball cocktails and all-night bites.', price: 1099, capacity: 'Limited to 120 guests',
    image: 'https://images.unsplash.com/photo-1571266028243-d220c9c3b2de?auto=format&fit=crop&w=1200&q=85', accent: '#f1c77b',
  },
  {
    id: 'evt_08', title: 'Acoustic & Aperitivo', restaurant: 'The Green Room', city: 'Kakinada', date: 'Sat, 19 Oct', time: '6:00 PM – 9:30 PM', category: 'Live music',
    description: 'Golden-hour acoustic covers paired with a three-course tasting of garden-inspired plates.', price: 1399, capacity: 'Limited to 50 guests',
    image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1200&q=85', accent: '#a3e2b3',
  },
  {
    id: 'evt_09', title: 'Midnight Masquerade', restaurant: "The Fisherman's Table", city: 'Kakinada', date: 'Sat, 26 Oct', time: '8:00 PM – 12:30 AM', category: 'Weekend parties',
    description: 'Dress up for a candlelit coastal celebration with a mystery menu and live performers.', price: 1899, capacity: 'Limited to 90 guests',
    image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=85', accent: '#d1a7ff',
  },
  {
    id: 'evt_10', title: 'Bassline Brunch', restaurant: 'Urban Bites', city: 'Kakinada', date: 'Sun, 27 Oct', time: '11:30 AM – 3:30 PM', category: 'DJ nights',
    description: 'Bottomless brunch plates, low-slung beats and a daytime set built for your weekend crew.', price: 999, capacity: 'Limited to 110 guests',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=85', accent: '#ffb38c',
  },
  {
    id: 'evt_11', title: 'Coastal Jazz Club', restaurant: "The Fisherman's Table", city: 'Kakinada', date: 'Fri, 1 Nov', time: '7:00 PM – 10:30 PM', category: 'Live music',
    description: 'A refined evening of modern jazz, harbour views and a chef’s five-course seafood menu.', price: 2299, capacity: 'Limited to 45 guests',
    image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=85', accent: '#93c5fd',
  },
  {
    id: 'evt_12', title: 'First Friday: After Dark', restaurant: 'Spice Garden', city: 'Kakinada', date: 'Fri, 8 Nov', time: '8:00 PM – 12:00 AM', category: 'Weekend parties',
    description: 'A lively first-Friday gathering with street-food stations, games and a surprise guest act.', price: 799, capacity: 'Limited to 180 guests',
    image: 'https://images.unsplash.com/photo-1496337589254-7e19d01cec44?auto=format&fit=crop&w=1200&q=85', accent: '#fb7185',
  },
];

export const EventsPage: React.FC<{ location: string }> = ({ location }) => {
  const [activeCategory, setActiveCategory] = useState<EventCategory>('All events');
  const [selectedEvent, setSelectedEvent] = useState<DiningEvent | null>(null);
  const [quantity, setQuantity] = useState(2);
  const [bookedEvent, setBookedEvent] = useState<{ event: DiningEvent; quantity: number } | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const visibleEvents = useMemo(
    () => activeCategory === 'All events' ? EVENTS : EVENTS.filter((event) => event.category === activeCategory),
    [activeCategory],
  );

  const openBooking = (event: DiningEvent) => {
    setSelectedEvent(event);
    setQuantity(2);
  };

  return (
    <div className="events-page space-y-7 animate-fadeIn">
      <section className="events-hero">
        <div className="events-hero-copy">
          <div className="events-eyebrow"><Sparkles size={14} /> Beyond the reservation</div>
          <h1>Make a night<br /><span>worth remembering.</span></h1>
          <p>Discover intimate concerts, late-night DJ sets and weekend parties hosted by the restaurants you love.</p>
          <div className="events-location"><MapPin size={14} /> Showing events near <strong>{location}</strong></div>
        </div>
        <div className="events-hero-stat"><strong>12</strong><span>upcoming events<br />this month</span></div>
      </section>

      <div className="events-toolbar">
        <div><span className="events-section-kicker">Curated for you</span><h2>What’s happening</h2></div>
        <div className="events-filters" role="tablist" aria-label="Event categories">
          {(['All events', 'Live music', 'DJ nights', 'Weekend parties'] as EventCategory[]).map((category) => (
            <button key={category} className={activeCategory === category ? 'active' : ''} onClick={() => setActiveCategory(category)} role="tab" aria-selected={activeCategory === category}>{category}</button>
          ))}
        </div>
      </div>

      <div className="events-grid">
        {visibleEvents.map((event) => (
          <article className={`event-card ${event.featured ? 'featured' : ''}`} key={event.id}>
            <div className="event-image" style={{ backgroundImage: `linear-gradient(180deg, transparent 25%, rgba(4, 11, 20, .9) 100%), url(${event.image})` }}>
              <span className="event-category" style={{ color: event.accent }}>{event.category}</span>
              {event.featured && <span className="event-featured"><Crown size={12} /> Editor’s pick</span>}
              <div className="event-image-date"><strong>{event.date.split(' ')[1]?.replace(',', '')}</strong><span>{event.date.split(' ')[0]}</span></div>
            </div>
            <div className="event-card-body">
              <div className="event-card-title"><div><h3>{event.title}</h3><p>{event.restaurant}</p></div><span className="event-price">₹{event.price.toLocaleString()}<small>/ ticket</small></span></div>
              <p className="event-description">{event.description}</p>
              <div className="event-meta"><span><Clock3 size={14} /> {event.time}</span><span><Users size={14} /> {event.capacity}</span></div>
              <button className="event-book-button" onClick={() => openBooking(event)}>Reserve elite tickets <ChevronRight size={16} /></button>
            </div>
          </article>
        ))}
      </div>

      {selectedEvent && (
        <div className="event-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelectedEvent(null)}>
          <div className="event-modal" role="dialog" aria-modal="true" aria-labelledby="event-booking-title">
            <button className="event-modal-close" onClick={() => setSelectedEvent(null)} aria-label="Close ticket booking"><X size={18} /></button>
            <div className="event-modal-image" style={{ backgroundImage: `url(${selectedEvent.image})` }}><span><Ticket size={15} /> Elite access</span></div>
            <div className="event-modal-content">
              <span className="events-section-kicker">{selectedEvent.category} · {selectedEvent.date}</span>
              <h2 id="event-booking-title">{selectedEvent.title}</h2>
              <p className="event-modal-venue"><MapPin size={14} /> {selectedEvent.restaurant} · {selectedEvent.city}</p>
              <div className="event-ticket-row"><div><strong>Elite party ticket</strong><small>Includes event entry and welcome drink</small></div><strong>₹{selectedEvent.price.toLocaleString()}</strong></div>
              <div className="event-quantity"><span>Number of tickets</span><div><button onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease tickets"><Minus size={15} /></button><strong>{quantity}</strong><button onClick={() => setQuantity((value) => Math.min(8, value + 1))} aria-label="Increase tickets"><Plus size={15} /></button></div></div>
              <div className="event-total"><span>Total</span><strong>₹{(selectedEvent.price * quantity).toLocaleString()}</strong></div>
              <button className="event-confirm-button" onClick={() => setPaymentOpen(true)}>Continue to payment <Ticket size={16} /></button>
              <p className="event-small-print">Your ticket confirmation will be available in My Bookings.</p>
            </div>
          </div>
        </div>
      )}

      {bookedEvent && (
        <div className="event-toast"><span className="event-toast-check"><Check size={15} /></span><div><strong>Tickets reserved</strong><p>{bookedEvent.quantity} elite ticket{bookedEvent.quantity > 1 ? 's' : ''} for {bookedEvent.event.title}</p></div><button onClick={() => setBookedEvent(null)} aria-label="Dismiss confirmation"><X size={15} /></button></div>
      )}
      {paymentOpen && selectedEvent && <PaymentModal title="Buy elite tickets" description={selectedEvent.title} amount={selectedEvent.price * quantity} onClose={() => setPaymentOpen(false)} onSuccess={() => { setBookedEvent({ event: selectedEvent, quantity }); setPaymentOpen(false); setSelectedEvent(null); }} />}
    </div>
  );
};
