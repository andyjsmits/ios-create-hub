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
  const localDateStr = (d: Date = new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  useEffect(() => {
    if (user) {
      // Add a small delay to ensure schema is ready
      setTimeout(() => loadPrayerCompletions(), 500);
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadPrayerCompletions = async () => {
    if (!user) return;

    try {
      console.log('Loading prayer completions...');
      const { data, error } = await supabase
        .from('prayer_completions')
        .select('*')
        .eq('user_id', user.id)
        .order('completion_date', { ascending: false });

      if (error) {
        console.error('Error loading prayer completions:', error);
        // Handle schema cache issue with retry
        if (error.code === 'PGRST205') {
          console.log('Schema cache error, retrying in 3 seconds...');
          toast({
            title: 'Initializing',
            description: 'Prayer tracking is loading, please wait...',
            variant: 'default'
          });
          setTimeout(() => loadPrayerCompletions(), 3000);
          return;
        }
        throw error;
      }

      console.log('Successfully loaded prayer completions:', data);
      setPrayerCompletions(data || []);

      // One-time backfill: if this is the owner account, ensure overall habit 'pray' completions
      try {
        if ((user as any).email === 'andyjsmits@gmail.com' && typeof window !== 'undefined') {
          const backfillKey = 'backfilled_pray_habit';
          if (!localStorage.getItem(backfillKey)) {
            const { data: habitRows } = await supabase
              .from('habit_completions')
              .select('completion_date')
              .eq('user_id', user.id)
              .eq('habit_type', 'pray');
            const haveDates = new Set((habitRows || []).map(r => r.completion_date));
            const needDates = Array.from(new Set((data || []).map(c => c.completion_date)))
              .filter(d => !haveDates.has(d));
            if (needDates.length > 0) {
              const rows = needDates.map(d => ({ user_id: user.id, habit_type: 'pray', completion_date: d }));
              await supabase.from('habit_completions').insert(rows);
            }
            try { localStorage.setItem(backfillKey, 'true'); } catch {}
          }
        }
      } catch (e) {
        console.warn('Backfill skipped/failed:', e);
      }
    } catch (error) {
      console.error('Error loading prayer completions:', error);
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

    const completionDate = date || localDateStr();
    
    // Check if already completed for this person on this date
    const existingCompletion = prayerCompletions.find(
      c => c.person_name === personName && c.completion_date === completionDate
    );

    try {
      if (existingCompletion) {
        // Remove completion
        console.log('Removing prayer completion for:', personName);
        const { error } = await supabase
          .from('prayer_completions')
          .delete()
          .eq('id', existingCompletion.id);

        if (error) {
          console.error('Error deleting prayer completion:', error);
          if (error.code === 'PGRST205') {
            toast({
              title: 'Schema Loading',
              description: 'Prayer tracking is initializing, please try again in a moment',
              variant: 'default'
            });
            setTimeout(() => loadPrayerCompletions(), 2000);
            return;
          }
          throw error;
        }

        console.log('Successfully deleted prayer completion');
        setPrayerCompletions(prev => prev.filter(c => c.id !== existingCompletion.id));
      } else {
        // Add completion
        console.log('Adding new prayer completion for:', personName);
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

        if (error) {
          console.error('Error adding prayer completion:', error);
          if (error.code === 'PGRST205') {
            toast({
              title: 'Schema Loading',
              description: 'Prayer tracking is initializing, please try again in a moment',
              variant: 'default'
            });
            setTimeout(() => loadPrayerCompletions(), 2000);
            return;
          }
          throw error;
        }

        console.log('Successfully added prayer completion:', data);
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
    const today = localDateStr();
    return prayerCompletions.some(
      c => c.person_name === personName && c.completion_date === today
    );
  };

  const getPrayerCompletionsForDate = (date: string): PrayerCompletion[] => {
    return prayerCompletions.filter(c => c.completion_date === date);
  };

  const getTodaysPrayerCompletions = (): PrayerCompletion[] => {
    const today = localDateStr();
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
  const localDateStr = (d: Date = new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
