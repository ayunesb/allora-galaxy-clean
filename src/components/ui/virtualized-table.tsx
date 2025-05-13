
import React from "react";
import { cn } from "@/lib/utils";

interface VirtualizedTableProps<T> {
  data: T[];
  renderRow: (item: T, index?: number) => React.ReactNode;
  rowHeight: number;
  className?: string;
  overscan?: number;
}

export function VirtualizedTable<T>({
  data,
  renderRow,
  rowHeight,
  className,
  overscan = 5,
}: VirtualizedTableProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  // Calculate total height of table
  const innerHeight = data.length * rowHeight;
  
  // Calculate which items should be visible
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endIndex = Math.min(
    data.length - 1,
    Math.floor((scrollTop + containerRef.current?.clientHeight || 0) / rowHeight) + overscan
  );
  
  // Handle scrolling
  const handleScroll = React.useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);
  
  // Render only the visible rows
  const visibleRows = React.useMemo(() => {
    return data.slice(startIndex, endIndex + 1).map((item, index) => {
      const actualIndex = startIndex + index;
      return (
        <div
          key={actualIndex}
          style={{
            position: 'absolute',
            top: actualIndex * rowHeight,
            height: rowHeight,
            left: 0,
            right: 0
          }}
        >
          {renderRow(item, actualIndex)}
        </div>
      );
    });
  }, [data, startIndex, endIndex, rowHeight, renderRow]);
  
  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn("relative overflow-y-auto", className)}
      style={{ height: innerHeight > 0 ? Math.min(innerHeight, 400) : 200 }}
    >
      <div style={{ height: innerHeight, position: 'relative' }}>
        {visibleRows}
      </div>
    </div>
  );
}
