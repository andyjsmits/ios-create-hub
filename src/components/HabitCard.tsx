import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Plus, Calendar, BookOpen, Users, Heart } from "lucide-react";
import { useState } from "react";

interface HabitCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  type: "prayer" | "bible" | "conversation" | "service" | "testimony";
  completed: boolean;
  onToggle: () => void;
  gradient: string;
  details: string;
}

export const HabitCard = ({ 
  title, 
  description, 
  icon, 
  type,
  completed, 
  onToggle,
  gradient,
  details 
}: HabitCardProps) => {
  const getActionText = () => {
    switch (type) {
      case "prayer": return "Prayer List";
      case "bible": return "Read & Reflect";
      case "conversation": return "Ask Questions";
      case "service": return "Serve Others";
      case "testimony": return "Share God's Goodness";
      default: return "Complete";
    }
  };

  const getSecondaryAction = () => {
    switch (type) {
      case "prayer": return "Set Reminder";
      case "bible": return "Resources";
      case "conversation": return "Weekly Goal";
      case "service": return "Log Service";
      case "testimony": return "Add Testimony";
      default: return null;
    }
  };
  
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden relative border border-border shadow-md bg-card">
      <CardHeader className="relative pb-4">
        <div className="flex items-start gap-4">
          <div className="p-4 rounded-xl shadow-sm" style={{ background: gradient }}>
            {icon}
          </div>
          <div className="flex-1">
            <CardTitle className="text-2xl font-display font-bold text-foreground mb-2">{title}</CardTitle>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">{description}</p>
            <p className="text-xs text-muted-foreground/80 mt-1">{details}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-muted-foreground">STATUS</span>
          <span className={`text-lg font-display font-bold ${completed ? 'text-primary' : 'text-muted-foreground'}`}>
            {completed ? 'COMPLETED' : 'PENDING'}
          </span>
        </div>
        
        <div className="space-y-3">
          <Button
            onClick={onToggle}
            variant={completed ? "default" : "outline"}
            className={`w-full h-12 rounded-lg transition-all duration-300 font-semibold ${
              completed 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'hover:bg-primary hover:text-primary-foreground'
            }`}
          >
            {completed ? (
              <><Check className="h-4 w-4 mr-2" /> Completed</>
            ) : (
              <><Plus className="h-4 w-4 mr-2" /> {getActionText()}</>
            )}
          </Button>
          
          {getSecondaryAction() && (
            <Button
              variant="ghost"
              className="w-full h-10 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              {getSecondaryAction()}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};