export type AppTheme = 'light' | 'dark';

export interface AppPalette {
  accent: string;
  accentBright: string;
  secondary: string;
  border: string;
  borderDim: string;
  text: string;
  inverseText: string;
  textDim: string;
  success: string;
  error: string;
  info: string;
}

const themePalettes: Record<AppTheme, AppPalette> = {
  light: {
    accent: '#3366ff',
    accentBright: '#6598ff',
    secondary: '#ff9933',
    border: '#999999',
    borderDim: '#afafaf',
    text: '#000000',
    inverseText: '#ffffff',
    textDim: '#666666',
    success: '#006699',
    error: '#cc0000',
    info: '#3366ff',
  },
  dark: {
    accent: '#99ccff',
    accentBright: '#b7e0ff',
    secondary: '#ff9933',
    border: '#888888',
    borderDim: '#505050',
    text: '#ffffff',
    inverseText: '#000000',
    textDim: '#999999',
    success: '#3399ff',
    error: '#ff6666',
    info: '#99ccff',
  },
};

export const palette: AppPalette = { ...themePalettes.dark };

export const applyTheme = (theme: AppTheme): void => {
  Object.assign(palette, themePalettes[theme]);
};

export const toggleTheme = (theme: AppTheme): AppTheme =>
  theme === 'dark' ? 'light' : 'dark';

export const chars = {
  treeVertical: '│',
  treeBranch: '├',
  treeLastBranch: '└',
  treeHorizontal: '─',
  folderOpen: 'v',
  folderClosed: '>',
  file: '·',
} as const;
