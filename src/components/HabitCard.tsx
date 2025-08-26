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
    <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-4 hover:rotate-1 overflow-hidden relative border-2 border-border/50 shadow-lg" style={{ background: 'var(--gradient-card)' }}>
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-300"
        style={{ background: gradient }}
      />
      {/* Bold header bar */}
      <div className="h-2 w-full" style={{ background: gradient }}></div>
      
      <CardHeader className="relative pb-4">
        <div className="flex items-start gap-4">
          <div className="p-4 rounded-2xl border-2 border-primary/30 shadow-lg group-hover:shadow-xl transition-all duration-300" style={{ background: gradient }}>
            <div className="text-black">
              {icon}
            </div>
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl font-display font-bold text-foreground mb-2 uppercase tracking-wide">{title}</CardTitle>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold uppercase tracking-wide text-muted-foreground">PROGRESS</span>
            <span className="text-2xl font-display font-black" style={{ color: 'hsl(var(--primary))' }}>
              {completedToday.filter(Boolean).length}/{habits.length}
            </span>
          </div>
          <div className="relative">
            <Progress value={progress} className="h-4 bg-muted/30 border border-border/50" />
            <div className="absolute inset-0 rounded-full opacity-70" style={{ background: gradient }}></div>
          </div>
        </div>
        
        <div className="space-y-3">
          {habits.map((habit, index) => (
            <div key={index} className="group/item flex items-center justify-between p-4 rounded-xl border-2 border-border/30 hover:border-primary/50 transition-all duration-300 hover:shadow-lg" style={{ background: 'var(--gradient-card)' }}>
              <span className={`text-sm font-bold transition-all duration-300 ${
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
                className={`h-12 w-12 p-0 rounded-2xl border-2 transition-all duration-300 font-black ${
                  completedToday[index] 
                    ? 'border-primary shadow-xl' 
                    : 'hover:border-primary hover:shadow-xl hover:scale-110'
                }`}
                style={completedToday[index] ? { background: gradient, color: 'black' } : {}}
              >
                {completedToday[index] ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};