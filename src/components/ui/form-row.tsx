import React from "react";
import { cn } from "@/lib/utils";

interface FormRowProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  htmlFor?: string;
  description?: string;
  error?: string;
}

export const FormRow = React.forwardRef<HTMLDivElement, FormRowProps>(
  (
    { label, htmlFor, description, error, children, className, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-1.5", className)}
        {...props}
      >
        {label && (
          <label
            htmlFor={htmlFor}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        {children}
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  },
);

FormRow.displayName = "FormRow";
