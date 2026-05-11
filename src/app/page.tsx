'use client';

import Logo from '@/components/Logo';
import RouteForm from '@/components/RouteForm';
import SearchInput from '@/components/SearchInput';
import { Home as HomeIcon, Briefcase, Plane, Clock, Settings, Bell, X, MapPin, Save } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

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

const quickAccessConfig = [
  { key: 'home' as const, icon: <HomeIcon size={22} />, label: 'Home' },
  { key: 'work' as const, icon: <Briefcase size={22} />, label: 'Work' },
  { key: 'airport' as const, icon: <Plane size={22} />, label: 'Airport' },
];

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function Home() {
  const router = useRouter();
  const { value: savedPlaces, setValue: setSavedPlaces } = useLocalStorage<SavedPlaces>('ona_saved_places', {
    home: null,
    work: null,
    airport: null,
  });
  const { value: tripHistory } = useLocalStorage<TripEntry[]>('ona_trip_history', []);

  // Modal state for setting a quick-access place
  const [settingPlace, setSettingPlace] = useState<keyof SavedPlaces | null>(null);
  const [placeInput, setPlaceInput] = useState('');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
    },
  };

  const handleQuickAccess = (key: keyof SavedPlaces) => {
    const place = savedPlaces[key];
    if (place) {
      // Pre-fill destination and go to results
      const params = new URLSearchParams({ destination: place });
      router.push(`/results?${params.toString()}`);
    } else {
      // Prompt to set the place
      setSettingPlace(key);
      setPlaceInput('');
    }
  };

  const handleSavePlace = () => {
    if (settingPlace && placeInput.trim()) {
      setSavedPlaces({ ...savedPlaces, [settingPlace]: placeInput.trim() });
      setSettingPlace(null);
      setPlaceInput('');
    }
  };

  const handleRecentTrip = (trip: TripEntry) => {
    const params = new URLSearchParams({ origin: trip.origin, destination: trip.destination });
    router.push(`/results?${params.toString()}`);
  };

  return (
    <main className="min-h-screen relative flex flex-col bg-[#0F0D0B] overflow-hidden pb-28">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.15 }}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="absolute inset-0 z-0"
        >
          <Image
            src="/images/lagos-danfo.jpg"
            alt="Lagos Background"
            fill
            className="object-cover grayscale brightness-50"
            priority
          />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[10%] -left-[10%] w-[60%] h-[60%] bg-[#EAB308]/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[120px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F0D0B]/80 via-transparent to-[#0F0D0B]" />
      </div>

      {/* Header */}
      <header className="relative z-20 flex justify-between items-center p-6 backdrop-blur-sm bg-black/10">
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <Logo />
        </motion.div>
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-white/60 hover:text-white transition-colors relative"
          >
            <Bell size={22} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#A3E635] rounded-full" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => router.push('/settings')}
            className="text-white/60 hover:text-white transition-colors"
          >
            <Settings size={22} />
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex-1 flex flex-col justify-center px-6 py-8"
      >
        <div className="max-w-md mx-auto w-full">
          {/* Headline */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-5xl md:text-6xl font-black text-white leading-tight tracking-tight">
              Move <span className="text-[#A3E635]">Smarter</span> <br />
              Through Lagos.
            </h1>
            <p className="text-white/50 mt-4 text-lg font-medium">
              Real-time AI insights for the fastest, safest, and cheapest routes.
            </p>
          </motion.div>

          {/* Route Form */}
          <motion.div
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-xl p-1 rounded-[2.5rem] border border-white/10 shadow-2xl"
          >
            <RouteForm />
          </motion.div>

          {/* Quick Access */}
          <motion.div variants={itemVariants} className="mt-8 grid grid-cols-3 gap-3">
            {quickAccessConfig.map(({ key, icon, label }) => {
              const saved = savedPlaces[key];
              return (
                <motion.button
                  key={key}
                  whileHover={{ y: -4, backgroundColor: 'rgba(255,255,255,0.1)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickAccess(key)}
                  className="flex flex-col items-center gap-2.5 p-4 rounded-3xl bg-white/5 border border-white/10 transition-colors group"
                >
                  <div className="p-3 rounded-2xl bg-white/5 text-white group-hover:bg-white/10 transition-colors shadow-inner">
                    {icon}
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] text-white/40 font-black uppercase tracking-widest">{label}</span>
                    {saved ? (
                      <span className="text-[10px] text-[#A3E635] font-bold truncate max-w-[70px] text-center leading-tight mt-0.5">{saved}</span>
                    ) : (
                      <span className="text-[10px] text-white/20 font-medium mt-0.5">Tap to set</span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Recent Trips */}
          <motion.div variants={itemVariants} className="mt-10">
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2 text-white/40 text-xs font-black uppercase tracking-widest">
                <Clock size={13} />
                <span>Recent Trips</span>
              </div>
              {tripHistory.length > 0 && (
                <button
                  onClick={() => router.push('/settings')}
                  className="text-[#A3E635] text-xs font-bold hover:underline"
                >
                  See All
                </button>
              )}
            </div>

            <div className="space-y-3">
              {tripHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 rounded-2xl bg-white/5 border border-white/5 text-center">
                  <MapPin size={24} className="text-white/10 mb-2" />
                  <p className="text-white/20 text-xs font-bold uppercase tracking-widest">No trips yet</p>
                  <p className="text-white/10 text-[10px] mt-1">Your recent trips will appear here</p>
                </div>
              ) : (
                tripHistory.slice(0, 3).map((trip, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.08)' }}
                    onClick={() => handleRecentTrip(trip)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 cursor-pointer transition-all hover:border-white/10 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#A3E635]/10 flex items-center justify-center text-[#A3E635] shrink-0">
                        <MapPin size={16} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-white font-bold text-sm group-hover:text-[#A3E635] transition-colors truncate max-w-[160px]">
                          {trip.destination}
                        </span>
                        <span className="text-white/30 text-xs">From {trip.origin}</span>
                      </div>
                    </div>
                    <span className="text-white/30 text-[10px] font-bold shrink-0 ml-2">{timeAgo(trip.timestamp)}</span>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Set Place Modal */}
      <AnimatePresence>
        {settingPlace && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-end justify-center"
            onClick={() => setSettingPlace(null)}
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
                <div>
                  <p className="text-[10px] font-black text-[#A3E635]/60 uppercase tracking-widest mb-1">Set Location</p>
                  <h3 className="text-2xl font-black capitalize">
                    {settingPlace === 'airport' ? '✈️' : settingPlace === 'home' ? '🏠' : '💼'}{' '}
                    My {settingPlace}
                  </h3>
                </div>
                <button
                  onClick={() => setSettingPlace(null)}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6">
                <SearchInput
                  value={placeInput}
                  onChange={setPlaceInput}
                  placeholder={`Search your ${settingPlace} address...`}
                  icon="destination"
                  mapboxToken={MAPBOX_TOKEN}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSavePlace}
                disabled={!placeInput.trim()}
                className="w-full bg-[#A3E635] text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                Save {settingPlace}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
