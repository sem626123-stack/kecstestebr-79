import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.14b8699941734158a005e0cf08d4298c',
  appName: 'kecstestebr-79',
  webDir: 'dist',
  server: {
    url: 'https://14b86999-4173-4158-a005-e0cf08d4298c.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;