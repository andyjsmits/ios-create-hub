import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HabitCard } from "@/components/HabitCard";
import { OverviewStats } from "@/components/OverviewStats";
import { PrayerManager } from "@/components/PrayerManager";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useHabits, PrayerPerson } from "@/hooks/useHabits";
import { MessageCircle, Book, Ear, HandHeart, Volume2, Settings } from "lucide-react";
import p2cLogo from "@/assets/p2c-students-logos.png";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Get habit data for all habits
  const { habitData: prayHabitData, loading: prayLoading, updatePrayerList } = useHabits('pray');
  const { habitData: unionHabitData, loading: unionLoading } = useHabits('union');
  const { habitData: listenHabitData, loading: listenLoading } = useHabits('listen');
  const { habitData: serveHabitData, loading: serveLoading } = useHabits('serve');
  const { habitData: echoHabitData, loading: echoLoading } = useHabits('echo');

  const [showPrayerManager, setShowPrayerManager] = useState(false);

  // Get prayer list from database or use empty array
  const prayerList = prayHabitData.prayerList || [];

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const allLoading = loading || prayLoading || unionLoading || listenLoading || serveLoading || echoLoading;

  if (allLoading) {
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

  // Helper function to check if habit is completed today
  const isHabitCompletedToday = (habitData: any): boolean => {
    if (!habitData?.trackingHistory) return false;
    const today = new Date().toISOString().split('T')[0];
    return habitData.trackingHistory.some((entry: any) => 
      entry.date === today && entry.completed
    );
  };

  // Calculate streak from all habits
  const calculateStreak = (): number => {
    const allHabits = [prayHabitData, unionHabitData, listenHabitData, serveHabitData, echoHabitData];
    const allCompletions: { date: string; completed: boolean }[] = [];
    
    // Collect all completions from all habits
    allHabits.forEach(habitData => {
      if (habitData?.trackingHistory) {
        allCompletions.push(...habitData.trackingHistory);
      }
    });

    if (allCompletions.length === 0) return 0;

    // Get unique dates where any habit was completed
    const completionDates = Array.from(new Set(
      allCompletions.filter(c => c.completed).map(c => c.date)
    )).sort().reverse();

    let streak = 0;
    let currentDate = new Date();
    
    for (const dateStr of completionDates) {
      const completionDate = new Date(dateStr);
      const daysDiff = Math.floor((currentDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
        currentDate = new Date(completionDate);
      } else {
        break;
      }
    }

    return streak;
  };

  // Calculate weekly progress from all habits
  const calculateWeeklyProgress = (): { completed: boolean; habitsCounted: Set<string> } => {
    const today = new Date();
    const mondayOfWeek = new Date(today);
    mondayOfWeek.setDate(today.getDate() - today.getDay() + 1);
    const mondayStr = mondayOfWeek.toISOString().split('T')[0];
    
    const sundayOfWeek = new Date(mondayOfWeek);
    sundayOfWeek.setDate(mondayOfWeek.getDate() + 6);
    const sundayStr = sundayOfWeek.toISOString().split('T')[0];

    const habitTypes = ['pray', 'union', 'listen', 'serve', 'echo'];
    const allHabits = [prayHabitData, unionHabitData, listenHabitData, serveHabitData, echoHabitData];
    const habitsCounted = new Set<string>();

    habitTypes.forEach((habitType, index) => {
      const habitData = allHabits[index];
      if (habitData?.trackingHistory) {
        const hasCompletionThisWeek = habitData.trackingHistory.some((entry: any) => 
          entry.completed && entry.date >= mondayStr && entry.date <= sundayStr
        );
        if (hasCompletionThisWeek) {
          habitsCounted.add(habitType);
        }
      }
    });

    const completed = habitTypes.every(habit => habitsCounted.has(habit));
    return { completed, habitsCounted };
  };

  const pulseHabits = {
    pray: {
      title: "Pray",
      description: `Daily praying for people${prayerList.length > 0 ? ` (${prayerList.length} people)` : ''}`,
      icon: <MessageCircle className="h-6 w-6 text-white" />,
      type: "prayer" as const,
      gradient: "var(--gradient-yellow)",
      details: prayerList.length > 0 
        ? `Praying for: ${prayerList.map(p => p.name).join(', ')}`
        : "Set up your prayer list to get started",
      completed: isHabitCompletedToday(prayHabitData)
    },
    union: {
      title: "Union",
      description: "Walk in close union with God",
      icon: <Book className="h-6 w-6 text-white" />,
      type: "bible" as const,
      gradient: "var(--gradient-blue)",
      details: "Daily Bible reading and reflection with God",
      completed: isHabitCompletedToday(unionHabitData)
    },
    listen: {
      title: "Listen",
      description: "Engage others with meaningful questions",
      icon: <Ear className="h-6 w-6 text-white" />,
      type: "conversation" as const,
      gradient: "var(--gradient-purple)",
      details: "Listening is a way of loving people",
      completed: isHabitCompletedToday(listenHabitData)
    },
    serve: {
      title: "Serve",
      description: "Practical ways to serve others",
      icon: <HandHeart className="h-6 w-6 text-white" />,
      type: "service" as const,
      gradient: "var(--gradient-teal)",
      details: "Track weekly acts of service",
      completed: isHabitCompletedToday(serveHabitData)
    },
    echo: {
      title: "Echo",
      description: "Speak back who God is",
      icon: <Volume2 className="h-6 w-6 text-white" />,
      type: "testimony" as const,
      gradient: "var(--gradient-orange)",
      details: "Give voice to God's goodness and character",
      completed: isHabitCompletedToday(echoHabitData)
    }
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

  const handleUpdatePrayerList = (newPrayerList: PrayerPerson[]) => {
    updatePrayerList(newPrayerList);
  };

  // Calculate stats from real data
  const totalHabits = Object.keys(pulseHabits).length;
  const todayCompletions = Object.values(pulseHabits).filter(habit => habit.completed).length;
  const streak = calculateStreak();
  const weeklyProgress = calculateWeeklyProgress();
  const weeklyGoalMet = weeklyProgress.completed;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* P2C Students Hero */}
      <div className="relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        <div className="relative container mx-auto px-6 py-16 text-center text-white">
          <div className="mb-8">
            <div className="inline-flex items-center gap-4 mb-6">
              <img src={p2cLogo} alt="P2C Students" className="h-16 w-auto filter brightness-0 invert" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black mb-6 leading-tight tracking-tight flex flex-col items-center">
              <span className="text-8xl md:text-9xl font-black tracking-wider text-center">PULSE</span>
              <span className="block text-2xl md:text-3xl lg:text-4xl font-bold opacity-90 mt-4 text-center">
                MISSIONAL HABITS
              </span>
            </h1>
            <p className="text-xl md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed mb-8">
              Five practices to deepen your faith and impact your world
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
            totalCompleted={todayCompletions}
            totalHabits={totalHabits}
            streak={streak}
            weeklyGoal={weeklyProgress.habitsCounted.size}
            weeklyGoalMet={weeklyGoalMet}
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
              completed={habitConfig.completed}
              onToggle={() => {}} // Remove toggle functionality
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
              Helping students take their next steps towards Jesus
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
            prayerList={prayerList}
            onUpdatePrayerList={handleUpdatePrayerList}
            onClose={() => setShowPrayerManager(false)}
          />
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Index;
