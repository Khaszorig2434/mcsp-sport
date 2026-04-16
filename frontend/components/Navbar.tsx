'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Dashboard',   href: '/' },
  { label: 'Tournaments', href: '/tournaments' },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-surface-border bg-surface-card sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg">
          <Trophy className="text-brand" size={22} />
          <span>MCSP<span className="text-brand">Sport</span></span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3 py-1.5 rounded text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-surface-hover text-white'
                  : 'text-gray-400 hover:text-white hover:bg-surface-hover',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        <span className="text-xs text-gray-500 hidden sm:block">
          Multi-Sport Tournament Tracker
        </span>
      </div>
    </header>
  );
}
