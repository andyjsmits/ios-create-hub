import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface GuidedTourProps {
  open: boolean;
  onClose: () => void;
  onStartPrayer: () => void;
  onStartKickstart?: () => void;
}

// Lightweight first-run guided tour overlay (3 steps)
export const GuidedTour = ({ open, onClose, onStartPrayer }: GuidedTourProps) => {
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!open) setStep(1);
  }, [open]);

  if (!open) return null;

  const next = () => setStep((s) => Math.min(3, s + 1));
  const skip = () => {
    try { localStorage.setItem('tourCompleted', 'true'); } catch {}
    onClose();
  };
  const finish = () => {
    try { localStorage.setItem('tourCompleted', 'true'); } catch {}
    onStartPrayer();
  };

  const Wrapper: React.FC<{ children: any }>= ({ children }) => (
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-black/60" onClick={skip} />
      <div
        className="absolute left-0 right-0 mx-auto max-w-md w-[92%] rounded-2xl bg-background text-foreground shadow-2xl"
        style={{ top: 'calc(env(safe-area-inset-top) + 24px)' }}
      >
        {children}
      </div>
    </div>
  );

  return (
    <Wrapper>
      <div className="p-5">
        {step === 1 && (
          <div className="space-y-3">
            <h2 className="text-xl font-display font-bold">Welcome to PULSE</h2>
            <p className="text-sm text-muted-foreground">
              PULSE is a framework for growing in five missional habits that shape not just our schedules, but our hearts. It’s centred on Jesus and helps us take our next faithful steps together.
            </p>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-3">
            <h2 className="text-xl font-display font-bold">Five Habits, One Mission</h2>
            <p className="text-sm text-muted-foreground">
              Pray, Union, Listen, Serve, Echo. These aren’t a checklist—they’re shared practices Jesus modeled. Each habit includes a simple next step to live on mission with Christ.
            </p>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-3">
            <h2 className="text-xl font-display font-bold">Start with Prayer</h2>
            <p className="text-sm text-muted-foreground">
              Prayer is our first step: seek God and partner with the Spirit. Let’s set up a short prayer list and (optionally) a daily reminder so you can begin today.
            </p>
            <p className="text-xs text-muted-foreground">
              Tip: You can also start a simple 7‑day kickstart—one small step each day to form the habit.
            </p>
          </div>
        )}
        <div className="mt-5 flex items-center justify-between">
          <Button variant="ghost" onClick={skip}>Skip</Button>
          {step < 3 ? (
            <Button onClick={next}>Next</Button>
          ) : (
            <div className="flex gap-2">
              {typeof onStartKickstart === 'function' && (
                <Button variant="outline" onClick={() => { try { localStorage.setItem('tourCompleted', 'true'); } catch {}; onStartKickstart?.(); }}>
                  Start 7‑Day Kickstart
                </Button>
              )}
              <Button onClick={finish}>Start with Prayer</Button>
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
};
