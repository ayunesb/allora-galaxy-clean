
import { useState } from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Shield, RefreshCcw } from "lucide-react";

interface SystemConfigProps {
  config: {
    maintenance_mode: boolean;
    enable_debug_logs: boolean;
    rate_limiting_enabled: boolean;
  };
  onConfigChange: () => void;
}

export function SystemConfigSection({ config, onConfigChange }: SystemConfigProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(config.maintenance_mode);
  const [debugLogsEnabled, setDebugLogsEnabled] = useState(config.enable_debug_logs);
  const [rateLimitingEnabled, setRateLimitingEnabled] = useState(config.rate_limiting_enabled);

  const handleSaveChanges = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('system_config')
        .update({
          maintenance_mode: maintenanceMode,
          enable_debug_logs: debugLogsEnabled,
          rate_limiting_enabled: rateLimitingEnabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1);
      
      if (error) throw error;

      toast.success('System settings updated successfully');
      onConfigChange();
    } catch (error: any) {
      console.error('Error updating system config:', error);
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreDefaults = () => {
    setMaintenanceMode(false);
    setDebugLogsEnabled(false);
    setRateLimitingEnabled(true);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          System Configuration
        </CardTitle>
        <CardDescription>
          Configure system-wide settings and security options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-medium">Maintenance Mode</h4>
            <p className="text-sm text-muted-foreground">
              Temporarily disable user access while performing maintenance
            </p>
          </div>
          <Switch
            checked={maintenanceMode}
            onCheckedChange={setMaintenanceMode}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-medium">Debug Logging</h4>
            <p className="text-sm text-muted-foreground">
              Enable detailed logs for debugging purposes
            </p>
          </div>
          <Switch
            checked={debugLogsEnabled}
            onCheckedChange={setDebugLogsEnabled}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-medium">API Rate Limiting</h4>
            <p className="text-sm text-muted-foreground">
              Protect against abuse by limiting API request frequency
            </p>
          </div>
          <Switch
            checked={rateLimitingEnabled}
            onCheckedChange={setRateLimitingEnabled}
          />
        </div>
        
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestoreDefaults}
            className="flex items-center"
          >
            <RefreshCcw className="mr-2 h-3 w-3" />
            Restore Defaults
          </Button>
          <Button 
            onClick={handleSaveChanges}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
