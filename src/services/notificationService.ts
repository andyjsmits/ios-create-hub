// Temporarily disable Capacitor imports to fix white screen issue
// import { LocalNotifications } from '@capacitor/local-notifications';
// import { PushNotifications } from '@capacitor/push-notifications';
// import { Capacitor } from '@capacitor/core';

export interface NotificationService {
  requestPermissions(): Promise<boolean>;
  scheduleLocalNotification(options: {
    title: string;
    body: string;
    id: number;
    schedule?: Date;
  }): Promise<void>;
  schedulePrayerReminder(personName: string, time: Date): Promise<void>;
  cancelNotification(id: number): Promise<void>;
  setupPushNotifications(): Promise<void>;
}

class CapacitorNotificationService implements NotificationService {
  async requestPermissions(): Promise<boolean> {
    console.log('Capacitor notifications temporarily disabled');
    return false;
  }

  async scheduleLocalNotification(options: {
    title: string;
    body: string;
    id: number;
    schedule?: Date;
  }): Promise<void> {
    console.log('Capacitor notifications temporarily disabled');
  }

  async schedulePrayerReminder(personName: string, time: Date): Promise<void> {
    console.log('Capacitor notifications temporarily disabled');
  }

  async cancelNotification(id: number): Promise<void> {
    console.log('Capacitor notifications temporarily disabled');
  }

  async setupPushNotifications(): Promise<void> {
    console.log('Capacitor notifications temporarily disabled');
  }
}

// Fallback service for web platform
class WebNotificationService implements NotificationService {
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
    schedule?: Date;
  }): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      if (options.schedule) {
        const delay = options.schedule.getTime() - Date.now();
        if (delay > 0) {
          setTimeout(() => {
            new Notification(options.title, { body: options.body });
          }, delay);
        }
      } else {
        new Notification(options.title, { body: options.body });
      }
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
// Temporarily using WebNotificationService for all platforms to fix white screen
export const notificationService: NotificationService = new WebNotificationService();