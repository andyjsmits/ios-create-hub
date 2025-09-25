import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { impactLight, notifySuccess } from '@/lib/haptics';

export interface HabitCompletion {
  id: string;
  user_id: string;
  habit_type: string;
  completion_date: string;
  created_at: string;
  updated_at: string;
}

export const useHabitTracking = () => {
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadCompletions();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadCompletions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id)
        .order('completion_date', { ascending: false });

      if (error) throw error;
      setCompletions(data || []);
    } catch (error) {
      console.error('Error loading habit completions:', error);
      setCompletions([]);
      toast({
        title: 'Error',
        description: 'Failed to load habit completions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleHabitCompletion = async (habitType: 'pray' | 'union' | 'listen' | 'serve' | 'echo', date?: string) => {
    if (!user) return;

    const completionDate = date || localDateStr();
    
    // Check if already completed today
    const existingCompletion = completions.find(
      c => c.habit_type === habitType && c.completion_date === completionDate
    );

    try {
      if (existingCompletion) {
        // Remove completion
        const { error } = await supabase
          .from('habit_completions')
          .delete()
          .eq('id', existingCompletion.id);

        if (error) throw error;

        setCompletions(prev => prev.filter(c => c.id !== existingCompletion.id));
      } else {
        // Add completion
        const { data, error } = await supabase
          .from('habit_completions')
          .insert({
            user_id: user.id,
            habit_type: habitType,
            completion_date: completionDate
          })
          .select()
          .single();

        if (error) throw error;

        setCompletions(prev => [data, ...prev]);
      }
      try { impactLight(); if (!existingCompletion) notifySuccess(); } catch {}
    } catch (error) {
      console.error('Error toggling habit completion:', error);
      toast({
        title: 'Error',
        description: 'Failed to update habit completion',
        variant: 'destructive'
      });
    }
  };

  const isHabitCompletedToday = (habitType: 'pray' | 'union' | 'listen' | 'serve' | 'echo'): boolean => {
    const today = localDateStr();
    return completions.some(
      c => c.habit_type === habitType && c.completion_date === today
    );
  };

  const calculateStreak = (): number => {
    if (completions.length === 0) return 0;

    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);

    // Get unique dates where any habit was completed
    const completionDates = Array.from(new Set(
      completions.map(c => c.completion_date)
    )).sort().reverse();

    for (const dateStr of completionDates) {
      const completionDate = new Date(dateStr);
      const daysDiff = Math.floor((currentDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
        currentDate = new Date(completionDate);
      } else {
        break;
      }
    }

    return streak;
  };

  const calculateWeeklyProgress = (): { completed: boolean; habitsCounted: Set<string> } => {
    // Get Monday of current week
    const today = new Date();
    const mondayOfWeek = new Date(today);
    mondayOfWeek.setDate(today.getDate() - today.getDay() + 1);
    const mondayStr = localDateStr(mondayOfWeek);
    
    // Get Sunday of current week
    const sundayOfWeek = new Date(mondayOfWeek);
    sundayOfWeek.setDate(mondayOfWeek.getDate() + 6);
    const sundayStr = localDateStr(sundayOfWeek);

    // Get all completions this week
    const thisWeekCompletions = completions.filter(
      c => c.completion_date >= mondayStr && c.completion_date <= sundayStr
    );

    // Get unique habit types completed this week
    const habitsCounted = new Set(thisWeekCompletions.map(c => c.habit_type));
    
    // Check if all 5 habits have been completed this week
    const allHabits = ['pray', 'union', 'listen', 'serve', 'echo'];
    const completed = allHabits.every(habit => habitsCounted.has(habit));

    return { completed, habitsCounted };
  };

  return {
    completions,
    loading,
    toggleHabitCompletion,
    isHabitCompletedToday,
    calculateStreak,
    calculateWeeklyProgress,
    loadCompletions
  };
};
  // Returns YYYY-MM-DD for the user's local timezone
  const localDateStr = (d: Date = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
