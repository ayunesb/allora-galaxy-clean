
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Key } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const ApiKeyDisplay: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        // Get current user session
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session?.user) return;
        
        // Get tenant ID for this user
        const { data: tenantData } = await supabase
          .from('tenant_user_roles')
          .select('tenant_id')
          .eq('user_id', sessionData.session.user.id)
          .eq('role', 'owner')
          .maybeSingle();
          
        if (!tenantData?.tenant_id) return;
        
        // Get the most recent active API key
        const { data: keyData } = await supabase
          .from('api_keys')
          .select('key')
          .eq('tenant_id', tenantData.tenant_id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (keyData?.key) {
          setApiKey(keyData.key);
        }
      } catch (error) {
        console.error('Error fetching API key:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchApiKey();
  }, []);

  const handleCopyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      toast({
        title: "API Key Copied",
        description: "The API key has been copied to your clipboard."
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your API Key</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : apiKey ? (
          <div className="bg-muted p-4 rounded-md flex items-center gap-3">
            <Key className="h-5 w-5 text-primary" />
            <code className="font-mono text-sm flex-1 break-all">
              {`${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 8)}`}
            </code>
            <Button size="sm" onClick={handleCopyApiKey}>
              Copy
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No API keys found.</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-between">
        <p className="text-sm text-muted-foreground">
          Use this key to authenticate API requests.
        </p>
        <Button asChild>
          <Link to="/admin/api-keys">
            Manage API Keys
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApiKeyDisplay;
