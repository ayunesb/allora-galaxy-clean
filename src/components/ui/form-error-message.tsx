import React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Props for the FormErrorMessage component
 */
export interface FormErrorMessageProps {
  /** Error message to display */
  message?: string;
  /** Optional CSS class names */
  className?: string;
  /** Optional HTML ID attribute */
  id?: string;
}

/**
 * FormErrorMessage - A component for displaying form field error messages
 * with improved accessibility
 *
 * @example
 * ```tsx
 * // Basic usage
 * <FormErrorMessage message="This field is required" />
 *
 * // With custom styling
 * <FormErrorMessage
 *   message="Invalid email format"
 *   className="mt-1 text-red-600"
 * />
 *
 * // Connected to a form field
 * <FormField
 *   control={form.control}
 *   name="email"
 *   render={({ field, fieldState }) => (
 *     <>
 *       <Input {...field} aria-invalid={!!fieldState.error} />
 *       <FormErrorMessage
 *         message={fieldState.error?.message}
 *         id={`${field.name}-error`}
 *       />
 *     </>
 *   )}
 * />
 * ```
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
        className,
      )}
      {...props}
    >
      <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
});

FormErrorMessage.displayName = "FormErrorMessage";
