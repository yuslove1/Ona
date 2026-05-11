// ─── GPS / Mapbox Step (used for turn-by-turn car navigation) ───────────────
export interface Step {
  maneuver: {
    instruction: string;
    type: string;
    modifier?: string;
  };
  distance: number;
  duration: number;
  name: string;
}

export interface MapRouteData {
  distance: number; // in meters
  duration: number; // in seconds
  geometry: GeoJSON.Geometry;
  steps?: Step[];
}

// ─── Lagos Journey Step (rich local guide format) ───────────────────────────
export type LagosTransportType =
  | 'walk'
  | 'brt'
  | 'danfo'
  | 'keke'
  | 'okada'
  | 'drive'
  | 'uber'
  | 'bolt'
  | 'wait'
  | 'ferry';

export interface LagosStep {
  step_number: number;
  type: LagosTransportType;
  from_location: string;       // "Ojota Garage / Ojota Bus Stop"
  to_location: string;         // "Yaba Bus Stop / Adekunle"
  heading?: string;            // "towards TBS, CMS, or Yaba"
  instruction: string;         // Main human-readable instruction
  what_to_say?: string;        // "Tell the conductor: 'Yaba, Adekunle, or Sabo'"
  route_line?: string;         // "Ojota → Maryland → Yaba → Fadeyi → Adekunle"
  key_stops?: string[];        // Stops to watch for: ["Maryland", "Fadeyi", "Yaba"]
  alight_at?: string;          // "Yaba Bus Stop or Adekunle on Herbert Macaulay Way"
  last_mile?: string;          // "Walk 5–10 min or take keke into Birrel Avenue"
  landmark?: string;           // "Look for Fidelity Bank as your landmark"
  fare?: string;               // "₦300–₦700"
  duration?: string;           // "25–45 minutes depending on traffic"
  tip?: string;                // Safety / local tip for this leg
}

export interface LagosRoute {
  mode: string;                // "Danfo Bus", "Private Car", "Motorcycle (Opay)"
  label: string;               // "BRT – Fastest & Most Direct"
  time: string;                // "30–60 minutes"
  total_fare: string;          // "₦300–₦700"
  stress: 'low' | 'medium' | 'high';
  why_this_route?: string;     // Why this is recommended
  steps: LagosStep[];
}

// ─── Full AI Response ────────────────────────────────────────────────────────
export interface AiResponse {
  recommended_mode: string;
  summary: string;
  reason: string;
  routes: LagosRoute[];
  tips: string[];
}
