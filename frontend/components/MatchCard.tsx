import { cn, formatDateTime, stageLabel } from '@/lib/utils';
import type { Match } from '@/lib/types';

interface Props {
  match: Match;
}

export default function MatchCard({ match: m }: Props) {
  const isLive      = m.status === 'live';
  const isCompleted = m.status === 'completed';

  const team1Won = isCompleted && m.winner_id === m.team1?.id;
  const team2Won = isCompleted && m.winner_id === m.team2?.id;

  return (
    <div className={cn(
      'bg-surface-card border border-surface-border rounded-xl overflow-hidden transition-colors',
      isLive && 'border-live/40 shadow-[0_0_16px_rgba(249,115,22,0.10)]',
    )}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-surface-border">
        <span className="text-[10px] text-muted uppercase tracking-widest font-semibold">
          {m.group_name ? `Group ${m.group_name} · ` : ''}{stageLabel(m.stage)}
        </span>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="flex items-center gap-1 text-[10px] text-live font-bold uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-live animate-pulse" />
              Live
            </span>
          )}
          {isCompleted && (
            <span className="text-[10px] text-muted font-medium uppercase tracking-wide">Final</span>
          )}
          {!isLive && !isCompleted && (
            <span className="text-[10px] text-muted">
              {m.match_date ? formatDateTime(m.match_date) : 'TBD'}
            </span>
          )}
        </div>
      </div>

      {/* Score row */}
      <div className="flex items-stretch">
        {/* Team 1 */}
        <div className={cn(
          'flex flex-1 items-center gap-3 px-4 py-3',
          team1Won && 'bg-win/5',
          team2Won && 'bg-surface/30',
        )}>
          <div className="flex-1">
            <p className={cn(
              'font-bold text-sm leading-tight',
              team1Won && 'text-win',
              team2Won && 'text-muted',
              !team1Won && !team2Won && 'text-foreground',
            )}>
              {m.team1?.player_name ?? m.team1?.name ?? 'TBD'}
            </p>
            <p className="text-[10px] text-muted uppercase tracking-wide mt-0.5">
              {m.team1?.player_name ? m.team1.name : m.team1?.short_name ?? ''}
            </p>
          </div>
          {m.score1 !== null && m.score1 !== undefined && (
            <span className={cn(
              'text-2xl font-black tabular-nums',
              team1Won && 'text-win',
              team2Won && 'text-muted',
              !team1Won && !team2Won && 'text-foreground',
            )}>
              {m.score1}
            </span>
          )}
        </div>

        {/* Center divider */}
        <div className="flex flex-col items-center justify-center px-3 border-x border-surface-border bg-surface/40 shrink-0">
          {isLive ? (
            <span className="text-[10px] font-black text-live uppercase tracking-widest animate-pulse">VS</span>
          ) : isCompleted ? (
            <span className="text-[10px] font-black text-muted/50 uppercase tracking-widest">—</span>
          ) : (
            <span className="text-[10px] font-black text-muted/50 uppercase tracking-widest">VS</span>
          )}
          {isLive && m.match_date && (
            <span className="text-[9px] text-muted mt-0.5">{formatDateTime(m.match_date)}</span>
          )}
        </div>

        {/* Team 2 */}
        <div className={cn(
          'flex flex-1 items-center gap-3 px-4 py-3 flex-row-reverse',
          team2Won && 'bg-win/5',
          team1Won && 'bg-surface/30',
        )}>
          <div className="flex-1 text-right">
            <p className={cn(
              'font-bold text-sm leading-tight',
              team2Won && 'text-win',
              team1Won && 'text-muted',
              !team1Won && !team2Won && 'text-foreground',
            )}>
              {m.team2?.player_name ?? m.team2?.name ?? 'TBD'}
            </p>
            <p className="text-[10px] text-muted uppercase tracking-wide mt-0.5">
              {m.team2?.player_name ? m.team2.name : m.team2?.short_name ?? ''}
            </p>
          </div>
          {m.score2 !== null && m.score2 !== undefined && (
            <span className={cn(
              'text-2xl font-black tabular-nums',
              team2Won && 'text-win',
              team1Won && 'text-muted',
              !team1Won && !team2Won && 'text-foreground',
            )}>
              {m.score2}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
