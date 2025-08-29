import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface HabitData {
  prayerList?: PrayerPerson[];
  resources?: ResourceItem[];
  trackingHistory?: TrackingEntry[];
  weeklyGoal?: number;
}

export interface PrayerPerson {
  id: string;
  name: string;
  daysOfWeek: number[]; // Array of days: 0 = Sunday, 1 = Monday, etc.
  notificationTime?: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  url: string;
  description?: string;
}

export interface TrackingEntry {
  date: string;
  completed: boolean;
  notes?: string;
}

export const useHabits = (habitType: 'pray' | 'union' | 'listen' | 'serve' | 'echo') => {
  const [habitData, setHabitData] = useState<HabitData>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadHabitData();
    } else {
      setLoading(false);
    }
  }, [user, habitType]);

  const loadHabitData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habits')
        .select('data')
        .eq('user_id', user.id)
        .eq('habit_type', habitType)
        .maybeSingle();

      if (error) throw error;

      setHabitData((data?.data as HabitData) || {});
    } catch (error) {
      console.error('Error loading habit data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load habit data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveHabitData = async (newData: Partial<HabitData>) => {
    if (!user) return;

    const updatedData = { ...habitData, ...newData };
    setHabitData(updatedData);

    try {
      const { error } = await supabase
        .from('habits')
        .upsert({
          user_id: user.id,
          habit_type: habitType,
          data: updatedData as any
        }, {
          onConflict: 'user_id,habit_type'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving habit data:', error);
      toast({
        title: 'Error',
        description: 'Failed to save habit data',
        variant: 'destructive'
      });
      // Revert optimistic update
      setHabitData(habitData);
    }
  };

  const updatePrayerList = (prayerList: PrayerPerson[]) => {
    saveHabitData({ prayerList });
  };

  const updateResources = (resources: ResourceItem[]) => {
    saveHabitData({ resources });
  };

  const updateTrackingHistory = (trackingHistory: TrackingEntry[]) => {
    saveHabitData({ trackingHistory });
  };

  return {
    habitData,
    loading,
    updatePrayerList,
    updateResources,
    updateTrackingHistory,
    saveHabitData
  };
};