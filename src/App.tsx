import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { ReservationSearch } from './components/ReservationSearch';
import { ReservationHistory } from './components/ReservationHistory';
import { RestaurantDashboard } from './components/RestaurantDashboard';
import { DiningGuide } from './components/DiningGuide';
import { EventsPage } from './components/EventsPage';
import { StaysPage } from './components/StaysPage';
import { LoginPage } from './components/LoginPage';

export default function App() {
  const [authenticated, setAuthenticated] = useState(() => Boolean(localStorage.getItem('dineora_auth')));
  const [role, setRole] = useState<'diner' | 'restaurant'>('diner');
  const [activeTab, setActiveTab] = useState<string>('reservation');
  const [location, setLocation] = useState('Kakinada');

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const idToken = hash.get('id_token');
    if (!idToken) return;

    try {
      const payload = JSON.parse(window.atob(idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      const name = payload.name || payload.email || 'Google guest';
      localStorage.setItem('dineora_auth', name);
      setAuthenticated(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch {
      localStorage.setItem('dineora_auth', 'Google guest');
      setAuthenticated(true);
    }
  }, []);

  if (!authenticated) {
    return <LoginPage onAuthenticated={(name) => {
      localStorage.setItem('dineora_auth', name);
      setAuthenticated(true);
    }} />;
  }

  return (
    <div className="app-shell min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-violet-500/20 selection:text-violet-200">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Navbar
        role={role}
        setRole={setRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        location={location}
        setLocation={setLocation}
        accountName={localStorage.getItem('dineora_auth') || 'Dineora guest'}
        onLogout={() => {
          localStorage.removeItem('dineora_auth');
          setAuthenticated(false);
        }}
      />

      <main id="main-content" className="app-main flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {role === 'restaurant' ? (
          <RestaurantDashboard onSwitchToDiner={() => {
            setRole('diner');
            setActiveTab('reservation');
          }} />
        ) : (
          <>
            {activeTab === 'reservation' && (
              <ReservationSearch location={location} onNavigateToHistory={() => setActiveTab('history')} />
            )}

            {activeTab === 'history' && (
              <ReservationHistory onNavigateToBooking={() => setActiveTab('reservation')} />
            )}

            {activeTab === 'guide' && (
              <DiningGuide onStartSearch={() => setActiveTab('reservation')} />
            )}

            {activeTab === 'events' && <EventsPage location={location} />}

            {activeTab === 'stays' && <StaysPage location={location} />}
          </>
        )}
      </main>

    </div>
  );
}
