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
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        <div className="relative container mx-auto px-6 py-16 text-center text-white">
          <div className="mb-6">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <Church className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4 leading-tight">
              Faith Formation
              <span className="block text-3xl md:text-4xl lg:text-5xl font-light opacity-90">
                Daily Habits
              </span>
            </h1>
            <p className="text-xl md:text-2xl font-light opacity-90 max-w-2xl mx-auto leading-relaxed">
              Growing in Christ through intentional daily practices
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <span className="text-sm font-medium">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
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

        {/* Encouraging Scripture */}
        <div className="text-center">
          <div className="inline-block max-w-3xl p-8 bg-gradient-to-br from-card via-white to-secondary/30 rounded-3xl border border-border/50 shadow-xl">
            <blockquote className="text-2xl md:text-3xl font-serif font-medium text-foreground mb-4 leading-relaxed">
              "Therefore, my dear brothers and sisters, stand firm. Let nothing move you. Always give yourselves fully to the work of the Lord."
            </blockquote>
            <cite className="text-lg text-muted-foreground font-medium">
              1 Corinthians 15:58
            </cite>
            <p className="mt-4 text-base text-muted-foreground">
              Keep growing in your faith journey, one day at a time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
