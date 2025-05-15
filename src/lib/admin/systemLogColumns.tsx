
import { format } from 'date-fns';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { SystemLog } from '@/types/logs';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

/**
 * Returns column definitions for the SystemLogsList table
 * 
 * @param onRowClick - Function to handle when a row is clicked
 * @returns Array of column definitions
 */
export const getSystemLogColumns = (onRowClick: (log: SystemLog) => void): ColumnDef<SystemLog, any>[] => [
  {
    accessorKey: 'level',
    header: 'Level',
    cell: ({ row }) => {
      const level = row.getValue('level') as string;
      
      let icon = null;
      let variant = 'outline';
      
      switch(level) {
        case 'error':
          icon = <AlertCircle className="h-3 w-3 mr-1" />;
          variant = 'destructive';
          break;
        case 'warning':
          icon = <AlertTriangle className="h-3 w-3 mr-1" />;
          variant = 'warning';
          break;
        case 'info':
          icon = <Info className="h-3 w-3 mr-1" />;
          variant = 'secondary';
          break;
      }
      
      return (
        <Badge variant={variant as any} className="flex items-center">
          {icon}
          {level}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'module',
    header: 'Module',
    cell: ({ row }) => {
      return (
        <Badge variant="outline">
          {row.getValue('module') || 'system'}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const description = row.getValue('description') || row.original.message;
      return (
        <span className="font-medium text-sm truncate block max-w-[350px]">
          {description}
        </span>
      );
    }
  },
  {
    accessorKey: 'created_at',
    header: 'Timestamp',
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'));
      return (
        <span className="text-muted-foreground text-sm">
          {format(date, 'MMM d, yyyy HH:mm:ss')}
        </span>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <button 
          className="text-sm text-primary hover:underline" 
          onClick={() => onRowClick(row.original)}
        >
          View details
        </button>
      );
    }
  },
];
