-- ============================================================
-- MCSP Sport - Seed Data (reset + fresh insert)
-- ============================================================

TRUNCATE matches, group_teams, groups, tournaments, teams, sports RESTART IDENTITY CASCADE;

-- ============================================================
-- SPORTS
-- ============================================================
INSERT INTO sports (id, name, type, icon) VALUES
  (1, 'Basketball',   'traditional', 'basketball'),
  (2, 'CS2',          'esports',     'cs2'),
  (3, 'Dota 2',       'esports',     'dota2'),
  (4, 'Table Tennis', 'traditional', 'table-tennis'),
  (5, 'Chess',        'traditional', 'chess'),
  (6, 'Darts',        'traditional', 'darts');

SELECT setval('sports_id_seq', 6);

-- ============================================================
-- TEAMS (6 per sport = 36 total)
-- ============================================================

-- Basketball
INSERT INTO teams (id, name, short_name, sport_id, country) VALUES
  (1,  'Team 1', 'T1',  1, 'Mongolia'),
  (2,  'Team 2', 'T2',  1, 'Mongolia'),
  (3,  'Team 3', 'T3',  1, 'Mongolia'),
  (4,  'Team 4', 'T4',  1, 'Mongolia'),
  (5,  'Team 5', 'T5',  1, 'Mongolia'),
  (6,  'Team 6', 'T6',  1, 'Mongolia');

-- CS2
INSERT INTO teams (id, name, short_name, sport_id, country) VALUES
  (7,  'Team 1', 'T1',  2, 'Mongolia'),
  (8,  'Team 2', 'T2',  2, 'Mongolia'),
  (9,  'Team 3', 'T3',  2, 'Mongolia'),
  (10, 'Team 4', 'T4',  2, 'Mongolia'),
  (11, 'Team 5', 'T5',  2, 'Mongolia'),
  (12, 'Team 6', 'T6',  2, 'Mongolia');

-- Dota 2
INSERT INTO teams (id, name, short_name, sport_id, country) VALUES
  (13, 'Team 1', 'T1',  3, 'Mongolia'),
  (14, 'Team 2', 'T2',  3, 'Mongolia'),
  (15, 'Team 3', 'T3',  3, 'Mongolia'),
  (16, 'Team 4', 'T4',  3, 'Mongolia'),
  (17, 'Team 5', 'T5',  3, 'Mongolia'),
  (18, 'Team 6', 'T6',  3, 'Mongolia');

-- Table Tennis
INSERT INTO teams (id, name, short_name, sport_id, country) VALUES
  (19, 'Team 1', 'T1',  4, 'Mongolia'),
  (20, 'Team 2', 'T2',  4, 'Mongolia'),
  (21, 'Team 3', 'T3',  4, 'Mongolia'),
  (22, 'Team 4', 'T4',  4, 'Mongolia'),
  (23, 'Team 5', 'T5',  4, 'Mongolia'),
  (24, 'Team 6', 'T6',  4, 'Mongolia');

-- Chess
INSERT INTO teams (id, name, short_name, sport_id, country) VALUES
  (25, 'Team 1', 'T1',  5, 'Mongolia'),
  (26, 'Team 2', 'T2',  5, 'Mongolia'),
  (27, 'Team 3', 'T3',  5, 'Mongolia'),
  (28, 'Team 4', 'T4',  5, 'Mongolia'),
  (29, 'Team 5', 'T5',  5, 'Mongolia'),
  (30, 'Team 6', 'T6',  5, 'Mongolia');

-- Darts
INSERT INTO teams (id, name, short_name, sport_id, country) VALUES
  (31, 'Team 1', 'T1',  6, 'Mongolia'),
  (32, 'Team 2', 'T2',  6, 'Mongolia'),
  (33, 'Team 3', 'T3',  6, 'Mongolia'),
  (34, 'Team 4', 'T4',  6, 'Mongolia'),
  (35, 'Team 5', 'T5',  6, 'Mongolia'),
  (36, 'Team 6', 'T6',  6, 'Mongolia');

SELECT setval('teams_id_seq', 36);

