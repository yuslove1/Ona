'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Navigation, Locate, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

interface Suggestion {
  mapbox_id: string;
  name: string;
  place_formatted: string;
  full_address?: string;
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: 'origin' | 'destination';
  mapboxToken: string;
  onUseLocation?: () => void;
  isLocating?: boolean;
  id?: string;
}

// One session token per component mount (for Mapbox billing)
const SESSION_TOKEN = uuidv4();

export default function SearchInput({
  value,
  onChange,
  placeholder,
  icon,
  mapboxToken,
  onUseLocation,
  isLocating = false,
  id,
}: SearchInputProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions from Mapbox Search Box API
  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (!query.trim() || query.length < 2 || !mapboxToken) {
        setSuggestions([]);
        return;
      }
      setIsFetching(true);
      try {
        const params = new URLSearchParams({
          q: query,
          language: 'en',
          limit: '5',
          country: 'NG',
          bbox: '2.6,6.2,4.6,6.8', // Lagos bounding box
          session_token: SESSION_TOKEN,
          access_token: mapboxToken,
        });
        const res = await fetch(
          `https://api.mapbox.com/search/searchbox/v1/suggest?${params}`
        );
        if (!res.ok) throw new Error('Suggestions fetch failed');
        const data = await res.json();
        setSuggestions(data.suggestions || []);
        setShowDropdown(true);
      } catch {
        setSuggestions([]);
      } finally {
        setIsFetching(false);
      }
    },
    [mapboxToken]
  );

  // Debounced input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    setActiveIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  };

  // Select a suggestion
  const handleSelect = (suggestion: Suggestion) => {
    const displayName = suggestion.name || suggestion.place_formatted;
    onChange(displayName);
    setSuggestions([]);
    setShowDropdown(false);
    setActiveIndex(-1);
  };

  // Clear input
  const handleClear = () => {
    onChange('');
    setSuggestions([]);
    setShowDropdown(false);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isOrigin = icon === 'origin';

  return (
    <div ref={wrapperRef} className="relative w-full group">
      {/* Icon */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3E635] z-10 group-focus-within:scale-110 transition-transform pointer-events-none">
        {isOrigin ? <MapPin size={20} /> : <Navigation size={20} />}
      </div>

      <input
        id={id}
        type="text"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) setShowDropdown(true);
        }}
        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-20 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#A3E635]/50 focus:bg-white/10 transition-all"
      />

      {/* Right side: spinner / clear / locate */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
        {isFetching && (
          <Loader2 size={16} className="text-white/40 animate-spin" />
        )}
        {value && !isFetching && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={handleClear}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors"
          >
            <X size={14} />
          </motion.button>
        )}
        {isOrigin && onUseLocation && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onUseLocation}
            disabled={isLocating}
            title="Use my current location"
            className="p-2 rounded-full bg-[#A3E635]/10 border border-[#A3E635]/20 text-[#A3E635] hover:bg-[#A3E635]/20 transition-colors disabled:opacity-50"
          >
            {isLocating ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Locate size={15} />
            )}
          </motion.button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showDropdown && suggestions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#1a1815] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50"
          >
            {suggestions.map((s, idx) => (
              <motion.li
                key={s.mapbox_id}
                whileHover={{ backgroundColor: 'rgba(163,230,53,0.08)' }}
                onClick={() => handleSelect(s)}
                className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors border-b border-white/5 last:border-0 ${
                  activeIndex === idx ? 'bg-[#A3E635]/10' : ''
                }`}
              >
                <div className="mt-0.5 w-7 h-7 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <MapPin size={13} className="text-[#A3E635]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold truncate">{s.name}</p>
                  <p className="text-white/40 text-xs truncate mt-0.5">
                    {s.place_formatted}
                  </p>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
