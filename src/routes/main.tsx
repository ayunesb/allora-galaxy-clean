
import { Navigate, RouteObject } from "react-router-dom";
import { Outlet } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { RequireAuth } from "@/components/auth/RequireAuth";
import Dashboard from "@/pages/dashboard/Dashboard";
import LaunchPage from "@/pages/launch/LaunchPage";
import StrategyBuilder from "@/pages/launch/StrategyBuilder";
import GalaxyPage from "@/pages/galaxy/GalaxyPage";
import NotificationsPage from "@/pages/notifications/NotificationsPage";
import PluginsPage from "@/pages/plugins/PluginsPage";
import PluginDetailPage from "@/pages/plugins/PluginDetailPage";
import PluginEvolutionPage from "@/pages/plugins/PluginEvolutionPage";
import AgentPerformance from "@/pages/agents/AgentPerformance";
import KpiDashboard from "@/pages/insights/KpiDashboard";
import KpiTrends from "@/pages/insights/KpiTrends";
import EvolutionPage from "@/pages/evolution";
import StrategyEngine from "@/pages/strategy/StrategyEngine";
import AlloraBrainPage from "@/pages/allora-brain/AlloraBrainPage";
import StandaloneAgentOSPage from "@/pages/standalone/StandaloneAgentOSPage";
import ExplorePage from "@/pages/explore/ExplorePage";
import SettingsPage from "@/pages/settings/SettingsPage";
import ProfileSettings from "@/pages/settings/ProfileSettings";
import BillingPage from "@/pages/billing/BillingPage";
import Unauthorized from "@/pages/unauthorized";
import { ProtectedRoute } from "./protectedRoutes";

export const mainRoutes: RouteObject[] = [
  {
    path: "/",
    element: <ProtectedRoute path="/" element={<MainLayout><Outlet /></MainLayout>} />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: "dashboard",
        element: <Dashboard />
      },
      {
        path: "launch",
        element: <LaunchPage />
      },
      {
        path: "launch/new",
        element: <StrategyBuilder />
      },
      {
        path: "galaxy",
        element: <GalaxyPage />
      },
      {
        path: "notifications",
        element: <NotificationsPage />
      },
      {
        path: "plugins",
        children: [
          {
            index: true,
            element: <PluginsPage />
          },
          {
            path: ":id",
            element: <PluginDetailPage />
          },
          {
            path: ":id/evolution",
            element: <PluginEvolutionPage />
          }
        ]
      },
      {
        path: "agents/performance",
        element: <AgentPerformance />
      },
      {
        path: "insights",
        children: [
          {
            path: "kpis",
            element: <KpiDashboard />
          },
          {
            path: "trends",
            element: <KpiTrends />
          }
        ]
      },
      {
        path: "evolution",
        element: <EvolutionPage />
      },
      {
        path: "evolution/:type",
        element: <EvolutionPage />
      },
      {
        path: "strategies/:strategyId",
        element: <StrategyEngine />
      },
      {
        path: "allora-brain",
        element: <AlloraBrainPage />
      },
      {
        path: "standalone",
        element: <StandaloneAgentOSPage />
      },
      {
        path: "explore",
        element: <ExplorePage />
      },
      {
        path: "settings",
        element: <SettingsPage />
      },
      {
        path: "settings/profile",
        element: <ProfileSettings />
      },
      {
        path: "settings/billing",
        element: <ProtectedRoute path="/settings/billing" element={<BillingPage />} roles={['admin', 'owner']} />
      },
      {
        path: "unauthorized",
        element: <Unauthorized />
      }
    ]
  }
];
