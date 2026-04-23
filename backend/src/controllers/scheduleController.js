const db = require('../db');

// GET /api/schedule — all upcoming matches across all tournaments
async function getSchedule(req, res) {
  try {
    const { rows } = await db.query(`
      SELECT
        m.id, m.tournament_id, m.stage, m.status, m.match_date,
        m.score1, m.score2, m.winner_id, m.loser_id,
        t1.id AS team1_id, t1.name AS team1_name, t1.short_name AS team1_short, t1.logo_url AS team1_logo,
        COALESCE(dgt1.player_name, t1.player_name) AS team1_player,
        t2.id AS team2_id, t2.name AS team2_name, t2.short_name AS team2_short, t2.logo_url AS team2_logo,
        COALESCE(dgt2.player_name, t2.player_name) AS team2_player,
        tn.name AS tournament_name,
        s.name  AS sport_name,
        s.icon  AS sport_icon
      FROM matches m
      LEFT JOIN teams      t1   ON t1.id = m.team1_id
      LEFT JOIN teams      t2   ON t2.id = m.team2_id
      JOIN  tournaments tn ON tn.id = m.tournament_id
      JOIN  sports       s ON s.id  = tn.sport_id
      LEFT JOIN darts_group_teams dgt1 ON dgt1.team_id = m.team1_id AND dgt1.group_id = m.group_id
      LEFT JOIN darts_group_teams dgt2 ON dgt2.team_id = m.team2_id AND dgt2.group_id = m.group_id
      WHERE m.status = 'upcoming'
        AND m.match_date IS NOT NULL

      UNION ALL

      SELECT
        dm.id, dm.tournament_id, dm.stage, dm.status, dm.match_date,
        dm.score1, dm.score2, dm.winner_id, dm.loser_id,
        t1.id AS team1_id, t1.name AS team1_name, t1.short_name AS team1_short, t1.logo_url AS team1_logo,
        COALESCE(dgt1.player_name, t1.player_name) AS team1_player,
        t2.id AS team2_id, t2.name AS team2_name, t2.short_name AS team2_short, t2.logo_url AS team2_logo,
        COALESCE(dgt2.player_name, t2.player_name) AS team2_player,
        tn.name AS tournament_name,
        s.name  AS sport_name,
        s.icon  AS sport_icon
      FROM darts_matches dm
      LEFT JOIN teams      t1   ON t1.id = dm.team1_id
      LEFT JOIN teams      t2   ON t2.id = dm.team2_id
      JOIN  tournaments tn ON tn.id = dm.tournament_id
      JOIN  sports       s ON s.id  = tn.sport_id
      LEFT JOIN darts_group_teams dgt1 ON dgt1.team_id = dm.team1_id AND dgt1.group_id = dm.group_id
      LEFT JOIN darts_group_teams dgt2 ON dgt2.team_id = dm.team2_id AND dgt2.group_id = dm.group_id
      WHERE dm.status = 'upcoming'
        AND dm.match_date IS NOT NULL

      UNION ALL

      SELECT
        ttm.id, ttm.tournament_id, ttm.stage, ttm.status, ttm.match_date,
        ttm.score1, ttm.score2, ttm.winner_id, ttm.loser_id,
        t1.id AS team1_id, t1.name AS team1_name, t1.short_name AS team1_short, t1.logo_url AS team1_logo,
        ttm.team1_player_name AS team1_player,
        t2.id AS team2_id, t2.name AS team2_name, t2.short_name AS team2_short, t2.logo_url AS team2_logo,
        ttm.team2_player_name AS team2_player,
        tn.name AS tournament_name, s.name AS sport_name, s.icon AS sport_icon
      FROM tt_matches ttm
      LEFT JOIN teams      t1 ON t1.id = ttm.team1_id
      LEFT JOIN teams      t2 ON t2.id = ttm.team2_id
      JOIN  tournaments tn ON tn.id = ttm.tournament_id
      JOIN  sports       s ON s.id  = tn.sport_id
      WHERE ttm.status = 'upcoming'
        AND ttm.match_date IS NOT NULL

      ORDER BY match_date ASC, id ASC
    `);

    res.json(rows.map((row) => ({
      id:              row.id,
      tournament_id:   row.tournament_id,
      tournament_name: row.tournament_name,
      stage:           row.stage,
      status:          row.status,
      match_date:      row.match_date,
      score1:          row.score1,
      score2:          row.score2,
      winner_id:       row.winner_id,
      loser_id:        row.loser_id,
      sport_name:      row.sport_name,
      sport_icon:      row.sport_icon,
      team1: row.team1_id ? { id: row.team1_id, name: row.team1_name, short_name: row.team1_short, logo_url: row.team1_logo, player_name: row.team1_player ?? null } : null,
      team2: row.team2_id ? { id: row.team2_id, name: row.team2_name, short_name: row.team2_short, logo_url: row.team2_logo, player_name: row.team2_player ?? null } : null,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
}

module.exports = { getSchedule };
