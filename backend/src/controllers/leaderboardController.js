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

// Sports that use individual_placements table instead of bracket matches
const INDIVIDUAL_SPORTS = ['Table Tennis', 'Chess'];

// GET /api/leaderboard
async function getLeaderboard(req, res) {
  try {
    // Bracket sports: read from completed final + bronze matches
    const { rows } = await db.query(`
      SELECT
        m.stage,
        m.winner_id, m.loser_id,
        wt.id AS winner_team_id, wt.name AS winner_name,
        lt.id AS loser_team_id,  lt.name AS loser_name,
        tn.id AS tournament_id, tn.name AS tournament_name, tn.gender,
        s.name AS sport_name
      FROM matches m
      JOIN tournaments tn ON tn.id = m.tournament_id
      JOIN sports      s  ON s.id  = tn.sport_id
      LEFT JOIN teams wt  ON wt.id = m.winner_id
      LEFT JOIN teams lt  ON lt.id = m.loser_id
      WHERE m.stage IN ('final', 'bronze')
        AND m.status = 'completed'
        AND m.winner_id IS NOT NULL
        AND s.name NOT IN (${INDIVIDUAL_SPORTS.map((_, i) => `$${i + 1}`).join(',')})
      ORDER BY tn.id, m.stage
    `, INDIVIDUAL_SPORTS);

    // Individual sports: read from individual_placements table
    const { rows: indivRows } = await db.query(`
      SELECT
        ip.place, ip.player_name, ip.team_id,
        t.name AS team_name,
        tn.id AS tournament_id, tn.name AS tournament_name, tn.gender,
        s.name AS sport_name
      FROM individual_placements ip
      JOIN tournaments tn ON tn.id = ip.tournament_id
      JOIN sports      s  ON s.id  = tn.sport_id
      LEFT JOIN teams  t  ON t.id  = ip.team_id
      ORDER BY tn.id, ip.place
    `);

    // Darts: read final + bronze results from darts_matches
    const { rows: dartsRows } = await db.query(`
      SELECT
        dm.stage,
        dm.winner_id, dm.loser_id,
        wt.name AS winner_name,
        lt.name AS loser_name,
        tn.id AS tournament_id, tn.name AS tournament_name, tn.gender,
        s.name AS sport_name
      FROM darts_matches dm
      JOIN tournaments tn ON tn.id = dm.tournament_id
      JOIN sports      s  ON s.id  = tn.sport_id
      LEFT JOIN teams wt  ON wt.id = dm.winner_id
      LEFT JOIN teams lt  ON lt.id = dm.loser_id
      WHERE dm.stage IN ('final', 'bronze')
        AND dm.status = 'completed'
        AND dm.winner_id IS NOT NULL
        AND s.name = 'Darts'
      ORDER BY tn.id, dm.stage
    `);

    // Build per-tournament bracket placements
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
        t.placements[1] = { name: row.winner_name };
        t.placements[2] = { name: row.loser_name  };
      } else if (row.stage === 'bronze') {
        t.placements[3] = { name: row.winner_name };
        t.placements[4] = { name: row.loser_name  };
      }
    }

    // Build per-tournament individual placements
    const byTournamentIndiv = {};
    for (const row of indivRows) {
      const tid = row.tournament_id;
      if (!byTournamentIndiv[tid]) {
        byTournamentIndiv[tid] = {
          tournament_id:   tid,
          tournament_name: row.tournament_name,
          sport_name:      row.sport_name,
          gender:          row.gender,
          placements:      {},
        };
      }
      byTournamentIndiv[tid].placements[row.place] = {
        name:        row.team_name,
        player_name: row.player_name,
      };
    }

    // Only build teamMap from actual results — don't seed with 0
    const teamMap = {};

    const applyPlacements = (tournamentData) => {
      const pointsTable = SPORT_POINTS[tournamentData.sport_name] ?? [0, 0, 0, 0];
      for (let place = 1; place <= 4; place++) {
        const entry = tournamentData.placements[place];
        if (!entry || !entry.name) continue;
        const pts = pointsTable[place - 1] ?? 0;
        if (!teamMap[entry.name]) {
          teamMap[entry.name] = { team_name: entry.name, total_points: 0, gold: 0, silver: 0, bronze: 0, results: [] };
        }
        teamMap[entry.name].total_points += pts;
        if (place === 1) teamMap[entry.name].gold   += 1;
        if (place === 2) teamMap[entry.name].silver  += 1;
        if (place === 3) teamMap[entry.name].bronze  += 1;
        teamMap[entry.name].results.push({
          tournament_id:   tournamentData.tournament_id,
          tournament_name: tournamentData.tournament_name,
          sport_name:      tournamentData.sport_name,
          gender:          tournamentData.gender,
          place,
          points:          pts,
          player_name:     entry.player_name ?? null,
        });
      }
    };

    // Build per-tournament darts bracket placements
    const byTournamentDarts = {};
    for (const row of dartsRows) {
      const tid = row.tournament_id;
      if (!byTournamentDarts[tid]) {
        byTournamentDarts[tid] = {
          tournament_id:   tid,
          tournament_name: row.tournament_name,
          sport_name:      row.sport_name,
          gender:          row.gender,
          placements:      {},
        };
      }
      const t = byTournamentDarts[tid];
      if (row.stage === 'final') {
        t.placements[1] = { name: row.winner_name };
        t.placements[2] = { name: row.loser_name  };
      } else if (row.stage === 'bronze') {
        t.placements[3] = { name: row.winner_name };
        t.placements[4] = { name: row.loser_name  };
      }
    }

    for (const t of Object.values(byTournament))      applyPlacements(t);
    for (const t of Object.values(byTournamentIndiv)) applyPlacements(t);
    for (const t of Object.values(byTournamentDarts)) applyPlacements(t);

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
