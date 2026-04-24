import type {
  Tournament, Match, StandingsGroup, Bracket, LeaderboardData, DartsGroup, DartsBracket,
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
    async updateStatus(id: number | string, status: 'upcoming' | 'ongoing' | 'completed') {
      const res = await fetch(`${API_BASE}/tournaments/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update tournament status');
      return res.json();
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
    async clearIndividualPlacements(id: number | string) {
      const res = await fetch(`${API_BASE}/tournaments/${id}/individual-placements`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to clear placements');
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

  darts: {
    groups: {
      list(tournamentId: number | string) {
        return get<DartsGroup[]>(`/darts/groups?tournamentId=${tournamentId}`);
      },
      async create(body: { tournament_id: number; players: { name: string; team_id: number }[] }) { // 2–6 players
        const res = await fetch(`${API_BASE}/darts/groups`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(body),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error ?? 'Failed to create darts group');
        }
        return res.json();
      },
      async delete(id: number | string) {
        const res = await fetch(`${API_BASE}/darts/groups/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete darts group');
        return res.json();
      },
    },

    matches: {
      list(params: { tournamentId: number | string; stage?: string; status?: string }) {
        const qs = '?' + new URLSearchParams(
          Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
        ).toString();
        return get<Match[]>(`/darts/matches${qs}`);
      },
      async update(id: number | string, body: { score1?: number; score2?: number; status?: string }) {
        const res = await fetch(`${API_BASE}/darts/matches/${id}`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`Failed to update darts match ${id}`);
        return res.json();
      },
      async create(body: { tournament_id: number; group_id?: number | null; stage: string; team1_id?: number | null; team2_id?: number | null; team1_player_name?: string | null; team2_player_name?: string | null; match_date?: string; status?: string }) {
        const res = await fetch(`${API_BASE}/darts/matches`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Failed to create darts match');
        return res.json();
      },
      async delete(id: number | string) {
        const res = await fetch(`${API_BASE}/darts/matches/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`Failed to delete darts match ${id}`);
        return res.json();
      },
    },

    bracket: {
      get(tournamentId: number | string) {
        return get<DartsBracket>(`/darts/bracket?tournamentId=${tournamentId}`);
      },
    },

    standings: {
      get(tournamentId: number | string) {
        return get<StandingsGroup[]>(`/darts/standings?tournamentId=${tournamentId}`);
      },
    },
  },

  tt: {
    groups: {
      list(tournamentId: number | string) {
        return get<{ id: number; name: string; teams: { id: number; name: string; short_name: string | null; player_name: string | null }[] }[]>(
          `/tt/groups?tournamentId=${tournamentId}`
        );
      },
      async create(body: { tournament_id: number; players: { team_id: number; name: string }[] }) {
        const res = await fetch(`${API_BASE}/tt/groups`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(body),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error ?? 'Failed to create TT group');
        }
        return res.json();
      },
      async delete(id: number | string) {
        const res = await fetch(`${API_BASE}/tt/groups/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete TT group');
        return res.json();
      },
    },
    matches: {
      list(params: { tournamentId: number | string; stage?: string; status?: string }) {
        const qs = '?' + new URLSearchParams(
          Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
        ).toString();
        return get<Match[]>(`/tt/matches${qs}`);
      },
      async update(id: number | string, body: { score1?: number; score2?: number; status?: string }) {
        const res = await fetch(`${API_BASE}/tt/matches/${id}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`Failed to update TT match ${id}`);
        return res.json();
      },
      async create(body: { tournament_id: number; group_id?: number | null; stage: string; team1_id?: number | null; team2_id?: number | null; team1_player_name?: string | null; team2_player_name?: string | null; match_date?: string; status?: string }) {
        const res = await fetch(`${API_BASE}/tt/matches`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Failed to create TT match');
        return res.json();
      },
      async delete(id: number | string) {
        const res = await fetch(`${API_BASE}/tt/matches/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`Failed to delete TT match ${id}`);
        return res.json();
      },
    },
    bracket: {
      get(tournamentId: number | string) {
        return get<DartsBracket>(`/tt/bracket?tournamentId=${tournamentId}`);
      },
    },
    standings: {
      get(tournamentId: number | string) {
        return get<StandingsGroup[]>(`/tt/standings?tournamentId=${tournamentId}`);
      },
    },
  },

  teams: {
    list(params?: { sportId?: number }) {
      const qs = params?.sportId ? `?sportId=${params.sportId}` : '';
      return get<{ id: number; name: string; short_name: string | null; country: string | null; player_name: string | null }[]>(`/tournaments/teams${qs}`);
    },
    async update(id: number, player_name: string) {
      const res = await fetch(`${API_BASE}/tournaments/teams/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ player_name }),
      });
      if (!res.ok) throw new Error('Failed to update team');
      return res.json();
    },
  },
};
