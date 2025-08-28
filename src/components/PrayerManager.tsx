import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, MessageCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { notificationService } from "@/services/notificationService";
import { usePrayerNotifications } from "@/hooks/usePrayerNotifications";
import { PrayerPerson } from "@/hooks/useHabits";

interface PrayerManagerProps {
  prayerList: PrayerPerson[];
  onUpdatePrayerList: (list: PrayerPerson[]) => void;
  onClose: () => void;
}

export const PrayerManager = ({ prayerList, onUpdatePrayerList, onClose }: PrayerManagerProps) => {
  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonCadence, setNewPersonCadence] = useState<'daily' | 'weekly'>('daily');
  const [newPersonTime, setNewPersonTime] = useState("09:00");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { toast } = useToast();
  const { scheduleNotification, cancelNotification } = usePrayerNotifications();

  useEffect(() => {
    // Check and request notification permissions on component mount
    const setupNotifications = async () => {
      const hasPermission = await notificationService.requestPermissions();
      setNotificationsEnabled(hasPermission);
      
      if (hasPermission) {
        await notificationService.setupPushNotifications();
        toast({
          title: "Notifications enabled",
          description: "You'll receive prayer reminders based on your schedule."
        });
      } else {
        toast({
          title: "Notifications disabled", 
          description: "Enable notifications in your device settings to receive prayer reminders.",
          variant: "destructive"
        });
      }
    };

    setupNotifications();
  }, [toast]);

  const addPerson = async () => {
    if (!newPersonName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name to add to your prayer list.",
        variant: "destructive"
      });
      return;
    }

    if (prayerList.length >= 5) {
      toast({
        title: "Prayer list full",
        description: "You can add up to 5 people to your prayer list.",
        variant: "destructive"
      });
      return;
    }

    const newPerson: PrayerPerson = {
      id: Date.now().toString(),
      name: newPersonName.trim(),
      cadence: newPersonCadence,
      notificationTime: newPersonTime
    };

    onUpdatePrayerList([...prayerList, newPerson]);
    
    // Schedule notification if enabled
    if (notificationsEnabled && newPerson.notificationTime) {
      await scheduleNotification(newPerson.name, newPerson.cadence, newPerson.notificationTime);
    }
    
    setNewPersonName("");
    setNewPersonCadence('daily');
    setNewPersonTime("09:00");
    
    toast({
      title: "Person added",
      description: `${newPerson.name} has been added to your prayer list.`
    });
  };

  const removePerson = async (id: string) => {
    const person = prayerList.find(p => p.id === id);
    onUpdatePrayerList(prayerList.filter(p => p.id !== id));
    
    if (person) {
      // Note: We'll need to track notification IDs separately or find by person name
      // For now, we'll just remove from the prayer list
      toast({
        title: "Person removed",
        description: `${person.name} has been removed from your prayer list.`
      });
    }
  };

  const updateCadence = async (id: string, cadence: 'daily' | 'weekly') => {
    const updatedList = prayerList.map(person => 
      person.id === id ? { ...person, cadence } : person
    );
    onUpdatePrayerList(updatedList);
    
    // Reschedule notification with new cadence
    if (notificationsEnabled) {
      const person = updatedList.find(p => p.id === id);
      if (person && person.notificationTime) {
        await scheduleNotification(person.name, cadence, person.notificationTime);
      }
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center pb-4 border-b">
        <div className="inline-flex items-center gap-3 mb-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'var(--gradient-yellow)' }}
          >
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Prayer List</h2>
            <p className="text-muted-foreground">Manage who you're praying for</p>
          </div>
        </div>
      </div>

      {/* Add New Person */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Someone to Pray For
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="person-name">Name</Label>
              <Input
                id="person-name"
                placeholder="Enter their name"
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addPerson()}
              />
            </div>
            <div>
              <Label htmlFor="reminder-cadence">Reminder Frequency</Label>
              <Select value={newPersonCadence} onValueChange={(value: 'daily' | 'weekly') => setNewPersonCadence(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reminder-time">Reminder Time</Label>
              <Input
                id="reminder-time"
                type="time"
                value={newPersonTime}
                onChange={(e) => setNewPersonTime(e.target.value)}
              />
            </div>
          </div>
          
          {!notificationsEnabled && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-amber-800">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Enable notifications in your device settings to receive prayer reminders
                </span>
              </div>
            </div>
          )}
          
          <Button 
            onClick={addPerson} 
            className="w-full"
            disabled={prayerList.length >= 5}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add to Prayer List ({prayerList.length}/5)
          </Button>
        </CardContent>
      </Card>

      {/* Current Prayer List */}
      {prayerList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Prayer List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {prayerList.map((person) => (
                <div 
                  key={person.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <div>
                      <p className="font-medium text-foreground">{person.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={person.cadence === 'daily' ? 'default' : 'secondary'}>
                          {person.cadence === 'daily' ? 'Daily' : 'Weekly'} reminders
                        </Badge>
                        {person.notificationTime && (
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {person.notificationTime}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select 
                      value={person.cadence} 
                      onValueChange={(value: 'daily' | 'weekly') => updateCadence(person.id, value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePerson(person.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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