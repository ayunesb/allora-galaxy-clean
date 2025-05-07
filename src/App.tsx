
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Auth
import AuthPage from "./pages/auth/AuthPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Onboarding
import OnboardingWizard from "./components/onboarding/OnboardingWizard";

// Main pages
import Dashboard from "./pages/dashboard/Dashboard";
import StrategyEngine from "./pages/strategy/StrategyEngine";
import PluginsPage from "./pages/plugins/PluginsPage";
import PluginEvolutionPage from "./pages/plugins/PluginEvolutionPage";
import GalaxyExplorer from "./pages/galaxy/GalaxyExplorer";
import AgentPerformance from "./pages/agents/AgentPerformance";
import KpiDashboard from "./pages/insights/KpiDashboard";

// Admin pages
import AiDecisions from "./pages/admin/AiDecisions";
import PluginLogs from "./pages/admin/PluginLogs";
import UserManagement from "./pages/admin/UserManagement";

// Auth and workspace providers
import { AuthProvider } from "./context/AuthContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth routes */}
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Onboarding */}
            <Route path="/onboarding" element={<OnboardingWizard />} />
            
            {/* Protected routes */}
            <Route element={
              <WorkspaceProvider>
                <ProtectedRoute />
              </WorkspaceProvider>
            }>
              <Route path="/" element={<Dashboard />} />
              <Route path="/launch" element={<StrategyEngine />} />
              <Route path="/plugins" element={<PluginsPage />} />
              <Route path="/plugins/:id/evolution" element={<PluginEvolutionPage />} />
              <Route path="/explore" element={<GalaxyExplorer />} />
              <Route path="/agents/performance" element={<AgentPerformance />} />
              <Route path="/insights/kpis" element={<KpiDashboard />} />
              
              {/* Admin routes */}
              <Route path="/admin/ai-decisions" element={<AiDecisions />} />
              <Route path="/admin/plugin-logs" element={<PluginLogs />} />
              <Route path="/admin/users" element={<UserManagement />} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
