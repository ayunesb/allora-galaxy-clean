
import { Navigate, RouteObject } from "react-router-dom";

// Layouts
import MainLayout from "@/components/layout/MainLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import AuthLayout from "@/layouts/AuthLayout";
import OnboardingLayout from "@/layouts/OnboardingLayout";

// Pages
import Dashboard from "@/pages/dashboard/Dashboard";
import NotFound from "@/pages/NotFound";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import OnboardingPage from "@/pages/onboarding";
import LaunchPage from "@/pages/launch/LaunchPage";
import GalaxyPage from "@/pages/galaxy/GalaxyPage";
import KpiDashboard from "@/pages/insights/KpiDashboard";
import PluginsPage from "@/pages/plugins/PluginsPage";
import PluginDetailPage from "@/pages/plugins/PluginDetailPage";
import PluginEvolutionPage from "@/pages/plugins/PluginEvolutionPage";
import AgentPerformance from "@/pages/agents/AgentPerformance";
import EvolutionPage from "@/pages/evolution";
import AlloraBrainPage from "@/pages/allora-brain/AlloraBrainPage";
import StandaloneAgentOSPage from "@/pages/standalone/StandaloneAgentOSPage";
import StrategyBuilder from "@/pages/launch/StrategyBuilder";
import StrategyEngine from "@/pages/strategy/StrategyEngine";
import ProfileSettings from "@/pages/settings/ProfileSettings";
import SettingsPage from "@/pages/settings/SettingsPage";
import BillingPage from "@/pages/billing/BillingPage";
import ExplorePage from "@/pages/explore/ExplorePage";
import NotificationsPage from "@/pages/notifications/NotificationsPage";
import TermsPage from "@/pages/legal/TermsPage";
import PrivacyPage from "@/pages/legal/PrivacyPage";
import DeletionRequestPage from "@/pages/legal/DeletionRequestPage";

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UserManagement from "@/pages/admin/UserManagement";
import SystemLogs from "@/pages/admin/SystemLogs";
import AiDecisions from "@/pages/admin/AiDecisions";
import CronJobsPage from "@/pages/admin/CronJobsPage";
import ApiKeysPage from "@/pages/admin/ApiKeysPage";
import PluginLogs from "@/pages/admin/PluginLogs";

// Auth components
import { RequireAuth } from "@/components/auth/RequireAuth";

// Unauthorized
import Unauthorized from "@/pages/unauthorized";

// Import Outlet for nested routes
import { Outlet } from "react-router-dom";

export const routes: RouteObject[] = [
  {
    path: "/auth",
    element: <AuthLayout><Outlet /></AuthLayout>,
    children: [
      {
        index: true,
        element: <Navigate to="/auth/login" replace />
      },
      {
        path: "login",
        element: <LoginPage />
      },
      {
        path: "register",
        element: <RegisterPage />
      },
      {
        path: "forgot-password",
        element: <ForgotPasswordPage />
      },
      {
        path: "reset-password",
        element: <ResetPasswordPage />
      }
    ]
  },
  {
    path: "/onboarding",
    element: <RequireAuth><OnboardingLayout><Outlet /></OnboardingLayout></RequireAuth>,
    children: [
      {
        index: true,
        element: <OnboardingPage />
      }
    ]
  },
  {
    path: "/",
    element: <RequireAuth><MainLayout /></RequireAuth>,
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
        path: "insights/kpis",
        element: <KpiDashboard />
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
        element: <BillingPage />
      },
      {
        path: "unauthorized",
        element: <Unauthorized />
      }
    ]
  },
  {
    path: "/admin",
    element: <RequireAuth roles={['admin', 'owner']}><AdminLayout><Outlet /></AdminLayout></RequireAuth>,
    children: [
      {
        index: true,
        element: <AdminDashboard />
      },
      {
        path: "users",
        element: <UserManagement />
      },
      {
        path: "system-logs",
        element: <SystemLogs />
      },
      {
        path: "logs",
        element: <Navigate to="/admin/system-logs" replace />
      },
      {
        path: "ai-decisions",
        element: <AiDecisions />
      },
      {
        path: "plugin-logs",
        element: <PluginLogs />
      },
      {
        path: "cron-jobs",
        element: <CronJobsPage />
      },
      {
        path: "api-keys",
        element: <ApiKeysPage />
      }
    ]
  },
  // Public routes
  {
    path: "/terms",
    element: <AuthLayout><TermsPage /></AuthLayout>
  },
  {
    path: "/privacy",
    element: <AuthLayout><PrivacyPage /></AuthLayout>
  },
  {
    path: "/deletion-request",
    element: <AuthLayout><DeletionRequestPage /></AuthLayout>
  },
  {
    path: "*",
    element: <NotFound />
  }
];

export default routes;
