import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Book, Check, CheckCircle, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useHabits } from "@/hooks/useHabits";
import { useHabitTracking } from "@/hooks/useHabitTracking";
import { useAuth } from "@/hooks/useAuth";

// Gospel of Luke reading plan
const lukeReadings = [
  { day: 1, title: "Introduction & Prophecy of John the Baptist", passage: "Luke 1:1-25" },
  { day: 2, title: "The Birth of Jesus Foretold", passage: "Luke 1:26-56" },
  { day: 3, title: "The Birth of John the Baptist", passage: "Luke 1:57-80" },
  { day: 4, title: "The Birth of Jesus", passage: "Luke 2:1-21" },
  { day: 5, title: "Simeon and Anna's Prophecies", passage: "Luke 2:22-40" },
  { day: 6, title: "The Boy Jesus in the Temple", passage: "Luke 2:41-52" },
  { day: 7, title: "John the Baptist Prepares the Way", passage: "Luke 3:1-20" },
  { day: 8, title: "Baptism & Genealogy of Jesus", passage: "Luke 3:21-38" },
  { day: 9, title: "Temptation in the Wilderness", passage: "Luke 4:1-13" },
  { day: 10, title: "Jesus' Mission Statement & Rejection at Nazareth", passage: "Luke 4:14-30" },
  { day: 11, title: "Jesus Casts Out Demons", passage: "Luke 4:31-37" },
  { day: 12, title: "Jesus Heals Many and Declares His Mission", passage: "Luke 4:38-44" },
  { day: 13, title: "Calling the First Disciples", passage: "Luke 5:1-11" },
  { day: 14, title: "Jesus Heals a Leper and a Paralytic", passage: "Luke 5:12-26" },
  { day: 15, title: "Calling of Levi and Jesus' Mission to Sinners", passage: "Luke 5:27-32" },
  { day: 16, title: "Choosing the Twelve Apostles", passage: "Luke 6:12-19" },
  { day: 17, title: "The Sermon on the Plain – Jesus Teaches on the Kingdom", passage: "Luke 6:20-36" },
  { day: 18, title: "Judging Others and Foundations of a Godly Life", passage: "Luke 6:37-49" },
  { day: 19, title: "Jesus Heals the Centurion's Servant", passage: "Luke 7:1-10" },
  { day: 20, title: "Raising the Widow's Son", passage: "Luke 7:11-17" },
  { day: 21, title: "John the Baptist and Jesus' Identity", passage: "Luke 7:18-35" },
  { day: 22, title: "A Sinful Woman Forgiven", passage: "Luke 7:36-50" },
  { day: 23, title: "Parable of the Sower", passage: "Luke 8:1-15" },
  { day: 24, title: "Lamp on a Stand and Calming the Storm", passage: "Luke 8:16-25" },
  { day: 25, title: "Sending Out the Twelve", passage: "Luke 9:1-9" },
  { day: 26, title: "Feeding the 5,000", passage: "Luke 9:10-17" },
  { day: 27, title: "Peter's Confession and Jesus' Prediction of His Death", passage: "Luke 9:18-27" },
  { day: 28, title: "The Transfiguration", passage: "Luke 9:28-36" },
  { day: 29, title: "Jesus Heals a Boy with a Demon and Teaches on Discipleship", passage: "Luke 9:37-50" },
  { day: 30, title: "The Cost of Following Jesus", passage: "Luke 9:51-62" },
  { day: 31, title: "Jesus and Zacchaeus", passage: "Luke 19:1-10" },
  { day: 32, title: "The Triumphal Entry", passage: "Luke 19:28-40" },
  { day: 33, title: "The Last Supper", passage: "Luke 22:7-23" },
  { day: 34, title: "The Crucifixion", passage: "Luke 23:26-49" },
  { day: 35, title: "The Resurrection", passage: "Luke 24:1-12" },
  { day: 36, title: "The Road to Emmaus", passage: "Luke 24:13-35" }
];

const reflectionQuestions = [
  "What stands out to you about Jesus' mission and how He fulfills it?",
  "How does Jesus' compassion for people challenge or inspire you?",
  "How do you sense Jesus inviting you to participate in his mission today?"
];

const UnionPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { habitData, loading, saveHabitData } = useHabits('union');
  const { toggleHabitCompletion, isHabitCompletedToday } = useHabitTracking();
  
  // Get or set weekly goal (default to 2)
  const weeklyGoal = habitData.weeklyGoal || 2;
  const [newGoal, setNewGoal] = useState(weeklyGoal.toString());
  
  // Calculate current reading index (cycles through 36 readings)
  const getCurrentReadingIndex = () => {
    const daysSinceStart = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    return daysSinceStart % lukeReadings.length;
  };
  
  const currentReading = lukeReadings[getCurrentReadingIndex()];
  
  // Calculate weekly progress
  const calculateWeeklyProgress = () => {
    const today = new Date();
    const mondayOfWeek = new Date(today);
    mondayOfWeek.setDate(today.getDate() - today.getDay() + 1);
    const mondayStr = mondayOfWeek.toISOString().split('T')[0];
    
    const sundayOfWeek = new Date(mondayOfWeek);
    sundayOfWeek.setDate(mondayOfWeek.getDate() + 6);
    const sundayStr = sundayOfWeek.toISOString().split('T')[0];
    
    // Get completion history for this week
    const thisWeekCompletions = (habitData.trackingHistory || []).filter(
      entry => entry.date >= mondayStr && entry.date <= sundayStr && entry.completed
    );
    
    return thisWeekCompletions.length;
  };
  
  const weeklyProgress = calculateWeeklyProgress();
  const todayCompleted = isHabitCompletedToday('union');
  
  const handleCompleteReading = () => {
    const today = new Date().toISOString().split('T')[0];
    const currentHistory = habitData.trackingHistory || [];
    
    const updatedHistory = currentHistory.filter(entry => entry.date !== today);
    updatedHistory.push({ date: today, completed: true, notes: `Read ${currentReading.passage}` });
    
    saveHabitData({ trackingHistory: updatedHistory });
    toggleHabitCompletion('union');
    
    toast({
      title: "Reading completed!",
      description: `You've completed today's reading: ${currentReading.passage}`
    });
  };
  
  const handleUpdateGoal = () => {
    const goal = parseInt(newGoal);
    if (goal < 1 || goal > 7) {
      toast({
        title: "Invalid goal",
        description: "Please set a goal between 1-7 times per week.",
        variant: "destructive"
      });
      return;
    }
    
    saveHabitData({ weeklyGoal: goal });
    toast({
      title: "Goal updated",
      description: `Weekly goal set to ${goal} time${goal > 1 ? 's' : ''} per week.`
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading union data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden" style={{ background: 'var(--gradient-blue)' }}>
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
                <Book className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black mb-6 leading-tight">
              UNION
            </h1>
            <p className="text-xl md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed">
              We know God and are shaped by his heart for the world
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Weekly Goal Setting */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Weekly Goal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label htmlFor="weekly-goal" className="text-base">
                How many times per week would you like to engage with missional scripture?
              </Label>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <Input
                    id="weekly-goal"
                    type="number"
                    min="1"
                    max="7"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    className="w-16 text-center"
                  />
                  <span className="text-muted-foreground whitespace-nowrap">
                    times per week
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    (recommended: 2)
                  </span>
                  <Button 
                    onClick={handleUpdateGoal}
                    variant="outline"
                    size="sm"
                  >
                    Update Goal
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">This week's progress:</span>
                <span className="text-lg font-bold">
                  {weeklyProgress} / {weeklyGoal}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className="bg-primary rounded-full h-3 transition-all duration-300"
                  style={{ width: `${Math.min((weeklyProgress / weeklyGoal) * 100, 100)}%` }}
                ></div>
              </div>
              {weeklyProgress >= weeklyGoal && (
                <div className="text-sm text-green-600 font-medium">
                  🎉 Congratulations! You've reached your weekly goal!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Reading */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Today's Reading: {currentReading.passage}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">{currentReading.title}</h3>
              <p className="text-muted-foreground">
                Read {currentReading.passage} and reflect on the questions below. You don't need to respond in the app - use this time for personal reflection and prayer.
              </p>
            </div>

            {/* Reflection Questions */}
            <div className="space-y-4">
              <h4 className="font-semibold">Reflection Questions:</h4>
              <ol className="space-y-3">
                {reflectionQuestions.map((question, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full text-sm flex items-center justify-center">
                      {index + 1}
                    </span>
                    <p className="text-muted-foreground">{question}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Complete Reading Button */}
            <div className="pt-4 border-t">
              {todayCompleted ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">You've completed today's reading!</span>
                </div>
              ) : (
                <Button 
                  onClick={handleCompleteReading}
                  className="w-full"
                  size="lg"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark as Complete
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* About This Practice */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>About Union with God</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Union with God is about deepening our relationship with Him through His Word and reflection. 
              By engaging with the Gospel of Luke, we explore Jesus' mission and how we're called to participate in it. 
              As we spend time in Scripture and meditation, we come to know God's character and are shaped 
              by His heart for the world.
            </p>
          </CardContent>
        </Card>

        {/* Reading History */}
        <Card>
          <CardHeader>
            <CardTitle>Reading History</CardTitle>
          </CardHeader>
          <CardContent>
            {(habitData.trackingHistory || []).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No reading history yet. Complete your first reading to see your progress here!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(habitData.trackingHistory || [])
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 10)
                  .map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${entry.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <div>
                          <p className="font-medium">
                            {new Date(entry.date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                          {entry.notes && (
                            <p className="text-sm text-muted-foreground">{entry.notes}</p>
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
      </div>
    </div>
  );
};

export default UnionPage;