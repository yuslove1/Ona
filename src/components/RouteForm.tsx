'use client';

import { ArrowDownUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchInput from '@/components/SearchInput';
import { useGeolocation } from '@/hooks/useGeolocation';

interface RouteFormProps {
  initialOrigin?: string;
  initialDestination?: string;
}

export default function RouteForm({ initialOrigin = '', initialDestination = '' }: RouteFormProps) {
  const router = useRouter();
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [isLoading, setIsLoading] = useState(false);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

  const geo = useGeolocation(MAPBOX_TOKEN);

  // When geolocation resolves, populate the origin field
  const handleUseLocation = async () => {
    geo.requestLocation();
  };

  // Populate once address is resolved
  if (geo.address && origin !== geo.address) {
    setOrigin(geo.address);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (origin && destination) {
      setIsLoading(true);
      const params = new URLSearchParams();
      params.set('origin', origin);
      params.set('destination', destination);
      router.push(`/results?${params.toString()}`);
    }
  };

  const swapLocations = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full p-6 space-y-4">
      <div className="relative space-y-3">
        {/* Origin Input */}
        <SearchInput
          id="origin-input"
          value={origin}
          onChange={setOrigin}
          placeholder="Starting point..."
          icon="origin"
          mapboxToken={MAPBOX_TOKEN}
          onUseLocation={handleUseLocation}
          isLocating={geo.loading}
        />

        {/* Swap Button */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20">
          <motion.button
            type="button"
            aria-label="Swap locations"
            whileHover={{ rotate: 180, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={swapLocations}
            className="p-2 rounded-full bg-[#1E1B4B] text-[#A3E635] border border-white/10 shadow-lg hover:bg-[#2d2a6b] transition-colors"
          >
            <ArrowDownUp size={16} />
          </motion.button>
        </div>

        {/* Destination Input */}
        <SearchInput
          id="destination-input"
          value={destination}
          onChange={setDestination}
          placeholder="Where to?"
          icon="destination"
          mapboxToken={MAPBOX_TOKEN}
        />
      </div>

      {geo.error && (
        <p className="text-rose-400 text-xs font-bold text-center px-2">{geo.error}</p>
      )}

      <motion.button
        type="submit"
        disabled={isLoading || !origin || !destination}
        whileHover={{ scale: 1.02, backgroundColor: '#bef264' }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-[#A3E635] text-black font-black py-5 rounded-[2rem] text-lg shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:shadow-[0_0_30px_rgba(163,230,53,0.5)] transition-all flex items-center justify-center gap-3 relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-5 h-5 border-[3px] border-black/30 border-t-black rounded-full animate-spin" />
              <span>Calculating...</span>
            </motion.div>
          ) : (
            <motion.span
              key="text"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
            >
              Get Smartest Route
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </form>
  );
}
