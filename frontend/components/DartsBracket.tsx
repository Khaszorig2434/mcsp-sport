import { cn, formatDateTime } from '@/lib/utils';
import type { DartsBracket, BracketMatch } from '@/lib/types';

interface Props {
  bracket: DartsBracket;
}

// ── Layout constants (all in px) ─────────────────────────────
const CARD_H    = 120;  // approximate height of each match card
const INNER_GAP = 24;   // gap between QF1-QF2 and QF3-QF4 (within a pair)
const PAIR_GAP  = 40;   // gap between the two QF pairs
const CONN_W    = 48;   // width of each SVG connector region

// Total height when 4 QFs are present
const TOTAL_H = CARD_H * 4 + INNER_GAP * 2 + PAIR_GAP; // 568

// Vertical center positions of QF cards
const QF1_CY = CARD_H / 2;                                                              // 60
const QF2_CY = CARD_H + INNER_GAP + CARD_H / 2;                                        // 204
const QF3_CY = CARD_H * 2 + INNER_GAP + PAIR_GAP + CARD_H / 2;                        // 364
const QF4_CY = CARD_H * 2 + INNER_GAP + PAIR_GAP + CARD_H + INNER_GAP + CARD_H / 2;  // 508

// SF centers (midpoint of their QF pair)
const SF1_CY = (QF1_CY + QF2_CY) / 2; // 132
const SF2_CY = (QF3_CY + QF4_CY) / 2; // 436

// Final center (midpoint of the two SFs)
const FIN_CY = (SF1_CY + SF2_CY) / 2; // 284

// Top Y of each SF and Final card
const SF1_TOP = SF1_CY - CARD_H / 2; // 72
const SF2_TOP = SF2_CY - CARD_H / 2; // 376
const FIN_TOP = FIN_CY - CARD_H / 2; // 224

// Top Y of QF cards
const QF2_TOP = CARD_H + INNER_GAP;                          // 144
const QF3_TOP = CARD_H * 2 + INNER_GAP + PAIR_GAP;          // 304
const QF4_TOP = CARD_H * 2 + INNER_GAP + PAIR_GAP + CARD_H + INNER_GAP; // 448

// ── Main component ───────────────────────────────────────────

export default function DartsBracket({ bracket }: Props) {
  const { quarterfinals: qfs, semifinals: sfs, bronze, final: fin } = bracket;

  const hasFullBracket = qfs.length === 4 && sfs.length >= 1;
  const hasSomeBracket = qfs.length > 0 || sfs.length > 0 || fin;

  if (!hasSomeBracket) {
    return (
      <p className="text-muted text-sm py-4">
        Bracket is not yet available. Group stage must complete first.
      </p>
    );
  }

  // Full 4-QF bracket with SVG connectors
  if (hasFullBracket) {
    const [qf1, qf2, qf3, qf4] = qfs;
    const [sf1, sf2]            = sfs;

    return (
      <div className="overflow-x-auto pb-4">
        {/* ── Main bracket ───────────────────────────────── */}
        {/* HEADER_H = 28px accounts for column header text above the cards */}
        <div className="flex items-start min-w-[820px] gap-0" style={{ height: TOTAL_H + 28 }}>

          {/* Column 1: QF cards (absolutely positioned within the column) */}
          <div className="flex flex-col shrink-0 gap-0" style={{ width: 260 }}>
            <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Quarter-Finals</div>
            <BracketMatchCard match={qf1} label="QF1" />
            <div style={{ height: INNER_GAP }} />
            <BracketMatchCard match={qf2} label="QF2" />
            <div style={{ height: PAIR_GAP }} />
            <BracketMatchCard match={qf3} label="QF3" />
            <div style={{ height: INNER_GAP }} />
            <BracketMatchCard match={qf4} label="QF4" />
          </div>

          {/* Connector: QF → SF */}
          <QfToSfConnector />

          {/* Column 2: SF cards */}
          <div className="relative shrink-0" style={{ width: 260, height: TOTAL_H + 28 }}>
            <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Semi-Finals</div>
            {sf1 && <div style={{ position: 'absolute', top: SF1_TOP + 28 }}><BracketMatchCard match={sf1} label="SF1" /></div>}
            {sf2 && <div style={{ position: 'absolute', top: SF2_TOP + 28 }}><BracketMatchCard match={sf2} label="SF2" /></div>}
          </div>

          {/* Connector: SF → Final */}
          <SfToFinalConnector />

          {/* Column 3: Final */}
          <div className="relative shrink-0" style={{ width: 260, height: TOTAL_H + 28 }}>
            <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Grand Final</div>
            {fin
              ? <div style={{ position: 'absolute', top: FIN_TOP + 28 }}><BracketMatchCard match={fin} label="Final" highlight /></div>
              : <div style={{ position: 'absolute', top: FIN_TOP + 28 }}><PlaceholderCard label="Final — TBD" /></div>
            }
          </div>
        </div>

        {/* ── Bronze match ────────────────────────────────── */}
        {bronze && (
          <div className="mt-8 border-t border-surface-border pt-6">
            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
              Bronze Match · 3rd Place
            </h4>
            <div className="max-w-[280px]">
              <BracketMatchCard match={bronze} label="Bronze" />
            </div>
          </div>
        )}

        <Legend />
      </div>
    );
  }

  // Fallback: fewer than 4 QFs — simple list view
  return (
    <div className="overflow-x-auto pb-4 space-y-8">
      {qfs.length > 0 && (
        <div>
          <ColumnHeader label="Quarter-Finals" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {qfs.map((m, i) => <BracketMatchCard key={m.id} match={m} label={`QF${i + 1}`} />)}
          </div>
        </div>
      )}
      {sfs.length > 0 && (
        <div>
          <ColumnHeader label="Semi-Finals" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {sfs.map((m, i) => <BracketMatchCard key={m.id} match={m} label={`SF${i + 1}`} />)}
          </div>
        </div>
      )}
      {fin && (
        <div>
          <ColumnHeader label="Grand Final" />
          <div className="max-w-[280px] mt-3">
            <BracketMatchCard match={fin} label="Final" highlight />
          </div>
        </div>
      )}
      {bronze && (
        <div>
          <ColumnHeader label="Bronze Match · 3rd Place" />
          <div className="max-w-[280px] mt-3">
            <BracketMatchCard match={bronze} label="Bronze" />
          </div>
        </div>
      )}
      <Legend />
    </div>
  );
}

