
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Copy, KeyRound, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useTenantId } from '@/hooks/useTenantId';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created_at: string;
  status: 'active' | 'revoked';
}

const ApiKeyDisplay: React.FC = () => {
  const [apiKey, setApiKey] = useState<ApiKey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const { toast } = useToast();
  const tenantId = useTenantId();

  useEffect(() => {
    const fetchApiKey = async () => {
      if (!tenantId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('api_keys')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setApiKey(data[0]);
        }
      } catch (error) {
        console.error('Error fetching API key:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApiKey();
  }, [tenantId]);

  const handleCopyKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey.key);
      toast({
        title: 'API Key copied to clipboard',
        description: 'The key has been copied to your clipboard',
      });
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <KeyRound className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">API Key</h3>
              <p className="text-sm text-muted-foreground">
                {apiKey ? 'Your API key for Allora Brain' : 'No API key found'}
              </p>
            </div>
          </div>
          
          {isLoading ? (
            <div className="animate-pulse rounded-md bg-muted h-10 w-64"></div>
          ) : apiKey ? (
            <div className="flex gap-2 items-center">
              <div className="relative flex-grow">
                <Input
                  value={showKey ? apiKey.key : '•'.repeat(Math.min(24, apiKey.key.length))}
                  readOnly
                  className="font-mono text-sm pr-20"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-10 top-0 h-full"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={handleCopyKey}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <Button asChild>
              <Link to="/admin/api-keys">
                <Plus className="mr-2 h-4 w-4" /> Create API Key
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiKeyDisplay;
