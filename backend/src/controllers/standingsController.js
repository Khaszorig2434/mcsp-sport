const db = require('../db');

// GET /api/standings?tournamentId=
async function getStandings(req, res) {
  try {
    const { tournamentId } = req.query;
    if (!tournamentId) return res.status(400).json({ error: 'tournamentId is required' });

    // Fetch all teams in each group for this tournament
    const teamsQuery = `
      SELECT
        g.id   AS group_id,
        g.name AS group_name,
        tm.id   AS team_id,
        tm.name AS team_name,
        tm.short_name,
        tm.logo_url
      FROM groups g
      JOIN group_teams gt ON gt.group_id = g.id
      JOIN teams       tm ON tm.id = gt.team_id
      WHERE g.tournament_id = $1
      ORDER BY g.name, tm.name
    `;
    const { rows: teamRows } = await db.query(teamsQuery, [tournamentId]);

    // Fetch all completed group-stage matches for this tournament
    const matchesQuery = `
      SELECT
        m.group_id,
        m.team1_id,
        m.team2_id,
        m.score1,
        m.score2,
        m.winner_id
      FROM matches m
      WHERE m.tournament_id = $1
        AND m.stage = 'group'
        AND m.status = 'completed'
    `;
    const { rows: matchRows } = await db.query(matchesQuery, [tournamentId]);

    // Build per-team stats map
    const stats = {};
    for (const t of teamRows) {
      if (!stats[t.group_id]) stats[t.group_id] = {};
      stats[t.group_id][t.team_id] = {
        team_id:          t.team_id,
        team_name:        t.team_name,
        short_name:       t.short_name,
        logo_url:         t.logo_url,
        group_id:         t.group_id,
        group_name:       t.group_name,
        wins:             0,
        losses:           0,
        points:           0,
        score_for:        0,
        score_against:    0,
        point_difference: 0,
        matches_played:   0,
      };
    }

    for (const m of matchRows) {
      const gid = m.group_id;
      if (!gid) continue;

      const s1 = m.score1 ?? 0;
      const s2 = m.score2 ?? 0;

      // team1 perspective
      if (stats[gid]?.[m.team1_id]) {
        stats[gid][m.team1_id].matches_played += 1;
        stats[gid][m.team1_id].score_for      += s1;
        stats[gid][m.team1_id].score_against  += s2;
        if (m.winner_id === m.team1_id) {
          stats[gid][m.team1_id].wins   += 1;
          stats[gid][m.team1_id].points += 2;
        } else {
          stats[gid][m.team1_id].losses += 1;
        }
      }

      // team2 perspective
      if (stats[gid]?.[m.team2_id]) {
        stats[gid][m.team2_id].matches_played += 1;
        stats[gid][m.team2_id].score_for      += s2;
        stats[gid][m.team2_id].score_against  += s1;
        if (m.winner_id === m.team2_id) {
          stats[gid][m.team2_id].wins   += 1;
          stats[gid][m.team2_id].points += 2;
        } else {
          stats[gid][m.team2_id].losses += 1;
        }
      }
    }

    // Assemble and rank
    const groups = {};
    for (const [groupId, teamsMap] of Object.entries(stats)) {
      const teamsArr = Object.values(teamsMap).map((t) => ({
        ...t,
        point_difference: t.score_for - t.score_against,
      }));

      // Sort: points DESC → point_difference DESC → wins DESC
      teamsArr.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.point_difference !== a.point_difference) return b.point_difference - a.point_difference;
        return b.wins - a.wins;
      });

      teamsArr.forEach((t, i) => { t.rank = i + 1; });

      const groupName = teamsArr[0]?.group_name || groupId;
      if (!groups[groupId]) {
        groups[groupId] = { group_id: Number(groupId), group_name: groupName, teams: [] };
      }
      groups[groupId].teams = teamsArr;
    }

    res.json(Object.values(groups).sort((a, b) => a.group_name.localeCompare(b.group_name)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch standings' });
  }
}

module.exports = { getStandings };
