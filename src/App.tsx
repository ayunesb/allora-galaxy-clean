import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';
import MainLayout from "./layouts/MainLayout";
import AlloraBrainPage from "@/pages/allora-brain/AlloraBrainPage";
import Dashboard from "./pages/Dashboard";
import ErrorMonitoring from "@/pages/admin/ErrorMonitoring";
import InspectorPage from "@/pages/admin/InspectorPage";
import KPIAlertsPage from "@/pages/admin/KPIAlertsPage";
import AgentsPage from "@/pages/agents/AgentsPage";
import VaultPage from "@/pages/vault/VaultPage";
import PluginsPage from "@/pages/plugins/PluginsPage";
import InsightsPage from "@/pages/insights/InsightsPage";
import LaunchPage from "@/pages/launch/LaunchPage";
import StrategyEvolutionPage from "@/pages/strategy/StrategyEvolutionPage";
import AIDecisionsPage from "@/pages/admin/AIDecisionsPage";
import AdminAgentsPage from "@/pages/admin/AdminAgentsPage";
import AgentsLeaderboardPage from "@/pages/agents/AgentsLeaderboardPage";
import GalaxyPage from "@/pages/galaxy/GalaxyPage";
import PluginDetailPage from "@/pages/plugins/PluginDetailPage";
import PluginEvolutionPage from "@/pages/plugins/PluginEvolutionPage";
import WhatsAppDripPlugin from "@/plugins/WhatsAppDripPlugin";
import AgentsXpPage from "@/pages/agents/AgentsXpPage";
import AgentsPerformancePage from "@/pages/agents/AgentsPerformancePage";
import AcademyPage from "@/pages/academy/AcademyPage";
import ExplorePage from "@/pages/explore/ExplorePage";
import UnauthorizedPage from "@/pages/unauthorized";
import LoginPage from "@/pages/auth/LoginPage";
import Sidebar from "@/components/Sidebar";
import Layout from "@/components/Layout";
import OnboardingPage from "@/pages/onboarding/OnboardingPage";
import { queryClient } from './lib/react-query';

const Loading = () => <div>Loading...</div>;

function App() {
  console.log("App rendered at path:", window.location.pathname);

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/allora-brain" replace />} />
            <Route path="/allora-brain" element={<AlloraBrainPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/error-monitoring" element={<ErrorMonitoring />} />
            <Route path="/admin/inspector" element={<InspectorPage />} />
            <Route path="/admin/kpi-alerts" element={<KPIAlertsPage />} />
            <Route path="/admin/ai-decisions" element={<AIDecisionsPage />} />
            <Route path="/admin/agents" element={<AdminAgentsPage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/agents/leaderboard" element={<AgentsLeaderboardPage />} />
            <Route path="/agents/xp" element={<AgentsXpPage />} />
            <Route path="/agents/performance" element={<AgentsPerformancePage />} />
            <Route path="/vault" element={<VaultPage />} />
            <Route path="/plugins" element={<PluginsPage />} />
            <Route path="/plugins/:id" element={<PluginDetailPage />} />
            <Route path="/plugins/:id/evolution" element={<PluginEvolutionPage />} />
            <Route path="/plugins/whatsapp-drip" element={<WhatsAppDripPlugin />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/launch" element={<LaunchPage />} />
            <Route path="/strategy/evolution" element={<StrategyEvolutionPage />} />
            <Route path="/galaxy" element={<GalaxyPage />} />
            <Route path="/academy" element={<AcademyPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            {/* ...add other nested routes as needed... */}
            <Route path="/onboarding" element={<OnboardingPage />} />
            {/* 404 fallback route */}
            <Route path="*" element={<div className="p-10 text-red-500">404 – No page matched</div>} />
          </Route>
          <Route path="/auth/login" element={<LoginPage />} />
        </Routes>
      </Suspense>
    </QueryClientProvider>
  );
}

export default App;

// These are React Router v7 future warnings and do not require code changes.
// You can safely ignore them for now, or opt-in to the new behavior as described in the React Router docs.
