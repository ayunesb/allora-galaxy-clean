
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles?: string[];
  onStepClick?: (step: number) => void;
  allowSkip?: boolean;
}

const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ 
  currentStep, 
  totalSteps,
  stepTitles = [],
  onStepClick,
  allowSkip = false
}) => {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
  
  const handleStepClick = (step: number) => {
    if (onStepClick && (allowSkip || step <= currentStep)) {
      onStepClick(step);
    }
  };
  
  return (
    <div className="mb-6 space-y-2">
      <div className="hidden sm:block">
        <Tabs value={currentStep.toString()} className="w-full">
          <TabsList className="w-full h-auto p-0 bg-transparent justify-between">
            {Array.from({ length: totalSteps }).map((_, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              const isClickable = allowSkip || index <= currentStep;
              
              return (
                <TabsTrigger
                  key={index}
                  value={index.toString()}
                  onClick={() => handleStepClick(index)}
                  disabled={!isClickable}
                  className={cn(
                    "flex-1 h-auto text-xs sm:text-sm rounded-none border-b-2 px-1 py-2 data-[state=active]:bg-transparent",
                    isCompleted 
                      ? "border-primary text-primary" 
                      : isCurrent 
                      ? "border-primary/70 text-foreground data-[state=active]:text-foreground" 
                      : "border-muted text-muted-foreground",
                    isClickable && "cursor-pointer hover:text-foreground"
                  )}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <span className={cn(
                      "flex items-center justify-center w-6 h-6 rounded-full text-xs",
                      isCompleted 
                        ? "bg-primary text-primary-foreground" 
                        : isCurrent 
                        ? "bg-primary/20 text-primary border border-primary" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {isCompleted ? "✓" : index + 1}
                    </span>
                    {stepTitles[index] && (
                      <span className="hidden sm:block text-center truncate max-w-[100px]">
                        {stepTitles[index]}
                      </span>
                    )}
                  </div>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>
      
      <div className="block sm:hidden">
        <Progress value={progressPercentage} className="h-2" />
      </div>
      
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Step {currentStep + 1} of {totalSteps}</span>
        <span>{progressPercentage.toFixed(0)}%</span>
      </div>
    </div>
  );
};

export default OnboardingProgress;
