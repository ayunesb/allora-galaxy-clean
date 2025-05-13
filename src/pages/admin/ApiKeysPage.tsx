
import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { ApiKeysTable } from '@/components/admin/api-keys';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useApiKeys } from '@/hooks/admin/useApiKeys';
import { ApiKey } from '@/types/api-key';
import { useToast } from '@/hooks/use-toast';

const ApiKeysPage: React.FC = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null);
  const { apiKeys, isLoading, error, createApiKey, deleteApiKey } = useApiKeys();
  const { toast } = useToast();

  const handleCreateApiKey = () => {
    setCreateDialogOpen(true);
  };

  const handleViewApiKey = (id: string) => {
    const apiKey = apiKeys.find(key => key.id === id);
    if (apiKey) {
      setSelectedApiKey(apiKey);
      setViewDialogOpen(true);
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    try {
      await deleteApiKey(id);
      toast({
        title: "API Key deleted",
        description: "The API key has been successfully deleted",
      });
    } catch (error: any) {
      toast({
        title: "Failed to delete API Key",
        description: error.message || "An error occurred while deleting the API key",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <PageHeader
            title="API Keys"
            description="Manage API keys for external service integrations"
          />
          <Button onClick={handleCreateApiKey}>
            <Plus className="mr-2 h-4 w-4" />
            Create API Key
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <p className="text-destructive">{error}</p>
            ) : (
              <ApiKeysTable
                apiKeys={apiKeys}
                isLoading={isLoading}
                onDelete={handleDeleteApiKey}
                onView={handleViewApiKey}
              />
            )}
          </CardContent>
        </Card>

        {/* Create API Key Dialog would go here */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
            </DialogHeader>
            {/* CreateApiKeyForm would go here */}
            <p className="text-center text-muted-foreground py-8">
              Create API Key form will be implemented in the next phase
            </p>
          </DialogContent>
        </Dialog>

        {/* View API Key Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>API Key Details</DialogTitle>
            </DialogHeader>
            {selectedApiKey && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Name</h3>
                  <p>{selectedApiKey.name}</p>
                </div>
                <div>
                  <h3 className="font-medium">Key Prefix</h3>
                  <p className="font-mono">{selectedApiKey.key_prefix}</p>
                </div>
                <div>
                  <h3 className="font-medium">Status</h3>
                  <p>{selectedApiKey.status}</p>
                </div>
                <div>
                  <h3 className="font-medium">Scope</h3>
                  <p>{selectedApiKey.scope?.join(', ') || 'No scope defined'}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default ApiKeysPage;
