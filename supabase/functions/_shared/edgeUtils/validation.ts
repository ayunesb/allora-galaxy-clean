
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

/**
 * Parse and validate request body using Zod schema
 * @param req The request object
 * @param schema Zod schema for validation
 * @returns [parsed data, error message]
 */
export async function parseAndValidate<T>(
  req: Request, 
  schema: z.ZodType<T>
): Promise<[T | null, string | null]> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    
    if (result.success) {
      return [result.data, null];
    } else {
      const errorMessages = result.error.issues
        .map(issue => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');
      
      return [null, errorMessages];
    }
  } catch (error) {
    return [null, `Invalid JSON in request body: ${error.message}`];
  }
}

/**
 * Validate input against a schema without parsing request body
 * @param input Object to validate
 * @param schema Zod schema for validation
 * @returns [is valid, error message]
 */
export function validateInput<T>(
  input: unknown, 
  schema: z.ZodType<T>
): [boolean, string | null] {
  const result = schema.safeParse(input);
  
  if (result.success) {
    return [true, null];
  } else {
    const errorMessages = result.error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ');
    
    return [false, errorMessages];
  }
}

/**
 * Basic validation schema builders
 */
export const schemaBuilders = {
  /**
   * Create a UUID field schema
   */
  uuid: (fieldName: string = "id") => z.string().uuid({ 
    message: `${fieldName} must be a valid UUID`
  }),
  
  /**
   * Create a required string field schema
   */
  requiredString: (fieldName: string) => z.string().min(1, {
    message: `${fieldName} is required`
  }),
  
  /**
   * Create a required object field schema
   */
  requiredObject: (fieldName: string) => z.object({}).passthrough().refine(
    obj => Object.keys(obj).length > 0, 
    { message: `${fieldName} must not be empty` }
  ),
  
  /**
   * Create a tenant ID field schema
   */
  tenantId: () => z.string().uuid({
    message: "tenant_id must be a valid UUID"
  }),
  
  /**
   * Create a pagination params schema
   */
  paginationParams: () => z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20)
  })
};
