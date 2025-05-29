import { supabase } from "@/integrations/supabase/client";
import { CreateNotificationInput } from "@/types/notifications";
import { toast } from "@/components/ui/use-toast";

/**
 * Send a notification to a specific user
 */
export async function sendNotification(
  notification: CreateNotificationInput,
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Validate required fields
    if (!notification.title) {
      throw new Error("Notification title is required");
    }

    if (!notification.tenant_id) {
      throw new Error("Tenant ID is required");
    }

    if (!notification.user_id) {
      throw new Error("User ID is required");
    }

    // Insert notification into database
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        title: notification.title,
        description: notification.description,
        type: notification.type || "info",
        tenant_id: notification.tenant_id,
        user_id: notification.user_id,
        action_url: notification.action_url,
        action_label: notification.action_label,
        metadata: notification.metadata || {},
      })
      .select("id, type")
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      id: data.id,
    };
  } catch (error: any) {
    console.error("Error sending notification:", error);

    // Show error toast if in browser context
    if (typeof window !== "undefined") {
      toast({
        title: "Notification Error",
        description: `Failed to send notification: ${error.message}`,
        variant: "destructive",
      });
    }

    return {
      success: false,
      error: error.message || "Unknown error sending notification",
    };
  }
}

/**
 * Send a notification to all users in a tenant
 */
export async function sendTenantNotification(
  notification: Omit<CreateNotificationInput, "user_id">,
  excludeUserId?: string,
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    // Get all users in the tenant
    const { data: tenantUsers, error: userError } = await supabase
      .from("tenant_user_roles")
      .select("user_id")
      .eq("tenant_id", notification.tenant_id);

    if (userError) {
      throw userError;
    }

    if (!tenantUsers || tenantUsers.length === 0) {
      return { success: true, count: 0 };
    }

    // Filter out excluded user if specified
    const userIds = tenantUsers
      .map((u) => u.user_id)
      .filter((id) => id !== excludeUserId);

    // Create notifications for each user
    const notifications = userIds.map((userId) => ({
      title: notification.title,
      description: notification.description,
      type: notification.type || "info",
      tenant_id: notification.tenant_id,
      user_id: userId,
      action_url: notification.action_url,
      action_label: notification.action_label,
      metadata: notification.metadata || {},
    }));

    const { error: insertError } = await supabase
      .from("notifications")
      .insert(notifications);

    if (insertError) {
      throw insertError;
    }

    return {
      success: true,
      count: notifications.length,
    };
  } catch (error: any) {
    console.error("Error sending tenant notification:", error);

    return {
      success: false,
      count: 0,
      error: error.message || "Unknown error sending tenant notification",
    };
  }
}
