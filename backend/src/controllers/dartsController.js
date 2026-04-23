const db = require('../db');

// ── Helpers ───────────────────────────────────────────────────

function formatDartsMatch(row) {
  return {
    id:            row.id,
    tournament_id: row.tournament_id,
    group_id:      row.group_id,
    group_name:    row.group_name,
    stage:         row.stage,
    status:        row.status,
    match_date:    row.match_date,
    score1:        row.score1,
    score2:        row.score2,
    winner_id:     row.winner_id,
    loser_id:      row.loser_id,
    team1: row.team1_id ? {
      id:          row.team1_id,
      name:        row.team1_name,
      short_name:  row.team1_short,
      logo_url:    row.team1_logo ?? null,
      player_name: row.team1_player_name ?? row.team1_player ?? null,
    } : null,
    team2: row.team2_id ? {
      id:          row.team2_id,
      name:        row.team2_name,
      short_name:  row.team2_short,
      logo_url:    row.team2_logo ?? null,
      player_name: row.team2_player_name ?? row.team2_player ?? null,
    } : null,
  };
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
      logo_url:    row.team1_logo ?? null,
      player_name: row.team1_player_name ?? null,
    } : null,
    team2: row.team2_id ? {
      id:          row.team2_id,
      name:        row.team2_name,
      short_name:  row.team2_short,
      logo_url:    row.team2_logo ?? null,
      player_name: row.team2_player_name ?? null,
    } : null,
  };
}

// ── Groups ────────────────────────────────────────────────────

