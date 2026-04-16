-- ============================================================
-- MCSP Sport - Seed Data
-- ============================================================

-- Sports
INSERT INTO sports (id, name, type, icon) VALUES
  (1, 'Basketball',   'traditional', 'basketball'),
  (2, 'Chess',        'traditional', 'chess'),
  (3, 'CS2',          'esports',     'cs2'),
  (4, 'Dota 2',       'esports',     'dota2'),
  (5, 'Darts',        'traditional', 'darts'),
  (6, 'Table Tennis', 'traditional', 'table-tennis');

SELECT setval('sports_id_seq', 6);

-- ============================================================
-- CS2 Teams
-- ============================================================
INSERT INTO teams (id, name, short_name, sport_id, country) VALUES
  (1,  'Team Vitality',  'VIT',  3, 'France'),
  (2,  'NAVI',           'NAVI', 3, 'Ukraine'),
  (3,  'FaZe Clan',      'FAZE', 3, 'International'),
  (4,  'G2 Esports',     'G2',   3, 'International'),
  (5,  'Astralis',       'AST',  3, 'Denmark'),
  (6,  'Heroic',         'HER',  3, 'Denmark');

-- Basketball Women Teams
INSERT INTO teams (id, name, short_name, sport_id, country) VALUES
  (7,  'USA Women',      'USA',  1, 'United States'),
  (8,  'France Women',   'FRA',  1, 'France'),
  (9,  'Australia Women','AUS',  1, 'Australia'),
  (10, 'Spain Women',    'ESP',  1, 'Spain'),
  (11, 'China Women',    'CHN',  1, 'China'),
  (12, 'Nigeria Women',  'NGR',  1, 'Nigeria');

-- Dota 2 Teams
INSERT INTO teams (id, name, short_name, sport_id, country) VALUES
  (13, 'Team Spirit',    'SPR',  4, 'Russia'),
  (14, 'OG',             'OG',   4, 'International'),
  (15, 'Team Secret',    'SEC',  4, 'International'),
  (16, 'PSG.LGD',        'LGD',  4, 'China'),
  (17, 'Tundra Esports', 'TND',  4, 'United Kingdom'),
  (18, 'Gaimin Gladiators','GG', 4, 'Denmark');

-- Chess Teams
INSERT INTO teams (id, name, short_name, sport_id, country) VALUES
  (19, 'Magnus Carlsen',    'MCL', 2, 'Norway'),
  (20, 'Fabiano Caruana',   'CAR', 2, 'United States'),
  (21, 'Ding Liren',        'DIN', 2, 'China'),
  (22, 'Ian Nepomniachtchi','NEP', 2, 'Russia'),
  (23, 'Alireza Firouzja',  'FIR', 2, 'France'),
  (24, 'Hikaru Nakamura',   'NAK', 2, 'United States');

-- Darts Teams
INSERT INTO teams (id, name, short_name, sport_id, country) VALUES
  (25, 'Michael van Gerwen', 'MVG', 5, 'Netherlands'),
  (26, 'Peter Wright',       'WRI', 5, 'Scotland'),
  (27, 'Gerwyn Price',       'PRI', 5, 'Wales'),
  (28, 'Jonny Clayton',      'CLA', 5, 'Wales'),
  (29, 'Jose de Sousa',      'SOU', 5, 'Portugal'),
  (30, 'Dimitri Van den Bergh','VDB',5,'Belgium');

-- Table Tennis Teams
INSERT INTO teams (id, name, short_name, sport_id, country) VALUES
  (31, 'Fan Zhendong',    'FAN', 6, 'China'),
  (32, 'Ma Long',         'MA',  6, 'China'),
  (33, 'Timo Boll',       'BOL', 6, 'Germany'),
  (34, 'Xu Xin',          'XIN', 6, 'China'),
  (35, 'Tomokazu Harimoto','HAR',6, 'Japan'),
  (36, 'Dimitrij Ovtcharov','OVT',6,'Germany');

SELECT setval('teams_id_seq', 36);

