import { AiInsight } from '@/lib/mockAiResponse';
import { Lightbulb, Target, MapPin, Star, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface AiInsightPanelProps {
  insights: AiInsight[];
}

interface FeedbackStore {
  [insightId: string]: 'up' | 'down' | null;
}

export default function AiInsightPanel({ insights }: AiInsightPanelProps) {
  const { value: feedback, setValue: setFeedback } = useLocalStorage<FeedbackStore>(
    'ona_insight_feedback',
    {}
  );

  const handleFeedback = (id: string, vote: 'up' | 'down') => {
    setFeedback((prev) => ({
      ...prev,
      [id]: prev[id] === vote ? null : vote, // toggle off if same
    }));
  };

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'bulb': return <Lightbulb className="w-5 h-5 text-black" />;
      case 'target': return <Target className="w-5 h-5 text-black" />;
      case 'location': return <MapPin className="w-5 h-5 text-black" />;
      case 'star': return <Star className="w-5 h-5 text-black" />;
      default: return <Lightbulb className="w-5 h-5 text-black" />;
    }
  };

  return (
    <div className="space-y-6">
      {insights.map((insight, idx) => {
        const vote = feedback[insight.id] ?? null;
        return (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/5 rounded-[2rem] p-6 border border-white/10 relative overflow-hidden group hover:bg-white/[0.08] transition-all"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-2xl shrink-0 bg-[#A3E635] shadow-[0_0_15px_rgba(163,230,53,0.3)] transition-transform group-hover:scale-110">
                {getIcon(insight.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-black text-xs uppercase tracking-[0.2em] text-[#A3E635]">{insight.title}</h3>
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest shrink-0 ml-2">
                    {insight.timestamp}
                  </span>
                </div>

                <div className="text-white/80 text-sm leading-relaxed font-medium">
                  {Array.isArray(insight.content) ? (
                    <ul className="space-y-3 mt-3">
                      {insight.content.map((item, i) => {
                        const parts = item.split(/(\*\*.*?\*\*)/g);
                        return (
                          <li key={i} className="flex gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                            <Sparkles className="w-4 h-4 text-[#A3E635] shrink-0 mt-0.5" />
                            <span className="text-xs leading-relaxed">
                              {parts.map((part, pidx) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                  return (
                                    <strong key={pidx} className="text-[#A3E635] font-black">
                                      {part.slice(2, -2)}
                                    </strong>
                                  );
                                }
                                return part;
                              })}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-lg font-bold tracking-tight text-white leading-tight mt-1">
                      {insight.content}
                    </p>
                  )}
                </div>

                {/* Feedback buttons */}
                <div className="flex justify-end items-center mt-6 pt-4 border-t border-white/5">
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleFeedback(insight.id, 'up')}
                      className={cn(
                        'w-10 h-10 flex items-center justify-center rounded-xl border transition-colors',
                        vote === 'up'
                          ? 'bg-[#A3E635]/20 text-[#A3E635] border-[#A3E635]/30'
                          : 'bg-white/5 text-white/40 border-white/5 hover:text-[#A3E635] hover:bg-[#A3E635]/10'
                      )}
                    >
                      <ThumbsUp size={16} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleFeedback(insight.id, 'down')}
                      className={cn(
                        'w-10 h-10 flex items-center justify-center rounded-xl border transition-colors',
                        vote === 'down'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          : 'bg-white/5 text-white/40 border-white/5 hover:text-rose-500 hover:bg-rose-500/10'
                      )}
                    >
                      <ThumbsDown size={16} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
