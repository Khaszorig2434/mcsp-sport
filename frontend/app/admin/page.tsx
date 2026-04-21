'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Tournament, Match } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Plus, Trash2, Pencil, Check, X, Shield } from 'lucide-react';

const STAGES = ['group', 'semi', 'bronze', 'final'] as const;
const STATUSES = ['upcoming', 'live', 'completed'] as const;

/* ── types ── */
interface EditState { score1: string; score2: string; status: string }
interface AddState  { stage: string; team1_id: string; team2_id: string; match_date: string; status: string; group_id: string }

const emptyAdd: AddState = { stage: 'group', team1_id: '', team2_id: '', match_date: '', status: 'upcoming', group_id: '' };

export default function AdminPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selected,    setSelected]    = useState<Tournament | null>(null);
  const [matches,     setMatches]     = useState<Match[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [editingId,   setEditingId]   = useState<number | null>(null);
  const [editForm,    setEditForm]    = useState<EditState>({ score1: '', score2: '', status: '' });
  const [showAdd,     setShowAdd]     = useState(false);
  const [addForm,     setAddForm]     = useState<AddState>(emptyAdd);
  const [saving,      setSaving]      = useState(false);
  const [msg,         setMsg]         = useState<{ text: string; ok: boolean } | null>(null);

  /* load tournaments */
  useEffect(() => {
    api.tournaments.list().then(setTournaments).catch(() => {});
  }, []);

  /* load matches for selected tournament */
  const loadMatches = useCallback(async (t: Tournament) => {
    setLoading(true);
    setEditingId(null);
    setShowAdd(false);
    try {
      const data = await api.matches.list({ tournamentId: t.id });
      setMatches(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectTournament = (t: Tournament) => {
    setSelected(t);
    loadMatches(t);
  };

  const flash = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  };

  /* ── Edit ── */
  const startEdit = (m: Match) => {
    setEditingId(m.id);
    setEditForm({ score1: m.score1 != null ? String(m.score1) : '', score2: m.score2 != null ? String(m.score2) : '', status: m.status });
  };

  const saveEdit = async (m: Match) => {
    setSaving(true);
    try {
      await api.matches.update(m.id, {
        score1: editForm.score1 !== '' ? Number(editForm.score1) : undefined,
        score2: editForm.score2 !== '' ? Number(editForm.score2) : undefined,
        status: editForm.status,
      });
      flash('Match updated');
      setEditingId(null);
      loadMatches(selected!);
    } catch { flash('Failed to update', false); }
    finally   { setSaving(false); }
  };

  /* ── Delete ── */
  const deleteMatch = async (id: number) => {
    if (!confirm('Delete this match?')) return;
    try {
      await api.matches.delete(id);
      flash('Match deleted');
      loadMatches(selected!);
    } catch { flash('Failed to delete', false); }
  };

  /* ── Add ── */
  const submitAdd = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.matches.create({
        tournament_id: selected.id,
        stage:     addForm.stage,
        team1_id:  addForm.team1_id  ? Number(addForm.team1_id)  : null,
        team2_id:  addForm.team2_id  ? Number(addForm.team2_id)  : null,
        group_id:  addForm.group_id  ? Number(addForm.group_id)  : null,
        match_date: addForm.match_date || undefined,
        status:    addForm.status,
      });
      flash('Match created');
      setShowAdd(false);
      setAddForm(emptyAdd);
      loadMatches(selected);
    } catch { flash('Failed to create', false); }
    finally   { setSaving(false); }
  };

  /* ── Group matches by stage ── */
  const byStage = STAGES.map((s) => ({ stage: s, matches: matches.filter((m) => m.stage === s) })).filter((g) => g.matches.length > 0);

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-surface-card border-b border-surface-border px-6 py-4 flex items-center gap-3">
        <Shield size={20} className="text-brand" />
        <h1 className="text-lg font-bold text-foreground">Admin Panel</h1>
        <span className="text-xs text-muted ml-2">Match Management</span>
        {msg && (
          <span className={cn('ml-auto text-xs font-medium px-3 py-1 rounded-full', msg.ok ? 'bg-win/20 text-win' : 'bg-loss/20 text-loss')}>
            {msg.text}
          </span>
        )}
      </div>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar — tournament list */}
        <aside className="w-64 shrink-0 border-r border-surface-border bg-surface-card overflow-y-auto">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider px-4 py-3 border-b border-surface-border">
            Tournaments
          </p>
          {tournaments.map((t) => (
            <button
              key={t.id}
              onClick={() => selectTournament(t)}
              className={cn(
                'w-full text-left px-4 py-3 border-b border-surface-border/50 transition-colors',
                selected?.id === t.id
                  ? 'bg-brand/10 border-l-2 border-l-brand text-brand font-semibold'
                  : 'text-foreground hover:bg-surface-hover',
              )}
            >
              <p className="text-sm truncate">{t.name}</p>
              <p className="text-xs text-muted mt-0.5">{t.sport_name} · {t.status}</p>
            </button>
          ))}
        </aside>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selected ? (
            <div className="flex items-center justify-center h-full text-muted text-sm">
              Select a tournament from the sidebar
            </div>
          ) : (
            <div className="space-y-6">
              {/* Toolbar */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground">{selected.name}</h2>
                  <p className="text-xs text-muted">{matches.length} matches</p>
                </div>
                <button
                  onClick={() => { setShowAdd(!showAdd); setEditingId(null); }}
                  className="flex items-center gap-2 bg-brand text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors"
                >
                  <Plus size={15} />
                  Add Match
                </button>
              </div>

              {/* Add match form */}
              {showAdd && (
                <div className="bg-surface-card border border-brand/30 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-foreground">New Match</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="label">Stage</label>
                      <select className="input" value={addForm.stage} onChange={(e) => setAddForm({ ...addForm, stage: e.target.value })}>
                        {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Status</label>
                      <select className="input" value={addForm.status} onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Group ID (optional)</label>
                      <input className="input" type="number" placeholder="e.g. 1" value={addForm.group_id} onChange={(e) => setAddForm({ ...addForm, group_id: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">Team 1 ID</label>
                      <input className="input" type="number" placeholder="Team ID" value={addForm.team1_id} onChange={(e) => setAddForm({ ...addForm, team1_id: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">Team 2 ID</label>
                      <input className="input" type="number" placeholder="Team ID" value={addForm.team2_id} onChange={(e) => setAddForm({ ...addForm, team2_id: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">Match Date</label>
                      <input className="input" type="datetime-local" value={addForm.match_date} onChange={(e) => setAddForm({ ...addForm, match_date: e.target.value })} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={submitAdd} disabled={saving} className="bg-brand text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50">
                      {saving ? 'Saving…' : 'Create Match'}
                    </button>
                    <button onClick={() => setShowAdd(false)} className="text-sm text-muted hover:text-foreground px-4 py-2">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Match tables by stage */}
              {loading ? (
                <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="h-14 bg-surface-card rounded-lg animate-pulse" />)}</div>
              ) : byStage.length === 0 ? (
                <p className="text-muted text-sm">No matches yet. Click "Add Match" to create one.</p>
              ) : (
                byStage.map(({ stage, matches: sm }) => (
                  <div key={stage}>
                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">{stage}</h3>
                    <div className="bg-surface-card rounded-xl border border-surface-border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-surface-border text-xs text-muted">
                            <th className="text-left px-4 py-3">Team 1</th>
                            <th className="text-center px-3 py-3 w-10">S1</th>
                            <th className="text-center px-3 py-3 w-10">S2</th>
                            <th className="text-left px-4 py-3">Team 2</th>
                            <th className="text-left px-3 py-3 w-28">Status</th>
                            <th className="text-right px-4 py-3 w-28">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sm.map((m) => (
                            <tr key={m.id} className="border-b border-surface-border/50 last:border-0 hover:bg-surface-hover transition-colors">
                              {editingId === m.id ? (
                                <>
                                  <td className="px-4 py-2 text-foreground font-medium">{m.team1?.name ?? 'TBD'}</td>
                                  <td className="px-3 py-2">
                                    <input type="number" className="input w-16 text-center" value={editForm.score1} onChange={(e) => setEditForm({ ...editForm, score1: e.target.value })} />
                                  </td>
                                  <td className="px-3 py-2">
                                    <input type="number" className="input w-16 text-center" value={editForm.score2} onChange={(e) => setEditForm({ ...editForm, score2: e.target.value })} />
                                  </td>
                                  <td className="px-4 py-2 text-foreground font-medium">{m.team2?.name ?? 'TBD'}</td>
                                  <td className="px-3 py-2">
                                    <select className="input" value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                  </td>
                                  <td className="px-4 py-2">
                                    <div className="flex items-center justify-end gap-1">
                                      <button onClick={() => saveEdit(m)} disabled={saving} className="p-1.5 rounded-lg bg-win/10 text-win hover:bg-win/20 transition-colors">
                                        <Check size={14} />
                                      </button>
                                      <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg bg-surface-hover text-muted hover:text-foreground transition-colors">
                                        <X size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="px-4 py-3 text-foreground font-medium">{m.team1?.name ?? <span className="text-muted italic">TBD</span>}</td>
                                  <td className="px-3 py-3 text-center font-bold text-foreground tabular-nums">{m.score1 ?? '—'}</td>
                                  <td className="px-3 py-3 text-center font-bold text-foreground tabular-nums">{m.score2 ?? '—'}</td>
                                  <td className="px-4 py-3 text-foreground font-medium">{m.team2?.name ?? <span className="text-muted italic">TBD</span>}</td>
                                  <td className="px-3 py-3">
                                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                                      m.status === 'live'      && 'bg-live/20 text-live',
                                      m.status === 'completed' && 'bg-win/10 text-win',
                                      m.status === 'upcoming'  && 'bg-brand/10 text-brand',
                                    )}>
                                      {m.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-1">
                                      <button onClick={() => startEdit(m)} className="p-1.5 rounded-lg text-muted hover:text-brand hover:bg-brand/10 transition-colors">
                                        <Pencil size={14} />
                                      </button>
                                      <button onClick={() => deleteMatch(m.id)} className="p-1.5 rounded-lg text-muted hover:text-loss hover:bg-loss/10 transition-colors">
                                        <Trash2 size={14} />
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