-- ============================================================
-- TOURNAMENTS
-- ============================================================
INSERT INTO tournaments (id, name, sport_id, gender, status, prize_pool, location, start_date, end_date) VALUES
  (1, 'ESL Pro League Season 21',        3, 'male',   'ongoing',   '$835,000',  'Malta',      '2025-09-15', '2025-10-05'),
  (2, 'FIBA Women''s Basketball Cup 2025',1, 'female', 'upcoming',  '$500,000',  'Spain',      '2025-11-10', '2025-11-20'),
  (3, 'The International 2025',          4, 'male',   'ongoing',   '$3,000,000','Singapore',  '2025-10-01', '2025-10-13'),
  (4, 'World Chess Championship 2025',   2, 'male',   'upcoming',  '$2,000,000','Dubai',      '2025-11-20', '2025-12-15'),
  (5, 'PDC World Darts Championship 25', 5, 'male',   'upcoming',  '$700,000',  'London',     '2025-12-18', '2026-01-03'),
  (6, 'ITTF World Tour Finals 2025',     6, 'male',   'completed', '$200,000',  'Tokyo',      '2025-08-01', '2025-08-08');

SELECT setval('tournaments_id_seq', 6);

-- ============================================================
-- GROUPS
-- ============================================================
INSERT INTO groups (id, tournament_id, name) VALUES
  -- CS2 ESL Pro League
  (1, 1, 'A'),
  (2, 1, 'B'),
  -- FIBA Women
  (3, 2, 'A'),
  (4, 2, 'B'),
  -- The International Dota 2
  (5, 3, 'A'),
  (6, 3, 'B'),
  -- Chess
  (7, 4, 'A'),
  (8, 4, 'B'),
  -- Darts
  (9, 5, 'A'),
  (10,5, 'B'),
  -- Table Tennis
  (11,6, 'A'),
  (12,6, 'B');

SELECT setval('groups_id_seq', 12);

-- ============================================================
-- GROUP TEAMS
-- ============================================================
INSERT INTO group_teams (group_id, team_id) VALUES
  -- CS2: Group A → Vitality, NAVI, FaZe
  (1, 1), (1, 2), (1, 3),
  -- CS2: Group B → G2, Astralis, Heroic
  (2, 4), (2, 5), (2, 6),
  -- Basketball Women: Group A → USA, France, Australia
  (3, 7), (3, 8), (3, 9),
  -- Basketball Women: Group B → Spain, China, Nigeria
  (4, 10), (4, 11), (4, 12),
  -- Dota 2: Group A → Team Spirit, OG, Team Secret
  (5, 13), (5, 14), (5, 15),
  -- Dota 2: Group B → PSG.LGD, Tundra, GG
  (6, 16), (6, 17), (6, 18),
  -- Chess: Group A → Carlsen, Caruana, Ding
  (7, 19), (7, 20), (7, 21),
  -- Chess: Group B → Nepo, Firouzja, Nakamura
  (8, 22), (8, 23), (8, 24),
  -- Darts: Group A → MVG, Wright, Price
  (9, 25), (9, 26), (9, 27),
  -- Darts: Group B → Clayton, de Sousa, VDB
  (10, 28), (10, 29), (10, 30),
  -- Table Tennis: Group A → Fan, Ma, Boll
  (11, 31), (11, 32), (11, 33),
  -- Table Tennis: Group B → Xu, Harimoto, Ovtcharov
  (12, 34), (12, 35), (12, 36);

-- ============================================================
-- MATCHES - CS2 ESL Pro League Season 21 (tournament_id = 1)
-- ============================================================

-- Group A matches (group_id = 1)
-- Vitality vs NAVI  → Vitality wins 2-1
INSERT INTO matches (id, tournament_id, group_id, stage, team1_id, team2_id, score1, score2, winner_id, loser_id, match_date, status)
VALUES (1, 1, 1, 'group', 1, 2, 2, 1, 1, 2, '2025-09-16 14:00:00+00', 'completed');

-- FaZe vs Vitality  → FaZe wins 2-0
INSERT INTO matches (id, tournament_id, group_id, stage, team1_id, team2_id, score1, score2, winner_id, loser_id, match_date, status)
VALUES (2, 1, 1, 'group', 3, 1, 2, 0, 3, 1, '2025-09-17 16:00:00+00', 'completed');

-- FaZe vs NAVI  → FaZe wins 2-1
INSERT INTO matches (id, tournament_id, group_id, stage, team1_id, team2_id, score1, score2, winner_id, loser_id, match_date, status)
VALUES (3, 1, 1, 'group', 3, 2, 2, 1, 3, 2, '2025-09-18 14:00:00+00', 'completed');

-- Group B matches (group_id = 2)
-- G2 vs Astralis  → G2 wins 2-0
INSERT INTO matches (id, tournament_id, group_id, stage, team1_id, team2_id, score1, score2, winner_id, loser_id, match_date, status)
VALUES (4, 1, 2, 'group', 4, 5, 2, 0, 4, 5, '2025-09-16 17:00:00+00', 'completed');

