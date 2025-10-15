import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { notificationService } from '@/services/notificationService';

export interface PrayerNotification {
  id: string;
  person_name: string;
  cadence: 'daily' | 'weekly';
  notification_time: string;
  notification_id: number;
  is_active: boolean;
  day_of_week?: number; // 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
}

export const usePrayerNotifications = () => {
  const [notifications, setNotifications] = useState<PrayerNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadNotifications();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      console.log('Loading notifications for user:', user.id);
      const { data, error } = await supabase
        .from('prayer_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        console.error('Supabase error loading notifications:', error);
        throw error;
      }
      
      console.log('Loaded notifications from database:', data);
      setNotifications((data || []) as PrayerNotification[]);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast({
        title: 'Error loading notifications',
        description: 'Failed to load prayer reminders from database',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const scheduleNotification = async (
    personName: string,
    cadence: 'daily' | 'weekly',
    notificationTime: string,
    selectedDays?: number[]
  ) => {
    if (!user) {
      console.error('No user available for scheduling notification');
      throw new Error('User not authenticated');
    }

    console.log('Scheduling notification for:', { personName, cadence, notificationTime, selectedDays });

    try {
      const [hours, minutes] = notificationTime.split(':').map(Number);
      const isDaily = cadence === 'daily' || !selectedDays || selectedDays.length === 7;

      if (isDaily) {
        // Single daily repeating notification per person
        const notificationId = Math.floor(Math.random() * 10000) + 5000; // offset to avoid collisions

        const { data, error } = await supabase
          .from('prayer_notifications')
          .insert({
            user_id: user.id,
            person_name: personName,
            cadence: 'daily',
            notification_time: notificationTime,
            notification_id: notificationId,
            is_active: true,
            day_of_week: null
          })
          .select()
          .single();

        if (error) {
          console.error('Database error (daily):', error);
          toast({
            title: 'Database Error',
            description: `Failed to save daily notification: ${error.message}`,
            variant: 'destructive'
          });
        } else {
          await notificationService.scheduleLocalNotification({
            title: 'PULSE Prayer Reminder',
            body: `Time to pray for ${personName}`,
            id: notificationId,
            schedule: { repeats: true, every: 'day', on: { hour: hours, minute: minutes } }
          });

          setNotifications(prev => [...prev, data as PrayerNotification]);
          toast({
            title: 'Daily reminder scheduled',
            description: `${personName}: every day at ${notificationTime}`
          });
        }
        return;
      }

      // Weekly scheduling for selected days
      const daysToSchedule: number[] = (selectedDays ?? []).slice();
      console.log('Scheduling notifications for days:', daysToSchedule.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]));

      const scheduledNotifications: PrayerNotification[] = [];
      for (const dayOfWeek of daysToSchedule) {
        const notificationId = Math.floor(Math.random() * 10000) + dayOfWeek;

        const { data, error } = await supabase
          .from('prayer_notifications')
          .insert({
            user_id: user.id,
            person_name: personName,
            cadence: 'weekly',
            notification_time: notificationTime,
            notification_id: notificationId,
            is_active: true,
            day_of_week: dayOfWeek
          })
          .select()
          .single();

        if (error) {
          console.error('Database error for day', dayOfWeek, error);
          toast({
            title: 'Database Error',
            description: `Failed to save notification for ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek]}: ${error.message}`,
            variant: 'destructive'
          });
          continue;
        }

        const iosWeekday = ((dayOfWeek + 1 - 1 + 7) % 7) + 1;
        await notificationService.scheduleLocalNotification({
          title: 'PULSE Prayer Reminder',
          body: `Time to pray for ${personName} (${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek]})`,
          id: notificationId,
          schedule: { repeats: true, every: 'week', on: { hour: hours, minute: minutes, weekday: iosWeekday } }
        });
        scheduledNotifications.push(data as PrayerNotification);
      }

      setNotifications(prev => [...prev, ...scheduledNotifications]);
      const dayNames = (selectedDays || []).map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]);
      toast({
        title: 'Weekly reminders scheduled',
        description: `${personName}: ${dayNames.join(', ')} at ${notificationTime}`
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule notification',
        variant: 'destructive'
      });
    }
  };

  const cancelNotification = async (notificationId: string) => {
    try {
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) return;

      // Update database to mark as inactive
      const { error } = await supabase
        .from('prayer_notifications')
        .update({ is_active: false })
        .eq('id', notificationId);

      if (error) throw error;

      // Cancel the actual notification
      await notificationService.cancelNotification(notification.notification_id);

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      toast({
        title: 'Notification cancelled',
        description: `Prayer reminder for ${notification.person_name} has been cancelled`
      });
    } catch (error) {
      console.error('Error cancelling notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel notification',
        variant: 'destructive'
      });
    }
  };

  const cancelAllNotificationsForPerson = async (personName: string) => {
    try {
      console.log('Canceling all notifications for person:', personName);
      // Find notifications for this person (using person_name and day_of_week columns)
      const personNotifications = notifications.filter(n => n.person_name === personName);
      console.log('Found notifications to cancel:', personNotifications.length);
      
      if (personNotifications.length === 0) {
        console.log('No notifications found for person:', personName);
        return;
      }
      
      // Update database to mark all as inactive
      const { error } = await supabase
        .from('prayer_notifications')
        .update({ is_active: false })
        .eq('person_name', personName)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Database error canceling notifications:', error);
        throw error;
      }

      console.log('Successfully updated database, canceling actual notifications...');

      // Cancel all actual notifications
      for (const notification of personNotifications) {
        console.log('Canceling notification ID:', notification.notification_id);
        await notificationService.cancelNotification(notification.notification_id);
      }

      setNotifications(prev => prev.filter(n => n.person_name !== personName));
      console.log('All notifications canceled for:', personName);
      
      toast({
        title: 'Notifications cancelled',
        description: `All prayer reminders for ${personName} have been cancelled`
      });
    } catch (error) {
      console.error('Error cancelling notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel notifications',
        variant: 'destructive'
      });
    }
  };

  return {
    notifications,
    loading,
    scheduleNotification,
    cancelNotification,
    cancelAllNotificationsForPerson,
    refreshNotifications: loadNotifications
  };
};
