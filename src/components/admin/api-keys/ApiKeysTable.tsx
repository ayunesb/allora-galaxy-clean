
import React from 'react';
import { format, parseISO } from 'date-fns';
import { ApiKey } from '@/types/api-key';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, Copy } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ApiKeysTableProps {
  apiKeys: ApiKey[];
  isLoading: boolean;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

const ApiKeysTable: React.FC<ApiKeysTableProps> = ({
  apiKeys,
  isLoading,
  onDelete,
  onView
}) => {
  const copyToClipboard = (text: string, name: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "API Key prefix copied",
      description: `Prefix for API Key "${name}" copied to clipboard`,
    });
  };

  if (isLoading) {
    return (
      <div className="py-4">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-muted rounded-md w-full"></div>
          <div className="h-10 bg-muted rounded-md w-full"></div>
          <div className="h-10 bg-muted rounded-md w-full"></div>
        </div>
      </div>
    );
  }

  if (apiKeys.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No API keys found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium">Name</th>
            <th className="text-left py-3 px-4 font-medium">Key Prefix</th>
            <th className="text-left py-3 px-4 font-medium">Status</th>
            <th className="text-left py-3 px-4 font-medium">Created</th>
            <th className="text-left py-3 px-4 font-medium">Expiry</th>
            <th className="text-left py-3 px-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {apiKeys.map((apiKey) => (
            <tr key={apiKey.id} className="border-b hover:bg-muted/50">
              <td className="py-3 px-4">{apiKey.name}</td>
              <td className="py-3 px-4">
                <div className="flex items-center space-x-2">
                  <span className="font-mono">{apiKey.key_prefix}</span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => copyToClipboard(apiKey.key_prefix, apiKey.name)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </td>
              <td className="py-3 px-4">
                {apiKey.status === 'active' ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="destructive">Revoked</Badge>
                )}
              </td>
              <td className="py-3 px-4 whitespace-nowrap">
                {format(parseISO(apiKey.created_at), 'MMM d, yyyy')}
              </td>
              <td className="py-3 px-4 whitespace-nowrap">
                {apiKey.expires_at ? (
                  format(parseISO(apiKey.expires_at), 'MMM d, yyyy')
                ) : (
                  <span className="text-muted-foreground">Never</span>
                )}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onView?.(apiKey.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onDelete?.(apiKey.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ApiKeysTable;
