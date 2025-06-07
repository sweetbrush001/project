import React, { useEffect } from 'react';
import { SplashScreen, Redirect } from 'expo-router';
import { useFonts } from 'expo-font';
import { 
  Inter_400Regular,
  Inter_500Medium, 
  Inter_700Bold 
} from '@expo-google-fonts/inter';

export default function Index() {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Wait for fonts to load
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Redirect to the main tabs layout once fonts are loaded
  return <Redirect href="/(tabs)" />;
}