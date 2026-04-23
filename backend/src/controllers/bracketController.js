const db = require('../db');

// GET /api/bracket?tournamentId=
async function getBracket(req, res) {
  try {
    const { tournamentId } = req.query;
    if (!tournamentId) return res.status(400).json({ error: 'tournamentId is required' });

    const query = `
      SELECT
        m.id,
        m.stage,
        m.status,
        m.match_date,
        m.score1,
        m.score2,
        m.winner_id,
        m.loser_id,
        m.team1_player_name,
        m.team2_player_name,
        t1.id         AS team1_id,
        t1.name       AS team1_name,
        t1.short_name AS team1_short,
        t1.logo_url   AS team1_logo,
        t2.id         AS team2_id,
        t2.name       AS team2_name,
        t2.short_name AS team2_short,
        t2.logo_url   AS team2_logo
      FROM matches m
      LEFT JOIN teams t1 ON t1.id = m.team1_id
      LEFT JOIN teams t2 ON t2.id = m.team2_id
      WHERE m.tournament_id = $1
        AND m.stage IN ('semi', 'bronze', 'final')
      ORDER BY m.stage, m.id
    `;
    const { rows } = await db.query(query, [tournamentId]);

    const bracket = {
      semifinals: [],
      bronze:     null,
      final:      null,
    };

    for (const row of rows) {
      const match = formatBracketMatch(row);
      if (row.stage === 'semi') bracket.semifinals.push(match);
      else if (row.stage === 'bronze') bracket.bronze = match;
      else if (row.stage === 'final')  bracket.final  = match;
    }

    res.json(bracket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bracket' });
  }
}

function formatBracketMatch(row) {
  return {
    id:         row.id,
    stage:      row.stage,
    status:     row.status,
    match_date: row.match_date,
    score1:     row.score1,
    score2:     row.score2,
    winner_id:  row.winner_id,
    loser_id:   row.loser_id,
    team1: row.team1_id ? {
      id:          row.team1_id,
      name:        row.team1_name,
      short_name:  row.team1_short,
      logo_url:    row.team1_logo,
      player_name: row.team1_player_name ?? null,
    } : null,
    team2: row.team2_id ? {
      id:          row.team2_id,
      name:        row.team2_name,
      short_name:  row.team2_short,
      logo_url:    row.team2_logo,
      player_name: row.team2_player_name ?? null,
    } : null,
  };
}

module.exports = { getBracket };
