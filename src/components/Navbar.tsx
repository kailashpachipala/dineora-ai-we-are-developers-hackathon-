import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, BookmarkCheck, Compass, MapPin, Building2, User, ChevronDown, PartyPopper, BedDouble, LogOut } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: 'diner' | 'restaurant';
  setRole: (role: 'diner' | 'restaurant') => void;
  location: string;
  setLocation: (location: string) => void;
  accountName: string;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  role,
  setRole,
  location,
  setLocation,
  accountName,
  onLogout,
}) => {
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);
  const cities = ['Kakinada', 'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Goa', 'Kochi', 'Chandigarh'];

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setIsLocationOpen(false);
      }
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  return (
    <header className="app-nav border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (role === 'restaurant') {
                setActiveTab('restaurant_dashboard');
              } else {
                setActiveTab('reservation');
              }
            }}
            className="wordmark text-base sm:text-lg font-semibold text-neutral-100 hover:text-violet-300 transition-colors flex items-center gap-2 shrink-0"
          >
            <span className="wordmark-icon">✨</span><span>Dineora</span>
          </a>

          {role === 'restaurant' && (
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
              Restaurant Portal
            </span>
          )}
        </div>

        {/* Navigation Links based on Active Role */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium">
          {role === 'diner' ? (
            <>
              <button
                onClick={() => setActiveTab('reservation')}
                className={`transition-colors text-left flex items-center gap-1.5 py-1 ${
                  activeTab === 'reservation'
                    ? 'text-amber-400 underline decoration-amber-400 decoration-2 underline-offset-8 font-semibold'
                    : 'text-neutral-300 hover:text-neutral-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Find a Table</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`transition-colors text-left flex items-center gap-1.5 py-1 ${
                  activeTab === 'history'
                    ? 'text-amber-400 underline decoration-amber-400 decoration-2 underline-offset-8 font-semibold'
                    : 'text-neutral-300 hover:text-neutral-100'
                }`}
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>My Bookings</span>
              </button>

              <button
                onClick={() => setActiveTab('guide')}
                className={`transition-colors text-left flex items-center gap-1.5 py-1 ${
                  activeTab === 'guide'
                    ? 'text-amber-400 underline decoration-amber-400 decoration-2 underline-offset-8 font-semibold'
                    : 'text-neutral-300 hover:text-neutral-100'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Dining Guide</span>
              </button>

              <button
                onClick={() => setActiveTab('events')}
                className={`transition-colors text-left flex items-center gap-1.5 py-1 ${activeTab === 'events' ? 'text-amber-400 underline decoration-amber-400 decoration-2 underline-offset-8 font-semibold' : 'text-neutral-300 hover:text-neutral-100'}`}
              >
                <PartyPopper className="w-3.5 h-3.5 text-amber-400" />
                <span>Events</span>
              </button>

              <button
                onClick={() => setActiveTab('stays')}
                className={`transition-colors text-left flex items-center gap-1.5 py-1 ${activeTab === 'stays' ? 'text-amber-400 underline decoration-amber-400 decoration-2 underline-offset-8 font-semibold' : 'text-neutral-300 hover:text-neutral-100'}`}
              >
                <BedDouble className="w-3.5 h-3.5 text-amber-400" />
                <span>Stays</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('restaurant_dashboard')}
                className={`transition-colors text-left flex items-center gap-1.5 py-1 ${
                  activeTab === 'restaurant_dashboard'
                    ? 'text-amber-400 underline decoration-amber-400 decoration-2 underline-offset-8 font-semibold'
                    : 'text-neutral-300 hover:text-neutral-100'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Dashboard & Demands</span>
              </button>
            </>
          )}
        </nav>

        {/* Role Switcher (Separate role, not mixed into the diner UI) */}
        <div className="flex items-center gap-3 shrink-0">
          {role === 'diner' && (
            <div ref={locationRef} className="location-picker-wrap hidden sm:block">
              <button
                type="button"
                className="location-picker flex items-center"
                onClick={() => setIsLocationOpen((open) => !open)}
                aria-haspopup="listbox"
                aria-expanded={isLocationOpen}
                title="Choose your dining location"
              >
                <MapPin className="w-3.5 h-3.5 text-violet-300" />
                <span className="location-picker-copy"><small>Dining in</small><strong>{location}</strong></span>
                <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isLocationOpen ? 'rotate-180' : ''}`} />
              </button>
              {isLocationOpen && (
                <div className="location-menu" role="listbox" aria-label="Dining location">
                  <div className="location-menu-title">Choose a city</div>
                  {cities.map((city) => (
                    <button
                      type="button"
                      role="option"
                      aria-selected={location === city}
                      key={city}
                      className={`location-option ${location === city ? 'is-selected' : ''}`}
                      onClick={() => {
                        setLocation(city);
                        setIsLocationOpen(false);
                      }}
                    >
                      <span>{city}</span>
                      {location === city && <span className="location-check">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {role === 'diner' ? (
            <button
              onClick={() => {
                setRole('restaurant');
                setActiveTab('restaurant_dashboard');
              }}
              className="nav-portal px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-violet-300 text-xs font-medium border border-neutral-800 hover:border-neutral-700 transition-all flex items-center gap-1.5"
              title="Access authorized restaurant manager dashboard"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Restaurant Portal</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setRole('diner');
                setActiveTab('reservation');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-semibold transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Back to Diner View</span>
            </button>
          )}
          <div className="account-menu" title="Signed-in account">
            <span className="account-avatar">{accountName.slice(0, 1).toUpperCase()}</span>
            <span className="account-copy"><small>Signed in as</small><strong>{accountName}</strong></span>
            <button type="button" className="account-logout" onClick={onLogout} aria-label="Log out" title="Log out"><LogOut size={16} /></button>
          </div>
        </div>
      </div>

      {/* Mobile subnav */}
      <div className="md:hidden flex items-center justify-around px-6 py-2.5 border-t border-neutral-900 text-xs">
        {role === 'diner' ? (
          <>
            <button
              onClick={() => setActiveTab('reservation')}
              className={`py-1 flex items-center gap-1.5 ${
                activeTab === 'reservation' ? 'text-amber-400 font-semibold' : 'text-neutral-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Find Table</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`py-1 flex items-center gap-1.5 ${
                activeTab === 'history' ? 'text-amber-400 font-semibold' : 'text-neutral-400'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>My Bookings</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`py-1 flex items-center gap-1.5 ${
                activeTab === 'guide' ? 'text-amber-400 font-semibold' : 'text-neutral-400'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Guide</span>
            </button>

            <button
              onClick={() => setActiveTab('events')}
              className={`py-1 flex items-center gap-1.5 ${activeTab === 'events' ? 'text-amber-400 font-semibold' : 'text-neutral-400'}`}
            >
              <PartyPopper className="w-3.5 h-3.5 text-amber-400" />
              <span>Events</span>
            </button>

            <button
              onClick={() => setActiveTab('stays')}
              className={`py-1 flex items-center gap-1.5 ${activeTab === 'stays' ? 'text-amber-400 font-semibold' : 'text-neutral-400'}`}
            >
              <BedDouble className="w-3.5 h-3.5 text-amber-400" />
              <span>Stays</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => setActiveTab('restaurant_dashboard')}
            className="py-1 text-amber-400 font-semibold flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Restaurant Dashboard</span>
          </button>
        )}
      </div>
    </header>
  );
};
