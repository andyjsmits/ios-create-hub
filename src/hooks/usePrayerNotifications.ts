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
      const { data, error } = await supabase
        .from('prayer_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;
      setNotifications((data || []) as PrayerNotification[]);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const scheduleNotification = async (
    personName: string,
    cadence: 'daily' | 'weekly',
    notificationTime: string
  ) => {
    if (!user) return;

    try {
      const notificationId = Math.floor(Math.random() * 10000);
      
      // Save to database
      const { data, error } = await supabase
        .from('prayer_notifications')
        .insert({
          user_id: user.id,
          person_name: personName,
          cadence,
          notification_time: notificationTime,
          notification_id: notificationId,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      // Schedule with notification service
      const [hours, minutes] = notificationTime.split(':').map(Number);
      const now = new Date();
      const notificationDate = new Date();
      notificationDate.setHours(hours, minutes, 0, 0);

      // If the time has passed today, schedule for tomorrow (daily) or next week (weekly)
      if (notificationDate <= now) {
        if (cadence === 'daily') {
          notificationDate.setDate(notificationDate.getDate() + 1);
        } else {
          notificationDate.setDate(notificationDate.getDate() + 7);
        }
      }

      await notificationService.schedulePrayerReminder(personName, notificationDate);
      
      setNotifications(prev => [...prev, data as PrayerNotification]);
      
      toast({
        title: 'Notification scheduled',
        description: `Prayer reminder set for ${personName}`
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

  return {
    notifications,
    loading,
    scheduleNotification,
    cancelNotification,
    refreshNotifications: loadNotifications
  };
};