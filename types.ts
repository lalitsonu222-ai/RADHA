
export enum ThemeType {
  SAFFRON = 'SAFFRON',
  DEEP_BLUE = 'DEEP_BLUE',
  FOREST_GREEN = 'FOREST_GREEN',
  CLASSIC_WHITE = 'CLASSIC_WHITE'
}

export enum CountingMode {
  MALA = 'MALA',
  UNLIMITED = 'UNLIMITED'
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
  card: string;
}

export interface JaapState {
  totalCount: number;
  currentMalaCount: number;
  malasCompleted: number;
}
