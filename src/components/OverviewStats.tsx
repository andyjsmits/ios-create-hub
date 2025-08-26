import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Flame, Target, Trophy } from "lucide-react";

interface OverviewStatsProps {
  totalCompleted: number;
  totalHabits: number;
  streak: number;
  weeklyGoal: number;
}

export const OverviewStats = ({ totalCompleted, totalHabits, streak, weeklyGoal }: OverviewStatsProps) => {
  const completionRate = totalHabits > 0 ? Math.round((totalCompleted / totalHabits) * 100) : 0;
  
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:rotate-1 border-2 border-primary/30 shadow-lg group overflow-hidden relative" style={{ background: 'var(--gradient-card)' }}>
        <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'var(--gradient-orange)' }}></div>
        <CardHeader className="pb-3">
          <div className="mx-auto p-4 rounded-2xl border-2 border-primary/30 w-fit group-hover:shadow-2xl transition-all duration-300" style={{ background: 'var(--gradient-orange)' }}>
            <Target className="h-8 w-8 text-black" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-display font-black mb-1" style={{ color: 'hsl(var(--primary))' }}>{completionRate}%</div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">COMPLETION</p>
        </CardContent>
      </Card>
      
      <Card className="text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:rotate-1 border-2 border-secondary/30 shadow-lg group overflow-hidden relative" style={{ background: 'var(--gradient-card)' }}>
        <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'var(--gradient-blue)' }}></div>
        <CardHeader className="pb-3">
          <div className="mx-auto p-4 rounded-2xl border-2 border-secondary/30 w-fit group-hover:shadow-2xl transition-all duration-300" style={{ background: 'var(--gradient-blue)' }}>
            <Flame className="h-8 w-8 text-black" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-display font-black mb-1" style={{ color: 'hsl(var(--secondary))' }}>{streak}</div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">STREAK</p>
        </CardContent>
      </Card>
      
      <Card className="text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:rotate-1 border-2 border-accent/30 shadow-lg group overflow-hidden relative" style={{ background: 'var(--gradient-card)' }}>
        <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'var(--gradient-purple)' }}></div>
        <CardHeader className="pb-3">
          <div className="mx-auto p-4 rounded-2xl border-2 border-accent/30 w-fit group-hover:shadow-2xl transition-all duration-300" style={{ background: 'var(--gradient-purple)' }}>
            <Calendar className="h-8 w-8 text-black" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-display font-black mb-1" style={{ color: 'hsl(var(--accent))' }}>{totalCompleted}</div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">COMPLETED</p>
        </CardContent>
      </Card>
      
      <Card className="text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:rotate-1 border-2 border-primary/30 shadow-lg group overflow-hidden relative" style={{ background: 'var(--gradient-card)' }}>
        <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'var(--gradient-accent)' }}></div>
        <CardHeader className="pb-3">
          <div className="mx-auto p-4 rounded-2xl border-2 border-primary/30 w-fit group-hover:shadow-2xl transition-all duration-300" style={{ background: 'var(--gradient-accent)' }}>
            <Trophy className="h-8 w-8 text-black" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-display font-black mb-1" style={{ color: 'hsl(var(--primary))' }}>{weeklyGoal}</div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">WEEKLY GOAL</p>
        </CardContent>
      </Card>
    </div>
  );
};