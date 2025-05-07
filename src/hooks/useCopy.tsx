
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useCopy() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = useCallback((text: string, message: string = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        toast({
          title: "Success",
          description: message,
          duration: 2000,
        });
        
        // Reset copied state after 2 seconds
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy:', err);
        toast({
          title: "Error",
          description: "Failed to copy to clipboard",
          variant: "destructive",
          duration: 2000,
        });
      });
  }, [toast]);

  return { copied, copyToClipboard };
}

export default useCopy;
