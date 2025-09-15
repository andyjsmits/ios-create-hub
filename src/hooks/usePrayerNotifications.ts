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
      const now = new Date();
      
      // Determine which days to schedule for
      let daysToSchedule: number[] = [];
      if (cadence === 'daily' || !selectedDays || selectedDays.length === 7) {
        // Schedule for all 7 days
        daysToSchedule = [0, 1, 2, 3, 4, 5, 6];
      } else {
        // Use the specific selected days
        daysToSchedule = selectedDays;
      }
      
      console.log('Scheduling notifications for days:', daysToSchedule.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]));

      // Schedule notifications for each selected day
      const scheduledNotifications: PrayerNotification[] = [];
      
      for (const dayOfWeek of daysToSchedule) {
        const notificationId = Math.floor(Math.random() * 10000) + dayOfWeek;
        
        // Calculate the next occurrence of this day at the specified time
        const notificationDate = new Date();
        notificationDate.setHours(hours, minutes, 0, 0);
        
        // Calculate days until target day
        const currentDay = now.getDay();
        let daysUntilTarget = (dayOfWeek - currentDay + 7) % 7;
        
        // If it's the same day but time has passed, schedule for next week
        if (daysUntilTarget === 0 && notificationDate <= now) {
          daysUntilTarget = 7;
        }
        
        notificationDate.setDate(now.getDate() + daysUntilTarget);
        
        console.log(`Scheduling for ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek]} at ${notificationTime}:`, notificationDate);

        // Save to database with day_of_week column
        const { data, error } = await supabase
          .from('prayer_notifications')
          .insert({
            user_id: user.id,
            person_name: personName,
            cadence,
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

        // Schedule with notification service
        await notificationService.schedulePrayerReminder(
          `${personName} (${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek]})`, 
          notificationDate
        );
        
        scheduledNotifications.push(data as PrayerNotification);
      }
      
      setNotifications(prev => [...prev, ...scheduledNotifications]);
      
      const dayNames = daysToSchedule.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]);
      toast({
        title: 'Notifications scheduled',
        description: `Prayer reminders set for ${personName} on ${dayNames.join(', ')}`
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