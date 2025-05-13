
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

interface EmptyPluginStateProps {
  onClearFilters: () => void;
}

export const EmptyPluginState = ({ onClearFilters }: EmptyPluginStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No plugins found</h3>
      <p className="text-muted-foreground mt-2">
        Try changing your search terms or filters
      </p>
      <Button 
        variant="outline" 
        className="mt-4"
        onClick={onClearFilters}
      >
        Clear filters
      </Button>
    </div>
  );
};
