import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Bell, Clock, User, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { notificationService } from "@/services/notificationService";
import { selection, notifySuccess } from "@/lib/haptics";
import { CAMPUSES } from "@/lib/campuses";

const UserPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  // Profile fields
  const [profileName, setProfileName] = useState("");
  const [profileInvolved, setProfileInvolved] = useState(false);
  const [profileCampus, setProfileCampus] = useState<string>("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [dailyReminderTime, setDailyReminderTime] = useState("09:00");
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Auth states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load user preferences when component mounts
  useEffect(() => {
    if (user) {
      loadUserPreferences();
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      setProfileLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, involved_in_p2c, involved_campus')
        .eq('id', user?.id)
        .single();
      if (!error && data) {
        setProfileName(data.display_name || "");
        setProfileInvolved(!!data.involved_in_p2c);
        setProfileCampus(data.involved_campus || "");
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const saveUserProfile = async () => {
    if (!user) return;
    try {
      setProfileLoading(true);
      // Try UPDATE first (succeeds with typical RLS policies)
      const { error: updateError, count } = await supabase
        .from('profiles')
        .update({
          display_name: profileName || null,
          involved_in_p2c: profileInvolved,
          involved_campus: profileInvolved ? (profileCampus || null) : null,
          onboarded: true,
        })
        .eq('id', user.id)
        .select('id', { count: 'exact', head: true });

      if (updateError) throw updateError;

      if (!count || count === 0) {
        // Create via security definer RPC to bypass RLS insert restrictions
        const { error: rpcError } = await supabase.rpc('ensure_profile', {
          p_display_name: profileName || null,
          p_involved: profileInvolved,
        } as any);
        if (rpcError) throw rpcError;
      }

      toast({ title: 'Profile Saved', description: 'Your profile has been updated.' });
    } catch (error: any) {
      console.error('Error saving profile:', error);
      const msg = /row-level security/i.test(error?.message || '')
        ? 'Profile could not be created due to security rules. Please sign out and sign back in to initialize your profile, then try again.'
        : (error.message || 'Failed to save profile');
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setProfileLoading(false);
    }
  };

  // Temporary time value while editing in the picker
  const [tempReminderTime, setTempReminderTime] = useState(dailyReminderTime);
  // Sync tempReminderTime when dailyReminderTime changes
  useEffect(() => {
    setTempReminderTime(dailyReminderTime);
  }, [dailyReminderTime]);

  const loadUserPreferences = async () => {
    try {
      // Load from localStorage for now (can be moved to database later)
      const savedNotifications = localStorage.getItem('notificationsEnabled');
      const savedDailyReminder = localStorage.getItem('dailyReminder');
      const savedReminderTime = localStorage.getItem('dailyReminderTime');
      
      if (savedNotifications !== null) {
        setNotificationsEnabled(JSON.parse(savedNotifications));
      }
      if (savedDailyReminder !== null) {
        setDailyReminder(JSON.parse(savedDailyReminder));
      }
      if (savedReminderTime) {
        setDailyReminderTime(savedReminderTime);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  // Allow overrides so we can persist immediately when state updates are pending
  const saveUserPreferences = async (overrides?: {
    notificationsEnabled?: boolean;
    dailyReminder?: boolean;
    dailyReminderTime?: string;
  }) => {
    try {
      const notificationsEnabledToSave = overrides?.notificationsEnabled ?? notificationsEnabled;
      const dailyReminderToSave = overrides?.dailyReminder ?? dailyReminder;
      const dailyReminderTimeToSave = overrides?.dailyReminderTime ?? dailyReminderTime;

      console.log('saveUserPreferences called, saving:', {
        notificationsEnabled: notificationsEnabledToSave,
        dailyReminder: dailyReminderToSave,
        dailyReminderTime: dailyReminderTimeToSave
      });
      
      localStorage.setItem('notificationsEnabled', JSON.stringify(notificationsEnabledToSave));
      localStorage.setItem('dailyReminder', JSON.stringify(dailyReminderToSave));
      localStorage.setItem('dailyReminderTime', dailyReminderTimeToSave);
      
      // Schedule/cancel daily reminder based on settings
      if (dailyReminderToSave && notificationsEnabledToSave) {
        console.log('Scheduling daily reminder...');
        await scheduleDailyReminder(dailyReminderTimeToSave);
      } else {
        console.log('Canceling daily reminder...');
        await cancelDailyReminder();
      }
      
      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated.",
      });
      try { notifySuccess(); } catch {}
    } catch (error) {
      console.error('Error saving user preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save notification preferences.",
        variant: "destructive",
      });
    }
  };

  const scheduleDailyReminder = async (time?: string) => {
    try {
      // Parse hour/minute from the configured or current time string and schedule a daily repeat
      const timeToUse = time ?? dailyReminderTime;
      const [hours, minutes] = timeToUse.split(':').map(Number);
      console.log(`Scheduling daily repeating reminder at ${hours}:${String(minutes).padStart(2, '0')} (local time)`);
      // Ensure any previously scheduled daily reminder is cleared first
      await notificationService.cancelNotification(999);

      await notificationService.scheduleLocalNotification({
        title: 'PULSE Daily Reminder',
        body: 'Time to engage with your missional habits! Check your progress and stay on track.',
        id: 999, // Use a fixed ID for daily reminders
        schedule: { repeats: true, on: { hour: hours, minute: minutes } },
      });

      console.log('Daily reminder scheduled successfully');
    } catch (error) {
      console.error('Error scheduling daily reminder:', error);
    }
  };

  const cancelDailyReminder = async () => {
    try {
      await notificationService.cancelNotification(999);
    } catch (error) {
      console.error('Error canceling daily reminder:', error);
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    
    if (enabled) {
      // Request permissions when enabling notifications
      const hasPermission = await notificationService.requestPermissions();
      if (!hasPermission) {
        setNotificationsEnabled(false);
        toast({
          title: "Permission Required",
          description: "Please enable notifications in your device settings to receive reminders.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Auto-save when toggled
    setTimeout(saveUserPreferences, 100);
    try { selection(); } catch {}
  };

  const handleDailyReminderToggle = async (enabled: boolean) => {
    setDailyReminder(enabled);
    // Auto-save when toggled
    setTimeout(saveUserPreferences, 100);
    try { selection(); } catch {}
  };

  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [pendingSaveTime, setPendingSaveTime] = useState<string | null>(null);

  const handleReminderTimeChange = (time: string) => {
    console.log('handleReminderTimeChange called with:', time);
    // Update temporary displayed value and mark as pending change; don't save yet
    setTempReminderTime(time);
    setPendingSaveTime(time);
  };

  const handleTimePickerFocus = () => {
    console.log('handleTimePickerFocus called, current time:', dailyReminderTime);
    setIsTimePickerOpen(true);
    setTempReminderTime(dailyReminderTime);
    setPendingSaveTime(null); // Clear any pending saves
  };

  const handleTimePickerBlur = () => {
    console.log('handleTimePickerBlur called, pendingTime:', pendingSaveTime, 'currentTime:', dailyReminderTime);
    setIsTimePickerOpen(false);
    
    // Only save if there's a pending time and it's different from current
    if (pendingSaveTime && pendingSaveTime !== dailyReminderTime) {
      console.log('Time changed, saving new time:', pendingSaveTime);
      setDailyReminderTime(pendingSaveTime);
      // Save with a short delay to ensure state is updated
      setTimeout(() => {
        console.log('Calling saveUserPreferences from timeout');
        // Persist and schedule using the new time explicitly to avoid stale state
        saveUserPreferences({ dailyReminderTime: pendingSaveTime });
      }, 200);
    } else {
      console.log('No time change detected, not saving');
      // Reset temp to current if no changes
      setTempReminderTime(dailyReminderTime);
    }
    setPendingSaveTime(null);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`
          }
        });
        if (error) throw error;
        toast({
          title: "Success!",
          description: "Check your email to confirm your account.",
        });
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          window.location.href = '/';
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const isNative = window.location.protocol === 'capacitor:' || !!(window as any).Capacitor;
      const redirectTo = isNative 
        ? 'app.smits.pulse://auth/callback' 
        : `${window.location.origin}/auth`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: isNative,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) throw error;

      // If we're on native platform and have a URL, open in-app browser
      if (isNative && data.url) {
        try {
          const capacitorWindow = window as any;
          if (capacitorWindow.Capacitor && capacitorWindow.Capacitor.Plugins && capacitorWindow.Capacitor.Plugins.Browser) {
            const browserResult = await capacitorWindow.Capacitor.Plugins.Browser.open({
              url: data.url
            });
            console.log('In-app browser opened successfully:', browserResult);
          } else {
            window.open(data.url, '_blank');
          }
        } catch (browserError) {
          console.error('In-app browser failed:', browserError);
          window.open(data.url, '_blank');
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const isNative = window.location.protocol === 'capacitor:' || !!(window as any).Capacitor;
      const redirectTo = isNative 
        ? 'app.smits.pulse://auth/callback' 
        : `${window.location.origin}/auth`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo,
          skipBrowserRedirect: isNative,
          queryParams: {
            scope: 'name email'
          }
        }
      });

      if (error) throw error;

      // If we're on native platform and have a URL, open in Safari View Controller
      if (isNative && data.url) {
        try {
          const capacitorWindow = window as any;
          if (capacitorWindow.Capacitor && capacitorWindow.Capacitor.Plugins && capacitorWindow.Capacitor.Plugins.Browser) {
            const browserResult = await capacitorWindow.Capacitor.Plugins.Browser.open({
              url: data.url,
              windowName: '_self'
            });
            console.log('Safari View Controller opened successfully:', browserResult);
          } else {
            window.open(data.url, '_self');
          }
        } catch (browserError) {
          console.error('Safari View Controller failed:', browserError);
          window.open(data.url, '_self');
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    
    try {
      // Call the database function to delete the user account and all associated data
      const { data, error } = await (supabase as any).rpc('delete_user_account');
      
      if (error) {
        throw new Error(error.message || 'Failed to delete account. Please contact support.');
      }

      // Check if the function returned an error
      if (data && !data.success) {
        throw new Error(data.error || 'Failed to delete account. Please contact support.');
      }

      toast({
        title: "Account Deleted",
        description: "Your account and all associated data have been permanently deleted.",
      });

      // Immediately sign out locally and redirect to auth
      try { await supabase.auth.signOut({ scope: 'global' } as any); } catch {}
      try {
        // Clear any local settings that might keep state around
        localStorage.removeItem('notificationsEnabled');
        localStorage.removeItem('dailyReminder');
        localStorage.removeItem('dailyReminderTime');
        localStorage.removeItem('tourCompleted');
        localStorage.removeItem('openPrayerManager');
      } catch {}
      // Use hard redirect to fully reset app state
      window.location.href = '/auth';
      
    } catch (error: any) {
      console.error('Account deletion error:', error);
      
      toast({
        title: "Error Deleting Account",
        description: error.message || "Failed to delete account. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Welcome to PULSE</CardTitle>
                <p className="text-muted-foreground">Sign in to access your account</p>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="signin">
                    <div className="space-y-4">
                      <form onSubmit={(e) => { setIsSignUp(false); handleAuth(e); }} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signin-email">Email</Label>
                          <Input
                            id="signin-email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signin-password">Password</Label>
                          <Input
                            id="signin-password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? "Signing in..." : "Sign In"}
                        </Button>
                      </form>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={handleGoogleSignIn}
                        >
                          <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h240z"></path>
                          </svg>
                          Continue with Google
                        </Button>
                        
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full bg-black text-white hover:bg-gray-800"
                          onClick={handleAppleSignIn}
                        >
                          <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="apple" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                            <path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                          </svg>
                          Continue with Apple
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="signup">
                    <div className="space-y-4">
                      <form onSubmit={(e) => { setIsSignUp(true); handleAuth(e); }} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-email">Email</Label>
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-password">Password</Label>
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? "Creating account..." : "Sign Up"}
                        </Button>
                      </form>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={handleGoogleSignIn}
                        >
                          <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                            <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h240z"></path>
                          </svg>
                          Continue with Google
                        </Button>
                        
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full bg-black text-white hover:bg-gray-800"
                          onClick={handleAppleSignIn}
                        >
                          <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="apple" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                            <path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
                          </svg>
                          Continue with Apple
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Beta Notice */}
          <Card className="border-amber-300/50">
            <CardHeader>
              <CardTitle className="text-amber-700">This app is in Beta</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Thanks for helping us test PULSE. We’re actively improving the experience and your feedback helps us a ton.
              </p>
              <p>
                Have suggestions or found an issue? Please email
                {' '}
                <a href="mailto:p2c-pulse-feedback@p2c.com" className="text-primary underline">p2c-pulse-feedback@p2c.com</a>.
              </p>
            </CardContent>
          </Card>
          {/* User Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="display-name">Name</Label>
                <Input
                  id="display-name"
                  placeholder="Your name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  disabled={profileLoading}
                />
                <p className="text-xs text-muted-foreground mt-1">Used to personalize your greeting.</p>
              </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="p2c-involved">Involved with Power to Change?</Label>
              <p className="text-sm text-muted-foreground">Toggle if you’re part of a P2C ministry</p>
            </div>
            <Switch
              id="p2c-involved"
              checked={profileInvolved}
              onCheckedChange={setProfileInvolved}
              disabled={profileLoading}
            />
          </div>
          {profileInvolved && (
            <div className="space-y-2">
              <Label htmlFor="campus-select">Campus</Label>
              <select
                id="campus-select"
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-base"
                value={profileCampus}
                onChange={(e) => setProfileCampus(e.target.value)}
                disabled={profileLoading}
              >
                <option value="">Choose a campus…</option>
                {CAMPUSES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {profileCampus === 'Other' && (
                <Input
                  placeholder="Type your campus name"
                  value={profileCampus === 'Other' ? '' : profileCampus}
                  onChange={(e) => setProfileCampus(e.target.value)}
                  disabled={profileLoading}
                />
              )}
            </div>
          )}

              <div className="flex gap-2">
                <Button onClick={saveUserProfile} disabled={profileLoading}>
                  {profileLoading ? 'Saving…' : 'Save Profile'}
                </Button>
                <div className="ml-auto text-right">
                  <Label className="text-sm font-medium text-muted-foreground block">Email</Label>
                  <p className="text-sm">{user.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for habit reminders
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={handleNotificationToggle}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="daily-reminder">Daily Reminder</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminded to complete your PULSE habits
                  </p>
                </div>
                <Switch
                  id="daily-reminder"
                  checked={dailyReminder}
                  onCheckedChange={handleDailyReminderToggle}
                  disabled={!notificationsEnabled}
                />
              </div>
              {dailyReminder && notificationsEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="reminder-time" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Reminder Time
                  </Label>
                  <div className="space-y-2">
                    <Input
                      id="reminder-time"
                      type="time"
                      value={isTimePickerOpen ? tempReminderTime : dailyReminderTime}
                      onChange={(e) => handleReminderTimeChange(e.target.value)}
                      onFocus={handleTimePickerFocus}
                      onBlur={handleTimePickerBlur}
                      className="w-32"
                    />
                    <div className="text-sm text-muted-foreground">
                      Daily reminder at {new Date(`2000-01-01T${dailyReminderTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (local time)
                      {isTimePickerOpen && tempReminderTime !== dailyReminderTime && (
                        <span className="text-amber-600 ml-2">• Tap "Done" to save changes</span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tap the time above to change it. Your reminder will be saved when you tap "Done" on the time picker.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={signOut} variant="outline" className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>This action cannot be undone. This will permanently delete your account and remove all your data from our servers.</p>
                      <p className="font-medium text-foreground">This includes:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Your user profile and settings</li>
                        <li>All habit tracking data</li>
                        <li>Prayer logs and personal notes</li>
                        <li>Any other personal information stored in the app</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? "Deleting..." : "Yes, delete my account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
        
        {/* Version indicator */}
        <div className="text-center mt-8 pb-4">
          <p className="text-xs text-muted-foreground/60">v1.17.0</p>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
