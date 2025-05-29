import React from "react";
import { Outlet } from "react-router-dom";

export interface AuthLayoutProps {
  children?: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      {children || <Outlet />}
    </div>
  );
};

export default AuthLayout;
