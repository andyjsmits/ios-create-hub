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
    <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden relative bg-gradient-to-br from-card to-white border-0 shadow-lg">
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
        style={{ background: gradient }}
      />
      <CardHeader className="relative pb-4">
        <div className="flex items-start gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 shadow-sm">
            {icon}
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl font-serif font-semibold text-foreground mb-2">{title}</CardTitle>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-muted-foreground">Today's Progress</span>
            <span className="text-primary font-semibold">
              {completedToday.filter(Boolean).length}/{habits.length}
            </span>
          </div>
          <div className="relative">
            <Progress value={progress} className="h-3 bg-muted/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full opacity-50"></div>
          </div>
        </div>
        
        <div className="space-y-3">
          {habits.map((habit, index) => (
            <div key={index} className="group/item flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-muted/20 to-muted/10 border border-border/30 hover:border-primary/20 transition-all duration-300">
              <span className={`text-sm font-medium transition-all duration-300 ${
                completedToday[index] 
                  ? 'line-through text-muted-foreground' 
                  : 'text-foreground group-hover/item:text-primary'
              }`}>
                {habit}
              </span>
              <Button
                size="sm"
                variant={completedToday[index] ? "default" : "outline"}
                onClick={() => onToggleHabit(index)}
                className={`h-9 w-9 p-0 rounded-xl transition-all duration-300 ${
                  completedToday[index] 
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                    : 'hover:bg-primary hover:text-primary-foreground hover:shadow-lg hover:shadow-primary/25'
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