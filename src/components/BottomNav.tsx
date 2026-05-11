'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Settings, Map } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Don't show on results (full-screen map) or ai-insights pages
  if (pathname.startsWith('/results') || pathname.startsWith('/ai-insights')) {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.8, type: 'spring', stiffness: 120 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[85%] max-w-xs bg-black/50 backdrop-blur-2xl border border-white/10 rounded-full p-2 flex justify-around items-center z-50 shadow-2xl"
    >
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link key={href} href={href} className="flex-1 flex justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              className={cn(
                'flex flex-col items-center gap-1 px-6 py-2.5 rounded-full transition-all',
                isActive
                  ? 'bg-[#A3E635] text-black'
                  : 'text-white/40 hover:text-white/70'
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={cn('text-[9px] font-black uppercase tracking-widest', isActive ? 'text-black' : 'text-white/30')}>
                {label}
              </span>
            </motion.div>
          </Link>
        );
      })}
    </motion.nav>
  );
}
