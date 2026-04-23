const db = require('../db');

// GET /api/groups?tournamentId=
async function listGroups(req, res) {
  try {
    const { tournamentId } = req.query;
    if (!tournamentId) return res.status(400).json({ error: 'tournamentId is required' });

    const { rows } = await db.query(`
      SELECT g.id, g.name AS group_name, t.id AS team_id, t.name AS team_name, t.short_name, gt.player_name
      FROM groups g
      JOIN group_teams gt ON gt.group_id = g.id
      JOIN teams t ON t.id = gt.team_id
      WHERE g.tournament_id = $1
      ORDER BY g.name, t.name
    `, [tournamentId]);

    const groupsMap = {};
    for (const row of rows) {
      if (!groupsMap[row.id]) groupsMap[row.id] = { id: row.id, name: row.group_name, teams: [] };
      groupsMap[row.id].teams.push({ id: row.team_id, name: row.team_name, short_name: row.short_name, player_name: row.player_name });
    }

    res.json(Object.values(groupsMap).sort((a, b) => a.name.localeCompare(b.name)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list groups' });
  }
}

// POST /api/groups
async function createGroup(req, res) {
  try {
    const { tournament_id, name, players } = req.body;
    if (!tournament_id || !name || !Array.isArray(players) || players.length < 2 || players.length > 6) {
      return res.status(400).json({ error: 'tournament_id, name, and 2–6 players are required' });
    }

    const { rows: [group] } = await db.query(
      `INSERT INTO groups (tournament_id, name) VALUES ($1, $2) RETURNING id`,
      [tournament_id, name]
    );

    for (const player of players) {
      await db.query(
        `INSERT INTO group_teams (group_id, team_id, player_name) VALUES ($1, $2, $3)`,
        [group.id, player.team_id, player.name.trim()]
      );
    }

    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        await db.query(
          `INSERT INTO matches (tournament_id, group_id, stage, team1_id, team2_id, team1_player_name, team2_player_name, status)
           VALUES ($1, $2, 'group', $3, $4, $5, $6, 'upcoming')`,
          [tournament_id, group.id, players[i].team_id, players[j].team_id, players[i].name.trim(), players[j].name.trim()]
        );
      }
    }

    res.status(201).json({ id: group.id, name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message ?? 'Failed to create group' });
  }
}

// DELETE /api/groups/:id
async function deleteGroup(req, res) {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM matches WHERE group_id = $1 AND stage = 'group'`, [id]);
    await db.query(`DELETE FROM group_teams WHERE group_id = $1`, [id]);
    const { rowCount } = await db.query(`DELETE FROM groups WHERE id = $1`, [id]);
    if (!rowCount) return res.status(404).json({ error: 'Group not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete group' });
  }
}

module.exports = { listGroups, createGroup, deleteGroup };
