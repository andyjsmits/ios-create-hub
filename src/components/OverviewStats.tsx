import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Flame, Target, Trophy } from "lucide-react";
interface OverviewStatsProps {
  totalCompleted: number;
  totalHabits: number;
  streak: number;
  weeklyGoal: number;
  weeklyGoalMet?: boolean;
}
export const OverviewStats = ({
  totalCompleted,
  totalHabits,
  streak,
  weeklyGoal,
  weeklyGoalMet = false
}: OverviewStatsProps) => {
  const completionRate = totalHabits > 0 ? Math.round(totalCompleted / totalHabits * 100) : 0;
  return <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Today's Progress */}
      
      
      {/* Day Streak */}
      <Card className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-border shadow-md group">
        <CardHeader className="pb-3">
          <div className="mx-auto p-4 rounded-xl w-fit group-hover:shadow-lg transition-all duration-300" style={{
          background: 'var(--gradient-blue)'
        }}>
            <Flame className="h-6 w-6 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-display font-bold text-secondary mb-1">{streak}</div>
          <p className="text-sm font-semibold text-muted-foreground">DAY STREAK</p>
        </CardContent>
      </Card>
      
      {/* Weekly Goal */}
      <Card className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-border shadow-md group">
        <CardHeader className="pb-3">
          <div className="mx-auto p-4 rounded-xl w-fit group-hover:shadow-lg transition-all duration-300" style={{
          background: 'var(--gradient-yellow)'
        }}>
            <Trophy className="h-6 w-6 text-black" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-display font-bold text-primary mb-1">{weeklyGoal}/5</div>
          <p className="text-sm font-semibold text-muted-foreground">THIS WEEK</p>
          {weeklyGoalMet && <Badge variant="default" className="mt-2">Goal Achieved!</Badge>}
        </CardContent>
      </Card>
      
      {/* Completion Rate */}
      <Card className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-border shadow-md group">
        
        
      </Card>
    </div>;
};