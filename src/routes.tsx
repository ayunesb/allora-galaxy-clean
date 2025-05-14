import { RouteObject } from "react-router-dom";
import { authRoutes } from "./routes/auth";
import { mainRoutes } from "./routes/main";
import { adminRoutes } from "./routes/admin";
import { publicRoutes } from "./routes/public";
import { onboardingRoutes } from "./routes/onboarding";
import { notFoundRoute } from "./routes/notFound";
import AlloraOSDocs from './pages/documentation/AlloraOSDocs';

// Export all routes combined
export const routes: RouteObject[] = [
  ...authRoutes,
  ...onboardingRoutes,
  ...mainRoutes,
  ...adminRoutes,
  ...publicRoutes,
  notFoundRoute,
  {
    path: '/documentation',
    element: <AlloraOSDocs />,
  }
];

export default routes;
