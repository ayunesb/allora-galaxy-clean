
import React from 'react';
import { ApiKeysTable } from './index';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApiKeys } from '@/hooks/admin/useApiKeys';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ApiKeysListProps {
  onCreateClick: () => void;
}

const ApiKeysList: React.FC<ApiKeysListProps> = ({ onCreateClick }) => {
  const { apiKeys, isLoading, error, deleteApiKey } = useApiKeys();

  const handleDelete = async (id: string) => {
    await deleteApiKey(id);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>API Keys</CardTitle>
        <Button onClick={onCreateClick} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Create Key
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-destructive">{error}</p>
        ) : (
          <ApiKeysTable 
            apiKeys={apiKeys}
            isLoading={isLoading}
            onDelete={handleDelete}
            onView={() => {}}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ApiKeysList;
