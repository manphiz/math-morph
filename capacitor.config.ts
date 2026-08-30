import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mathmorph.mathmorph',
  appName: 'Math Morph',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  ios: {
    contentInset: 'never',
    scrollEnabled: false,
    preferredContentMode: 'mobile',
    scheme: 'App',
    backgroundColor: '#0a0a0a',
  },
};

export default config;
