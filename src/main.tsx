import { createRoot } from 'react-dom/client'
import { Capacitor } from '@capacitor/core'
import { App as CapacitorApp } from '@capacitor/app'
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
        // Convert the custom scheme URL to a regular URL for Supabase to process
        const callbackUrl = url.replace('app.smits.pulse://', 'https://dummy.com/');
        console.log('Processing auth callback:', callbackUrl);
        
        // Use Supabase's getSessionFromUrl to handle the OAuth callback
        const { data, error } = await supabase.auth.getSessionFromUrl({ url: callbackUrl });
        
        if (error) {
          console.error('Auth callback error:', error);
        } else if (data.session) {
          console.log('Auth success:', data.session);
          // The session is now stored in Supabase, redirect to home
          setTimeout(() => {
            window.location.href = '/';
          }, 100);
        }
      } catch (err) {
        console.error('OAuth callback processing error:', err);
      }
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
