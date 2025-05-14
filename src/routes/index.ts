
import { RouteObject } from "react-router-dom";
import { authRoutes } from "./auth";
import { mainRoutes } from "./main";
import { adminRoutes } from "./admin";
import { publicRoutes } from "./public";
import { onboardingRoutes } from "./onboarding";
import { notFoundRoute } from "./notFound";

// Export all routes combined
export const routes: RouteObject[] = [
  ...authRoutes,
  ...onboardingRoutes,
  ...mainRoutes,
  ...adminRoutes,
  ...publicRoutes,
  notFoundRoute
];

export default routes;
