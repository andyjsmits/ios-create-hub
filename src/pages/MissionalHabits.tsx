import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MissionalHabits = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        <div
          className="relative container mx-auto px-6 text-center text-white"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)', paddingBottom: '16px' }}
        >
          <div className="flex items-center justify-start">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="text-white hover:bg-white/10 px-3 py-2"
            >
              Back to PULSE
            </Button>
          </div>
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-display font-black mb-4 leading-tight">
              New to Missional Habits? Start here!
            </h1>
            <p className="text-xl md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed opacity-90">
              An introduction to the vision behind PULSE and a walkthrough of each habit.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-3xl" style={{ paddingBottom: 'calc(3rem + env(safe-area-inset-bottom))' }}>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What are Missional Habits?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Missional habits are simple weekly practices that shape us to know Jesus, love people, and join God’s work where we live, study, and serve. PULSE focuses on five clear habits that are easy to begin, and powerful over time when practiced consistently.
            </p>
            <p>
              Rather than adding pressure, these habits offer small, repeatable steps that help us pay attention to God and people. Start small, stay consistent, and celebrate progress.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8" id="pray">
          <CardHeader>
            <CardTitle>1) Pray</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              We seek God first and partner with Him in prayer. Build a short list of friends and pray for them regularly. PULSE can remind you, help you track, and keep simple notes as you pray.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8" id="union">
          <CardHeader>
            <CardTitle>2) Union</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              We know God and are shaped by His heart through Scripture and reflection. Use the provided Gospel reading plan or your own rhythm to be with Jesus and hear His voice.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8" id="listen">
          <CardHeader>
            <CardTitle>3) Listen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              Listening is a way of loving. Practice curious, caring conversations—ask good questions and pay attention to people’s stories. Notice where God might already be at work.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8" id="serve">
          <CardHeader>
            <CardTitle>4) Serve</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              We go toward others in love. Look for small, practical ways to serve people around you—on your campus, in your neighbourhood, and among friends.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-8" id="echo">
          <CardHeader>
            <CardTitle>5) Echo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              We experience and give voice to God’s story. Share where you see God’s goodness or how the gospel is good news in real life. Small testimonies encourage faith.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Keep it simple</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              Start with one or two habits this week. Set a realistic goal, use reminders, and celebrate small wins. Over time, these rhythms form us into people who know Jesus deeply and love others well.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MissionalHabits;

