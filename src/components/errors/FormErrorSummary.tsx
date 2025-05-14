
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface FormErrorSummaryProps {
  title?: string;
  errors?: Record<string, string | string[]>;
  className?: string;
}

/**
 * Component to display a summary of form validation errors
 */
export const FormErrorSummary: React.FC<FormErrorSummaryProps> = ({
  title = 'There are problems with your submission',
  errors = {},
  className,
}) => {
  const errorCount = Object.keys(errors).length;
  
  if (errorCount === 0) {
    return null;
  }
  
  const flattenedErrors = Object.entries(errors).flatMap(([field, message]) => {
    if (Array.isArray(message)) {
      return message.map(msg => ({ field, message: msg }));
    }
    return [{ field, message: message as string }];
  });
  
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          {flattenedErrors.map(({ field, message }, i) => (
            <li key={`${field}-${i}`} className="text-sm">
              {message}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};

export default FormErrorSummary;
