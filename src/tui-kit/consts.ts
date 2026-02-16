export type AppTheme = 'light' | 'dark';
export type TerminalColorCapability =
  | 'none'
  | 'basic16'
  | 'ansi256'
  | 'truecolor';
export type ColorMode = 'auto' | 'ansi' | 'mono';
type AppliedColorMode = 'truecolor' | 'ansi' | 'mono';

export interface AppPalette {
  colorMode: AppliedColorMode;
  terminalCapability: TerminalColorCapability;
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

type ThemeProfile = Omit<AppPalette, 'colorMode' | 'terminalCapability'>;

const truecolorProfiles: Record<AppTheme, ThemeProfile> = {
  dark: {
    accent: '#00d75f',
    accentBright: '#00ff87',
    secondary: '#5f87ff',
    border: '#ffffff',
    borderDim: '#ffffff',
    text: '#ffffff',
    inverseText: '#000000',
    textDim: '#ffffff',
    success: '#00d75f',
    error: '#ff5f5f',
    info: '#5f87ff',
  },
  light: {
    accent: '#008700',
    accentBright: '#00af00',
    secondary: '#005faf',
    border: '#000000',
    borderDim: '#000000',
    text: '#000000',
    inverseText: '#ffffff',
    textDim: '#000000',
    success: '#008700',
    error: '#af0000',
    info: '#005faf',
  },
};

const ansiProfiles: Record<AppTheme, ThemeProfile> = {
  dark: {
    accent: 'greenBright',
    accentBright: 'greenBright',
    secondary: 'blueBright',
    border: 'whiteBright',
    borderDim: 'whiteBright',
    text: 'whiteBright',
    inverseText: 'black',
    textDim: 'whiteBright',
    success: 'greenBright',
    error: 'redBright',
    info: 'blueBright',
  },
  light: {
    accent: 'green',
    accentBright: 'green',
    secondary: 'blue',
    border: 'black',
    borderDim: 'black',
    text: 'black',
    inverseText: 'white',
    textDim: 'black',
    success: 'green',
    error: 'red',
    info: 'blue',
  },
};

const monoProfiles: Record<AppTheme, ThemeProfile> = {
  dark: {
    accent: 'whiteBright',
    accentBright: 'whiteBright',
    secondary: 'whiteBright',
    border: 'whiteBright',
    borderDim: 'whiteBright',
    text: 'whiteBright',
    inverseText: 'black',
    textDim: 'whiteBright',
    success: 'whiteBright',
    error: 'whiteBright',
    info: 'whiteBright',
  },
  light: {
    accent: 'black',
    accentBright: 'black',
    secondary: 'black',
    border: 'black',
    borderDim: 'black',
    text: 'black',
    inverseText: 'white',
    textDim: 'black',
    success: 'black',
    error: 'black',
    info: 'black',
  },
};

const parseColorMode = (value: string | undefined): ColorMode => {
  const normalized = value?.trim().toLowerCase();
  if (normalized === 'ansi' || normalized === 'mono' || normalized === 'auto') {
    return normalized;
  }
  return 'auto';
};

export const detectTerminalColorCapability = (): TerminalColorCapability => {
  if (process.env.NO_COLOR) {
    return 'none';
  }

  if (!process.stdout.isTTY) {
    return 'none';
  }

  const depth = process.stdout.getColorDepth?.() ?? 1;
  if (depth >= 24) {
    return 'truecolor';
  }
  if (depth >= 8) {
    return 'ansi256';
  }
  if (depth >= 4) {
    return 'basic16';
  }
  return 'none';
};

export const resolveColorMode = (): ColorMode =>
  parseColorMode(process.env.TT_HEALTH_COLOR_MODE);

const resolveAppliedColorMode = (
  colorMode: ColorMode,
  capability: TerminalColorCapability,
): AppliedColorMode => {
  if (colorMode === 'mono') {
    return 'mono';
  }
  if (colorMode === 'ansi') {
    return 'ansi';
  }

  if (capability === 'none') {
    return 'mono';
  }
  if (capability === 'truecolor') {
    return 'truecolor';
  }
  return 'ansi';
};

const getProfile = (
  theme: AppTheme,
  appliedMode: AppliedColorMode,
): ThemeProfile => {
  if (appliedMode === 'mono') {
    return monoProfiles[theme];
  }
  if (appliedMode === 'ansi') {
    return ansiProfiles[theme];
  }
  return truecolorProfiles[theme];
};

const initialTerminalCapability = detectTerminalColorCapability();
const initialAppliedColorMode = resolveAppliedColorMode(
  resolveColorMode(),
  initialTerminalCapability,
);

export const palette: AppPalette = {
  colorMode: initialAppliedColorMode,
  terminalCapability: initialTerminalCapability,
  ...getProfile('dark', initialAppliedColorMode),
};

export const applyTheme = (theme: AppTheme): void => {
  const terminalCapability = detectTerminalColorCapability();
  const colorMode = resolveColorMode();
  const appliedMode = resolveAppliedColorMode(colorMode, terminalCapability);
  Object.assign(palette, {
    colorMode: appliedMode,
    terminalCapability,
    ...getProfile(theme, appliedMode),
  });
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
