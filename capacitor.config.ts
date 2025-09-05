import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.smits.pulse',
  appName: 'PULSE',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#488AFF',
      sound: 'beep.wav',
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: false,
      backgroundColor: '#ffffff',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_INSIDE',
      splashFullScreen: true,
      splashImmersive: false,
      iosSpinnerStyle: 'small',
      spinnerColor: '#999999',
    },
    Browser: {
      windowName: '_self',
      presentationStyle: 'popover'
    },
    App: {
      appUrlOpen: {
        iosCustomScheme: 'app.smits.pulse',
        androidCustomScheme: 'app.smits.pulse'
      }
    },
  },
};

export default config;