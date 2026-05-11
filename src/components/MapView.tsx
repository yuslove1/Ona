'use client';

import { useEffect, useRef, useState } from 'react';
import Map, { Source, Layer, Marker, MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Navigation, Layers } from 'lucide-react';
import { MapRouteData } from '@/lib/types';
import { motion } from 'framer-motion';

interface MapViewProps {
  origin?: string;
  destination?: string;
  onRouteLoaded?: (data: MapRouteData) => void;
  onError?: (error: string) => void;
}

export default function MapView({ origin, destination, onRouteLoaded, onError }: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState({
    longitude: 3.3792,
    latitude: 6.5244,
    zoom: 11,
  });
  const [routeGeoJSON, setRouteGeoJSON] = useState<GeoJSON.Feature | null>(null);
  const [coords, setCoords] = useState<{ start: [number, number] | null; end: [number, number] | null }>({
    start: null,
    end: null,
  });
  const [mapError, setMapError] = useState<string | null>(null);
  const [showTraffic, setShowTraffic] = useState(false);

  const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!origin || !destination || !MAPBOX_TOKEN) return;

    const fetchRoute = async () => {
      try {
        // 1. Geocode Origin (Lagos bbox)
        const startRes = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(origin)}.json?access_token=${MAPBOX_TOKEN}&bbox=2.6,6.2,4.6,6.8`
        );
        const startData = await startRes.json();
        const startCoord = startData.features[0]?.center;

        // 2. Geocode Destination
        const endRes = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(destination)}.json?access_token=${MAPBOX_TOKEN}&bbox=2.6,6.2,4.6,6.8`
        );
        const endData = await endRes.json();
        const endCoord = endData.features[0]?.center;

        if (startCoord && endCoord) {
          setCoords({ start: startCoord, end: endCoord });

          // 3. Get Directions
          const dirRes = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoord[0]},${startCoord[1]};${endCoord[0]},${endCoord[1]}?geometries=geojson&steps=true&access_token=${MAPBOX_TOKEN}`
          );
          const dirData = await dirRes.json();

          if (dirData.routes?.[0]) {
            const route = dirData.routes[0];
            setRouteGeoJSON({
              type: 'Feature',
              properties: {},
              geometry: route.geometry,
            });

            if (mapRef.current) {
              const bounds: [[number, number], [number, number]] = [
                [Math.min(startCoord[0], endCoord[0]), Math.min(startCoord[1], endCoord[1])],
                [Math.max(startCoord[0], endCoord[0]), Math.max(startCoord[1], endCoord[1])],
              ];
              mapRef.current.fitBounds(bounds, { padding: 80, duration: 2000 });
            }

            if (onRouteLoaded) {
              onRouteLoaded({
                distance: route.distance,
                duration: route.duration,
                geometry: route.geometry,
                steps: route.legs[0].steps,
              });
            }
          } else {
            if (onError) onError('No route found between these locations.');
          }
        } else {
          if (onError) onError('Could not find one or both locations.');
        }
      } catch (error) {
        console.error('Error fetching route:', error);
        if (onError) onError('Failed to calculate route.');
      }
    };

    fetchRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin, destination, MAPBOX_TOKEN]);

  useEffect(() => {
    if (!MAPBOX_TOKEN && onError) {
      onError('Mapbox token is missing');
    }
  }, [MAPBOX_TOKEN, onError]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-b-3xl text-gray-500 text-center p-4">
        <div>
          <p className="font-bold">Map Unavailable</p>
          <p className="text-sm">Please configure NEXT_PUBLIC_MAPBOX_TOKEN</p>
        </div>
      </div>
    );
  }

  if (mapError) {
    let staticMapUrl = '';
    if (MAPBOX_TOKEN) {
      let markers = '';
      if (coords.start && coords.end) {
        markers = `pin-s-a+059669(${coords.start[0]},${coords.start[1]}),pin-s-b+ef4444(${coords.end[0]},${coords.end[1]})`;
      } else if (coords.start) {
        markers = `pin-s-a+059669(${coords.start[0]},${coords.start[1]})`;
      }
      const viewport = markers
        ? 'auto'
        : `${viewState.longitude},${viewState.latitude},${Math.max(0, viewState.zoom - 1)},0`;
      const overlay = markers ? `${markers}/` : '';
      staticMapUrl = `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${overlay}${viewport}/600x400?access_token=${MAPBOX_TOKEN}`;
    }

    return (
      <div className="w-full h-full relative overflow-hidden rounded-b-3xl">
        {staticMapUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={staticMapUrl} alt="Route Map" className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-center p-4">
            <p>Map Error — WebGL support required</p>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur px-2 py-1 rounded text-xs text-gray-600 shadow-sm">
          Static View (WebGL Error)
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden group">
      <Map
        {...viewState}
        ref={mapRef}
        onMove={(evt) => setViewState(evt.viewState)}
        onError={() => setMapError('WebGL initialization failed')}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        attributionControl={false}
      >
        {/* Traffic Layer */}
        {showTraffic && (
          <Source
            id="traffic"
            type="vector"
            url="mapbox://mapbox.mapbox-traffic-v1"
          >
            <Layer
              id="traffic-layer"
              type="line"
              source-layer="traffic"
              paint={{
                'line-width': 3,
                'line-color': [
                  'match',
                  ['get', 'congestion'],
                  'low', '#3de35d',
                  'moderate', '#f5d416',
                  'heavy', '#f56416',
                  'severe', '#e34343',
                  '#cccccc',
                ],
              }}
            />
          </Source>
        )}

        {/* Route Line */}
        {routeGeoJSON && (
          <Source id="route" type="geojson" data={routeGeoJSON}>
            <Layer
              id="route-glow"
              type="line"
              paint={{ 'line-color': '#A3E635', 'line-width': 10, 'line-opacity': 0.2, 'line-blur': 5 }}
            />
            <Layer
              id="route-layer"
              type="line"
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              paint={{ 'line-color': '#A3E635', 'line-width': 4, 'line-opacity': 0.9 }}
            />
          </Source>
        )}

        {/* Origin Marker */}
        {coords.start && (
          <Marker longitude={coords.start[0]} latitude={coords.start[1]} anchor="center">
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full scale-150 blur-sm" />
              <div className="relative w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-2xl border-2 border-black">
                <div className="w-3 h-3 bg-black rounded-full" />
              </div>
            </motion.div>
          </Marker>
        )}

        {/* Destination Marker */}
        {coords.end && (
          <Marker longitude={coords.end[0]} latitude={coords.end[1]} anchor="center">
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 }} className="relative">
              <div className="absolute inset-0 bg-[#A3E635]/30 rounded-full scale-200 blur-md animate-pulse" />
              <div className="relative w-10 h-10 bg-[#A3E635] rounded-full flex items-center justify-center shadow-2xl border-4 border-black">
                <Navigation size={20} className="text-black" fill="currentColor" />
              </div>
            </motion.div>
          </Marker>
        )}
      </Map>

      {/* Map Overlay Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
          <div className="w-2 h-2 bg-[#A3E635] rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-[#A3E635] uppercase tracking-widest">Live Traffic Data</span>
        </div>
      </div>

      {/* Traffic Toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowTraffic((v) => !v)}
        className={`absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md text-[10px] font-black uppercase tracking-widest transition-all ${
          showTraffic
            ? 'bg-[#A3E635] text-black border-[#A3E635]'
            : 'bg-black/60 text-white/60 border-white/10 hover:text-white'
        }`}
      >
        <Layers size={12} />
        Traffic
      </motion.button>
    </div>
  );
}