-- G2 vs Heroic  → G2 wins 2-1
INSERT INTO matches (id, tournament_id, group_id, stage, team1_id, team2_id, score1, score2, winner_id, loser_id, match_date, status)
VALUES (5, 1, 2, 'group', 4, 6, 2, 1, 4, 6, '2025-09-17 18:00:00+00', 'completed');

-- Heroic vs Astralis  → Heroic wins 2-0
INSERT INTO matches (id, tournament_id, group_id, stage, team1_id, team2_id, score1, score2, winner_id, loser_id, match_date, status)
VALUES (6, 1, 2, 'group', 6, 5, 2, 0, 6, 5, '2025-09-18 16:00:00+00', 'completed');

-- Semi-finals: A1(FaZe) vs B2(Heroic), B1(G2) vs A2(Vitality)
INSERT INTO matches (id, tournament_id, group_id, stage, team1_id, team2_id, score1, score2, winner_id, loser_id, match_date, status)
VALUES (7, 1, NULL, 'semi', 3, 6, 2, 1, 3, 6, '2025-09-22 14:00:00+00', 'completed');

INSERT INTO matches (id, tournament_id, group_id, stage, team1_id, team2_id, score1, score2, winner_id, loser_id, match_date, status)
VALUES (8, 1, NULL, 'semi', 4, 1, NULL, NULL, NULL, NULL, '2025-09-22 17:00:00+00', 'live');

