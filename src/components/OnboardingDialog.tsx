import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CAMPUSES } from '@/lib/campuses';

interface OnboardingDialogProps {
  userId: string;
  open: boolean;
  onClose: () => void;
}

export const OnboardingDialog = ({ userId, open, onClose }: OnboardingDialogProps) => {
  const [name, setName] = useState('');
  const [involved, setInvolved] = useState<boolean>(false);
  const [campus, setCampus] = useState<string>('');
  const [otherCampus, setOtherCampus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadProfile = async () => {
      if (!open || !userId) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, involved_in_p2c, involved_campus')
        .eq('id', userId)
        .single();
      if (!error && data) {
        setName(data.display_name || '');
        setInvolved(!!data.involved_in_p2c);
        setCampus(data.involved_campus || '');
      }
    };
    loadProfile();
  }, [open, userId]);

  const handleSave = async () => {
    try {
      setLoading(true);
      // Try UPDATE first
      const chosenCampus = campus === 'Other' ? (otherCampus || null) : (campus || null);
      const { error: updateError, count } = await supabase
        .from('profiles')
        .update({
          display_name: name || null,
          involved_in_p2c: involved,
          involved_campus: involved ? chosenCampus : null,
          onboarded: true,
        })
        .eq('id', userId)
        .select('id', { count: 'exact', head: true });

      if (updateError) throw updateError;

      if (!count || count === 0) {
        // Create via security definer RPC to bypass RLS insert restrictions
        const { error: rpcError } = await supabase.rpc('ensure_profile', {
          p_display_name: name || null,
          p_involved: involved,
        } as any);
        if (rpcError) throw rpcError;
      }

      toast({ title: 'Welcome!', description: 'Your profile has been updated.' });
      onClose();
    } catch (err: any) {
      const msg = /row-level security/i.test(err?.message || '')
        ? 'Profile could not be created due to security rules. Please sign out and sign back in to initialize your profile, then try again.'
        : (err.message || 'Failed to save profile.');
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to PULSE</DialogTitle>
          <DialogDescription>
            Tell us a bit about you. You can change this later in your profile.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="display-name">Your name</Label>
            <Input id="display-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Alex" />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="involved">Involved with a Power to Change ministry?</Label>
            </div>
            <Switch id="involved" checked={involved} onCheckedChange={setInvolved} />
          </div>
          {involved && (
            <div className="space-y-2">
              <Label htmlFor="campus">Select your campus</Label>
              <select
                id="campus"
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-base"
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
              >
                <option value="">Choose a campus…</option>
                {CAMPUSES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {campus === 'Other' && (
                <div className="space-y-1">
                  <Label htmlFor="other-campus">Campus name</Label>
                  <Input id="other-campus" value={otherCampus} onChange={(e) => setOtherCampus(e.target.value)} placeholder="Type your campus name" />
                </div>
              )}
            </div>
          )}
          <Button className="w-full" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
