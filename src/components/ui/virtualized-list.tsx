
import React from "react";
import { cn } from "@/lib/utils";

interface VirtualizedListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  windowHeight: number;
  className?: string;
  overscan?: number;
  loadMoreItems?: () => void;
  hasMoreItems?: boolean;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
}

export function VirtualizedList<T>({
  data,
  renderItem,
  itemHeight,
  windowHeight,
  className,
  overscan = 5,
  loadMoreItems,
  hasMoreItems = false,
  isLoading = false,
  emptyState
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  // Calculate total height of list
  const innerHeight = data.length * itemHeight;
  
  // Calculate which items should be visible
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    data.length - 1,
    Math.floor((scrollTop + windowHeight) / itemHeight) + overscan
  );
  
  // Handle scrolling
  const handleScroll = React.useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
      
      // Detect if scrolled near bottom for infinite loading
      if (loadMoreItems && hasMoreItems && !isLoading) {
        const scrollBottom = containerRef.current.scrollHeight - containerRef.current.scrollTop - containerRef.current.clientHeight;
        if (scrollBottom < 100) { // Load more when within 100px of bottom
          loadMoreItems();
        }
      }
    }
  }, [loadMoreItems, hasMoreItems, isLoading]);
  
  // Render only the visible items
  const visibleItems = React.useMemo(() => {
    return data.slice(startIndex, endIndex + 1).map((item, index) => {
      const actualIndex = startIndex + index;
      return (
        <div
          key={actualIndex}
          style={{
            position: 'absolute',
            top: actualIndex * itemHeight,
            height: itemHeight,
            left: 0,
            right: 0
          }}
        >
          {renderItem(item, actualIndex)}
        </div>
      );
    });
  }, [data, startIndex, endIndex, itemHeight, renderItem]);
  
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }
  
  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn("relative overflow-y-auto", className)}
      style={{ height: windowHeight }}
    >
      <div style={{ height: innerHeight, position: 'relative' }}>
        {visibleItems}
        {isLoading && (
          <div className="flex justify-center p-4 absolute bottom-0 left-0 right-0">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    </div>
  );
}
