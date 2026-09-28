import React from 'react';
import { Sparkles, Utensils, Clock, MapPin, HeartHandshake, ShieldCheck, Armchair } from 'lucide-react';

interface DiningGuideProps {
  onStartSearch: () => void;
}

export const DiningGuide: React.FC<DiningGuideProps> = ({ onStartSearch }) => {
  return (
    <div className="space-y-12 animate-fadeIn max-w-5xl mx-auto py-4">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated Table Reservations</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif tracking-tight text-neutral-100">
          Effortless Dining, Intelligently Arranged
        </h1>
        <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
          Simply describe your dining vision in natural words. Whether you need a quiet booth for family celebrations in Kakinada, an intimate anniversary dinner by the water, or quick counter seating for two, Smart Tablekeeper guarantees your table instantly.
        </p>
        <div className="pt-2">
          <button
            onClick={onStartSearch}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            Find a Table Now
          </button>
        </div>
      </div>

      {/* How it Works: 3 Pure Consumer Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-serif text-lg font-bold">
            1
          </div>
          <h3 className="text-lg font-serif font-semibold text-neutral-100">Describe Your Evening</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Tell us your guest count, preferred time, desired atmosphere, and target budget. No rigid dropdown filters required.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-serif text-lg font-bold">
            2
          </div>
          <h3 className="text-lg font-serif font-semibold text-neutral-100">Select Handpicked Venues</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Browse verified venues tailored to your acoustic, culinary, and budget preferences with real-time seat availability.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-serif text-lg font-bold">
            3
          </div>
          <h3 className="text-lg font-serif font-semibold text-neutral-100">Instant Guaranteed Booking</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Receive a verified confirmation code with guaranteed table hold, guest notifications, and turn-by-turn transit directions.
          </p>
        </div>
      </div>

      {/* Curated Ambiance Categories */}
      <div className="space-y-6">
        <div className="border-b border-neutral-800 pb-4">
          <h2 className="text-2xl font-serif font-semibold text-neutral-100">Signature Seating Experiences</h2>
          <p className="text-xs text-neutral-400 mt-1">Select from vetted dining spaces tailored to your gathering.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 space-y-2">
            <Armchair className="w-5 h-5 text-amber-400" />
            <h4 className="text-sm font-semibold text-neutral-200">Quiet Booths</h4>
            <p className="text-xs text-neutral-400">Acoustically insulated corners for intimate conversations and business dinners.</p>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 space-y-2">
            <Utensils className="w-5 h-5 text-amber-400" />
            <h4 className="text-sm font-semibold text-neutral-200">Chef Counters</h4>
            <p className="text-xs text-neutral-400">Front-row views of culinary artistry, open fire hearths, and tasting menus.</p>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 space-y-2">
            <MapPin className="w-5 h-5 text-amber-400" />
            <h4 className="text-sm font-semibold text-neutral-200">Scenic Terraces</h4>
            <p className="text-xs text-neutral-400">Alfresco coastal breezes, port views, and sunset dining under the stars.</p>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 space-y-2">
            <HeartHandshake className="w-5 h-5 text-amber-400" />
            <h4 className="text-sm font-semibold text-neutral-200">Private Sanctums</h4>
            <p className="text-xs text-neutral-400">Spacious banquet settings with dedicated hospitality for birthdays and family gatherings.</p>
          </div>
        </div>
      </div>

      {/* Patron Trust Banner */}
      <div className="p-6 rounded-2xl bg-neutral-900/80 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-200">Guaranteed Table Locking</h4>
            <p className="text-xs text-neutral-400 mt-0.5">Every reservation is locked directly with restaurant hosts with zero risk of overbooking.</p>
          </div>
        </div>

        <button
          onClick={onStartSearch}
          className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-xs font-semibold border border-neutral-700 whitespace-nowrap transition-colors"
        >
          Explore Available Tables
        </button>
      </div>
    </div>
  );
};
