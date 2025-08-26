import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Check, Plus } from "lucide-react";
import { useState } from "react";

interface HabitCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  habits: string[];
  completedToday: boolean[];
  onToggleHabit: (habitIndex: number) => void;
  gradient: string;
}

export const HabitCard = ({ 
  title, 
  description, 
  icon, 
  habits, 
  completedToday, 
  onToggleHabit,
  gradient 
}: HabitCardProps) => {
  const progress = (completedToday.filter(Boolean).length / habits.length) * 100;
  
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
      <div 
        className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
        style={{ background: gradient }}
      />
      <CardHeader className="relative">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-gradient-to-br from-primary/10 to-accent/10">
            {icon}
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Today's Progress</span>
            <span>{completedToday.filter(Boolean).length}/{habits.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="space-y-2">
          {habits.map((habit, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
              <span className={`text-sm ${completedToday[index] ? 'line-through text-muted-foreground' : ''}`}>
                {habit}
              </span>
              <Button
                size="sm"
                variant={completedToday[index] ? "default" : "outline"}
                onClick={() => onToggleHabit(index)}
                className="h-8 w-8 p-0"
              >
                {completedToday[index] ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};