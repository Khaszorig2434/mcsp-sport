'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, Medal, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const TABS = [
  { label: 'Home',        href: '/',            icon: Home },
  { label: 'Tournaments', href: '/tournaments',  icon: Trophy },
  { label: 'Leaderboard', href: '/leaderboard',  icon: Medal },
  { label: 'Schedule',    href: '/schedule',     icon: Calendar },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && theme === 'dark';

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t',
        isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200',
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {TABS.map(({ label, href, icon: Icon }) => {
        const active = pathname === href || (href !== '/' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-semibold transition-colors',
              active
                ? 'text-[#950D4C]'
                : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700',
            )}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
