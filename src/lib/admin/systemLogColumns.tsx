
import { format } from 'date-fns';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { SystemLog } from '@/types/logs';

export const getSystemLogColumns = (onRowClick: (log: SystemLog) => void): ColumnDef<SystemLog, any>[] => [
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
    accessorKey: 'event',
    header: 'Event',
    cell: ({ row }) => {
      return (
        <span className="font-medium">{row.getValue('event')}</span>
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
