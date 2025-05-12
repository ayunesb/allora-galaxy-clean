
import React from 'react';
import { cn } from '@/lib/utils';

interface JsonViewProps {
  data: any;
  className?: string;
}

export const JsonView: React.FC<JsonViewProps> = ({ data, className }) => {
  // Format the JSON data with proper indentation
  const formattedJson = React.useMemo(() => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return 'Error formatting JSON data';
    }
  }, [data]);

  return (
    <pre className={cn('text-xs overflow-auto', className)}>
      <code>{formattedJson}</code>
    </pre>
  );
};
