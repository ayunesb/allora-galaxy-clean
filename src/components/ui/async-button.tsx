
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useState, useCallback } from "react";

export interface AsyncButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asyncAction: () => Promise<any>;
  loadingText?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  children: React.ReactNode;
  variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost";
}

const AsyncButton = React.forwardRef<HTMLButtonElement, AsyncButtonProps>(
  ({ 
    asyncAction, 
    loadingText = "Loading...", 
    onSuccess, 
    onError, 
    children, 
    className,
    disabled,
    variant = "default",
    ...props 
  }, ref) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const response = await asyncAction();
        if (onSuccess) {
          onSuccess(response);
        }
      } catch (error) {
        console.error("AsyncButton error:", error);
        if (onError) {
          onError(error);
        }
      } finally {
        setIsLoading(false);
      }
    }, [asyncAction, onSuccess, onError]);

    return (
      <Button
        ref={ref}
        className={cn(className)}
        onClick={handleClick}
        disabled={isLoading || disabled}
        variant={variant}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinner className="mr-2 h-4 w-4" />
            {loadingText}
          </>
        ) : (
          children
        )}
      </Button>
    );
  }
);

AsyncButton.displayName = "AsyncButton";

export default AsyncButton;
