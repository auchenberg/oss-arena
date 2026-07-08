import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { getPortfolioSnapshot, listPortfolios } from '@/lib/kubera';
import { getJSON, setJSON, SharedKeys, sharedStore } from '@/lib/shared-storage';
import {
  DEFAULT_WIDGET_SETTINGS,
  type KuberaCredentials,
  type PortfolioListItem,
  type PortfolioSnapshot,
  type WidgetSettings,
} from '@/lib/types';

interface KuberaStore {
  credentials: KuberaCredentials | null;
  portfolios: PortfolioListItem[];
  selectedPortfolioId: string | null;
  snapshot: PortfolioSnapshot | null;
  settings: WidgetSettings;
  refreshing: boolean;
  signIn(creds: KuberaCredentials): Promise<void>;
  signOut(): void;
  refresh(): Promise<void>;
  selectPortfolio(id: string): Promise<void>;
  updateSettings(patch: Partial<WidgetSettings>): void;
}

const StoreContext = createContext<KuberaStore | null>(null);

export function KuberaProvider({ children }: { children: React.ReactNode }) {
  const [credentials, setCredentials] = useState<KuberaCredentials | null>(() =>
    getJSON<KuberaCredentials>(SharedKeys.credentials)
  );
  const [portfolios, setPortfolios] = useState<PortfolioListItem[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(() =>
    sharedStore.get(SharedKeys.selectedPortfolioId)
  );
  const [snapshot, setSnapshot] = useState<PortfolioSnapshot | null>(() =>
    getJSON<PortfolioSnapshot>(SharedKeys.snapshot)
  );
  const [settings, setSettings] = useState<WidgetSettings>(() => ({
    ...DEFAULT_WIDGET_SETTINGS,
    ...getJSON<Partial<WidgetSettings>>(SharedKeys.settings),
  }));
  const [refreshing, setRefreshing] = useState(false);

  const loadSnapshot = useCallback(async (creds: KuberaCredentials, portfolioId: string) => {
    const snap = await getPortfolioSnapshot(creds, portfolioId);
    setSnapshot(snap);
    setJSON(SharedKeys.snapshot, snap);
    sharedStore.reloadWidgets();
  }, []);

  const signIn = useCallback(
    async (creds: KuberaCredentials) => {
      // Validates the credentials — throws KuberaError on bad keys.
      const found = await listPortfolios(creds);
      if (found.length === 0) {
        throw new Error('No portfolios found on this Kubera account.');
      }
      setCredentials(creds);
      setPortfolios(found);
      setJSON(SharedKeys.credentials, creds);

      const portfolioId = found[0].id;
      setSelectedPortfolioId(portfolioId);
      sharedStore.set(SharedKeys.selectedPortfolioId, portfolioId);
      await loadSnapshot(creds, portfolioId);
    },
    [loadSnapshot]
  );

  const signOut = useCallback(() => {
    setCredentials(null);
    setPortfolios([]);
    setSelectedPortfolioId(null);
    setSnapshot(null);
    sharedStore.remove(SharedKeys.credentials);
    sharedStore.remove(SharedKeys.selectedPortfolioId);
    sharedStore.remove(SharedKeys.snapshot);
    sharedStore.reloadWidgets();
  }, []);

  const refresh = useCallback(async () => {
    if (!credentials || !selectedPortfolioId) return;
    setRefreshing(true);
    try {
      if (portfolios.length === 0) {
        setPortfolios(await listPortfolios(credentials));
      }
      await loadSnapshot(credentials, selectedPortfolioId);
    } finally {
      setRefreshing(false);
    }
  }, [credentials, selectedPortfolioId, portfolios.length, loadSnapshot]);

  const selectPortfolio = useCallback(
    async (id: string) => {
      setSelectedPortfolioId(id);
      sharedStore.set(SharedKeys.selectedPortfolioId, id);
      if (credentials) {
        await loadSnapshot(credentials, id);
      }
    },
    [credentials, loadSnapshot]
  );

  const updateSettings = useCallback((patch: Partial<WidgetSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      setJSON(SharedKeys.settings, next);
      sharedStore.reloadWidgets();
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      credentials,
      portfolios,
      selectedPortfolioId,
      snapshot,
      settings,
      refreshing,
      signIn,
      signOut,
      refresh,
      selectPortfolio,
      updateSettings,
    }),
    [
      credentials,
      portfolios,
      selectedPortfolioId,
      snapshot,
      settings,
      refreshing,
      signIn,
      signOut,
      refresh,
      selectPortfolio,
      updateSettings,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useKubera(): KuberaStore {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useKubera must be used inside KuberaProvider');
  }
  return ctx;
}
