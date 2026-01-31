import Auth from '@/components/Auth';
import { supabase } from '@/lib/supabase';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Session } from '@supabase/supabase-js';
import { Stack, router, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();

  const [session, setSession] = useState<Session | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(false);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  // 1) Session management (same as you had)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  // 2) When session exists, check if profile row exists
  useEffect(() => {
    const run = async () => {
      if (!session?.user?.id) {
        setHasProfile(null);
        return;
      }

      setCheckingProfile(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle(); // returns null if no row

        if (error) throw error;

        setHasProfile(!!data);
      } catch (e) {
        console.error('Profile check failed:', e);
        // safest fallback: treat as no profile so user can continue
        setHasProfile(false);
      } finally {
        setCheckingProfile(false);
      }
    };

    run();
  }, [session?.user?.id]);

  // 3) Redirect based on profile existence
  useEffect(() => {
    if (!session) return; // logged out -> Auth renders
    if (checkingProfile) return;
    if (hasProfile === null) return;

    const inOnboarding = pathname?.startsWith('/(onboarding)');

    if (!hasProfile && !inOnboarding) {
      router.replace('/(onboarding)/profile');
    }

    if (hasProfile && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [session, checkingProfile, hasProfile, pathname]);

  // If logged out, show auth
  if (!session) {
    return <Auth />;
  }

  // While checking profile, avoid flashing tabs
  if (checkingProfile || hasProfile === null) {
    return null; // you can replace with a loading screen later
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
