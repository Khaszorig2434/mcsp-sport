import Link from 'next/link';
import { Calendar, MapPin, Zap } from 'lucide-react';
import type { Tournament } from '@/lib/types';
import { cn, formatDate } from '@/lib/utils';
import SportIcon from '@/components/SportIcon';

interface Props {
  tournament: Tournament;
}

export default function TournamentCard({ tournament: t }: Props) {
  const isLive      = t.status === 'ongoing';
  const isCompleted = t.status === 'completed';

  return (
    <Link
      href={`/tournaments/${t.id}`}
      className={cn(
        'group block rounded-2xl border bg-surface-card transition-all duration-200',
        'hover:shadow-md hover:-translate-y-0.5',
        isLive
          ? 'border-live/30 hover:border-live/60'
          : 'border-surface-border hover:border-brand/40',
      )}
    >
      <div className="p-4">
        {/* Top row: icon + badges */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center shrink-0">
            <SportIcon icon={t.sport_icon} size={28} />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {/* Gender badge */}
            <span className={cn(
              'text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border',
              t.gender === 'female' ? 'bg-pink-500/10 text-pink-400 border-pink-500/20' :
              t.gender === 'male'   ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                                     'bg-purple-500/10 text-purple-400 border-purple-500/20',
            )}>
              {t.gender === 'female' ? "Women's" : t.gender === 'male' ? "Men's" : 'Mixed'}
            </span>

            {/* Status badge */}
            {isLive ? (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-live bg-live/10 border border-live/25 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-live animate-pulse" />
                Live
              </span>
            ) : isCompleted ? (
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted bg-surface border border-surface-border px-2 py-0.5 rounded-full">
                Done
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wide text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-full">
                Soon
              </span>
            )}
          </div>
        </div>

        {/* Sport label */}
        <p className="text-[10px] text-muted uppercase tracking-widest font-semibold mb-0.5">
          {t.sport_name}
        </p>

        {/* Tournament name */}
        <h3 className={cn(
          'font-bold text-sm leading-snug transition-colors line-clamp-2',
          'text-foreground group-hover:text-brand',
        )}>
          {t.name}
        </h3>

        {/* Live match count */}
        {isLive && t.live_matches_count && t.live_matches_count > 0 && (
          <div className="flex items-center gap-1 mt-2 text-xs text-live font-semibold">
            <Zap size={11} />
            {t.live_matches_count} match{t.live_matches_count !== 1 ? 'es' : ''} live
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 px-4 py-2.5 border-t border-surface-border text-[11px] text-muted">
        {t.location && (
          <span className="flex items-center gap-1">
            <MapPin size={10} />
            {t.location}
          </span>
        )}
        {t.start_date && (
          <span className="flex items-center gap-1">
            <Calendar size={10} />
            {formatDate(t.start_date)}
            {t.end_date && ` – ${formatDate(t.end_date)}`}
          </span>
        )}
      </div>
    </Link>
  );
}
