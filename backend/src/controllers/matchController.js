const db = require('../db');

// GET /api/matches?tournamentId=&stage=&status=
async function listMatches(req, res) {
  try {
    const { tournamentId, stage, status } = req.query;
    if (!tournamentId) return res.status(400).json({ error: 'tournamentId is required' });

    let query = `
      SELECT
        m.id,
        m.tournament_id,
        m.group_id,
        g.name     AS group_name,
        m.stage,
        m.status,
        m.match_date,
        m.score1,
        m.score2,
        m.winner_id,
        m.loser_id,
        t1.id      AS team1_id,
        t1.name    AS team1_name,
        t1.short_name AS team1_short,
        t1.logo_url   AS team1_logo,
        t2.id      AS team2_id,
        t2.name    AS team2_name,
        t2.short_name AS team2_short,
        t2.logo_url   AS team2_logo
      FROM matches m
      LEFT JOIN groups g  ON g.id  = m.group_id
      LEFT JOIN teams  t1 ON t1.id = m.team1_id
      LEFT JOIN teams  t2 ON t2.id = m.team2_id
      WHERE m.tournament_id = $1
    `;
    const params = [tournamentId];
    let idx = 2;

    if (stage) {
      query += ` AND m.stage = $${idx++}`;
      params.push(stage);
    }
    if (status) {
      query += ` AND m.status = $${idx++}`;
      params.push(status);
    }

    query += ' ORDER BY m.match_date ASC NULLS LAST, m.id ASC';

    const { rows } = await db.query(query, params);

    const matches = rows.map(formatMatch);
    res.json(matches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
}

// GET /api/matches/live  — all live matches across all tournaments
async function getLiveMatches(req, res) {
  try {
    const query = `
      SELECT
        m.id,
        m.tournament_id,
        m.stage,
        m.status,
        m.match_date,
        m.score1,
        m.score2,
        m.winner_id,
        t1.id    AS team1_id,
        t1.name  AS team1_name,
        t1.short_name AS team1_short,
        t2.id    AS team2_id,
        t2.name  AS team2_name,
        t2.short_name AS team2_short,
        tn.name  AS tournament_name,
        s.name   AS sport_name,
        s.icon   AS sport_icon
      FROM matches m
      LEFT JOIN teams      t1 ON t1.id = m.team1_id
      LEFT JOIN teams      t2 ON t2.id = m.team2_id
      JOIN  tournaments tn ON tn.id = m.tournament_id
      JOIN  sports      s  ON s.id  = tn.sport_id
      WHERE m.status = 'live'
      ORDER BY m.match_date ASC
    `;
    const { rows } = await db.query(query);
    res.json(rows.map(formatMatch));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch live matches' });
  }
}

// POST /api/matches/:id  — update score / status
async function updateMatch(req, res) {
  try {
    const { id } = req.params;
    const { score1, score2, status } = req.body;

    const { rows } = await db.query(
      'SELECT * FROM matches WHERE id = $1',
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Match not found' });

    const match = rows[0];

    const newScore1  = score1  !== undefined ? score1  : match.score1;
    const newScore2  = score2  !== undefined ? score2  : match.score2;
    const newStatus  = status  !== undefined ? status  : match.status;

    let winnerId = match.winner_id;
    let loserId  = match.loser_id;

    if (newStatus === 'completed' && newScore1 !== null && newScore2 !== null) {
      if (newScore1 > newScore2) {
        winnerId = match.team1_id;
        loserId  = match.team2_id;
      } else if (newScore2 > newScore1) {
        winnerId = match.team2_id;
        loserId  = match.team1_id;
      }
    }

    const updateQuery = `
      UPDATE matches
      SET score1 = $1, score2 = $2, status = $3, winner_id = $4, loser_id = $5
      WHERE id = $6
      RETURNING *
    `;
    const updated = await db.query(updateQuery, [
      newScore1, newScore2, newStatus, winnerId, loserId, id,
    ]);

    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update match' });
  }
}

function formatMatch(row) {
  return {
    id:              row.id,
    tournament_id:   row.tournament_id,
    tournament_name: row.tournament_name,
    group_id:        row.group_id,
    group_name:      row.group_name,
    stage:           row.stage,
    status:          row.status,
    match_date:      row.match_date,
    score1:          row.score1,
    score2:          row.score2,
    winner_id:       row.winner_id,
    loser_id:        row.loser_id,
    sport_name:      row.sport_name,
    sport_icon:      row.sport_icon,
    team1: row.team1_id ? {
      id:         row.team1_id,
      name:       row.team1_name,
      short_name: row.team1_short,
      logo_url:   row.team1_logo,
    } : null,
    team2: row.team2_id ? {
      id:         row.team2_id,
      name:       row.team2_name,
      short_name: row.team2_short,
      logo_url:   row.team2_logo,
    } : null,
  };
}

module.exports = { listMatches, getLiveMatches, updateMatch };
