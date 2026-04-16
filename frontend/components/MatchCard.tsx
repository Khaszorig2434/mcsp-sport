import { cn, formatDateTime, stageLabel } from '@/lib/utils';
import type { Match } from '@/lib/types';

interface Props {
  match:    Match;
  compact?: boolean;
}

export default function MatchCard({ match: m, compact = false }: Props) {
  const isLive      = m.status === 'live';
  const isCompleted = m.status === 'completed';

  const team1Won = isCompleted && m.winner_id === m.team1?.id;
  const team2Won = isCompleted && m.winner_id === m.team2?.id;

  if (compact) {
    return (
      <div className={cn(
        'bg-surface-card border border-surface-border rounded-lg px-4 py-3',
        isLive && 'border-live/40 shadow-[0_0_12px_rgba(249,115,22,0.15)]',
      )}>
        <div className="flex items-center justify-between gap-3">
          {/* Team 1 */}
          <TeamRow
            name={m.team1?.name ?? 'TBD'}
            shortName={m.team1?.short_name}
            score={m.score1}
            isWinner={team1Won}
            isLoser={isCompleted && !team1Won && m.team1 != null}
            align="left"
          />

          {/* Middle */}
          <div className="flex flex-col items-center shrink-0 min-w-[50px]">
            {isLive ? (
              <span className="text-live text-xs font-bold uppercase animate-pulse">LIVE</span>
            ) : isCompleted ? (
              <span className="text-gray-500 text-xs">FT</span>
            ) : (
              <span className="text-gray-500 text-xs">VS</span>
            )}
          </div>

          {/* Team 2 */}
          <TeamRow
            name={m.team2?.name ?? 'TBD'}
            shortName={m.team2?.short_name}
            score={m.score2}
            isWinner={team2Won}
            isLoser={isCompleted && !team2Won && m.team2 != null}
            align="right"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'bg-surface-card border border-surface-border rounded-xl overflow-hidden',
      isLive && 'border-live/40 shadow-[0_0_16px_rgba(249,115,22,0.12)]',
    )}>
      {/* Stage / status bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-surface-border bg-surface/50">
        <span className="text-xs text-gray-500 uppercase tracking-wide">
          {m.group_name ? `Group ${m.group_name} · ` : ''}{stageLabel(m.stage)}
        </span>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="flex items-center gap-1 text-xs text-live font-semibold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-live animate-pulse" />
              Live
            </span>
          )}
          <span className="text-xs text-gray-500">
            {m.match_date ? formatDateTime(m.match_date) : 'TBD'}
          </span>
        </div>
      </div>

      {/* Teams + scores */}
      <div className="px-4 py-4 space-y-2">
        <TeamRowFull
          name={m.team1?.name ?? 'TBD'}
          score={m.score1}
          isWinner={team1Won}
          isLoser={isCompleted && !team1Won && m.team1 != null}
        />
        <TeamRowFull
          name={m.team2?.name ?? 'TBD'}
          score={m.score2}
          isWinner={team2Won}
          isLoser={isCompleted && !team2Won && m.team2 != null}
        />
      </div>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

function TeamRow({
  name, shortName, score, isWinner, isLoser, align,
}: {
  name: string; shortName?: string | null; score: number | null;
  isWinner: boolean; isLoser: boolean; align: 'left' | 'right';
}) {
  return (
    <div className={cn(
      'flex items-center gap-2 flex-1',
      align === 'right' && 'flex-row-reverse',
    )}>
      <span className={cn(
        'font-medium text-sm truncate',
        isWinner && 'text-win',
        isLoser  && 'text-gray-500',
        !isWinner && !isLoser && 'text-white',
      )}>
        {shortName ?? name}
      </span>
      {score !== null && (
        <span className={cn(
          'font-bold text-base min-w-[20px] text-center',
          isWinner && 'text-win',
          isLoser  && 'text-gray-500',
          !isWinner && !isLoser && 'text-white',
        )}>
          {score}
        </span>
      )}
    </div>
  );
}

function TeamRowFull({
  name, score, isWinner, isLoser,
}: {
  name: string; score: number | null; isWinner: boolean; isLoser: boolean;
}) {
  return (
    <div className={cn(
      'flex items-center justify-between rounded-lg px-3 py-2',
      isWinner && 'bg-win/10',
      isLoser  && 'bg-gray-800/40',
      !isWinner && !isLoser && 'bg-surface/50',
    )}>
      <span className={cn(
        'font-medium text-sm',
        isWinner && 'text-win',
        isLoser  && 'text-gray-500',
        !isWinner && !isLoser && 'text-white',
      )}>
        {name}
        {isWinner && <span className="ml-2 text-xs text-win/70">✓ WIN</span>}
      </span>
      {score !== null && (
        <span className={cn(
          'font-bold text-xl tabular-nums',
          isWinner && 'text-win',
          isLoser  && 'text-gray-500',
          !isWinner && !isLoser && 'text-white',
        )}>
          {score}
        </span>
      )}
    </div>
  );
}
