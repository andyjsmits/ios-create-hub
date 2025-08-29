import { useState } from 'react';
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
}

export const PrayerTracker = ({ 
  prayerList, 
  onToggleHabitCompletion, 
  isHabitCompletedToday 
}: PrayerTrackerProps) => {
  const [notes, setNotes] = useState('');
  const [selectedPeople, setSelectedPeople] = useState<Set<string>>(new Set());
  const { 
    isPrayedForToday, 
    togglePrayerCompletion, 
    getTodaysPrayerCompletions 
  } = usePrayerTracking();

  const todaysCompletions = getTodaysPrayerCompletions();
  const getDayOfWeek = (): number => new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Get people who should be prayed for today
  const getTodaysPrayerList = (): PrayerPerson[] => {
    const today = getDayOfWeek();
    return prayerList.filter(person => {
      if (person.cadence === 'daily') return true;
      if (person.cadence === 'weekly') {
        // If dayOfWeek is specified, check if it matches today
        // If not specified, default to all weekly prayers on Sunday (0)
        const prayerDay = person.dayOfWeek || 0;
        return today === prayerDay;
      }
      return false;
    });
  };

  const todaysPrayerList = getTodaysPrayerList();

  const handlePersonToggle = async (personName: string) => {
    await togglePrayerCompletion(personName, undefined, notes || undefined);
    
    // Update selected people for UI feedback
    const newSelected = new Set(selectedPeople);
    if (isPrayedForToday(personName)) {
      newSelected.delete(personName);
    } else {
      newSelected.add(personName);
    }
    setSelectedPeople(newSelected);
  };

  const handleMarkAllComplete = async () => {
    // Mark habit as complete
    if (!isHabitCompletedToday) {
      onToggleHabitCompletion();
    }

    // Mark all today's prayer list as prayed for
    for (const person of todaysPrayerList) {
      if (!isPrayedForToday(person.name)) {
        await togglePrayerCompletion(person.name, undefined, notes || undefined);
      }
    }
    
    setNotes('');
  };

  const allTodaysPrayersComplete = todaysPrayerList.length > 0 && 
    todaysPrayerList.every(person => isPrayedForToday(person.name));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Today's Prayer Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Habit Status */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
          <div className="flex items-center gap-3">
            {isHabitCompletedToday ? (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            ) : (
              <Circle className="h-6 w-6 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium">Prayer Habit</p>
              <p className="text-sm text-muted-foreground">
                {isHabitCompletedToday ? 'Completed today' : 'Mark as complete when you pray'}
              </p>
            </div>
          </div>
          <Button
            variant={isHabitCompletedToday ? "secondary" : "default"}
            onClick={onToggleHabitCompletion}
          >
            {isHabitCompletedToday ? 'Completed' : 'Mark Complete'}
          </Button>
        </div>

        {/* Today's Prayer List */}
        {todaysPrayerList.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">People to pray for today:</h4>
              <Badge variant="outline">
                {todaysPrayerList.filter(p => isPrayedForToday(p.name)).length}/{todaysPrayerList.length} completed
              </Badge>
            </div>
            
            <div className="space-y-2">
              {todaysPrayerList.map((person) => {
                const isPrayedFor = isPrayedForToday(person.name);
                return (
                  <div
                    key={person.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isPrayedFor ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium">{person.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={person.cadence === 'daily' ? 'default' : 'secondary'} className="text-xs">
                            {person.cadence}
                          </Badge>
                          {person.cadence === 'weekly' && (
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][person.dayOfWeek || 0]}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePersonToggle(person.name)}
                      className={`p-2 h-8 w-8 transition-all duration-200 ${
                        isPrayedFor 
                          ? 'text-green-600 hover:text-green-700' 
                          : 'text-muted-foreground hover:text-primary'
                      }`}
                    >
                      {isPrayedFor ? (
                        <CheckSquare className="h-5 w-5" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Prayer Notes */}
            <div className="space-y-2">
              <Label htmlFor="prayer-notes">Prayer notes (optional)</Label>
              <Textarea
                id="prayer-notes"
                placeholder="Add any prayer requests, insights, or notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            {/* Quick Complete All Button */}
            {!allTodaysPrayersComplete && (
              <Button
                onClick={handleMarkAllComplete}
                className="w-full"
                variant="default"
              >
                Mark all as prayed for today
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No prayers scheduled for today</p>
            <p className="text-sm">
              {prayerList.length === 0 
                ? "Add people to your prayer list to get started"
                : "Your weekly prayer schedule doesn't include today"
              }
            </p>
          </div>
        )}

        {/* Today's Completed Prayers Summary */}
        {todaysCompletions.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Completed prayers today:</h4>
            <div className="space-y-1">
              {todaysCompletions.map((completion) => (
                <div key={completion.id} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>{completion.person_name}</span>
                  {completion.notes && (
                    <span className="text-muted-foreground">- {completion.notes}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};