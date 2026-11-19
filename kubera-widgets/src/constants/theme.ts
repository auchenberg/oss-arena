export interface ThemeColors {
  background: string;
  card: string;
  text: string;
  dim: string;
  border: string;
  accent: string;
  positive: string;
  negative: string;
  widgetPreviewBg: string;
}

export const Palette: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    background: '#F4F5F7',
    card: '#FFFFFF',
    text: '#0B0E1A',
    dim: '#6B7280',
    border: '#E5E7EB',
    accent: '#0B0E1A',
    positive: '#15803D',
    negative: '#B91C1C',
    widgetPreviewBg: '#0B0E1A',
  },
  dark: {
    background: '#0A0C12',
    card: '#151823',
    text: '#F5F7FA',
    dim: '#8A93A6',
    border: '#232838',
    accent: '#F5F7FA',
    positive: '#4ADE80',
    negative: '#F87171',
    widgetPreviewBg: '#151823',
  },
};