-- Bronze: Heroic vs TBD (Loser SF2 — unknown yet)
INSERT INTO matches (id, tournament_id, group_id, stage, team1_id, team2_id, score1, score2, winner_id, loser_id, match_date, status)
VALUES (9, 1, NULL, 'bronze', NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-25 14:00:00+00', 'upcoming');

-- Final
INSERT INTO matches (id, tournament_id, group_id, stage, team1_id, team2_id, score1, score2, winner_id, loser_id, match_date, status)
VALUES (10, 1, NULL, 'final', NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-25 17:00:00+00', 'upcoming');

-- ============================================================
-- MATCHES - Dota 2 The International 2025 (tournament_id = 3)
-- ============================================================

-- Group A (group_id = 5)
-- Spirit vs OG → Spirit wins 2-0
INSERT INTO matches (id, tournament_id, group_id, stage, team1_id, team2_id, score1, score2, winner_id, loser_id, match_date, status)
VALUES (11, 3, 5, 'group', 13, 14, 2, 0, 13, 14, '2025-10-02 10:00:00+00', 'completed');

-- Spirit vs Secret → Spirit wins 2-1
INSERT INTO matches (id, tournament_id, group_id, stage, team1_id, team2_id, score1, score2, winner_id, loser_id, match_date, status)
VALUES (12, 3, 5, 'group', 13, 15, 2, 1, 13, 15, '2025-10-02 13:00:00+00', 'completed');

-- OG vs Secret → OG wins 2-1
INSERT INTO matches (id, tournament_id, group_id, stage, team1_id, team2_id, score1, score2, winner_id, loser_id, match_date, status)
VALUES (13, 3, 5, 'group', 14, 15, 2, 1, 14, 15, '2025-10-03 10:00:00+00', 'completed');

-- Group B (group_id = 6)
-- PSG.LGD vs Tundra → LGD wins 2-0
INSERT INTO matches (id, tournament_id, group_id, stage, team1_id, team2_id, score1, score2, winner_id, loser_id, match_date, status)
VALUES (14, 3, 6, 'group', 16, 17, 2, 0, 16, 17, '2025-10-02 11:00:00+00', 'completed');

-- GG vs PSG.LGD → GG wins 2-1
INSERT INTO matches (id, tournament_id, group_id, stage, team1_id, team2_id, score1, score2, winner_id, loser_id, match_date, status)
VALUES (15, 3, 6, 'group', 18, 16, 2, 1, 18, 16, '2025-10-02 14:00:00+00', 'completed');

-- GG vs Tundra → GG wins 2-0
INSERT INTO matches (id, tournament_id, group_id, stage, team1_id, team2_id, score1, score2, winner_id, loser_id, match_date, status)
VALUES (16, 3, 6, 'group', 18, 17, 2, 0, 18, 17, '2025-10-03 11:00:00+00', 'completed');

-- Playoffs Dota 2: A1(Spirit) vs B2(LGD), B1(GG) vs A2(OG)
INSERT INTO matches (id, tournament_id, group_id, stage, team1_id, team2_id, score1, score2, winner_id, loser_id, match_date, status)
VALUES (17, 3, NULL, 'semi', 13, 16, NULL, NULL, NULL, NULL, '2025-10-08 10:00:00+00', 'upcoming');

INSERT INTO matches (id, tournament_id, group_id, stage, team1_id, team2_id, score1, score2, winner_id, loser_id, match_date, status)
VALUES (18, 3, NULL, 'semi', 18, 14, NULL, NULL, NULL, NULL, '2025-10-08 14:00:00+00', 'upcoming');

INSERT INTO matches (id, tournament_id, group_id, stage, team1_id, team2_id, score1, score2, winner_id, loser_id, match_date, status)
VALUES (19, 3, NULL, 'bronze', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-12 10:00:00+00', 'upcoming');

INSERT INTO matches (id, tournament_id, group_id, stage, team1_id, team2_id, score1, score2, winner_id, loser_id, match_date, status)
VALUES (20, 3, NULL, 'final', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-13 14:00:00+00', 'upcoming');

-- ============================================================
-- MATCHES - Table Tennis ITTF (tournament_id = 6, completed)
-- ============================================================

-- Group A (group_id = 11)
INSERT INTO matches (id, tournament_id, group_id, stage, team1_id, team2_id, score1, score2, winner_id, loser_id, match_date, status)
VALUES (21, 6, 11, 'group', 31, 32, 3, 1, 31, 32, '2025-08-02 09:00:00+00', 'completed');

INSERT INTO matches (id, tournament_id, group_id, stage, team1_id, team2_id, score1, score2, winner_id, loser_id, match_date, status)
VALUES (22, 6, 11, 'group', 31, 33, 3, 0, 31, 33, '2025-08-02 11:00:00+00', 'completed');

INSERT INTO matches (id, tournament_id, group_id, stage, team1_id, team2_id, score1, score2, winner_id, loser_id, match_date, status)
VALUES (23, 6, 11, 'group', 32, 33, 3, 2, 32, 33, '2025-08-03 09:00:00+00', 'completed');

-- Group B (group_id = 12)
INSERT INTO matches (id, tournament_id, group_id, stage, team1_id, team2_id, score1, score2, winner_id, loser_id, match_date, status)
VALUES (24, 6, 12, 'group', 34, 35, 3, 1, 34, 35, '2025-08-02 10:00:00+00', 'completed');

INSERT INTO matches (id, tournament_id, group_id, stage, team1_id, team2_id, score1, score2, winner_id, loser_id, match_date, status)
VALUES (25, 6, 12, 'group', 34, 36, 3, 2, 34, 36, '2025-08-02 13:00:00+00', 'completed');

INSERT INTO matches (id, tournament_id, group_id, stage, team1_id, team2_id, score1, score2, winner_id, loser_id, match_date, status)
VALUES (26, 6, 12, 'group', 35, 36, 3, 1, 35, 36, '2025-08-03 10:00:00+00', 'completed');

-- Playoffs TT: A1(Fan) vs B2(Harimoto), B1(Xu) vs A2(Ma)
INSERT INTO matches (id, tournament_id, group_id, stage, team1_id, team2_id, score1, score2, winner_id, loser_id, match_date, status)
VALUES (27, 6, NULL, 'semi', 31, 35, 4, 2, 31, 35, '2025-08-05 10:00:00+00', 'completed');

INSERT INTO matches (id, tournament_id, group_id, stage, team1_id, team2_id, score1, score2, winner_id, loser_id, match_date, status)
VALUES (28, 6, NULL, 'semi', 34, 32, 4, 3, 34, 32, '2025-08-05 13:00:00+00', 'completed');

-- Bronze: Harimoto vs Ma
INSERT INTO matches (id, tournament_id, group_id, stage, team1_id, team2_id, score1, score2, winner_id, loser_id, match_date, status)
VALUES (29, 6, NULL, 'bronze', 35, 32, 4, 1, 35, 32, '2025-08-07 10:00:00+00', 'completed');

-- Final: Fan vs Xu
INSERT INTO matches (id, tournament_id, group_id, stage, team1_id, team2_id, score1, score2, winner_id, loser_id, match_date, status)
VALUES (30, 6, NULL, 'final', 31, 34, 4, 2, 31, 34, '2025-08-08 14:00:00+00', 'completed');

SELECT setval('matches_id_seq', 30);
