const db = require('../db');

// GET /api/tournaments
async function listTournaments(req, res) {
  try {
    const { sport, status, gender } = req.query;

    let query = `
      SELECT
        t.id,
        t.name,
        t.gender,
        t.status,
        t.prize_pool,
        t.location,
        t.start_date,
        t.end_date,
        s.id   AS sport_id,
        s.name AS sport_name,
        s.type AS sport_type,
        s.icon AS sport_icon,
        (
          SELECT COUNT(*) FROM matches m
          WHERE m.tournament_id = t.id AND m.status = 'live'
        ) AS live_matches_count
      FROM tournaments t
      JOIN sports s ON s.id = t.sport_id
      WHERE 1 = 1
    `;
    const params = [];
    let idx = 1;

    if (sport) {
      query += ` AND s.name ILIKE $${idx++}`;
      params.push(`%${sport}%`);
    }
    if (status) {
      query += ` AND t.status = $${idx++}`;
      params.push(status);
    }
    if (gender) {
      query += ` AND t.gender = $${idx++}`;
      params.push(gender);
    }

    query += ' ORDER BY t.start_date DESC';

    const { rows } = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
}

// GET /api/tournaments/:id
async function getTournament(req, res) {
  try {
    const { id } = req.params;

    const tournamentQuery = `
      SELECT
        t.*,
        s.name AS sport_name,
        s.type AS sport_type,
        s.icon AS sport_icon
      FROM tournaments t
      JOIN sports s ON s.id = t.sport_id
      WHERE t.id = $1
    `;
    const { rows: tRows } = await db.query(tournamentQuery, [id]);
    if (!tRows.length) return res.status(404).json({ error: 'Tournament not found' });

    const tournament = tRows[0];

    // Groups + teams
    const groupsQuery = `
      SELECT
        g.id   AS group_id,
        g.name AS group_name,
        tm.id   AS team_id,
        tm.name AS team_name,
        tm.short_name,
        tm.country,
        tm.logo_url
      FROM groups g
      JOIN group_teams gt ON gt.group_id = g.id
      JOIN teams       tm ON tm.id = gt.team_id
      WHERE g.tournament_id = $1
      ORDER BY g.name, tm.name
    `;
    const { rows: teamRows } = await db.query(groupsQuery, [id]);

    // Build groups map
    const groupsMap = {};
    for (const row of teamRows) {
      if (!groupsMap[row.group_id]) {
        groupsMap[row.group_id] = { id: row.group_id, name: row.group_name, teams: [] };
      }
      groupsMap[row.group_id].teams.push({
        id:         row.team_id,
        name:       row.team_name,
        short_name: row.short_name,
        country:    row.country,
        logo_url:   row.logo_url,
      });
    }

    res.json({ ...tournament, groups: Object.values(groupsMap) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tournament' });
  }
}

module.exports = { listTournaments, getTournament };
