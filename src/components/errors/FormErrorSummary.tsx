
import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormErrorSummaryProps {
  errors: Record<string, string | string[]>;
  className?: string;
  onDismiss?: () => void;
  showDismiss?: boolean;
}

/**
 * Form error summary component for displaying form validation errors
 */
const FormErrorSummary: React.FC<FormErrorSummaryProps> = ({
  errors,
  className,
  onDismiss,
  showDismiss = true
}) => {
  const errorEntries = Object.entries(errors);
  
  if (errorEntries.length === 0) {
    return null;
  }
  
  return (
    <div className={cn(
      "bg-destructive/10 border border-destructive/30 rounded-md p-4 mb-6 relative",
      className
    )}>
      {showDismiss && onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 text-destructive hover:text-destructive/80"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
        
        <div className="flex-1">
          <h5 className="font-medium text-destructive mb-2">
            {errorEntries.length === 1 
              ? "There is an error with your submission" 
              : `There are ${errorEntries.length} errors with your submission`}
          </h5>
          
          <ul className="list-disc pl-5 space-y-1">
            {errorEntries.map(([field, error]) => {
              const errorMessages = Array.isArray(error) ? error : [error];
              
              return errorMessages.map((message, idx) => (
                <li key={`${field}-${idx}`} className="text-sm text-destructive/90">
                  <span className="font-medium">{field}:</span> {message}
                </li>
              ));
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FormErrorSummary;
