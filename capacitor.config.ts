import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mathmorph.pro',
  appName: 'Math Morph Pro',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  ios: {
    contentInset: 'always',
    preferredContentMode: 'mobile',
    scheme: 'Math Morph Pro',
    backgroundColor: '#0a0a0a',
  },
};

export default config;
