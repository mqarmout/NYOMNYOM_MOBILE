import type { Palette } from './palettes';

export const FONTS = {
  jetbrains: 'JetBrainsMono-Regular',
  plex: 'IBMPlexMono-Regular',
  fira: 'FiraCode-Regular',
} as const;

export type FontName = keyof typeof FONTS;

export function monoStyle(font: FontName = 'jetbrains') {
  return { fontFamily: FONTS[font] };
}

export function glow(p: Palette, intensity = 1) {
  if (intensity <= 0) return {};
  return {
    textShadowColor: p.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6 * intensity,
  };
}
