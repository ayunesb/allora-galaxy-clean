import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepsProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  className?: string;
}

export const Steps: React.FC<StepsProps> = ({
  currentStep,
  totalSteps,
  labels = [],
  className,
}) => {
  return (
    <div className={cn("flex items-center w-full", className)}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        const isLast = stepNumber === totalSteps;

        return (
          <React.Fragment key={stepNumber}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "rounded-full flex items-center justify-center w-8 h-8 text-sm font-medium border",
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground"
                    : isActive
                    ? "border-primary text-primary"
                    : "border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
              </div>

              {labels && labels[index] && (
                <span
                  className={cn(
                    "mt-1 text-xs text-center",
                    isActive || isCompleted
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  {labels[index]}
                </span>
              )}
            </div>

            {!isLast && (
              <div
                className={cn(
                  "h-[1px] flex-1 mx-2",
                  isCompleted ? "bg-primary" : "bg-muted-foreground/30"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Steps;
