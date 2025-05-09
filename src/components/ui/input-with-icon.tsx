
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputWithIconProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

const InputWithIcon = React.forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ className, startAdornment, endAdornment, type, ...props }, ref) => {
    return (
      <div className="flex items-center w-full rounded-md border border-input bg-background ring-offset-background">
        {startAdornment && (
          <div className="pl-3 flex items-center text-muted-foreground">
            {startAdornment}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-transparent",
            startAdornment && "pl-1",
            endAdornment && "pr-1",
            className
          )}
          ref={ref}
          {...props}
        />
        {endAdornment && (
          <div className="pr-3 flex items-center text-muted-foreground">
            {endAdornment}
          </div>
        )}
      </div>
    );
  }
);

InputWithIcon.displayName = "InputWithIcon";

export { InputWithIcon };
