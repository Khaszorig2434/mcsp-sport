'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Match, StandingsGroup, Bracket as BracketType, DartsBracket as DartsBracketType } from '@/lib/types';
import MatchCard from '@/components/MatchCard';
import StandingsTable from '@/components/StandingsTable';
import Bracket from '@/components/Bracket';
import DartsBracket from '@/components/DartsBracket';
import { cn, stageLabel } from '@/lib/utils';

const PLACEMENT_SPORTS = ['Table Tennis', 'Chess'];
const DARTS_SPORT = 'Darts';

type TabId = 'overview' | 'matches' | 'bracket';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'matches',  label: 'Matches'  },
  { id: 'bracket',  label: 'Bracket'  },
];

interface IndivPlacement {
  place:       number;
  player_name: string;
  team_id:     number | null;
  team_name:   string | null;
}

export default function TournamentTabs({
  tournamentId,
  sportName,
}: {
  tournamentId: string;
  sportName:    string;
}) {
  const isIndividual = PLACEMENT_SPORTS.includes(sportName);
  const isDarts      = sportName === DARTS_SPORT;

  if (isIndividual) return <IndividualSportView tournamentId={tournamentId} />;
  if (isDarts)      return <DartsSportTabs tournamentId={tournamentId} />;

  return <BracketSportTabs tournamentId={tournamentId} />;
}

/* ─── Individual Sport View ─────────────────────────────────────── */

const MEDAL_CONFIG = [
  { label: '1st Place',  ring: 'ring-yellow-400/50', bg: 'bg-yellow-400/10', text: 'text-yellow-500',  icon: '🥇', size: 'lg' },
  { label: '2nd Place',  ring: 'ring-gray-400/40',   bg: 'bg-gray-400/10',   text: 'text-gray-400',   icon: '🥈', size: 'md' },
  { label: '3rd Place',  ring: 'ring-orange-400/40', bg: 'bg-orange-400/10', text: 'text-orange-500', icon: '🥉', size: 'md' },
  { label: '4th Place',  ring: 'ring-surface-border',bg: 'bg-surface-hover', text: 'text-muted',      icon: '4️⃣', size: 'sm' },
];

