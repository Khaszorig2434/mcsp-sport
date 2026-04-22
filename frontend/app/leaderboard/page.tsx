import Link from 'next/link';
import { api } from '@/lib/api';
import type { LeaderboardEntry } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Trophy, Medal, ChevronDown } from 'lucide-react';
import SportIcon from '@/components/SportIcon';

const PLACE_LABEL: Record<number, string> = { 1: '1st', 2: '2nd', 3: '3rd', 4: '4th' };

const SPORT_ICON_KEY: Record<string, string> = {
  'Basketball':   'basketball',
  'Table Tennis': 'table-tennis',
  'Chess':        'chess',
  'Darts':        'darts',
  'CS2':          'cs2',
  'Dota 2':       'dota2',
};

const SCORING_TABLE: Record<string, number[]> = {
  'Basketball':   [12, 8, 4, 1],
  'Table Tennis': [5, 3, 1, 0.5],
  'Chess':        [5, 3, 1, 0.5],
  'Darts':        [5, 3, 1, 0.5],
  'CS2':          [8, 5, 2, 0.5],
  'Dota 2':       [8, 5, 2, 0.5],
};

/* ─── Team Scoring Matrix ────────────────────────────────────────── */

const MATRIX_SPORTS = [
  { name: 'Basketball',   short: 'Basketball',  hasWomen: true  },
  { name: 'Table Tennis', short: 'Table Tennis',hasWomen: true  },
  { name: 'Darts',        short: 'Darts',       hasWomen: true  },
  { name: 'Chess',        short: 'Chess',       hasWomen: true  },
  { name: 'CS2',          short: 'CS2',         hasWomen: false },
  { name: 'Dota 2',       short: 'Dota 2',      hasWomen: false },
];
const TEAMS_ORDER = ['Team 1', 'Team 2', 'Team 3', 'Team 4', 'Team 5', 'Team 6'];
const PLACE_LABELS = ['I', 'II', 'III', 'IV'];
const PLACE_CELL_COLORS: Record<number, string> = {
  1: 'bg-yellow-400/20 text-yellow-500 font-black',
  2: 'bg-gray-400/15 text-gray-400 font-bold',
  3: 'bg-orange-400/15 text-orange-500 font-bold',
  4: 'bg-surface-hover text-muted font-semibold',
};

