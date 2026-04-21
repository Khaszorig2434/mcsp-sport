import Image from 'next/image';

const ICON_MAP: Record<string, string> = {
  basketball:     '/tournaments/basketball.png',
  chess:          '/tournaments/chess.png',
  cs2:            '/tournaments/cs.png',
  dota2:          '/tournaments/dota.png',
  darts:          '/tournaments/dart.png',
  'table-tennis': '/tournaments/tennis.png',
};

interface Props {
  icon:      string;
  size?:     number;
  className?: string;
}

export default function SportIcon({ icon, size = 32, className }: Props) {
  const src = ICON_MAP[icon];
  if (!src) return <span style={{ fontSize: size * 0.75 }}>🏆</span>;
  return (
    <Image
      src={src}
      alt={icon}
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
}
