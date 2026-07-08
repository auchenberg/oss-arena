# Kubera Widgets

An iOS app that puts your [Kubera](https://www.kubera.com) net worth on your Home Screen.

The app is React Native (Expo SDK 57). The Home Screen widgets are a native SwiftUI
WidgetKit extension — iOS requires widgets to be SwiftUI — generated into the Xcode
project by [`@bacons/apple-targets`](https://github.com/EvanBacon/expo-apple-targets).

## What you get

| Widget | Sizes | Shows |
| --- | --- | --- |
| **Net Worth** | small, medium, Lock Screen (inline / circular / rectangular) | Net worth, unrealized gain, portfolio name |
| **Assets vs Debts** | medium | Asset and debt totals with a ratio bar |
| **Top Holdings** | medium, large | Your largest assets, ranked |

In the app:

- **Connect with a Kubera API key** (Settings → API in Kubera web) — validated against
  the live API, stored only on-device.
- **Net Worth dashboard** — net worth, assets/debts, unrealized gain, allocation,
  top holdings, pull-to-refresh, portfolio switcher for multi-portfolio accounts.
- **Widgets tab** — live previews of each widget using your data, plus widget options:
  privacy mode (mask amounts), show/hide gain, compact numbers ($1.24M vs $1,240,000).
- **Settings** — pick which portfolio widgets display, disconnect.

## How data flows

```
┌─────────────┐   HMAC-signed GET    ┌──────────────────┐
│  Expo app   │ ───────────────────▶ │  api.kubera.com  │
└──────┬──────┘                      └──────────────────┘
       │ creds → shared Keychain group             ▲
       │ snapshot + settings → App Group defaults  │
       ▼                                           │
┌─────────────────────────────┐    independent     │
│ Keychain (access group)     │    refresh (30m)   │
│ App Group NSUserDefaults    │ ◀──────────────────┤
└──────┬──────────────────────┘                    │
       ▼ reads                                     │
┌─────────────────────────────┐                    │
│ WidgetKit extension (Swift) │ ───────────────────┘
└─────────────────────────────┘
```

- Requests are signed with `HMAC-SHA256(secret, apiKey + timestamp + METHOD + path)` —
  implemented twice, in `src/lib/kubera.ts` (app) and `targets/widgets/KuberaAPI.swift`
  (widget), so widgets refresh themselves even when the app hasn't been opened in days.
- Credentials are stored in the iOS Keychain (`expo-secure-store`, accessible after
  first unlock) inside a keychain access group shared with the widget extension. The
  shared group is listed first in both targets' `keychain-access-groups`, so writes
  default into it — no team-ID string is needed at runtime. Only the non-sensitive-ish
  display snapshot and settings go through App Group `NSUserDefaults`.
- Opening the app (or tapping "Update widget data now") refreshes the shared snapshot
  and reloads all widget timelines immediately.
- All calls are read-only. There is no backend server — the device talks to Kubera directly.
- iOS budgets widget refreshes (roughly 40–70/day), so timelines ask for a refresh every
  ~30 minutes and fall back to the cached snapshot on network failure.

## Project layout

```
src/app/            expo-router screens: sign-in, (tabs)/{index,widgets,settings}
src/lib/            kubera.ts (API client), store.tsx (state), shared-storage.ts (App Group bridge)
targets/widgets/    SwiftUI widget extension (source of truth; linked into Xcode by prebuild)
  index.swift         WidgetBundle entry
  Provider.swift      TimelineProvider (cache + self-refresh policy)
  KuberaAPI.swift     native HMAC-signed Kubera client
  Shared.swift        App Group keys/models — keep in sync with src/lib/types.ts
```

`ios/` is gitignored (Continuous Native Generation) — regenerate any time with
`npx expo prebuild -p ios --clean`.

## Building

Requires an Apple Developer account (App Groups need one).

1. `npm install`
2. Put your Apple Team ID in `app.json` under `expo.ios.appleTeamId`.
3. Either:
   - **EAS (no Mac needed):** `npx eas build --profile development --platform ios`,
     then install the build and run `npx expo start`.
   - **Local Mac:** `npx expo prebuild -p ios --clean && npx expo run:ios`
     (Xcode 16+, CocoaPods ≥ 1.16.2).
4. Sign in with your Kubera API key + secret, then add widgets from the iOS widget gallery.

Widgets don't run in Expo Go — a dev build is required.

## Notes & future work

- Possible next widgets: net worth sparkline (needs history endpoint), Live Activity
  for market hours, per-widget portfolio selection via AppIntents configuration.
- The cached snapshot in App Group defaults contains portfolio values (needed for
  offline widget rendering); moving it into the Keychain too would be maximal
  hardening at the cost of some complexity.
