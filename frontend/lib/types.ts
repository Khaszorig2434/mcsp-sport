export type SportType = 'esports' | 'traditional';
export type Gender    = 'male' | 'female' | 'mixed';
export type TournamentStatus = 'upcoming' | 'ongoing' | 'completed';
export type MatchStatus      = 'upcoming' | 'live' | 'completed';
export type Stage            = 'group' | 'semi' | 'bronze' | 'final';

export interface Sport {
  id:         number;
  name:       string;
  type:       SportType;
  icon:       string;
}

export interface Team {
  id:         number;
  name:       string;
  short_name: string;
  country:    string;
  logo_url:   string | null;
}

export interface Group {
  group_id:   number;
  group_name: string;
  teams:      Team[];
}

export interface Tournament {
  id:               number;
  name:             string;
  gender:           Gender;
  status:           TournamentStatus;
  prize_pool:       string | null;
  location:         string | null;
  start_date:       string | null;
  end_date:         string | null;
  sport_id:         number;
  sport_name:       string;
  sport_type:       SportType;
  sport_icon:       string;
  live_matches_count?: number;
  groups?:          Group[];
}

export interface Match {
  id:               number;
  tournament_id:    number;
  tournament_name?: string;
  group_id:         number | null;
  group_name:       string | null;
  stage:            Stage;
  status:           MatchStatus;
  match_date:       string | null;
  score1:           number | null;
  score2:           number | null;
  winner_id:        number | null;
  loser_id:         number | null;
  sport_name?:      string;
  sport_icon?:      string;
  team1:            Team | null;
  team2:            Team | null;
}

export interface StandingRow {
  team_id:          number;
  team_name:        string;
  short_name:       string;
  logo_url:         string | null;
  group_id:         number;
  group_name:       string;
  wins:             number;
  losses:           number;
  points:           number;
  score_for:        number;
  score_against:    number;
  point_difference: number;
  matches_played:   number;
  rank:             number;
}

export interface StandingsGroup {
  group_id:   number;
  group_name: string;
  teams:      StandingRow[];
}

export interface BracketMatch {
  id:         number;
  stage:      Stage;
  status:     MatchStatus;
  match_date: string | null;
  score1:     number | null;
  score2:     number | null;
  winner_id:  number | null;
  loser_id:   number | null;
  team1:      Team | null;
  team2:      Team | null;
}

export interface Bracket {
  semifinals: BracketMatch[];
  bronze:     BracketMatch | null;
  final:      BracketMatch | null;
}

export interface LeaderboardResult {
  tournament_name: string;
  sport_name:      string;
  gender:          Gender;
  place:           1 | 2 | 3 | 4;
  points:          number;
}

export interface LeaderboardEntry {
  rank:         number;
  team_name:    string;
  total_points: number;
  gold:         number;
  silver:       number;
  bronze:       number;
  results:      LeaderboardResult[];
}

export interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  scoring:     Record<string, number[]>;
}
