import React from "react";
import { Outlet } from "react-router-dom";

export interface OnboardingLayoutProps {
  children?: React.ReactNode;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col">{children || <Outlet />}</main>
    </div>
  );
};

export default OnboardingLayout;
