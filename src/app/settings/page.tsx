'use client';

import { ChevronLeft, Home as HomeIcon, Briefcase, Plane, Trash2, Save, X, MapPin, Clock, ToggleLeft, ToggleRight } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import SearchInput from '@/components/SearchInput';
import { useState } from 'react';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface SavedPlaces {
  home: string | null;
  work: string | null;
  airport: string | null;
}

interface TripEntry {
  origin: string;
  destination: string;
  timestamp: number;
}

interface Preferences {
  preferPublicTransport: boolean;
  avoidHighStress: boolean;
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const placeConfig = [
  { key: 'home' as const, label: 'Home', icon: <HomeIcon size={18} />, emoji: '🏠' },
  { key: 'work' as const, label: 'Work', icon: <Briefcase size={18} />, emoji: '💼' },
  { key: 'airport' as const, label: 'Airport', icon: <Plane size={18} />, emoji: '✈️' },
];

export default function SettingsPage() {
  const { value: savedPlaces, setValue: setSavedPlaces } = useLocalStorage<SavedPlaces>(
    'ona_saved_places',
    { home: null, work: null, airport: null }
  );
  const { value: tripHistory, setValue: setTripHistory } = useLocalStorage<TripEntry[]>(
    'ona_trip_history',
    []
  );
  const { value: prefs, setValue: setPrefs } = useLocalStorage<Preferences>(
    'ona_preferences',
    { preferPublicTransport: false, avoidHighStress: false }
  );

  const [editingPlace, setEditingPlace] = useState<keyof SavedPlaces | null>(null);
  const [editInput, setEditInput] = useState('');

  const handleSavePlace = () => {
    if (editingPlace && editInput.trim()) {
      setSavedPlaces({ ...savedPlaces, [editingPlace]: editInput.trim() });
      setEditingPlace(null);
      setEditInput('');
    }
  };

  const handleClearPlace = (key: keyof SavedPlaces) => {
    setSavedPlaces({ ...savedPlaces, [key]: null });
  };

  const handleClearHistory = () => {
    setTripHistory([]);
  };

  const togglePref = (key: keyof Preferences) => {
    setPrefs({ ...prefs, [key]: !prefs[key] });
  };

  return (
    <main className="min-h-screen bg-[#0F0D0B] text-white pb-28">
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-2xl p-5 flex items-center gap-4 sticky top-0 z-40 border-b border-white/10">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Link
            href="/"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10"
          >
            <ChevronLeft size={24} />
          </Link>
        </motion.div>
        <h1 className="text-sm font-black uppercase tracking-[0.3em] text-white">Settings</h1>
      </header>

      <div className="max-w-md mx-auto px-6 py-8 space-y-10">
        {/* ── Saved Places ── */}
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A3E635]/60 mb-4 px-1">
            Saved Places
          </h2>
          <div className="space-y-3">
            {placeConfig.map(({ key, label, emoji }) => {
              const saved = savedPlaces[key];
              return (
                <motion.div
                  key={key}
                  layout
                  className="bg-white/5 border border-white/10 rounded-3xl p-5 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#1E1B4B] flex items-center justify-center text-xl shrink-0">
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-0.5">{label}</p>
                    {saved ? (
                      <p className="text-white text-sm font-bold truncate">{saved}</p>
                    ) : (
                      <p className="text-white/20 text-xs italic">Not set</p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setEditingPlace(key);
                        setEditInput(saved || '');
                      }}
                      className="w-9 h-9 rounded-xl bg-[#A3E635]/10 border border-[#A3E635]/20 flex items-center justify-center text-[#A3E635] hover:bg-[#A3E635]/20 transition-colors"
                    >
                      <Save size={15} />
                    </motion.button>
                    {saved && (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleClearPlace(key)}
                        className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 hover:bg-rose-500/20 transition-colors"
                      >
                        <X size={15} />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── Preferences ── */}
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A3E635]/60 mb-4 px-1">
            Preferences
          </h2>
          <div className="space-y-3">
            {[
              {
                key: 'preferPublicTransport' as const,
                label: 'Prefer Public Transport',
                desc: 'AI will prioritise Danfo and BRT options',
              },
              {
                key: 'avoidHighStress' as const,
                label: 'Avoid High Stress Routes',
                desc: 'Exclude routes with heavy congestion',
              },
            ].map(({ key, label, desc }) => (
              <motion.button
                key={key}
                whileTap={{ scale: 0.98 }}
                onClick={() => togglePref(key)}
                className="w-full bg-white/5 border border-white/10 rounded-3xl p-5 flex items-center gap-4 text-left hover:bg-white/[0.08] transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{label}</p>
                  <p className="text-xs text-white/40 mt-0.5">{desc}</p>
                </div>
                <div className={`transition-colors ${prefs[key] ? 'text-[#A3E635]' : 'text-white/20'}`}>
                  {prefs[key] ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* ── Trip History ── */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A3E635]/60">
              Trip History
            </h2>
            {tripHistory.length > 0 && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleClearHistory}
                className="text-rose-400 text-xs font-bold flex items-center gap-1 hover:underline"
              >
                <Trash2 size={12} />
                Clear All
              </motion.button>
            )}
          </div>

          {tripHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 rounded-3xl bg-white/5 border border-white/5">
              <Clock size={28} className="text-white/10 mb-3" />
              <p className="text-white/20 text-xs font-bold uppercase tracking-widest">No trips yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tripHistory.map((trip, idx) => (
                <motion.div
                  key={idx}
                  layout
                  className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-[#A3E635]/10 flex items-center justify-center text-[#A3E635] shrink-0">
                    <MapPin size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-bold truncate">{trip.destination}</p>
                    <p className="text-white/30 text-xs">From {trip.origin}</p>
                  </div>
                  <span className="text-white/20 text-[10px] font-bold shrink-0">{timeAgo(trip.timestamp)}</span>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* ── About ── */}
        <section>
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#A3E635]/60 mb-4 px-1">
            About
          </h2>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center space-y-2">
            <p className="text-2xl font-black text-[#A3E635]">ONA</p>
            <p className="text-white/40 text-xs">Smartest Way Through Lagos</p>
            <p className="text-white/20 text-[10px] font-mono mt-3">v0.1.0 · Powered by Gemini AI + Mapbox</p>
          </div>
        </section>
      </div>

      {/* Edit Place Modal */}
      <AnimatePresence>
        {editingPlace && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-end justify-center"
            onClick={() => setEditingPlace(null)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 120 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#181614] border border-white/10 rounded-t-[3rem] p-8 pb-12"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black capitalize">
                  {placeConfig.find((p) => p.key === editingPlace)?.emoji}{' '}
                  Set My {editingPlace}
                </h3>
                <button
                  onClick={() => setEditingPlace(null)}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mb-6">
                <SearchInput
                  value={editInput}
                  onChange={setEditInput}
                  placeholder={`Search ${editingPlace} address...`}
                  icon="destination"
                  mapboxToken={MAPBOX_TOKEN}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSavePlace}
                disabled={!editInput.trim()}
                className="w-full bg-[#A3E635] text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Save size={18} />
                Save {editingPlace}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
