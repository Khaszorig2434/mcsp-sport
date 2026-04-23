import { cn, formatDateTime } from '@/lib/utils';
import type { Bracket, BracketMatch } from '@/lib/types';

interface Props {
  bracket: Bracket;
}

export default function Bracket({ bracket }: Props) {
  const { semifinals, bronze, final } = bracket;
  const sf1 = semifinals[0] ?? null;
  const sf2 = semifinals[1] ?? null;

  const hasBracket = sf1 || sf2 || final;

  if (!hasBracket) {
    return (
      <p className="text-gray-500 text-sm py-4">
        Bracket is not yet available. Group stage must complete first.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
      {/* ── Main bracket (SFs → Final) ──────────────────────── */}
      <div className="flex items-center min-w-[700px] gap-0">
        {/* Column 1: Semi-Finals */}
        <div className="flex flex-col justify-around" style={{ gap: '40px' }}>
          <ColumnHeader label="Semi-Finals" />
          <div className="flex flex-col gap-10">
            {sf1 && <BracketMatchCard match={sf1} label="SF1" />}
            {sf2 && <BracketMatchCard match={sf2} label="SF2" />}
          </div>
        </div>

        {/* Connectors from SFs to Final */}
        {(sf1 || sf2) && final && (
          <BracketConnector />
        )}

        {/* Column 2: Final */}
        <div className="flex flex-col">
          <ColumnHeader label="Grand Final" />
          <div className="flex items-center" style={{ height: 'calc(2 * 120px + 40px)' }}>
            {final
              ? <BracketMatchCard match={final} label="Final" highlight />
              : <PlaceholderCard label="Final — TBD" />
            }
          </div>
        </div>
      </div>

      {/* ── Bronze Match ────────────────────────────────────── */}
      {bronze && (
        <div className="mt-8 border-t border-surface-border pt-6">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Bronze Match · 3rd Place
          </h4>
          <div className="max-w-[280px]">
            <BracketMatchCard match={bronze} label="Bronze" />
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-6 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-win/20 border border-win/40" />
          Winner
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-loss/20 border border-loss/40" />
          Eliminated
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-live/20 border border-live/40" />
          Live
        </span>
      </div>
    </div>
  );
}

/* ─── BracketMatchCard ────────────────────────────────────────── */

function BracketMatchCard({
  match, label, highlight = false,
}: {
  match: BracketMatch; label: string; highlight?: boolean;
}) {
  const isLive      = match.status === 'live';
  const isCompleted = match.status === 'completed';

  const team1Won = isCompleted && match.winner_id === match.team1?.id;
  const team2Won = isCompleted && match.winner_id === match.team2?.id;

  return (
    <div className={cn(
      'w-[260px] rounded-lg border overflow-hidden',
      isLive      && 'border-live/50 shadow-[0_0_14px_rgba(249,115,22,0.2)]',
      highlight && !isLive && 'border-brand/50',
      !isLive && !highlight && 'border-surface-border',
    )}>
      {/* Header */}
      <div className={cn(
        'flex items-center justify-between px-3 py-1.5 text-xs',
        highlight ? 'bg-brand/10 border-b border-brand/20'
                  : 'bg-surface border-b border-surface-border',
      )}>
        <span className={cn(
          'font-semibold uppercase tracking-wide',
          highlight ? 'text-brand' : 'text-muted',
        )}>
          {label}
        </span>
        <div className="flex items-center gap-2 text-gray-500">
          {isLive && (
            <span className="flex items-center gap-1 text-live font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-live animate-pulse" />
              LIVE
            </span>
          )}
          {match.match_date && (
            <span>{formatDateTime(match.match_date)}</span>
          )}
        </div>
      </div>

      {/* Teams */}
      <div className="bg-surface-card">
        <BracketTeamRow
          name={match.team1?.player_name ?? match.team1?.name ?? 'TBD'}
          teamName={match.team1?.player_name ? match.team1.name : null}
          score={match.score1}
          isWinner={team1Won}
          isLoser={isCompleted && !team1Won && match.team1 != null}
          isPending={!match.team1}
        />
        <div className="h-px bg-surface-border" />
        <BracketTeamRow
          name={match.team2?.player_name ?? match.team2?.name ?? 'TBD'}
          teamName={match.team2?.player_name ? match.team2.name : null}
          score={match.score2}
          isWinner={team2Won}
          isLoser={isCompleted && !team2Won && match.team2 != null}
          isPending={!match.team2}
        />
      </div>
    </div>
  );
}

/* ─── BracketTeamRow ─────────────────────────────────────────── */

function BracketTeamRow({
  name, teamName, score, isWinner, isLoser, isPending,
}: {
  name:      string;
  teamName:  string | null;
  score:     number | null;
  isWinner:  boolean;
  isLoser:   boolean;
  isPending: boolean;
}) {
  return (
    <div className={cn(
      'flex items-center justify-between px-3 py-2.5',
      isWinner  && 'bg-win/10',
      isLoser   && 'bg-surface/60',
      isPending && 'bg-surface/40',
    )}>
      <div className="flex items-center gap-2 min-w-0">
        {isWinner && (
          <span className="text-win text-xs shrink-0">▶</span>
        )}
        <div className="min-w-0">
          <span className={cn(
            'text-sm font-medium truncate block',
            isWinner  && 'text-win font-semibold',
            isLoser   && 'text-gray-500 line-through decoration-gray-600',
            isPending && 'text-gray-600 italic',
            !isWinner && !isLoser && !isPending && 'text-foreground',
          )}>
            {name}
          </span>
          {teamName && (
            <span className="text-[10px] text-muted leading-none">{teamName}</span>
          )}
        </div>
      </div>

      {score !== null ? (
        <span className={cn(
          'text-base font-bold tabular-nums ml-3 shrink-0',
          isWinner  && 'text-win',
          isLoser   && 'text-gray-600',
          !isWinner && !isLoser && 'text-foreground',
        )}>
          {score}
        </span>
      ) : (
        <span className="text-gray-600 text-sm ml-3 shrink-0">—</span>
      )}
    </div>
  );
}

/* ─── Connector (SFs → Final) ────────────────────────────────── */
// Each match card is ~120px tall, gap between them is 40px.
// Total height of SF column = 120 + 40 + 120 = 280px
// The connector vertical line spans the middle of SF1 to middle of SF2.

const CARD_HEIGHT = 120; // px — approximate height of BracketMatchCard
const SF_GAP      = 40;  // px — gap between SF1 and SF2

function BracketConnector() {
  const totalH = CARD_HEIGHT * 2 + SF_GAP; // 280
  const midH   = totalH / 2;               // 140 — center of the vertical bar
  const arm    = CARD_HEIGHT / 2;          // 60  — half card height (arm from mid of each card)
  const w      = 48;                        // width of connector region

  return (
    <div style={{ width: w, height: totalH }} className="relative shrink-0 self-end mb-0">
      <svg
        width={w}
        height={totalH}
        className="absolute inset-0"
        style={{ overflow: 'visible' }}
      >
        {/* Horizontal arm from SF1 (right side → vertical bar) */}
        <line
          x1={0} y1={arm}
          x2={w / 2} y2={arm}
          stroke="rgb(var(--surface-border))" strokeWidth={2}
        />
        {/* Horizontal arm from SF2 */}
        <line
          x1={0} y1={totalH - arm}
          x2={w / 2} y2={totalH - arm}
          stroke="rgb(var(--surface-border))" strokeWidth={2}
        />
        {/* Vertical bar joining the two arms */}
        <line
          x1={w / 2} y1={arm}
          x2={w / 2} y2={totalH - arm}
          stroke="rgb(var(--surface-border))" strokeWidth={2}
        />
        {/* Horizontal arm out to Final */}
        <line
          x1={w / 2} y1={midH}
          x2={w} y2={midH}
          stroke="rgb(var(--surface-border))" strokeWidth={2}
        />
      </svg>
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────────────── */

function ColumnHeader({ label }: { label: string }) {
  return (
    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
      {label}
    </div>
  );
}

function PlaceholderCard({ label }: { label: string }) {
  return (
    <div className="w-[260px] rounded-lg border border-dashed border-surface-border px-4 py-8 text-center text-gray-600 text-sm">
      {label}
    </div>
  );
}
