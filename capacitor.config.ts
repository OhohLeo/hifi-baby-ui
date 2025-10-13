import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hifibaby.ui',
  appName: 'Hifi Baby',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Allow connections to local backend during development and production
    allowNavigation: [
      'hifi-baby.local',
      '*.local',
      '192.168.*',
      '10.0.*',
      'localhost'
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1976D2', // Match Vuetify primary color
      showSpinner: true,
      spinnerColor: '#FFFFFF'
    },
    Keyboard: {
      resize: 'native',
      style: 'dark',
      resizeOnFullScreen: true
    }
  },
  android: {
    allowMixedContent: true, // Allow HTTP connections for local network
    captureInput: true,
    webContentsDebuggingEnabled: true // TODO: Disable in production
  }
};

export default config;
