
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { parseAndValidate } from "../_shared/edgeUtils/index.ts";

// Define the syncMQLs input schema
export const SyncMQLsSchema = z.object({
  tenant_id: z.string().uuid({
    message: "tenant_id must be a valid UUID"
  }),
  hubspot_api_key: z.string().optional()
});

// Define typescript types from schema
export type SyncMQLsInput = z.infer<typeof SyncMQLsSchema>;

/**
 * Validate the syncMQLs request input
 * @param req The incoming request
 * @returns Tuple of [validated data, error message]
 */
export async function validateSyncMQLsRequest(
  req: Request
): Promise<[SyncMQLsInput | null, string | null]> {
  return parseAndValidate(req, SyncMQLsSchema);
}
