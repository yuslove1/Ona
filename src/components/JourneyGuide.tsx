'use client';

import { LagosRoute, LagosStep, LagosTransportType } from '@/lib/types';
import {
  X, MapPin, Navigation, Bus, Car, Bike, PersonStanding,
  Clock, Banknote, Landmark, MessageCircle, Route,
  AlertCircle, ChevronRight, Waves, Loader, Flag, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface JourneyGuideProps {
  route: LagosRoute;
  origin: string;
  destination: string;
  onClose: () => void;
}

// ─── Transport Type Config ────────────────────────────────────────────────────
const transportConfig: Record<LagosTransportType, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
}> = {
  walk: {
    label: 'Walk',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/15',
    borderColor: 'border-indigo-500/30',
    icon: <PersonStanding size={18} />,
  },
  brt: {
    label: 'BRT Bus',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/15',
    borderColor: 'border-emerald-500/30',
    icon: <Bus size={18} />,
  },
  danfo: {
    label: 'Danfo',
    color: 'text-[#EAB308]',
    bgColor: 'bg-[#EAB308]/15',
    borderColor: 'border-[#EAB308]/30',
    icon: <Bus size={18} />,
  },
  keke: {
    label: 'Keke',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/15',
    borderColor: 'border-orange-500/30',
    icon: <Navigation size={18} />,
  },
  okada: {
    label: 'Okada / Opay',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/15',
    borderColor: 'border-rose-500/30',
    icon: <Bike size={18} />,
  },
  drive: {
    label: 'Drive',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/15',
    borderColor: 'border-blue-500/30',
    icon: <Car size={18} />,
  },
  uber: {
    label: 'Uber',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/15',
    borderColor: 'border-blue-500/30',
    icon: <Car size={18} />,
  },
  bolt: {
    label: 'Bolt',
    color: 'text-[#34d399]',
    bgColor: 'bg-emerald-500/15',
    borderColor: 'border-emerald-500/30',
    icon: <Car size={18} />,
  },
  wait: {
    label: 'Wait',
    color: 'text-white/40',
    bgColor: 'bg-white/5',
    borderColor: 'border-white/10',
    icon: <Loader size={18} />,
  },
  ferry: {
    label: 'Ferry',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/15',
    borderColor: 'border-cyan-500/30',
    icon: <Waves size={18} />,
  },
};

