
import { RouteObject } from "react-router-dom";
import { Outlet } from "react-router-dom";
import OnboardingLayout from "@/layouts/OnboardingLayout";
import OnboardingPage from "@/pages/onboarding";
import { RequireAuth } from "@/components/auth/RequireAuth";

export const onboardingRoutes: RouteObject[] = [
  {
    path: "/onboarding",
    element: <RequireAuth><OnboardingLayout><Outlet /></OnboardingLayout></RequireAuth>,
    children: [
      {
        index: true,
        element: <OnboardingPage />
      }
    ]
  }
];
