export type Palette = {
  name: string;
  bg: string; surface: string; surface2: string; surface3: string;
  border: string; borderHi: string;
  accent: string; accentHot: string; accentDim: string; accentFaint: string;
  cream: string; muted: string; faint: string;
};

export type PaletteName = 'green' | 'amber' | 'cyan';

export const PALETTES: Record<PaletteName, Palette> = {
  green: {
    name: 'P1·GREEN',
    bg: '#020a06', surface: '#041208', surface2: '#08200e', surface3: '#0c2818',
    border: '#0e3a1a', borderHi: '#1c5a2c',
    accent: '#3aff7a', accentHot: '#9affb8', accentDim: '#1ea050', accentFaint: '#0e5a2a',
    cream: '#cfffd9', muted: '#3c8a52', faint: '#1e4a2a',
  },
  amber: {
    name: 'P3·AMBER',
    bg: '#0a0604', surface: '#160d04', surface2: '#221608', surface3: '#2e1f0e',
    border: '#3a2812', borderHi: '#5a4020',
    accent: '#ffa83c', accentHot: '#ffc97a', accentDim: '#c47b1c', accentFaint: '#7a4f14',
    cream: '#ffeacb', muted: '#7e6b48', faint: '#4a3f2a',
  },
  cyan: {
    name: 'P2·CYAN',
    bg: '#020c10', surface: '#062028', surface2: '#0a3038', surface3: '#104048',
    border: '#0e4858', borderHi: '#1c6878',
    accent: '#4ce4e4', accentHot: '#8af0f0', accentDim: '#28a8b8', accentFaint: '#0e5868',
    cream: '#cff7fa', muted: '#5a9ca8', faint: '#1c5868',
  },
};

export const STATUS = { red: '#ff6a5a', amber: '#ffc55a', blue: '#7ab5ff' } as const;
