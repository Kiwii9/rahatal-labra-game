// ============================
// AvatarIcons: Minimalist vector icons for player avatar selection
// ============================
import type { SVGProps } from 'react';

const stroke = 'currentColor';
const sw = 1.6;

export const CrownIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" {...p}>
    <path d="M3 8l3 4 3-6 3 6 3-6 3 6 3-4-2 11H5L3 8z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
    <circle cx="12" cy="6" r="1.2" fill={stroke} />
  </svg>
);
export const FalconIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" {...p}>
    <path d="M4 16c4-1 6-3 8-7 2 4 4 6 8 7-3 2-6 3-8 3s-5-1-8-3z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
    <path d="M11 9l1-1 1 1" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
  </svg>
);
export const StarIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" {...p}>
    <path d="M12 3l2.6 5.5 6 .8-4.4 4.2 1.1 6L12 16.8 6.7 19.5l1.1-6L3.4 9.3l6-.8L12 3z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
  </svg>
);
export const ShieldIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" {...p}>
    <path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-3z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
    <path d="M9 12l2 2 4-4" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
  </svg>
);
export const SwordIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" {...p}>
    <path d="M14 4h6v6L8 22l-4 1 1-4L17 7" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
    <path d="M5 15l4 4" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
  </svg>
);
export const LionIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" {...p}>
    <circle cx="12" cy="12" r="6" stroke={stroke} strokeWidth={sw} />
    <path d="M6 6l-2-2M18 6l2-2M6 18l-2 2M18 18l2 2" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    <circle cx="10" cy="11" r="0.8" fill={stroke} />
    <circle cx="14" cy="11" r="0.8" fill={stroke} />
    <path d="M10 14c1 1 3 1 4 0" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
  </svg>
);
export const MoonIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" {...p}>
    <path d="M20 14a8 8 0 11-9-9 6 6 0 009 9z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
  </svg>
);
export const FlameIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" {...p}>
    <path d="M12 3c1 4 5 5 5 10a5 5 0 11-10 0c0-2 1-3 2-4-1 3 1 4 1 4s0-3 2-5c0-2 0-4 0-5z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
  </svg>
);

export type IconKey = 'crown' | 'falcon' | 'star' | 'shield' | 'sword' | 'lion' | 'moon' | 'flame';

export const AVATAR_ICONS: { key: IconKey; Comp: (p: SVGProps<SVGSVGElement>) => JSX.Element; label: string }[] = [
  { key: 'crown', Comp: CrownIcon, label: 'تاج' },
  { key: 'falcon', Comp: FalconIcon, label: 'صقر' },
  { key: 'star', Comp: StarIcon, label: 'نجمة' },
  { key: 'shield', Comp: ShieldIcon, label: 'درع' },
  { key: 'sword', Comp: SwordIcon, label: 'سيف' },
  { key: 'lion', Comp: LionIcon, label: 'أسد' },
  { key: 'moon', Comp: MoonIcon, label: 'هلال' },
  { key: 'flame', Comp: FlameIcon, label: 'لهب' },
];

export const getIconByKey = (key: string) => AVATAR_ICONS.find(i => i.key === key);
