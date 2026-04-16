'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Match, StandingsGroup, Bracket as BracketType } from '@/lib/types';
import MatchCard from '@/components/MatchCard';
import StandingsTable from '@/components/StandingsTable';
import Bracket from '@/components/Bracket';
import { cn, stageLabel } from '@/lib/utils';

type TabId = 'overview' | 'matches' | 'standings' | 'bracket';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview',  label: 'Overview'  },
  { id: 'matches',   label: 'Matches'   },
  { id: 'standings', label: 'Standings' },
  { id: 'bracket',   label: 'Bracket'   },
];

export default function TournamentTabs({ tournamentId }: { tournamentId: string }) {
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
      if (tab === 'standings' || tab === 'overview') {
        const data = await api.standings.get(tournamentId);
        setStandings(data);
      }
      if (tab === 'bracket') {
        const data = await api.bracket.get(tournamentId);
        setBracket(data);
      }
    } catch (e) {
      setError('Failed to load data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab, fetchData]);

  const handleTab = (tab: TabId) => {
    setActiveTab(tab);
  };

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-surface-border mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTab(tab.id)}
            className={cn(
              'px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab.id
                ? 'border-b-2 border-brand text-white -mb-px'
                : 'text-gray-400 hover:text-gray-200 border-b-2 border-transparent',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading / error states */}
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

      {/* ── Overview ──────────────────────────────────────── */}
      {activeTab === 'overview' && !loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent / Live matches */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Recent & Live Matches
            </h3>
            {matches.length === 0 ? (
              <p className="text-gray-500 text-sm">No matches yet.</p>
            ) : (
              <div className="space-y-3">
                {matches
                  .filter((m) => m.status !== 'upcoming')
                  .slice(0, 4)
                  .map((m) => <MatchCard key={m.id} match={m} />)
                }
              </div>
            )}
          </div>

          {/* Standings preview */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Group Standings
            </h3>
            <StandingsTable groups={standings} />
          </div>
        </div>
      )}

      {/* ── Matches ───────────────────────────────────────── */}
      {activeTab === 'matches' && !loading && !error && (
        <MatchesTab matches={matches} />
      )}

      {/* ── Standings ─────────────────────────────────────── */}
      {activeTab === 'standings' && !loading && !error && (
        <StandingsTable groups={standings} />
      )}

      {/* ── Bracket ───────────────────────────────────────── */}
      {activeTab === 'bracket' && !loading && !error && bracket && (
        <Bracket bracket={bracket} />
      )}
      {activeTab === 'bracket' && !loading && !error && !bracket && (
        <p className="text-gray-500 text-sm">Bracket not available yet.</p>
      )}
    </div>
  );
}

/* ─── Matches Tab ────────────────────────────────────────────── */

function MatchesTab({ matches }: { matches: Match[] }) {
  const stages = ['group', 'semi', 'bronze', 'final'] as const;
  const byStage = Object.fromEntries(
    stages.map((s) => [s, matches.filter((m) => m.stage === s)])
  );

  if (!matches.length) {
    return <p className="text-gray-500 text-sm">No matches scheduled yet.</p>;
  }

  return (
    <div className="space-y-8">
      {stages.map((stage) => {
        const group = byStage[stage];
        if (!group.length) return null;

        // For group stage, sub-group by group letter
        if (stage === 'group') {
          const subGroups: Record<string, Match[]> = {};
          for (const m of group) {
            const key = m.group_name ?? 'Unknown';
            if (!subGroups[key]) subGroups[key] = [];
            subGroups[key].push(m);
          }
          return (
            <section key={stage}>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                {stageLabel(stage)}
              </h3>
              <div className="space-y-6">
                {Object.entries(subGroups).sort().map(([groupName, gMatches]) => (
                  <div key={groupName}>
                    <p className="text-xs text-gray-500 mb-2 ml-1">Group {groupName}</p>
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
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              {stageLabel(stage)}
            </h3>
            <div className="space-y-3 max-w-lg">
              {group.map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}
