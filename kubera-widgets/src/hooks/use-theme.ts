import { useColorScheme } from 'react-native';

import { Palette, type ThemeColors } from '@/constants/theme';

export function useTheme(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? Palette.dark : Palette.light;
}
