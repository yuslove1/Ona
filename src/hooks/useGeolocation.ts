'use client';

import { useState, useCallback } from 'react';

interface GeolocationState {
  coords: { latitude: number; longitude: number } | null;
  address: string | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation(mapboxToken: string) {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    address: null,
    loading: false,
    error: null,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'Geolocation not supported' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setState(prev => ({ ...prev, coords: { latitude, longitude } }));

        // Reverse geocode using Mapbox
        try {
          const res = await fetch(
            `https://api.mapbox.com/search/searchbox/v1/reverse?longitude=${longitude}&latitude=${latitude}&language=en&access_token=${mapboxToken}`
          );
          const data = await res.json();
          const feature = data.features?.[0];
          const name =
            feature?.properties?.name ||
            feature?.properties?.full_address ||
            `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setState(prev => ({ ...prev, address: name, loading: false }));
        } catch {
          // Fallback: use coordinates as string
          setState(prev => ({
            ...prev,
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            loading: false,
          }));
        }
      },
      (err) => {
        const messages: Record<number, string> = {
          1: 'Location access denied',
          2: 'Location unavailable',
          3: 'Location request timed out',
        };
        setState(prev => ({
          ...prev,
          loading: false,
          error: messages[err.code] || 'Unknown location error',
        }));
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  }, [mapboxToken]);

  return { ...state, requestLocation };
}
