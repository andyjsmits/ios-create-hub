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
      <Card className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-border shadow-md group">
        <CardHeader className="pb-3">
          <div className="mx-auto p-4 rounded-xl w-fit group-hover:shadow-lg transition-all duration-300" style={{ background: 'var(--gradient-yellow)' }}>
            <Target className="h-6 w-6 text-black" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-display font-bold text-primary mb-1">{completionRate}%</div>
          <p className="text-sm font-semibold text-muted-foreground">COMPLETION</p>
        </CardContent>
      </Card>
      
      <Card className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-border shadow-md group">
        <CardHeader className="pb-3">
          <div className="mx-auto p-4 rounded-xl w-fit group-hover:shadow-lg transition-all duration-300" style={{ background: 'var(--gradient-blue)' }}>
            <Flame className="h-6 w-6 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-display font-bold text-secondary mb-1">{streak}</div>
          <p className="text-sm font-semibold text-muted-foreground">DAY STREAK</p>
        </CardContent>
      </Card>
      
      <Card className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-border shadow-md group">
        <CardHeader className="pb-3">
          <div className="mx-auto p-4 rounded-xl w-fit group-hover:shadow-lg transition-all duration-300" style={{ background: 'var(--gradient-purple)' }}>
            <Calendar className="h-6 w-6 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-display font-bold text-accent mb-1">{totalCompleted}</div>
          <p className="text-sm font-semibold text-muted-foreground">COMPLETED</p>
        </CardContent>
      </Card>
      
      <Card className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-border shadow-md group">
        <CardHeader className="pb-3">
          <div className="mx-auto p-4 rounded-xl w-fit group-hover:shadow-lg transition-all duration-300" style={{ background: 'var(--gradient-yellow)' }}>
            <Trophy className="h-6 w-6 text-black" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-display font-bold text-primary mb-1">{weeklyGoal}</div>
          <p className="text-sm font-semibold text-muted-foreground">WEEKLY GOAL</p>
        </CardContent>
      </Card>
    </div>
  );
};