import { Stack } from 'expo-router';

import { KuberaProvider } from '@/lib/store';

export default function RootLayout() {
  return (
    <KuberaProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="sign-in"
          options={{ headerShown: false, presentation: 'fullScreenModal', gestureEnabled: false }}
        />
      </Stack>
    </KuberaProvider>
  );
}
