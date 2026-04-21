import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import TournamentTabs from './TournamentTabs';
import { formatDate, genderLabel, sportIcon } from '@/lib/utils';
import { Calendar, MapPin } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { id: string };
}

export default async function TournamentPage({ params }: PageProps) {
  let tournament;
  try {
    tournament = await api.tournaments.get(params.id);
  } catch {
    notFound();
  }

  const statusStyles: Record<string, string> = {
    ongoing:   'bg-live/20 text-live border border-live/30',
    upcoming:  'bg-brand/10 text-brand border border-brand/20',
    completed: 'bg-gray-100 text-gray-500 border border-gray-200 dark:bg-gray-700/50 dark:text-gray-400 dark:border-gray-600/20',
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
      {/* ── Hero ──────────────────────────────────────────── */}
      <div className="rounded-xl bg-surface-card border border-surface-border p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Sport icon */}
          <div className="w-14 h-14 rounded-xl bg-surface flex items-center justify-center text-3xl shrink-0">
            {sportIcon(tournament.sport_icon)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                {tournament.sport_name} · {genderLabel(tournament.gender)}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusStyles[tournament.status]}`}>
                {tournament.status === 'ongoing' && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-live mr-1 animate-pulse" />
                )}
                {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
              {tournament.name}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm text-gray-500">
              {tournament.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} />
                  {tournament.location}
                </span>
              )}
              {tournament.start_date && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  {formatDate(tournament.start_date)}
                  {tournament.end_date && ` – ${formatDate(tournament.end_date)}`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Groups summary */}
        {tournament.groups && tournament.groups.length > 0 && (
          <div className="flex flex-wrap gap-6 mt-5 pt-5 border-t border-surface-border">
            {tournament.groups.map((g) => (
              <div key={g.id}>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">
                  Group {g.name}
                </p>
                <div className="flex flex-col gap-1">
                  {g.teams.map((t) => (
                    <div key={t.id} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-surface-border" />
                      <span className="text-sm text-gray-300">{t.name}</span>
                      {t.country && (
                        <span className="text-xs text-gray-600">{t.country}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Tabs ──────────────────────────────────────────── */}
      <TournamentTabs tournamentId={params.id} />
    </div>
  );
}
