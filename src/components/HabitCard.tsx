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
  onAction?: () => void;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  onNavigate?: () => void;
}

export const HabitCard = ({ 
  title, 
  description, 
  icon, 
  type,
  completed, 
  onToggle,
  gradient,
  details,
  onAction,
  actionLabel,
  actionIcon,
  onNavigate
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
  
  const handleCardActivate = () => {
    if (onNavigate) onNavigate();
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (!onNavigate) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onNavigate();
    }
  };

  return (
    <Card
      className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden relative border border-border shadow-md bg-card ${onNavigate ? 'cursor-pointer' : ''}`}
      style={{ touchAction: 'manipulation' }}
      onClick={handleCardActivate}
      role={onNavigate ? 'button' : undefined}
      tabIndex={onNavigate ? 0 : undefined}
      onKeyDown={handleKeyDown}
      aria-label={onNavigate ? `${title}: open` : undefined}
    >
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
        {onNavigate && (
          <Button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onNavigate();
            }}
            className="w-full mt-4" 
            variant="outline"
            style={{ touchAction: 'manipulation' }}
          >
            {getActionText()}
          </Button>
        )}
        <div className="pt-2 text-xs text-muted-foreground">
          <a
            href="/articles/missional-habits"
            onClick={(e) => e.stopPropagation()}
            className="underline hover:text-foreground"
          >
            New to Missional Habits? Start here!
          </a>
        </div>
      </CardContent>
    </Card>
  );
};
