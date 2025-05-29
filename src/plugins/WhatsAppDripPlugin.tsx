import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantId } from "@/hooks/useTenantId";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader, Plus, Save, Trash, Clock } from "lucide-react";
import { format } from "date-fns";

interface Message {
  id: string;
  content: string;
  delay: number; // Delay in hours
  active: boolean;
}

interface WhatsAppDripConfig {
  messages: Message[];
  enabledFor: string[];
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
  status: "active" | "inactive" | "deprecated";
}

const DEFAULT_CONFIG: WhatsAppDripConfig = {
  messages: [
    {
      id: "1",
      content:
        "Welcome! Thank you for your interest. How can we help you today?",
      delay: 0,
      active: true,
    },
    {
      id: "2",
      content:
        "Just checking in. Do you have any questions about our services?",
      delay: 24,
      active: true,
    },
    {
      id: "3",
      content:
        "Final follow-up: Would you like to schedule a demo or consultation?",
      delay: 72,
      active: true,
    },
  ],
  enabledFor: ["leads", "prospects"],
  status: "inactive",
};

const WhatsAppDripPlugin: React.FC = () => {
  const tenantId = useTenantId();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [config, setConfig] = useState<WhatsAppDripConfig>(DEFAULT_CONFIG);
  const [isConfigChanged, setIsConfigChanged] = useState(false);
  const [newMessage, setNewMessage] = useState<Omit<Message, "id">>({
    content: "",
    delay: 24,
    active: true,
  });

  // Fetch plugin configuration from Supabase
  const { data: plugin, isLoading } = useQuery({
    queryKey: ["plugin", "whatsapp-drip"],
    queryFn: async () => {
      if (!tenantId) return null;

      try {
        const { data, error } = await supabase
          .from("plugins")
          .select("*")
          .eq("name", "WhatsApp Drip Campaign")
          .eq("status", "active")
          .maybeSingle();

        if (error) {
          console.error("Error fetching WhatsApp plugin:", error);
          throw error;
        }

        return data;
      } catch (err) {
        // Show a toast or handle error gracefully
        toast({
          title: "Error fetching WhatsApp plugin",
          description: (err as Error).message || "Failed to fetch plugin data",
          variant: "destructive",
        });
        return null;
      }
    },
    enabled: !!tenantId,
  });

  // Save plugin configuration to Supabase
  const savePlugin = useMutation({
    mutationFn: async (pluginConfig: WhatsAppDripConfig) => {
      if (!tenantId) {
        throw new Error("No tenant selected");
      }

      // Check if plugin already exists
      if (plugin?.id) {
        // Update existing plugin
        const { data, error } = await supabase
          .from("plugins")
          .update({
            metadata: pluginConfig,
            status: pluginConfig.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", plugin.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new plugin
        const { data, error } = await supabase
          .from("plugins")
          .insert({
            name: "WhatsApp Drip Campaign",
            description:
              "Automated WhatsApp message drip campaign for leads and customers",
            status: pluginConfig.status,
            xp: 0,
            roi: 0,
            category: "messaging",
            icon: "message-square",
            metadata: pluginConfig,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plugin", "whatsapp-drip"] });
      toast({
        title: "Plugin saved",
        description:
          "WhatsApp Drip Campaign plugin has been saved successfully",
      });
      setIsConfigChanged(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save plugin",
        description:
          error.message || "An error occurred while saving the plugin",
        variant: "destructive",
      });
    },
  });

  // Load existing configuration if available
  useEffect(() => {
    if (plugin?.metadata) {
      try {
        const pluginConfig: Partial<WhatsAppDripConfig> =
          typeof plugin.metadata === "string"
            ? JSON.parse(plugin.metadata)
            : plugin.metadata ?? {};

        setConfig({
          ...DEFAULT_CONFIG,
          ...pluginConfig,
          status: plugin.status || "inactive",
        });
      } catch (e) {
        console.error("Error parsing plugin metadata:", e);
        setConfig(DEFAULT_CONFIG);
      }
    }
  }, [plugin]);

  // Add a new message to the drip sequence
  const addMessage = () => {
    if (!newMessage.content) {
      toast({
        title: "Message required",
        description: "Please enter a message content",
        variant: "destructive",
      });
      return;
    }

    const newId = (
      Math.max(0, ...config.messages.map((m) => parseInt(m.id || "0"))) + 1
    ).toString();

    setConfig((prev) => ({
      ...prev,
      messages: [...prev.messages, { ...newMessage, id: newId }].sort(
        (a, b) => a.delay - b.delay,
      ),
    }));

    setNewMessage({ content: "", delay: 24, active: true });
    setIsConfigChanged(true);
  };

  // Remove a message from the drip sequence
  const removeMessage = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      messages: prev.messages.filter((m) => m.id !== id),
    }));
    setIsConfigChanged(true);
  };

  // Toggle message active state
  const toggleMessageActive = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      messages: prev.messages.map((m) =>
        m.id === id ? { ...m, active: !m.active } : m,
      ),
    }));
    setIsConfigChanged(true);
  };

  // Toggle plugin status
  const togglePluginStatus = () => {
    setConfig((prev) => ({
      ...prev,
      status: prev.status === "active" ? "inactive" : "active",
    }));
    setIsConfigChanged(true);
  };

  // Update Twilio credentials
  const updateTwilioConfig = (
    field: keyof WhatsAppDripConfig,
    value: string,
  ) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
    setIsConfigChanged(true);
  };

  // Check if Twilio configuration is complete
  const isTwilioConfigured = Boolean(
    config.twilioAccountSid &&
      config.twilioAuthToken &&
      config.twilioPhoneNumber,
  );

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">WhatsApp Drip Campaign Plugin</h1>
      <p className="text-muted-foreground mb-8">
        Configure automated WhatsApp message sequences for your leads and
        customers
      </p>

      {isLoading ? (
        <div className="py-12 text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-muted-foreground">
            Loading plugin configuration...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main configuration panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Message Sequence</CardTitle>
                    <CardDescription>
                      Configure your drip campaign message sequence
                    </CardDescription>
                  </div>
                  <Badge
                    variant={config.status === "active" ? "default" : "outline"}
                  >
                    {config.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Message</TableHead>
                      <TableHead className="w-28">Delay (hours)</TableHead>
                      <TableHead className="w-24">Active</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {config.messages.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-muted-foreground py-6"
                        >
                          No messages configured. Add your first message below.
                        </TableCell>
                      </TableRow>
                    ) : (
                      config.messages.map((message) => (
                        <TableRow key={message.id}>
                          <TableCell
                            className={
                              !message.active ? "text-muted-foreground" : ""
                            }
                          >
                            {message.content}
                            {message.delay === 0 && (
                              <Badge variant="outline" className="ml-2">
                                Initial
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                            {message.delay}h
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={message.active}
                              onCheckedChange={() =>
                                toggleMessageActive(message.id)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMessage(message.id)}
                            >
                              <Trash className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                <div className="border rounded-md p-4 mt-6">
                  <h3 className="text-sm font-medium mb-2">Add New Message</h3>
                  <div className="grid grid-cols-1 md:grid-cols-10 gap-4">
                    <div className="md:col-span-7">
                      <Textarea
                        placeholder="Enter message content"
                        value={newMessage.content}
                        onChange={(e) =>
                          setNewMessage((prev) => ({
                            ...prev,
                            content: e.target.value,
                          }))
                        }
                        rows={2}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="delay" className="whitespace-nowrap">
                          Delay (h):
                        </Label>
                        <Input
                          id="delay"
                          type="number"
                          min="0"
                          value={newMessage.delay}
                          onChange={(e) =>
                            setNewMessage((prev) => ({
                              ...prev,
                              delay: parseInt(e.target.value),
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      <Button onClick={addMessage} className="w-full">
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button
                  onClick={() => savePlugin.mutate(config)}
                  disabled={!isConfigChanged || savePlugin.isPending}
                  className="ml-auto"
                >
                  {savePlugin.isPending ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Configuration
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Twilio Configuration</CardTitle>
                <CardDescription>
                  Connect to Twilio for sending WhatsApp messages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accountSid">Account SID</Label>
                  <Input
                    id="accountSid"
                    placeholder="Enter your Twilio Account SID"
                    value={config.twilioAccountSid || ""}
                    onChange={(e) =>
                      updateTwilioConfig("twilioAccountSid", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="authToken">Auth Token</Label>
                  <Input
                    id="authToken"
                    type="password"
                    placeholder="Enter your Twilio Auth Token"
                    value={config.twilioAuthToken || ""}
                    onChange={(e) =>
                      updateTwilioConfig("twilioAuthToken", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">WhatsApp Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="Enter your Twilio WhatsApp number (with country code)"
                    value={config.twilioPhoneNumber || ""}
                    onChange={(e) =>
                      updateTwilioConfig("twilioPhoneNumber", e.target.value)
                    }
                  />
                </div>

                <div className="mt-6 p-3 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Note: In development mode, messages will be logged but not
                    actually sent. To enable real message sending, configure
                    valid Twilio credentials.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Plugin Settings</CardTitle>
                <CardDescription>
                  Configure operational settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label
                      htmlFor="plugin-status"
                      className="text-base font-medium"
                    >
                      Enable Plugin
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Activate the WhatsApp drip campaign
                    </p>
                  </div>
                  <Switch
                    id="plugin-status"
                    checked={config.status === "active"}
                    onCheckedChange={togglePluginStatus}
                    disabled={!isTwilioConfigured}
                  />
                </div>

                {!isTwilioConfigured && config.status === "active" && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 text-yellow-800 dark:text-yellow-500 p-3 rounded-md text-sm">
                    Please complete Twilio configuration before activating the
                    plugin.
                  </div>
                )}

                <Separator />

                <div>
                  <Label className="text-base font-medium mb-2 block">
                    Target Audiences
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="leads"
                        checked={config.enabledFor.includes("leads")}
                        onCheckedChange={(checked) => {
                          setConfig((prev) => ({
                            ...prev,
                            enabledFor: checked
                              ? [...prev.enabledFor, "leads"]
                              : prev.enabledFor.filter((t) => t !== "leads"),
                          }));
                          setIsConfigChanged(true);
                        }}
                      />
                      <label htmlFor="leads" className="text-sm">
                        Leads
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="prospects"
                        checked={config.enabledFor.includes("prospects")}
                        onCheckedChange={(checked) => {
                          setConfig((prev) => ({
                            ...prev,
                            enabledFor: checked
                              ? [...prev.enabledFor, "prospects"]
                              : prev.enabledFor.filter(
                                  (t) => t !== "prospects",
                                ),
                          }));
                          setIsConfigChanged(true);
                        }}
                      />
                      <label htmlFor="prospects" className="text-sm">
                        Prospects
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="customers"
                        checked={config.enabledFor.includes("customers")}
                        onCheckedChange={(checked) => {
                          setConfig((prev) => ({
                            ...prev,
                            enabledFor: checked
                              ? [...prev.enabledFor, "customers"]
                              : prev.enabledFor.filter(
                                  (t) => t !== "customers",
                                ),
                          }));
                          setIsConfigChanged(true);
                        }}
                      />
                      <label htmlFor="customers" className="text-sm">
                        Customers
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="churned"
                        checked={config.enabledFor.includes("churned")}
                        onCheckedChange={(checked) => {
                          setConfig((prev) => ({
                            ...prev,
                            enabledFor: checked
                              ? [...prev.enabledFor, "churned"]
                              : prev.enabledFor.filter((t) => t !== "churned"),
                          }));
                          setIsConfigChanged(true);
                        }}
                      />
                      <label htmlFor="churned" className="text-sm">
                        Churned
                      </label>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-medium mb-2 block">
                    History
                  </Label>
                  {plugin?.created_at && (
                    <div className="text-sm">
                      <p className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span>
                          {format(new Date(plugin.created_at), "PPP")}
                        </span>
                      </p>
                      {plugin.updated_at && (
                        <p className="flex justify-between mt-1">
                          <span className="text-muted-foreground">
                            Last updated:
                          </span>
                          <span>
                            {format(new Date(plugin.updated_at), "PPP")}
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance</CardTitle>
                <CardDescription>Plugin activity and metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Messages Sent</span>
                    <Badge variant="outline">0</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Response Rate</span>
                    <Badge variant="outline">0%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">XP Earned</span>
                    <Badge variant="outline">{plugin?.xp || 0}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">ROI Score</span>
                    <Badge variant="outline">{plugin?.roi || 0}</Badge>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-4" disabled>
                  View Detailed Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppDripPlugin;
