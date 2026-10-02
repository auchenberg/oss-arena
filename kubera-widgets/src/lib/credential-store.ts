import { Platform } from 'react-native';

import { getJSON, SharedKeys, sharedStore } from '@/lib/shared-storage';
import type { KuberaCredentials } from '@/lib/types';

/**
 * Kubera API credentials live in the iOS Keychain, in a keychain access group
 * shared with the widget extension — never in App Group NSUserDefaults, which
 * is unencrypted on disk.
 *
 * The shared group is listed FIRST in `keychain-access-groups` for both the
 * app and the widget (see app.json and targets/widgets/expo-target.config.js),
 * so keychain writes land in the shared group by default and no team-ID-
 * prefixed group string is needed at runtime.
 *
 * Service and account names must stay in sync with the widget reader in
 * `targets/widgets/Shared.swift`. expo-secure-store appends ":no-auth" to the
 * service name for items stored without biometric protection, so the widget
 * queries service `kubera-widgets:no-auth`.
 */
const KEYCHAIN_SERVICE = 'kubera-widgets';
const CREDENTIALS_KEY = 'kubera.credentials';

interface CredentialStore {
  get(): KuberaCredentials | null;
  set(creds: KuberaCredentials): void;
  clear(): void;
}

function createStore(): CredentialStore {
  if (Platform.OS === 'ios') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const SecureStore = require('expo-secure-store') as typeof import('expo-secure-store');
    const options: import('expo-secure-store').SecureStoreOptions = {
      keychainService: KEYCHAIN_SERVICE,
      // Widgets refresh in the background; AFTER_FIRST_UNLOCK is the strictest
      // class that still allows reads before the app is foregrounded.
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    };

    return {
      get: () => {
        const raw = SecureStore.getItem(CREDENTIALS_KEY, options);
        if (raw) {
          try {
            return JSON.parse(raw) as KuberaCredentials;
          } catch {
            return null;
          }
        }
        // Migrate credentials written by pre-Keychain builds out of the
        // App Group defaults.
        const legacy = getJSON<KuberaCredentials>(SharedKeys.credentials);
        if (legacy?.apiKey && legacy?.secret) {
          SecureStore.setItem(CREDENTIALS_KEY, JSON.stringify(legacy), options);
          sharedStore.remove(SharedKeys.credentials);
          return legacy;
        }
        return null;
      },
      set: (creds) => {
        SecureStore.setItem(CREDENTIALS_KEY, JSON.stringify(creds), options);
        // Defense in depth: make sure nothing lingers in the old location.
        sharedStore.remove(SharedKeys.credentials);
      },
      clear: () => {
        void SecureStore.deleteItemAsync(CREDENTIALS_KEY, options);
        sharedStore.remove(SharedKeys.credentials);
      },
    };
  }

  let memory: KuberaCredentials | null = null;
  return {
    get: () => memory,
    set: (creds) => {
      memory = creds;
    },
    clear: () => {
      memory = null;
    },
  };
}

export const credentialStore = createStore();
