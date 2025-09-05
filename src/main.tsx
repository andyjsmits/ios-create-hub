import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize React app
createRoot(document.getElementById("root")!).render(<App />);

// Hide splash screen and set up OAuth handling once app is loaded (for Capacitor)
if (typeof window !== 'undefined') {
  // Small delay to ensure React has rendered
  setTimeout(() => {
    // Dynamically import and hide splash screen to avoid blocking
    import('@capacitor/splash-screen')
      .then(({ SplashScreen }) => {
        SplashScreen.hide();
      })
      .catch(() => {
        // Ignore if splash screen plugin not available
        console.log('SplashScreen plugin not available');
      });

    // Set up OAuth callback handling if on native platform
    if (window.location.protocol === 'capacitor:') {
      setupOAuthCallbackHandling();
    }
  }, 500);
}

async function setupOAuthCallbackHandling() {
  try {
    const [{ App: CapacitorApp }, { Browser }, { supabase }] = await Promise.all([
      import('@capacitor/app'),
      import('@capacitor/browser'),
      import('@/integrations/supabase/client')
    ]);

    CapacitorApp.addListener('appUrlOpen', async ({ url }) => {
      console.log('Deep link received:', url);
      
      if (url && url.includes('auth/callback')) {
        try {
          // Close the in-app browser
          try {
            await Browser.close();
          } catch (err) {
            console.log('Browser close error (may be expected):', err);
          }

          // Parse the callback URL
          const urlObj = new URL(url.replace('app.smits.pulse://', 'https://dummy.com/'));
          const params = new URLSearchParams(urlObj.search);
          const fragmentParams = new URLSearchParams(urlObj.hash.substring(1));
          
          console.log('Query params:', Object.fromEntries(params.entries()));
          console.log('Fragment params:', Object.fromEntries(fragmentParams.entries()));
          
          // Handle authorization code
          const code = params.get('code');
          if (code) {
            console.log('Found authorization code, exchanging for session');
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (error) {
              console.error('Code exchange error:', error);
            } else if (data.session) {
              console.log('Auth success via code exchange:', data.session);
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
                console.log('Auth success via access token:', data.session);
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
