import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, SectionTitle } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { formatMoney } from '@/lib/format';
import { useKubera } from '@/lib/store';

const PREVIEW_TEXT = '#F5F7FA';
const PREVIEW_DIM = '#8A93A6';

function WidgetPreview({
  kind,
  values,
}: {
  kind: 'networth' | 'assets' | 'holdings';
  values: {
    netWorth: string;
    assets: string;
    debts: string;
    gain: string;
    holdings: { name: string; value: string }[];
    portfolioName: string;
  };
}) {
  const colors = useTheme();
  const base = [styles.preview, { backgroundColor: colors.widgetPreviewBg }];

  if (kind === 'networth') {
    return (
      <View style={[...base, styles.previewSmall]}>
        <Text style={styles.previewLabel}>NET WORTH</Text>
        <Text style={styles.previewBig} numberOfLines={1} adjustsFontSizeToFit>
          {values.netWorth}
        </Text>
        <Text style={styles.previewDim}>{values.portfolioName}</Text>
      </View>
    );
  }

  if (kind === 'assets') {
    return (
      <View style={[...base, styles.previewMedium]}>
        <View style={styles.previewCol}>
          <Text style={styles.previewLabel}>NET WORTH</Text>
          <Text style={styles.previewMed} numberOfLines={1} adjustsFontSizeToFit>
            {values.netWorth}
          </Text>
          <Text style={styles.previewDim}>{values.gain} unrealized</Text>
        </View>
        <View style={styles.previewCol}>
          <Text style={styles.previewLabel}>ASSETS</Text>
          <Text style={styles.previewSub}>{values.assets}</Text>
          <Text style={[styles.previewLabel, { marginTop: 6 }]}>DEBTS</Text>
          <Text style={styles.previewSub}>{values.debts}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[...base, styles.previewMedium, { flexDirection: 'column' }]}>
      <Text style={[styles.previewLabel, { marginBottom: 6 }]}>TOP HOLDINGS</Text>
      {values.holdings.map((h, i) => (
        <View key={i} style={styles.previewHoldingRow}>
          <Text style={styles.previewHoldingName} numberOfLines={1}>
            {h.name}
          </Text>
          <Text style={styles.previewSub}>{h.value}</Text>
        </View>
      ))}
    </View>
  );
}

