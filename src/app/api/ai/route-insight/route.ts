import { NextResponse } from 'next/server';

// ─── Lagos time context ───────────────────────────────────────────────────────
function getLagosTimeContext() {
  const now = new Date(Date.now() + 60 * 60 * 1000); // WAT = UTC+1
  const hours = now.getUTCHours();
  const minutes = now.getUTCMinutes();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const day = dayNames[now.getUTCDay()];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  const timeStr = `${h12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  const isPeakMorning = hours >= 7 && hours < 9;
  const isPeakEvening = hours >= 16 && hours < 19;
  const isNight = hours >= 22 || hours < 5;
  const isWeekend = now.getUTCDay() === 0 || now.getUTCDay() === 6;
  let trafficContext: string;
  if (isPeakMorning) trafficContext = 'PEAK MORNING RUSH (7–9 AM) — heavy traffic on expressways';
  else if (isPeakEvening) trafficContext = 'PEAK EVENING RUSH (4–7 PM) — Lagos traffic at its worst';
  else if (isNight) trafficContext = 'LATE NIGHT — roads mostly clear but safety awareness needed';
  else if (isWeekend) trafficContext = 'WEEKEND — lighter traffic, markets may be busy';
  else trafficContext = 'OFF-PEAK — moderate traffic, good time to travel';
  return { day, timeStr, trafficContext, isWeekend, isPeak: isPeakMorning || isPeakEvening, isNight };
}

// ─── AI Prompt (shared for both Gemini and OpenAI) ───────────────────────────
function buildPrompt(origin: string, destination: string, routeData: unknown, timeCtx: ReturnType<typeof getLagosTimeContext>, preferences?: Record<string, boolean>) {
  const prefContext = preferences
    ? `User preferences: ${preferences.preferPublicTransport ? 'Prefers public transport. ' : ''}${preferences.avoidHighStress ? 'Wants to avoid high-stress routes.' : ''}`
    : '';

  return `You are ONA — a Lagos, Nigeria navigation expert with deep local knowledge. Think of yourself as a knowledgeable Lagos friend who knows every bus stop, motor park, keke route, and shortcut in the city.

TASK: Create a detailed, Lagos-local journey guide from "${origin}" to "${destination}".

CURRENT CONTEXT:
- Day: ${timeCtx.day}
- Time in Lagos (WAT): ${timeCtx.timeStr}
- Traffic: ${timeCtx.trafficContext}
- Route Distance/Duration: ${JSON.stringify(routeData)}
${prefContext}

INSPIRATION — Match or exceed this quality and specificity:
"At Ojota Garage / Ojota Bus Stop (near the Ikorodu Road corridor): Board a BRT bus heading towards TBS (Tafawa Balewa Square), CMS, or Yaba. These buses ply the route: Ojota → Maryland → Yaba (or further to Fadeyi/Adekunle). Tell the conductor or driver you are going to Yaba, Adekunle, or Sabo. Alight at Yaba Bus Stop or preferably Adekunle (on Herbert Macaulay Way). Walk a short distance (5–10 minutes) or take a quick keke (tricycle) or okada (bike) into Birrel Avenue. Look for Fidelity Bank as a landmark. Fare: Around ₦300–₦700."

Return a JSON object with EXACTLY this schema:
{
  "recommended_mode": "string",
  "summary": "string",
  "reason": "string",
  "routes": [
    {
      "mode": "string",
      "label": "string",
      "time": "string",
      "total_fare": "string",
      "stress": "low" | "medium" | "high",
      "why_this_route": "string",
      "steps": [
        {
          "step_number": number,
          "type": "walk" | "brt" | "danfo" | "keke" | "okada" | "drive" | "uber" | "bolt" | "wait" | "ferry",
          "from_location": "string — specific named Lagos place, bus stop, or motor park",
          "to_location": "string — specific named destination stop or area",
          "heading": "string — optional, e.g. 'towards TBS, CMS, or Yaba'",
          "instruction": "string — full human-readable instruction as if explaining to a Lagos friend",
          "what_to_say": "string — EXACT words to tell conductor/driver (required for bus/danfo/keke/okada steps)",
          "route_line": "string — route using → arrows e.g. 'Ojota → Maryland → Yaba'",
          "key_stops": ["array of specific named stops to watch for"],
          "alight_at": "string — exactly where to get off with street/landmark context",
          "last_mile": "string — walk/keke/okada instructions with cost for final stretch",
          "landmark": "string — specific visible landmark",
          "fare": "string — fare for this leg in Naira",
          "duration": "string — time for this leg",
          "tip": "string — practical Lagos safety or local tip"
        }
      ]
    }
  ],
  "tips": ["4–5 Lagos-specific practical tips considering current time"]
}

STRICT REQUIREMENTS:
1. Return EXACTLY 3 routes: (1) Public Transport Danfo/BRT, (2) Uber/Bolt/Private Car, (3) Motorcycle/Okada
2. Use REAL Lagos place names, motor parks, bus stops, and known landmarks
3. Every bus/danfo step MUST have "what_to_say" with exact conductor words
4. Every bus step MUST have "route_line" with actual Lagos stops using arrows
5. Every bus step MUST have "key_stops" with real named stops
6. Every bus step MUST have "alight_at" with specific named location
7. Include keke/okada for last-mile legs
8. Fares must be realistic 2024–2025 Lagos prices in Naira
9. Steps flow: walk to boarding → board → key stops → alight → last mile → destination
10. Tips must reference current time (${timeCtx.timeStr}) and day (${timeCtx.day})
11. Return ONLY the JSON — no markdown, no code blocks`;
}

// ─── Enhanced smart mock — real Lagos knowledge when AI is unavailable ────────
function buildSmartMock(origin: string, destination: string, routeData: { duration?: number; distance?: number } | null, timeCtx: ReturnType<typeof getLagosTimeContext>) {
  const driveMins = Math.round((routeData?.duration || 2400) / 60);
  const dist = routeData?.distance || 12000;
  const distKm = (dist / 1000).toFixed(1);

  const o = origin.trim();
  const d = destination.trim();

  // Detect area context for better landmark/route suggestions
  const isLekki = /lekki|ajah|chevron|sangotedo|abraham|ikate/i.test(o + d);
  const isVI = /victoria|vi\b|eko|marina|bar beach|onikan/i.test(o + d);
  const isIsland = isLekki || isVI || /island|ikoyi|lekki/i.test(o + d);
  const isYaba = /yaba|sabo|adekunle|herbert|akoka/i.test(o + d);
  const isIkeja = /ikeja|oshodi|ojota|ojodu|ogba|agege/i.test(o + d);
  const isLagosIsland = /lagos island|idumota|balogun|broad|tinubu/i.test(o + d);

  // Build contextual boarding info
  let transitBoard = `the nearest Danfo/BRT garage or bus stop`;
  let transitRoute = `${o} → [Key Junctions] → ${d}`;
  let transitKey: string[] = ['Watch your surroundings', 'Ask conductor when approaching'];
  let transitAlight = `a bus stop near ${d} — ask the conductor`;
  let transitHeading = `towards ${d}`;
  let transitDuration = `${Math.round(driveMins * 1.3)}–${Math.round(driveMins * 1.8)} mins`;
  let danfoBoard = o;
  let danfoFare = '₦300–₦600';
  let lastMileOpt = 'Walk 5–10 mins or take a keke (₦100–₦200) for the final stretch';

  if (isIsland && !isLekki) {
    transitBoard = 'CMS Bus Stop or TBS (Tafawa Balewa Square)';
    transitRoute = `${o} → CMS → Lagos Island → Marina → ${d}`;
    transitKey = ['CMS', 'Marina', 'Broad Street', 'Onikan'];
    transitAlight = `Closest bus stop to ${d} on Lagos Island`;
    transitHeading = 'towards CMS / Lagos Island';
    danfoBoard = 'CMS or Marina area';
    danfoFare = '₦400–₦800';
  } else if (isLekki) {
    transitBoard = 'Lekki Phase 1 Bus Stop (Admiralty Way) or Jakande Bus Stop';
    transitRoute = `${o} → Lekki Phase 1 → Lekki-Epe Expressway → Ajah → ${d}`;
    transitKey = ['Lekki Phase 1', 'Chevron', 'Jakande', 'Ajah'];
    transitAlight = `Bus stop closest to ${d} — ask the driver`;
    transitHeading = 'along the Lekki-Epe Expressway';
    danfoBoard = 'Lekki Phase 1 or Admiralty Way';
    danfoFare = '₦500–₦900';
  } else if (isYaba) {
    transitBoard = 'Yaba Bus Stop (on Herbert Macaulay Way) or Sabo junction';
    transitRoute = `${o} → Fadeyi → Yaba → Herbert Macaulay Way → Sabo → ${d}`;
    transitKey = ['Fadeyi', 'Yaba Bus Stop', 'Adekunle', 'Sabo'];
    transitAlight = 'Yaba Bus Stop or Adekunle — on Herbert Macaulay Way';
    transitHeading = 'towards Yaba / Adekunle';
    danfoBoard = 'Sabo junction or Yaba Motor Park';
    danfoFare = '₦200–₦500';
    lastMileOpt = 'Walk 5–10 mins into the street or take keke from Sabo junction (₦100–₦150)';
  } else if (isIkeja) {
    transitBoard = 'Ojota Bus Stop / Ojota Garage (Ikorodu Road corridor)';
    transitRoute = `${o} → Ojota → Maryland → Ikeja → ${d}`;
    transitKey = ['Ojota', 'Maryland', 'Allen Avenue', 'Ikeja'];
    transitAlight = 'Allen Avenue Bus Stop or Ikeja Under Bridge';
    transitHeading = 'towards Ikeja / Maryland';
    danfoBoard = 'Ojota Garage or Ikorodu Road bus stop';
    danfoFare = '₦300–₦600';
    lastMileOpt = 'Take a keke from Allen junction (₦100–₦200) or walk 5–10 mins';
  } else if (isLagosIsland) {
    transitBoard = 'CMS Ferry Terminal or Idumota Bus Stop';
    transitRoute = `${o} → Oshodi → Lagos Bridge → CMS → Idumota → ${d}`;
    transitKey = ['Oshodi', 'Lagos Bridge', 'CMS', 'Idumota', 'Balogun'];
    transitAlight = 'Idumota or Balogun Bus Stop';
    transitHeading = 'towards Lagos Island / CMS';
    danfoBoard = 'Oshodi or Mile 2 terminal';
    danfoFare = '₦300–₦700';
  }

  const uberFare = `₦${Math.round(dist / 1000 * 220).toLocaleString()}–₦${Math.round(dist / 1000 * 380).toLocaleString()}`;
  const okadaTime = `${Math.round(driveMins * 0.45)}–${Math.round(driveMins * 0.65)} mins`;
  const okadaFare = `₦${Math.round(dist / 1000 * 120).toLocaleString()}–₦${Math.round(dist / 1000 * 200).toLocaleString()}`;

  return {
    recommended_mode: timeCtx.isPeak ? 'Public Transport (BRT/Danfo)' : 'Uber / Bolt',
    summary: `Journey from ${o} to ${d} — approximately ${distKm}km. ${timeCtx.trafficContext}.`,
    reason: timeCtx.isPeak
      ? `It is currently ${timeCtx.timeStr} on ${timeCtx.day} — peak traffic hours. Public transport or motorcycles will beat gridlock better than private cars.`
      : `Off-peak travel on ${timeCtx.day} at ${timeCtx.timeStr}. Uber or Bolt offers the most comfortable option, while Danfo is the budget-friendly choice.`,
    routes: [
      {
        mode: 'Danfo / BRT Bus',
        label: 'Public Transport — Budget & Local',
        time: transitDuration,
        total_fare: danfoFare,
        stress: 'medium' as const,
        why_this_route: `Most affordable option. ${timeCtx.isPeak ? 'BRT buses use dedicated lanes, bypassing some of the gridlock.' : 'Good time to use public transport — less crowded than peak hours.'} Best for budget-conscious travellers.`,
        steps: [
          {
            step_number: 1,
            type: 'walk' as const,
            from_location: o,
            to_location: transitBoard,
            instruction: `Walk from ${o} to ${transitBoard}. If you are unsure of the exact location, ask any roadside vendor, okada rider, or pedestrian — Lagosians are generally very helpful with directions.`,
            duration: '3–7 minutes',
            tip: `If you cannot locate the bus stop, open Google Maps and search for "${transitBoard}" to walk the final stretch.`,
          },
          {
            step_number: 2,
            type: 'danfo' as const,
            from_location: danfoBoard,
            to_location: `Bus stop near ${d}`,
            heading: transitHeading,
            instruction: `At ${danfoBoard}, board a Danfo bus or BRT heading ${transitHeading}. Look at the destination card displayed on the bus windshield or shout to confirm with the conductor before boarding.`,
            what_to_say: `Tell the conductor: "I dey go ${d} — you pass there?" They will confirm and alert you before your stop.`,
            route_line: transitRoute,
            key_stops: transitKey,
            alight_at: transitAlight,
            fare: danfoFare,
            duration: transitDuration,
            tip: `Have your fare ready in small notes (₦100–₦500). Do NOT show large bills. Keep your bag on your lap, not on the overhead rack or floor.`,
          },
          {
            step_number: 3,
            type: 'walk' as const,
            from_location: transitAlight,
            to_location: d,
            instruction: `From where you alight, make your way towards ${d}. If it is a building or compound inside a street, ask a nearby keke rider or pedestrian for the exact address.`,
            last_mile: lastMileOpt,
            landmark: `Look for any prominent landmark near ${d} — a bank, petrol station, church, or mosque — and use that as your navigation anchor.`,
            duration: '5–10 minutes',
            tip: `Google Maps works well for the final walking stretch once you are in the general area. Screenshot your route before leaving in case you lose data.`,
          },
        ],
      },
      {
        mode: 'Uber / Bolt',
        label: 'Ride-hailing — Comfortable & Direct',
        time: `${driveMins}–${Math.round(driveMins * 1.5)} mins`,
        total_fare: uberFare,
        stress: 'low' as const,
        why_this_route: `Most comfortable door-to-door option. No transfers, no conductors. Best if you are with luggage, unfamiliar with the area, or travelling at night. ${timeCtx.isNight ? 'RECOMMENDED for night travel — safer than public transport.' : ''}`,
        steps: [
          {
            step_number: 1,
            type: 'uber' as const,
            from_location: o,
            to_location: d,
            instruction: `Open the Uber or Bolt app and enter "${d}" as your destination. Wait at a safe, well-lit spot — avoid standing in moving traffic lanes. Confirm the driver's name, car colour, and plate number before entering.`,
            what_to_say: `Confirm with the driver: "Are you going to ${d}?" before entering the car. This avoids wrong pickups.`,
            fare: `${uberFare} (varies with surge pricing — especially during peak hours)`,
            duration: `${driveMins}–${Math.round(driveMins * 1.5)} mins`,
            tip: timeCtx.isPeak
              ? `Surge pricing is likely right now (${timeCtx.timeStr}). Wait 15–20 minutes after peak hours for fares to drop, or book in advance via scheduled rides.`
              : `Good time to book — prices are typically normal at ${timeCtx.timeStr}. Compare Uber and Bolt for the cheapest option.`,
          },
        ],
      },
      {
        mode: 'Motorcycle (Opay / Roadside Okada)',
        label: 'Motorcycle — Fastest Through Traffic',
        time: okadaTime,
        total_fare: okadaFare,
        stress: 'high' as const,
        why_this_route: `Fastest option during peak hours — motorcycles bypass gridlock through side streets. Best for short-to-medium distances when you are in a hurry. High stress due to Lagos traffic conditions.`,
        steps: [
          {
            step_number: 1,
            type: 'okada' as const,
            from_location: o,
            to_location: d,
            instruction: `Use the Opay app and select "Okada" or "Tricycle" for a fixed-price motorcycle. Alternatively, hail a roadside okada near ${o} and negotiate before boarding.`,
            what_to_say: `For roadside: "How much to ${d}?" Negotiate — typical starting price is 30–40% above what you should pay. Counter-offer and settle in the middle.`,
            fare: `App-based (Opay): ${okadaFare} fixed. Roadside: negotiate — aim for lower end of ${okadaFare}.`,
            duration: okadaTime,
            tip: `Always insist on wearing a helmet if offered. Hold your bag firmly on your lap — not on your back. Avoid using your phone or earphones during the ride. Watch for LASTMA officers who may stop bikes in restricted zones.`,
          },
        ],
      },
    ],
    tips: [
      `It is ${timeCtx.timeStr} on ${timeCtx.day}: ${timeCtx.trafficContext}`,
      `Always carry small change — ₦100, ₦200, ₦500 notes are essential. Conductors rarely have change for large bills.`,
      timeCtx.isNight
        ? `⚠️ Night travel safety: Use Uber/Bolt at night rather than roadside okada. Avoid displaying your phone or jewellery in traffic.`
        : `Screenshot your destination on Google Maps before leaving — in case you lose mobile data on the way.`,
      `If you get confused at any point, stop and ask locals. Most Lagosians are happy to help with directions.`,
      `For BRT: check current fares on the LAMATA website (lamata-ng.com) as prices are updated periodically.`,
    ],
  };
}

