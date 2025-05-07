
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import MobileNav from "./components/layout/MobileNav";

// Auth
import AuthPage from "./pages/auth/AuthPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Unauthorized from "./pages/unauthorized";

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
import SystemLogs from "./pages/admin/SystemLogs";
import UserManagement from "./pages/admin/UserManagement";

// Auth and workspace providers
import { AuthProvider } from "./context/AuthContext";
import { WorkspaceProvider } from "./context/WorkspaceContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <AuthProvider>
        <TooltipProvider>
          <ErrorBoundary>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="flex min-h-screen">
                <Routes>
                  {/* Auth routes */}
                  <Route path="/auth" element={<AuthPage />} />
                  
                  {/* Unauthorized page */}
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  
                  {/* Onboarding */}
                  <Route 
                    path="/onboarding" 
                    element={
                      <WorkspaceProvider>
                        <OnboardingWizard />
                      </WorkspaceProvider>
                    } 
                  />
                  
                  {/* Protected routes */}
                  <Route element={
                    <WorkspaceProvider>
                      <ProtectedRoute />
                    </WorkspaceProvider>
                  }>
                    <Route path="/" element={
                      <>
                        <MobileNav />
                        <Dashboard />
                      </>
                    } />
                    <Route path="/launch" element={
                      <>
                        <MobileNav />
                        <StrategyEngine />
                      </>
                    } />
                    <Route path="/plugins" element={
                      <>
                        <MobileNav />
                        <PluginsPage />
                      </>
                    } />
                    <Route path="/plugins/:id/evolution" element={
                      <>
                        <MobileNav />
                        <PluginEvolutionPage />
                      </>
                    } />
                    <Route path="/explore" element={
                      <>
                        <MobileNav />
                        <GalaxyExplorer />
                      </>
                    } />
                    <Route path="/agents/performance" element={
                      <>
                        <MobileNav />
                        <AgentPerformance />
                      </>
                    } />
                    <Route path="/insights/kpis" element={
                      <>
                        <MobileNav />
                        <KpiDashboard />
                      </>
                    } />
                    
                    {/* Admin routes */}
                    <Route path="/admin/ai-decisions" element={
                      <>
                        <MobileNav />
                        <AiDecisions />
                      </>
                    } />
                    <Route path="/admin/plugin-logs" element={
                      <>
                        <MobileNav />
                        <PluginLogs />
                      </>
                    } />
                    <Route path="/admin/system-logs" element={
                      <>
                        <MobileNav />
                        <SystemLogs />
                      </>
                    } />
                    <Route path="/admin/users" element={
                      <>
                        <MobileNav />
                        <UserManagement />
                      </>
                    } />
                  </Route>
                  
                  {/* Catch-all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </BrowserRouter>
          </ErrorBoundary>
        </TooltipProvider>
      </AuthProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
