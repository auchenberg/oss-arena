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
    // Share credentials, settings and the cached snapshot with the app.
    'com.apple.security.application-groups':
      config.ios.entitlements['com.apple.security.application-groups'],
  },
});
