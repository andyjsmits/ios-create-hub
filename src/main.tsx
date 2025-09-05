import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import { App as CapacitorApp } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import App from './App.tsx'
import './index.css'
import { supabase } from '@/integrations/supabase/client'

// Handle OAuth callbacks in Capacitor
if (Capacitor.isNativePlatform()) {
  CapacitorApp.addListener('appUrlOpen', async ({ url }) => {
    console.log('Deep link received:', url);
    
    // Check if this is an auth callback
    if (url.includes('auth/callback')) {
      try {
        // Parse the callback URL to extract parameters
        const urlObj = new URL(url.replace('app.smits.pulse://', 'https://dummy.com/'));
        console.log('Processing auth callback:', urlObj.href);
        
        // Extract all parameters from both query string and fragment
        const params = new URLSearchParams(urlObj.search);
        const fragmentParams = new URLSearchParams(urlObj.hash.substring(1));
        
        // Log all parameters for debugging
        console.log('Query params:', Object.fromEntries(params.entries()));
        console.log('Fragment params:', Object.fromEntries(fragmentParams.entries()));
        
        // Close the in-app browser when we receive the callback
        try {
          await Browser.close();
        } catch (err) {
          // Browser might not be open or already closed
          console.log('Browser close error (may be expected):', err);
        }

        // Check for authorization code (PKCE flow)
        const code = params.get('code');
        if (code) {
          console.log('Found authorization code, exchanging for session');
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('Code exchange error:', error);
          } else if (data.session) {
            console.log('Auth success via code exchange:', data.session);
            // Wait a moment for the auth state to propagate
            setTimeout(() => {
              window.location.href = '/';
            }, 500);
          }
        } else {
          // Check for access token in fragment (implicit flow)
          const accessToken = fragmentParams.get('access_token');
          const refreshToken = fragmentParams.get('refresh_token');
          
          if (accessToken) {
            console.log('Found access token, setting session manually');
            
            // Set the session manually using the tokens
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            });
            
            if (error) {
              console.error('Session setup error:', error);
            } else if (data.session) {
              console.log('Auth success via access token:', data.session);
              // Wait a moment for the auth state to propagate
              setTimeout(() => {
                window.location.href = '/';
              }, 500);
            }
          } else {
            console.log('No code or access token found in callback URL');
            // Try to refresh current session in case it's already established
            const { data } = await supabase.auth.getSession();
            if (data.session) {
              console.log('Found existing session:', data.session);
              window.location.href = '/';
            } else {
              console.log('No valid session found');
            }
          }
        }
      } catch (err) {
        console.error('OAuth callback processing error:', err);
      }
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
