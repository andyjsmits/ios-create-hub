import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Circle, Calendar, MessageCircle, Square, CheckSquare } from 'lucide-react';
import { usePrayerTracking } from '@/hooks/usePrayerTracking';
import { useHabitTracking } from '@/hooks/useHabitTracking';
import { PrayerPerson } from '@/hooks/useHabits';
interface PrayerTrackerProps {
  prayerList: PrayerPerson[];
  onToggleHabitCompletion: () => void;
  isHabitCompletedToday: boolean;
  onOpenPrayerManager?: () => void;
}
export const PrayerTracker = ({
  prayerList,
  onToggleHabitCompletion,
  isHabitCompletedToday,
  onOpenPrayerManager
}: PrayerTrackerProps) => {
  const [notes, setNotes] = useState('');
  const [selectedPeople, setSelectedPeople] = useState<Set<string>>(new Set());
  const toggleHabitRef = useRef(onToggleHabitCompletion);
  
  // Keep the ref updated
  useEffect(() => {
    toggleHabitRef.current = onToggleHabitCompletion;
  }, [onToggleHabitCompletion]);
  const {
    isPrayedForToday,
    togglePrayerCompletion,
    getTodaysPrayerCompletions,
    prayerCompletions
  } = usePrayerTracking();
  const todaysCompletions = useMemo(() => getTodaysPrayerCompletions(), [prayerCompletions]);
  const anyCompletedToday = todaysCompletions.length > 0;

  // Get today's prayer list based on selected days of week
  const getTodaysPrayerList = () => {
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    return prayerList.filter(person => {
      // Handle backward compatibility with old data format
      if (person.daysOfWeek && Array.isArray(person.daysOfWeek)) {
        // New format: use daysOfWeek array
        return person.daysOfWeek.includes(today);
      } else if ((person as any).cadence) {
        // Old format: convert from cadence/dayOfWeek to daysOfWeek logic
        const oldPerson = person as any;
        if (oldPerson.cadence === 'daily') return true;
        if (oldPerson.cadence === 'weekly') return oldPerson.dayOfWeek === today;
      }
      // Fallback: don't show if data is malformed
      return false;
    });
  };
  const todaysPrayerList = useMemo(() => getTodaysPrayerList(), [prayerList, prayerCompletions]);
  const allTodaysPrayersComplete = todaysPrayerList.length > 0 && todaysPrayerList.every(person => isPrayedForToday(person.name));

  // Auto-sync overall habit completion with individual prayer completions
  useEffect(() => {
    console.log('Prayer tracker effect running:', {
      todaysPrayerListLength: todaysPrayerList.length,
      allTodaysPrayersComplete,
      anyCompletedToday,
      isHabitCompletedToday,
      prayerCompletionsCount: prayerCompletions.length
    });

    // Treat ANY prayer completion today as fulfilling the daily habit.
    if (anyCompletedToday && !isHabitCompletedToday) {
      console.log('At least one prayer completed today; marking habit complete');
      toggleHabitRef.current();
      return;
    }
    if (!anyCompletedToday && isHabitCompletedToday) {
      console.log('No prayers completed today; unmarking habit completion');
      toggleHabitRef.current();
      return;
    }
  }, [
    anyCompletedToday,
    isHabitCompletedToday, 
    prayerCompletions.length, // Add this to trigger on prayer completion changes
    // Remove onToggleHabitCompletion from dependencies to avoid instability
  ]);

  const handlePersonToggle = async (personName: string) => {
    await togglePrayerCompletion(personName, undefined, notes);
    setSelectedPeople(prev => {
      const newSet = new Set(prev);
      if (newSet.has(personName)) {
        newSet.delete(personName);
      } else {
        newSet.add(personName);
      }
      return newSet;
    });
  };
  const handleMarkAllComplete = async () => {
    for (const person of todaysPrayerList) {
      if (!isPrayedForToday(person.name)) {
        await togglePrayerCompletion(person.name, undefined, notes);
      }
    }
    // The useEffect will handle the overall habit completion automatically
  };
  return <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Prayer Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Prayer Habit Status */}
        

        {/* Today's Prayer List */}
        {todaysPrayerList.length > 0 ? <div className="space-y-4">
            <h4 className="font-medium">Pray for:</h4>
            <div className="space-y-3">
              {todaysPrayerList.map(person => <div key={person.id} className="flex items-center justify-between p-3 border rounded-lg bg-background">
                  <div className="flex items-center gap-3">
                    <button onClick={() => handlePersonToggle(person.name)} className={`w-8 h-8 rounded-md flex items-center justify-center transition-all hover:scale-105 ${isPrayedForToday(person.name) ? 'bg-primary text-primary-foreground' : 'border-2 border-muted-foreground/20 hover:border-primary/40'}`}>
                      {isPrayedForToday(person.name) ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                    </button>
                    <span className={`font-medium ${isPrayedForToday(person.name) ? 'line-through text-muted-foreground' : ''}`}>
                      {person.name}
                    </span>
                  </div>
                </div>)}
            </div>

            {/* Prayer Notes */}
            <div className="space-y-2">
              <Label htmlFor="prayer-notes">Prayer Notes (Optional)</Label>
              <Textarea id="prayer-notes" placeholder="Add any prayer notes or reflections..." value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
            </div>

            {/* Mark All Complete Button */}
            {!allTodaysPrayersComplete && <Button onClick={handleMarkAllComplete} className="w-full" variant="default">
                Mark all as prayed for today
              </Button>}
          </div> : <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No prayers scheduled for today</p>
            <button onClick={onOpenPrayerManager} className="text-sm text-primary hover:text-primary/80 hover:underline cursor-pointer">
              Add a person to pray for today
            </button>
          </div>}

        {/* Today's Prayer Completions Summary */}
        {todaysCompletions.length > 0 && <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Completed Prayers Today</h4>
            <div className="space-y-2">
              {todaysCompletions.map(completion => <div key={completion.id} className="flex items-center justify-between p-2 bg-green-50 rounded border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">{completion.person_name}</span>
                  </div>
                  {completion.notes && <span className="text-xs text-green-600 italic">{completion.notes}</span>}
                </div>)}
            </div>
          </div>}
      </CardContent>
    </Card>;
};
