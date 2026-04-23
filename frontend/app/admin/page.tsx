'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Tournament, Match, Group, Team, DartsGroup } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Plus, Trash2, Pencil, Check, X, Shield, Lock, ChevronRight, Activity } from 'lucide-react';

const STAGES        = ['group', 'semi', 'bronze', 'final'] as const;
const DARTS_STAGES  = ['group', 'quarterfinal', 'semi', 'bronze', 'final'] as const;
const STATUSES      = ['upcoming', 'live', 'completed'] as const;
const ADMIN_PIN     = '1234';

// Sports that skip bracket and use direct placement entry
const PLACEMENT_SPORTS = ['Table Tennis', 'Chess'];
const DARTS_SPORT      = 'Darts';

interface EditState { score1: string; score2: string; status: string }
interface AddState  { stage: string; team1_id: string; team2_id: string; match_date: string; status: string; group_id: string; player1_name: string; player2_name: string }

const emptyAdd: AddState = { stage: 'group', team1_id: '', team2_id: '', match_date: '', status: 'upcoming', group_id: '', player1_name: '', player2_name: '' };

/* ── Individual Placement Panel ── */
interface PlacementEntry { player_name: string; team_id: string }
const emptyEntry = (): PlacementEntry => ({ player_name: '', team_id: '' });

