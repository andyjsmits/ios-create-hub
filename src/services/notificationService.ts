// Conditional imports to avoid resolution errors on web
let LocalNotifications: any = null;
let PushNotifications: any = null;
let Capacitor: any = null;

// Initialize Capacitor from global object instead of dynamic imports
const initializeCapacitor = async () => {
  try {
    // Check if we're in a Capacitor environment
    const isCapacitorEnvironment = 
      typeof window !== 'undefined' && 
      ((window as any).Capacitor || 
       window.location.protocol === 'capacitor:' ||
       (window as any).webkit?.messageHandlers);
    
    console.log('Capacitor environment detection:', {
      hasWindow: typeof window !== 'undefined',
      hasCapacitor: !!(window as any)?.Capacitor,
      protocol: window?.location?.protocol,
      hasWebkit: !!(window as any)?.webkit?.messageHandlers,
      isCapacitorEnvironment: !!isCapacitorEnvironment,
      availablePlugins: (window as any)?.Capacitor?.Plugins ? Object.keys((window as any).Capacitor.Plugins) : []
    });

    if (isCapacitorEnvironment && (window as any).Capacitor) {
      console.log('Using Capacitor global object...');
      
      // Use the global Capacitor object directly
      Capacitor = (window as any).Capacitor;
      LocalNotifications = (window as any).Capacitor.Plugins?.LocalNotifications;
      PushNotifications = (window as any).Capacitor.Plugins?.PushNotifications;
      
      console.log('Capacitor modules loaded successfully:', {
        hasCapacitor: !!Capacitor,
        hasLocalNotifications: !!LocalNotifications,
        hasPushNotifications: !!PushNotifications,
        isNative: Capacitor.isNativePlatform ? Capacitor.isNativePlatform() : 'unknown',
        platform: Capacitor.getPlatform ? Capacitor.getPlatform() : 'unknown'
      });
    } else {
      console.log('Not in Capacitor environment, using web fallback');
    }
  } catch (error) {
    console.log('Error initializing Capacitor, using web fallback:', error);
  }
};

type DailyRepeat = { repeats: true; on: { hour: number; minute: number } };

export interface NotificationService {
  requestPermissions(): Promise<boolean>;
  checkPermissions(): Promise<boolean>;
  scheduleLocalNotification(options: {
    title: string;
    body: string;
    id: number;
    schedule?: Date | DailyRepeat;
  }): Promise<void>;
  schedulePrayerReminder(personName: string, time: Date): Promise<void>;
  cancelNotification(id: number): Promise<void>;
  setupPushNotifications(): Promise<void>;
}

