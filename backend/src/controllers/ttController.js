const db = require('../db');

function formatTTMatch(row) {
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

// GET /api/tt/groups?tournamentId=
async function getTTGroups(req, res) {
  try {
    const { tournamentId } = req.query;
    if (!tournamentId) return res.status(400).json({ error: 'tournamentId is required' });

    const { rows } = await db.query(`
      SELECT tg.id AS group_id, tg.name AS group_name,
             t.id AS team_id, t.name AS team_name, t.short_name, tgt.player_name
      FROM tt_groups tg
      JOIN tt_group_teams tgt ON tgt.group_id = tg.id
      JOIN teams          t   ON t.id = tgt.team_id
      WHERE tg.tournament_id = $1
      ORDER BY tg.name, t.name
    `, [tournamentId]);

    const groupsMap = {};
    for (const row of rows) {
      if (!groupsMap[row.group_id]) {
        groupsMap[row.group_id] = { id: row.group_id, name: row.group_name, teams: [] };
      }
      groupsMap[row.group_id].teams.push({
        id: row.team_id, name: row.team_name, short_name: row.short_name, player_name: row.player_name,
      });
    }
    res.json(Object.values(groupsMap).sort((a, b) => a.name.localeCompare(b.name)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch TT groups' });
  }
}

// POST /api/tt/groups
async function createTTGroup(req, res) {
  try {
    const { tournament_id, players } = req.body;
    if (!tournament_id || !Array.isArray(players) || players.length < 2 || players.length > 6) {
      return res.status(400).json({ error: 'tournament_id and 2–6 players are required' });
    }
    for (const p of players) {
      if (!p.name?.trim() || !p.team_id) return res.status(400).json({ error: 'Each player needs a name and team' });
    }

    const { rows: [{ count }] } = await db.query(
      `SELECT COUNT(*) AS count FROM tt_groups WHERE tournament_id = $1`, [tournament_id]
    );
    const name = String.fromCharCode(65 + parseInt(count, 10));

    const { rows: [group] } = await db.query(
      `INSERT INTO tt_groups (tournament_id, name) VALUES ($1, $2) RETURNING id`,
      [tournament_id, name]
    );

    for (const p of players) {
      await db.query(
        `INSERT INTO tt_group_teams (group_id, team_id, player_name) VALUES ($1, $2, $3)`,
        [group.id, Number(p.team_id), p.name.trim()]
      );
    }

    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        await db.query(
          `INSERT INTO tt_matches (tournament_id, group_id, stage, team1_id, team2_id, team1_player_name, team2_player_name, status)
           VALUES ($1, $2, 'group', $3, $4, $5, $6, 'upcoming')`,
          [tournament_id, group.id, Number(players[i].team_id), Number(players[j].team_id), players[i].name.trim(), players[j].name.trim()]
        );
      }
    }

    res.status(201).json({ id: group.id, name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create TT group', detail: err.message });
  }
}

// DELETE /api/tt/groups/:id
async function deleteTTGroup(req, res) {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM tt_matches WHERE group_id = $1`, [id]);
    const { rowCount } = await db.query(`DELETE FROM tt_groups WHERE id = $1`, [id]);
    if (!rowCount) return res.status(404).json({ error: 'Group not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete TT group' });
  }
}

// GET /api/tt/matches?tournamentId=&stage=&status=
async function listTTMatches(req, res) {
  try {
    const { tournamentId, stage, status } = req.query;
    if (!tournamentId) return res.status(400).json({ error: 'tournamentId is required' });

    let query = `
      SELECT
        tm.id, tm.tournament_id, tm.group_id,
        tg.name AS group_name,
        tm.stage, tm.status, tm.match_date,
        tm.score1, tm.score2, tm.winner_id, tm.loser_id,
        tm.team1_player_name, tm.team2_player_name,
        t1.id AS team1_id, t1.name AS team1_name, t1.short_name AS team1_short, t1.logo_url AS team1_logo,
        t2.id AS team2_id, t2.name AS team2_name, t2.short_name AS team2_short, t2.logo_url AS team2_logo
      FROM tt_matches tm
      LEFT JOIN tt_groups tg ON tg.id = tm.group_id
      LEFT JOIN teams     t1 ON t1.id = tm.team1_id
      LEFT JOIN teams     t2 ON t2.id = tm.team2_id
      WHERE tm.tournament_id = $1
    `;
    const params = [tournamentId];
    let idx = 2;
    if (stage)  { query += ` AND tm.stage = $${idx++}`;  params.push(stage); }
    if (status) { query += ` AND tm.status = $${idx++}`; params.push(status); }
    query += ' ORDER BY tm.match_date ASC NULLS LAST, tm.id ASC';

    const { rows } = await db.query(query, params);
    res.json(rows.map(formatTTMatch));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch TT matches' });
  }
}

// POST /api/tt/matches/:id
async function updateTTMatch(req, res) {
  try {
    const { id } = req.params;
    const { score1, score2, status } = req.body;

    const { rows } = await db.query(`SELECT * FROM tt_matches WHERE id = $1`, [id]);
    if (!rows.length) return res.status(404).json({ error: 'Match not found' });

    const match    = rows[0];
    const newScore1 = score1 !== undefined ? score1 : match.score1;
    const newScore2 = score2 !== undefined ? score2 : match.score2;
    const newStatus = status !== undefined ? status : match.status;

    let winnerId = match.winner_id;
    let loserId  = match.loser_id;

    if (newStatus === 'completed' && newScore1 !== null && newScore2 !== null) {
      if      (newScore1 > newScore2) { winnerId = match.team1_id; loserId = match.team2_id; }
      else if (newScore2 > newScore1) { winnerId = match.team2_id; loserId = match.team1_id; }
    }
    if (newStatus === 'upcoming' || newStatus === 'live') { winnerId = null; loserId = null; }

    const updated = await db.query(
      `UPDATE tt_matches SET score1=$1, score2=$2, status=$3, winner_id=$4, loser_id=$5 WHERE id=$6 RETURNING *`,
      [newScore1, newScore2, newStatus, winnerId, loserId, id]
    );

    // QF completed → push winner into correct SF slot
    if (match.stage === 'quarterfinal' && newStatus === 'completed' && winnerId) {
      const { rows: qfs } = await db.query(
        `SELECT id FROM tt_matches WHERE tournament_id=$1 AND stage='quarterfinal' ORDER BY id ASC`,
        [match.tournament_id]
      );
      const qfIdx  = qfs.findIndex((q) => String(q.id) === String(id));
      const sfSlot = Math.floor(qfIdx / 2);
      const teamCol = qfIdx % 2 === 0 ? 'team1_id' : 'team2_id';
      const { rows: sfs } = await db.query(
        `SELECT id FROM tt_matches WHERE tournament_id=$1 AND stage='semi' ORDER BY id ASC`,
        [match.tournament_id]
      );
      if (sfs[sfSlot]) {
        await db.query(`UPDATE tt_matches SET ${teamCol}=$1 WHERE id=$2`, [winnerId, sfs[sfSlot].id]);
      }
    }

    if (match.stage === 'quarterfinal' && (newStatus === 'upcoming' || newStatus === 'live')) {
      const { rows: qfs } = await db.query(
        `SELECT id FROM tt_matches WHERE tournament_id=$1 AND stage='quarterfinal' ORDER BY id ASC`,
        [match.tournament_id]
      );
      const qfIdx  = qfs.findIndex((q) => String(q.id) === String(id));
      const sfSlot = Math.floor(qfIdx / 2);
      const teamCol = qfIdx % 2 === 0 ? 'team1_id' : 'team2_id';
      const { rows: sfs } = await db.query(
        `SELECT id FROM tt_matches WHERE tournament_id=$1 AND stage='semi' ORDER BY id ASC`,
        [match.tournament_id]
      );
      if (sfs[sfSlot]) {
        await db.query(`UPDATE tt_matches SET ${teamCol}=NULL WHERE id=$1`, [sfs[sfSlot].id]);
      }
    }

    // SF completed → push winner to Final, loser to Bronze
    if (match.stage === 'semi' && newStatus === 'completed' && winnerId && loserId) {
      const { rows: sfs } = await db.query(
        `SELECT id FROM tt_matches WHERE tournament_id=$1 AND stage='semi' ORDER BY id ASC`,
        [match.tournament_id]
      );
      const sfIdx  = sfs.findIndex((s) => String(s.id) === String(id));
      const teamCol = sfIdx === 0 ? 'team1_id' : 'team2_id';
      await db.query(`UPDATE tt_matches SET ${teamCol}=$1 WHERE tournament_id=$2 AND stage='final'`,  [winnerId, match.tournament_id]);
      await db.query(`UPDATE tt_matches SET ${teamCol}=$1 WHERE tournament_id=$2 AND stage='bronze'`, [loserId,  match.tournament_id]);
    }

    if (match.stage === 'semi' && (newStatus === 'upcoming' || newStatus === 'live')) {
      const { rows: sfs } = await db.query(
        `SELECT id FROM tt_matches WHERE tournament_id=$1 AND stage='semi' ORDER BY id ASC`,
        [match.tournament_id]
      );
      const sfIdx  = sfs.findIndex((s) => String(s.id) === String(id));
      const teamCol = sfIdx === 0 ? 'team1_id' : 'team2_id';
      await db.query(`UPDATE tt_matches SET ${teamCol}=NULL WHERE tournament_id=$1 AND stage='final'`,  [match.tournament_id]);
      await db.query(`UPDATE tt_matches SET ${teamCol}=NULL WHERE tournament_id=$1 AND stage='bronze'`, [match.tournament_id]);
    }

    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update TT match' });
  }
}

// POST /api/tt/matches
async function createTTMatch(req, res) {
  try {
    const { tournament_id, group_id, stage, team1_id, team2_id, match_date, status, team1_player_name, team2_player_name } = req.body;
    if (!tournament_id || !stage) return res.status(400).json({ error: 'tournament_id and stage are required' });
    const { rows } = await db.query(
      `INSERT INTO tt_matches (tournament_id, group_id, stage, team1_id, team2_id, match_date, status, team1_player_name, team2_player_name)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [tournament_id, group_id || null, stage, team1_id || null, team2_id || null,
       match_date || null, status || 'upcoming', team1_player_name || null, team2_player_name || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create TT match' });
  }
}

// DELETE /api/tt/matches/:id
async function deleteTTMatch(req, res) {
  try {
    const { id } = req.params;
    const { rowCount } = await db.query(`DELETE FROM tt_matches WHERE id=$1`, [id]);
    if (!rowCount) return res.status(404).json({ error: 'Match not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete TT match' });
  }
}

// GET /api/tt/bracket?tournamentId=
async function getTTBracket(req, res) {
  try {
    const { tournamentId } = req.query;
    if (!tournamentId) return res.status(400).json({ error: 'tournamentId is required' });

    const { rows } = await db.query(`
      SELECT
        tm.id, tm.stage, tm.status, tm.match_date,
        tm.score1, tm.score2, tm.winner_id, tm.loser_id,
        tm.team1_player_name, tm.team2_player_name,
        t1.id AS team1_id, t1.name AS team1_name, t1.short_name AS team1_short, t1.logo_url AS team1_logo,
        t2.id AS team2_id, t2.name AS team2_name, t2.short_name AS team2_short, t2.logo_url AS team2_logo
      FROM tt_matches tm
      LEFT JOIN teams t1 ON t1.id = tm.team1_id
      LEFT JOIN teams t2 ON t2.id = tm.team2_id
      WHERE tm.tournament_id = $1
        AND tm.stage IN ('quarterfinal', 'semi', 'bronze', 'final')
      ORDER BY tm.stage, tm.id
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
    res.status(500).json({ error: 'Failed to fetch TT bracket' });
  }
}

// GET /api/tt/standings?tournamentId=
async function getTTStandings(req, res) {
  try {
    const { tournamentId } = req.query;
    if (!tournamentId) return res.status(400).json({ error: 'tournamentId is required' });

    const { rows: teamRows } = await db.query(`
      SELECT tg.id AS group_id, tg.name AS group_name,
             t.id AS team_id, t.name AS team_name, t.short_name, t.logo_url, tgt.player_name
      FROM tt_groups tg
      JOIN tt_group_teams tgt ON tgt.group_id = tg.id
      JOIN teams          t   ON t.id = tgt.team_id
      WHERE tg.tournament_id = $1
      ORDER BY tg.name, t.name
    `, [tournamentId]);

    const stats = {};
    for (const t of teamRows) {
      if (!stats[t.group_id]) stats[t.group_id] = {};
      const key = `${t.team_id}:${t.player_name ?? ''}`;
      stats[t.group_id][key] = {
        team_id: t.team_id, team_name: t.team_name, short_name: t.short_name,
        logo_url: t.logo_url, player_name: t.player_name,
        group_id: t.group_id, group_name: t.group_name,
        wins: 0, losses: 0, points: 0, score_for: 0, score_against: 0, matches_played: 0,
      };
    }

    const { rows: matchRows } = await db.query(`
      SELECT group_id, team1_id, team2_id, team1_player_name, team2_player_name, score1, score2, winner_id
      FROM tt_matches
      WHERE tournament_id=$1 AND stage='group' AND status='completed'
    `, [tournamentId]);

    for (const m of matchRows) {
      const gid = m.group_id;
      if (!gid) continue;
      const s1   = m.score1 ?? 0;
      const s2   = m.score2 ?? 0;
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
      const teams = Object.values(teamsMap).map((t) => ({ ...t, point_difference: t.score_for - t.score_against }));
      teams.sort((a, b) => b.points - a.points || (b.score_for - b.score_against) - (a.score_for - a.score_against));
      teams.forEach((t, i) => { t.rank = i + 1; });
      return { group_id: Number(groupId), group_name: teams[0]?.group_name ?? groupId, teams };
    });

    res.json(groups.sort((a, b) => String(a.group_name).localeCompare(String(b.group_name))));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch TT standings' });
  }
}

module.exports = {
  getTTGroups, createTTGroup, deleteTTGroup,
  listTTMatches, updateTTMatch, createTTMatch, deleteTTMatch,
  getTTBracket, getTTStandings,
};