function PlacementPanel({
  tournamentId, onSaved, onError, onCleared,
}: {
  tournamentId: number;
  onSaved: () => void;
  onError: () => void;
  onCleared: () => void;
}) {
  const [entries, setEntries] = useState<PlacementEntry[]>([
    emptyEntry(), emptyEntry(), emptyEntry(), emptyEntry(),
  ]);
  const [allTeams, setAllTeams] = useState<{ id: number; name: string }[]>([]);
  const [saving,   setSaving]   = useState(false);
  const [clearing, setClearing] = useState(false);

  // Load all teams + existing placements on mount
  useEffect(() => {
    api.teams.list().then(setAllTeams).catch(() => {});
    api.tournaments.getIndividualPlacements(tournamentId).then((rows) => {
      if (!rows.length) return;
      setEntries((prev) => prev.map((e, i) => {
        const row = rows.find((r) => r.place === i + 1);
        return row ? { player_name: row.player_name, team_id: row.team_id ? String(row.team_id) : '' } : e;
      }));
    }).catch(() => {});
  }, [tournamentId]);

  const medals = ['🥇 1st (Gold)', '🥈 2nd (Silver)', '🥉 3rd (Bronze)', '4th Place'];

  const update = (i: number, field: keyof PlacementEntry, val: string) => {
    setEntries((prev) => prev.map((e, idx) => idx === i ? { ...e, [field]: val } : e));
  };

  const submit = async () => {
    const payload = entries.map((e, i) => ({
      place:       i + 1,
      player_name: e.player_name.trim(),
      team_id:     e.team_id ? Number(e.team_id) : null,
    })).filter((e) => e.player_name);

    if (payload.length < 4) return;
    setSaving(true);
    try {
      await api.tournaments.setIndividualPlacements(tournamentId, payload);
      onSaved();
    } catch { onError(); }
    finally  { setSaving(false); }
  };

  const clear = async () => {
    if (!confirm('Clear all placement data for this tournament?')) return;
    setClearing(true);
    try {
      await api.tournaments.clearIndividualPlacements(tournamentId);
      setEntries([emptyEntry(), emptyEntry(), emptyEntry(), emptyEntry()]);
      onCleared();
    } catch { onError(); }
    finally  { setClearing(false); }
  };

  const allFilled = entries.every((e) => e.player_name.trim());
  const anyFilled = entries.some((e) => e.player_name.trim());

  return (
    <div className="bg-surface-card border border-brand/20 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-brand uppercase tracking-widest">Final Standings</span>
        <div className="flex-1 h-px bg-surface-border" />
        <span className="text-[10px] text-muted">Enter player name + team for each placement</span>
      </div>

      <div className="space-y-2">
        {medals.map((label, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs font-bold text-muted w-28 shrink-0">{label}</span>
            <input
              className="input flex-1"
              placeholder="Player name"
              value={entries[i].player_name}
              onChange={(e) => update(i, 'player_name', e.target.value)}
            />
            <select
              className="input w-36 shrink-0"
              value={entries[i].team_id}
              onChange={(e) => update(i, 'team_id', e.target.value)}
            >
              <option value="">— Team —</option>
              {allTeams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={submit}
          disabled={saving || !allFilled}
          className="bg-brand text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Save Placements'}
        </button>
        {anyFilled && (
          <button
            onClick={clear}
            disabled={clearing}
            className="text-sm font-semibold px-4 py-2 rounded-xl border border-loss/30 text-loss hover:bg-loss/10 transition-colors disabled:opacity-40"
          >
            {clearing ? 'Clearing…' : 'Clear Data'}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Darts Groups Panel ── */

interface DartsPlayer { name: string; team_id: string }
const emptyPlayer = (): DartsPlayer => ({ name: '', team_id: '' });
const emptyDartsGroup = () => [emptyPlayer(), emptyPlayer()];

function DartsGroupsPanel({
  tournament,
  onMsg,
  onGroupsChanged,
}: {
  tournament: Tournament;
  onMsg: (text: string, ok?: boolean) => void;
  onGroupsChanged: () => void;
}) {
  const [groups,   setGroups]   = useState<DartsGroup[]>([]);
  const [allTeams, setAllTeams] = useState<{ id: number; name: string }[]>([]);
  const [showAdd,  setShowAdd]  = useState(false);
  const [players,  setPlayers]  = useState<DartsPlayer[]>(emptyDartsGroup());
  const [saving,   setSaving]   = useState(false);

  const load = useCallback(() => {
    api.darts.groups.list(tournament.id).then(setGroups).catch(() => {});
  }, [tournament.id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    // Deduplicate teams by name to avoid showing sport-specific duplicates
    api.teams.list().then((rows) => {
      const seen = new Set<string>();
      setAllTeams(rows.filter((t) => {
        if (seen.has(t.name)) return false;
        seen.add(t.name);
        return true;
      }));
    }).catch(() => {});
  }, []);

  const updatePlayer = (i: number, field: keyof DartsPlayer, val: string) =>
    setPlayers((prev) => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p));

  const handleAdd = async () => {
    if (players.some((p) => !p.name.trim() || !p.team_id)) return;
    setSaving(true);
    try {
      await api.darts.groups.create({
        tournament_id: tournament.id,
        players: players.map((p) => ({ name: p.name.trim(), team_id: Number(p.team_id) })),
      });
      onMsg('Group created');
      setShowAdd(false);
      setPlayers(emptyDartsGroup());
      load();
      onGroupsChanged();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create group';
      onMsg(msg, false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (groupId: number) => {
    if (!confirm('Delete this group and its matches?')) return;
    try {
      await api.darts.groups.delete(groupId);
      onMsg('Group deleted');
      load();
      onGroupsChanged();
    } catch { onMsg('Failed to delete group', false); }
  };

  const canSubmit = players.length >= 2 && players.every((p) => p.name.trim() && p.team_id);

  const addPlayer    = () => { if (players.length < 6) setPlayers((prev) => [...prev, emptyPlayer()]); };
  const removePlayer = (i: number) => { if (players.length > 2) setPlayers((prev) => prev.filter((_, idx) => idx !== i)); };

  return (
    <div className="bg-surface-card border border-brand/20 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-brand uppercase tracking-widest">Darts Groups</span>
        <div className="flex-1 h-px bg-surface-border" />
        <button
          onClick={() => { setShowAdd(!showAdd); setPlayers(emptyDartsGroup()); }}
          className={cn(
            'flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors',
            showAdd ? 'bg-surface-hover text-muted' : 'bg-brand text-white hover:bg-brand-dark',
          )}
        >
          {showAdd ? <X size={12} /> : <Plus size={12} />}
          {showAdd ? 'Cancel' : 'Add Group'}
        </button>
      </div>

      {groups.length === 0 && !showAdd && (
        <p className="text-xs text-muted">No groups yet — add one to create the first group match.</p>
      )}
      <div className="space-y-2">
        {groups.map((g) => (
          <div key={g.id} className="flex items-start justify-between bg-surface rounded-xl px-4 py-2.5 border border-surface-border">
            <div>
              <span className="text-xs font-bold text-foreground mr-2">Group {g.name}</span>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                {g.teams.map((t) => (
                  <span key={t.id} className="text-xs text-muted">
                    {t.player_name ? `${t.player_name} (${t.name})` : t.name}
                  </span>
                ))}
              </div>
            </div>
            <button onClick={() => handleDelete(g.id)} className="p-1.5 rounded-lg text-muted hover:text-loss hover:bg-loss/10 transition-colors shrink-0" title="Delete group">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-muted uppercase tracking-widest font-bold">{players.length} Players</p>
            {players.length < 6 && (
              <button onClick={addPlayer} className="flex items-center gap-1 text-xs text-brand hover:text-brand-dark font-semibold">
                <Plus size={11} /> Add Player
              </button>
            )}
          </div>
          {players.map((p, i) => (
            <div key={i} className="grid grid-cols-2 gap-2">
              <input
                className="input"
                placeholder={`Player ${i + 1} name`}
                value={p.name}
                onChange={(e) => updatePlayer(i, 'name', e.target.value)}
              />
              <div className="flex gap-1.5">
                <select
                  className="input flex-1"
                  value={p.team_id}
                  onChange={(e) => updatePlayer(i, 'team_id', e.target.value)}
                >
                  <option value="">— Team —</option>
                  {allTeams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                {players.length > 2 && (
                  <button onClick={() => removePlayer(i)} className="p-2 rounded-lg text-muted hover:text-loss hover:bg-loss/10 transition-colors shrink-0">
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            onClick={handleAdd}
            disabled={saving || !canSubmit}
            className="mt-2 bg-brand text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-40"
          >
            {saving ? 'Creating…' : 'Create Group'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ── PIN Gate ── */
function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('');
  const [err, setErr] = useState(false);

  const submit = () => {
    if (pin === ADMIN_PIN) { onUnlock(); }
    else { setErr(true); setPin(''); setTimeout(() => setErr(false), 1500); }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="bg-surface-card border border-surface-border rounded-2xl p-8 w-80 shadow-xl text-center space-y-5">
        <div className="w-14 h-14 bg-brand/10 rounded-full flex items-center justify-center mx-auto">
          <Lock size={24} className="text-brand" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Admin Access</h2>
          <p className="text-xs text-muted mt-1">Enter PIN to continue</p>
        </div>
        <input
          type="password"
          inputMode="numeric"
          maxLength={8}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="••••"
          className={cn('input text-center text-lg tracking-widest', err && 'border-loss ring-2 ring-loss/30')}
          autoFocus
        />
        {err && <p className="text-xs text-loss -mt-2">Incorrect PIN</p>}
        <button
          onClick={submit}
          className="w-full bg-brand text-white font-semibold py-2 rounded-xl hover:bg-brand-dark transition-colors"
        >
          Unlock
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [unlocked,   setUnlocked]   = useState(false);
  const [tournaments,setTournaments]= useState<Tournament[]>([]);
  const [selected,   setSelected]   = useState<Tournament | null>(null);
  const [groups,     setGroups]     = useState<Group[]>([]);
  const [matches,    setMatches]    = useState<Match[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [editingId,  setEditingId]  = useState<number | null>(null);
  const [editForm,   setEditForm]   = useState<EditState>({ score1: '', score2: '', status: '' });
  const [showAdd,    setShowAdd]    = useState(false);
  const [addForm,    setAddForm]    = useState<AddState>(emptyAdd);
  const [saving,     setSaving]     = useState(false);
  const [msg,        setMsg]        = useState<{ text: string; ok: boolean } | null>(null);
  const [dartsGroups,setDartsGroups]= useState<DartsGroup[]>([]);
  const isDarts = selected?.sport_name === DARTS_SPORT;

  /* persist unlock for the browser session */
  useEffect(() => {
    if (sessionStorage.getItem('admin_unlocked') === '1') setUnlocked(true);
  }, []);

  const unlock = () => { sessionStorage.setItem('admin_unlocked', '1'); setUnlocked(true); };

  useEffect(() => {
    if (unlocked) api.tournaments.list().then(setTournaments).catch(() => {});
  }, [unlocked]);

  const loadMatches = useCallback(async (t: Tournament) => {
    setLoading(true); setEditingId(null); setShowAdd(false);
    try {
      if (t.sport_name === DARTS_SPORT) {
        const [data, dGroups] = await Promise.all([
          api.darts.matches.list({ tournamentId: t.id }),
          api.darts.groups.list(t.id),
        ]);
        setMatches(data);
        setDartsGroups(dGroups);
        setGroups([]);
      } else {
        const [data, detail] = await Promise.all([
          api.matches.list({ tournamentId: t.id }),
          api.tournaments.get(t.id),
        ]);
        setMatches(data);
        setGroups(detail.groups ?? []);
      }
    } finally { setLoading(false); }
  }, []);

  const selectTournament = (t: Tournament) => { setSelected(t); setDartsGroups([]); loadMatches(t); };

  const flash = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  };

  /* ── helpers ── */
  const allTeams: Team[] = isDarts
    ? dartsGroups.flatMap((g) => g.teams as Team[])
    : groups.flatMap((g) => g.teams ?? []);
  const teamsForGroup = (groupId: string) => {
    if (isDarts) {
      const g = dartsGroups.find((g) => String(g.id) === groupId);
      return (g?.teams ?? allTeams) as Team[];
    }
    const g = groups.find((g) => String(g.id) === groupId);
    return g?.teams ?? allTeams;
  };

  const BO3_SPORTS = ['CS2', 'Dota 2'];
  const maxScore   = selected && BO3_SPORTS.includes(selected.sport_name) ? 2 : undefined;

  const clamp = (val: string) => {
    if (maxScore === undefined) return val;
    const n = Number(val);
    return String(Math.min(Math.max(0, n), maxScore));
  };

  /* ── Edit ── */
  const startEdit = (m: Match) => {
    setEditingId(m.id);
    setEditForm({
      score1: m.score1 != null ? String(m.score1) : '',
      score2: m.score2 != null ? String(m.score2) : '',
      status: m.status,
    });
  };

  const saveEdit = async (m: Match) => {
    setSaving(true);
    try {
      const body = {
        score1: editForm.score1 !== '' ? Number(editForm.score1) : undefined,
        score2: editForm.score2 !== '' ? Number(editForm.score2) : undefined,
        status: editForm.status,
      };
      if (isDarts) await api.darts.matches.update(m.id, body);
      else         await api.matches.update(m.id, body);
      flash('Match updated');
      setEditingId(null);
      loadMatches(selected!);
    } catch { flash('Failed to update', false); }
    finally  { setSaving(false); }
  };

  /* ── Delete ── */
  const deleteMatch = async (id: number) => {
    if (!confirm('Delete this match?')) return;
    try {
      if (isDarts) await api.darts.matches.delete(id);
      else         await api.matches.delete(id);
      flash('Match deleted');
      loadMatches(selected!);
    } catch { flash('Failed to delete', false); }
  };

  /* ── Add ── */
  const submitAdd = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      // Save player names to teams only for individual sports (not team sports like Basketball)
      if (!isDarts && PLACEMENT_SPORTS.includes(selected.sport_name)) {
        if (addForm.team1_id && addForm.player1_name.trim())
          await api.teams.update(Number(addForm.team1_id), addForm.player1_name.trim()).catch(() => {});
        if (addForm.team2_id && addForm.player2_name.trim())
          await api.teams.update(Number(addForm.team2_id), addForm.player2_name.trim()).catch(() => {});
      }

      // For Darts, team values are composite "id:player_name" — parse both parts
      const parseTeamId     = (val: string) => val ? Number(val.split(':')[0]) : null;
      const parsePlayerName = (val: string) => { const p = val.split(':'); return p.length > 1 ? p.slice(1).join(':') : null; };
      const matchBody = {
        tournament_id:      selected.id,
        stage:              addForm.stage,
        team1_id:           isDarts ? parseTeamId(addForm.team1_id) : (addForm.team1_id ? Number(addForm.team1_id) : null),
        team2_id:           isDarts ? parseTeamId(addForm.team2_id) : (addForm.team2_id ? Number(addForm.team2_id) : null),
        team1_player_name:  isDarts ? parsePlayerName(addForm.team1_id) : undefined,
        team2_player_name:  isDarts ? parsePlayerName(addForm.team2_id) : undefined,
        group_id:           addForm.group_id  ? Number(addForm.group_id)  : null,
        match_date:         addForm.match_date ? addForm.match_date + ':00+08:00' : undefined,
        status:             addForm.status,
      };
      if (isDarts) await api.darts.matches.create(matchBody);
      else         await api.matches.create(matchBody);
      flash('Match created');
      setShowAdd(false);
      setAddForm(emptyAdd);
      loadMatches(selected);
    } catch { flash('Failed to create', false); }
    finally  { setSaving(false); }
  };

  const activeStages = isDarts ? DARTS_STAGES : STAGES;
  const byStage = activeStages
    .map((s) => ({ stage: s, matches: matches.filter((m) => m.stage === s) }))
    .filter((g) => g.matches.length > 0);

  const statusCounts = {
    live:      matches.filter((m) => m.status === 'live').length,
    upcoming:  matches.filter((m) => m.status === 'upcoming').length,
    completed: matches.filter((m) => m.status === 'completed').length,
  };

  const isPlacementSport  = selected ? PLACEMENT_SPORTS.includes(selected.sport_name) : false;

  if (!unlocked) return <PinGate onUnlock={unlock} />;

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-surface-card border-b border-surface-border px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-brand/10 rounded-lg flex items-center justify-center">
          <Shield size={16} className="text-brand" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-foreground leading-none">Admin Panel</h1>
          <span className="text-xs text-muted">Match Management</span>
        </div>
        {msg && (
          <span className={cn('ml-auto text-xs font-medium px-3 py-1.5 rounded-full', msg.ok ? 'bg-win/15 text-win' : 'bg-loss/15 text-loss')}>
            {msg.text}
          </span>
        )}
      </div>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside className="w-60 shrink-0 border-r border-surface-border bg-surface-card overflow-y-auto">
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest px-4 py-3 border-b border-surface-border">
            Tournaments
          </p>
          {tournaments.map((t) => (
            <button
              key={t.id}
              onClick={() => selectTournament(t)}
              className={cn(
                'w-full text-left px-4 py-3 border-b border-surface-border/40 flex items-center gap-2 transition-colors group',
                selected?.id === t.id ? 'bg-brand/8 border-l-[3px] border-l-brand' : 'hover:bg-surface-hover',
              )}
            >
              <div className="flex-1 min-w-0">
                <p className={cn('text-xs font-semibold truncate', selected?.id === t.id ? 'text-brand' : 'text-foreground')}>
                  {t.name}
                </p>
                <p className="text-[10px] text-muted mt-0.5 truncate">{t.sport_name} · {t.status}</p>
              </div>
              <ChevronRight size={12} className={cn('shrink-0 transition-colors', selected?.id === t.id ? 'text-brand' : 'text-muted group-hover:text-foreground')} />
            </button>
          ))}
        </aside>

        {/* Main */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted">
              <Shield size={32} className="opacity-20" />
              <p className="text-sm">Select a tournament to manage matches</p>
            </div>
          ) : (
            <div className="space-y-5 max-w-5xl">
              {/* Toolbar */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-foreground">{selected.name}</h2>
                  <div className="flex items-center gap-3 mt-1.5">
                    {statusCounts.live > 0 && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-live">
                        <Activity size={10} />
                        {statusCounts.live} live
                      </span>
                    )}
                    <span className="text-[10px] text-muted">{statusCounts.completed} done</span>
                    <span className="text-[10px] text-muted">{statusCounts.upcoming} upcoming</span>
                  </div>
                </div>
                <button
                  onClick={() => { setShowAdd(!showAdd); setEditingId(null); }}
                  className={cn(
                    'flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-colors shrink-0',
                    showAdd ? 'bg-surface-hover text-muted' : 'bg-brand text-white hover:bg-brand-dark',
                  )}
                >
                  {showAdd ? <X size={14} /> : <Plus size={14} />}
                  {showAdd ? 'Cancel' : 'Add Match'}
                </button>
              </div>

              {/* Add match form */}
              {showAdd && (
                <div className="bg-surface-card border border-brand/25 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">New Match</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="label">Stage</label>
                      <select className="input" value={addForm.stage} onChange={(e) => setAddForm({ ...addForm, stage: e.target.value, group_id: '', team1_id: '', team2_id: '' })}>
                        {activeStages.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Status</label>
                      <select className="input" value={addForm.status} onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    {addForm.stage === 'group' && (isDarts ? dartsGroups.length > 0 : groups.length > 0) && (
                      <div>
                        <label className="label">Group</label>
                        <select className="input" value={addForm.group_id} onChange={(e) => setAddForm({ ...addForm, group_id: e.target.value, team1_id: '', team2_id: '' })}>
                          <option value="">— select —</option>
                          {isDarts
                            ? dartsGroups.map((g) => <option key={g.id} value={g.id}>Group {g.name}</option>)
                            : groups.map((g) => <option key={g.id} value={g.id}>Group {g.name}</option>)
                          }
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="label">Team 1</label>
                      <select className="input" value={addForm.team1_id} onChange={(e) => setAddForm({ ...addForm, team1_id: e.target.value })}>
                        <option value="">— TBD —</option>
                        {(addForm.stage === 'group' && addForm.group_id ? teamsForGroup(addForm.group_id) : allTeams).map((t, i) => {
                          const val = isDarts ? `${t.id}:${t.player_name ?? i}` : String(t.id);
                          return <option key={val} value={val}>{t.player_name ? `${t.player_name} (${t.name})` : t.name}</option>;
                        })}
                      </select>
                      {!isDarts && addForm.team1_id && (
                        <input className="input mt-1.5" placeholder="Player name (optional)" value={addForm.player1_name}
                          onChange={(e) => setAddForm({ ...addForm, player1_name: e.target.value })} />
                      )}
                    </div>
                    <div>
                      <label className="label">Team 2</label>
                      <select className="input" value={addForm.team2_id} onChange={(e) => setAddForm({ ...addForm, team2_id: e.target.value })}>
                        <option value="">— TBD —</option>
                        {(addForm.stage === 'group' && addForm.group_id ? teamsForGroup(addForm.group_id) : allTeams)
                          .map((t, i) => {
                            const val = isDarts ? `${t.id}:${t.player_name ?? i}` : String(t.id);
                            if (val === addForm.team1_id) return null;
                            return <option key={val} value={val}>{t.player_name ? `${t.player_name} (${t.name})` : t.name}</option>;
                          })}
                      </select>
                      {!isDarts && addForm.team2_id && (
                        <input className="input mt-1.5" placeholder="Player name (optional)" value={addForm.player2_name}
                          onChange={(e) => setAddForm({ ...addForm, player2_name: e.target.value })} />
                      )}
                    </div>
                    <div>
                      <label className="label">Match Date</label>
                      <input className="input" type="datetime-local" value={addForm.match_date} onChange={(e) => setAddForm({ ...addForm, match_date: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={submitAdd} disabled={saving} className="bg-brand text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50">
                      {saving ? 'Saving…' : 'Create Match'}
                    </button>
                  </div>
                </div>
              )}

              {/* Placement panel for non-bracket individual sports */}
              {isPlacementSport && (
                <PlacementPanel
                  key={selected.id}
                  tournamentId={selected.id}
                  onSaved={() => flash('Placements saved')}
                  onError={() => flash('Failed to save placements', false)}
                  onCleared={() => flash('Data cleared')}
                />
              )}

              {/* Darts groups panel */}
              {isDarts && (
                <DartsGroupsPanel
                  key={selected.id}
                  tournament={selected}
                  onMsg={(text, ok = true) => flash(text, ok)}
                  onGroupsChanged={() => loadMatches(selected)}
                />
              )}

              {/* Match tables */}
              {loading ? (
                <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="h-14 bg-surface-card rounded-xl animate-pulse" />)}</div>
              ) : byStage.length === 0 ? (
                <div className="text-center py-16 text-muted text-sm">
                  No matches yet — click &quot;Add Match&quot; to create one.
                </div>
              ) : (
                byStage.map(({ stage, matches: sm }) => (
                  <div key={stage}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{stage}</span>
                      <div className="flex-1 h-px bg-surface-border" />
                      <span className="text-[10px] text-muted">{sm.length} match{sm.length !== 1 ? 'es' : ''}</span>
                    </div>
                    <div className="bg-surface-card rounded-2xl border border-surface-border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-surface-border">
                            <th className="text-left px-4 py-2.5 text-[10px] font-bold text-muted uppercase tracking-wider">Team 1</th>
                            <th className="text-center px-3 py-2.5 text-[10px] font-bold text-muted uppercase tracking-wider w-12">S1</th>
                            <th className="text-center px-3 py-2.5 text-[10px] font-bold text-muted uppercase tracking-wider w-12">S2</th>
                            <th className="text-left px-4 py-2.5 text-[10px] font-bold text-muted uppercase tracking-wider">Team 2</th>
                            <th className="text-left px-3 py-2.5 text-[10px] font-bold text-muted uppercase tracking-wider w-28">Status</th>
                            <th className="text-right px-4 py-2.5 text-[10px] font-bold text-muted uppercase tracking-wider w-24">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sm.map((m) => (
                            <tr
                              key={m.id}
                              className={cn(
                                'border-b border-surface-border/40 last:border-0 transition-colors',
                                m.status === 'live' ? 'bg-live/5' : 'hover:bg-surface-hover',
                              )}
                            >
                              {editingId === m.id ? (
                                <>
                                  <td className="px-4 py-2 font-semibold text-foreground text-sm">{m.team1?.name ?? 'TBD'}</td>
                                  <td className="px-3 py-2">
                                    <input type="number" min={0} max={maxScore} className="input w-14 text-center text-sm"
                                      value={editForm.score1}
                                      onChange={(e) => setEditForm({ ...editForm, score1: clamp(e.target.value) })} />
                                  </td>
                                  <td className="px-3 py-2">
                                    <input type="number" min={0} max={maxScore} className="input w-14 text-center text-sm"
                                      value={editForm.score2}
                                      onChange={(e) => setEditForm({ ...editForm, score2: clamp(e.target.value) })} />
                                  </td>
                                  <td className="px-4 py-2 font-semibold text-foreground text-sm">{m.team2?.name ?? 'TBD'}</td>
                                  <td className="px-3 py-2">
                                    <select className="input text-xs py-1" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                  </td>
                                  <td className="px-4 py-2">
                                    <div className="flex items-center justify-end gap-1">
                                      <button onClick={() => saveEdit(m)} disabled={saving} title="Save"
                                        className="p-1.5 rounded-lg bg-win/10 text-win hover:bg-win/20 transition-colors disabled:opacity-50">
                                        <Check size={13} />
                                      </button>
                                      <button onClick={() => setEditingId(null)} title="Cancel"
                                        className="p-1.5 rounded-lg bg-surface-hover text-muted hover:text-foreground transition-colors">
                                        <X size={13} />
                                      </button>
                                    </div>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="px-4 py-3">
                                    <span className={cn('font-semibold text-sm', m.winner_id === m.team1?.id ? 'text-win' : m.winner_id && m.winner_id !== m.team1?.id ? 'text-muted line-through' : 'text-foreground')}>
                                      {m.team1
                                        ? (isDarts && m.team1.player_name ? `${m.team1.player_name} (${m.team1.name})` : m.team1.name)
                                        : <span className="text-muted italic font-normal">TBD</span>}
                                    </span>
                                  </td>
                                  <td className="px-3 py-3 text-center font-bold tabular-nums text-foreground">{m.score1 ?? '—'}</td>
                                  <td className="px-3 py-3 text-center font-bold tabular-nums text-foreground">{m.score2 ?? '—'}</td>
                                  <td className="px-4 py-3">
                                    <span className={cn('font-semibold text-sm', m.winner_id === m.team2?.id ? 'text-win' : m.winner_id && m.winner_id !== m.team2?.id ? 'text-muted line-through' : 'text-foreground')}>
                                      {m.team2
                                        ? (isDarts && m.team2.player_name ? `${m.team2.player_name} (${m.team2.name})` : m.team2.name)
                                        : <span className="text-muted italic font-normal">TBD</span>}
                                    </span>
                                  </td>
                                  <td className="px-3 py-3">
                                    <span className={cn('text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide',
                                      m.status === 'live'      && 'bg-live/15 text-live',
                                      m.status === 'completed' && 'bg-win/10 text-win',
                                      m.status === 'upcoming'  && 'bg-surface-hover text-muted',
                                    )}>
                                      {m.status === 'live' ? '● live' : m.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-1">
                                      <button onClick={() => startEdit(m)} title="Edit"
                                        className="p-1.5 rounded-lg text-muted hover:text-brand hover:bg-brand/10 transition-colors">
                                        <Pencil size={13} />
                                      </button>
                                      <button onClick={() => deleteMatch(m.id)} title="Delete"
                                        className="p-1.5 rounded-lg text-muted hover:text-loss hover:bg-loss/10 transition-colors">
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
