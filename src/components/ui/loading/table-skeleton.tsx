
import { Skeleton } from "./loading-skeleton";

export interface TableSkeletonProps {
  /** Number of rows to render */
  rows?: number;
  /** Number of columns to render */
  columns?: number;
  /** Whether to include a header */
  hasHeader?: boolean;
  /** Additional class name for styling */
  className?: string;
}

/**
 * Skeleton loader for tables
 */
export function TableSkeleton({
  rows = 5,
  columns = 4,
  hasHeader = true,
  className,
}: TableSkeletonProps) {
  return (
    <div className={className}>
      <div className="rounded-md border">
        <div className="w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            {hasHeader && (
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  {Array.from({ length: columns }).map((_, i) => (
                    <th key={`header-${i}`} className="h-10 px-4 text-left align-middle font-medium">
                      <Skeleton height={18} width={100 + Math.random() * 40} rounded="md" />
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="[&_tr:last-child]:border-0">
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr
                  key={`row-${rowIndex}`}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  {Array.from({ length: columns }).map((_, colIndex) => (
                    <td
                      key={`cell-${rowIndex}-${colIndex}`}
                      className="p-4 align-middle"
                    >
                      <Skeleton 
                        height={16} 
                        width={((colIndex === 0 ? 80 : 50) + Math.random() * 70) + '%'} 
                        rounded="md" 
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function StatsTableSkeleton({ columns = 3, rows = 2 }: { columns?: number; rows?: number }) {
  return <TableSkeleton rows={rows} columns={columns} />;
}

export function ExecutionsTableSkeleton({ rows = 5 }: { rows?: number }) {
  return <TableSkeleton rows={rows} columns={5} />;
}

export function LogsTableSkeleton({ rows = 8 }: { rows?: number }) {
  return <TableSkeleton rows={rows} columns={6} />;
}

export { TableSkeleton as default };
