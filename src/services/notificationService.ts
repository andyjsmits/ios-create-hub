import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

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
    if (!Capacitor.isNativePlatform()) {
      console.log('Not on native platform, skipping notification setup');
      return false;
    }

    try {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async scheduleLocalNotification(options: {
    title: string;
    body: string;
    id: number;
    schedule?: Date;
  }): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Not on native platform, skipping notification scheduling');
      return;
    }

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: options.title,
            body: options.body,
            id: options.id,
            schedule: options.schedule ? { at: options.schedule } : undefined,
            sound: undefined,
            attachments: undefined,
            actionTypeId: "",
            extra: null
          }
        ]
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  async schedulePrayerReminder(personName: string, time: Date): Promise<void> {
    const id = Math.floor(Math.random() * 10000);
    await this.scheduleLocalNotification({
      title: 'PULSE Prayer Reminder',
      body: `Time to pray for ${personName}`,
      id,
      schedule: time
    });
  }

  async cancelNotification(id: number): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      await LocalNotifications.cancel({
        notifications: [{ id }]
      });
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  async setupPushNotifications(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Not on native platform, skipping push notification setup');
      return;
    }

    try {
      // Request permission for push notifications
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        throw new Error('User denied permissions!');
      }

      // Register for push notifications
      await PushNotifications.register();

      // Listen for registration events
      PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token: ' + token.value);
        // TODO: Send token to your backend server
      });

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Error on registration: ' + JSON.stringify(error));
      });

      // Listen for push notifications
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received: ', notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push notification action performed', notification.actionId, notification.inputValue);
      });

    } catch (error) {
      console.error('Error setting up push notifications:', error);
    }
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
export const notificationService: NotificationService = Capacitor.isNativePlatform() 
  ? new CapacitorNotificationService() 
  : new WebNotificationService();