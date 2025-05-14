
import { cn } from '@/lib/utils';
import { XCircle } from 'lucide-react';

export interface FormErrorProps {
  /** Error message */
  message: string;
  /** Additional class name */
  className?: string;
}

/**
 * Simple inline error message for form fields
 */
export function FormError({
  message,
  className,
}: FormErrorProps) {
  if (!message) return null;
  
  return (
    <p 
      className={cn(
        "text-sm text-destructive flex items-center",
        className
      )}
      data-testid="form-error"
    >
      <XCircle className="h-4 w-4 mr-1" />
      {message}
    </p>
  );
}
