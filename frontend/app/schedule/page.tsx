import { api } from '@/lib/api';
import type { Match } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import SportIcon from '@/components/SportIcon';

const SPORT_ICON_KEY: Record<string, string> = {
  'Basketball':   'basketball',
  'Table Tennis': 'table-tennis',
  'Chess':        'chess',
  'Darts':        'darts',
  'CS2':          'cs2',
  'Dota 2':       'dota2',
};

const STAGE_LABEL: Record<string, string> = {
  group:  'Group Stage',
  semi:   'Semifinal',
  bronze: 'Bronze Match',
  final:  'Final',
};

const UB_TZ = 'Asia/Ulaanbaatar';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { timeZone: UB_TZ, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { timeZone: UB_TZ, hour: '2-digit', minute: '2-digit' });
}

function groupByDate(matches: Match[]): { date: string; label: string; matches: Match[] }[] {
  const map: Record<string, Match[]> = {};
  for (const m of matches) {
    const day = m.match_date ? new Date(m.match_date).toLocaleDateString('en-US', { timeZone: UB_TZ }) : 'TBD';
    if (!map[day]) map[day] = [];
    map[day].push(m);
  }
  return Object.entries(map).map(([day, matches]) => ({
    date:    day,
    label:   day === 'TBD' ? 'Date TBD' : formatDate(matches[0].match_date!),
    matches,
  }));
}

function ubDateStr(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { timeZone: UB_TZ });
}

function isToday(iso: string) {
  return ubDateStr(iso) === new Date().toLocaleDateString('en-US', { timeZone: UB_TZ });
}

function isTomorrow(iso: string) {
  const tom = new Date();
  tom.setDate(tom.getDate() + 1);
  return ubDateStr(iso) === tom.toLocaleDateString('en-US', { timeZone: UB_TZ });
}

function dateChip(iso: string | null) {
  if (!iso) return null;
  if (isToday(iso))    return { label: 'Today',    cls: 'bg-live/15 text-live border border-live/30' };
  if (isTomorrow(iso)) return { label: 'Tomorrow',  cls: 'bg-brand/15 text-brand border border-brand/30' };
  return null;
}

export default async function SchedulePage() {
  let matches: Match[] = [];
  try {
    matches = await api.schedule.get();
  } catch { /* render empty state */ }

  const groups = groupByDate(matches);

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-surface-card border-b border-surface-border">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-1">
            <Calendar size={20} className="text-brand" />
            <h1 className="font-display text-2xl font-black text-foreground">Upcoming Schedule</h1>
          </div>
          <p className="text-sm text-muted ml-8">
            {matches.length > 0
              ? `${matches.length} upcoming match${matches.length !== 1 ? 'es' : ''} across all tournaments`
              : 'No upcoming matches scheduled'}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted">
            <Calendar size={40} className="opacity-20" />
            <p className="text-sm">No upcoming matches — check back soon.</p>
          </div>
        ) : (
          groups.map(({ date, label, matches: dayMatches }) => {
            const chip = dayMatches[0]?.match_date ? dateChip(dayMatches[0].match_date) : null;
            return (
              <div key={date}>
                {/* Date header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-foreground">{label}</h2>
                    {chip && (
                      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide', chip.cls)}>
                        {chip.label}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 h-px bg-surface-border" />
                  <span className="text-[10px] text-muted">{dayMatches.length} match{dayMatches.length !== 1 ? 'es' : ''}</span>
                </div>

                {/* Match cards */}
                <div className="space-y-2">
                  {dayMatches.map((m) => (
                    <div key={m.id} className="bg-surface-card border border-surface-border rounded-2xl px-5 py-4 hover:border-brand/40 transition-colors">
                      {/* Top row: tournament + stage + time */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <SportIcon icon={SPORT_ICON_KEY[m.sport_name ?? ''] ?? ''} size={18} />
                          <span className="text-xs font-semibold text-muted">{m.tournament_name}</span>
                          <ChevronRight size={10} className="text-muted/50" />
                          <span className="text-[10px] font-bold text-brand uppercase tracking-wide">
                            {STAGE_LABEL[m.stage] ?? m.stage}
                          </span>
                        </div>
                        {m.match_date && (
                          <div className="flex items-center gap-1 text-xs text-muted">
                            <Clock size={11} />
                            {formatTime(m.match_date)}
                          </div>
                        )}
                      </div>

                      {/* Teams */}
                      <div className="flex items-center gap-4">
                        <div className="flex-1 text-right">
                          <p className={cn('font-bold text-base', m.team1 ? 'text-foreground' : 'text-muted italic')}>
                            {m.team1?.name ?? 'TBD'}
                          </p>
                          {m.team1?.player_name && (
                            <p className="text-[10px] text-muted mt-0.5">{m.team1.player_name}</p>
                          )}
                        </div>
                        <div className="shrink-0 bg-surface-hover rounded-xl px-3 py-1.5 text-center">
                          <span className="text-xs font-black text-muted uppercase tracking-widest">VS</span>
                        </div>
                        <div className="flex-1">
                          <p className={cn('font-bold text-base', m.team2 ? 'text-foreground' : 'text-muted italic')}>
                            {m.team2?.name ?? 'TBD'}
                          </p>
                          {m.team2?.player_name && (
                            <p className="text-[10px] text-muted mt-0.5">{m.team2.player_name}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
