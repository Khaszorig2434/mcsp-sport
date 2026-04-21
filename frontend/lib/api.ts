import type {
  Tournament, Match, StandingsGroup, Bracket, LeaderboardData,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : '/api';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export const api = {
  tournaments: {
    list(params?: { sport?: string; status?: string; gender?: string }) {
      const qs = params ? '?' + new URLSearchParams(
        Object.entries(params).filter(([, v]) => !!v) as [string, string][]
      ).toString() : '';
      return get<Tournament[]>(`/tournaments${qs}`);
    },
    get(id: number | string) {
      return get<Tournament>(`/tournaments/${id}`);
    },
    getIndividualPlacements(id: number | string) {
      return get<{ place: number; player_name: string; team_id: number | null; team_name: string | null }[]>(
        `/tournaments/${id}/individual-placements`
      );
    },
    async setIndividualPlacements(id: number | string, entries: { place: number; player_name: string; team_id: number | null }[]) {
      const res = await fetch(`${API_BASE}/tournaments/${id}/individual-placements`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(entries),
      });
      if (!res.ok) throw new Error('Failed to save placements');
      return res.json();
    },
  },

  matches: {
    list(params: { tournamentId: number | string; stage?: string; status?: string }) {
      const qs = '?' + new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
      ).toString();
      return get<Match[]>(`/matches${qs}`);
    },
    live() {
      return get<Match[]>('/matches/live');
    },
    async update(id: number | string, body: { score1?: number; score2?: number; status?: string }) {
      const res = await fetch(`${API_BASE}/matches/${id}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Failed to update match ${id}`);
      return res.json();
    },
    async create(body: { tournament_id: number; group_id?: number | null; stage: string; team1_id?: number | null; team2_id?: number | null; match_date?: string; status?: string }) {
      const res = await fetch(`${API_BASE}/matches`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to create match');
      return res.json();
    },
    async delete(id: number | string) {
      const res = await fetch(`${API_BASE}/matches/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Failed to delete match ${id}`);
      return res.json();
    },
  },

  standings: {
    get(tournamentId: number | string) {
      return get<StandingsGroup[]>(`/standings?tournamentId=${tournamentId}`);
    },
  },

  bracket: {
    get(tournamentId: number | string) {
      return get<Bracket>(`/bracket?tournamentId=${tournamentId}`);
    },
  },

  leaderboard: {
    get() {
      return get<LeaderboardData>('/leaderboard');
    },
  },

  schedule: {
    get() {
      return get<Match[]>('/schedule');
    },
  },
};