// ─── Try Gemini ───────────────────────────────────────────────────────────────
async function tryGemini(prompt: string, geminiKey: string): Promise<unknown | null> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { response_mime_type: 'application/json' },
        }),
      }
    );
    if (!response.ok) {
      const errBody = await response.text();
      console.error(`[ONA] Gemini error ${response.status}:`, errBody.slice(0, 200));
      return null;
    }
    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) return null;
    const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('[ONA] Gemini failed:', e);
    return null;
  }
}

// ─── Try OpenAI ───────────────────────────────────────────────────────────────
async function tryOpenAI(prompt: string, openaiKey: string): Promise<unknown | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are ONA — a Lagos, Nigeria navigation and transport expert. Encyclopedic knowledge of every bus stop, motor park, keke route, bridge, and shortcut in Lagos. Respond with valid JSON only.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.6,
        max_tokens: 3000,
      }),
    });
    if (!response.ok) {
      const errBody = await response.text();
      console.error(`[ONA] OpenAI error ${response.status}:`, errBody.slice(0, 200));
      return null;
    }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content);
  } catch (e) {
    console.error('[ONA] OpenAI failed:', e);
    return null;
  }
}

// ─── Try Groq — FREE tier, resets daily, Llama 3.3 70B ───────────────────────
// Sign up free at console.groq.com — no credit card required
// Add GROQ_API_KEY to your .env.local
async function tryGroq(prompt: string, groqKey: string): Promise<unknown | null> {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are ONA — a Lagos, Nigeria navigation and transport expert with encyclopedic knowledge of every bus stop, motor park, keke route, bridge, expressway, and shortcut in Lagos. Always respond with valid JSON only. No markdown, no code blocks.',
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.6,
        max_tokens: 3000,
      }),
    });
    if (!response.ok) {
      const errBody = await response.text();
      console.error(`[ONA] Groq error ${response.status}:`, errBody.slice(0, 200));
      return null;
    }
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content);
  } catch (e) {
    console.error('[ONA] Groq failed:', e);
    return null;
  }
}

