import React, { useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export interface FormErrorSummaryProps
  extends React.HTMLAttributes<HTMLDivElement> {
  errors: Record<string, string[] | string>;
  title?: string;
  autofocus?: boolean;
}

/**
 * FormErrorSummary - Displays a summary of form errors
 */
export const FormErrorSummary: React.FC<FormErrorSummaryProps> = ({
  errors,
  title = "There were some errors with your submission",
  autofocus = true,
  className,
  ...props
}) => {
  const errorCount = Object.keys(errors).length;
  const summaryRef = useRef<HTMLDivElement>(null);

  // Focus on the summary when errors appear
  useEffect(() => {
    if (autofocus && errorCount > 0 && summaryRef.current) {
      summaryRef.current.focus();
      summaryRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [errorCount, autofocus]);

  if (errorCount === 0) return null;

  // Format the errors for display
  const errorList = Object.entries(errors).flatMap(([field, error]) => {
    if (Array.isArray(error)) {
      return error.map((err) => ({ field, message: err }));
    }
    return [{ field, message: error }];
  });

  return (
    <Alert
      variant="destructive"
      className={cn("mb-6", className)}
      ref={summaryRef}
      tabIndex={-1}
      aria-live="assertive"
      {...props}
    >
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="mb-2">{title}</AlertTitle>
      <AlertDescription>
        <ul className="list-disc pl-5 space-y-1">
          {errorList.map(({ field, message }, index) => (
            <li key={`${field}-${index}`} className="text-sm">
              <span className="font-medium">
                {field
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
                :
              </span>{" "}
              {message}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};
