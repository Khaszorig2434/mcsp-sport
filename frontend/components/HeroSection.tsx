'use client';

import Link from 'next/link';
import { useState } from 'react';

function PlayerImage({ src, side }: { src: string; side: 'left' | 'right' }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${side} player`}
      className={[
        'absolute bottom-0 h-[92%] object-contain object-bottom pointer-events-none select-none',
        side === 'left'
          ? 'left-0 animate-slide-in-left'
          : 'right-0 animate-slide-in-right',
      ].join(' ')}
      onError={() => setFailed(true)}
    />
  );
}

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden" style={{ height: 'calc(100vh - 64px)', minHeight: 480 }}>

      {/* ── Split background ── */}
      <div className="absolute inset-0 flex">
        <div className="w-1/2" style={{ background: 'linear-gradient(135deg, #5c0830 0%, #7a0a3d 40%, #950D4C 100%)' }} />
        <div className="w-1/2" style={{ background: 'linear-gradient(225deg, #143D8C 0%, #0e2d6b 50%, #0E1C39 100%)' }} />
      </div>

      {/* ── Lightning bolt divider ── */}
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-20 z-10 pointer-events-none">
        <svg className="h-full w-full" viewBox="0 0 80 900" preserveAspectRatio="none">
          <polygon points="40,0 56,0 40,450 56,900 24,900 40,450 24,0" fill="white" opacity="0.10" />
          <polygon points="36,0 44,0 44,900 36,900" fill="white" opacity="0.06" />
        </svg>
      </div>

      {/* ── Backdrop text ── */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none animate-fade-in">
        <span
          className="text-white font-black leading-none whitespace-nowrap tracking-tighter"
          style={{ fontSize: 'clamp(72px, 17vw, 220px)', opacity: 0.07 }}
        >
          MCSP SPORT
        </span>
      </div>

      {/* ── Decorative circles ── */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />

      {/* ── Left player image ── */}
      <div className="absolute inset-y-0 left-0 w-[44%] overflow-hidden">
        <PlayerImage src="/player-left.png" side="left" />
      </div>

      {/* ── Right player image ── */}
      <div className="absolute inset-y-0 right-0 w-[44%] overflow-hidden">
        <PlayerImage src="/player-right.png" side="right" />
      </div>

      {/* ── Center content ── */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 z-20 px-4 animate-fade-in-up">
        <p className="text-white/90 text-center text-base md:text-lg max-w-sm leading-relaxed drop-shadow-lg">
          Join the most thrilling league of the season. Whether you&apos;re a rising team
          or a seasoned champion — the road to victory starts here.
        </p>
        <div className="flex flex-wrap gap-3 mt-7 justify-center">
          <Link
            href="/tournaments"
            className="bg-white font-bold px-7 py-3 rounded text-sm hover:bg-gray-100 transition-colors shadow-lg"
            style={{ color: '#143D8C' }}
          >
            View Tournaments
          </Link>
          <Link
            href="/tournaments"
            className="border-2 border-white/70 text-white font-semibold px-7 py-3 rounded text-sm hover:bg-white/10 transition-colors"
          >
            Live Scores →
          </Link>
        </div>
      </div>
    </section>
  );
}
