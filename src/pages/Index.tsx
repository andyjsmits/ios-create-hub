import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HabitCard } from "@/components/HabitCard";
import { PrayerManager } from "@/components/PrayerManager";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useHabits, PrayerPerson } from "@/hooks/useHabits";
import { PrayerKickstartCard } from "@/components/PrayerKickstartCard";
import { useHabitTracking } from "@/hooks/useHabitTracking";
import { MessageCircle, Book, Ear, HandHeart, MessageSquareQuote, Settings, Flame, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import p2cLogo from "@/assets/p2c-students-logos.png";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingDialog } from "@/components/OnboardingDialog";
import { useToast } from "@/hooks/use-toast";
import { GuidedTour } from "@/components/GuidedTour";
import { notificationService } from "@/services/notificationService";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Get habit data for all habits
  const { habitData: prayHabitData, loading: prayLoading, updatePrayerList, saveHabitData: savePrayData } = useHabits('pray');
  const { habitData: unionHabitData, loading: unionLoading } = useHabits('union');
  const { habitData: listenHabitData, loading: listenLoading } = useHabits('listen');
  const { habitData: serveHabitData, loading: serveLoading } = useHabits('serve');
  const { habitData: echoHabitData, loading: echoLoading } = useHabits('echo');

  // Add habit tracking
  const { toggleHabitCompletion, isHabitCompletedToday: isCompletedFromTracking, loading: trackingLoading } = useHabitTracking();

  const [showPrayerManager, setShowPrayerManager] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const { toast } = useToast();

  // Get prayer list from database or use empty array
  const prayerList = prayHabitData.prayerList || [];

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Load profile for greeting and onboarding check
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('display_name, onboarded')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setDisplayName(data.display_name);
        if (!data.onboarded) setShowOnboarding(true);
      } else {
        setShowOnboarding(true);
      }
      // Show tour after onboarding has been completed or skipped
      try {
        const tourDone = localStorage.getItem('tourCompleted') === 'true';
        if (!tourDone) setShowTour(true);
      } catch {}
    };
    fetchProfile();
  }, [user]);

  const allLoading = loading || prayLoading || unionLoading || listenLoading || serveLoading || echoLoading || trackingLoading;

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

  // Helper function to check if habit is completed today - using new tracking system
  const isHabitCompletedToday = (habitType: 'pray' | 'union' | 'listen' | 'serve' | 'echo'): boolean => {
    return isCompletedFromTracking(habitType);
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
      completed: isHabitCompletedToday('pray')
    },
    union: {
      title: "Union",
      description: "Walk in close union with God",
      icon: <Book className="h-6 w-6 text-white" />,
      type: "bible" as const,
      gradient: "var(--gradient-blue)",
      details: "Daily Bible reading and reflection with God",
      completed: isHabitCompletedToday('union')
    },
    listen: {
      title: "Listen",
      description: "Engage others with meaningful questions",
      icon: <Ear className="h-6 w-6 text-white" />,
      type: "conversation" as const,
      gradient: "var(--gradient-purple)",
      details: "Listening is a way of loving people",
      completed: isHabitCompletedToday('listen')
    },
    serve: {
      title: "Serve",
      description: "Practical ways to serve others",
      icon: <HandHeart className="h-6 w-6 text-white" />,
      type: "service" as const,
      gradient: "var(--gradient-teal)",
      details: "Track weekly acts of service",
      completed: isHabitCompletedToday('serve')
    },
    echo: {
      title: "Echo",
      description: "Speak back who God is",
      icon: <MessageSquareQuote className="h-6 w-6 text-white" />,
      type: "testimony" as const,
      gradient: "var(--gradient-orange)",
      details: "Give voice to God's goodness and character",
      completed: isHabitCompletedToday('echo')
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

  const handleHabitToggle = (habitType: 'pray' | 'union' | 'listen' | 'serve' | 'echo') => {
    toggleHabitCompletion(habitType);
  };

  // Calculate stats from real data
  const streak = calculateStreak();
  const weeklyProgress = calculateWeeklyProgress();

  return (
    <div className="min-h-screen bg-background pb-20" style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>
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
            {displayName && (
              <p className="text-xl font-semibold mb-4">Welcome back, {displayName}!</p>
            )}
            <p className="text-xl md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed mb-8">
              Five practices to deepen your faith and impact your world
            </p>
            {/* Streak trackers moved to hero area (side-by-side square boxes) */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <Card className="aspect-square bg-black/20 border-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="p-3 rounded-xl bg-white/10 mb-2"><Flame className="h-6 w-6 text-white" /></div>
                  <div className="text-3xl font-black">{streak}</div>
                  <div className="text-xs uppercase tracking-wide opacity-90">Day Streak</div>
                </div>
              </Card>
              <Card className="aspect-square bg-black/20 border-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="p-3 rounded-xl bg-white/10 mb-2"><Trophy className="h-6 w-6 text-white" /></div>
                  <div className="text-3xl font-black">{weeklyProgress.habitsCounted.size}/5</div>
                  <div className="text-xs uppercase tracking-wide opacity-90 text-center">Weekly Habits</div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Streak trackers are now in the hero; no overview stats here */}

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
              onToggle={() => handleHabitToggle(key as 'pray' | 'union' | 'listen' | 'serve' | 'echo')}
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

        {/* 7-Day Prayer Kickstart at bottom */}
        <div className="mt-12 mb-4">
          <PrayerKickstartCard
            kickstart={prayHabitData.kickstart}
            save={(data) => savePrayData({ ...(prayHabitData || {}), ...data })}
          />
        </div>
      </div>

      {/* Prayer Manager Dialog */}
      <Dialog open={showPrayerManager} onOpenChange={setShowPrayerManager}>
        <DialogContent className="sm:max-w-2xl w-full h-full sm:h-[90vh] max-h-screen p-0 gap-0 overflow-hidden">
          <PrayerManager
            prayerList={prayerList}
            onUpdatePrayerList={handleUpdatePrayerList}
            onClose={() => setShowPrayerManager(false)}
          />
        </DialogContent>
      </Dialog>

      {/* First-time Onboarding Dialog */}
      {user && (
        <OnboardingDialog
          userId={user.id}
          open={showOnboarding}
          onClose={() => {
            setShowOnboarding(false);
            // refresh name after closing
            (async () => {
              const { data } = await supabase
                .from('profiles')
                .select('display_name')
                .eq('id', user.id)
                .single();
              if (data?.display_name) setDisplayName(data.display_name);
            })();
          }}
        />
      )}

      {/* First-Run Guided Tour */}
      {user && (
        <GuidedTour
          open={showTour && !showOnboarding}
          onClose={() => setShowTour(false)}
          onStartPrayer={() => {
            try { localStorage.setItem('openPrayerManager', 'true'); } catch {}
            setShowTour(false);
            navigate('/habits/pray');
          }}
          onStartKickstart={async () => {
            const todayIso = new Date().toISOString().split('T')[0];
            await savePrayData({ kickstart: { startedAt: todayIso, daysCompleted: [] } as any });
            toast({ title: 'Kickstart started', description: 'We’ll prompt a small step each day for 7 days.' });
            try {
              const t = (localStorage.getItem('dailyReminderTime') || '09:00');
              const [h, m] = t.split(':').map(Number);
              await notificationService.scheduleLocalNotification({
                title: 'PULSE Kickstart',
                body: 'Today’s prayer step is ready.',
                id: 998,
                schedule: { repeats: true, on: { hour: h || 9, minute: m || 0 } }
              });
            } catch {}
            setShowTour(false);
            navigate('/');
          }}
        />
      )}

    </div>
  );
};

export default Index;
