
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FormErrorMessageProps {
  message?: string;
  className?: string;
  id?: string;
}

/**
 * FormErrorMessage - A component for displaying form field error messages
 * with improved accessibility
 */
export const FormErrorMessage = React.forwardRef<
  HTMLParagraphElement,
  FormErrorMessageProps
>(({ message, className, id, ...props }, ref) => {
  if (!message) return null;
  
  return (
    <p
      ref={ref}
      id={id}
      className={cn(
        "flex items-center gap-1.5 text-sm font-medium text-destructive mt-1.5",
        className
      )}
      {...props}
    >
      <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
});

FormErrorMessage.displayName = "FormErrorMessage";
