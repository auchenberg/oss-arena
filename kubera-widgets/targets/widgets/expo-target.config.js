/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: 'widget',
  name: 'KuberaWidgetsExtension',
  displayName: 'Kubera Widgets',
  bundleIdentifier: '.widgets',
  deploymentTarget: '17.0',
  frameworks: ['SwiftUI', 'WidgetKit'],
  colors: {
    $accent: { color: '#F5F7FA', darkColor: '#F5F7FA' },
    $widgetBackground: { color: '#0B0E1A', darkColor: '#0B0E1A' },
  },
  entitlements: {
    // Settings and the cached snapshot are shared via the App Group;
    // credentials live in the shared Keychain access group.
    'com.apple.security.application-groups':
      config.ios.entitlements['com.apple.security.application-groups'],
    'keychain-access-groups': config.ios.entitlements['keychain-access-groups'],
  },
});
