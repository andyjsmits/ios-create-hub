import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface WhatsNewModalProps {
  open: boolean;
  onClose: () => void;
}

export const WHATS_NEW_NOTIFS_KEY = 'whats_new_notifications_fix_v1_seen';

export default function WhatsNewModal({ open, onClose }: WhatsNewModalProps) {
  // Prevent background scroll when open (Dialog typically handles, but keep tidy)
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>What’s New: Notification Reliability</DialogTitle>
          <DialogDescription>
            We’ve fixed an issue where prayer reminders stopped after a week.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            Your reminders now repeat reliably. To restart any older reminders, toggle them off and back on in the Prayer Manager.
          </p>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button onClick={onClose}>Got it</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
