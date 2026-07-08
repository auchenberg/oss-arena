import { Platform } from 'react-native';

/**
 * App Group identifier shared between the app and the widget extension.
 * Must match app.json ios.entitlements and targets/widgets/expo-target.config.js.
 */
export const APP_GROUP = 'group.com.auchenberg.kuberawidgets';

/** Keys shared with the widget extension — keep in sync with targets/widgets/Shared.swift */
export const SharedKeys = {
  credentials: 'kubera.credentials',
  selectedPortfolioId: 'kubera.selectedPortfolioId',
  settings: 'kubera.settings',
  snapshot: 'kubera.snapshot',
} as const;

interface SharedStore {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
  reloadWidgets(): void;
}

/**
 * On iOS this is NSUserDefaults in the shared App Group, so the widget
 * extension reads the same values. Elsewhere (web preview / tests) it falls
 * back to in-memory storage so the app still runs.
 */
function createStore(): SharedStore {
  if (Platform.OS === 'ios') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ExtensionStorage } = require('@bacons/apple-targets') as {
      ExtensionStorage: {
        new (appGroup: string): {
          get(key: string): string | null;
          set(key: string, value?: string): void;
          remove(key: string): void;
        };
        reloadWidget(name?: string): void;
      };
    };
    const storage = new ExtensionStorage(APP_GROUP);
    return {
      get: (key) => storage.get(key),
      set: (key, value) => storage.set(key, value),
      remove: (key) => storage.remove(key),
      reloadWidgets: () => ExtensionStorage.reloadWidget(),
    };
  }

  const memory = new Map<string, string>();
  return {
    get: (key) => memory.get(key) ?? null,
    set: (key, value) => void memory.set(key, value),
    remove: (key) => void memory.delete(key),
    reloadWidgets: () => {},
  };
}

export const sharedStore = createStore();

export function getJSON<T>(key: string): T | null {
  const raw = sharedStore.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setJSON(key: string, value: unknown): void {
  sharedStore.set(key, JSON.stringify(value));
}
