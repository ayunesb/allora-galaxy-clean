
import React from 'react';
import PageHelmet from '@/components/PageHelmet';
import { SystemConfigSection } from '@/components/admin/config/SystemConfigSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Clock, 
  Shield, 
  Bell, 
  Database, 
  Cloud 
} from 'lucide-react';
import { notifyAndLog } from '@/lib/notifications/notifyAndLog';

const SystemConfig: React.FC = () => {
  const handleSaveGeneralSettings = async (values: Record<string, any>) => {
    // In a real app, this would save the settings to the database
    console.log('Saving general settings:', values);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    
    await notifyAndLog(
      'system',
      'info',
      'System Settings Updated',
      'General system settings have been updated',
      'success',
      {
        event_type: 'settings.updated',
        settings: 'general',
        updated_by: 'admin'
      },
      'system'
    );
  };
  
  const handleSaveSecuritySettings = async (values: Record<string, any>) => {
    console.log('Saving security settings:', values);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    
    await notifyAndLog(
      'system',
      'info',
      'Security Settings Updated',
      'Security settings have been updated',
      'success',
      {
        event_type: 'settings.updated',
        settings: 'security',
        updated_by: 'admin'
      },
      'system'
    );
  };
  
  const handleSaveNotificationSettings = async (values: Record<string, any>) => {
    console.log('Saving notification settings:', values);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    
    await notifyAndLog(
      'system',
      'info',
      'Notification Settings Updated',
      'Notification settings have been updated',
      'success',
      {
        event_type: 'settings.updated',
        settings: 'notifications',
        updated_by: 'admin'
      },
      'system'
    );
  };
  
  const handleSaveCronJobSettings = async (values: Record<string, any>) => {
    console.log('Saving CRON job settings:', values);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    
    await notifyAndLog(
      'cron',
      'info',
      'CRON Settings Updated',
      'CRON job settings have been updated',
      'success',
      {
        event_type: 'settings.updated',
        settings: 'cron',
        updated_by: 'admin'
      },
      'system'
    );
  };
  
  const handleSaveDatabaseSettings = async (values: Record<string, any>) => {
    console.log('Saving database settings:', values);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    
    await notifyAndLog(
      'database',
      'info',
      'Database Settings Updated',
      'Database settings have been updated',
      'success',
      {
        event_type: 'settings.updated',
        settings: 'database',
        updated_by: 'admin'
      },
      'system'
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHelmet title="System Configuration" description="Manage system-wide settings and configurations" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">System Configuration</h1>
          <p className="text-muted-foreground">Manage system-wide settings and configurations</p>
        </div>
      </div>
      
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid grid-cols-3 md:grid-cols-5 w-full">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="cronjobs" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">CRON Jobs</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Database</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <SystemConfigSection
            title="General Settings"
            description="Configure basic system behavior and defaults"
            icon={<Settings className="h-5 w-5" />}
            configItems={[
              {
                key: "systemName",
                label: "System Name",
                type: "text",
                value: "Allora Galaxy Command Center",
                helpText: "The name displayed in the UI and email notifications"
              },
              {
                key: "defaultLanguage",
                label: "Default Language",
                type: "text",
                value: "en-US",
                helpText: "The default language for new users"
              },
              {
                key: "maintenanceMode",
                label: "Maintenance Mode",
                type: "toggle",
                value: false,
                helpText: "When enabled, only admins can access the system"
              },
              {
                key: "sessionTimeout",
                label: "Session Timeout (minutes)",
                type: "number",
                value: 60,
                helpText: "How long until inactive users are automatically logged out"
              }
            ]}
            onSave={handleSaveGeneralSettings}
          />
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <SystemConfigSection
            title="Security Settings"
            description="Configure security policies and access controls"
            icon={<Shield className="h-5 w-5" />}
            configItems={[
              {
                key: "mfaRequired",
                label: "Require MFA for Admins",
                type: "toggle",
                value: true,
                helpText: "Force all admin users to set up multi-factor authentication"
              },
              {
                key: "passwordPolicy",
                label: "Password Minimum Length",
                type: "number",
                value: 12,
                helpText: "Minimum length for user passwords"
              },
              {
                key: "apiRateLimit",
                label: "API Rate Limit (requests/minute)",
                type: "number",
                value: 100,
                helpText: "Maximum number of API requests per minute per user"
              },
              {
                key: "strictRLS",
                label: "Enforce Strict RLS",
                type: "toggle",
                value: true,
                helpText: "Enable stricter Row-Level Security checks across all tables"
              }
            ]}
            onSave={handleSaveSecuritySettings}
          />
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6">
          <SystemConfigSection
            title="Notification Settings"
            description="Configure system-wide notification preferences"
            icon={<Bell className="h-5 w-5" />}
            configItems={[
              {
                key: "emailNotificationsEnabled",
                label: "Email Notifications",
                type: "toggle",
                value: true,
                helpText: "Send important system notifications via email"
              },
              {
                key: "slackIntegrationEnabled",
                label: "Slack Integration",
                type: "toggle",
                value: false,
                helpText: "Send notifications to a Slack channel"
              },
              {
                key: "systemAlertsEnabled",
                label: "System Alert Notifications",
                type: "toggle",
                value: true,
                helpText: "Send alerts for system events like errors and warnings"
              },
              {
                key: "errorThreshold",
                label: "Error Notification Threshold",
                type: "number",
                value: 5,
                helpText: "Number of errors before sending an admin alert"
              }
            ]}
            onSave={handleSaveNotificationSettings}
          />
        </TabsContent>
        
        <TabsContent value="cronjobs" className="space-y-6">
          <SystemConfigSection
            title="CRON Job Settings"
            description="Configure scheduled tasks and maintenance operations"
            icon={<Clock className="h-5 w-5" />}
            configItems={[
              {
                key: "dbCleanupEnabled",
                label: "Database Cleanup",
                type: "toggle",
                value: true,
                helpText: "Regularly clean up old logs and temporary data"
              },
              {
                key: "dbCleanupInterval",
                label: "Cleanup Interval (days)",
                type: "number",
                value: 30,
                helpText: "How often to run database cleanup"
              },
              {
                key: "logRetentionDays",
                label: "Log Retention (days)",
                type: "number",
                value: 90,
                helpText: "How long to keep system logs"
              },
              {
                key: "autoEvolutionEnabled",
                label: "Auto Evolution",
                type: "toggle",
                value: true,
                helpText: "Automatically evolve agents based on performance"
              }
            ]}
            onSave={handleSaveCronJobSettings}
          />
        </TabsContent>
        
        <TabsContent value="database" className="space-y-6">
          <SystemConfigSection
            title="Database Settings"
            description="Configure database connection and optimization settings"
            icon={<Database className="h-5 w-5" />}
            configItems={[
              {
                key: "connectionPoolSize",
                label: "Connection Pool Size",
                type: "number",
                value: 20,
                helpText: "Maximum number of concurrent database connections"
              },
              {
                key: "queryTimeout",
                label: "Query Timeout (seconds)",
                type: "number",
                value: 30,
                helpText: "Maximum time a query can run before timing out"
              },
              {
                key: "statementCache",
                label: "Statement Cache Size",
                type: "number",
                value: 100,
                helpText: "How many prepared statements to cache"
              },
              {
                key: "autoVacuum",
                label: "Auto Vacuum",
                type: "toggle",
                value: true,
                helpText: "Automatically vacuum the database on schedule"
              }
            ]}
            onSave={handleSaveDatabaseSettings}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemConfig;
