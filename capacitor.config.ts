import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mathmorph.pro',
  appName: 'Math Morph',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  ios: {
    contentInset: 'never',
    scrollEnabled: false,
    preferredContentMode: 'mobile',
    scheme: 'mathmorph',
    backgroundColor: '#0a0a0a',
  },
};

export default config;
