import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, MessageCircle, Plus, Trash2, ExternalLink, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useHabits, ResourceItem } from "@/hooks/useHabits";
import { useAuth } from "@/hooks/useAuth";
import { useHabitTracking } from "@/hooks/useHabitTracking";
import { usePrayerTracking } from "@/hooks/usePrayerTracking";
import { PrayerManager } from "@/components/PrayerManager";
import { notificationService } from "@/services/notificationService";
import { PrayerTracker } from "@/components/PrayerTracker";
const PrayPage = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  const {
    habitData,
    loading,
    updateResources,
    updatePrayerList,
    saveHabitData
  } = useHabits('pray');
  const {
    toggleHabitCompletion,
    isHabitCompletedToday
  } = useHabitTracking();
  const {
    prayerCompletions,
    loading: prayerLoading
  } = usePrayerTracking();
  const [showPrayerManager, setShowPrayerManager] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    url: '',
    description: ''
  });

  // Use data from database or fallback to defaults
  const resources = habitData.resources || [{
    id: '1',
    title: 'Prayer Guide',
    url: 'https://example.com',
    description: 'A comprehensive guide to prayer'
  }, {
    id: '2',
    title: 'Daily Prayer Schedule',
    url: 'https://example.com',
    description: 'Structured prayer times'
  }];
  // Group prayer completions by date to create prayer history
  const getPrayerHistory = () => {
    const historyMap = new Map();

    // Group prayers by date
    prayerCompletions.forEach(completion => {
      const date = completion.completion_date;
      if (!historyMap.has(date)) {
        historyMap.set(date, {
          date,
          completed: true,
          prayers: [],
          notes: []
        });
      }
      const entry = historyMap.get(date);
      entry.prayers.push(completion.person_name);
      if (completion.notes) {
        entry.notes.push(completion.notes);
      }
    });

    // Convert to array and sort by date (newest first)
    return Array.from(historyMap.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10); // Show last 10 entries
  };
  
  // Open Prayer Manager when directed from the guided tour
  useEffect(() => {
    try {
      if (localStorage.getItem('openPrayerManager') === 'true') {
        setShowPrayerManager(true);
        localStorage.removeItem('openPrayerManager');
      }
    } catch {}
  }, []);
  const prayerHistory = getPrayerHistory();
  const parseLocalYMD = (s: string) => {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };
  const addResource = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save resources.",
        variant: "destructive"
      });
      return;
    }
    if (!newResource.title || !newResource.url) {
      toast({
        title: "Missing information",
        description: "Please provide both title and URL for the resource.",
        variant: "destructive"
      });
      return;
    }
    const resource: ResourceItem = {
      id: Date.now().toString(),
      ...newResource
    };
    updateResources([...resources, resource]);
    setNewResource({
      title: '',
      url: '',
      description: ''
    });
    toast({
      title: "Resource added",
      description: "Prayer resource has been added successfully."
    });
  };
  const removeResource = (id: string) => {
    updateResources(resources.filter(r => r.id !== id));
    toast({
      title: "Resource removed",
      description: "Prayer resource has been removed."
    });
  };

  const handleToggleHabitCompletion = useCallback(() => {
    console.log('PrayPage: toggleHabitCompletion called');
    toggleHabitCompletion('pray');
  }, [toggleHabitCompletion]);

  if (loading || prayerLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading prayer data...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden" style={{
      background: 'var(--gradient-yellow)'
    }}>
        <div
          className="relative container mx-auto px-6 text-center text-white"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)', paddingBottom: '16px' }}
        >
          <div className="flex items-center justify-start">
            <Button onClick={() => navigate('/')} variant="ghost" className="text-white hover:bg-white/10 px-3 py-2">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to PULSE
            </Button>
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black mb-6 leading-tight">
              PRAY
            </h1>
            <p className="text-xl md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed">
              We seek God first, partnering with him in prayer
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-4xl" style={{ paddingBottom: 'calc(3rem + env(safe-area-inset-bottom))' }}>
        {/* Prayer Activity Tracker */}
        <PrayerTracker prayerList={habitData.prayerList || []} onToggleHabitCompletion={handleToggleHabitCompletion} isHabitCompletedToday={isHabitCompletedToday('pray')} onOpenPrayerManager={() => setShowPrayerManager(true)} />

        {/* About This Habit */}
        <Card className="my-8">
          <CardHeader>
            <CardTitle>About Prayer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">Prayer is our primary way of seeking God first in all things. 
By prioritizing praying for others, we align our hearts with God's heart for people. Commit to praying each week or day for a few friends. If you're looking for suggestions how to pray, check out the resources below.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="flex items-center justify-center gap-2 mb-2">
                  <button 
                    onClick={() => setShowPrayerManager(true)}
                    className="font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Manage My Prayer List
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {habitData.prayerList && habitData.prayerList.length > 0 ? habitData.prayerList.map(person => person.name).join(', ') : "Click + to add people to pray for"}
                </p>
              </div>
              
            </div>
          </CardContent>
        </Card>

        {/* Resources Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>P2C Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <a 
              href="https://p2cstudents.com/articles/?q=prayer" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
            >
              Read some great resources on prayer
              <ExternalLink className="h-4 w-4" />
            </a>
          </CardContent>
        </Card>

        {/* Prayer History */}
        <Card>
          <CardHeader>
            <CardTitle>Prayer History</CardTitle>
          </CardHeader>
          <CardContent>
            {prayerHistory.length === 0 ? <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No prayer history yet. Start praying for people to see your history here!</p>
              </div> : <div className="space-y-3">
                {prayerHistory.map((entry, index) => <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <div>
                        <p className="font-medium">
                          {parseLocalYMD(entry.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Prayed for: {entry.prayers.join(', ')}
                        </p>
                        {entry.notes.length > 0 && <p className="text-sm text-muted-foreground mt-1">
                            Notes: {entry.notes.join('; ')}
                          </p>}
                      </div>
                    </div>
                    <Badge variant="default">
                      Completed
                    </Badge>
                  </div>)}
              </div>}
          </CardContent>
        </Card>
      </div>

      {/* Prayer Manager Dialog */}
      <Dialog open={showPrayerManager} onOpenChange={setShowPrayerManager}>
        <DialogContent className="sm:max-w-2xl w-full h-full sm:h-[90vh] max-h-screen p-0 gap-0 overflow-hidden">
          <PrayerManager
            prayerList={habitData.prayerList || []}
            onUpdatePrayerList={updatePrayerList}
            onClose={() => setShowPrayerManager(false)}
            onStartKickstart={() => {
              const localDateStr = (d: Date = new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
              const todayIso = localDateStr();
              saveHabitData({ kickstart: { startedAt: todayIso, daysCompleted: [] } as any });
              setShowPrayerManager(false);
              toast({ title: 'Kickstart started', description: 'We’ll prompt a small step each day for 7 days.' });
              try {
                const t = (localStorage.getItem('dailyReminderTime') || '09:00');
                const [h, m] = t.split(':').map(Number);
                notificationService.scheduleLocalNotification({
                  title: 'PULSE Kickstart',
                  body: 'Today’s prayer step is ready.',
                  id: 998,
                  schedule: { repeats: true, on: { hour: h || 9, minute: m || 0 } }
                });
              } catch {}
            }}
          />
        </DialogContent>
      </Dialog>
    </div>;
};
export default PrayPage;
