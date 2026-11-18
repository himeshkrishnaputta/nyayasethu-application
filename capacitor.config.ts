
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nyayasetu.app',
  appName: 'nyayasetu',
  webDir: 'dist',
  android: {
    allowMixedContent: true
  }
};

export default config;
