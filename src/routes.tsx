import { Navigate } from "react-router-dom";
import AuthRoutes from "./routes/AuthRoutes";
import OnboardingRoutes from "./routes/OnboardingRoutes";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import PublicRoutes from "./routes/PublicRoutes";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import SystemLogs from "./pages/admin/SystemLogs";
import ErrorMonitoring from "./pages/admin/ErrorMonitoring"; // Add import
import AiDecisions from "./pages/admin/AiDecisions";
import ApiKeysPage from "./pages/admin/ApiKeysPage";
import CronJobsPage from "./pages/admin/CronJobsPage";

// Define your routes here
const routes = [
  {
    path: "/",
    element: <PublicRoutes />,
    children: [
      { path: "/", element: <Navigate to="/dashboard" /> },
      // ...other public routes
    ],
  },
  {
    path: "/auth/*",
    element: <AuthRoutes />,
  },
  {
    path: "/onboarding/*",
    element: <OnboardingRoutes />,
  },
  {
    path: "/admin",
    element: <ProtectedRoutes />,
    children: [
      { path: "", element: <AdminDashboard /> },
      { path: "logs", element: <SystemLogs /> },
      { path: "error-monitoring", element: <ErrorMonitoring /> }, // Add route
      { path: "ai-decisions", element: <AiDecisions /> },
      { path: "api-keys", element: <ApiKeysPage /> },
      { path: "cron-jobs", element: <CronJobsPage /> },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
