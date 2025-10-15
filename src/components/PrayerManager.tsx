import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Bell, BellOff, Clock, Check, X, Settings, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PrayerPerson } from "@/hooks/useHabits";
import { usePrayerNotifications } from "@/hooks/usePrayerNotifications";
import { notificationService } from "@/services/notificationService";

interface PrayerManagerProps {
  prayerList: PrayerPerson[];
  onUpdatePrayerList: (list: PrayerPerson[]) => void;
  onClose: () => void;
  onStartKickstart?: () => void;
}

const daysOfWeek = [
  { short: 'S', full: 'Sunday', value: 0 },
  { short: 'M', full: 'Monday', value: 1 },
  { short: 'T', full: 'Tuesday', value: 2 },
  { short: 'W', full: 'Wednesday', value: 3 },
  { short: 'T', full: 'Thursday', value: 4 },
  { short: 'F', full: 'Friday', value: 5 },
  { short: 'S', full: 'Saturday', value: 6 },
];

export const PrayerManager = ({ prayerList, onUpdatePrayerList, onClose, onStartKickstart }: PrayerManagerProps) => {
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonTime, setNewPersonTime] = useState('09:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [newPersonNotificationEnabled, setNewPersonNotificationEnabled] = useState(false);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);
  const [editingTimeForPerson, setEditingTimeForPerson] = useState<string | null>(null);
  const [editTimeValue, setEditTimeValue] = useState('');
  const [expandedPerson, setExpandedPerson] = useState<string | null>(null);
  const { toast } = useToast();
  const { scheduleNotification, cancelNotification, cancelAllNotificationsForPerson, notifications } = usePrayerNotifications();
  const [highlightIds, setHighlightIds] = useState<string[]>([]);
  const scrollRef = useState<HTMLElement | null>(null)[0] as any;
  const setScrollRef = (el: any) => {
    (PrayerManager as any)._scrollEl = el;
  };
  
  // Quick-add flow: Add 3/5/7 people with immediate naming and auto-assign days
  const [starterEditor, setStarterEditor] = useState<{ count: number } | null>(null);
  const [starterInputs, setStarterInputs] = useState<string[]>([]);

  const openStarterEditor = (count: number) => {
    setStarterEditor({ count });
    setStarterInputs(Array.from({ length: count }, () => ''));
  };

  const confirmStarterEditor = async () => {
    if (!starterEditor) return;
    const existingNames = new Set(prayerList.map(p => p.name.toLowerCase()));
    const names = starterInputs.map(n => n.trim()).filter(Boolean);
    if (names.length === 0) {
      toast({ title: 'No names entered', description: 'You can add names later using the form below.' });
      setStarterEditor(null);
      return;
    }
    const today = new Date().getDay(); // 0 (Sun) .. 6 (Sat)
    const newPeople: PrayerPerson[] = names
      .filter(n => !existingNames.has(n.toLowerCase()))
      .map((name, idx) => ({
        id: `${Date.now()}-quick-${idx}`,
        name,
        daysOfWeek: [((today + idx) % 7)], // auto-assign one per day, starting today
        notificationTime: '09:00'
      }));
    if (newPeople.length === 0) {
      toast({ title: 'No changes', description: 'These names are already on your list.' });
      setStarterEditor(null);
      return;
    }
    onUpdatePrayerList([...prayerList, ...newPeople]);
    // Attempt to schedule notifications for assigned days if permission is granted
    if (hasNotificationPermission) {
      try {
        for (const p of newPeople) {
          const cadence = p.daysOfWeek.length === 7 ? 'daily' : 'weekly';
          await scheduleNotification(p.name, cadence, p.notificationTime || '09:00', p.daysOfWeek);
        }
      } catch (e) {
        console.error('Quick add scheduling failed:', e);
      }
    }
    // Highlight and scroll to the newly added people
    const ids = newPeople.map(p => p.id);
    setHighlightIds(ids);
    setTimeout(() => {
      try {
        const root: HTMLElement | null = (PrayerManager as any)._scrollEl || null;
        const target = document.querySelector(`[data-person-id="${ids[0]}"]`);
        if (root && target && (target as any).scrollIntoView) {
          (target as any).scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } catch {}
    }, 150);
    // Remove highlight after a short delay
    setTimeout(() => setHighlightIds([]), 2500);
    toast({
      title: 'People added',
      description: hasNotificationPermission
        ? 'Assigned days set and reminders scheduled. You can edit any details.'
        : 'Assigned days set. Enable notifications above to schedule reminders.',
    });
    setStarterEditor(null);
  };

  const useExampleNames = () => {
    if (!starterEditor) return;
    const count = starterEditor.count;
    const examples = Array.from({ length: count }, (_, i) => `Friend ${i + 1}`);
    setStarterInputs(examples);
  };

  const handleClose = () => {
    toast({
      title: 'Saved',
      description: 'Your prayer list has been updated.',
      variant: 'default'
    });
    onClose();
  };

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  useEffect(() => {
    console.log('Notifications state updated:', notifications);
  }, [notifications]);

  const checkNotificationPermission = async () => {
    try {
      let permission = await notificationService.checkPermissions();
      console.log('Current notification permission status:', permission);
      
      if (!permission) {
        console.log('Requesting notification permissions...');
        permission = await notificationService.requestPermissions();
        console.log('Permission request result:', permission);
      }
      
      setHasNotificationPermission(permission);
      
      if (!permission) {
        toast({
          title: 'Notifications disabled',
          description: 'Enable notifications in your device settings to receive prayer reminders',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Error checking notification permissions:', error);
    }
  };

  const addPerson = async () => {
    if (!newPersonName.trim()) return;

    const newPerson: PrayerPerson = {
      id: Date.now().toString(),
      name: newPersonName,
      daysOfWeek: selectedDays,
      notificationTime: newPersonTime
    };

    const updatedList = [...prayerList, newPerson];
    onUpdatePrayerList(updatedList);

    if (newPersonNotificationEnabled && hasNotificationPermission) {
      const cadence = selectedDays.length === 7 ? 'daily' : 'weekly';
      await scheduleNotification(newPerson.name, cadence, newPersonTime, selectedDays);
      
      toast({
        title: 'Success',
        description: `Added ${newPerson.name} with prayer reminders enabled`,
        variant: 'default'
      });
    } else if (newPersonNotificationEnabled && !hasNotificationPermission) {
      toast({
        title: 'Person added',
        description: 'Enable notifications to receive prayer reminders',
        variant: 'default'
      });
    } else {
      toast({
        title: 'Person added',
        description: `${newPerson.name} has been added to your prayer list`,
        variant: 'default'
      });
    }

    setNewPersonName('');
    setSelectedDays([]);
    setNewPersonNotificationEnabled(false);
  };

  const removePerson = async (personToRemove: PrayerPerson) => {
    await cancelAllNotificationsForPerson(personToRemove.name);

    const updatedList = prayerList.filter(person => person.id !== personToRemove.id);
    onUpdatePrayerList(updatedList);

    toast({
      title: 'Person removed',
      description: `${personToRemove.name} has been removed from your prayer list`,
      variant: 'default'
    });
  };

  const updatePersonTime = async (personId: string, newTime: string) => {
    const updatedList = prayerList.map(person => {
      if (person.id === personId) {
        return { ...person, notificationTime: newTime };
      }
      return person;
    });
    onUpdatePrayerList(updatedList);
    
    const person = prayerList.find(p => p.id === personId);
    if (person && hasNotification(person.name)) {
      await cancelAllNotificationsForPerson(person.name);
      const cadence = person.daysOfWeek && person.daysOfWeek.length === 7 ? 'daily' : 'weekly';
      await scheduleNotification(person.name, cadence, newTime, person.daysOfWeek);
      
      toast({
        title: 'Time Updated',
        description: `Prayer reminder time updated to ${newTime}`,
        variant: 'default'
      });
    }
  };

  const startEditingTime = (personId: string, currentTime: string) => {
    setEditingTimeForPerson(personId);
    setEditTimeValue(currentTime);
  };

  const cancelEditingTime = () => {
    setEditingTimeForPerson(null);
    setEditTimeValue('');
  };

  const saveEditingTime = async () => {
    if (editingTimeForPerson && editTimeValue) {
      await updatePersonTime(editingTimeForPerson, editTimeValue);
      setEditingTimeForPerson(null);
      setEditTimeValue('');
    }
  };

  const toggleNotification = async (person: PrayerPerson) => {
    console.log('Toggle notification called for:', person.name, 'Current state:', hasNotification(person.name));
    
    if (!hasNotificationPermission) {
      console.log('Requesting notification permissions...');
      const permission = await notificationService.requestPermissions();
      console.log('Permission result:', permission);
      
      if (!permission) {
        toast({
          title: 'Permission needed',
          description: 'Please enable notifications to set prayer reminders',
          variant: 'destructive'
        });
        return;
      }
      setHasNotificationPermission(true);
    }

    try {
      if (hasNotification(person.name)) {
        console.log('Canceling notifications for:', person.name);
        await cancelAllNotificationsForPerson(person.name);
        toast({
          title: 'Notifications disabled',
          description: `Prayer reminders disabled for ${person.name}`,
          variant: 'default'
        });
      } else {
        console.log('Scheduling notifications for:', person.name);
        const cadence = person.daysOfWeek && person.daysOfWeek.length === 7 ? 'daily' : 'weekly';
        await scheduleNotification(person.name, cadence, person.notificationTime || '09:00', person.daysOfWeek);
        toast({
          title: 'Notifications enabled',
          description: `Prayer reminders enabled for ${person.name}`,
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Error toggling notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to toggle notifications. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const hasNotification = (personName: string) => {
    return notifications.some(n => n.person_name === personName);
  };

  const getNotificationDays = (personName: string) => {
    const personNotifications = notifications.filter(n => n.person_name === personName);
    
    const days: number[] = [];
    personNotifications.forEach(notification => {
      if (notification.day_of_week !== undefined && notification.day_of_week !== null) {
        days.push(notification.day_of_week);
      }
    });
    // Include locally assigned days (pre-scheduling) for immediate reflection in UI
    const local = prayerList.find(p => p.name === personName)?.daysOfWeek || [];
    for (const d of local) if (!days.includes(d)) days.push(d);
    
    return days.sort();
  };

  const updatePersonNotificationDays = async (personId: string, newDays: number[]) => {
    const person = prayerList.find(p => p.id === personId);
    if (!person) return;

    try {
      await cancelAllNotificationsForPerson(person.name);
      
      if (newDays.length === 0) {
        toast({
          title: 'Notifications disabled',
          description: `Prayer reminders disabled for ${person.name}`,
          variant: 'default'
        });
        return;
      }

      const cadence = newDays.length === 7 ? 'daily' : 'weekly';
      await scheduleNotification(person.name, cadence, person.notificationTime || '09:00', newDays);
      
      toast({
        title: 'Notification days updated',
        description: `Prayer reminders updated for ${person.name}`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Error updating notification days:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification days. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const togglePersonDay = (personId: string, day: number) => {
    const person = prayerList.find(p => p.id === personId);
    if (!person) return;

    const currentDays = getNotificationDays(person.name);
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort();

    updatePersonNotificationDays(personId, newDays);
  };

  return (
    <div className="flex flex-col h-full max-h-screen bg-background">
      {/* Sticky Header with iOS safe-area padding */}
      <div
        className="sticky top-0 z-20 border-b bg-background"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Prayer List Manager</h2>
              <p className="text-sm text-muted-foreground">Manage prayer reminders</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleClose} className="px-3">
              Done
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto" ref={setScrollRef}>
        <div className="p-4 space-y-4">
          
          {/* Starter Packs */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Add</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Quickly add names and we’ll auto-assign each to a day this week. You can edit details later.
              </p>
              <div className="flex flex-wrap gap-2">
                {[3,5,7].map(cnt => (
                  <Button key={cnt} variant="outline" size="sm" onClick={() => openStarterEditor(cnt)}>
                    Add {cnt} people
                  </Button>
                ))}
              </div>
              {onStartKickstart && (
                <div className="pt-2 space-y-1">
                  <Button
                    type="button"
                    onClick={onStartKickstart}
                    className="w-full"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Start 7‑Day Prayer Kickstart
                  </Button>
                  <p className="text-xs text-muted-foreground">We’ll prompt a small step each day for 7 days.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Starter Editor Dialog */}
          <Dialog open={!!starterEditor} onOpenChange={(v) => !v && setStarterEditor(null)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add {starterEditor?.count} people</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Quickly add names to get started. You can edit details later.</p>
                {Array.from({ length: starterEditor?.count || 0 }).map((_, i) => (
                  <div key={i}>
                    <Label className="text-xs">Name {i+1}</Label>
                    <Input
                      value={starterInputs[i] ?? ''}
                      onChange={(e) => {
                        const nxt = [...starterInputs];
                        nxt[i] = e.target.value;
                        setStarterInputs(nxt);
                      }}
                      placeholder={`Person ${i+1}`}
                    />
                  </div>
                ))}
                <div className="flex items-center justify-between">
                  <Button variant="ghost" onClick={() => setStarterEditor(null)}>Add Later</Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={useExampleNames}>Use Examples</Button>
                    <Button onClick={confirmStarterEditor}>Add</Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add New Person - Compact Form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Person
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Input
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  placeholder="Enter person's name"
                  className="text-base"
                />
              </div>

              {/* Days Selection - Compact */}
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Days to pray</Label>
                <div className="flex gap-1 justify-between">
                  {daysOfWeek.map((day) => (
                    <Button
                      key={day.value}
                      type="button"
                      variant={selectedDays.includes(day.value) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleDay(day.value)}
                      className="flex-1 text-xs h-8 min-w-0"
                    >
                      {day.short}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Time and Notifications - Inline */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Label className="text-sm text-muted-foreground">Reminder time</Label>
                  <Input
                    type="time"
                    value={newPersonTime}
                    onChange={(e) => setNewPersonTime(e.target.value)}
                    className="text-base"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    This time applies to all selected days for this person. Daily reminders use the same time every day.
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={newPersonNotificationEnabled}
                    onCheckedChange={setNewPersonNotificationEnabled}
                    disabled={!hasNotificationPermission}
                  />
                  <Label className="text-sm">Notify</Label>
                </div>
              </div>

              <Button 
                onClick={addPerson} 
                disabled={!newPersonName.trim()}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Person
              </Button>
            </CardContent>
          </Card>

          {/* Existing People - Clean Cards */}
          <div className="space-y-3">
            {prayerList.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No people in your prayer list yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Add someone above to get started</p>
                </CardContent>
              </Card>
            ) : (
              prayerList.map((person) => (
                <Card
                  key={person.id}
                  data-person-id={person.id}
                  className={`overflow-hidden ${highlightIds.includes(person.id) ? 'ring-2 ring-primary/70' : ''}`}
                >
                  <CardContent className="p-4">
                    {/* Person Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{person.name}</h3>
                        {/* Assigned Days Summary */}
                        <div className="mt-1">
                          {(() => {
                            const draftDays = (person.daysOfWeek && person.daysOfWeek.length > 0) ? person.daysOfWeek : [];
                            const liveDays = getNotificationDays(person.name);
                            const assigned = (draftDays.length ? draftDays : liveDays).sort();
                            if (assigned.length === 0) {
                              return <span className="text-xs text-amber-600">No day set</span>;
                            }
                            return (
                              <div className="flex flex-wrap gap-1">
                                {assigned.map((d) => {
                                  const meta = daysOfWeek.find(x => x.value === d);
                                  return (
                                    <span key={d} className="text-[10px] px-2 py-0.5 rounded-full border bg-background">
                                      {meta?.short}
                                    </span>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {/* Time Display/Edit */}
                          {editingTimeForPerson === person.id ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="time"
                                value={editTimeValue}
                                onChange={(e) => setEditTimeValue(e.target.value)}
                                className="w-24 h-7 text-xs"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={saveEditingTime}
                                className="h-7 w-7 p-0 text-green-600"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={cancelEditingTime}
                                className="h-7 w-7 p-0 text-red-600"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditingTime(person.id, person.notificationTime || '09:00')}
                              className="h-auto p-1 text-muted-foreground hover:text-foreground"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              <span className="text-xs">{person.notificationTime || '09:00'}</span>
                            </Button>
                          )}

                          {/* Notification Toggle */}
                          <div className="flex items-center gap-1">
                            {hasNotification(person.name) ? (
                              <Bell className="h-3 w-3 text-primary" />
                            ) : (
                              <BellOff className="h-3 w-3 text-muted-foreground" />
                            )}
                            <Switch
                              checked={hasNotification(person.name)}
                              onCheckedChange={() => toggleNotification(person)}
                              className="scale-75"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setExpandedPerson(expandedPerson === person.id ? null : person.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removePerson(person)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Settings */}
                    {expandedPerson === person.id && (
                      <>
                        <Separator className="my-3" />
                        <div>
                          <Label className="text-sm text-muted-foreground mb-2 block">Days to pray</Label>
                          <div className="flex gap-1 justify-between">
                            {daysOfWeek.map((day) => (
                              <Button
                                key={day.value}
                                type="button"
                                variant={getNotificationDays(person.name).includes(day.value) ? "default" : "outline"}
                                size="sm"
                                onClick={() => togglePersonDay(person.id, day.value)}
                                className="flex-1 text-xs h-8 min-w-0"
                              >
                                {day.short}
                              </Button>
                            ))}
                          </div>
                          {getNotificationDays(person.name).length > 0 && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Active on: {getNotificationDays(person.name).map(d => daysOfWeek[d].full).join(', ')}
                            </p>
                          )}
                          <p className="text-[11px] text-muted-foreground mt-2">
                            Reminder time applies to all selected days for this person.
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer with prominent close and iOS safe-area padding */}
      <div
        className="flex-shrink-0 border-t bg-background"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="p-4 space-y-3">
          <Button onClick={handleClose} className="w-full">Save and Close</Button>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              {!hasNotificationPermission && (
                <span className="text-orange-600">⚠ Enable notifications in settings to receive reminders</span>
              )}
              {hasNotificationPermission && (
                <span>✓ Notifications enabled</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
