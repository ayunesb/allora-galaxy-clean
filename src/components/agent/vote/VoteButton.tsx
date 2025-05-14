
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
// Remove unused VoteType import

interface VoteButtonProps {
  type: 'up' | 'down';
  count: number;
  active: boolean;
  onClick: () => void;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export function VoteButton({
  type,
  count,
  active,
  onClick,
  loading = false,
  size = 'md',
  disabled = false
}: VoteButtonProps) {
  const isUpvote = type === 'up';
  
  const sizeClasses = {
    sm: 'text-xs p-1',
    md: 'text-sm p-2',
    lg: 'text-base p-3'
  };
  
  return (
    <Button
      variant={active ? "default" : "outline"}
      size="sm"
      className={cn(
        "flex items-center gap-1",
        sizeClasses[size],
        active && (isUpvote ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700")
      )}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {isUpvote ? (
        <ThumbsUp 
          size={size === 'sm' ? 14 : size === 'md' ? 16 : 20} 
          className={cn(
            active && "text-white",
            loading && "animate-pulse"
          )} 
        />
      ) : (
        <ThumbsDown 
          size={size === 'sm' ? 14 : size === 'md' ? 16 : 20} 
          className={cn(
            active && "text-white",
            loading && "animate-pulse"
          )} 
        />
      )}
      <span className={cn(active && "text-white")}>
        {loading ? "..." : count}
      </span>
    </Button>
  );
}
