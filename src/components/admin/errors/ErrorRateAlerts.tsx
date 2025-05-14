
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface AlertRule {
  id: string;
  enabled: boolean;
  threshold: number;
  timeWindow: string;
  severity: string;
  notificationChannels: string[];
}

const defaultAlertRules: AlertRule[] = [
  {
    id: '1',
    enabled: true,
    threshold: 10,
    timeWindow: '5m',
    severity: 'critical',
    notificationChannels: ['email', 'slack'],
  },
  {
    id: '2',
    enabled: true,
    threshold: 50,
    timeWindow: '1h',
    severity: 'high',
    notificationChannels: ['slack'],
  },
];

const ErrorRateAlerts: React.FC = () => {
  const [alertRules, setAlertRules] = useState<AlertRule[]>(defaultAlertRules);
  
  const handleToggleRule = (id: string) => {
    setAlertRules(prev => 
      prev.map(rule => 
        rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };
  
  const handleUpdateRule = (id: string, field: keyof AlertRule, value: any) => {
    setAlertRules(prev => 
      prev.map(rule => 
        rule.id === id ? { ...rule, [field]: value } : rule
      )
    );
  };
  
  const handleDeleteRule = (id: string) => {
    setAlertRules(prev => prev.filter(rule => rule.id !== id));
  };
  
  const handleAddRule = () => {
    const newRule: AlertRule = {
      id: `rule-${Date.now()}`,
      enabled: true,
      threshold: 5,
      timeWindow: '5m',
      severity: 'medium',
      notificationChannels: ['email'],
    };
    
    setAlertRules(prev => [...prev, newRule]);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Switch id="global-alerts" defaultChecked />
        <Label htmlFor="global-alerts" className="ml-2">
          Enable error rate alerts
        </Label>
        <div className="ml-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAddRule}
            className="h-8 gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Rule
          </Button>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <div className="space-y-4">
        {alertRules.map(rule => (
          <div key={rule.id} className="border rounded-md p-3 space-y-3 bg-background">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={rule.enabled} 
                  onCheckedChange={() => handleToggleRule(rule.id)}
                  id={`rule-${rule.id}`}
                />
                <Label htmlFor={`rule-${rule.id}`} className="font-medium">
                  {rule.severity} alert
                </Label>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleDeleteRule(rule.id)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete rule</span>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor={`threshold-${rule.id}`} className="text-xs">Threshold</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id={`threshold-${rule.id}`}
                    type="number"
                    min="1"
                    className="h-8"
                    value={rule.threshold}
                    onChange={(e) => handleUpdateRule(rule.id, 'threshold', parseInt(e.target.value) || 1)}
                  />
                  <span className="text-sm whitespace-nowrap">errors per</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor={`timeWindow-${rule.id}`} className="text-xs">Time Window</Label>
                <Select 
                  value={rule.timeWindow}
                  onValueChange={(value) => handleUpdateRule(rule.id, 'timeWindow', value)}
                >
                  <SelectTrigger id={`timeWindow-${rule.id}`} className="h-8">
                    <SelectValue placeholder="Select time window" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">1 minute</SelectItem>
                    <SelectItem value="5m">5 minutes</SelectItem>
                    <SelectItem value="15m">15 minutes</SelectItem>
                    <SelectItem value="1h">1 hour</SelectItem>
                    <SelectItem value="6h">6 hours</SelectItem>
                    <SelectItem value="24h">24 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor={`severity-${rule.id}`} className="text-xs">Severity</Label>
                <Select 
                  value={rule.severity}
                  onValueChange={(value) => handleUpdateRule(rule.id, 'severity', value)}
                >
                  <SelectTrigger id={`severity-${rule.id}`} className="h-8">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="pt-1">
              <Label className="text-xs mb-1 block">Notification Channels</Label>
              <div className="flex flex-wrap gap-2">
                {['email', 'slack', 'webhook'].map(channel => {
                  const isActive = rule.notificationChannels.includes(channel);
                  return (
                    <Button
                      key={channel}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        if (isActive) {
                          handleUpdateRule(
                            rule.id, 
                            'notificationChannels', 
                            rule.notificationChannels.filter(c => c !== channel)
                          );
                        } else {
                          handleUpdateRule(
                            rule.id, 
                            'notificationChannels', 
                            [...rule.notificationChannels, channel]
                          );
                        }
                      }}
                    >
                      {channel}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
        
        {alertRules.length === 0 && (
          <div className="flex flex-col items-center justify-center p-6 text-center bg-muted/20 rounded-md border border-dashed">
            <AlertTriangle className="h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="text-sm font-medium mb-1">No alert rules configured</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Add rules to get notified when error rates exceed thresholds
            </p>
            <Button variant="outline" size="sm" onClick={handleAddRule}>
              <Plus className="h-3.5 w-3.5 mr-2" />
              Add First Rule
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorRateAlerts;
