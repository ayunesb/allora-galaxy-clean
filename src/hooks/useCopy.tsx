
import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

export const useCopy = () => {
  const [copied, setCopied] = useState(false);

  const copy = useCallback((text: string) => {
    if (!navigator.clipboard) {
      console.error('Clipboard API not available');
      toast({
        title: 'Copy failed',
        description: 'Clipboard API not available in your browser',
        variant: 'destructive',
      });
      return;
    }

    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        toast({
          title: 'Copied to clipboard',
          description: 'The content has been copied to your clipboard',
        });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast({
          title: 'Copy failed',
          description: 'Could not copy to clipboard',
          variant: 'destructive',
        });
      });
  }, []);

  return { copy, copied };
};

export default useCopy;
