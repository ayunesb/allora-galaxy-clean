
import { RouteObject } from "react-router-dom";
import { Outlet, Navigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UserManagement from "@/pages/admin/UserManagement";
import SystemLogs from "@/pages/admin/SystemLogs";
import AiDecisions from "@/pages/admin/AiDecisions";
import PluginLogs from "@/pages/admin/PluginLogs";
import CronJobsPage from "@/pages/admin/CronJobsPage";
import ApiKeysPage from "@/pages/admin/ApiKeysPage";
import SystemConfig from "@/pages/admin/SystemConfig";
import { ProtectedRoute } from "./protectedRoutes";

export const adminRoutes: RouteObject[] = [
  {
    path: "/admin",
    element: <ProtectedRoute 
      path="/admin" 
      element={<AdminLayout><Outlet /></AdminLayout>} 
      roles={['admin', 'owner']} 
    />,
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
      },
      {
        path: "config",
        element: <SystemConfig />
      }
    ]
  }
];
