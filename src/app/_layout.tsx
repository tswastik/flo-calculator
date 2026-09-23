import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { ThemedView } from '@/components/themed-view';
import { UserOnboarding } from '@/components/user-onboarding';
import { UserProvider, useUser } from '@/hooks/use-user-store';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <UserProvider>
        <RootGate />
      </UserProvider>
    </ThemeProvider>
  );
}

function RootGate() {
  const { loading, activeUser } = useUser();

  if (loading) return <ThemedView style={{ flex: 1 }} />;
  if (!activeUser) return <UserOnboarding />;
  return <AppTabs />;
}
