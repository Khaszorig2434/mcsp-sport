const db = require('../db');

// Points awarded per placement per sport
const SPORT_POINTS = {
  'Basketball':   [12, 8, 4, 1],
  'Table Tennis': [5,  3, 1, 0.5],
  'Chess':        [5,  3, 1, 0.5],
  'Darts':        [5,  3, 1, 0.5],
  'CS2':          [8,  5, 2, 0.5],
  'Dota 2':       [8,  5, 2, 0.5],
};

// GET /api/leaderboard
async function getLeaderboard(req, res) {
  try {
    // Fetch all completed final + bronze matches with sport and team info
    const { rows } = await db.query(`
      SELECT
        m.id, m.stage, m.status,
        m.winner_id, m.loser_id,
        t1.id AS team1_id, t1.name AS team1_name,
        t2.id AS team2_id, t2.name AS team2_name,
        wt.id AS winner_team_id, wt.name AS winner_name,
        lt.id AS loser_team_id,  lt.name AS loser_name,
        tn.id AS tournament_id, tn.name AS tournament_name, tn.gender,
        s.name AS sport_name
      FROM matches m
      JOIN tournaments tn ON tn.id = m.tournament_id
      JOIN sports      s  ON s.id  = tn.sport_id
      LEFT JOIN teams wt  ON wt.id = m.winner_id
      LEFT JOIN teams lt  ON lt.id = m.loser_id
      LEFT JOIN teams t1  ON t1.id = m.team1_id
      LEFT JOIN teams t2  ON t2.id = m.team2_id
      WHERE m.stage IN ('final', 'bronze')
        AND m.status = 'completed'
        AND m.winner_id IS NOT NULL
      ORDER BY tn.id, m.stage
    `);

    // Build per-tournament placements: { [tournamentId]: { 1: team, 2: team, 3: team, 4: team } }
    const byTournament = {};

    for (const row of rows) {
      const tid = row.tournament_id;
      if (!byTournament[tid]) {
        byTournament[tid] = {
          tournament_id:   tid,
          tournament_name: row.tournament_name,
          sport_name:      row.sport_name,
          gender:          row.gender,
          placements:      {},
        };
      }
      const t = byTournament[tid];
      if (row.stage === 'final') {
        t.placements[1] = { id: row.winner_team_id, name: row.winner_name };
        t.placements[2] = { id: row.loser_team_id,  name: row.loser_name  };
      } else if (row.stage === 'bronze') {
        t.placements[3] = { id: row.winner_team_id, name: row.winner_name };
        t.placements[4] = { id: row.loser_team_id,  name: row.loser_name  };
      }
    }

    // Aggregate points per team name
    const teamMap = {};

    for (const t of Object.values(byTournament)) {
      const pointsTable = SPORT_POINTS[t.sport_name] ?? [0, 0, 0, 0];

      for (let place = 1; place <= 4; place++) {
        const team = t.placements[place];
        if (!team) continue;

        const pts = pointsTable[place - 1] ?? 0;

        if (!teamMap[team.name]) {
          teamMap[team.name] = {
            team_name:   team.name,
            total_points: 0,
            gold:   0,
            silver: 0,
            bronze: 0,
            results: [],
          };
        }

        teamMap[team.name].total_points += pts;
        if (place === 1) teamMap[team.name].gold   += 1;
        if (place === 2) teamMap[team.name].silver  += 1;
        if (place === 3) teamMap[team.name].bronze  += 1;

        teamMap[team.name].results.push({
          tournament_name: t.tournament_name,
          sport_name:      t.sport_name,
          gender:          t.gender,
          place,
          points:          pts,
        });
      }
    }

    // Sort: total_points DESC → gold DESC → silver DESC
    const leaderboard = Object.values(teamMap).sort((a, b) => {
      if (b.total_points !== a.total_points) return b.total_points - a.total_points;
      if (b.gold !== a.gold) return b.gold - a.gold;
      return b.silver - a.silver;
    });

    leaderboard.forEach((entry, i) => { entry.rank = i + 1; });

    res.json({ leaderboard, scoring: SPORT_POINTS });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}

module.exports = { getLeaderboard };
