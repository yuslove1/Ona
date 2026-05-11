import { LagosRoute } from '@/lib/types';
import { Bus, Car, Bike, Shield, Clock, Banknote, Sparkles, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface RouteCardProps {
  route: LagosRoute & { id: string };
  onViewGuide: () => void;
}

export default function RouteCard({ route, onViewGuide }: RouteCardProps) {
  const isRecommended = route.id === '0';

  const getIcon = () => {
    const m = route.mode.toLowerCase();
    if (m.includes('bus') || m.includes('brt') || m.includes('danfo')) return <Bus size={24} />;
    if (m.includes('car') || m.includes('uber') || m.includes('bolt') || m.includes('driv')) return <Car size={24} />;
    return <Bike size={24} />;
  };

  const stressInfo = {
    low: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
    medium: { color: 'text-[#EAB308]', bg: 'bg-[#EAB308]/10', border: 'border-[#EAB308]/20' },
    high: { color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' },
  }[route.stress] ?? { color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/20' };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        'rounded-[2.5rem] p-6 mb-4 relative transition-all border overflow-hidden group',
        isRecommended
          ? 'bg-[#1E1B4B] border-[#A3E635]/30 shadow-[0_20px_40px_rgba(0,0,0,0.4)]'
          : 'bg-white/5 border-white/10 hover:bg-white/[0.08]'
      )}
    >
      {isRecommended && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#A3E635] to-transparent opacity-60" />
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex items-center gap-4">
          <div className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-inner',
            isRecommended ? 'bg-[#A3E635] text-black' : 'bg-white/10 text-white group-hover:bg-white/20'
          )}>
            {getIcon()}
          </div>
          <div>
            <h3 className="font-black text-lg tracking-tight leading-tight">{route.mode}</h3>
            <p className="text-white/40 text-xs font-medium mt-0.5 leading-tight max-w-[180px]">{route.label}</p>
          </div>
        </div>
        {isRecommended && (
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-[#A3E635] text-black text-[9px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-[0_0_15px_rgba(163,230,53,0.4)] shrink-0"
          >
            <Sparkles size={9} fill="currentColor" />
            BEST
          </motion.div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex items-center gap-2.5">
          <Clock size={15} className="text-white/30 shrink-0" />
          <div>
            <span className="text-[9px] font-black text-white/30 uppercase tracking-tighter block leading-none mb-0.5">Time</span>
            <span className="text-xs font-bold leading-tight">{route.time}</span>
          </div>
        </div>
        <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex items-center gap-2.5">
          <Banknote size={15} className="text-white/30 shrink-0" />
          <div>
            <span className="text-[9px] font-black text-white/30 uppercase tracking-tighter block leading-none mb-0.5">Fare</span>
            <span className="text-xs font-bold leading-tight">{route.total_fare}</span>
          </div>
        </div>
      </div>

      {/* Stress Badge + Steps count */}
      <div className="flex items-center justify-between mb-5">
        <div className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border',
          stressInfo.bg, stressInfo.color, stressInfo.border
        )}>
          <Shield size={10} fill="currentColor" />
          {route.stress} stress
        </div>
        <span className="text-white/20 text-[10px] font-bold">
          {route.steps?.length ?? 0} step{(route.steps?.length ?? 0) !== 1 ? 's' : ''}
        </span>
      </div>

      {/* CTA */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onViewGuide}
        className={cn(
          'w-full py-4 rounded-2xl font-black text-sm tracking-wide flex items-center justify-center gap-2.5 transition-all shadow-lg',
          isRecommended
            ? 'bg-[#A3E635] text-black hover:bg-[#bef264] shadow-[0_8px_25px_rgba(163,230,53,0.25)]'
            : 'bg-white text-black hover:bg-gray-100'
        )}
      >
        <BookOpen size={16} />
        VIEW JOURNEY GUIDE
      </motion.button>
    </motion.div>
  );
}
