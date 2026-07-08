import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, SectionTitle } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { useKubera } from '@/lib/store';

function maskKey(key: string): string {
  if (key.length <= 8) return '••••';
  return `${key.slice(0, 4)}••••${key.slice(-4)}`;
}

export default function SettingsScreen() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const { credentials, portfolios, selectedPortfolioId, selectPortfolio, signOut } = useKubera();

  function confirmSignOut() {
    Alert.alert(
      'Disconnect Kubera?',
      'Your API key will be removed from this device and widgets will stop updating.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            signOut();
            router.replace('/sign-in');
          },
        },
      ]
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 16 }]}>
      <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

      <SectionTitle>Account</SectionTitle>
      <Card>
        <Text style={{ color: colors.dim, fontSize: 13 }}>Connected with API key</Text>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600', marginTop: 4 }}>
          {credentials ? maskKey(credentials.apiKey) : 'Not connected'}
        </Text>
      </Card>

      {portfolios.length > 0 ? (
        <>
          <SectionTitle>Widget portfolio</SectionTitle>
          <Card style={{ paddingVertical: 4 }}>
            {portfolios.map((p, i) => {
              const active = p.id === selectedPortfolioId;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => selectPortfolio(p.id).catch(() => {})}
                  style={[
                    styles.portfolioRow,
                    i > 0 && {
                      borderTopColor: colors.border,
                      borderTopWidth: StyleSheet.hairlineWidth,
                    },
                  ]}>
                  <View>
                    <Text style={{ color: colors.text, fontSize: 16 }}>{p.name}</Text>
                    <Text style={{ color: colors.dim, fontSize: 13 }}>{p.currency}</Text>
                  </View>
                  {active ? (
                    <Text style={{ color: colors.positive, fontSize: 15, fontWeight: '600' }}>
                      On widgets
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </Card>
        </>
      ) : null}

      <SectionTitle>Data & privacy</SectionTitle>
      <Card>
        <Text style={{ color: colors.dim, fontSize: 14, lineHeight: 20 }}>
          Your API key and portfolio data live only on this device, in storage shared with the
          widget extension. The app talks directly to api.kubera.com — there is no middleman
          server. All requests are read-only.
        </Text>
      </Card>

      <View style={styles.signOut}>
        <Button title="Disconnect Kubera" variant="destructive" onPress={confirmSignOut} />
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  title: { fontSize: 34, fontWeight: '700', letterSpacing: -0.5, marginBottom: 4 },
  portfolioRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  signOut: { marginTop: 28 },
});
