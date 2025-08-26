import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.1590c06423e54362a25c712d37cdea5f',
  appName: 'PULSE',
  webDir: 'dist',
  server: {
    url: 'https://1590c064-23e5-4362-a25c-712d37cdea5f.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#488AFF',
      sound: 'beep.wav',
    },
  },
};

export default config;