-- ============================================================
-- TOURNAMENTS
-- ============================================================
INSERT INTO tournaments (id, name, sport_id, gender, status, prize_pool, location, start_date, end_date) VALUES
  (1,  'MCSP Basketball Championship 2026',        1, 'male',   'ongoing',   '$500,000', 'Ulaanbaatar', '2026-04-01', '2026-04-30'),
  (2,  'MCSP CS2 Open 2026',                       2, 'male',   'ongoing',   '$250,000', 'Ulaanbaatar', '2026-04-10', '2026-04-25'),
  (3,  'MCSP Dota 2 Invitational 2026',            3, 'male',   'ongoing',   '$300,000', 'Ulaanbaatar', '2026-04-15', '2026-05-15'),
  (4,  'MCSP Table Tennis Cup 2026',               4, 'mixed',  'completed', '$100,000', 'Ulaanbaatar', '2026-03-01', '2026-03-10'),
  (5,  'MCSP Chess Masters 2026',                  5, 'male',   'upcoming',  '$150,000', 'Ulaanbaatar', '2026-06-01', '2026-06-20'),
  (6,  'MCSP Darts League 2026',                   6, 'male',   'upcoming',  '$80,000',  'Ulaanbaatar', '2026-07-01', '2026-07-10'),
  (7,  'MCSP Basketball Championship 2026 (W)',    1, 'female', 'ongoing',   '$500,000', 'Ulaanbaatar', '2026-04-01', '2026-04-30'),
  (8,  'MCSP Table Tennis Cup 2026 (W)',           4, 'female', 'upcoming',  '$100,000', 'Ulaanbaatar', '2026-05-01', '2026-05-10'),
  (9,  'MCSP Chess Masters 2026 (W)',              5, 'female', 'upcoming',  '$150,000', 'Ulaanbaatar', '2026-06-01', '2026-06-20'),
  (10, 'MCSP Darts League 2026 (W)',               6, 'female', 'upcoming',  '$80,000',  'Ulaanbaatar', '2026-07-01', '2026-07-10');

SELECT setval('tournaments_id_seq', 10);

-- ============================================================
-- GROUPS
-- ============================================================
INSERT INTO groups (id, tournament_id, name) VALUES
  (1,  1, 'A'), (2,  1, 'B'),
  (3,  2, 'A'), (4,  2, 'B'),
  (5,  3, 'A'), (6,  3, 'B'),
  (7,  4, 'A'), (8,  4, 'B'),
  (9,  5, 'A'), (10, 5, 'B'),
  (11, 6, 'A'), (12, 6, 'B');

SELECT setval('groups_id_seq', 12);

-- ============================================================
-- GROUP TEAMS
-- ============================================================
INSERT INTO group_teams (group_id, team_id) VALUES
  -- Basketball T1 Group A: Team 1,2,3 | Group B: Team 4,5,6
  (1,1),(1,2),(1,3),   (2,4),(2,5),(2,6),
  -- CS2 T2 Group A: Team 7,8,9 | Group B: Team 10,11,12
  (3,7),(3,8),(3,9),   (4,10),(4,11),(4,12),
  -- Dota2 T3 Group A: Team 13,14,15 | Group B: Team 16,17,18
  (5,13),(5,14),(5,15),(6,16),(6,17),(6,18),
  -- Table Tennis T4 Group A: Team 19,20,21 | Group B: Team 22,23,24
  (7,19),(7,20),(7,21),(8,22),(8,23),(8,24),
  -- Chess T5 Group A: Team 25,26,27 | Group B: Team 28,29,30
  (9,25),(9,26),(9,27),(10,28),(10,29),(10,30),
  -- Darts T6 Group A: Team 31,32,33 | Group B: Team 34,35,36
  (11,31),(11,32),(11,33),(12,34),(12,35),(12,36);

