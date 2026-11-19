import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const colors = useTheme();
  return (
    <View
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
}

export function SectionTitle({ children }: { children: string }) {
  const colors = useTheme();
  return <Text style={[styles.sectionTitle, { color: colors.dim }]}>{children.toUpperCase()}</Text>;
}

export function Button({
  title,
  onPress,
  loading,
  variant = 'primary',
  disabled,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'destructive' | 'secondary';
  disabled?: boolean;
}) {
  const colors = useTheme();
  const background =
    variant === 'primary' ? colors.accent : variant === 'destructive' ? colors.negative : colors.card;
  const label =
    variant === 'primary' ? colors.background : variant === 'destructive' ? '#FFFFFF' : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: background, borderColor: colors.border, opacity: pressed || disabled ? 0.6 : 1 },
        variant === 'secondary' && styles.buttonOutline,
      ]}>
      {loading ? (
        <ActivityIndicator color={label} />
      ) : (
        <Text style={[styles.buttonLabel, { color: label }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 20,
  },
  button: {
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 16,
  },
  buttonOutline: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
