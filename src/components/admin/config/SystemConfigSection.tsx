
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Settings, Save } from "lucide-react";

interface SystemConfigSectionProps {
  title: string;
  description: string;
  configItems: {
    key: string;
    label: string;
    type: 'text' | 'number' | 'toggle' | 'select';
    value: any;
    options?: { label: string; value: string }[];
    helpText?: string;
  }[];
  onSave: (values: Record<string, any>) => Promise<void>;
  icon?: React.ReactNode;
}

export function SystemConfigSection({
  title,
  description,
  configItems,
  onSave,
  icon = <Settings className="h-5 w-5" />
}: SystemConfigSectionProps) {
  const { toast } = useToast();
  const [values, setValues] = React.useState<Record<string, any>>(() => 
    configItems.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {})
  );
  const [isLoading, setIsLoading] = React.useState(false);
  
  const handleChange = (key: string, value: any) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onSave(values);
      toast({
        title: "Settings saved",
        description: "Your system configuration has been updated successfully."
      });
    } catch (error) {
      console.error("Error saving configuration:", error);
      toast({
        title: "Error saving settings",
        description: "There was a problem saving your configuration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {configItems.map((item) => (
            <div key={item.key} className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor={item.key}>{item.label}</Label>
                {item.type === 'toggle' && (
                  <Switch 
                    id={item.key}
                    checked={values[item.key]}
                    onCheckedChange={(checked) => handleChange(item.key, checked)}
                  />
                )}
              </div>
              
              {item.type !== 'toggle' && (
                <Input
                  id={item.key}
                  type={item.type === 'number' ? 'number' : 'text'}
                  value={values[item.key]}
                  onChange={(e) => handleChange(item.key, item.type === 'number' ? Number(e.target.value) : e.target.value)}
                />
              )}
              
              {item.helpText && (
                <p className="text-sm text-muted-foreground">{item.helpText}</p>
              )}
            </div>
          ))}
          
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full sm:w-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Configuration"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