-- ============================================================
-- MATCHES - Basketball (tournament 1, ongoing)
-- ============================================================
-- Group A
INSERT INTO matches VALUES (1,  1,1,'group',1,2, 2,1,1,2, '2026-04-05 10:00+08','completed');
INSERT INTO matches VALUES (2,  1,1,'group',1,3, 2,0,1,3, '2026-04-06 10:00+08','completed');
INSERT INTO matches VALUES (3,  1,1,'group',2,3, 2,1,2,3, '2026-04-07 10:00+08','completed');
-- Group B
INSERT INTO matches VALUES (4,  1,2,'group',4,5, 1,2,5,4, '2026-04-05 14:00+08','completed');
INSERT INTO matches VALUES (5,  1,2,'group',4,6, 0,2,6,4, '2026-04-06 14:00+08','completed');
INSERT INTO matches VALUES (6,  1,2,'group',5,6, NULL,NULL,NULL,NULL, '2026-04-21 14:00+08','live');
-- Playoffs: SF1=A1(1)vsB2(5), SF2=A2(2)vsB1(6) → SF1 winner=5, SF2 winner=2
INSERT INTO matches VALUES (7,  1,NULL,'semi',  1,5,  0,2,5,1,'2026-04-24 10:00+08','completed');
INSERT INTO matches VALUES (8,  1,NULL,'semi',  2,6,  2,0,2,6,'2026-04-24 14:00+08','completed');
INSERT INTO matches VALUES (9,  1,NULL,'bronze',1,6,  NULL,NULL,NULL,NULL,'2026-04-28 10:00+08','upcoming');
INSERT INTO matches VALUES (10, 1,NULL,'final', 5,2,  NULL,NULL,NULL,NULL,'2026-04-28 14:00+08','upcoming');

