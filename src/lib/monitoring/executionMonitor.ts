import { supabase } from "@/integrations/supabase/client";
import { logSystemEvent } from "@/lib/system/logSystemEvent";
import { ExecutionStatus } from "@/types/execution";

export interface ExecutionMetrics {
  id: string;
  start_time: Date;
  end_time?: Date;
  duration_ms?: number;
  status: ExecutionStatus;
  success: boolean;
  error?: string;
  resource_type: string;
  resource_id: string;
  tenant_id: string;
  user_id?: string;
  metadata?: Record<string, any>;
}

export async function startExecution(params: {
  resourceType: string;
  resourceId: string;
  tenantId: string;
  userId?: string;
  metadata?: Record<string, any>;
}): Promise<string | null> {
  try {
    const { resourceType, resourceId, tenantId, userId, metadata } = params;

    const executionData = {
      start_time: new Date(),
      status: "running" as ExecutionStatus,
      success: false,
      resource_type: resourceType,
      resource_id: resourceId,
      tenant_id: tenantId,
      user_id: userId,
      metadata,
    };

    const { data, error } = await supabase
      .from("execution_metrics")
      .insert(executionData)
      .select("id")
      .single();

    if (error) {
      console.error("Failed to start execution tracking:", error);
      return null;
    }

    await logSystemEvent("system", "info", {
      description: `Started execution of ${resourceType} ${resourceId}`,
      context: { executionId: data.id, resourceType, resourceId },
    });

    return data.id;
  } catch (error) {
    console.error("Error in startExecution:", error);
    return null;
  }
}

export async function completeExecution(params: {
  executionId: string;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}): Promise<boolean> {
  try {
    const { executionId, success, error, metadata } = params;
    const endTime = new Date();

    // First get the existing execution to calculate duration
    const { data: execution, error: fetchError } = await supabase
      .from("execution_metrics")
      .select("start_time, resource_type, resource_id, metadata")
      .eq("id", executionId)
      .single();

    if (fetchError) {
      console.error("Failed to fetch execution for completion:", fetchError);
      return false;
    }

    // Calculate duration
    const startTime = new Date(execution.start_time);
    const durationMs = endTime.getTime() - startTime.getTime();

    // Merge metadata if existing metadata is available
    const updatedMetadata = execution.metadata
      ? { ...execution.metadata, ...(metadata || {}) }
      : metadata;

    const updateData = {
      end_time: endTime,
      duration_ms: durationMs,
      status: success ? "completed" : "failed",
      success,
      error: error || null,
      metadata: updatedMetadata,
    };

    const { error: updateError } = await supabase
      .from("execution_metrics")
      .update(updateData)
      .eq("id", executionId);

    if (updateError) {
      console.error("Failed to complete execution tracking:", updateError);
      return false;
    }

    await logSystemEvent("system", success ? "info" : "error", {
      description: `${success ? "Completed" : "Failed"} execution of ${execution.resource_type} ${execution.resource_id}`,
      context: {
        executionId,
        durationMs,
        success,
        error: error || undefined,
      },
    });

    return true;
  } catch (error) {
    console.error("Error in completeExecution:", error);
    return false;
  }
}

export async function trackExecutionProgress(params: {
  executionId: string;
  progress: number; // 0-100
  status?: string;
  message?: string;
}): Promise<boolean> {
  try {
    const { executionId, progress, status, message } = params;

    const { error } = await supabase.from("execution_progress").insert({
      execution_id: executionId,
      progress,
      status,
      message,
      timestamp: new Date(),
    });

    if (error) {
      console.error("Failed to track execution progress:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in trackExecutionProgress:", error);
    return false;
  }
}
