
import * as React from "react";
import { cn } from "@/lib/utils";

interface TimelineProps extends React.HTMLAttributes<HTMLUListElement> {
  children: React.ReactNode;
  className?: string;
}

const Timeline = React.forwardRef<HTMLUListElement, TimelineProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <ul
        ref={ref}
        className={cn("relative m-0 p-0 list-none", className)}
        {...props}
      >
        {children}
      </ul>
    );
  }
);
Timeline.displayName = "Timeline";

interface TimelineItemProps extends React.HTMLAttributes<HTMLLIElement> {
  children: React.ReactNode;
  className?: string;
}

const TimelineItem = React.forwardRef<HTMLLIElement, TimelineItemProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn("relative min-h-[70px] pl-8", className)}
        {...props}
      >
        {children}
      </li>
    );
  }
);
TimelineItem.displayName = "TimelineItem";

interface TimelineSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const TimelineSeparator = React.forwardRef<HTMLDivElement, TimelineSeparatorProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("absolute left-0 top-0 h-full flex flex-col items-center", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TimelineSeparator.displayName = "TimelineSeparator";

interface TimelineDotProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: "outline" | "filled";
  color?: "default" | "primary" | "secondary" | "accent" | "info" | "success" | "warning" | "destructive";
}

const TimelineDot = React.forwardRef<HTMLDivElement, TimelineDotProps>(
  ({ className, variant = "filled", color = "primary", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "h-3 w-3 rounded-full z-10",
          variant === "outline" ? "border-2" : "",
          color === "default" && variant === "filled" && "bg-muted-foreground",
          color === "default" && variant === "outline" && "border-muted-foreground",
          color === "primary" && variant === "filled" && "bg-primary",
          color === "primary" && variant === "outline" && "border-primary",
          color === "secondary" && variant === "filled" && "bg-secondary",
          color === "secondary" && variant === "outline" && "border-secondary",
          color === "accent" && variant === "filled" && "bg-accent",
          color === "accent" && variant === "outline" && "border-accent",
          color === "info" && variant === "filled" && "bg-blue-500",
          color === "info" && variant === "outline" && "border-blue-500",
          color === "success" && variant === "filled" && "bg-green-500",
          color === "success" && variant === "outline" && "border-green-500",
          color === "warning" && variant === "filled" && "bg-amber-500",
          color === "warning" && variant === "outline" && "border-amber-500",
          color === "destructive" && variant === "filled" && "bg-destructive",
          color === "destructive" && variant === "outline" && "border-destructive",
          className
        )}
        {...props}
      />
    );
  }
);
TimelineDot.displayName = "TimelineDot";

interface TimelineConnectorProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const TimelineConnector = React.forwardRef<HTMLDivElement, TimelineConnectorProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex-1 w-px bg-border", className)}
        {...props}
      />
    );
  }
);
TimelineConnector.displayName = "TimelineConnector";

interface TimelineContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const TimelineContent = React.forwardRef<HTMLDivElement, TimelineContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("py-1 px-0", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TimelineContent.displayName = "TimelineContent";

interface TimelineHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const TimelineHeader = React.forwardRef<HTMLDivElement, TimelineHeaderProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("mb-2", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TimelineHeader.displayName = "TimelineHeader";

export {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  TimelineHeader,
};
