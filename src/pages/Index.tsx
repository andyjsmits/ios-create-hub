import { useState } from "react";
import { HabitCard } from "@/components/HabitCard";
import { OverviewStats } from "@/components/OverviewStats";
import { Badge } from "@/components/ui/badge";
import { Book, Heart, Users, HandHeart, Church } from "lucide-react";
import p2cLogo from "@/assets/p2c-students-logos.png";

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
      gradient: "var(--gradient-yellow)"
    },
    scripture: {
      title: "Scripture Study",
      description: "Growing in God's Word",
      icon: <Book className="h-6 w-6 text-primary" />,
      habits: ["Daily Bible Reading", "Scripture Reflection"],
      gradient: "var(--gradient-blue)"
    },
    community: {
      title: "Christian Community",
      description: "Building relationships in Christ",
      icon: <Users className="h-6 w-6 text-primary" />,
      habits: ["Fellowship Connection", "Encourage Someone"],
      gradient: "var(--gradient-purple)"
    },
    service: {
      title: "Missional Living",
      description: "Serving others as Christ served",
      icon: <HandHeart className="h-6 w-6 text-primary" />,
      habits: ["Act of Kindness", "Volunteer/Serve", "Share Faith"],
      gradient: "var(--gradient-blue)"
    },
    worship: {
      title: "Worship & Gratitude",
      description: "Cultivating a heart of praise",
      icon: <Heart className="h-6 w-6 text-primary" />,
      habits: ["Gratitude Practice", "Worship/Praise"],
      gradient: "var(--gradient-yellow)"
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
      {/* P2C Students Hero */}
      <div className="relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        <div className="relative container mx-auto px-6 py-16 text-center text-white">
          <div className="mb-8">
            <div className="inline-flex items-center gap-4 mb-6">
              <img src={p2cLogo} alt="P2C Students" className="h-16 w-auto filter brightness-0 invert" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black mb-6 leading-tight tracking-tight">
              FAITH
              <span className="block text-3xl md:text-4xl lg:text-5xl font-bold opacity-90">
                FORMATION HABITS
              </span>
            </h1>
            <p className="text-xl md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed mb-8">
              Helping you take your next step towards Jesus through daily habits
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
    </div>
  );
};

export default Index;