// ── SVG Connectors ───────────────────────────────────────────
// H28 = header height (28px) — the QF column starts cards after the header,
// so the SVG connectors must offset their Y by 28px to align with the SF/Final columns
// which also start their cards at top+28.
const H28 = 28;
const SVG_H = TOTAL_H + H28;

function QfToSfConnector() {
  const stroke = 'rgb(var(--surface-border))';
  // QF Y centers offset by H28 (the header above cards in the QF flex column)
  const y1 = QF1_CY + H28, y2 = QF2_CY + H28, y3 = QF3_CY + H28, y4 = QF4_CY + H28;
  const sf1y = SF1_CY + H28, sf2y = SF2_CY + H28;
  return (
    <div style={{ width: CONN_W, height: SVG_H }} className="relative shrink-0">
      <svg width={CONN_W} height={SVG_H} style={{ overflow: 'visible' }}>
        {/* Pair 1: QF1 + QF2 → SF1 */}
        <line x1={0}        y1={y1}   x2={CONN_W/2} y2={y1}   stroke={stroke} strokeWidth={2} />
        <line x1={0}        y1={y2}   x2={CONN_W/2} y2={y2}   stroke={stroke} strokeWidth={2} />
        <line x1={CONN_W/2} y1={y1}   x2={CONN_W/2} y2={y2}   stroke={stroke} strokeWidth={2} />
        <line x1={CONN_W/2} y1={sf1y} x2={CONN_W}   y2={sf1y} stroke={stroke} strokeWidth={2} />
        {/* Pair 2: QF3 + QF4 → SF2 */}
        <line x1={0}        y1={y3}   x2={CONN_W/2} y2={y3}   stroke={stroke} strokeWidth={2} />
        <line x1={0}        y1={y4}   x2={CONN_W/2} y2={y4}   stroke={stroke} strokeWidth={2} />
        <line x1={CONN_W/2} y1={y3}   x2={CONN_W/2} y2={y4}   stroke={stroke} strokeWidth={2} />
        <line x1={CONN_W/2} y1={sf2y} x2={CONN_W}   y2={sf2y} stroke={stroke} strokeWidth={2} />
      </svg>
    </div>
  );
}

