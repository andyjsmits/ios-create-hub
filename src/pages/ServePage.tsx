import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, HandHeart, Heart, Users, Calendar, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { impactMedium, notifySuccess } from "@/lib/haptics";
import { useHabits } from "@/hooks/useHabits";
import { useHabitTracking } from "@/hooks/useHabitTracking";

const ServePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { habitData, loading, saveHabitData } = useHabits('serve');
  const { toggleHabitCompletion } = useHabitTracking();
  
  const [serviceNotes, setServiceNotes] = useState('');
  
  const weeklyGoal = habitData.weeklyGoal || 3;
  const trackingHistory = habitData.trackingHistory || [];
  const customHistory = habitData.customGoalHistory || [];
  
  // Get current week's completions
  const getCurrentWeekStart = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);
    return start;
  };
  
  const currentWeekCompletions = trackingHistory.filter(entry => {
    const entryDate = new Date(entry.date);
    const weekStart = getCurrentWeekStart();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return entryDate >= weekStart && entryDate <= weekEnd && entry.completed;
  }).length;


  const localDateStr = (d: Date = new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  const handleMarkCompleted = async () => {
    if (!serviceNotes.trim()) {
      toast({
        title: "Please add notes",
        description: "Share how you served someone today.",
        variant: "destructive"
      });
      return;
    }

    const today = localDateStr();
    const todayEntry = trackingHistory.find(entry => entry.date === today);
    
    if (todayEntry?.completed) {
      toast({
        title: "Already recorded",
        description: "You've already marked a service for today.",
        variant: "destructive"
      });
      return;
    }

    const newEntry = {
      date: today,
      completed: true,
      notes: serviceNotes.trim()
    };

    const updatedHistory = [...trackingHistory.filter(entry => entry.date !== today), newEntry]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    await saveHabitData({ trackingHistory: updatedHistory });
    try { await toggleHabitCompletion('serve'); } catch {}
    try {
      // weekly goal success haptic if reached/exceeded
      const newWeekly = currentWeekCompletions + 1;
      if (newWeekly >= weeklyGoal) { impactMedium(); notifySuccess(); }
    } catch {}
    setServiceNotes('');
    
    toast({
      title: "Service recorded",
      description: "Your act of service has been tracked!"
    });
  };

  const updateWeeklyGoal = async (newGoal: number) => {
    if (newGoal < 1) return;
    await saveHabitData({ weeklyGoal: newGoal });
  };

  // No custom goal in Serve; keep only weekly goal & record acts of service

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  const parseLocalYMD = (s: string) => {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden" style={{ background: 'var(--gradient-teal)' }}>
        <div
          className="relative container mx-auto px-6 text-center text-white"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)', paddingBottom: '16px' }}
        >
          <div className="flex items-center justify-start">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="text-white hover:bg-white/10 px-3 py-2"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to PULSE
            </Button>
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <HandHeart className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black mb-6 leading-tight">
              SERVE
            </h1>
            <p className="text-xl md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed">
              We go toward others in love
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-4xl" style={{ paddingBottom: 'calc(3rem + env(safe-area-inset-bottom))' }}>
        {/* About This Habit */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>About Serving Others</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Service is how we go toward others in love, following Christ's example of laying down his life 
              for others. Through practical acts of service, both big and small, we demonstrate God's love 
              and care for those around us.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We want to become the kinds of people who actively look for ways to serve others, whether through 
              planned volunteer opportunities or spontaneous acts of kindness. Service transforms both the giver 
              and receiver, creating opportunities for meaningful connection and gospel conversations.
            </p>
          </CardContent>
        </Card>

        {/* (Custom Serve Goal removed by request) */}

        {/* Weekly Goal */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Weekly Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="weekly-goal">People served per week</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateWeeklyGoal(weeklyGoal - 1)}
                      disabled={weeklyGoal <= 1}
                    >
                      -
                    </Button>
                    <Input
                      id="weekly-goal"
                      type="number"
                      value={weeklyGoal}
                      readOnly
                      className="w-16 text-center font-medium"
                      min="1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateWeeklyGoal(weeklyGoal + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div className="flex-1 w-full sm:w-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">This week's progress</span>
                    <span className="text-sm text-muted-foreground">
                      {currentWeekCompletions} / {weeklyGoal}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                      style={{ width: `${Math.min((currentWeekCompletions / weeklyGoal) * 100, 100)}%` }}
                    />
                  </div>
                  {currentWeekCompletions >= weeklyGoal && (
                    <p className="text-sm text-green-600 font-medium mt-2">🎉 Goal achieved this week!</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Service */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Record an Act of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="service-notes">
                How did you serve someone?
              </Label>
              <Textarea
                id="service-notes"
                placeholder="Describe your act of service - big or small, every gesture of love matters..."
                value={serviceNotes}
                onChange={(e) => setServiceNotes(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
            <Button onClick={handleMarkCompleted} className="w-full" size="lg">
              <CheckCircle className="h-4 w-4 mr-2" />
              Record Act of Service
            </Button>
          </CardContent>
        </Card>

        {/* Service History */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Service History</CardTitle>
          </CardHeader>
          <CardContent>
            {trackingHistory.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No service recorded yet. Start by serving someone today!
              </p>
            ) : (
              <div className="space-y-3">
                {trackingHistory
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 10)
                  .map((entry, index) => (
                  <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-3 h-3 rounded-full mt-2 ${entry.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div className="flex-1">
                        <p className="font-medium">{new Date(entry.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</p>
                        {entry.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{entry.notes}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant={entry.completed ? 'default' : 'secondary'}>
                      {entry.completed ? 'Completed' : 'Missed'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quote Box */}
        <Card className="mt-8 bg-muted/30">
          <CardContent className="py-8 px-6 text-center">
            <blockquote className="text-lg md:text-xl font-medium italic text-muted-foreground leading-relaxed mb-4">
              "Not all of us can do great things. But we can do small things with great love."
            </blockquote>
            <cite className="text-sm font-semibold text-primary">— Mother Teresa</cite>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServePage;
