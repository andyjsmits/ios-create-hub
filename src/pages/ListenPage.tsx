import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Ear, Users, MessageSquare, Calendar, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useHabits } from "@/hooks/useHabits";

const ListenPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { habitData, loading, saveHabitData } = useHabits('listen');
  
  const [conversationNotes, setConversationNotes] = useState('');
  
  const weeklyGoal = habitData.weeklyGoal || 1;
  const trackingHistory = habitData.trackingHistory || [];
  
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

  const handleMarkCompleted = async () => {
    if (!conversationNotes.trim()) {
      toast({
        title: "Please add notes",
        description: "Share something interesting or remarkable about your conversation.",
        variant: "destructive"
      });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const todayEntry = trackingHistory.find(entry => entry.date === today);
    
    if (todayEntry?.completed) {
      toast({
        title: "Already recorded",
        description: "You've already marked a conversation for today.",
        variant: "destructive"
      });
      return;
    }

    const newEntry = {
      date: today,
      completed: true,
      notes: conversationNotes.trim()
    };

    const updatedHistory = [...trackingHistory.filter(entry => entry.date !== today), newEntry]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    await saveHabitData({ trackingHistory: updatedHistory });
    setConversationNotes('');
    
    toast({
      title: "Conversation recorded",
      description: "Your curious conversation has been tracked!"
    });
  };

  const updateWeeklyGoal = async (newGoal: number) => {
    if (newGoal < 1) return;
    await saveHabitData({ weeklyGoal: newGoal });
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden" style={{ background: 'var(--gradient-purple)' }}>
        <div className="relative container mx-auto px-6 py-16 text-center text-white">
          <Button 
            onClick={() => navigate('/')}
            variant="ghost" 
            className="absolute top-6 left-6 text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to PULSE
          </Button>
          
          <div className="mb-8">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Ear className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black mb-6 leading-tight">
              LISTEN
            </h1>
            <p className="text-xl md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed">
              Listening is a way of loving and pursuing people
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* About This Habit */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>About Curious Conversations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Have one "curious conversation" a week, where you are intentional to ask good questions 
              and listen more than you speak. You could do this together with someone in your community.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold">Ask Good Questions</h3>
                <p className="text-sm text-muted-foreground">Be intentionally curious</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold">Listen More</h3>
                <p className="text-sm text-muted-foreground">Speak less, hear more</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold">Weekly Practice</h3>
                <p className="text-sm text-muted-foreground">Consistent engagement</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Goal */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Weekly Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="weekly-goal">Curious conversations per week</Label>
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

        {/* Today's Conversation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Record Today's Conversation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="conversation-notes">
                What was interesting or remarkable about your conversation?
              </Label>
              <Textarea
                id="conversation-notes"
                placeholder="Share what you learned, discovered, or found meaningful..."
                value={conversationNotes}
                onChange={(e) => setConversationNotes(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
            <Button onClick={handleMarkCompleted} className="w-full" size="lg">
              <CheckCircle className="h-4 w-4 mr-2" />
              Record Conversation
            </Button>
          </CardContent>
        </Card>

        {/* Conversation History */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Conversation History</CardTitle>
          </CardHeader>
          <CardContent>
            {trackingHistory.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No conversations recorded yet. Start your first curious conversation!
              </p>
            ) : (
              <div className="space-y-3">
                {trackingHistory.slice(0, 10).map((entry, index) => (
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
              "Being heard is so close to being loved that for the average person, they are almost indistinguishable."
            </blockquote>
            <cite className="text-sm font-semibold text-primary">— David W. Augsburger</cite>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ListenPage;