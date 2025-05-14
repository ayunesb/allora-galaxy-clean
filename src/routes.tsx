
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

// Admin Pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UserManagement from "@/pages/admin/UserManagement";
import SystemLogs from "@/pages/admin/SystemLogs";
import AiDecisions from "@/pages/admin/AiDecisions";
import PluginLogs from "@/pages/admin/PluginLogs";
import ApiKeysPage from "@/pages/admin/ApiKeysPage";

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
    element: <OnboardingLayout><Outlet /></OnboardingLayout>,
    children: [
      {
        index: true,
        element: <OnboardingPage />
      }
    ]
  },
  {
    path: "/",
    element: <MainLayout />,
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
        path: "galaxy",
        element: <GalaxyPage />
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
        path: "allora-brain",
        element: <AlloraBrainPage />
      },
      {
        path: "standalone",
        element: <StandaloneAgentOSPage />
      },
      {
        path: "admin",
        element: <AdminLayout><Outlet /></AdminLayout>,
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
            path: "ai-decisions",
            element: <AiDecisions />
          },
          {
            path: "plugin-logs",
            element: <PluginLogs />
          },
          {
            path: "api-keys",
            element: <ApiKeysPage />
          }
        ]
      },
      {
        path: "unauthorized",
        element: <Unauthorized />
      }
    ]
  },
  {
    path: "*",
    element: <NotFound />
  }
];
