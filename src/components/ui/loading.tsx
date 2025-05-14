
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Loading({ size = "md", className }: LoadingProps) {
  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }[size];

  return (
    <div className="flex justify-center items-center">
      <Loader className={cn(sizeClass, "animate-spin", className)} />
    </div>
  );
}
