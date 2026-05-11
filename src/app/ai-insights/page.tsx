'use client';

import AiInsightPanel from '@/components/AiInsightPanel';
import { ChevronLeft, Sparkles, BrainCircuit, Home } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AiResponse } from '@/lib/types';
import { AiInsight } from '@/lib/mockAiResponse';
import { motion } from 'framer-motion';

export default function AiInsightsPage() {
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [routeParams, setRouteParams] = useState<{ origin: string; destination: string } | null>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem('ona_ai_data');
    const storedParams = sessionStorage.getItem('ona_route_params');

    if (storedParams) {
      try {
        setRouteParams(JSON.parse(storedParams));
      } catch { /* ignore */ }
    }

    if (storedData) {
      try {
        const data: AiResponse = JSON.parse(storedData);
        const transformedInsights: AiInsight[] = [
        {
          id: '1',
          type: 'summary',
          title: 'Route Summary',
          content: data.summary,
          icon: 'bulb',
          timestamp: 'Live Update',
        },
        {
          id: '2',
          type: 'reason',
          title: 'ONA Recommends',
          content: data.reason || `${data.recommended_mode} is your best option for this journey.`,
          icon: 'target',
          timestamp: 'Live Update',
        },
        {
          id: '3',
          type: 'tips',
          title: 'Lagos Pro Tips',
          content: data.tips,
          icon: 'location',
          timestamp: 'Lagos Context',
        },
      ];
        setTimeout(() => setInsights(transformedInsights), 0);
      } catch { /* ignore */ }
    }
  }, []);

  const backHref = routeParams
    ? `/results?origin=${encodeURIComponent(routeParams.origin)}&destination=${encodeURIComponent(routeParams.destination)}`
    : '/results';

  return (
    <main className="min-h-screen bg-[#0F0D0B] text-white pb-12">
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-2xl p-6 flex items-center sticky top-0 z-50 border-b border-white/10">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Link
            href={backHref}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10"
          >
            <ChevronLeft size={24} />
          </Link>
        </motion.div>
        <div className="flex-1 text-center">
          <h1 className="text-sm font-black uppercase tracking-[0.3em] text-[#A3E635] flex items-center justify-center gap-2">
            <BrainCircuit size={16} />
            AI Insights
          </h1>
        </div>
        <div className="w-10" />
      </header>

      <div className="p-6 max-w-2xl mx-auto">
        {insights.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Hero banner */}
            <div className="bg-[#1E1B4B] rounded-[2.5rem] p-8 border border-[#A3E635]/20 relative overflow-hidden mb-8">
              <div className="absolute top-0 right-0 p-4">
                <Sparkles className="text-[#A3E635] animate-pulse" size={24} />
              </div>
              <h2 className="text-3xl font-black tracking-tighter mb-2">Smart Analysis</h2>
              <p className="text-white/40 text-xs font-black uppercase tracking-widest">
                Real-time Lagos Traffic Data
              </p>
              {routeParams && (
                <div className="mt-4 flex items-center gap-2 text-xs text-white/40 font-medium">
                  <span className="text-[#A3E635] font-bold">{routeParams.origin}</span>
                  <span>→</span>
                  <span className="text-[#A3E635] font-bold">{routeParams.destination}</span>
                </div>
              )}
            </div>

            <AiInsightPanel insights={insights} />
          </motion.div>
        ) : (
          /* Empty state with recovery */
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 border-4 border-[#A3E635]/20 border-t-[#A3E635] rounded-full"
            />
            <div className="text-center space-y-2">
              <p className="text-white/40 text-xs font-black uppercase tracking-widest animate-pulse">
                Retrieving insights...
              </p>
              <p className="text-white/20 text-[11px]">
                Please search for a route first
              </p>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 px-6 py-3 bg-[#A3E635] text-black rounded-full text-xs font-black uppercase tracking-widest mt-4"
            >
              <Home size={14} />
              Search a Route
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
