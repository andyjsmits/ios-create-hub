import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface PrayerCompletion {
  id: string;
  user_id: string;
  person_name: string;
  completion_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const usePrayerTracking = () => {
  const [prayerCompletions, setPrayerCompletions] = useState<PrayerCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadPrayerCompletions();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadPrayerCompletions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('prayer_completions')
        .select('*')
        .eq('user_id', user.id)
        .order('completion_date', { ascending: false });

      if (error) throw error;
      setPrayerCompletions(data || []);
    } catch (error) {
      console.error('Error loading prayer completions:', error);
      setPrayerCompletions([]);
      toast({
        title: 'Error',
        description: 'Failed to load prayer completions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePrayerCompletion = async (personName: string, date?: string, notes?: string) => {
    if (!user) return;

    const completionDate = date || new Date().toISOString().split('T')[0];
    
    // Check if already completed for this person on this date
    const existingCompletion = prayerCompletions.find(
      c => c.person_name === personName && c.completion_date === completionDate
    );

    try {
      if (existingCompletion) {
        // Remove completion
        const { error } = await supabase
          .from('prayer_completions')
          .delete()
          .eq('id', existingCompletion.id);

        if (error) throw error;
        setPrayerCompletions(prev => prev.filter(c => c.id !== existingCompletion.id));
      } else {
        // Add completion
        const { data, error } = await supabase
          .from('prayer_completions')
          .insert({
            user_id: user.id,
            person_name: personName,
            completion_date: completionDate,
            notes: notes || null
          })
          .select()
          .single();

        if (error) throw error;
        setPrayerCompletions(prev => [data, ...prev]);
      }
    } catch (error) {
      console.error('Error toggling prayer completion:', error);
      toast({
        title: 'Error',
        description: 'Failed to update prayer completion',
        variant: 'destructive'
      });
    }
  };

  const isPrayedForToday = (personName: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return prayerCompletions.some(
      c => c.person_name === personName && c.completion_date === today
    );
  };

  const getPrayerCompletionsForDate = (date: string): PrayerCompletion[] => {
    return prayerCompletions.filter(c => c.completion_date === date);
  };

  const getTodaysPrayerCompletions = (): PrayerCompletion[] => {
    const today = new Date().toISOString().split('T')[0];
    return getPrayerCompletionsForDate(today);
  };

  return {
    prayerCompletions,
    loading,
    togglePrayerCompletion,
    isPrayedForToday,
    getPrayerCompletionsForDate,
    getTodaysPrayerCompletions,
    loadPrayerCompletions
  };
};