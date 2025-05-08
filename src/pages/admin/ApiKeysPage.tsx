
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { withRoleCheck } from '@/lib/auth/withRoleCheck';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Copy, Plus, RefreshCw, Trash2 } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created_at: string;
  expires_at?: string;
  last_used_at?: string;
  status: 'active' | 'revoked';
  tenant_id: string;
}

const ApiKeysPage: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newKeyName, setNewKeyName] = useState<string>('');
  const [creatingKey, setCreatingKey] = useState<boolean>(false);
  const [tenantId, setTenantId] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        // Get the current tenant ID
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session?.user) return;
        
        const { data: tenantData } = await supabase
          .from('tenant_user_roles')
          .select('tenant_id')
          .eq('user_id', sessionData.session.user.id)
          .eq('role', 'owner')
          .single();
          
        if (!tenantData) return;
        setTenantId(tenantData.tenant_id);
        
        // Fetch API keys for this tenant
        const { data, error } = await supabase
          .from('api_keys')
          .select('*')
          .eq('tenant_id', tenantData.tenant_id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setApiKeys(data || []);
      } catch (error) {
        console.error('Error fetching API keys:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch API keys',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchApiKeys();
  }, [toast]);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a name for the API key',
        variant: 'destructive',
      });
      return;
    }
    
    setCreatingKey(true);
    
    try {
      // Generate a secure random API key
      const apiKey = Array.from(crypto.getRandomValues(new Uint8Array(33)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 64);
      
      // Create expiration date (1 year from now)
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      
      // Store the key in the database
      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          name: newKeyName,
          key: apiKey,
          tenant_id: tenantId,
          status: 'active',
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Add the new key to the state
      setApiKeys([data, ...apiKeys]);
      
      // Clear the input
      setNewKeyName('');
      
      toast({
        title: 'Success',
        description: 'API key created successfully',
      });
    } catch (error) {
      console.error('Error creating API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to create API key',
        variant: 'destructive',
      });
    } finally {
      setCreatingKey(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ status: 'revoked' })
        .eq('id', keyId);
        
      if (error) throw error;
      
      // Update the key status in the state
      setApiKeys(apiKeys.map(key => 
        key.id === keyId ? { ...key, status: 'revoked' } : key
      ));
      
      toast({
        title: 'Success',
        description: 'API key revoked successfully',
      });
    } catch (error) {
      console.error('Error revoking API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to revoke API key',
        variant: 'destructive',
      });
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: 'Copied',
      description: 'API key copied to clipboard',
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">API Keys</h1>
      <p className="text-muted-foreground mb-8">
        Create and manage API keys for accessing the Allora-as-a-Brain API.
      </p>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create New API Key</CardTitle>
          <CardDescription>
            API keys are used to authenticate requests to the Allora-as-a-Brain API.
            Keys are displayed only once when created.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3">
                <Label htmlFor="name">API Key Name</Label>
                <Input 
                  id="name" 
                  placeholder="E.g., Production, Development, Slack Integration" 
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  className="w-full" 
                  onClick={handleCreateKey}
                  disabled={creatingKey || !newKeyName.trim()}
                >
                  {creatingKey ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Generate Key
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            API keys provide full access to your account through the API. Keep them secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-4 text-center">
              <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No API keys found. Create one above to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div 
                  key={key.id}
                  className={`p-4 border rounded-lg ${key.status === 'revoked' ? 'bg-muted/50' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium">{key.name}</span>
                      {key.status === 'revoked' && (
                        <span className="ml-2 text-sm text-red-500 font-medium">Revoked</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleCopyKey(key.key)}
                        disabled={key.status === 'revoked'}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {key.status === 'active' && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleRevokeKey(key.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    <p>Created: {new Date(key.created_at).toLocaleDateString()}</p>
                    {key.expires_at && (
                      <p>• Expires: {new Date(key.expires_at).toLocaleDateString()}</p>
                    )}
                    {key.last_used_at && (
                      <p>• Last used: {new Date(key.last_used_at).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className="mt-2">
                    <code className="px-2 py-1 bg-muted rounded text-sm font-mono break-all">
                      {key.key}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Revoked keys cannot be used to authenticate API requests.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default withRoleCheck(ApiKeysPage, { roles: ['owner', 'admin'] });