function TeamScoringMatrix({ leaderboard }: { leaderboard: LeaderboardEntry[] }) {
  // Build lookup: teamName → sportName → gender → place → points
  type Lookup = Record<string, Record<string, Record<string, Record<number, number>>>>;
  const lookup: Lookup = {};
  for (const entry of leaderboard) {
    lookup[entry.team_name] = {};
    for (const r of entry.results) {
      if (!lookup[entry.team_name][r.sport_name]) lookup[entry.team_name][r.sport_name] = {};
      if (!lookup[entry.team_name][r.sport_name][r.gender]) lookup[entry.team_name][r.sport_name][r.gender] = {};
      lookup[entry.team_name][r.sport_name][r.gender][r.place] = r.points;
    }
  }

  const teamsSorted = TEAMS_ORDER.filter((t) => leaderboard.some((e) => e.team_name === t));

  return (
    <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-surface-border">
        <h2 className="text-sm font-bold text-foreground">Team Placement Breakdown</h2>
        <p className="text-xs text-muted mt-0.5">Placements per sport and gender across all tournaments</p>
      </div>
      <div className="overflow-x-auto">
        <table className="text-xs border-collapse" style={{ minWidth: '900px' }}>
          <thead>
            {/* Sport group headers */}
            <tr className="border-b border-surface-border">
              <th className="sticky left-0 z-10 bg-surface-card px-4 py-2.5 text-left text-[10px] font-bold text-muted uppercase tracking-wider min-w-[110px]" rowSpan={2}>
                Team
              </th>
              {MATRIX_SPORTS.map((sp) => (
                <th
                  key={sp.name}
                  colSpan={sp.hasWomen ? 8 : 4}
                  className="px-2 py-2 text-center font-bold text-foreground border-l border-surface-border"
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <SportIcon icon={SPORT_ICON_KEY[sp.name] ?? ''} size={14} />
                    {sp.short}
                  </span>
                </th>
              ))}
              <th className="px-3 py-2 text-center font-bold text-foreground border-l border-surface-border whitespace-nowrap">Pts</th>
              <th className="px-3 py-2 text-center font-bold text-foreground whitespace-nowrap">Rank</th>
            </tr>
            {/* Place sub-headers */}
            <tr className="border-b border-surface-border bg-surface/40">
              {MATRIX_SPORTS.map((sp) =>
                (sp.hasWomen ? ['M', 'W'] : ['M']).map((g) =>
                  PLACE_LABELS.map((pl, pi) => (
                    <th key={`${sp.name}-${g}-${pi}`}
                      className={cn(
                        'px-2 py-1.5 text-center text-[9px] font-bold text-muted uppercase tracking-wide w-9',
                        pi === 0 && 'border-l border-surface-border',
                      )}>
                      <div className="text-[8px] text-muted/60">{g}</div>
                      {pl}
                    </th>
                  ))
                )
              )}
              <th className="border-l border-surface-border" />
              <th />
            </tr>
          </thead>
          <tbody>
            {teamsSorted.map((teamName, idx) => {
              const entry = leaderboard.find((e) => e.team_name === teamName);
              const tl = lookup[teamName] ?? {};
              return (
                <tr key={teamName}
                  className={cn(
                    'border-b border-surface-border/40 last:border-0 transition-colors hover:bg-surface-hover',
                    idx === 0 && 'bg-yellow-400/5',
                  )}>
                  <td className="sticky left-0 z-10 bg-surface-card px-4 py-3 font-bold text-foreground whitespace-nowrap">
                    {entry && <RankBadge rank={entry.rank} />}
                    <span className="ml-2">{teamName}</span>
                  </td>
                  {MATRIX_SPORTS.map((sp) =>
                    (sp.hasWomen ? ['male', 'female'] : ['male']).map((g) =>
                      [1, 2, 3, 4].map((place) => {
                        const pts = tl[sp.name]?.[g]?.[place];
                        return (
                          <td key={`${sp.name}-${g}-${place}`}
                            className={cn(
                              'text-center w-9 py-2.5',
                              place === 1 && 'border-l border-surface-border',
                            )}>
                            {pts !== undefined ? (
                              <span className={cn(
                                'inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px]',
                                PLACE_CELL_COLORS[place],
                              )}>
                                {PLACE_LABELS[place - 1]}
                              </span>
                            ) : (
                              <span className="text-surface-border text-[10px]">·</span>
                            )}
                          </td>
                        );
                      })
                    )
                  )}
                  <td className="border-l border-surface-border px-3 py-2.5 text-center font-black text-foreground tabular-nums">
                    {entry?.total_points ?? 0}
                  </td>
                  <td className="px-3 py-2.5 text-center font-bold text-muted tabular-nums">
                    {entry ? `#${entry.rank}` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return (
    <div className="w-8 h-8 rounded-full bg-yellow-400/20 flex items-center justify-center">
      <Trophy size={15} className="text-yellow-500" />
    </div>
  );
  if (rank === 2) return (
    <div className="w-8 h-8 rounded-full bg-gray-400/20 flex items-center justify-center">
      <span className="text-xs font-bold text-gray-400">2</span>
    </div>
  );
  if (rank === 3) return (
    <div className="w-8 h-8 rounded-full bg-orange-400/20 flex items-center justify-center">
      <span className="text-xs font-bold text-orange-500">3</span>
    </div>
  );
  return (
    <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center">
      <span className="text-xs font-semibold text-muted">{rank}</span>
    </div>
  );
}

function PlaceBadge({ place }: { place: number }) {
  const colors: Record<number, string> = {
    1: 'bg-yellow-400/15 text-yellow-500 border border-yellow-400/30',
    2: 'bg-gray-400/15 text-gray-400 border border-gray-400/30',
    3: 'bg-orange-400/15 text-orange-500 border border-orange-400/30',
    4: 'bg-surface-hover text-muted border border-surface-border',
  };
  return (
    <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-md', colors[place])}>
      {PLACE_LABEL[place]}
    </span>
  );
}

export default async function LeaderboardPage() {
  let data;
  try {
    data = await api.leaderboard.get();
  } catch {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-muted text-sm">Could not load leaderboard.</p>
      </div>
    );
  }

  const { leaderboard } = data;
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero banner */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0E1C39 0%, #143D8C 50%, #950D4C 100%)' }}>
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-4">
            <Trophy size={14} className="text-yellow-400" />
            <span className="text-xs font-semibold text-white/80 uppercase tracking-widest">Leaderboard</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-black text-white mb-2">Overall Standings</h1>
          <p className="text-white/50 text-sm">Points accumulated across all completed tournaments</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Podium top 3 түр хаасан*/}
        {/* {top3.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[top3[1], top3[0], top3[2]].filter(Boolean).map((entry, i) => {
              const isFirst = entry.rank === 1;
              return (
                <div key={entry.team_name}
                  className={cn(
                    'relative bg-surface-card border rounded-2xl p-5 text-center flex flex-col items-center gap-2 transition-all',
                    isFirst ? 'border-yellow-400/40 shadow-lg shadow-yellow-400/10 -mt-4' : 'border-surface-border',
                  )}>
                  {isFirst && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 rounded-full px-3 py-0.5">
                      <span className="text-[10px] font-black text-yellow-900 uppercase tracking-wider">Champion</span>
                    </div>
                  )}
                  <RankBadge rank={entry.rank} />
                  <p className={cn('font-black text-foreground', isFirst ? 'text-lg' : 'text-base')}>{entry.team_name}</p>
                  <p className={cn('font-black tabular-nums', isFirst ? 'text-3xl text-yellow-500' : 'text-2xl text-foreground')}>
                    {entry.total_points}
                    <span className="text-xs font-normal text-muted ml-1">pts</span>
                  </p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">🥇 <span className="font-bold text-foreground">{entry.gold}</span></span>
                    <span className="flex items-center gap-1">🥈 <span className="font-bold text-foreground">{entry.silver}</span></span>
                    <span className="flex items-center gap-1">🥉 <span className="font-bold text-foreground">{entry.bronze}</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        )} */}

        {/* Full rankings table */}
        <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-border flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">Current Rankings</h2>
            <span className="text-xs text-muted">{leaderboard.length} teams</span>
          </div>

          {leaderboard.length === 0 ? (
            <div className="py-16 text-center text-muted text-sm">
              No completed tournaments yet — check back after finals.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border text-[10px] font-bold text-muted uppercase tracking-wider">
                  <th className="text-center px-4 py-3 w-14">#</th>
                  <th className="text-left px-4 py-3">Team</th>
                  <th className="text-center px-3 py-3 w-12">🥇</th>
                  <th className="text-center px-3 py-3 w-12">🥈</th>
                  <th className="text-center px-3 py-3 w-12">🥉</th>
                  <th className="text-left px-4 py-3">Placements</th>
                  <th className="text-right px-4 py-3 w-24">Points</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, idx) => (
                  <tr key={entry.team_name}
                    className={cn(
                      'border-b border-surface-border/40 last:border-0 hover:bg-surface-hover transition-colors',
                      idx === 0 && 'bg-yellow-400/5',
                    )}>
                    <td className="px-4 py-3 text-center">
                      <RankBadge rank={entry.rank} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-foreground">{entry.team_name}</span>
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-foreground tabular-nums">{entry.gold || '—'}</td>
                    <td className="px-3 py-3 text-center font-bold text-foreground tabular-nums">{entry.silver || '—'}</td>
                    <td className="px-3 py-3 text-center font-bold text-foreground tabular-nums">{entry.bronze || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {entry.results.map((r, i) => (
                          <Link
                            key={i}
                            href={`/tournaments/${r.tournament_id}`}
                            className="flex items-center gap-1 bg-surface-hover hover:bg-brand/10 hover:border-brand/30 border border-transparent rounded-lg px-2 py-1 transition-colors"
                          >
                            <SportIcon icon={SPORT_ICON_KEY[r.sport_name] ?? ''} size={16} />
                            <span className="text-[10px] text-muted">{r.sport_name}</span>
                            {r.gender !== 'mixed' && (
                              <span className={cn(
                                'text-[9px] font-bold px-1 py-0.5 rounded',
                                r.gender === 'female' ? 'bg-pink-500/15 text-pink-400' : 'bg-sky-500/15 text-sky-400',
                              )}>
                                {r.gender === 'female' ? 'W' : 'M'}
                              </span>
                            )}
                            <PlaceBadge place={r.place} />
                            <span className="text-[10px] font-bold text-brand">+{r.points}</span>
                          </Link>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-lg font-black text-foreground tabular-nums">{entry.total_points}</span>
                      <span className="text-xs text-muted ml-1">pts</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Sport-by-sport scoring matrix */}
        <TeamScoringMatrix leaderboard={leaderboard} />

        {/* Scoring reference table */}
        <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-border">
            <h2 className="text-sm font-bold text-foreground">Scoring System</h2>
            <p className="text-xs text-muted mt-0.5">Points awarded per placement by sport</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border text-[10px] font-bold text-muted uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Sport</th>
                  <th className="text-center px-4 py-3">🥇 1st</th>
                  <th className="text-center px-4 py-3">🥈 2nd</th>
                  <th className="text-center px-4 py-3">🥉 3rd</th>
                  <th className="text-center px-4 py-3">4th</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(SCORING_TABLE).map(([sport, pts]) => (
                  <tr key={sport} className="border-b border-surface-border/40 last:border-0 hover:bg-surface-hover transition-colors">
                    <td className="px-5 py-3 font-semibold text-foreground">
                      <span className="inline-flex items-center gap-2">
                        <SportIcon icon={SPORT_ICON_KEY[sport] ?? ''} size={20} />{sport}
                      </span>
                    </td>
                    {pts.map((p, i) => (
                      <td key={i} className="px-4 py-3 text-center font-bold tabular-nums text-foreground">{p}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
