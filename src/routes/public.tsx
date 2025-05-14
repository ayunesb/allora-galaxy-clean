
import { RouteObject } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout";
import TermsPage from "@/pages/legal/TermsPage";
import PrivacyPage from "@/pages/legal/PrivacyPage";
import DeletionRequestPage from "@/pages/legal/DeletionRequestPage";

export const publicRoutes: RouteObject[] = [
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
  }
];
