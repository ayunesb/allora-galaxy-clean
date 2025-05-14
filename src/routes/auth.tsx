
import { Navigate, RouteObject } from "react-router-dom";
import { Outlet } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import { AuthGuard } from "@/components/auth/AuthGuard";

// Auth routes - no auth required, but redirect to dashboard if already logged in
const redirectToDashboardIfLoggedIn = (element: JSX.Element) => (
  <AuthGuard roles={[]}>
    <Navigate to="/dashboard" replace />
  </AuthGuard>
);

export const authRoutes: RouteObject[] = [
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
  }
];
