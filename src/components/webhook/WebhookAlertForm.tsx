import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTenantId } from "@/hooks/useTenantId";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { retryWebhookAlert } from "@/services/webhook/webhookService";
import { EdgeFunctionHandler } from "@/components/errors/EdgeFunctionHandler";

const formSchema = z.object({
  webhook_url: z.string().url("Please enter a valid URL"),
  alert_type: z.string().min(1, "Please select an alert type"),
  message: z.string().min(5, "Message must be at least 5 characters"),
  metadata: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const alertTypes = [
  { value: "info", label: "Information" },
  { value: "warning", label: "Warning" },
  { value: "error", label: "Error" },
  { value: "success", label: "Success" },
];

export const WebhookAlertForm: React.FC = () => {
  const { tenantId } = useTenantId();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      webhook_url: "",
      alert_type: "",
      message: "",
      metadata: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!tenantId) {
      setError(new Error("No tenant ID available"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let metadata: Record<string, any> | undefined;

      if (data.metadata) {
        try {
          metadata = JSON.parse(data.metadata);
        } catch (e) {
          form.setError("metadata", {
            message: "Invalid JSON format in metadata",
          });
          setIsLoading(false);
          return;
        }
      }

      // Use the retry mechanism for webhook alerts
      const result = await retryWebhookAlert({
        webhook_url: data.webhook_url,
        alert_type: data.alert_type,
        message: data.message,
        tenant_id: tenantId,
        metadata,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to send webhook alert");
      }

      // Reset form after successful submission
      form.reset();
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred"),
      );
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    setIsRetrying(true);
    form.handleSubmit(onSubmit)();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Webhook Alert</CardTitle>
        <CardDescription>
          Configure and send an alert to your webhook endpoint
        </CardDescription>
      </CardHeader>

      <EdgeFunctionHandler
        isLoading={isLoading}
        error={error}
        onRetry={handleRetry}
        retryCount={retryCount}
        maxRetries={3}
        isRetrying={isRetrying}
        loadingText="Sending webhook alert..."
      >
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="webhook_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Webhook URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/webhook"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="alert_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alert Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an alert type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {alertTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your alert message"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metadata"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metadata (Optional JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='{"key": "value", "items": [1, 2, 3]}'
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Alert"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </EdgeFunctionHandler>
    </Card>
  );
};

export default WebhookAlertForm;