-- ============================================================
-- MATCHES - CS2 (tournament 2, ongoing)
-- ============================================================
-- Group A
INSERT INTO matches VALUES (11, 2,3,'group',7,8,  2,0,7,8,  '2026-04-12 10:00+08','completed');
INSERT INTO matches VALUES (12, 2,3,'group',7,9,  2,1,7,9,  '2026-04-13 10:00+08','completed');
INSERT INTO matches VALUES (13, 2,3,'group',8,9,  1,2,9,8,  '2026-04-14 10:00+08','completed');
-- Group B
INSERT INTO matches VALUES (14, 2,4,'group',10,11,2,1,10,11,'2026-04-12 14:00+08','completed');
INSERT INTO matches VALUES (15, 2,4,'group',10,12,2,0,10,12,'2026-04-13 14:00+08','completed');
INSERT INTO matches VALUES (16, 2,4,'group',11,12,NULL,NULL,NULL,NULL,'2026-04-20 14:00+08','live');
-- Playoffs
INSERT INTO matches VALUES (17, 2,NULL,'semi',  7,11, NULL,NULL,NULL,NULL,'2026-04-22 10:00+08','upcoming');
INSERT INTO matches VALUES (18, 2,NULL,'semi',  10,9, NULL,NULL,NULL,NULL,'2026-04-22 14:00+08','upcoming');
INSERT INTO matches VALUES (19, 2,NULL,'bronze',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-24 10:00+08','upcoming');
INSERT INTO matches VALUES (20, 2,NULL,'final', NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-24 14:00+08','upcoming');

-- ============================================================
-- MATCHES - Dota 2 (tournament 3, ongoing — Bo3 format, score = maps won)
-- ============================================================
-- Group A: Team 13 (T1), Team 14 (T2), Team 15 (T3)
INSERT INTO matches VALUES (21, 3,5,'group',13,14,2,0,13,14,'2026-04-16 10:00+08','completed');
INSERT INTO matches VALUES (22, 3,5,'group',13,15,2,1,13,15,'2026-04-18 10:00+08','completed');
INSERT INTO matches VALUES (23, 3,5,'group',14,15,NULL,NULL,NULL,NULL,'2026-04-21 10:00+08','live');
-- Group B: Team 16 (T4), Team 17 (T5), Team 18 (T6)
INSERT INTO matches VALUES (24, 3,6,'group',16,17,2,1,16,17,'2026-04-16 14:00+08','completed');
INSERT INTO matches VALUES (25, 3,6,'group',16,18,0,2,18,16,'2026-04-18 14:00+08','completed');
INSERT INTO matches VALUES (26, 3,6,'group',17,18,NULL,NULL,NULL,NULL,'2026-04-21 14:00+08','upcoming');
INSERT INTO matches VALUES (27, 3,NULL,'semi',  NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-10 10:00+08','upcoming');
INSERT INTO matches VALUES (28, 3,NULL,'semi',  NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-10 14:00+08','upcoming');
INSERT INTO matches VALUES (29, 3,NULL,'bronze',NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-14 10:00+08','upcoming');
INSERT INTO matches VALUES (30, 3,NULL,'final', NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-14 14:00+08','upcoming');

-- ============================================================
-- MATCHES - Table Tennis (tournament 4, completed)
-- ============================================================
-- Group A
INSERT INTO matches VALUES (31, 4,7,'group',19,20,3,1,19,20,'2026-03-02 10:00+08','completed');
INSERT INTO matches VALUES (32, 4,7,'group',19,21,3,0,19,21,'2026-03-03 10:00+08','completed');
INSERT INTO matches VALUES (33, 4,7,'group',20,21,3,2,20,21,'2026-03-04 10:00+08','completed');
-- Group B
INSERT INTO matches VALUES (34, 4,8,'group',22,23,3,1,22,23,'2026-03-02 14:00+08','completed');
INSERT INTO matches VALUES (35, 4,8,'group',22,24,3,2,22,24,'2026-03-03 14:00+08','completed');
INSERT INTO matches VALUES (36, 4,8,'group',23,24,3,0,23,24,'2026-03-04 14:00+08','completed');
-- Playoffs: A1=19, A2=20, B1=22, B2=23
INSERT INTO matches VALUES (37, 4,NULL,'semi',  19,23,4,2,19,23,'2026-03-07 10:00+08','completed');
INSERT INTO matches VALUES (38, 4,NULL,'semi',  22,20,4,3,22,20,'2026-03-07 14:00+08','completed');
INSERT INTO matches VALUES (39, 4,NULL,'bronze',20,23,4,1,20,23,'2026-03-09 10:00+08','completed');
INSERT INTO matches VALUES (40, 4,NULL,'final', 19,22,4,2,19,22,'2026-03-10 14:00+08','completed');

SELECT setval('matches_id_seq', 40);

-- ============================================================
-- FEMALE TEAMS (6 per tournament = 24 more)
-- ============================================================
-- Basketball Female (tournament 7)
INSERT INTO teams (id, name, short_name, sport_id, country) VALUES
  (37, 'Team 1', 'T1', 1, 'Mongolia'),
  (38, 'Team 2', 'T2', 1, 'Mongolia'),
  (39, 'Team 3', 'T3', 1, 'Mongolia'),
  (40, 'Team 4', 'T4', 1, 'Mongolia'),
  (41, 'Team 5', 'T5', 1, 'Mongolia'),
  (42, 'Team 6', 'T6', 1, 'Mongolia');

-- Table Tennis Female (tournament 8)
INSERT INTO teams (id, name, short_name, sport_id, country) VALUES
  (43, 'Team 1', 'T1', 4, 'Mongolia'),
  (44, 'Team 2', 'T2', 4, 'Mongolia'),
  (45, 'Team 3', 'T3', 4, 'Mongolia'),
  (46, 'Team 4', 'T4', 4, 'Mongolia'),
  (47, 'Team 5', 'T5', 4, 'Mongolia'),
  (48, 'Team 6', 'T6', 4, 'Mongolia');

-- Chess Female (tournament 9)
INSERT INTO teams (id, name, short_name, sport_id, country) VALUES
  (49, 'Team 1', 'T1', 5, 'Mongolia'),
  (50, 'Team 2', 'T2', 5, 'Mongolia'),
  (51, 'Team 3', 'T3', 5, 'Mongolia'),
  (52, 'Team 4', 'T4', 5, 'Mongolia'),
  (53, 'Team 5', 'T5', 5, 'Mongolia'),
  (54, 'Team 6', 'T6', 5, 'Mongolia');

-- Darts Female (tournament 10)
INSERT INTO teams (id, name, short_name, sport_id, country) VALUES
  (55, 'Team 1', 'T1', 6, 'Mongolia'),
  (56, 'Team 2', 'T2', 6, 'Mongolia'),
  (57, 'Team 3', 'T3', 6, 'Mongolia'),
  (58, 'Team 4', 'T4', 6, 'Mongolia'),
  (59, 'Team 5', 'T5', 6, 'Mongolia'),
  (60, 'Team 6', 'T6', 6, 'Mongolia');

SELECT setval('teams_id_seq', 60);

-- ============================================================
-- FEMALE GROUPS
-- ============================================================
INSERT INTO groups (id, tournament_id, name) VALUES
  (13, 7,  'A'), (14, 7,  'B'),
  (15, 8,  'A'), (16, 8,  'B'),
  (17, 9,  'A'), (18, 9,  'B'),
  (19, 10, 'A'), (20, 10, 'B');

SELECT setval('groups_id_seq', 20);

-- ============================================================
-- FEMALE GROUP TEAMS
-- ============================================================
INSERT INTO group_teams (group_id, team_id) VALUES
  -- Basketball Female: Group A: 37,38,39 | Group B: 40,41,42
  (13,37),(13,38),(13,39), (14,40),(14,41),(14,42),
  -- Table Tennis Female: Group A: 43,44,45 | Group B: 46,47,48
  (15,43),(15,44),(15,45), (16,46),(16,47),(16,48),
  -- Chess Female: Group A: 49,50,51 | Group B: 52,53,54
  (17,49),(17,50),(17,51), (18,52),(18,53),(18,54),
  -- Darts Female: Group A: 55,56,57 | Group B: 58,59,60
  (19,55),(19,56),(19,57), (20,58),(20,59),(20,60);

-- ============================================================
-- MATCHES - Basketball Female (tournament 7, ongoing)
-- ============================================================
-- Group A
INSERT INTO matches VALUES (41, 7,13,'group',37,38,2,1,37,38,'2026-04-05 11:00+08','completed');
INSERT INTO matches VALUES (42, 7,13,'group',37,39,1,2,39,37,'2026-04-06 11:00+08','completed');
INSERT INTO matches VALUES (43, 7,13,'group',38,39,NULL,NULL,NULL,NULL,'2026-04-21 11:00+08','live');
-- Group B
INSERT INTO matches VALUES (44, 7,14,'group',40,41,0,2,41,40,'2026-04-05 15:00+08','completed');
INSERT INTO matches VALUES (45, 7,14,'group',40,42,2,1,40,42,'2026-04-06 15:00+08','completed');
INSERT INTO matches VALUES (46, 7,14,'group',41,42,NULL,NULL,NULL,NULL,'2026-04-22 15:00+08','upcoming');
-- Playoffs
INSERT INTO matches VALUES (47, 7,NULL,'semi',  NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-25 10:00+08','upcoming');
INSERT INTO matches VALUES (48, 7,NULL,'semi',  NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-25 14:00+08','upcoming');
INSERT INTO matches VALUES (49, 7,NULL,'bronze',NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-29 10:00+08','upcoming');
INSERT INTO matches VALUES (50, 7,NULL,'final', NULL,NULL,NULL,NULL,NULL,NULL,'2026-04-29 14:00+08','upcoming');

-- ============================================================
-- MATCHES - Table Tennis Female (tournament 8, upcoming)
-- ============================================================
INSERT INTO matches VALUES (51, 8,15,'group',43,44,NULL,NULL,NULL,NULL,'2026-05-02 10:00+08','upcoming');
INSERT INTO matches VALUES (52, 8,15,'group',43,45,NULL,NULL,NULL,NULL,'2026-05-03 10:00+08','upcoming');
INSERT INTO matches VALUES (53, 8,15,'group',44,45,NULL,NULL,NULL,NULL,'2026-05-04 10:00+08','upcoming');
INSERT INTO matches VALUES (54, 8,16,'group',46,47,NULL,NULL,NULL,NULL,'2026-05-02 14:00+08','upcoming');
INSERT INTO matches VALUES (55, 8,16,'group',46,48,NULL,NULL,NULL,NULL,'2026-05-03 14:00+08','upcoming');
INSERT INTO matches VALUES (56, 8,16,'group',47,48,NULL,NULL,NULL,NULL,'2026-05-04 14:00+08','upcoming');
INSERT INTO matches VALUES (57, 8,NULL,'semi',  NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-07 10:00+08','upcoming');
INSERT INTO matches VALUES (58, 8,NULL,'semi',  NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-07 14:00+08','upcoming');
INSERT INTO matches VALUES (59, 8,NULL,'bronze',NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-09 10:00+08','upcoming');
INSERT INTO matches VALUES (60, 8,NULL,'final', NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-10 14:00+08','upcoming');

-- ============================================================
-- MATCHES - Chess Female (tournament 9, upcoming)
-- ============================================================
INSERT INTO matches VALUES (61, 9,17,'group',49,50,NULL,NULL,NULL,NULL,'2026-06-02 10:00+08','upcoming');
INSERT INTO matches VALUES (62, 9,17,'group',49,51,NULL,NULL,NULL,NULL,'2026-06-03 10:00+08','upcoming');
INSERT INTO matches VALUES (63, 9,17,'group',50,51,NULL,NULL,NULL,NULL,'2026-06-04 10:00+08','upcoming');
INSERT INTO matches VALUES (64, 9,18,'group',52,53,NULL,NULL,NULL,NULL,'2026-06-02 14:00+08','upcoming');
INSERT INTO matches VALUES (65, 9,18,'group',52,54,NULL,NULL,NULL,NULL,'2026-06-03 14:00+08','upcoming');
INSERT INTO matches VALUES (66, 9,18,'group',53,54,NULL,NULL,NULL,NULL,'2026-06-04 14:00+08','upcoming');
INSERT INTO matches VALUES (67, 9,NULL,'semi',  NULL,NULL,NULL,NULL,NULL,NULL,'2026-06-10 10:00+08','upcoming');
INSERT INTO matches VALUES (68, 9,NULL,'semi',  NULL,NULL,NULL,NULL,NULL,NULL,'2026-06-10 14:00+08','upcoming');
INSERT INTO matches VALUES (69, 9,NULL,'bronze',NULL,NULL,NULL,NULL,NULL,NULL,'2026-06-18 10:00+08','upcoming');
INSERT INTO matches VALUES (70, 9,NULL,'final', NULL,NULL,NULL,NULL,NULL,NULL,'2026-06-20 14:00+08','upcoming');

-- ============================================================
-- MATCHES - Darts Female (tournament 10, upcoming)
-- ============================================================
INSERT INTO matches VALUES (71, 10,19,'group',55,56,NULL,NULL,NULL,NULL,'2026-07-02 10:00+08','upcoming');
INSERT INTO matches VALUES (72, 10,19,'group',55,57,NULL,NULL,NULL,NULL,'2026-07-03 10:00+08','upcoming');
INSERT INTO matches VALUES (73, 10,19,'group',56,57,NULL,NULL,NULL,NULL,'2026-07-04 10:00+08','upcoming');
INSERT INTO matches VALUES (74, 10,20,'group',58,59,NULL,NULL,NULL,NULL,'2026-07-02 14:00+08','upcoming');
INSERT INTO matches VALUES (75, 10,20,'group',58,60,NULL,NULL,NULL,NULL,'2026-07-03 14:00+08','upcoming');
INSERT INTO matches VALUES (76, 10,20,'group',59,60,NULL,NULL,NULL,NULL,'2026-07-04 14:00+08','upcoming');
INSERT INTO matches VALUES (77, 10,NULL,'semi',  NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-07 10:00+08','upcoming');
INSERT INTO matches VALUES (78, 10,NULL,'semi',  NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-07 14:00+08','upcoming');
INSERT INTO matches VALUES (79, 10,NULL,'bronze',NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-09 10:00+08','upcoming');
INSERT INTO matches VALUES (80, 10,NULL,'final', NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-10 14:00+08','upcoming');

SELECT setval('matches_id_seq', 80);
