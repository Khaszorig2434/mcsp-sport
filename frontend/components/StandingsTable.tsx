import { cn } from '@/lib/utils';
import type { StandingsGroup } from '@/lib/types';

interface Props {
  groups: StandingsGroup[];
}

export default function StandingsTable({ groups }: Props) {
  if (!groups.length) {
    return <p className="text-gray-500 text-sm py-4">No standings available yet.</p>;
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <div key={group.group_id}>
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">
            Group {group.group_name}
          </h3>

          <div className="overflow-x-auto rounded-lg border border-surface-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface border-b border-surface-border text-gray-500 text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3 w-8">#</th>
                  <th className="text-left px-4 py-3">Team</th>
                  <th className="text-center px-3 py-3">MP</th>
                  <th className="text-center px-3 py-3">W</th>
                  <th className="text-center px-3 py-3">L</th>
                  <th className="text-center px-3 py-3">Pts</th>
                  <th className="text-center px-3 py-3">+/-</th>
                </tr>
              </thead>
              <tbody>
                {group.teams.map((team, idx) => {
                  const isTop2 = team.rank <= 2;
                  return (
                    <tr
                      key={team.team_id}
                      className={cn(
                        'border-b border-surface-border/50 last:border-0 transition-colors',
                        'hover:bg-surface-hover',
                        isTop2 ? 'bg-surface-card' : 'bg-surface-card/50',
                      )}
                    >
                      {/* Rank */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {/* Playoff advancement indicator */}
                          <div className={cn(
                            'w-1 h-8 rounded-full',
                            isTop2 ? 'bg-brand' : 'bg-transparent',
                          )} />
                          <span className={cn(
                            'font-semibold tabular-nums',
                            isTop2 ? 'text-foreground' : 'text-muted',
                          )}>
                            {team.rank}
                          </span>
                        </div>
                      </td>

                      {/* Team name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'font-medium',
                            isTop2 ? 'text-foreground' : 'text-muted',
                          )}>
                            {team.player_name ? `${team.player_name}` : team.team_name}
                          </span>
                          {team.player_name && (
                            <span className="text-xs text-gray-500">({team.team_name})</span>
                          )}
                          {!team.player_name && team.short_name && (
                            <span className="text-xs text-gray-600 hidden sm:inline">
                              ({team.short_name})
                            </span>
                          )}
                          {/* Advances badge */}
                          {isTop2 && team.rank === 1 && (
                            <span className="text-xs bg-win/20 text-win px-1.5 py-0.5 rounded hidden lg:inline">
                              Advances
                            </span>
                          )}
                          {isTop2 && team.rank === 2 && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded hidden lg:inline">
                              Advances
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stats */}
                      <td className="text-center px-3 py-3 tabular-nums text-gray-400">
                        {team.matches_played}
                      </td>
                      <td className="text-center px-3 py-3 tabular-nums font-semibold text-win">
                        {team.wins}
                      </td>
                      <td className="text-center px-3 py-3 tabular-nums font-semibold text-loss">
                        {team.losses}
                      </td>
                      <td className="text-center px-3 py-3 tabular-nums font-bold text-foreground">
                        {team.points}
                      </td>
                      <td className={cn(
                        'text-center px-3 py-3 tabular-nums font-medium',
                        team.point_difference > 0  && 'text-win',
                        team.point_difference < 0  && 'text-loss',
                        team.point_difference === 0 && 'text-gray-500',
                      )}>
                        {team.point_difference > 0 ? '+' : ''}{team.point_difference}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-600 mt-1.5">
            <span className="inline-block w-1 h-3 bg-brand rounded-full mr-1.5 align-middle" />
            Top 2 teams advance to playoffs
          </p>
        </div>
      ))}
    </div>
  );
}
