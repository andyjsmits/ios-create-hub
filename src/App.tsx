import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import WhatsNewModal, { WHATS_NEW_NOTIFS_KEY } from "@/components/WhatsNewModal";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import UserPage from "./pages/UserPage";
import HabitsPage from "./pages/HabitsPage";
import PrayPage from "./pages/PrayPage";
import UnionPage from "./pages/UnionPage";
import ListenPage from "./pages/ListenPage";
import ServePage from "./pages/ServePage";
import Verified from "./pages/Verified";
import EchoPage from "./pages/EchoPage";
import SupportPage from "./pages/SupportPage";
import NotFound from "./pages/NotFound";
import MissionalHabits from "./pages/MissionalHabits";

const queryClient = new QueryClient();

const App = () => {
  const [showWhatsNew, setShowWhatsNew] = useState(false);

  useEffect(() => {
    try {
      const isNative = Capacitor.isNativePlatform?.() ?? false;
      const platform = Capacitor.getPlatform?.() ?? 'web';
      // Only show automatically on native iOS
      if (!isNative || platform !== 'ios') return;

      const seen = localStorage.getItem(WHATS_NEW_NOTIFS_KEY);
      if (!seen) setShowWhatsNew(true);
    } catch {
      // no-op
    }
  }, []);

  const handleCloseWhatsNew = () => {
    try { localStorage.setItem(WHATS_NEW_NOTIFS_KEY, '1'); } catch {}
    setShowWhatsNew(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="relative">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/user" element={<UserPage />} />
                <Route path="/habits" element={<HabitsPage />} />
                <Route path="/habits/pray" element={<PrayPage />} />
                <Route path="/habits/union" element={<UnionPage />} />
                <Route path="/habits/listen" element={<ListenPage />} />
                <Route path="/habits/serve" element={<ServePage />} />
                <Route path="/habits/echo" element={<EchoPage />} />
                <Route path="/verified" element={<Verified />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/articles/missional-habits" element={<MissionalHabits />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <BottomNavigation />
              <WhatsNewModal open={showWhatsNew} onClose={handleCloseWhatsNew} />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
