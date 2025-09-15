import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { supabase } from '@/integrations/supabase/client'

// Initialize React app
createRoot(document.getElementById("root")!).render(<App />);

// Hide splash screen and set up OAuth handling once app is loaded (for Capacitor)
if (typeof window !== 'undefined') {
  // Small delay to ensure React has rendered
  setTimeout(() => {
    // Use window object to access SplashScreen plugin
    const capacitorWindow = window as any;
    if (capacitorWindow.Capacitor && capacitorWindow.Capacitor.Plugins && capacitorWindow.Capacitor.Plugins.SplashScreen) {
      try {
        capacitorWindow.Capacitor.Plugins.SplashScreen.hide();
        console.log('Splash screen hidden successfully');
      } catch (error) {
        console.log('Error hiding splash screen:', error);
      }
    } else {
      console.log('SplashScreen plugin not available on window object');
    }

    // Set up OAuth callback handling if on native platform
    if (window.location.protocol === 'capacitor:') {
      setupOAuthCallbackHandling();
    }
  }, 1000); // Increased delay to show logo a bit longer
}

async function setupOAuthCallbackHandling() {
  try {
    // Use window object to access Capacitor plugins instead of dynamic imports
    const capacitorWindow = window as any;
    if (!capacitorWindow.Capacitor || !capacitorWindow.Capacitor.Plugins) {
      console.log('Capacitor plugins not available on window object');
      return;
    }
    
    const CapacitorApp = capacitorWindow.Capacitor.Plugins.App;
    const Browser = capacitorWindow.Capacitor.Plugins.Browser;
    
    console.log('OAuth callback handling set up with plugins:', {
      hasApp: !!CapacitorApp,
      hasBrowser: !!Browser,
      hasSupabase: !!supabase
    });

    CapacitorApp.addListener('appUrlOpen', async ({ url }) => {
      console.log('Deep link received:', url);
      
      if (url && url.includes('auth/callback')) {
        try {
          // Close the in-app browser
          try {
            if (Browser && Browser.close) {
              await Browser.close();
            }
          } catch (err) {
            console.log('Browser close error (may be expected):', err);
          }

          // Parse the callback URL
          const urlObj = new URL(url.replace('app.smits.pulse://', 'https://dummy.com/'));
          const params = new URLSearchParams(urlObj.search);
          const fragmentParams = new URLSearchParams(urlObj.hash.substring(1));
          
          // Avoid logging tokens or sensitive callback params in production
          if (import.meta.env.DEV) {
            console.log('Query params (dev):', Object.fromEntries(params.entries()));
            console.log('Fragment param keys (dev):', Array.from(fragmentParams.keys()));
          }
          
          // Handle authorization code
          const code = params.get('code');
          if (code) {
            console.log('Found authorization code, exchanging for session');
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (error) {
              console.error('Code exchange error:', error);
            } else if (data.session) {
              if (import.meta.env.DEV) {
                console.log('Auth success via code exchange (dev)');
              }
              setTimeout(() => {
                window.location.href = '/';
              }, 500);
            }
          } else {
            // Handle access token
            const accessToken = fragmentParams.get('access_token');
            const refreshToken = fragmentParams.get('refresh_token');
            
            if (accessToken) {
              console.log('Found access token, setting session manually');
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || ''
              });
              
              if (error) {
                console.error('Session setup error:', error);
              } else if (data.session) {
                if (import.meta.env.DEV) {
                  console.log('Auth success via access token (dev)');
                }
                setTimeout(() => {
                  window.location.href = '/';
                }, 500);
              }
            }
          }
        } catch (err) {
          console.error('OAuth callback processing error:', err);
        }
      }
    });
    
    console.log('OAuth callback handling set up successfully');
  } catch (error) {
    console.error('Error setting up OAuth callback handling:', error);
    // Don't let this break the app - OAuth will still work with external browser
  }
}