function IndividualSportView({ tournamentId }: { tournamentId: string }) {
  const [placements, setPlacements] = useState<IndivPlacement[]>([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    api.tournaments.getIndividualPlacements(tournamentId)
      .then(setPlacements)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tournamentId]);

  const podiumOrder = [placements[1], placements[0], placements[2]].filter(Boolean) as IndivPlacement[];
  const hasPlacements = placements.length > 0;

  return (
    <div className="space-y-8">

      {/* Results section */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Final Results</span>
          <div className="flex-1 h-px bg-surface-border" />
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1,2,3].map((i) => <div key={i} className="h-40 rounded-2xl bg-surface-card animate-pulse" />)}
          </div>
        ) : !hasPlacements ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl border border-dashed border-surface-border text-center">
            <span className="text-4xl">🏆</span>
            <p className="text-sm font-semibold text-foreground">Results not yet available</p>
            <p className="text-xs text-muted max-w-xs">
              Placements will appear here once the tournament concludes and results are entered.
            </p>
          </div>
        ) : (
          <>
            {/* Podium — top 3 */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {podiumOrder.map((p) => {
                const cfg  = MEDAL_CONFIG[p.place - 1];
                const is1st = p.place === 1;
                return (
                  <div
                    key={p.place}
                    className={cn(
                      'relative flex flex-col items-center gap-3 rounded-2xl border p-5 text-center ring-1 transition-all',
                      cfg.bg, cfg.ring,
                      is1st ? '-mt-4 shadow-lg' : '',
                      'border-surface-border',
                    )}
                  >
                    {is1st && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 rounded-full px-3 py-0.5">
                        <span className="text-[10px] font-black text-yellow-900 uppercase tracking-wider">Champion</span>
                      </div>
                    )}
                    <span className={cn('text-3xl', is1st ? 'text-4xl' : '')}>{cfg.icon}</span>
                    <div>
                      <p className={cn('font-black leading-tight', is1st ? 'text-xl text-foreground' : 'text-base text-foreground')}>
                        {p.player_name}
                      </p>
                      {p.team_name && (
                        <p className={cn('text-xs mt-1 font-semibold', cfg.text)}>{p.team_name}</p>
                      )}
                    </div>
                    <span className={cn('text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full', cfg.bg, cfg.text)}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 4th place — compact row */}
            {placements[3] && (
              <div className="flex items-center gap-4 bg-surface-card border border-surface-border rounded-xl px-5 py-3">
                <span className="text-xl">4️⃣</span>
                <div className="flex-1">
                  <p className="font-bold text-sm text-foreground">{placements[3].player_name}</p>
                  {placements[3].team_name && (
                    <p className="text-xs text-muted">{placements[3].team_name}</p>
                  )}
                </div>
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">4th Place</span>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}

/* ─── Darts Sport Tabs ───────────────────────────────────────────── */

function DartsSportTabs({ tournamentId }: { tournamentId: string }) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [matches,   setMatches]   = useState<Match[]>([]);
  const [standings, setStandings] = useState<StandingsGroup[]>([]);
  const [bracket,   setBracket]   = useState<DartsBracketType | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const fetchData = useCallback(async (tab: TabId) => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'overview' || tab === 'matches') {
        const data = await api.darts.matches.list({ tournamentId });
        setMatches(data);
      }
      if (tab === 'overview') {
        const data = await api.darts.standings.get(tournamentId);
        setStandings(data);
      }
      if (tab === 'bracket') {
        const data = await api.darts.bracket.get(tournamentId);
        setBracket(data);
      }
    } catch {
      setError('Failed to load data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => { fetchData(activeTab); }, [activeTab, fetchData]);

  return (
    <div>
      <div className="flex border-b border-surface-border mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab.id
                ? 'border-b-2 border-brand text-foreground -mb-px'
                : 'text-muted hover:text-foreground border-b-2 border-transparent',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-lg bg-surface-card animate-pulse" />)}
        </div>
      )}
      {error && !loading && (
        <div className="rounded-lg bg-loss/10 border border-loss/30 text-loss text-sm px-4 py-3">{error}</div>
      )}

      {activeTab === 'overview' && !loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Recent & Live Matches</h3>
            {matches.length === 0
              ? <p className="text-gray-500 text-sm">No matches yet.</p>
              : <div className="space-y-3">{matches.filter((m) => m.status !== 'upcoming').slice(0, 4).map((m) => <MatchCard key={m.id} match={m} />)}</div>
            }
          </div>
          <div>
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Group Standings</h3>
            <StandingsTable groups={standings} />
          </div>
        </div>
      )}
      {activeTab === 'matches'  && !loading && !error && <DartsMatchesTab matches={matches} />}
      {activeTab === 'bracket'  && !loading && !error && (
        bracket ? <DartsBracket bracket={bracket} /> : <p className="text-muted text-sm">Bracket not available yet.</p>
      )}
    </div>
  );
}

function DartsMatchesTab({ matches }: { matches: Match[] }) {
  const stages = ['group', 'quarterfinal', 'semi', 'bronze', 'final'] as const;
  const byStage = Object.fromEntries(stages.map((s) => [s, matches.filter((m) => m.stage === s)]));

  if (!matches.length) return <p className="text-gray-500 text-sm">No matches scheduled yet.</p>;

  return (
    <div className="space-y-8">
      {stages.map((stage) => {
        const group = byStage[stage];
        if (!group.length) return null;
        if (stage === 'group') {
          const subGroups: Record<string, Match[]> = {};
          for (const m of group) {
            const key = m.group_name ?? 'Unknown';
            if (!subGroups[key]) subGroups[key] = [];
            subGroups[key].push(m);
          }
          return (
            <section key={stage}>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">{stageLabel(stage)}</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(subGroups).sort().map(([groupName, gMatches]) => (
                  <div key={groupName}>
                    <p className="text-xs text-muted mb-2 ml-1">Group {groupName}</p>
                    <div className="space-y-3">{gMatches.map((m) => <MatchCard key={m.id} match={m} />)}</div>
                  </div>
                ))}
              </div>
            </section>
          );
        }
        return (
          <section key={stage}>
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">{stageLabel(stage)}</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {group.map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/* ─── Bracket Sport Tabs ─────────────────────────────────────────── */

function BracketSportTabs({ tournamentId }: { tournamentId: string }) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [matches,   setMatches]   = useState<Match[]>([]);
  const [standings, setStandings] = useState<StandingsGroup[]>([]);
  const [bracket,   setBracket]   = useState<BracketType | null>(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const fetchData = useCallback(async (tab: TabId) => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'overview' || tab === 'matches') {
        const data = await api.matches.list({ tournamentId });
        setMatches(data);
      }
      if (tab === 'overview') {
        const data = await api.standings.get(tournamentId);
        setStandings(data);
      }
      if (tab === 'bracket') {
        const bracketData = await api.bracket.get(tournamentId);
        setBracket(bracketData);
      }
    } catch {
      setError('Failed to load data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, fetchData]);

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-surface-border mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab.id
                ? 'border-b-2 border-brand text-foreground -mb-px'
                : 'text-muted hover:text-foreground border-b-2 border-transparent',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-lg bg-surface-card animate-pulse" />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="rounded-lg bg-loss/10 border border-loss/30 text-loss text-sm px-4 py-3">
          {error}
        </div>
      )}

      {activeTab === 'overview' && !loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Recent & Live Matches</h3>
            {matches.length === 0 ? (
              <p className="text-gray-500 text-sm">No matches yet.</p>
            ) : (
              <div className="space-y-3">
                {matches.filter((m) => m.status !== 'upcoming').slice(0, 4).map((m) => <MatchCard key={m.id} match={m} />)}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Group Standings</h3>
            <StandingsTable groups={standings} />
          </div>
        </div>
      )}

      {activeTab === 'matches' && !loading && !error && <MatchesTab matches={matches} />}
      {activeTab === 'bracket' && !loading && !error && (
        <div>
          {bracket ? <Bracket bracket={bracket} /> : <p className="text-muted text-sm">Bracket not available yet.</p>}
        </div>
      )}
    </div>
  );
}

/* ─── Matches Tab ────────────────────────────────────────────────── */

function MatchesTab({ matches }: { matches: Match[] }) {
  const stages = ['group', 'quarterfinal', 'semi', 'bronze', 'final'] as const;
  const byStage = Object.fromEntries(stages.map((s) => [s, matches.filter((m) => m.stage === s)]));

  if (!matches.length) return <p className="text-gray-500 text-sm">No matches scheduled yet.</p>;

  return (
    <div className="space-y-8">
      {stages.map((stage) => {
        const group = byStage[stage];
        if (!group.length) return null;
        if (stage === 'group') {
          const subGroups: Record<string, Match[]> = {};
          for (const m of group) {
            const key = m.group_name ?? 'Unknown';
            if (!subGroups[key]) subGroups[key] = [];
            subGroups[key].push(m);
          }
          return (
            <section key={stage}>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">{stageLabel(stage)}</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.entries(subGroups).sort().map(([groupName, gMatches]) => (
                  <div key={groupName}>
                    <p className="text-xs text-muted mb-2 ml-1">Group {groupName}</p>
                    <div className="space-y-3">
                      {gMatches.map((m) => <MatchCard key={m.id} match={m} />)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        }
        return (
          <section key={stage}>
            <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">{stageLabel(stage)}</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {group.map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}
