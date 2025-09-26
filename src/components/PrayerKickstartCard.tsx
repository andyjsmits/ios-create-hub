import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useMemo, useRef, useState } from 'react';
import { notifySuccess, impactMedium } from '@/lib/haptics';
import { notificationService } from '@/services/notificationService';

type Kickstart = { startedAt: string; daysCompleted: string[] };

interface PrayerKickstartCardProps {
  kickstart?: Kickstart;
  save: (data: Partial<{ kickstart: Kickstart }>) => void;
}

const TASKS: string[] = [
  'Make a list of five friends; pray for one today.',
  'Pray for someone new you met or noticed today.',
  'Pray for renewal on your campus or in your community.',
  'Pray for a friend’s specific need and message them encouragement.',
  'Pray with someone (in person or by call/text).',
  'Pray for an opportunity to serve or bless someone today.',
  'Pray for boldness to share a small testimony this week.',
];

export function PrayerKickstartCard({ kickstart, save }: PrayerKickstartCardProps) {
  const localDateStr = (d: Date = new Date()) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const progress = kickstart?.daysCompleted?.length ?? 0;
  const prevProgress = useRef(progress);
  const [celebrate, setCelebrate] = useState(false);
  const started = !!kickstart?.startedAt;
  const todayIso = localDateStr();
  const todayAlreadyCompleted = !!kickstart?.daysCompleted?.includes(todayIso);
  const [justCompletedToday, setJustCompletedToday] = useState(false);
  const completedToday = todayAlreadyCompleted || justCompletedToday;

  const parseLocalYMD = (s: string) => {
    const [y,m,d] = s.split('-').map(Number);
    return new Date(y, (m||1)-1, d||1);
  };

  const dayIndex = useMemo(() => {
    if (!started || !kickstart?.startedAt) return 0;
    const start = parseLocalYMD(kickstart.startedAt);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(Math.max(diff, 0), TASKS.length - 1);
  }, [started, kickstart?.startedAt]);

  const startPlan = () => {
    const ks: Kickstart = { startedAt: todayIso, daysCompleted: [] };
    save({ kickstart: ks });
    // Schedule daily repeating notification at the user's reminder time (or 09:00)
    try {
      const t = (localStorage.getItem('dailyReminderTime') || '09:00');
      const [h, m] = t.split(':').map(Number);
      notificationService.scheduleLocalNotification({
        title: 'PULSE Kickstart',
        body: 'Today’s prayer step is ready.',
        id: 998,
        schedule: { repeats: true, on: { hour: h || 9, minute: m || 0 } }
      });
    } catch {}
  };

  const markTodayComplete = () => {
    if (!started) return;
    const set = new Set(kickstart?.daysCompleted ?? []);
    if (set.has(todayIso)) {
      // No-op: already recorded today; keep UI responsive by still saving current state
      save({ kickstart: { startedAt: kickstart!.startedAt, daysCompleted: Array.from(set) } });
      return;
    }
    set.add(todayIso);
    save({ kickstart: { startedAt: kickstart!.startedAt, daysCompleted: Array.from(set) } });
    // Optimistically reflect completion in UI until parent prop updates
    setJustCompletedToday(true);
  };

  useEffect(() => {
    if (prevProgress.current < 7 && progress >= 7) {
      setCelebrate(true);
      try { impactMedium(); notifySuccess(); } catch {}
      const t = setTimeout(() => setCelebrate(false), 4000);
      // Cancel kickstart notifications when completed
      try { notificationService.cancelNotification(998); } catch {}
      return () => clearTimeout(t);
    }
    prevProgress.current = progress;
  }, [progress]);

  if (progress >= TASKS.length && !celebrate) return null; // completed

  return (
    <Card className={`mb-6 ${celebrate ? 'ring-2 ring-primary animate-pulse' : ''}`}>
      <CardHeader>
        <CardTitle>{celebrate ? 'Kickstart Complete! 🎉' : '7‑Day Prayer Kickstart'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {celebrate ? (
          <>
            <p className="text-sm text-muted-foreground">Great job! You’ve completed 7 days of small daily steps in prayer.</p>
          </>
        ) : !started ? (
          <>
            <p className="text-sm text-muted-foreground">
              Start a week of simple daily steps in prayer. One small action each day to form the habit.
            </p>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Progress</div>
              <div className="text-sm font-medium">0 / 7</div>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '0%' }} />
            </div>
            <Button onClick={startPlan} className="w-full">Start Kickstart</Button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Progress</div>
              <div className="text-sm font-medium">{progress} / 7</div>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min((progress / 7) * 100, 100)}%` }} />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Today’s step</p>
              <p className="text-sm text-muted-foreground">{TASKS[dayIndex]}</p>
            </div>
            <Button onClick={markTodayComplete} className="w-full" variant={completedToday ? 'secondary' : 'default'} disabled={completedToday}>
              {completedToday ? 'Today completed' : 'Mark Today Complete'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
