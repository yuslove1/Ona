'use client';

import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Navigation, Flag, MapPin, Sparkles, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Step {
  maneuver: {
    instruction: string;
    type: string;
    modifier?: string;
  };
  distance: number;
  duration: number;
  name: string;
}

interface NavigationOverlayProps {
  steps: Step[];
  onEndJourney: () => void;
  destination: string;
}

function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

export default function NavigationOverlay({ steps, onEndJourney, destination }: NavigationOverlayProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStep = steps[currentStepIndex];
  const nextStep = steps[currentStepIndex + 1];
  const progress = (currentStepIndex / steps.length) * 100;

  // Remaining time = sum of durations from currentStep onwards
  const remainingSeconds = steps
    .slice(currentStepIndex)
    .reduce((acc, s) => acc + (s.duration || 0), 0);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      onEndJourney();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col bg-[#0F0D0B] text-white"
    >
      {/* Top Header */}
      <div className="bg-[#1E1B4B] p-6 pt-14 relative overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-0 right-0 w-32 h-32 bg-[#A3E635] rounded-full blur-3xl"
        />

        <div className="flex justify-between items-start mb-5 relative z-10">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-[#A3E635]/60 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
              <Sparkles size={12} fill="currentColor" />
              <span>NAVIGATING TO</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight truncate pr-4">{destination}</h2>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onEndJourney}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 border border-white/10 text-white shrink-0"
          >
            <X size={24} />
          </motion.button>
        </div>

        {/* Step counter + remaining time */}
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-widest">
            <span>Step {currentStepIndex + 1} of {steps.length}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#A3E635] text-xs font-black">
            <Clock size={12} />
            <span>{formatDuration(remainingSeconds)} remaining</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 relative z-10">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Progress</span>
            <span className="text-lg font-black text-[#A3E635]">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
            <motion.div
              className="h-full bg-[#A3E635] rounded-full shadow-[0_0_15px_rgba(163,230,53,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 50 }}
            />
          </div>
        </div>
      </div>

      {/* Main Guidance Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/images/lagos-danfo.jpg')] bg-cover bg-center grayscale" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F0D0B] via-transparent to-[#0F0D0B]" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepIndex}
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.1, opacity: 0, y: -20 }}
            className="relative z-10"
          >
            <div className="w-24 h-24 bg-[#A3E635] text-black rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-[0_20px_50px_rgba(163,230,53,0.3)] border-4 border-white/20">
              <Navigation size={48} fill="currentColor" />
            </div>
            <h3 className="text-3xl font-black leading-tight tracking-tighter mb-4 max-w-sm">
              {currentStep?.maneuver.instruction}
            </h3>
            {currentStep?.distance > 0 && (
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 border border-white/10 rounded-full">
                <MapPin size={16} className="text-[#A3E635]" />
                <span className="text-lg font-black tracking-widest text-[#A3E635]">
                  {currentStep.distance < 1000
                    ? `${Math.round(currentStep.distance)}M`
                    : `${(currentStep.distance / 1000).toFixed(1)}KM`}
                </span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="bg-[#1E1B4B] rounded-t-[3rem] p-8 pb-12 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] border-t border-white/10">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
            <Flag size={12} />
            <span>Coming up next</span>
          </div>
          {nextStep ? (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="p-5 rounded-3xl bg-white/5 border border-white/10 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white/60 shrink-0">
                <ChevronRight size={20} />
              </div>
              <p className="text-sm font-bold text-white/80 leading-snug">
                {nextStep.maneuver.instruction}
              </p>
            </motion.div>
          ) : (
            <div className="p-5 rounded-3xl bg-[#A3E635]/10 border border-[#A3E635]/20 flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#A3E635] flex items-center justify-center text-black shrink-0">
                <Flag size={20} fill="currentColor" />
              </div>
              <p className="text-sm font-black text-[#A3E635]">
                You are almost at your destination!
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <motion.button
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 text-white flex items-center justify-center disabled:opacity-20 transition-all"
          >
            <ChevronLeft size={28} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: '#bef264' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            className="flex-1 h-16 rounded-3xl bg-[#A3E635] text-black font-black tracking-widest text-sm shadow-[0_10px_30px_rgba(163,230,53,0.3)] flex items-center justify-center gap-3"
          >
            {currentStepIndex === steps.length - 1 ? 'FINISH JOURNEY' : 'NEXT STEP'}
            <ChevronRight size={20} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
