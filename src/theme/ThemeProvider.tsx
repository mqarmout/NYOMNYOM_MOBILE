import React, { createContext, useContext } from 'react';
import { PALETTES, type Palette, type PaletteName } from './palettes';
import { type FontName } from './type';

type ThemeCtxValue = Palette & {
  paletteName: PaletteName;
  fontName: FontName;
};

const ThemeCtx = createContext<ThemeCtxValue | null>(null);

export function ThemeProvider({
  palette,
  font,
  children,
}: {
  palette: PaletteName;
  font: FontName;
  children: React.ReactNode;
}) {
  const value: ThemeCtxValue = {
    ...PALETTES[palette],
    paletteName: palette,
    fontName: font,
  };
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme(): ThemeCtxValue {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
}