class CapacitorNotificationService implements NotificationService {
  async checkPermissions(): Promise<boolean> {
    try {
      if (!LocalNotifications) {
        console.log('LocalNotifications not available, falling back to web');
        return false;
      }
      
      console.log('Checking local notification permissions...');
      const result = await LocalNotifications.checkPermissions();
      console.log('Current notification permissions:', result);
      return result.display === 'granted';
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  }

  async requestPermissions(): Promise<boolean> {
    try {
      if (!LocalNotifications) {
        console.log('LocalNotifications not available, falling back to web');
        return false;
      }
      
      console.log('Requesting local notification permissions...');
      const result = await LocalNotifications.requestPermissions();
      console.log('Local notifications permission result:', result);
      
      if (result.display === 'granted') {
        return true;
      }
      
      console.log('Local notifications permission denied, status:', result.display);
      return false;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async scheduleLocalNotification(options: {
    title: string;
    body: string;
    id: number;
    schedule?: Date | DailyRepeat;
  }): Promise<void> {
    try {
      if (!LocalNotifications) {
        console.log('LocalNotifications not available for scheduling');
        return;
      }
      
      const scheduleOptions: any = {
        notifications: [{
          title: options.title,
          body: options.body,
          id: options.id,
          ...(options.schedule && (
            options.schedule instanceof Date
              ? { schedule: { at: options.schedule } }
              : { schedule: { repeats: true, on: { hour: options.schedule.on.hour, minute: options.schedule.on.minute } } }
          ))
        }]
      };
      
      console.log('Scheduling notification:', scheduleOptions);
      await LocalNotifications.schedule(scheduleOptions);
      console.log('Notification scheduled successfully');
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  async schedulePrayerReminder(personName: string, time: Date): Promise<void> {
    await this.scheduleLocalNotification({
      title: 'PULSE Prayer Reminder',
      body: `Time to pray for ${personName}`,
      id: Math.floor(Math.random() * 10000),
      schedule: time
    });
  }

  async cancelNotification(id: number): Promise<void> {
    try {
      if (!LocalNotifications) {
        console.log('LocalNotifications not available for cancelling');
        return;
      }
      
      // Capacitor LocalNotifications expects a numeric ID
      await LocalNotifications.cancel({ notifications: [{ id }] });
      console.log('Notification cancelled:', id);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  async setupPushNotifications(): Promise<void> {
    try {
      if (!PushNotifications) {
        console.log('PushNotifications not available');
        return;
      }
      
      console.log('Setting up push notifications...');
      const result = await PushNotifications.requestPermissions();
      console.log('Push notifications permission result:', result);
      
      if (result.receive === 'granted') {
        await PushNotifications.register();
        console.log('Push notifications registered successfully');
      } else {
        console.log('Push notifications permission denied');
      }
    } catch (error) {
      console.error('Error setting up push notifications:', error);
    }
  }
}

// Fallback service for web platform
class WebNotificationService implements NotificationService {
  async checkPermissions(): Promise<boolean> {
    if ('Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  }

  async requestPermissions(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  async scheduleLocalNotification(options: {
    title: string;
    body: string;
    id: number;
    schedule?: Date | DailyRepeat;
  }): Promise<void> {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    if (!options.schedule) {
      new Notification(options.title, { body: options.body });
      return;
    }

    if (options.schedule instanceof Date) {
      const delay = options.schedule.getTime() - Date.now();
      if (delay > 0) {
        setTimeout(() => {
          new Notification(options.title, { body: options.body });
        }, delay);
      }
      return;
    }

    // Best-effort daily repeat in web: schedule next fire, then 24h intervals
    const now = new Date();
    const next = new Date();
    next.setHours(options.schedule.on.hour, options.schedule.on.minute, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    const firstDelay = next.getTime() - now.getTime();
    setTimeout(() => {
      new Notification(options.title, { body: options.body });
      // Subsequent fires approximately every 24h
      setInterval(() => {
        new Notification(options.title, { body: options.body });
      }, 24 * 60 * 60 * 1000);
    }, firstDelay);
  }

  async schedulePrayerReminder(personName: string, time: Date): Promise<void> {
    await this.scheduleLocalNotification({
      title: 'PULSE Prayer Reminder',
      body: `Time to pray for ${personName}`,
      id: Math.floor(Math.random() * 10000),
      schedule: time
    });
  }

  async cancelNotification(id: number): Promise<void> {
    // Web notifications don't have a cancel method for scheduled notifications
    console.log('Web notifications cannot be cancelled once scheduled');
  }

  async setupPushNotifications(): Promise<void> {
    console.log('Push notifications not supported on web platform');
  }
}

// Create the appropriate service based on platform
const createNotificationService = async (): Promise<NotificationService> => {
  await initializeCapacitor();
  
  // Check if we successfully loaded Capacitor and we're on a native platform
  const isNativePlatform = Capacitor && 
    (Capacitor.isNativePlatform() || 
     (typeof window !== 'undefined' && window.location.protocol === 'capacitor:'));
  
  console.log('Service selection:', {
    hasCapacitor: !!Capacitor,
    isNativePlatform: isNativePlatform,
    capacitorPlatform: Capacitor?.getPlatform?.(),
    protocol: typeof window !== 'undefined' ? window.location.protocol : 'unknown'
  });
  
  if (isNativePlatform) {
    console.log('Using Capacitor notification service for native platform');
    return new CapacitorNotificationService();
  } else {
    console.log('Using web notification service for web/browser platform');
    return new WebNotificationService();
  }
};

// Create a promise that resolves to the service
let notificationServicePromise: Promise<NotificationService> | null = null;

const getNotificationService = async (): Promise<NotificationService> => {
  if (!notificationServicePromise) {
    notificationServicePromise = createNotificationService();
  }
  return await notificationServicePromise;
};

// Export a wrapper that handles the async initialization
export const notificationService: NotificationService = {
  async checkPermissions(): Promise<boolean> {
    const service = await getNotificationService();
    return service.checkPermissions();
  },
  async requestPermissions(): Promise<boolean> {
    const service = await getNotificationService();
    return service.requestPermissions();
  },
  async scheduleLocalNotification(options: {
    title: string;
    body: string;
    id: number;
    schedule?: Date;
  }): Promise<void> {
    const service = await getNotificationService();
    return service.scheduleLocalNotification(options);
  },
  async schedulePrayerReminder(personName: string, time: Date): Promise<void> {
    const service = await getNotificationService();
    return service.schedulePrayerReminder(personName, time);
  },
  async cancelNotification(id: number): Promise<void> {
    const service = await getNotificationService();
    return service.cancelNotification(id);
  },
  async setupPushNotifications(): Promise<void> {
    const service = await getNotificationService();
    return service.setupPushNotifications();
  }
};
