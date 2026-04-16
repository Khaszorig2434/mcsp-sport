-- ============================================================
-- MCSP Sport - Multi-Sport Tournament Tracking
-- Database Schema (PostgreSQL)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- SPORTS
-- ============================================================
CREATE TABLE sports (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  type        VARCHAR(20)  NOT NULL CHECK (type IN ('esports', 'traditional')),
  icon        VARCHAR(50),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TEAMS
-- ============================================================
CREATE TABLE teams (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  short_name  VARCHAR(10),
  sport_id    INTEGER      NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  country     VARCHAR(100),
  logo_url    VARCHAR(500),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TOURNAMENTS
-- ============================================================
CREATE TABLE tournaments (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  sport_id    INTEGER      NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
  gender      VARCHAR(10)  NOT NULL CHECK (gender IN ('male', 'female', 'mixed')),
  status      VARCHAR(20)  NOT NULL DEFAULT 'upcoming'
                           CHECK (status IN ('upcoming', 'ongoing', 'completed')),
  prize_pool  VARCHAR(50),
  location    VARCHAR(200),
  start_date  DATE,
  end_date    DATE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- GROUPS  (each tournament has exactly 2: Group A and Group B)
-- ============================================================
CREATE TABLE groups (
  id              SERIAL PRIMARY KEY,
  tournament_id   INTEGER      NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name            VARCHAR(10)  NOT NULL,  -- 'A' or 'B'
  UNIQUE (tournament_id, name)
);

-- ============================================================
-- GROUP_TEAMS  (which teams belong to which group)
-- ============================================================
CREATE TABLE group_teams (
  group_id    INTEGER NOT NULL REFERENCES groups(id)  ON DELETE CASCADE,
  team_id     INTEGER NOT NULL REFERENCES teams(id)   ON DELETE CASCADE,
  PRIMARY KEY (group_id, team_id)
);

-- ============================================================
-- MATCHES
-- ============================================================
CREATE TABLE matches (
  id              SERIAL PRIMARY KEY,
  tournament_id   INTEGER      NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  group_id        INTEGER               REFERENCES groups(id)      ON DELETE SET NULL,
  stage           VARCHAR(20)  NOT NULL CHECK (stage IN ('group', 'semi', 'bronze', 'final')),
  team1_id        INTEGER               REFERENCES teams(id)       ON DELETE SET NULL,
  team2_id        INTEGER               REFERENCES teams(id)       ON DELETE SET NULL,
  score1          INTEGER,
  score2          INTEGER,
  winner_id       INTEGER               REFERENCES teams(id)       ON DELETE SET NULL,
  loser_id        INTEGER               REFERENCES teams(id)       ON DELETE SET NULL,
  match_date      TIMESTAMPTZ,
  status          VARCHAR(20)  NOT NULL DEFAULT 'upcoming'
                               CHECK (status IN ('upcoming', 'live', 'completed')),
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_stage      ON matches(stage);
CREATE INDEX idx_matches_status     ON matches(status);
CREATE INDEX idx_group_teams_group  ON group_teams(group_id);
CREATE INDEX idx_group_teams_team   ON group_teams(team_id);
CREATE INDEX idx_tournaments_sport  ON tournaments(sport_id);
CREATE INDEX idx_teams_sport        ON teams(sport_id);
