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
      <Card className="text-center hover:shadow-xl transition-all duration-500 hover:-translate-y-1 bg-gradient-to-br from-card to-white border-0 shadow-lg group">
        <CardHeader className="pb-3">
          <div className="mx-auto p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl border border-primary/10 w-fit group-hover:shadow-lg group-hover:shadow-primary/10 transition-all duration-500">
            <Target className="h-6 w-6 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold font-serif text-primary mb-1">{completionRate}%</div>
          <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
        </CardContent>
      </Card>
      
      <Card className="text-center hover:shadow-xl transition-all duration-500 hover:-translate-y-1 bg-gradient-to-br from-card to-white border-0 shadow-lg group">
        <CardHeader className="pb-3">
          <div className="mx-auto p-4 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent rounded-2xl border border-amber-500/10 w-fit group-hover:shadow-lg group-hover:shadow-amber-500/10 transition-all duration-500">
            <Flame className="h-6 w-6 text-amber-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold font-serif text-amber-600 mb-1">{streak}</div>
          <p className="text-sm font-medium text-muted-foreground">Day Streak</p>
        </CardContent>
      </Card>
      
      <Card className="text-center hover:shadow-xl transition-all duration-500 hover:-translate-y-1 bg-gradient-to-br from-card to-white border-0 shadow-lg group">
        <CardHeader className="pb-3">
          <div className="mx-auto p-4 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent rounded-2xl border border-green-500/10 w-fit group-hover:shadow-lg group-hover:shadow-green-500/10 transition-all duration-500">
            <Calendar className="h-6 w-6 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold font-serif text-green-600 mb-1">{totalCompleted}</div>
          <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
        </CardContent>
      </Card>
      
      <Card className="text-center hover:shadow-xl transition-all duration-500 hover:-translate-y-1 bg-gradient-to-br from-card to-white border-0 shadow-lg group">
        <CardHeader className="pb-3">
          <div className="mx-auto p-4 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent rounded-2xl border border-purple-500/10 w-fit group-hover:shadow-lg group-hover:shadow-purple-500/10 transition-all duration-500">
            <Trophy className="h-6 w-6 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold font-serif text-purple-600 mb-1">{weeklyGoal}</div>
          <p className="text-sm font-medium text-muted-foreground">Weekly Goal</p>
        </CardContent>
      </Card>
    </div>
  );
};