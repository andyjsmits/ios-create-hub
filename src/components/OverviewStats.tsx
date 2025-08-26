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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Card className="text-center hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <div className="mx-auto p-2 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full w-fit">
            <Target className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionRate}%</div>
          <p className="text-xs text-muted-foreground">Today's Progress</p>
        </CardContent>
      </Card>
      
      <Card className="text-center hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <div className="mx-auto p-2 bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-full w-fit">
            <Flame className="h-5 w-5 text-amber-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{streak}</div>
          <p className="text-xs text-muted-foreground">Day Streak</p>
        </CardContent>
      </Card>
      
      <Card className="text-center hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <div className="mx-auto p-2 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-full w-fit">
            <Calendar className="h-5 w-5 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCompleted}</div>
          <p className="text-xs text-muted-foreground">Completed Today</p>
        </CardContent>
      </Card>
      
      <Card className="text-center hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <div className="mx-auto p-2 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-full w-fit">
            <Trophy className="h-5 w-5 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{weeklyGoal}</div>
          <p className="text-xs text-muted-foreground">Weekly Goal</p>
        </CardContent>
      </Card>
    </div>
  );
};