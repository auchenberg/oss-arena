import { useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, SectionTitle } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { formatMoney, formatUpdatedAt } from '@/lib/format';
import { useKubera } from '@/lib/store';

export default function DashboardScreen() {
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const { snapshot, portfolios, selectedPortfolioId, settings, refreshing, refresh, selectPortfolio } =
    useKubera();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Refresh on launch so the dashboard and widgets stay current.
    refresh().catch((e) => setError(e instanceof Error ? e.message : 'Refresh failed.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onRefresh() {
    setError(null);
    try {
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Refresh failed.');
    }
  }

  const currency = snapshot?.currency ?? 'USD';
  const masked = settings.privacyMode;
  const gain = snapshot?.unrealizedGain ?? 0;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 16 }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Text style={[styles.title, { color: colors.text }]}>Net Worth</Text>

      {portfolios.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
          {portfolios.map((p) => {
            const active = p.id === selectedPortfolioId;
            return (
              <Pressable
                key={p.id}
                onPress={() => selectPortfolio(p.id).catch(() => {})}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.accent : colors.card,
                    borderColor: colors.border,
                  },
                ]}>
                <Text style={{ color: active ? colors.background : colors.text, fontWeight: '600' }}>
                  {p.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      {error ? (
        <Card style={styles.errorCard}>
          <Text style={{ color: colors.negative }}>{error}</Text>
        </Card>
      ) : null}

      {snapshot ? (
        <>
          <Card style={styles.heroCard}>
            <Text style={[styles.heroLabel, { color: colors.dim }]}>
              {snapshot.portfolioName.toUpperCase()}
            </Text>
            <Text style={[styles.heroValue, { color: colors.text }]}>
              {formatMoney(snapshot.netWorth, currency, { masked })}
            </Text>
            <Text style={[styles.heroMeta, { color: colors.dim }]}>
              Updated {formatUpdatedAt(snapshot.updatedAt)}
            </Text>
          </Card>

          <View style={styles.row}>
            <Card style={styles.half}>
              <Text style={[styles.statLabel, { color: colors.dim }]}>ASSETS</Text>
              <Text style={[styles.statValue, { color: colors.positive }]}>
                {formatMoney(snapshot.assetTotal, currency, { masked })}
              </Text>
            </Card>
            <Card style={styles.half}>
              <Text style={[styles.statLabel, { color: colors.dim }]}>DEBTS</Text>
              <Text style={[styles.statValue, { color: colors.negative }]}>
                {formatMoney(snapshot.debtTotal, currency, { masked })}
              </Text>
            </Card>
          </View>

          <Card style={styles.gainCard}>
            <Text style={[styles.statLabel, { color: colors.dim }]}>UNREALIZED GAIN</Text>
            <Text
              style={[styles.statValue, { color: gain >= 0 ? colors.positive : colors.negative }]}>
              {formatMoney(gain, currency, { masked, signed: true })}
            </Text>
          </Card>

          {Object.keys(snapshot.allocation).length > 0 ? (
            <>
              <SectionTitle>Allocation</SectionTitle>
              <Card>
                {Object.entries(snapshot.allocation)
                  .sort(([, a], [, b]) => b - a)
                  .map(([name, pct]) => (
                    <View key={name} style={styles.allocRow}>
                      <Text style={[styles.allocName, { color: colors.text }]}>{name}</Text>
                      <View style={[styles.allocTrack, { backgroundColor: colors.border }]}>
                        <View
                          style={[
                            styles.allocFill,
                            { backgroundColor: colors.text, width: `${Math.min(pct, 100)}%` },
                          ]}
                        />
                      </View>
                      <Text style={[styles.allocPct, { color: colors.dim }]}>{pct.toFixed(1)}%</Text>
                    </View>
                  ))}
              </Card>
            </>
          ) : null}

          {snapshot.topHoldings.length > 0 ? (
            <>
              <SectionTitle>Top holdings</SectionTitle>
              <Card>
                {snapshot.topHoldings.map((h, i) => (
                  <View
                    key={`${h.name}-${i}`}
                    style={[
                      styles.holdingRow,
                      i > 0 && { borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth },
                    ]}>
                    <View style={styles.holdingName}>
                      <Text style={{ color: colors.text, fontSize: 15 }} numberOfLines={1}>
                        {h.name}
                      </Text>
                      {h.sheet ? (
                        <Text style={{ color: colors.dim, fontSize: 12 }}>{h.sheet}</Text>
                      ) : null}
                    </View>
                    <Text style={{ color: colors.text, fontSize: 15, fontVariant: ['tabular-nums'] }}>
                      {formatMoney(h.value, currency, { masked, compact: settings.compactNumbers })}
                    </Text>
                  </View>
                ))}
              </Card>
            </>
          ) : null}
        </>
      ) : (
        <Card>
          <Text style={{ color: colors.dim }}>
            Pull to refresh to load your portfolio from Kubera.
          </Text>
        </Card>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20 },
  title: { fontSize: 34, fontWeight: '700', letterSpacing: -0.5, marginBottom: 16 },
  chips: { marginBottom: 16 },
  chip: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  errorCard: { marginBottom: 16 },
  heroCard: { marginBottom: 12 },
  heroLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1 },
  heroValue: { fontSize: 40, fontWeight: '700', letterSpacing: -1, marginVertical: 4 },
  heroMeta: { fontSize: 13 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  half: { flex: 1 },
  gainCard: {},
  statLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '700', fontVariant: ['tabular-nums'] },
  allocRow: { alignItems: 'center', flexDirection: 'row', paddingVertical: 6 },
  allocName: { flex: 1, fontSize: 14 },
  allocTrack: { borderRadius: 3, flex: 1.4, height: 6, overflow: 'hidden' },
  allocFill: { borderRadius: 3, height: 6 },
  allocPct: { fontSize: 13, textAlign: 'right', width: 56 },
  holdingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  holdingName: { flex: 1, marginRight: 12 },
});
