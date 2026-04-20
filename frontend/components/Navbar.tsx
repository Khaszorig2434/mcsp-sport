'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Sun, Moon } from 'lucide-react';
import Image from 'next/image';

const NAV_LINKS = [
  { label: 'Home',        href: '/' },
  { label: 'Tournaments', href: '/tournaments' },
  { label: 'Live Scores', href: '/tournaments' },
];

export default function Navbar() {
  const pathname  = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted,   setMounted]   = useState(false);
  const [floating,  setFloating]  = useState(false);
  const [visible,   setVisible]   = useState(true);
  const [lastY,     setLastY]     = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setFloating(y > 60);
      // hide when scrolling down fast, show when scrolling up
      setVisible(y < lastY || y < 80);
      setLastY(y);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastY]);

  const isDark = mounted && theme === 'dark';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-300',
        floating ? 'pt-3' : 'pt-0',
        !visible && floating && '-translate-y-full opacity-0',
      )}
    >
      <nav
        className={cn(
          'flex items-center gap-2 transition-all duration-300',
          floating
            ? cn(
                'px-4 py-2 rounded-full shadow-lg border',
                'backdrop-blur-md',
                isDark
                  ? 'bg-gray-900/80 border-gray-700/60'
                  : 'bg-white/80 border-gray-200/60',
              )
            : cn(
                'w-full max-w-none px-6 h-16 rounded-none border-b',
                isDark
                  ? 'bg-gray-900 border-gray-800'
                  : 'bg-white border-gray-100 shadow-sm',
              ),
        )}
        style={floating ? {} : { maxWidth: '100vw' }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 font-bold text-lg shrink-0 mr-2">
          <Image
            src={isDark ? '/logo-white.png' : '/logo-black.png'}
            alt="MCSP Sport"
            width={32}
            height={32}
            className="object-contain"
          />
          <span className={isDark ? 'text-white' : 'text-gray-900'}>
            MCSP<span style={{ color: '#950D4C' }}>Sport</span>
          </span>
        </Link>

        {/* Divider */}
        {floating && (
          <div className={cn('w-px h-5 mx-1', isDark ? 'bg-gray-700' : 'bg-gray-200')} />
        )}

        {/* Nav links */}
        <div className={cn('hidden md:flex items-center', floating ? 'gap-0' : 'gap-1 flex-1')}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                'px-3 py-1.5 text-sm font-medium transition-colors rounded-full whitespace-nowrap',
                pathname === link.href
                  ? isDark ? 'text-white font-semibold' : 'text-gray-900 font-semibold'
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900',
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {!floating && <div className="flex-1" />}

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className={cn(
            'p-2 rounded-full transition-colors shrink-0',
            isDark
              ? 'text-gray-400 hover:text-white hover:bg-gray-700/60'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100',
          )}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* CTA */}
        <Link
          href="/tournaments"
          className="text-white text-sm font-semibold px-4 py-1.5 rounded-full transition-colors whitespace-nowrap shrink-0"
          style={{ backgroundColor: '#950D4C' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#7a0a3d')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#950D4C')}
        >
          {floating ? 'Schedule' : 'View Schedule'}
        </Link>
      </nav>
    </header>
  );
}
