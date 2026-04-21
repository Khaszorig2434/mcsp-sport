import Link from 'next/link';
import { Calendar, MapPin, Zap } from 'lucide-react';
import type { Tournament } from '@/lib/types';
import { cn, formatDate, genderLabel } from '@/lib/utils';
import SportIcon from '@/components/SportIcon';

interface Props {
  tournament: Tournament;
}

const statusStyles: Record<string, string> = {
  ongoing:   'bg-brand-magenta/10 text-brand-magenta border border-brand-magenta/30',
  upcoming:  'bg-brand/10 text-brand border border-brand/20',
  completed: 'bg-gray-100 text-gray-500 border border-gray-200 dark:bg-gray-700/50 dark:text-gray-400 dark:border-gray-600/20',
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
          <SportIcon icon={t.sport_icon} size={32} className="shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">
              {t.sport_name} · {genderLabel(t.gender)}
            </p>
            <h3 className="font-semibold text-foreground text-sm leading-tight group-hover:text-brand transition-colors line-clamp-2">
              {t.name}
            </h3>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className={cn(
              'text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide',
              t.gender === 'female' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' :
              t.gender === 'male'   ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                                     'bg-purple-500/10 text-purple-400 border border-purple-500/20'
            )}>
              {t.gender === 'female' ? "Women's" : t.gender === 'male' ? "Men's" : 'Mixed'}
            </span>
            <span className={cn('text-xs px-2 py-0.5 rounded font-medium', statusStyles[t.status])}>
              {t.status === 'ongoing' && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-live mr-1 animate-pulse" />
              )}
              {statusLabel[t.status]}
            </span>
          </div>
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
      </div>
    </Link>
  );
}
