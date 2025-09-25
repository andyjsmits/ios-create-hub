import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Mail } from "lucide-react";
import { showDebugOverlay } from "@/lib/debugOverlay";
import p2cLogo from "@/assets/p2c-students-logos.png";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkUser();

    // Handle email confirmation callback
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session && !error) {
        toast({
          title: "Email verified!",
          description: "Your account has been successfully verified.",
        });
        navigate("/");
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send verification back to our auth page for consistent handling
      const redirectUrl = `${window.location.origin}/auth`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Check your email to confirm your account.",
      });
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

  // Handle email verification links that include access_token in URL hash (web)
  useEffect(() => {
    const processHashSession = async () => {
      if (typeof window === 'undefined') return;
      if (window.location.protocol === 'capacitor:') return; // native handled elsewhere

      const hash = window.location.hash || '';
      if (!hash.includes('access_token')) return;

      const fragment = new URLSearchParams(hash.replace(/^#/, ''));
      const accessToken = fragment.get('access_token');
      const refreshToken = fragment.get('refresh_token') || '';
      const type = fragment.get('type');
      if (!accessToken) return;

      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      if (error) {
        console.error('Email verification session error:', error);
        toast({ title: 'Verification Error', description: 'We could not verify your email. Please try signing in.', variant: 'destructive' });
        return;
      }
      // Clean up the hash from URL
      try { window.history.replaceState({}, document.title, window.location.pathname); } catch {}
      // Route to a friendly verified splash screen
      navigate('/verified', { replace: true });
    };
    processHashSession();
  }, [navigate, toast]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.user) {
        window.location.href = '/';
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
      const isAndroid = navigator.userAgent.includes('Android');
      const redirectTo = isNative ? 'app.smits.pulse://auth/callback' : `${window.location.origin}/auth`;
      
      // Log OAuth config for debugging
      console.error('=== OAuth Config ===', JSON.stringify({
        isNative,
        isAndroid,
        redirectTo,
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        userAgent: navigator.userAgent.substring(0, 100),
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        hasCapacitor: !!(window as any).Capacitor,
        capacitorPlatform: (window as any).Capacitor?.getPlatform?.(),
        capacitorNative: (window as any).Capacitor?.isNativePlatform?.()
      }, null, 2));

      console.log('Starting Google OAuth:', {
        isNative,
        isAndroid,
        redirectTo,
        userAgent: navigator.userAgent,
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        port: window.location.port,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL
      });
      
      console.log('Calling signInWithOAuth with:', {
        provider: 'google',
        redirectTo,
        skipBrowserRedirect: isNative
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: isNative, // Skip automatic redirect on native, handle manually
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      console.log('OAuth response received:', {
        hasData: !!data,
        hasUrl: !!data?.url,
        url: data?.url,
        hasError: !!error,
        error: error?.message
      });

      if (error) throw error;

      console.log('OAuth response:', { hasUrl: !!data.url, url: data.url });

      // If we have a URL, open it appropriately
      if (data.url) {
        showDebugOverlay('Opening OAuth URL', { native: isNative, urlHost: (() => { try { return new URL(data.url!).host } catch { return 'unknown' }})() }, { sticky: true });
        if (isNative) {
          try {
            console.log('Attempting to open in-app browser...');
            const cap = (window as any).Capacitor;
            if (cap?.Plugins?.Browser?.open) {
              await cap.Plugins.Browser.open({ url: data.url, windowName: '_self', toolbarColor: '#ffffff' });
            } else {
              throw new Error('Browser plugin not available');
            }
          } catch (browserError) {
            console.error('In-app browser failed:', browserError);
            window.location.href = data.url;
          }
        } else {
          window.location.href = data.url;
        }
      }
    } catch (error: any) {
      console.error('Google OAuth error:', error);
      
      // Provide more specific error messaging for network issues
      let errorMessage = error.message;
      if (error.message?.includes('Network request failed') || error.message?.includes('timeout')) {
        errorMessage = 'Network connection failed. If using Android emulator, ensure you have internet connectivity and try again.';
      } else if (error.message?.includes('522') || error.message?.includes('Cloudflare')) {
        errorMessage = 'Authentication service temporarily unavailable. Please try again in a moment.';
      }
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const isNative = window.location.protocol === 'capacitor:';
      const isIOS = window.navigator.userAgent.includes('iPhone') || window.navigator.userAgent.includes('iPad');
      
      console.log('Starting Apple Sign-In:', {
        isNative,
        isIOS,
        userAgent: navigator.userAgent,
        platform: window.location.protocol
      });

      // On native iOS, skip the problematic native Apple Sign-In and go straight to web OAuth
      // which is working perfectly and is App Store compliant when using in-app browser
      if (isNative && isIOS) {
        console.log('iOS detected - using web OAuth for reliable authentication');
        // Skip native Apple Sign-In and use the working web OAuth approach
      }
      
      // Fallback to web OAuth for non-iOS or when native fails
      const isAndroid = navigator.userAgent.includes('Android');

      const redirectTo = isNative ? 'app.smits.pulse://auth/callback' : `${window.location.origin}/auth`;
      
      console.log('Using web OAuth fallback with redirectTo:', redirectTo);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo,
          skipBrowserRedirect: isNative, // Skip automatic redirect on native, handle manually
          queryParams: {
            scope: 'name email',
            response_mode: 'form_post'
          }
        }
      });

      if (error) throw error;

      console.log('OAuth response:', { hasUrl: !!data.url, url: data.url });

      // If we have a URL, open it appropriately
      if (data.url) {
        if (isNative) {
          try {
            const cap = (window as any).Capacitor;
            if (cap?.Plugins?.Browser?.open) {
              await cap.Plugins.Browser.open({ url: data.url, windowName: '_self', toolbarColor: '#ffffff' });
            } else {
              throw new Error('Browser plugin not available');
            }
          } catch (browserError) {
            console.error('In-app browser failed:', browserError);
            window.location.href = data.url;
          }
        } else {
          window.location.href = data.url;
        }
      }
    } catch (error: any) {
      console.error('Apple Sign-In error:', error);
      
      let errorMessage = error.message;
      if (error.code === 'provider_disabled') {
        errorMessage = 'Apple Sign-In is not enabled in the app configuration. Please contact support to enable Apple authentication.';
      } else if (error.message?.includes('400') || error.status === 400) {
        errorMessage = 'Apple authentication configuration error. Please ensure Apple Sign-In is properly configured.';
      } else if (error.message?.includes('user_cancelled_authorize') || error.message?.includes('cancelled')) {
        errorMessage = 'Apple Sign-In was cancelled.';
      } else if (error.message?.includes('Invalid redirect_uri')) {
        errorMessage = 'Invalid redirect URL for Apple Sign-In. Please contact support.';
      }
      
      toast({
        title: "Apple Sign-In Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`
      });

      if (error) throw error;

      toast({
        title: "Reset email sent!",
        description: "Check your email for password reset instructions.",
      });
      setShowForgotPassword(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <img 
              src={p2cLogo} 
              alt="P2C Students" 
              className="h-12 w-auto"
              onError={(e) => {
                console.error('Image failed to load:', e);
                e.currentTarget.style.display = 'none';
              }}
            />
            <MessageCircle className="h-8 w-8 text-primary" />
          </div>
          <div className="flex justify-center">
            <h1 className="text-3xl font-bold text-foreground mb-2 text-center">Welcome to PULSE</h1>
          </div>
          <p className="text-muted-foreground text-center">Sign in to track your missional habits</p>
        </div>

        {/* Auth Forms */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>Sign in or create your account to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                {!showForgotPassword ? (
                  <div className="space-y-4">
                    <form onSubmit={handleSignIn} className="space-y-4">
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
                    
                    <div className="text-center">
                      <button 
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot your password?
                      </button>
                    </div>

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
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={resetLoading}>
                      <Mail className="mr-2 h-4 w-4" />
                      {resetLoading ? "Sending..." : "Send Reset Email"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowForgotPassword(false)}
                    >
                      Back to Sign In
                    </Button>
                  </form>
                )}
              </TabsContent>
              
              <TabsContent value="signup">
                <div className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
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
                        minLength={8}
                        pattern="(?=.*[A-Za-z])(?=.*\\d).{8,}"
                        title="For security, passwords must contain a combination of letters and numbers, with a minimum of 8 characters."
                      />
                      <p className="text-xs text-muted-foreground">
                        For security, passwords must contain a combination of letters and numbers, with a minimum of 8 characters.
                      </p>
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
  );
};

export default Auth;
