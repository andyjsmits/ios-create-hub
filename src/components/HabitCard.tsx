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
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden relative border border-border shadow-md bg-card">
      <CardHeader className="relative pb-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl shadow-sm" style={{ background: gradient }}>
            <div className="text-white">
              {icon}
            </div>
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg font-display font-bold text-foreground mb-2">{title}</CardTitle>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-muted-foreground">PROGRESS</span>
            <span className="text-2xl font-display font-bold text-primary">
              {completedToday.filter(Boolean).length}/{habits.length}
            </span>
          </div>
          <div className="relative">
            <Progress value={progress} className="h-3 bg-muted" />
          </div>
        </div>
        
        <div className="space-y-3">
          {habits.map((habit, index) => (
            <div key={index} className="group/item flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 transition-all duration-300 bg-muted/30">
              <span className={`text-sm font-semibold transition-all duration-300 ${
                completedToday[index] 
                  ? 'line-through text-muted-foreground' 
                  : 'text-foreground'
              }`}>
                {habit}
              </span>
              <Button
                size="sm"
                variant={completedToday[index] ? "default" : "outline"}
                onClick={() => onToggleHabit(index)}
                className={`h-10 w-10 p-0 rounded-lg transition-all duration-300 ${
                  completedToday[index] 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'hover:bg-primary hover:text-primary-foreground'
                }`}
              >
                {completedToday[index] ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};