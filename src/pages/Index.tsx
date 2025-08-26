import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HabitCard } from "@/components/HabitCard";
import { OverviewStats } from "@/components/OverviewStats";
import { PrayerManager } from "@/components/PrayerManager";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { MessageCircle, Book, Ear, HandHeart, Volume2, LogOut, Settings } from "lucide-react";
import p2cLogo from "@/assets/p2c-students-logos.png";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  // Initialize PULSE habit data - MUST be before any conditional returns
  const [habitData, setHabitData] = useState({
    pray: { 
      completed: false, 
      prayerList: [] as Array<{id: string, name: string, cadence: 'daily' | 'weekly', notificationTime?: string}>, 
      reminderTime: null 
    },
    union: { completed: false, resources: [] },
    listen: { weeklyQuestions: [], completed: false },
    serve: { weeklyService: [], completed: false },
    echo: { completed: false, testimonies: [] }
  });

  const [showPrayerManager, setShowPrayerManager] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const pulseHabits = {
    pray: {
      title: "Pray",
      description: `Daily praying for people${habitData.pray.prayerList.length > 0 ? ` (${habitData.pray.prayerList.length} people)` : ''}`,
      icon: <MessageCircle className="h-6 w-6 text-white" />,
      type: "prayer" as const,
      gradient: "var(--gradient-yellow)",
      details: habitData.pray.prayerList.length > 0 
        ? `Praying for: ${habitData.pray.prayerList.map(p => p.name).join(', ')}`
        : "Set up your prayer list to get started"
    },
    union: {
      title: "Union",
      description: "Walk in close union with God",
      icon: <Book className="h-6 w-6 text-white" />,
      type: "bible" as const,
      gradient: "var(--gradient-blue)",
      details: "Daily Bible reading and reflection with God"
    },
    listen: {
      title: "Listen",
      description: "Engage others with meaningful questions",
      icon: <Ear className="h-6 w-6 text-white" />,
      type: "conversation" as const,
      gradient: "var(--gradient-purple)",
      details: "Listening is a way of loving people"
    },
    serve: {
      title: "Serve",
      description: "Practical ways to serve others",
      icon: <HandHeart className="h-6 w-6 text-white" />,
      type: "service" as const,
      gradient: "var(--gradient-teal)",
      details: "Track weekly acts of service"
    },
    echo: {
      title: "Echo",
      description: "Speak back who God is",
      icon: <Volume2 className="h-6 w-6 text-white" />,
      type: "testimony" as const,
      gradient: "var(--gradient-orange)",
      details: "Give voice to God's goodness and character"
    }
  };

  const toggleHabit = (area: keyof typeof habitData) => {
    if (area === 'pray') {
      // If prayer list is empty, open prayer manager instead of toggling
      if (habitData.pray.prayerList.length === 0) {
        setShowPrayerManager(true);
        return;
      }
    }
    
    setHabitData(prev => ({
      ...prev,
      [area]: { ...prev[area], completed: !prev[area].completed }
    }));
  };

  const handleHabitNavigation = (habitKey: string) => {
    const routes = {
      pray: '/habits/pray',
      union: '/habits/union', 
      listen: '/habits/listen',
      serve: '/habits/serve',
      echo: '/habits/echo'
    };
    navigate(routes[habitKey as keyof typeof routes]);
  };

  const handlePrayerAction = () => {
    setShowPrayerManager(true);
  };

  const updatePrayerList = (prayerList: Array<{id: string, name: string, cadence: 'daily' | 'weekly', notificationTime?: string}>) => {
    setHabitData(prev => ({
      ...prev,
      pray: { ...prev.pray, prayerList }
    }));
  };

  // Calculate stats
  const totalHabits = Object.keys(pulseHabits).length;
  const totalCompleted = Object.values(habitData).filter(habit => habit.completed).length;
  const streak = 7; // This would come from stored data
  const weeklyGoal = 5; // Complete all 5 PULSE habits

  return (
    <div className="min-h-screen bg-background">
      {/* P2C Students Hero */}
      <div className="relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        <div className="relative container mx-auto px-6 py-16 text-center text-white">
          <div className="absolute top-6 right-6">
            <Button 
              onClick={signOut}
              variant="outline" 
              size="sm"
              className="text-white border-white/20 hover:bg-white/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
          <div className="mb-8">
            <div className="inline-flex items-center gap-4 mb-6">
              <img src={p2cLogo} alt="P2C Students" className="h-16 w-auto filter brightness-0 invert" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black mb-6 leading-tight tracking-tight">
              <span className="text-8xl md:text-9xl font-black tracking-wider">PULSE</span>
              <span className="block text-2xl md:text-3xl lg:text-4xl font-bold opacity-90 mt-4">
                MISSIONAL HABITS
              </span>
            </h1>
            <p className="text-xl md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed mb-8">
              Five daily practices to deepen your faith and impact your world
            </p>
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-black/20 backdrop-blur-md rounded-2xl border border-white/20">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-lg font-semibold">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Overview Stats */}
        <div className="mb-12">
          <OverviewStats 
            totalCompleted={totalCompleted}
            totalHabits={totalHabits}
            streak={streak}
            weeklyGoal={weeklyGoal}
          />
        </div>

        {/* PULSE Habit Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {Object.entries(pulseHabits).map(([key, habitConfig]) => (
            <HabitCard
              key={key}
              title={habitConfig.title}
              description={habitConfig.description}
              icon={habitConfig.icon}
              type={habitConfig.type}
              completed={habitData[key as keyof typeof habitData].completed}
              onToggle={() => toggleHabit(key as keyof typeof habitData)}
              onAction={key === 'pray' ? handlePrayerAction : undefined}
              actionLabel={key === 'pray' ? 'Manage Prayer List' : undefined}
              actionIcon={key === 'pray' ? <Settings className="h-4 w-4" /> : undefined}
              onNavigate={() => handleHabitNavigation(key)}
              gradient={habitConfig.gradient}
              details={habitConfig.details}
            />
          ))}
        </div>

        {/* P2C-style Call to Action */}
        <div className="text-center">
          <div className="max-w-4xl mx-auto p-10 rounded-2xl border border-border shadow-lg bg-card">
            <div className="mb-6">
              <blockquote className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4 leading-tight">
                "Stand firm. Let nothing move you."
              </blockquote>
              <cite className="text-lg font-semibold text-primary">
                1 Corinthians 15:58
              </cite>
            </div>
            <p className="text-lg font-medium text-muted-foreground">
              Every habit completed is a step forward in your faith journey.
            </p>
            <div className="mt-6 inline-flex items-center gap-3">
              <div className="h-1 w-12 bg-primary rounded-full"></div>
              <span className="text-sm font-bold text-primary uppercase tracking-wide">P2C Students</span>
              <div className="h-1 w-12 bg-primary rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Prayer Manager Dialog */}
      <Dialog open={showPrayerManager} onOpenChange={setShowPrayerManager}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prayer Management</DialogTitle>
          </DialogHeader>
          <PrayerManager
            prayerList={habitData.pray.prayerList}
            onUpdatePrayerList={updatePrayerList}
            onClose={() => setShowPrayerManager(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
