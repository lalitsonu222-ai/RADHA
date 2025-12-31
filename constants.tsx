
import { ThemeType, ThemeColors } from './types';

export const THEMES: Record<ThemeType, ThemeColors> = {
  [ThemeType.SAFFRON]: {
    primary: '#FF9933',
    secondary: '#FFCC80',
    background: '#FFF3E0',
    text: '#5D4037',
    accent: '#E64A19',
    card: '#FFFFFF'
  },
  [ThemeType.DEEP_BLUE]: {
    primary: '#1A237E',
    secondary: '#3949AB',
    background: '#E8EAF6',
    text: '#1A237E',
    accent: '#FFD600',
    card: '#FFFFFF'
  },
  [ThemeType.FOREST_GREEN]: {
    primary: '#1B5E20',
    secondary: '#43A047',
    background: '#E8F5E9',
    text: '#1B5E20',
    accent: '#FFB300',
    card: '#FFFFFF'
  },
  [ThemeType.CLASSIC_WHITE]: {
    primary: '#455A64',
    secondary: '#B0BEC5',
    background: '#F5F7F8',
    text: '#263238',
    accent: '#CFD8DC',
    card: '#FFFFFF'
  }
};

export const MALA_TARGET = 108;
export const BELL_SOUND_URL = 'https://www.soundjay.com/misc/sounds/bell-ringing-01.mp3';