// GET /api/darts/groups?tournamentId=
async function getDartsGroups(req, res) {
  try {
    const { tournamentId } = req.query;
    if (!tournamentId) return res.status(400).json({ error: 'tournamentId is required' });

    const { rows } = await db.query(`
      SELECT
        dg.id        AS group_id,
        dg.name      AS group_name,
        t.id         AS team_id,
        t.name       AS team_name,
        t.short_name,
        dgt.player_name
      FROM darts_groups dg
      JOIN darts_group_teams dgt ON dgt.group_id = dg.id
      JOIN teams             t   ON t.id = dgt.team_id
      WHERE dg.tournament_id = $1
      ORDER BY dg.name, t.name
    `, [tournamentId]);

    const groupsMap = {};
    for (const row of rows) {
      if (!groupsMap[row.group_id]) {
        groupsMap[row.group_id] = { id: row.group_id, name: row.group_name, teams: [] };
      }
      groupsMap[row.group_id].teams.push({
        id:          row.team_id,
        name:        row.team_name,
        short_name:  row.short_name,
        player_name: row.player_name,
      });
    }

    res.json(Object.values(groupsMap).sort((a, b) => a.name.localeCompare(b.name)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch darts groups' });
  }
}

// POST /api/darts/groups
// Body: { tournament_id, players: [{ name, team_id }, ...] } — exactly 4 players
async function createDartsGroup(req, res) {
  try {
    const { tournament_id, players } = req.body;
    if (!tournament_id || !Array.isArray(players) || players.length < 2 || players.length > 6) {
      return res.status(400).json({ error: 'tournament_id and 2–6 players are required' });
    }
    for (const p of players) {
      if (!p.name?.trim() || !p.team_id) {
        return res.status(400).json({ error: 'Each player needs a name and team' });
      }
    }
    const teamIds = players.map((p) => Number(p.team_id));

    // Auto-assign next group letter
    const { rows: [{ count }] } = await db.query(
      `SELECT COUNT(*) AS count FROM darts_groups WHERE tournament_id = $1`, [tournament_id]
    );
    const name = String.fromCharCode(65 + parseInt(count, 10));

    const { rows: [group] } = await db.query(
      `INSERT INTO darts_groups (tournament_id, name) VALUES ($1, $2) RETURNING id`,
      [tournament_id, name]
    );

    // Insert all 4 group team entries
    for (const p of players) {
      await db.query(
        `INSERT INTO darts_group_teams (group_id, team_id, player_name) VALUES ($1, $2, $3)`,
        [group.id, Number(p.team_id), p.name.trim()]
      );
    }

    // Create round-robin matches (all pairs)
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        await db.query(
          `INSERT INTO darts_matches (tournament_id, group_id, stage, team1_id, team2_id, team1_player_name, team2_player_name, status)
           VALUES ($1, $2, 'group', $3, $4, $5, $6, 'upcoming')`,
          [tournament_id, group.id, teamIds[i], teamIds[j], players[i].name.trim(), players[j].name.trim()]
        );
      }
    }

    res.status(201).json({ id: group.id, name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create darts group', detail: err.message });
  }
}

// DELETE /api/darts/groups/:id
async function deleteDartsGroup(req, res) {
  try {
    const { id } = req.params;
    // Delete the auto-created group match first
    await db.query(`DELETE FROM darts_matches WHERE group_id = $1`, [id]);
    const { rowCount } = await db.query(`DELETE FROM darts_groups WHERE id = $1`, [id]);
    if (!rowCount) return res.status(404).json({ error: 'Group not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete darts group' });
  }
}

// ── Matches ───────────────────────────────────────────────────

// GET /api/darts/matches?tournamentId=&stage=&status=
async function listDartsMatches(req, res) {
  try {
    const { tournamentId, stage, status } = req.query;
    if (!tournamentId) return res.status(400).json({ error: 'tournamentId is required' });

    let query = `
      SELECT
        dm.id, dm.tournament_id, dm.group_id,
        dg.name    AS group_name,
        dm.stage, dm.status, dm.match_date,
        dm.score1, dm.score2, dm.winner_id, dm.loser_id,
        dm.team1_player_name, dm.team2_player_name,
        t1.id AS team1_id, t1.name AS team1_name, t1.short_name AS team1_short, t1.logo_url AS team1_logo,
        t2.id AS team2_id, t2.name AS team2_name, t2.short_name AS team2_short, t2.logo_url AS team2_logo
      FROM darts_matches dm
      LEFT JOIN darts_groups dg ON dg.id = dm.group_id
      LEFT JOIN teams        t1 ON t1.id = dm.team1_id
      LEFT JOIN teams        t2 ON t2.id = dm.team2_id
      WHERE dm.tournament_id = $1
    `;
    const params = [tournamentId];
    let idx = 2;
    if (stage)  { query += ` AND dm.stage = $${idx++}`;  params.push(stage); }
    if (status) { query += ` AND dm.status = $${idx++}`; params.push(status); }
    query += ' ORDER BY dm.match_date ASC NULLS LAST, dm.id ASC';

    const { rows } = await db.query(query, params);
    res.json(rows.map(formatDartsMatch));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch darts matches' });
  }
}

// POST /api/darts/matches/:id — update score/status with auto-advance
async function updateDartsMatch(req, res) {
  try {
    const { id } = req.params;
    const { score1, score2, status } = req.body;

    const { rows } = await db.query(`SELECT * FROM darts_matches WHERE id = $1`, [id]);
    if (!rows.length) return res.status(404).json({ error: 'Match not found' });

    const match    = rows[0];
    const newScore1 = score1  !== undefined ? score1  : match.score1;
    const newScore2 = score2  !== undefined ? score2  : match.score2;
    const newStatus = status  !== undefined ? status  : match.status;

    let winnerId = match.winner_id;
    let loserId  = match.loser_id;

    if (newStatus === 'completed' && newScore1 !== null && newScore2 !== null) {
      if      (newScore1 > newScore2) { winnerId = match.team1_id; loserId = match.team2_id; }
      else if (newScore2 > newScore1) { winnerId = match.team2_id; loserId = match.team1_id; }
    }
    if (newStatus === 'upcoming' || newStatus === 'live') {
      winnerId = null;
      loserId  = null;
    }

    const updated = await db.query(
      `UPDATE darts_matches SET score1=$1, score2=$2, status=$3, winner_id=$4, loser_id=$5 WHERE id=$6 RETURNING *`,
      [newScore1, newScore2, newStatus, winnerId, loserId, id]
    );

    // ── Auto-advance: QF completed → push winner into correct SF slot ──
    // QF0,QF1 (index 0,1) feed SF[0]; QF2,QF3 (index 2,3) feed SF[1].
    // Within each SF: even-index QF → team1, odd-index QF → team2.
    if (match.stage === 'quarterfinal' && newStatus === 'completed' && winnerId) {
      const { rows: qfs } = await db.query(
        `SELECT id FROM darts_matches WHERE tournament_id=$1 AND stage='quarterfinal' ORDER BY id ASC`,
        [match.tournament_id]
      );
      const qfIdx  = qfs.findIndex((q) => String(q.id) === String(id));
      const sfSlot = Math.floor(qfIdx / 2); // 0 or 1
      const teamCol = qfIdx % 2 === 0 ? 'team1_id' : 'team2_id';

      const { rows: sfs } = await db.query(
        `SELECT id FROM darts_matches WHERE tournament_id=$1 AND stage='semi' ORDER BY id ASC`,
        [match.tournament_id]
      );
      if (sfs[sfSlot]) {
        await db.query(
          `UPDATE darts_matches SET ${teamCol}=$1 WHERE id=$2`,
          [winnerId, sfs[sfSlot].id]
        );
      }
    }

    // Reset QF → clear the SF slot it had filled
    if (match.stage === 'quarterfinal' && (newStatus === 'upcoming' || newStatus === 'live')) {
      const { rows: qfs } = await db.query(
        `SELECT id FROM darts_matches WHERE tournament_id=$1 AND stage='quarterfinal' ORDER BY id ASC`,
        [match.tournament_id]
      );
      const qfIdx  = qfs.findIndex((q) => String(q.id) === String(id));
      const sfSlot = Math.floor(qfIdx / 2);
      const teamCol = qfIdx % 2 === 0 ? 'team1_id' : 'team2_id';

      const { rows: sfs } = await db.query(
        `SELECT id FROM darts_matches WHERE tournament_id=$1 AND stage='semi' ORDER BY id ASC`,
        [match.tournament_id]
      );
      if (sfs[sfSlot]) {
        await db.query(
          `UPDATE darts_matches SET ${teamCol}=NULL WHERE id=$1`,
          [sfs[sfSlot].id]
        );
      }
    }

    // ── Auto-advance: SF completed → push winner to Final, loser to Bronze ──
    if (match.stage === 'semi' && newStatus === 'completed' && winnerId && loserId) {
      const { rows: sfs } = await db.query(
        `SELECT id FROM darts_matches WHERE tournament_id=$1 AND stage='semi' ORDER BY id ASC`,
        [match.tournament_id]
      );
      const sfIdx  = sfs.findIndex((s) => String(s.id) === String(id));
      const teamCol = sfIdx === 0 ? 'team1_id' : 'team2_id';

      await db.query(
        `UPDATE darts_matches SET ${teamCol}=$1 WHERE tournament_id=$2 AND stage='final'`,
        [winnerId, match.tournament_id]
      );
      await db.query(
        `UPDATE darts_matches SET ${teamCol}=$1 WHERE tournament_id=$2 AND stage='bronze'`,
        [loserId, match.tournament_id]
      );
    }

    // Reset SF → clear Final/Bronze slot
    if (match.stage === 'semi' && (newStatus === 'upcoming' || newStatus === 'live')) {
      const { rows: sfs } = await db.query(
        `SELECT id FROM darts_matches WHERE tournament_id=$1 AND stage='semi' ORDER BY id ASC`,
        [match.tournament_id]
      );
      const sfIdx  = sfs.findIndex((s) => String(s.id) === String(id));
      const teamCol = sfIdx === 0 ? 'team1_id' : 'team2_id';

      await db.query(
        `UPDATE darts_matches SET ${teamCol}=NULL WHERE tournament_id=$1 AND stage='final'`,
        [match.tournament_id]
      );
      await db.query(
        `UPDATE darts_matches SET ${teamCol}=NULL WHERE tournament_id=$1 AND stage='bronze'`,
        [match.tournament_id]
      );
    }

    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update darts match' });
  }
}

// POST /api/darts/matches — create a match
async function createDartsMatch(req, res) {
  try {
    const { tournament_id, group_id, stage, team1_id, team2_id, match_date, status, team1_player_name, team2_player_name } = req.body;
    if (!tournament_id || !stage) {
      return res.status(400).json({ error: 'tournament_id and stage are required' });
    }
    const { rows } = await db.query(
      `INSERT INTO darts_matches (tournament_id, group_id, stage, team1_id, team2_id, match_date, status, team1_player_name, team2_player_name)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [tournament_id, group_id || null, stage, team1_id || null, team2_id || null,
       match_date || null, status || 'upcoming', team1_player_name || null, team2_player_name || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create darts match' });
  }
}

// DELETE /api/darts/matches/:id
async function deleteDartsMatch(req, res) {
  try {
    const { id } = req.params;
    const { rowCount } = await db.query(`DELETE FROM darts_matches WHERE id=$1`, [id]);
    if (!rowCount) return res.status(404).json({ error: 'Match not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete darts match' });
  }
}

// ── Bracket ───────────────────────────────────────────────────

// GET /api/darts/bracket?tournamentId=
async function getDartsBracket(req, res) {
  try {
    const { tournamentId } = req.query;
    if (!tournamentId) return res.status(400).json({ error: 'tournamentId is required' });

    const { rows } = await db.query(`
      SELECT
        dm.id, dm.stage, dm.status, dm.match_date,
        dm.score1, dm.score2, dm.winner_id, dm.loser_id,
        dm.team1_player_name, dm.team2_player_name,
        t1.id AS team1_id, t1.name AS team1_name, t1.short_name AS team1_short, t1.logo_url AS team1_logo,
        t2.id AS team2_id, t2.name AS team2_name, t2.short_name AS team2_short, t2.logo_url AS team2_logo
      FROM darts_matches dm
      LEFT JOIN teams t1 ON t1.id = dm.team1_id
      LEFT JOIN teams t2 ON t2.id = dm.team2_id
      WHERE dm.tournament_id = $1
        AND dm.stage IN ('quarterfinal', 'semi', 'bronze', 'final')
      ORDER BY dm.stage, dm.id
    `, [tournamentId]);

    const bracket = { quarterfinals: [], semifinals: [], bronze: null, final: null };
    for (const row of rows) {
      const m = formatBracketMatch(row);
      if      (row.stage === 'quarterfinal') bracket.quarterfinals.push(m);
      else if (row.stage === 'semi')         bracket.semifinals.push(m);
      else if (row.stage === 'bronze')       bracket.bronze = m;
      else if (row.stage === 'final')        bracket.final  = m;
    }
    res.json(bracket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch darts bracket' });
  }
}

// ── Standings ─────────────────────────────────────────────────

// GET /api/darts/standings?tournamentId=
async function getDartsStandings(req, res) {
  try {
    const { tournamentId } = req.query;
    if (!tournamentId) return res.status(400).json({ error: 'tournamentId is required' });

    const { rows: teamRows } = await db.query(`
      SELECT
        dg.id   AS group_id, dg.name AS group_name,
        t.id    AS team_id,  t.name  AS team_name,
        t.short_name, t.logo_url, dgt.player_name
      FROM darts_groups dg
      JOIN darts_group_teams dgt ON dgt.group_id = dg.id
      JOIN teams             t   ON t.id = dgt.team_id
      WHERE dg.tournament_id = $1
      ORDER BY dg.name, t.name
    `, [tournamentId]);

    const stats = {};
    for (const t of teamRows) {
      if (!stats[t.group_id]) stats[t.group_id] = {};
      const key = `${t.team_id}:${t.player_name ?? ''}`;
      stats[t.group_id][key] = {
        team_id:        t.team_id,
        team_name:      t.team_name,
        short_name:     t.short_name,
        logo_url:       t.logo_url,
        player_name:    t.player_name,
        group_id:       t.group_id,
        group_name:     t.group_name,
        wins:           0, losses: 0, points: 0,
        score_for:      0, score_against: 0, matches_played: 0,
      };
    }

    // Also fetch player names from matches to resolve same-team players
    const { rows: matchPlayerRows } = await db.query(`
      SELECT group_id, team1_id, team2_id, team1_player_name, team2_player_name, score1, score2, winner_id
      FROM darts_matches
      WHERE tournament_id=$1 AND stage='group' AND status='completed'
    `, [tournamentId]);

    for (const m of matchPlayerRows) {
      const gid = m.group_id;
      if (!gid) continue;
      const s1 = m.score1 ?? 0;
      const s2 = m.score2 ?? 0;
      const key1 = `${m.team1_id}:${m.team1_player_name ?? ''}`;
      const key2 = `${m.team2_id}:${m.team2_player_name ?? ''}`;
      if (stats[gid]?.[key1]) {
        const t = stats[gid][key1];
        t.matches_played++; t.score_for += s1; t.score_against += s2;
        if (m.winner_id === m.team1_id) { t.wins++; t.points += 2; } else t.losses++;
      }
      if (stats[gid]?.[key2]) {
        const t = stats[gid][key2];
        t.matches_played++; t.score_for += s2; t.score_against += s1;
        if (m.winner_id === m.team2_id) { t.wins++; t.points += 2; } else t.losses++;
      }
    }

    const groups = Object.entries(stats).map(([groupId, teamsMap]) => {
      const teams = Object.values(teamsMap).map((t) => ({
        ...t, point_difference: t.score_for - t.score_against,
      }));
      teams.sort((a, b) => b.points - a.points || (b.score_for - b.score_against) - (a.score_for - a.score_against));
      teams.forEach((t, i) => { t.rank = i + 1; });
      return { group_id: Number(groupId), group_name: teams[0]?.group_name ?? groupId, teams };
    });

    res.json(groups.sort((a, b) => String(a.group_name).localeCompare(String(b.group_name))));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch darts standings' });
  }
}

module.exports = {
  getDartsGroups, createDartsGroup, deleteDartsGroup,
  listDartsMatches, updateDartsMatch, createDartsMatch, deleteDartsMatch,
  getDartsBracket, getDartsStandings,
};
