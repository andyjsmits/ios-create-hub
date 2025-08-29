import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { BottomNavigation } from "@/components/BottomNavigation";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import UserPage from "./pages/UserPage";
import HabitsPage from "./pages/HabitsPage";
import PrayPage from "./pages/PrayPage";
import UnionPage from "./pages/UnionPage";
import ListenPage from "./pages/ListenPage";
import ServePage from "./pages/ServePage";
import EchoPage from "./pages/EchoPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNavigation />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
