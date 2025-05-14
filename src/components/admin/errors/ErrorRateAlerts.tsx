
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from "sonner";

const ErrorRateAlerts: React.FC = () => {
  // Alert threshold configuration
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [criticalThreshold, setCriticalThreshold] = useState(10);
  const [warningThreshold, setWarningThreshold] = useState(5);
  const [notificationChannel, setNotificationChannel] = useState("email");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [emailRecipients, setEmailRecipients] = useState("");
  
  const handleSaveAlertSettings = () => {
    // In a real implementation, this would save settings to the database
    toast.success("Alert settings saved successfully!");
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="alerts-enabled">Enable Error Alerts</Label>
          <p className="text-sm text-muted-foreground">Receive alerts when error rates exceed thresholds</p>
        </div>
        <Switch
          id="alerts-enabled"
          checked={alertsEnabled}
          onCheckedChange={setAlertsEnabled}
        />
      </div>
      
      {alertsEnabled && (
        <>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="critical-threshold">Critical Threshold</Label>
              <span className="text-sm font-medium">{criticalThreshold} errors/hour</span>
            </div>
            <Slider
              id="critical-threshold"
              min={1}
              max={50}
              step={1}
              value={[criticalThreshold]}
              onValueChange={(values) => setCriticalThreshold(values[0])}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="warning-threshold">Warning Threshold</Label>
              <span className="text-sm font-medium">{warningThreshold} errors/hour</span>
            </div>
            <Slider
              id="warning-threshold"
              min={1}
              max={30}
              step={1}
              value={[warningThreshold]}
              onValueChange={(values) => setWarningThreshold(values[0])}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notification-channel">Notification Channel</Label>
            <Select value={notificationChannel} onValueChange={setNotificationChannel}>
              <SelectTrigger>
                <SelectValue placeholder="Select channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Channels</SelectLabel>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="slack">Slack</SelectItem>
                  <SelectItem value="webhook">Custom Webhook</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          {notificationChannel === "email" && (
            <div className="space-y-2">
              <Label htmlFor="email-recipients">Email Recipients</Label>
              <Input
                id="email-recipients"
                placeholder="email@example.com, another@example.com"
                value={emailRecipients}
                onChange={(e) => setEmailRecipients(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Separate multiple emails with commas</p>
            </div>
          )}
          
          {notificationChannel === "webhook" && (
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                placeholder="https://example.com/webhook"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>
          )}
          
          <Button onClick={handleSaveAlertSettings} className="w-full">
            Save Alert Settings
          </Button>
        </>
      )}
    </div>
  );
};

export default ErrorRateAlerts;
