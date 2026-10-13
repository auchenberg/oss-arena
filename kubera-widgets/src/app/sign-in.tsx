import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { useKubera } from '@/lib/store';

export default function SignInScreen() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const { signIn } = useKubera();
  const [apiKey, setApiKey] = useState('');
  const [secret, setSecret] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = apiKey.trim().length > 0 && secret.trim().length > 0;

  async function handleSignIn() {
    setBusy(true);
    setError(null);
    try {
      await signIn({ apiKey: apiKey.trim(), secret: secret.trim() });
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not connect to Kubera.');
    } finally {
      setBusy(false);
    }
  }

  const inputStyle = [
    styles.input,
    { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled">
        <Text style={[styles.logo, { color: colors.text }]}>Kubera Widgets</Text>
        <Text style={[styles.subtitle, { color: colors.dim }]}>
          Your net worth, on your Home Screen.
        </Text>

        <Card style={styles.form}>
          <Text style={[styles.label, { color: colors.dim }]}>API KEY</Text>
          <TextInput
            style={inputStyle}
            value={apiKey}
            onChangeText={setApiKey}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Paste your Kubera API key"
            placeholderTextColor={colors.dim}
            testID="api-key-input"
          />
          <Text style={[styles.label, { color: colors.dim, marginTop: 16 }]}>API SECRET</Text>
          <TextInput
            style={inputStyle}
            value={secret}
            onChangeText={setSecret}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            placeholder="Paste your Kubera API secret"
            placeholderTextColor={colors.dim}
            testID="api-secret-input"
          />

          {error ? <Text style={[styles.error, { color: colors.negative }]}>{error}</Text> : null}

          <View style={styles.submit}>
            <Button
              title="Connect to Kubera"
              onPress={handleSignIn}
              loading={busy}
              disabled={!canSubmit}
            />
          </View>
        </Card>

        <Card style={styles.help}>
          <Text style={[styles.helpTitle, { color: colors.text }]}>Where do I find these?</Text>
          <Text style={[styles.helpBody, { color: colors.dim }]}>
            Open Kubera on the web, go to Settings → API, and create an API key. Copy the key and
            secret here. Keys are stored only on this device and are used to read your portfolio —
            nothing is ever written to your Kubera account.
          </Text>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { paddingHorizontal: 20 },
  logo: { fontSize: 32, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { fontSize: 16, marginBottom: 32, marginTop: 6 },
  form: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', letterSpacing: 1, marginBottom: 6 },
  input: {
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  error: { fontSize: 14, marginTop: 12 },
  submit: { marginTop: 20 },
  help: {},
  helpTitle: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  helpBody: { fontSize: 14, lineHeight: 20 },
});
