import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Book, Ear, HandHeart, Volume2, ArrowRight } from "lucide-react";

const HabitsPage = () => {
  const navigate = useNavigate();

  const habits = [
    {
      key: "pray",
      title: "Pray",
      description: "Daily praying for people",
      icon: <MessageCircle className="h-6 w-6 text-white" />,
      gradient: "var(--gradient-yellow)",
      route: "/habits/pray",
    },
    {
      key: "union",
      title: "Union",
      description: "Walk in close union with God",
      icon: <Book className="h-6 w-6 text-white" />,
      gradient: "var(--gradient-blue)",
      route: "/habits/union",
    },
    {
      key: "listen",
      title: "Listen",
      description: "Engage others with meaningful questions",
      icon: <Ear className="h-6 w-6 text-white" />,
      gradient: "var(--gradient-purple)",
      route: "/habits/listen",
    },
    {
      key: "serve",
      title: "Serve",
      description: "Practical ways to serve others",
      icon: <HandHeart className="h-6 w-6 text-white" />,
      gradient: "var(--gradient-teal)",
      route: "/habits/serve",
    },
    {
      key: "echo",
      title: "Echo",
      description: "Speak back who God is",
      icon: <Volume2 className="h-6 w-6 text-white" />,
      gradient: "var(--gradient-orange)",
      route: "/habits/echo",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">PULSE Habits</h1>
          <p className="text-muted-foreground">
            Explore and track your daily missional habits
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {habits.map((habit) => (
            <Card
              key={habit.key}
              className="group cursor-pointer hover:shadow-lg transition-all duration-200"
              onClick={() => navigate(habit.route)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ background: habit.gradient }}
                  >
                    {habit.icon}
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg mb-2">{habit.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{habit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HabitsPage;