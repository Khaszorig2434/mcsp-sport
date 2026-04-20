import { Suspense } from 'react';
import { Zap, Clock, Trophy } from 'lucide-react';
import { api } from '@/lib/api';
import TournamentCard from '@/components/TournamentCard';
import MatchCard from '@/components/MatchCard';
import HeroSection from '@/components/HeroSection';

export const dynamic = 'force-dynamic';

async function LiveMatches() {
  try {
    const matches = await api.matches.live();
    if (!matches.length) {
      return (
        <p className="text-gray-500 text-sm py-3">
          No live matches right now.
        </p>
      );
    }
    return (
      <div className="space-y-3">
        {matches.map((m) => (
          <div key={m.id}>
            {m.tournament_name && (
              <p className="text-xs text-gray-500 mb-1 px-1">
                {m.sport_icon ? `${m.sport_name} · ` : ''}{m.tournament_name}
              </p>
            )}
            <MatchCard match={m} compact />
          </div>
        ))}
      </div>
    );
  } catch {
    return <p className="text-gray-500 text-sm py-3">Could not load live matches.</p>;
  }
}

async function UpcomingMatches() {
  try {
    // Gather upcoming matches from ongoing tournaments
    const tournaments = await api.tournaments.list({ status: 'ongoing' });
    const upcomingByTournament = await Promise.all(
      tournaments.slice(0, 3).map((t) =>
        api.matches.list({ tournamentId: t.id, status: 'upcoming' })
          .then((ms) => ms.slice(0, 2).map((m) => ({ ...m, tournament_name: t.name, sport_name: t.sport_name })))
          .catch(() => [])
      )
    );

    const allUpcoming = upcomingByTournament.flat().slice(0, 6);

    if (!allUpcoming.length) {
      return <p className="text-gray-500 text-sm py-3">No upcoming matches.</p>;
    }

    return (
      <div className="space-y-3">
        {allUpcoming.map((m) => (
          <div key={m.id}>
            <p className="text-xs text-gray-500 mb-1 px-1">{m.tournament_name}</p>
            <MatchCard match={m} compact />
          </div>
        ))}
      </div>
    );
  } catch {
    return <p className="text-gray-500 text-sm py-3">Could not load upcoming matches.</p>;
  }
}

async function TournamentsList() {
  try {
    const tournaments = await api.tournaments.list();
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tournaments.map((t) => (
          <TournamentCard key={t.id} tournament={t} />
        ))}
      </div>
    );
  } catch {
    return <p className="text-gray-500 text-sm py-3">Could not load tournaments.</p>;
  }
}

/* ─── Page ─────────────────────────────────────────────────────── */

export default function DashboardPage() {
  return (
    <>
      <HeroSection />
    <div className="max-w-screen-xl mx-auto px-4 py-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Live + Upcoming */}
        <div className="lg:col-span-1 space-y-6">
          {/* Live Matches */}
          <section>
            <SectionHeader icon={<Zap size={15} className="text-live" />} label="Live Matches" />
            <Suspense fallback={<SkeletonList count={2} />}>
              <LiveMatches />
            </Suspense>
          </section>

          {/* Upcoming Matches */}
          <section>
            <SectionHeader icon={<Clock size={15} className="text-blue-400" />} label="Upcoming Matches" />
            <Suspense fallback={<SkeletonList count={3} />}>
              <UpcomingMatches />
            </Suspense>
          </section>
        </div>

        {/* Right: All Tournaments */}
        <div className="lg:col-span-2">
          <SectionHeader icon={<Trophy size={15} className="text-brand" />} label="All Tournaments" />
          <Suspense fallback={<SkeletonGrid />}>
            <TournamentsList />
          </Suspense>
        </div>
      </div>
    </div>
    </>
  );
}

/* ─── Shared UI ─────────────────────────────────────────────────── */

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-surface-border">
      {icon}
      <h2 className="font-semibold text-white text-sm uppercase tracking-wide">{label}</h2>
    </div>
  );
}

function SkeletonList({ count }: { count: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-14 rounded-lg bg-surface-card animate-pulse" />
      ))}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-28 rounded-lg bg-surface-card animate-pulse" />
      ))}
    </div>
  );
}
