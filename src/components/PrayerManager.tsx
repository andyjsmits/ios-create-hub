import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, MessageCircle, Bell, BellOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PrayerPerson } from "@/hooks/useHabits";
import { usePrayerNotifications } from "@/hooks/usePrayerNotifications";
import { notificationService } from "@/services/notificationService";

interface PrayerManagerProps {
  prayerList: PrayerPerson[];
  onUpdatePrayerList: (list: PrayerPerson[]) => void;
  onClose: () => void;
}

export const PrayerManager = ({ prayerList, onUpdatePrayerList, onClose }: PrayerManagerProps) => {
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonTime, setNewPersonTime] = useState('09:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);
  const { toast } = useToast();
  const { scheduleNotification, cancelNotification, notifications } = usePrayerNotifications();

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    try {
      const permission = await notificationService.requestPermissions();
      setHasNotificationPermission(permission);
    } catch (error) {
      console.error('Error checking notification permission:', error);
      setHasNotificationPermission(false);
    }
  };

  const daysOfWeek = [
    { value: 0, label: 'Sunday', short: 'Sun' },
    { value: 1, label: 'Monday', short: 'Mon' },
    { value: 2, label: 'Tuesday', short: 'Tue' },
    { value: 3, label: 'Wednesday', short: 'Wed' },
    { value: 4, label: 'Thursday', short: 'Thu' },
    { value: 5, label: 'Friday', short: 'Fri' },
    { value: 6, label: 'Saturday', short: 'Sat' }
  ];

  const addPerson = async () => {
    if (!newPersonName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a name',
        variant: 'destructive'
      });
      return;
    }

    if (selectedDays.length === 0) {
      toast({
        title: 'Error', 
        description: 'Please select at least one day to pray',
        variant: 'destructive'
      });
      return;
    }

    const newPerson: PrayerPerson = {
      id: Date.now().toString(),
      name: newPersonName.trim(),
      daysOfWeek: selectedDays,
      notificationTime: newPersonTime
    };

    const updatedList = [...prayerList, newPerson];
    onUpdatePrayerList(updatedList);

    // Reset form
    setNewPersonName('');
    setSelectedDays([]);
    setNewPersonTime('09:00');

    toast({
      title: 'Success',
      description: `Added ${newPerson.name} to your prayer list`,
      variant: 'default'
    });
  };

  const removePerson = async (personToRemove: PrayerPerson) => {
    // Cancel any existing notifications for this person
    const existingNotification = notifications.find(n => n.person_name === personToRemove.name);
    if (existingNotification) {
      await cancelNotification(existingNotification.id);
    }

    const updatedList = prayerList.filter(person => person.id !== personToRemove.id);
    onUpdatePrayerList(updatedList);

    toast({
      title: 'Removed',
      description: `Removed ${personToRemove.name} from your prayer list`,
      variant: 'default'
    });
  };

  const updatePersonDays = async (personId: string, newDays: number[]) => {
    const updatedList = prayerList.map(person => {
      if (person.id === personId) {
        return { ...person, daysOfWeek: newDays };
      }
      return person;
    });
    onUpdatePrayerList(updatedList);
  };

  const toggleNotification = async (person: PrayerPerson) => {
    if (!hasNotificationPermission) {
      const permission = await notificationService.requestPermissions();
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

    const existingNotification = notifications.find(n => n.person_name === person.name);
    
    if (existingNotification) {
      // Cancel existing notification
      await cancelNotification(existingNotification.id);
    } else {
      // Schedule new notification - determine cadence based on days
      const cadence = person.daysOfWeek && person.daysOfWeek.length === 7 ? 'daily' : 'weekly';
      await scheduleNotification(person.name, cadence, person.notificationTime || '09:00');
    }
  };

  const hasNotification = (personName: string) => {
    return notifications.some(n => n.person_name === personName);
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

    // Ensure daysOfWeek exists and is an array
    const currentDays = person.daysOfWeek || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort();

    updatePersonDays(personId, newDays);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Prayer List Manager</h2>
        <p className="text-muted-foreground">Add people to pray for and select which days of the week to pray for them</p>
      </div>

      {/* Add New Person Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Person</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              placeholder="Enter person's name"
            />
          </div>

          <div>
            <Label>Days to pray</Label>
            <div className="grid grid-cols-7 gap-2 mt-2">
              {daysOfWeek.map((day) => (
                <Button
                  key={day.value}
                  type="button"
                  variant={selectedDays.includes(day.value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleDay(day.value)}
                  className="text-xs"
                >
                  {day.short}
                </Button>
              ))}
            </div>
            {selectedDays.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Selected: {selectedDays.map(day => daysOfWeek[day].label).join(', ')}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="time">Reminder time</Label>
            <Input
              id="time"
              type="time"
              value={newPersonTime}
              onChange={(e) => setNewPersonTime(e.target.value)}
            />
          </div>

          {!hasNotificationPermission && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <BellOff className="h-4 w-4 text-amber-600" />
              <div className="text-sm">
                <p className="text-amber-800 font-medium">Notifications disabled</p>
                <p className="text-amber-700">Enable notifications to get prayer reminders</p>
              </div>
            </div>
          )}

          <Button onClick={addPerson} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add to Prayer List
          </Button>
        </CardContent>
      </Card>

      {/* Current Prayer List */}
      {prayerList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Prayer List ({prayerList.length} people)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prayerList.map((person) => (
                <div key={person.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{person.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {person.notificationTime}
                        </Badge>
                        <div className="flex items-center gap-2">
                          {hasNotification(person.name) ? (
                            <Bell className="h-3 w-3 text-primary" />
                          ) : (
                            <BellOff className="h-3 w-3 text-muted-foreground" />
                          )}
                          <Switch
                            checked={hasNotification(person.name)}
                            onCheckedChange={() => toggleNotification(person)}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">Days to pray:</Label>
                      <div className="grid grid-cols-7 gap-1">
                        {daysOfWeek.map((day) => (
                          <Button
                            key={day.value}
                            type="button"
                            variant={(person.daysOfWeek || []).includes(day.value) ? "default" : "outline"}
                            size="sm"
                            onClick={() => togglePersonDay(person.id, day.value)}
                            className="text-xs p-1 h-8"
                          >
                            {day.short}
                          </Button>
                        ))}
                      </div>
                       {(person.daysOfWeek || []).length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {(person.daysOfWeek || []).map(day => daysOfWeek[day].label).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePerson(person)}
                    className="text-destructive hover:text-destructive ml-4"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Close Button */}
      <div className="flex justify-end">
        <Button onClick={onClose} variant="outline">
          Done
        </Button>
      </div>
    </div>
  );
};