// ─── Single Step Card ─────────────────────────────────────────────────────────
function StepCard({ step, isLast }: { step: LagosStep; isLast: boolean }) {
  const cfg = transportConfig[step.type] ?? transportConfig.walk;

  return (
    <div className="relative">
      {/* Connector line between steps */}
      {!isLast && (
        <div className="absolute left-[1.6rem] top-[4.5rem] bottom-[-1rem] w-0.5 bg-white/10 z-0" />
      )}

      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: step.step_number * 0.08 }}
        className="relative z-10 flex gap-4 mb-4"
      >
        {/* Step Icon */}
        <div className={`w-14 h-14 rounded-2xl ${cfg.bgColor} border ${cfg.borderColor} flex flex-col items-center justify-center shrink-0`}>
          <span className={cfg.color}>{cfg.icon}</span>
          <span className="text-[8px] font-black text-white/30 uppercase mt-0.5">{step.step_number}</span>
        </div>

        {/* Step Content */}
        <div className="flex-1 min-w-0">
          {/* Transport + Location Header */}
          <div className="mb-3">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>
                {cfg.label}
              </span>
              {step.fare && (
                <span className="flex items-center gap-1 text-[10px] font-black text-white/30 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                  <Banknote size={9} /> {step.fare}
                </span>
              )}
              {step.duration && (
                <span className="flex items-center gap-1 text-[10px] font-black text-white/30 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                  <Clock size={9} /> {step.duration}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-white/40 text-xs">
              <MapPin size={10} className="shrink-0" />
              <span className="font-bold text-white/70">{step.from_location}</span>
              <ChevronRight size={10} className="shrink-0" />
              <span className="font-semibold truncate">{step.to_location}</span>
            </div>
          </div>

          {/* Main Instruction */}
          <div className="bg-white/[0.04] rounded-2xl p-4 border border-white/[0.07] mb-3">
            <p className="text-white/90 text-sm leading-relaxed font-medium">{step.instruction}</p>

            {/* Heading */}
            {step.heading && (
              <div className="flex items-center gap-2 mt-3 text-[#A3E635]">
                <Navigation size={12} className="shrink-0" />
                <p className="text-xs font-bold">Heading: {step.heading}</p>
              </div>
            )}
          </div>

          {/* ── WHAT TO SAY — the most important element ── */}
          {step.what_to_say && (
            <div className="bg-[#A3E635]/10 border border-[#A3E635]/25 rounded-2xl p-4 mb-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#A3E635] text-black text-[8px] font-black px-2 py-0.5 rounded-bl-xl uppercase tracking-widest">
                Say This
              </div>
              <div className="flex items-start gap-3">
                <MessageCircle size={16} className="text-[#A3E635] shrink-0 mt-0.5" />
                <p className="text-[#A3E635] text-sm font-bold leading-relaxed">
                  &ldquo;{step.what_to_say}&rdquo;
                </p>
              </div>
            </div>
          )}

          {/* Route Line */}
          {step.route_line && (
            <div className="flex items-start gap-2 mb-3 bg-white/5 rounded-xl p-3 border border-white/10">
              <Route size={13} className="text-white/40 shrink-0 mt-0.5" />
              <p className="text-white/60 text-xs font-mono font-bold">{step.route_line}</p>
            </div>
          )}

          {/* Key Stops */}
          {step.key_stops && step.key_stops.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Flag size={9} /> Watch for these stops
              </p>
              <div className="flex flex-wrap gap-2">
                {step.key_stops.map((stop, i) => (
                  <span
                    key={i}
                    className="text-xs font-bold text-white/70 bg-white/5 border border-white/10 px-3 py-1 rounded-full"
                  >
                    {stop}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Alight At */}
          {step.alight_at && (
            <div className="flex items-start gap-2 mb-3 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
              <MapPin size={13} className="text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] font-black text-rose-400/60 uppercase tracking-widest mb-0.5">Alight at</p>
                <p className="text-rose-300 text-xs font-bold">{step.alight_at}</p>
              </div>
            </div>
          )}

          {/* Landmark */}
          {step.landmark && (
            <div className="flex items-start gap-2 mb-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
              <Landmark size={13} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-amber-300 text-xs font-semibold leading-relaxed">{step.landmark}</p>
            </div>
          )}

          {/* Last Mile */}
          {step.last_mile && (
            <div className="flex items-start gap-2 mb-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3">
              <PersonStanding size={13} className="text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] font-black text-indigo-400/60 uppercase tracking-widest mb-0.5">Last Mile</p>
                <p className="text-indigo-300 text-xs font-semibold leading-relaxed">{step.last_mile}</p>
              </div>
            </div>
          )}

          {/* Local Tip */}
          {step.tip && (
            <div className="flex items-start gap-2 bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
              <AlertCircle size={13} className="text-white/30 shrink-0 mt-0.5" />
              <p className="text-white/40 text-[11px] leading-relaxed italic">{step.tip}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main JourneyGuide Component ─────────────────────────────────────────────
export default function JourneyGuide({ route, origin, destination, onClose }: JourneyGuideProps) {
  const stressColors = {
    low: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    medium: { text: 'text-[#EAB308]', bg: 'bg-[#EAB308]/10', border: 'border-[#EAB308]/20' },
    high: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  };
  const sc = stressColors[route.stress] ?? stressColors.medium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 60 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="fixed inset-0 z-[100] bg-[#0F0D0B] text-white flex flex-col"
    >
      {/* ── Sticky Header ── */}
      <div className="bg-[#1E1B4B] px-6 pt-14 pb-6 border-b border-white/10 relative overflow-hidden shrink-0">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-0 right-0 w-40 h-40 bg-[#A3E635] rounded-full blur-3xl"
        />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 text-[#A3E635]/60 text-[9px] font-black uppercase tracking-[0.25em] mb-1">
                <Sparkles size={10} fill="currentColor" />
                <span>Lagos Journey Guide</span>
              </div>
              <h2 className="text-xl font-black tracking-tight leading-tight">{route.label}</h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white shrink-0"
            >
              <X size={22} />
            </motion.button>
          </div>

          {/* Origin → Destination */}
          <div className="flex items-center gap-2 text-xs mb-4">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full max-w-[40%]">
              <div className="w-2 h-2 bg-white rounded-full shrink-0" />
              <span className="truncate font-bold text-white/80">{origin}</span>
            </div>
            <ChevronRight size={14} className="text-[#A3E635] shrink-0" />
            <div className="flex items-center gap-1.5 bg-[#A3E635]/20 px-3 py-1.5 rounded-full max-w-[40%]">
              <Navigation size={10} className="text-[#A3E635] shrink-0" fill="currentColor" />
              <span className="truncate font-bold text-[#A3E635]">{destination}</span>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/5 rounded-xl p-2.5 text-center border border-white/10">
              <Clock size={14} className="text-[#A3E635] mx-auto mb-1" />
              <p className="text-[9px] text-white/30 font-black uppercase tracking-wider">Time</p>
              <p className="text-xs font-black text-white leading-tight">{route.time}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 text-center border border-white/10">
              <Banknote size={14} className="text-[#A3E635] mx-auto mb-1" />
              <p className="text-[9px] text-white/30 font-black uppercase tracking-wider">Fare</p>
              <p className="text-xs font-black text-white leading-tight">{route.total_fare}</p>
            </div>
            <div className={`rounded-xl p-2.5 text-center border ${sc.bg} ${sc.border}`}>
              <AlertCircle size={14} className={`${sc.text} mx-auto mb-1`} />
              <p className="text-[9px] text-white/30 font-black uppercase tracking-wider">Stress</p>
              <p className={`text-xs font-black leading-tight capitalize ${sc.text}`}>{route.stress}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scrollable Steps ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6">
          {/* Why this route */}
          {route.why_this_route && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-[#A3E635]/5 border border-[#A3E635]/15 rounded-2xl p-4 flex gap-3"
            >
              <Sparkles size={16} className="text-[#A3E635] shrink-0 mt-0.5" />
              <p className="text-white/70 text-sm leading-relaxed">{route.why_this_route}</p>
            </motion.div>
          )}

          {/* Steps */}
          <div className="mb-6">
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
              <Route size={10} />
              Step-by-step Guide
            </p>
            {route.steps.map((step, idx) => (
              <StepCard
                key={step.step_number}
                step={step}
                isLast={idx === route.steps.length - 1}
              />
            ))}
          </div>

          {/* Destination Reached */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: route.steps.length * 0.08 + 0.2 }}
            className="bg-[#A3E635]/10 border border-[#A3E635]/25 rounded-3xl p-6 text-center mb-6"
          >
            <div className="w-14 h-14 bg-[#A3E635] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Navigation size={28} className="text-black" fill="currentColor" />
            </div>
            <p className="text-[9px] font-black text-[#A3E635]/50 uppercase tracking-[0.3em] mb-1">Destination</p>
            <p className="text-white font-black text-lg">{destination}</p>
            <p className="text-white/40 text-xs mt-1">You have arrived! 🎉</p>
          </motion.div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="shrink-0 px-6 py-5 border-t border-white/10 bg-black/40 backdrop-blur-xl">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          className="w-full bg-white/10 border border-white/10 text-white font-black py-4 rounded-2xl text-sm tracking-widest"
        >
          ← BACK TO ROUTES
        </motion.button>
      </div>
    </motion.div>
  );
}
