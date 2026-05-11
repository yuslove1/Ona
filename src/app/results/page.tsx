'use client';

import MapView from '@/components/MapView';
import RouteCard from '@/components/RouteCard';
import JourneyGuide from '@/components/JourneyGuide';
import {
  ChevronLeft, MoreVertical, ExternalLink, MapIcon,
  Info, Sparkles, Share2, Check,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, Suspense } from 'react';
import { AiResponse, LagosRoute, MapRouteData } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface TripEntry {
  origin: string;
  destination: string;
  timestamp: number;
}

// ─── Inner page (uses useSearchParams — must be inside Suspense) ──────────────
function ResultsContent() {
  const searchParams = useSearchParams();
  const origin = searchParams.get('origin') || '';
  const destination = searchParams.get('destination') || '';

  const [loading, setLoading] = useState(true);
  const [aiData, setAiData] = useState<AiResponse | null>(null);
  const [routeData, setRouteData] = useState<MapRouteData | null>(null);
  const [activeGuide, setActiveGuide] = useState<LagosRoute | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shared, setShared] = useState(false);
  const tripSaved = useRef(false);

  const { setValue: setTripHistory } = useLocalStorage<TripEntry[]>('ona_trip_history', []);

  // Save trip once AI data arrives
  useEffect(() => {
    if (aiData && origin && destination && !tripSaved.current) {
      tripSaved.current = true;
      const newEntry: TripEntry = { origin, destination, timestamp: Date.now() };
      setTripHistory((prev) => {
        const filtered = prev.filter(
          (t) => !(t.origin === origin && t.destination === destination)
        );
        return [newEntry, ...filtered].slice(0, 5);
      });
      // Save for ai-insights page
      sessionStorage.setItem('ona_ai_data', JSON.stringify(aiData));
      sessionStorage.setItem('ona_route_params', JSON.stringify({ origin, destination }));
    }
  }, [aiData, origin, destination, setTripHistory]);

  // Fetch AI insights once map route is loaded
  useEffect(() => {
    if (origin && destination && routeData) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const fetchAiInsights = async () => {
        try {
          const preferences = (() => {
            try {
              return JSON.parse(localStorage.getItem('ona_preferences') || '{}');
            } catch { return {}; }
          })();

          const res = await fetch('/api/ai/route-insight', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ origin, destination, routeData, preferences }),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          if (!res.ok) throw new Error('AI API failed');
          const data: AiResponse = await res.json();
          setAiData(data);
        } catch (err) {
          console.error('AI insights failed:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchAiInsights();
      return () => controller.abort();
    } else if (!origin || !destination) {
      setLoading(false);
    }
  }, [origin, destination, routeData]);

  const handleRouteLoaded = (data: MapRouteData) => setRouteData(data);
  const handleMapError = (errMsg: string) => {
    setError(errMsg);
    setLoading(false);
  };

  const handleOpenMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
    window.open(url, '_blank');
  };

  const handleShareRoute = async () => {
    const shareUrl = `${window.location.origin}/results?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `ONA Route: ${origin} → ${destination}`, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      }
    } catch { /* cancelled */ }
  };

  // Fallback route if AI returns nothing
  const displayRoutes: (LagosRoute & { id: string })[] =
    aiData?.routes.map((r, idx) => ({ ...r, id: idx.toString() })) ?? [];

  return (
    <main className="min-h-screen bg-[#0F0D0B] text-white overflow-x-hidden">

      {/* Journey Guide Overlay */}
      <AnimatePresence>
        {activeGuide && (
          <JourneyGuide
            route={activeGuide}
            origin={origin}
            destination={destination}
            onClose={() => setActiveGuide(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 bg-black/40 backdrop-blur-2xl p-4 flex justify-between items-center z-40 border-b border-white/10">
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <ChevronLeft size={24} />
            </Link>
          </motion.div>
          <div className="min-w-0">
            <h1 className="text-xs font-black uppercase tracking-widest text-[#A3E635]">Routes</h1>
            <p className="text-[10px] text-white/40 font-bold truncate max-w-[160px]">{origin} → {destination}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleShareRoute}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10">
            <AnimatePresence mode="wait">
              {shared
                ? <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }}><Check size={18} className="text-[#A3E635]" /></motion.div>
                : <motion.div key="share" initial={{ scale: 0 }} animate={{ scale: 1 }}><Share2 size={18} /></motion.div>
              }
            </AnimatePresence>
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10">
            <MoreVertical size={20} />
          </motion.button>
        </div>
      </header>

      {/* ── Map ── */}
      <div className="relative h-[45vh] w-full pt-16">
        <MapView origin={origin} destination={destination} onRouteLoaded={handleRouteLoaded} onError={handleMapError} />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0F0D0B] via-transparent to-transparent" />
        <div className="absolute bottom-10 right-5 pointer-events-auto">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleOpenMaps}
            className="bg-[#A3E635] text-black px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 font-black text-[11px] tracking-widest">
            <ExternalLink size={13} /> GOOGLE MAPS
          </motion.button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 px-5 -mt-6 pb-20">

        {/* AI Summary Badge */}
        {aiData && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="bg-[#1E1B4B] border border-[#A3E635]/20 rounded-3xl p-4 mb-7 flex items-center gap-3 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-1 bg-[#A3E635] text-black rounded-bl-xl">
              <Sparkles size={11} fill="currentColor" />
            </div>
            <div className="w-11 h-11 rounded-2xl bg-[#A3E635]/10 flex items-center justify-center text-[#A3E635] shrink-0">
              <Info size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black uppercase tracking-tighter text-[#A3E635]/60 mb-0.5">ONA Recommends</p>
              <p className="text-xs font-bold leading-snug">
                <span className="text-[#A3E635]">{aiData.recommended_mode}</span>
                {' '}&mdash; {aiData.reason?.slice(0, 90)}{aiData.reason?.length > 90 ? '...' : ''}
              </p>
            </div>
          </motion.div>
        )}

        {/* Route Cards */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-black tracking-tight">Your Options</h2>
            {!loading && displayRoutes.length > 0 && (
              <div className="flex items-center gap-1.5 text-white/30 text-[10px] font-black uppercase tracking-widest">
                <MapIcon size={11} /> {displayRoutes.length} routes
              </div>
            )}
          </div>

          {error ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="text-center py-12 bg-rose-500/10 border border-rose-500/20 rounded-[2.5rem] p-8">
              <p className="font-black text-rose-400 mb-2">Navigation Error</p>
              <p className="text-sm text-rose-400/60 mb-6">{error}</p>
              <button onClick={() => window.location.reload()}
                className="px-8 py-3 bg-rose-500 text-white rounded-full text-xs font-black uppercase tracking-widest">
                Retry
              </button>
            </motion.div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-5">
              <div className="relative">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 border-4 border-[#A3E635]/20 border-t-[#A3E635] rounded-full" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 flex items-center justify-center text-[#A3E635]">
                  <Sparkles size={22} />
                </motion.div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-white/50 text-xs font-black uppercase tracking-[0.2em] animate-pulse">
                  Building your Lagos guide...
                </p>
                <p className="text-white/20 text-[10px]">Tap boarding points, fares & local tips</p>
              </div>
            </div>
          ) : (
            <motion.div initial="hidden" animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
              {displayRoutes.length > 0 ? (
                displayRoutes.map((route) => (
                  <motion.div key={route.id} variants={{ hidden: { x: -20, opacity: 0 }, visible: { x: 0, opacity: 1 } }}>
                    <RouteCard
                      route={route}
                      onViewGuide={() => setActiveGuide(route)}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 text-white/20 font-black uppercase tracking-widest bg-white/5 rounded-[2.5rem] border border-white/10">
                  No Routes Found
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Pro Tips */}
        {aiData?.tips && aiData.tips.length > 0 && (
          <motion.div initial={{ y: 40, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="mt-4">
            <h3 className="text-base font-black mb-4 flex items-center gap-2">
              <Sparkles className="text-[#A3E635]" size={16} />
              Pro Tips for This Journey
            </h3>
            <div className="space-y-3">
              {aiData.tips.map((tip, idx) => (
                <motion.div key={idx} whileHover={{ scale: 1.01 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-3 items-start">
                  <div className="w-7 h-7 bg-[#A3E635]/10 rounded-xl flex items-center justify-center text-[#A3E635] shrink-0 font-black text-xs">
                    {idx + 1}
                  </div>
                  <p className="text-white/60 text-xs font-medium leading-relaxed pt-0.5">{tip}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}

// ─── Page Export with Suspense boundary ──────────────────────────────────────
export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0F0D0B] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#A3E635]/20 border-t-[#A3E635] rounded-full animate-spin" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
