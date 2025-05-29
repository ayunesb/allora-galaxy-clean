import React from "react";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PartialErrorStateProps {
  title?: string;
  message: string;
  details?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  expandable?: boolean;
}

/**
 * PartialErrorState - An error component for non-critical errors that shouldn't block the UI
 * Used when part of the data failed to load but the UI can still function
 */
const PartialErrorState: React.FC<PartialErrorStateProps> = ({
  title = "Some data failed to load",
  message,
  details,
  onRetry,
  onDismiss,
  className,
  expandable = true,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div
      className={cn(
        "border border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 rounded-md text-amber-900 dark:text-amber-300 p-3 text-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">{title}</p>
            <p className="mt-1 text-sm opacity-90">{message}</p>
          </div>
        </div>

        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-7 w-7 p-0"
          >
            <span className="sr-only">Dismiss</span>
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        )}
      </div>

      {details && expandable && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="mt-1 h-7 px-2 text-xs flex items-center"
          >
            {expanded ? (
              <>
                <ChevronUp className="mr-1 h-3 w-3" />
                Hide details
              </>
            ) : (
              <>
                <ChevronDown className="mr-1 h-3 w-3" />
                Show details
              </>
            )}
          </Button>

          {expanded && (
            <div className="mt-2 text-xs p-2 rounded bg-amber-100/70 dark:bg-amber-950/50 whitespace-pre-wrap">
              {details}
            </div>
          )}
        </>
      )}

      {details && !expandable && (
        <div className="mt-2 text-xs p-2 rounded bg-amber-100/70 dark:bg-amber-950/50 whitespace-pre-wrap">
          {details}
        </div>
      )}

      {onRetry && (
        <div className="mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="h-7 px-2 text-xs bg-amber-100 dark:bg-amber-950/50 hover:bg-amber-200 dark:hover:bg-amber-900/50"
          >
            Retry
          </Button>
        </div>
      )}
    </div>
  );
};

export default PartialErrorState;
