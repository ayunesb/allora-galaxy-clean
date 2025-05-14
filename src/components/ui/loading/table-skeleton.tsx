
import { cn } from "@/lib/utils";
import { Skeleton } from "./loading-skeleton";

export interface TableSkeletonProps {
  /** Number of rows to display */
  rows?: number;
  /** Number of columns to display */
  columns?: number;
  /** Whether to include a header row */
  showHeader?: boolean;
  /** Additional class name for styling */
  className?: string;
}

/**
 * Skeleton loader for tables
 */
export function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
}: TableSkeletonProps) {
  return (
    <div className={cn("w-full overflow-hidden", className)}>
      <div className="w-full">
        {showHeader && (
          <div className="flex border-b py-3 px-4">
            {Array.from({ length: columns }).map((_, i) => (
              <div 
                key={`header-${i}`}
                className={cn(
                  "flex-1",
                  i > 0 && "ml-4"
                )}
              >
                <Skeleton height={24} width={i === 0 ? "40%" : "70%"} />
              </div>
            ))}
          </div>
        )}
        
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div 
            key={`row-${rowIndex}`}
            className="flex items-center border-b py-3 px-4"
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div 
                key={`cell-${rowIndex}-${colIndex}`}
                className={cn(
                  "flex-1",
                  colIndex > 0 && "ml-4"
                )}
              >
                <Skeleton 
                  height={20} 
                  width={(() => {
                    // Create varied widths for more realistic appearance
                    if (colIndex === 0) return "60%";
                    if (colIndex === columns - 1) return "30%";
                    return `${Math.floor(40 + Math.random() * 40)}%`;
                  })()}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TableSkeleton;