export default function WidgetsScreen() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const { snapshot, settings, updateSettings, refresh, refreshing } = useKubera();
  const [status, setStatus] = useState<string | null>(null);

  const currency = snapshot?.currency ?? 'USD';
  const masked = settings.privacyMode;
  const compact = settings.compactNumbers;
  const money = (v: number, signed = false) =>
    formatMoney(v, currency, { masked, compact, signed });

  const previewValues = {
    netWorth: snapshot ? money(snapshot.netWorth) : '$1.24M',
    assets: snapshot ? money(snapshot.assetTotal) : '$1.61M',
    debts: snapshot ? money(snapshot.debtTotal) : '$370K',
    gain: snapshot ? money(snapshot.unrealizedGain, true) : '+$214K',
    portfolioName: snapshot?.portfolioName ?? 'Main portfolio',
    holdings: (snapshot?.topHoldings.slice(0, 3) ?? []).map((h) => ({
      name: h.name,
      value: money(h.value),
    })),
  };
  if (previewValues.holdings.length === 0) {
    previewValues.holdings = [
      { name: 'Index funds', value: '$620K' },
      { name: 'Home', value: '$450K' },
      { name: 'Bitcoin', value: '$96K' },
    ];
  }

  async function updateWidgetData() {
    setStatus(null);
    try {
      await refresh();
      setStatus('Widget data updated.');
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Update failed.');
    }
  }

  const toggleRow = (label: string, description: string, key: keyof typeof settings) => (
    <View style={[styles.toggleRow, { borderTopColor: colors.border }]}>
      <View style={styles.toggleText}>
        <Text style={{ color: colors.text, fontSize: 16 }}>{label}</Text>
        <Text style={{ color: colors.dim, fontSize: 13, marginTop: 2 }}>{description}</Text>
      </View>
      <Switch value={settings[key]} onValueChange={(v) => updateSettings({ [key]: v })} />
    </View>
  );

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 16 }]}>
      <Text style={[styles.title, { color: colors.text }]}>Widgets</Text>
      <Text style={[styles.subtitle, { color: colors.dim }]}>
        Three widgets are available in the iOS widget gallery. Previews below use your live data.
      </Text>

      <SectionTitle>Net Worth · small & medium</SectionTitle>
      <Card style={styles.previewCard}>
        <WidgetPreview kind="networth" values={previewValues} />
      </Card>

      <SectionTitle>Assets vs debts · medium</SectionTitle>
      <Card style={styles.previewCard}>
        <WidgetPreview kind="assets" values={previewValues} />
      </Card>

      <SectionTitle>Top holdings · medium & large</SectionTitle>
      <Card style={styles.previewCard}>
        <WidgetPreview kind="holdings" values={previewValues} />
      </Card>

      <SectionTitle>Widget options</SectionTitle>
      <Card style={{ paddingVertical: 4 }}>
        <View style={[styles.toggleRow, { borderTopWidth: 0 }]}>
          <View style={styles.toggleText}>
            <Text style={{ color: colors.text, fontSize: 16 }}>Privacy mode</Text>
            <Text style={{ color: colors.dim, fontSize: 13, marginTop: 2 }}>
              Mask all amounts on the Home Screen
            </Text>
          </View>
          <Switch
            value={settings.privacyMode}
            onValueChange={(v) => updateSettings({ privacyMode: v })}
          />
        </View>
        {toggleRow('Show unrealized gain', 'Display gain under the net worth number', 'showGain')}
        {toggleRow('Compact numbers', 'Show $1.24M instead of $1,240,000', 'compactNumbers')}
      </Card>

      <View style={styles.actions}>
        <Button title="Update widget data now" onPress={updateWidgetData} loading={refreshing} />
        {status ? (
          <Text style={{ color: colors.dim, marginTop: 10, textAlign: 'center' }}>{status}</Text>
        ) : null}
      </View>

      <SectionTitle>How to add a widget</SectionTitle>
      <Card>
        <Text style={[styles.step, { color: colors.text }]}>
          1. Long-press your Home Screen, then tap Edit → Add Widget.
        </Text>
        <Text style={[styles.step, { color: colors.text }]}>
          2. Search for “Kubera Widgets”.
        </Text>
        <Text style={[styles.step, { color: colors.text }]}>
          3. Pick a widget and size, then tap Add Widget.
        </Text>
        <Text style={[styles.step, { color: colors.dim }]}>
          Widgets refresh on their own roughly every 30–60 minutes, and instantly whenever you open
          this app.
        </Text>
      </Card>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  title: { fontSize: 34, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, lineHeight: 21, marginTop: 6 },
  previewCard: { alignItems: 'center' },
  preview: { borderRadius: 20, padding: 16 },
  previewSmall: { height: 148, justifyContent: 'space-between', width: 148 },
  previewMedium: { flexDirection: 'row', gap: 16, minHeight: 148, width: '100%', maxWidth: 320 },
  previewCol: { flex: 1, justifyContent: 'center' },
  previewLabel: { color: PREVIEW_DIM, fontSize: 10, fontWeight: '600', letterSpacing: 1 },
  previewBig: { color: PREVIEW_TEXT, fontSize: 26, fontWeight: '700', letterSpacing: -0.5 },
  previewMed: { color: PREVIEW_TEXT, fontSize: 24, fontWeight: '700', marginVertical: 2 },
  previewSub: { color: PREVIEW_TEXT, fontSize: 15, fontWeight: '600' },
  previewDim: { color: PREVIEW_DIM, fontSize: 12 },
  previewHoldingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  previewHoldingName: { color: PREVIEW_TEXT, flex: 1, fontSize: 14, marginRight: 10 },
  toggleRow: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  toggleText: { flex: 1, marginRight: 12 },
  actions: { marginTop: 20 },
  step: { fontSize: 14, lineHeight: 22 },
});