function SfToFinalConnector() {
  const stroke = 'rgb(var(--surface-border))';
  const sf1y = SF1_CY + H28, sf2y = SF2_CY + H28, finy = FIN_CY + H28;
  return (
    <div style={{ width: CONN_W, height: SVG_H }} className="relative shrink-0">
      <svg width={CONN_W} height={SVG_H} style={{ overflow: 'visible' }}>
        <line x1={0}        y1={sf1y} x2={CONN_W/2} y2={sf1y} stroke={stroke} strokeWidth={2} />
        <line x1={0}        y1={sf2y} x2={CONN_W/2} y2={sf2y} stroke={stroke} strokeWidth={2} />
        <line x1={CONN_W/2} y1={sf1y} x2={CONN_W/2} y2={sf2y} stroke={stroke} strokeWidth={2} />
        <line x1={CONN_W/2} y1={finy} x2={CONN_W}   y2={finy} stroke={stroke} strokeWidth={2} />
      </svg>
    </div>
  );
}

// ── BracketMatchCard ─────────────────────────────────────────

function BracketMatchCard({
  match, label, highlight = false,
}: {
  match: BracketMatch; label: string; highlight?: boolean;
}) {
  const isLive      = match.status === 'live';
  const isCompleted = match.status === 'completed';
  const team1Won    = isCompleted && match.winner_id === match.team1?.id;
  const team2Won    = isCompleted && match.winner_id === match.team2?.id;

  return (
    <div className={cn(
      'w-[260px] rounded-lg border overflow-hidden',
      isLive     && 'border-live/50 shadow-[0_0_14px_rgba(249,115,22,0.2)]',
      highlight && !isLive && 'border-brand/50',
      !isLive && !highlight && 'border-surface-border',
    )}>
      <div className={cn(
        'flex items-center justify-between px-3 py-1.5 text-xs border-b',
        highlight ? 'bg-brand/10 border-brand/20' : 'bg-surface border-surface-border',
      )}>
        <span className={cn('font-semibold uppercase tracking-wide', highlight ? 'text-brand' : 'text-muted')}>
          {label}
        </span>
        <div className="flex items-center gap-2 text-muted">
          {isLive && (
            <span className="flex items-center gap-1 text-live font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-live animate-pulse" />
              LIVE
            </span>
          )}
          {match.match_date && <span>{formatDateTime(match.match_date)}</span>}
        </div>
      </div>
      <div className="bg-surface-card">
        <BracketTeamRow
          name={match.team1?.player_name ?? match.team1?.name ?? 'TBD'}
          score={match.score1}
          isWinner={team1Won}
          isLoser={isCompleted && !team1Won && !!match.team1}
          isPending={!match.team1}
        />
        <div className="h-px bg-surface-border" />
        <BracketTeamRow
          name={match.team2?.player_name ?? match.team2?.name ?? 'TBD'}
          score={match.score2}
          isWinner={team2Won}
          isLoser={isCompleted && !team2Won && !!match.team2}
          isPending={!match.team2}
        />
      </div>
    </div>
  );
}

function BracketTeamRow({
  name, score, isWinner, isLoser, isPending,
}: {
  name: string; score: number | null;
  isWinner: boolean; isLoser: boolean; isPending: boolean;
}) {
  return (
    <div className={cn(
      'flex items-center justify-between px-3 py-2.5',
      isWinner  && 'bg-win/10',
      isLoser   && 'bg-surface/60',
      isPending && 'bg-surface/40',
    )}>
      <div className="flex items-center gap-2 min-w-0">
        {isWinner && <span className="text-win text-xs shrink-0">▶</span>}
        <span className={cn(
          'text-sm font-medium truncate',
          isWinner  && 'text-win font-semibold',
          isLoser   && 'text-gray-500 line-through decoration-gray-600',
          isPending && 'text-gray-600 italic',
          !isWinner && !isLoser && !isPending && 'text-foreground',
        )}>
          {name}
        </span>
      </div>
      {score !== null
        ? <span className={cn('text-base font-bold tabular-nums ml-3 shrink-0', isWinner && 'text-win', isLoser && 'text-gray-600', !isWinner && !isLoser && 'text-foreground')}>{score}</span>
        : <span className="text-gray-600 text-sm ml-3 shrink-0">—</span>
      }
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────

function ColumnHeader({ label }: { label: string }) {
  return (
    <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">{label}</div>
  );
}

function PlaceholderCard({ label }: { label: string }) {
  return (
    <div className="w-[260px] rounded-lg border border-dashed border-surface-border px-4 py-8 text-center text-gray-600 text-sm">
      {label}
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-4 mt-6 text-xs text-gray-600">
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-win/20 border border-win/40" /> Winner
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-loss/20 border border-loss/40" /> Eliminated
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-sm bg-live/20 border border-live/40" /> Live
      </span>
    </div>
  );
}
