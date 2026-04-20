import { api } from '@/lib/api';
import TournamentCard from '@/components/TournamentCard';
import { Trophy } from 'lucide-react';
import type { Tournament } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function TournamentsPage() {
  let tournaments: Tournament[] = [];
  try {
    tournaments = await api.tournaments.list();
  } catch {
    // handled below
  }

  const ongoing   = tournaments.filter((t) => t.status === 'ongoing');
  const upcoming  = tournaments.filter((t) => t.status === 'upcoming');
  const completed = tournaments.filter((t) => t.status === 'completed');

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-8">
      <div className="flex items-center gap-3">
        <Trophy size={22} className="text-brand" />
        <h1 className="text-2xl font-bold text-foreground">All Tournaments</h1>
      </div>

      {ongoing.length > 0 && (
        <Section label="Ongoing" accent="live">
          {ongoing.map((t) => <TournamentCard key={t.id} tournament={t} />)}
        </Section>
      )}

      {upcoming.length > 0 && (
        <Section label="Upcoming" accent="blue">
          {upcoming.map((t) => <TournamentCard key={t.id} tournament={t} />)}
        </Section>
      )}

      {completed.length > 0 && (
        <Section label="Completed" accent="gray">
          {completed.map((t) => <TournamentCard key={t.id} tournament={t} />)}
        </Section>
      )}

      {!tournaments.length && (
        <p className="text-gray-500">No tournaments found.</p>
      )}
    </div>
  );
}

function Section({
  label, accent, children,
}: {
  label:    string;
  accent:   'live' | 'blue' | 'gray';
  children: React.ReactNode;
}) {
  const dotColor = accent === 'live' ? 'bg-live' : accent === 'blue' ? 'bg-brand' : 'bg-gray-400';
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{label}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {children}
      </div>
    </section>
  );
}
