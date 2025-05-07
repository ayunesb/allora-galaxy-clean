
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onComplete?: () => void;
  isNextDisabled: boolean;
  isSubmitting: boolean;
  showSkip?: boolean;
  onSkip?: () => void;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onComplete,
  isNextDisabled,
  isSubmitting,
  showSkip = false,
  onSkip
}) => {
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;
  
  return (
    <div className="flex justify-between mt-8">
      {!isFirstStep ? (
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>
      ) : (
        <div>
          {showSkip && onSkip && (
            <Button
              type="button"
              variant="ghost"
              onClick={onSkip}
              disabled={isSubmitting}
            >
              Skip
            </Button>
          )}
        </div>
      )}
      
      {!isLastStep ? (
        <Button
          type="button"
          onClick={onNext}
          disabled={isNextDisabled || isSubmitting}
          className="flex items-center gap-2"
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onComplete}
          disabled={isNextDisabled || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2 h-4 w-4 border-b-2 border-background rounded-full inline-block"></span>
              Submitting...
            </>
          ) : (
            'Complete Setup'
          )}
        </Button>
      )}
    </div>
  );
};

export default StepNavigation;
