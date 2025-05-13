
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Copy, Plus, RefreshCw, Trash } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  expires_at: string | null;
  scope: string[];
  created_at: string;
  tenant_id: string;
  created_by: string;
  last_used_at: string | null;
}

const ApiKeysPage = () => {
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);
  
  // New key form state
  const [keyName, setKeyName] = useState('');
  const [keyExpiry, setKeyExpiry] = useState('never');
  const [keyScope, setKeyScope] = useState<string[]>(['read']);

  useEffect(() => {
    if (currentWorkspace?.id) {
      fetchApiKeys();
    }
  }, [currentWorkspace?.id]);

  const fetchApiKeys = async () => {
    if (!currentWorkspace?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('tenant_id', currentWorkspace.id);
        
      if (error) throw error;
      
      setApiKeys(data || []);
    } catch (error: any) {
      console.error('Error fetching API keys:', error);
      toast({
        title: 'Failed to load API keys',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!currentWorkspace?.id) return;
    
    try {
      // Calculate expiry date if not "never"
      let expiresAt = null;
      if (keyExpiry === '30days') {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        expiresAt = date.toISOString();
      } else if (keyExpiry === '90days') {
        const date = new Date();
        date.setDate(date.getDate() + 90);
        expiresAt = date.toISOString();
      } else if (keyExpiry === '1year') {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        expiresAt = date.toISOString();
      }
      
      // Call RPC function to create key
      const { data, error } = await supabase.rpc('create_api_key', {
        p_name: keyName,
        p_tenant_id: currentWorkspace.id,
        p_scope: keyScope,
        p_expires_at: expiresAt
      });
      
      if (error) throw error;
      
      // Display the full key to the user
      setNewKey(data.key);
      
      // Refresh the list of keys
      fetchApiKeys();
      
      // Reset form
      setKeyName('');
      setKeyExpiry('never');
      setKeyScope(['read']);
      
    } catch (error: any) {
      console.error('Error creating API key:', error);
      toast({
        title: 'Failed to create API key',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const deleteApiKey = async () => {
    if (!selectedKey) return;
    
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', selectedKey.id);
        
      if (error) throw error;
      
      toast({
        title: 'API key deleted',
        description: `API key "${selectedKey.name}" has been deleted`,
      });
      
      // Refresh the list
      fetchApiKeys();
      setShowDeleteDialog(false);
      setSelectedKey(null);
      
    } catch (error: any) {
      console.error('Error deleting API key:', error);
      toast({
        title: 'Failed to delete API key',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied to clipboard',
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({
        title: 'Failed to copy to clipboard',
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return format(new Date(dateString), 'PPP');
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">API Keys</h1>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchApiKeys}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          
          <Button
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create API Key
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Manage API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center p-4">Loading API keys...</div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              No API keys found. Create one to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key Prefix</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell>{key.name}</TableCell>
                    <TableCell>{key.key_prefix}...</TableCell>
                    <TableCell>{key.scope.join(', ')}</TableCell>
                    <TableCell>{formatDate(key.created_at)}</TableCell>
                    <TableCell>{formatDate(key.expires_at)}</TableCell>
                    <TableCell>{key.last_used_at ? formatDate(key.last_used_at) : 'Never'}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedKey(key);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Create API Key Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
          </DialogHeader>
          
          {newKey ? (
            <div className="space-y-4">
              <div className="text-center p-4 bg-green-50 rounded-md">
                <p className="mb-2 font-bold text-green-700">Your API key has been created!</p>
                <p className="text-sm text-gray-500 mb-4">
                  Please copy your API key now. You won't be able to see it again!
                </p>
                
                <div className="flex items-center mb-4 p-2 bg-gray-100 rounded-md">
                  <code className="flex-1 break-all text-xs">{newKey}</code>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard(newKey)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  onClick={() => {
                    setNewKey(null);
                    setShowCreateDialog(false);
                  }}
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="key-name">Name</Label>
                <Input 
                  id="key-name" 
                  placeholder="e.g. Production API Key" 
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="key-expiry">Expires</Label>
                <Select value={keyExpiry} onValueChange={setKeyExpiry}>
                  <SelectTrigger id="key-expiry">
                    <SelectValue placeholder="Select expiry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="30days">30 days</SelectItem>
                    <SelectItem value="90days">90 days</SelectItem>
                    <SelectItem value="1year">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Scope</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={keyScope.includes('read') ? 'default' : 'outline'}
                    onClick={() => {
                      setKeyScope(prev => 
                        prev.includes('read')
                          ? prev.filter(s => s !== 'read')
                          : [...prev, 'read']
                      );
                    }}
                  >
                    Read
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={keyScope.includes('write') ? 'default' : 'outline'}
                    onClick={() => {
                      setKeyScope(prev => 
                        prev.includes('write')
                          ? prev.filter(s => s !== 'write')
                          : [...prev, 'write']
                      );
                    }}
                  >
                    Write
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={keyScope.includes('admin') ? 'default' : 'outline'}
                    onClick={() => {
                      setKeyScope(prev => 
                        prev.includes('admin')
                          ? prev.filter(s => s !== 'admin')
                          : [...prev, 'admin']
                      );
                    }}
                  >
                    Admin
                  </Button>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={createApiKey}
                  disabled={!keyName}
                >
                  Create Key
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete API Key Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete API Key</DialogTitle>
          </DialogHeader>
          
          <p className="py-4">
            Are you sure you want to delete the API key "{selectedKey?.name}"? This action cannot be undone.
          </p>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteApiKey}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApiKeysPage;