// ─── Main Route Handler ───────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const { origin, destination, routeData, preferences } = await request.json();

    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.AI_API_KEY;
    const groqKey   = process.env.GROQ_API_KEY;
    const timeCtx   = getLagosTimeContext();

    const prompt = buildPrompt(origin, destination, routeData, timeCtx, preferences);

    // 1. Try Gemini (free tier — resets daily)
    if (geminiKey && geminiKey.length > 10) {
      console.log('[ONA] Trying Gemini 2.0 Flash...');
      const result = await tryGemini(prompt, geminiKey);
      if (result) {
        console.log('[ONA] ✓ Gemini succeeded');
        return NextResponse.json(result);
      }
      console.log('[ONA] Gemini failed — trying next...');
    }

    // 2. Try OpenAI (paid, highest quality)
    if (openaiKey && openaiKey.length > 10) {
      console.log('[ONA] Trying OpenAI GPT-4o...');
      const result = await tryOpenAI(prompt, openaiKey);
      if (result) {
        console.log('[ONA] ✓ OpenAI succeeded');
        return NextResponse.json(result);
      }
      console.log('[ONA] OpenAI failed — trying next...');
    }

    // 3. Try Groq (free — Llama 3.3 70B, resets daily, 14,400 req/day)
    if (groqKey && groqKey.length > 10) {
      console.log('[ONA] Trying Groq (Llama 3.3 70B)...');
      const result = await tryGroq(prompt, groqKey);
      if (result) {
        console.log('[ONA] ✓ Groq succeeded');
        return NextResponse.json(result);
      }
      console.log('[ONA] Groq failed — using smart mock.');
    }

    // 4. Smart Lagos knowledge mock (last resort)
    console.log('[ONA] All AI unavailable — serving smart mock.');
    return NextResponse.json(buildSmartMock(origin, destination, routeData, timeCtx));

  } catch (error) {
    console.error('[ONA] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


