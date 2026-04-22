import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const UB_TZ = 'Asia/Ulaanbaatar';

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'TBD';
  return new Date(dateStr).toLocaleDateString('en-US', {
    timeZone: UB_TZ,
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  });
}

export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return 'TBD';
  return new Date(dateStr).toLocaleString('en-US', {
    timeZone: UB_TZ,
    month:  'short',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });
}

export function stageLabel(stage: string): string {
  const labels: Record<string, string> = {
    group:         'Group Stage',
    quarterfinal:  'Quarter-Final',
    semi:          'Semi-Final',
    bronze:        'Bronze Match',
    final:         'Grand Final',
  };
  return labels[stage] ?? stage;
}

export function sportIcon(icon: string): string {
  const map: Record<string, string> = {
    basketball:    '🏀',
    chess:         '♟️',
    cs2:           '🎯',
    dota2:         '🗡️',
    darts:         '🎯',
    'table-tennis':'🏓',
  };
  return map[icon] ?? '🏆';
}

export function genderLabel(gender: string): string {
  if (gender === 'male')   return 'Men\'s';
  if (gender === 'female') return 'Women\'s';
  return 'Mixed';
}

export function statusColor(status: string): string {
  if (status === 'live')      return 'text-live';
  if (status === 'completed') return 'text-gray-400';
  return 'text-gray-300';
}
