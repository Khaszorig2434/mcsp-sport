-- ============================================================
-- MCSP Sport - Darts Extension Schema
-- Run this after schema.sql to add darts-specific tables
-- ============================================================

CREATE TABLE IF NOT EXISTS darts_groups (
  id            SERIAL PRIMARY KEY,
  tournament_id INTEGER     NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name          VARCHAR(50) NOT NULL,
  UNIQUE (tournament_id, name)
);

CREATE TABLE IF NOT EXISTS darts_group_teams (
  group_id INTEGER NOT NULL REFERENCES darts_groups(id) ON DELETE CASCADE,
  team_id  INTEGER NOT NULL REFERENCES teams(id)        ON DELETE CASCADE,
  PRIMARY KEY (group_id, team_id)
);

CREATE TABLE IF NOT EXISTS darts_matches (
  id            SERIAL PRIMARY KEY,
  tournament_id INTEGER     NOT NULL REFERENCES tournaments(id)  ON DELETE CASCADE,
  group_id      INTEGER              REFERENCES darts_groups(id) ON DELETE SET NULL,
  stage         VARCHAR(20) NOT NULL CHECK (stage IN ('group', 'quarterfinal', 'semi', 'bronze', 'final')),
  team1_id      INTEGER              REFERENCES teams(id) ON DELETE SET NULL,
  team2_id      INTEGER              REFERENCES teams(id) ON DELETE SET NULL,
  score1        INTEGER,
  score2        INTEGER,
  winner_id     INTEGER              REFERENCES teams(id) ON DELETE SET NULL,
  loser_id      INTEGER              REFERENCES teams(id) ON DELETE SET NULL,
  match_date    TIMESTAMPTZ,
  status        VARCHAR(20) NOT NULL DEFAULT 'upcoming'
                            CHECK (status IN ('upcoming', 'live', 'completed')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_darts_matches_tournament ON darts_matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_darts_matches_stage      ON darts_matches(stage);
CREATE INDEX IF NOT EXISTS idx_darts_matches_status     ON darts_matches(status);
CREATE INDEX IF NOT EXISTS idx_darts_group_teams_group  ON darts_group_teams(group_id);
CREATE INDEX IF NOT EXISTS idx_darts_group_teams_team   ON darts_group_teams(team_id);
