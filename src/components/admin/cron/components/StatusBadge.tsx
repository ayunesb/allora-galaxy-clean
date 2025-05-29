import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StatusBadgeProps {
  status: string;
  errorMessage?: string | null;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  errorMessage,
}) => {
  let variant: "default" | "destructive" | "outline" | "secondary" | "success" =
    "default";

  switch (status) {
    case "completed":
      variant = "success";
      break;
    case "failed":
      variant = "destructive";
      break;
    case "started":
      variant = "secondary";
      break;
    case "pending":
      variant = "outline";
      break;
    default:
      variant = "default";
  }

  if (errorMessage) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant={variant}>{status}</Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs break-words">{errorMessage}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <Badge variant={variant}>{status}</Badge>;
};
