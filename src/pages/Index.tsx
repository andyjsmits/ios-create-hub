import { useState } from "react";
import { HabitCard } from "@/components/HabitCard";
import { OverviewStats } from "@/components/OverviewStats";
import { Badge } from "@/components/ui/badge";
import { Book, Heart, Users, HandHeart, Church } from "lucide-react";

const Index = () => {
  // Initialize habit data for the 5 missional faith formation areas
  const [habitData, setHabitData] = useState({
    prayer: [false, false, false], // Morning prayer, Evening prayer, Meditation
    scripture: [false, false], // Daily reading, Reflection
    community: [false, false], // Fellowship, Encouragement
    service: [false, false, false], // Acts of kindness, Volunteering, Sharing faith
    worship: [false, false] // Gratitude, Praise
  });

  const habits = {
    prayer: {
      title: "Prayer & Devotion",
      description: "Daily connection with God",
      icon: <Church className="h-6 w-6 text-primary" />,
      habits: ["Morning Prayer (15 min)", "Evening Prayer", "Meditation/Quiet Time"],
      gradient: "var(--gradient-hero)"
    },
    scripture: {
      title: "Scripture Study",
      description: "Growing in God's Word",
      icon: <Book className="h-6 w-6 text-primary" />,
      habits: ["Daily Bible Reading", "Scripture Reflection"],
      gradient: "var(--gradient-card)"
    },
    community: {
      title: "Christian Community",
      description: "Building relationships in Christ",
      icon: <Users className="h-6 w-6 text-primary" />,
      habits: ["Fellowship Connection", "Encourage Someone"],
      gradient: "var(--gradient-accent)"
    },
    service: {
      title: "Missional Living",
      description: "Serving others as Christ served",
      icon: <HandHeart className="h-6 w-6 text-primary" />,
      habits: ["Act of Kindness", "Volunteer/Serve", "Share Faith"],
      gradient: "var(--gradient-hero)"
    },
    worship: {
      title: "Worship & Gratitude",
      description: "Cultivating a heart of praise",
      icon: <Heart className="h-6 w-6 text-primary" />,
      habits: ["Gratitude Practice", "Worship/Praise"],
      gradient: "var(--gradient-card)"
    }
  };

  const toggleHabit = (area: keyof typeof habitData, habitIndex: number) => {
    setHabitData(prev => ({
      ...prev,
      [area]: prev[area].map((completed, index) => 
        index === habitIndex ? !completed : completed
      )
    }));
  };

  // Calculate stats
  const totalHabits = Object.values(habitData).flat().length;
  const totalCompleted = Object.values(habitData).flat().filter(Boolean).length;
  const streak = 7; // This would come from stored data
  const weeklyGoal = 35; // Example weekly goal

  return (
    <div className="min-h-screen bg-background">
      {/* Bold Hero Header */}
      <div className="relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-32 right-20 w-24 h-24 bg-white/20 rounded-full blur-lg animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        </div>
        
        <div className="relative container mx-auto px-6 py-20 text-center text-white">
          <div className="mb-8">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 shadow-2xl" style={{ boxShadow: 'var(--glow-primary)' }}>
                <Church className="h-10 w-10" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-black mb-6 leading-tight tracking-tight">
              FAITH
              <span className="block bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent">
                HABITS
              </span>
            </h1>
            <p className="text-xl md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed mb-8">
              Level up your spiritual journey with these 5 core habits that transform lives
            </p>
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-black/30 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
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

        {/* Habit Cards */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {Object.entries(habits).map(([key, habitConfig]) => (
            <HabitCard
              key={key}
              title={habitConfig.title}
              description={habitConfig.description}
              icon={habitConfig.icon}
              habits={habitConfig.habits}
              completedToday={habitData[key as keyof typeof habitData]}
              onToggleHabit={(habitIndex) => toggleHabit(key as keyof typeof habitData, habitIndex)}
              gradient={habitConfig.gradient}
            />
          ))}
        </div>

        {/* Bold Call to Action */}
        <div className="text-center">
          <div className="max-w-4xl mx-auto p-10 rounded-3xl border-2 border-primary/30 relative overflow-hidden" style={{ background: 'var(--gradient-card)' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 animate-pulse"></div>
            <div className="relative">
              <blockquote className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6 leading-tight">
                "STAND FIRM. LET NOTHING MOVE YOU."
              </blockquote>
              <cite className="text-xl font-semibold" style={{ color: 'hsl(var(--primary))' }}>
                1 CORINTHIANS 15:58
              </cite>
              <p className="mt-6 text-lg font-medium text-muted-foreground">
                Every habit completed is a step forward in your faith journey. 
                <span className="block mt-2 font-bold text-foreground">Keep pushing. Keep growing. Keep believing.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
