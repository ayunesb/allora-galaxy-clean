
import React from 'react';

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {children}
      </div>
    </div>
  );
};

export default OnboardingLayout;
