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
      title: "Prayer & Spiritual Discipline",
      description: "Deepening relationship with God",
      icon: <Church className="h-6 w-6 text-primary" />,
      habits: ["Morning Prayer (15 min)", "Evening Prayer", "Meditation/Quiet Time"],
      gradient: "var(--gradient-primary)"
    },
    scripture: {
      title: "Scripture Study",
      description: "Growing in God's Word",
      icon: <Book className="h-6 w-6 text-primary" />,
      habits: ["Daily Bible Reading", "Scripture Reflection"],
      gradient: "var(--gradient-secondary)"
    },
    community: {
      title: "Christian Community",
      description: "Building meaningful relationships",
      icon: <Users className="h-6 w-6 text-primary" />,
      habits: ["Fellowship Connection", "Encourage Someone"],
      gradient: "var(--gradient-peace)"
    },
    service: {
      title: "Missional Service",
      description: "Serving others as Christ served",
      icon: <HandHeart className="h-6 w-6 text-primary" />,
      habits: ["Act of Kindness", "Volunteer/Serve", "Share Faith"],
      gradient: "var(--gradient-primary)"
    },
    worship: {
      title: "Worship & Gratitude",
      description: "Cultivating a heart of praise",
      icon: <Heart className="h-6 w-6 text-primary" />,
      habits: ["Gratitude Practice", "Worship/Praise"],
      gradient: "var(--gradient-secondary)"
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
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full">
              <Church className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Faith Formation Tracker
            </h1>
          </div>
          <p className="text-lg text-muted-foreground mb-4">
            Growing in Christ through daily missional habits
          </p>
          <Badge variant="secondary" className="text-sm px-4 py-1">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Badge>
        </div>

        {/* Overview Stats */}
        <OverviewStats 
          totalCompleted={totalCompleted}
          totalHabits={totalHabits}
          streak={streak}
          weeklyGoal={weeklyGoal}
        />

        {/* Habit Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

        {/* Encouraging Message */}
        <div className="mt-12 text-center">
          <div className="inline-block p-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl border border-primary/10">
            <p className="text-lg font-medium text-foreground mb-2">
              "Therefore, my dear brothers and sisters, stand firm. Let nothing move you."
            </p>
            <p className="text-sm text-muted-foreground">
              1 Corinthians 15:58 - Keep growing in your faith journey!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
