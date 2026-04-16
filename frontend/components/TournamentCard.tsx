import Link from 'next/link';
import { Calendar, MapPin, DollarSign, Zap } from 'lucide-react';
import type { Tournament } from '@/lib/types';
import { cn, formatDate, genderLabel, sportIcon } from '@/lib/utils';

interface Props {
  tournament: Tournament;
}

const statusStyles: Record<string, string> = {
  ongoing:   'bg-live/20 text-live border border-live/30',
  upcoming:  'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  completed: 'bg-gray-700/50 text-gray-400 border border-gray-600/20',
};

const statusLabel: Record<string, string> = {
  ongoing:   'LIVE',
  upcoming:  'Upcoming',
  completed: 'Completed',
};

export default function TournamentCard({ tournament: t }: Props) {
  return (
    <Link
      href={`/tournaments/${t.id}`}
      className={cn(
        'block rounded-lg border border-surface-border bg-surface-card',
        'hover:border-brand/50 hover:bg-surface-hover transition-all duration-200',
        'p-4 group',
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl shrink-0" title={t.sport_name}>
            {sportIcon(t.sport_icon)}
          </span>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">
              {t.sport_name} · {genderLabel(t.gender)}
            </p>
            <h3 className="font-semibold text-white text-sm leading-tight group-hover:text-brand transition-colors line-clamp-2">
              {t.name}
            </h3>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={cn('text-xs px-2 py-0.5 rounded font-medium', statusStyles[t.status])}>
            {t.status === 'ongoing' && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-live mr-1 animate-pulse" />
            )}
            {statusLabel[t.status]}
          </span>
          {t.live_matches_count && t.live_matches_count > 0 && (
            <span className="flex items-center gap-1 text-xs text-live">
              <Zap size={10} />
              {t.live_matches_count} live
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        {t.location && (
          <span className="flex items-center gap-1">
            <MapPin size={11} />
            {t.location}
          </span>
        )}
        {t.start_date && (
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {formatDate(t.start_date)}
            {t.end_date && ` – ${formatDate(t.end_date)}`}
          </span>
        )}
        {t.prize_pool && (
          <span className="flex items-center gap-1">
            <DollarSign size={11} />
            {t.prize_pool}
          </span>
        )}
      </div>
    </Link>
  );
}
