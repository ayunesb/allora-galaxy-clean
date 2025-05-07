
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ 
  currentStep, 
  totalSteps 
}) => {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
  
  return (
    <div className="mb-6">
      <Progress value={progressPercentage} />
      <div className="flex justify-between mt-2 text-sm text-muted-foreground">
        <span>Step {currentStep + 1} of {totalSteps}</span>
        <span>{progressPercentage.toFixed(0)}%</span>
      </div>
    </div>
  );
};

export default OnboardingProgress;
