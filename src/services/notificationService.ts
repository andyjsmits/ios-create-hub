// Import Capacitor plugins directly (Capacitor 7 style)
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

// Check if we're on a native platform
const isNativePlatform = () => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

console.log('Capacitor environment:', {
  isNative: isNativePlatform(),
  platform: Capacitor.getPlatform()
});

// Repeat specification supporting daily or weekly repeats
type RepeatSpec = {
  repeats: true;
  on: { hour: number; minute: number; weekday?: number };
  every?: 'day' | 'week';
};

export interface NotificationService {
  requestPermissions(): Promise<boolean>;
  checkPermissions(): Promise<boolean>;
  scheduleLocalNotification(options: {
    title: string;
    body: string;
    id: number;
    schedule?: Date | RepeatSpec;
  }): Promise<void>;
  schedulePrayerReminder(personName: string, time: Date): Promise<void>;
  cancelNotification(id: number): Promise<void>;
  setupPushNotifications(): Promise<void>;
}

class CapacitorNotificationService implements NotificationService {
  async checkPermissions(): Promise<boolean> {
    try {
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
    schedule?: Date | RepeatSpec;
  }): Promise<void> {
    try {
      const scheduleOptions: any = {
        notifications: [{
          title: options.title,
          body: options.body,
          id: options.id,
          ...(options.schedule && (
            options.schedule instanceof Date
              ? { schedule: { at: options.schedule } }
              : { schedule: {
                    repeats: true,
                    ...(options.schedule.every ? { every: options.schedule.every } : {}),
                    on: {
                      hour: options.schedule.on.hour,
                      minute: options.schedule.on.minute,
                      ...(typeof options.schedule.on.weekday === 'number' ? { weekday: options.schedule.on.weekday } : {})
                    }
                  } }
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
      await LocalNotifications.cancel({ notifications: [{ id }] });
      console.log('Notification cancelled:', id);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  async setupPushNotifications(): Promise<void> {
    try {
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
    schedule?: Date | RepeatSpec;
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

    // Best-effort repeat in web
    const now = new Date();
    const { hour, minute, weekday } = options.schedule.on;

    // Compute next trigger time
    const next = new Date();
    next.setSeconds(0, 0);
    next.setHours(hour, minute, 0, 0);

    if (typeof weekday === 'number') {
      // Weekly repeat: find next specified weekday (iOS weekday 1=Sun .. 7=Sat). On web we use 0=Sun..6=Sat
      const target = (weekday - 1 + 7) % 7; // convert 1-7 -> 0-6
      let addDays = (target - now.getDay() + 7) % 7;
      if (addDays === 0 && next <= now) addDays = 7;
      next.setDate(now.getDate() + addDays);
      const firstDelay = Math.max(0, next.getTime() - now.getTime());
      setTimeout(() => {
        new Notification(options.title, { body: options.body });
        // Subsequent fires every 7 days
        setInterval(() => {
          new Notification(options.title, { body: options.body });
        }, 7 * 24 * 60 * 60 * 1000);
      }, firstDelay);
    } else {
      // Daily repeat: schedule next fire, then 24h intervals
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
const createNotificationService = (): NotificationService => {
  const native = isNativePlatform();

  console.log('Service selection:', {
    isNative: native,
    platform: Capacitor.getPlatform()
  });

  if (native) {
    console.log('Using Capacitor notification service for native platform');
    return new CapacitorNotificationService();
  } else {
    console.log('Using web notification service for web/browser platform');
    return new WebNotificationService();
  }
};

// Create a singleton service instance
let serviceInstance: NotificationService | null = null;

const getNotificationService = (): NotificationService => {
  if (!serviceInstance) {
    serviceInstance = createNotificationService();
  }
  return serviceInstance;
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
    schedule?: Date | RepeatSpec;
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
