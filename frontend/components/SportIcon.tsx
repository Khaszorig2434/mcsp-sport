import Image from 'next/image';

const ICON_MAP: Record<string, string> = {
  basketball:     '/tournaments/basketball.png',
  chess:          '/tournaments/chess.png',
  cs2:            '/tournaments/cs.png',
  dota2:          '/tournaments/dota.png',
  darts:          '/tournaments/dart.png',
  'table-tennis': '/tournaments/tennis.png',
};

// Dark-colored icons that need inversion to be visible on dark backgrounds
const INVERT_IN_DARK = new Set(['chess', 'cs2', 'table-tennis']);

interface Props {
  icon:      string;
  size?:     number;
  className?: string;
}

export default function SportIcon({ icon, size = 32, className }: Props) {
  const src = ICON_MAP[icon];
  if (!src) return <span style={{ fontSize: size * 0.75 }}>🏆</span>;
  const invertClass = INVERT_IN_DARK.has(icon) ? 'dark:invert' : '';
  return (
    <Image
      src={src}
      alt={icon}
      width={size}
      height={size}
      className={[invertClass, className].filter(Boolean).join(' ')}
      style={{ objectFit: 'contain' }}
    />
  );
}
