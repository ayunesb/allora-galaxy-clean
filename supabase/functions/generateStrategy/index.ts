import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Helper function to safely get environment variables
function getEnv(name: string, fallback: string = ""): string {
  try {
    // Check if we're in Deno environment
    if (typeof globalThis.Deno !== 'undefined') {
      return globalThis.Deno.env.get(name) || fallback;
    }
    // Fallback to process.env for Node environment
    return process.env[name] || fallback;
  } catch (error) {
    // If all else fails, return the fallback
    console.warn(`Error accessing env var ${name}:`, error);
    return fallback;
  }
}

// Define environment variable structure
type EnvVar = {
  name: string;
  required: boolean;
  description: string;
};

// Validate environment variables
function validateEnv(requiredEnvs: EnvVar[]): Record<string, string> {
  const result: Record<string, string> = {};
  const missing: string[] = [];
  
  for (const env of requiredEnvs) {
    const value = getEnv(env.name);
    result[env.name] = value;
    
    if (env.required && !value) {
      missing.push(env.name);
    }
  }
  
  if (missing.length > 0) {
    console.warn(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  return result;
}

// Log environment status
function logEnvStatus(env: Record<string, string>): void {
  const status = Object.entries(env).map(([key, value]) => ({
    key,
    configured: !!value
  }));
  console.log("Environment status:", status);
}

// Format error response
function formatErrorResponse(
  status: number, 
  message: string, 
  details?: string, 
  executionTime?: number
): Response {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json"
  };
  
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      details: details || undefined,
      execution_time: executionTime,
      timestamp: new Date().toISOString()
    }),
    {
      status,
      headers
    }
  );
}

// Format success response
function formatSuccessResponse(data: any, executionTime?: number): Response {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json"
  };
  
  return new Response(
    JSON.stringify({
      success: true,
      data,
      execution_time: executionTime,
      timestamp: new Date().toISOString()
    }),
    {
      status: 200,
      headers
    }
  );
}

// Parse and validate request
async function safeParseRequest<T>(req: Request, schema: z.ZodSchema<T>): Promise<[T | null, string | null]> {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    
    if (result.success) {
      return [result.data, null];
    } else {
      const errorMessage = result.error.issues
        .map(i => `${i.path.join('.')}: ${i.message}`)
        .join(', ');
      return [null, errorMessage];
    }
  } catch (error) {
    return [null, "Invalid JSON in request body"];
  }
}

const MODULE_NAME = "generateStrategy";

// Define required environment variables
const requiredEnv: EnvVar[] = [
  { name: 'SUPABASE_URL', required: true, description: 'Supabase project URL' },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', required: true, description: 'Service role key for admin access' },
  { name: 'OPENAI_API_KEY', required: true, description: 'OpenAI API key for strategy generation' }
];

// Define input schema
const generateStrategySchema = z.object({
  tenant_id: z.string().uuid(),
  company_profile: z.object({
    name: z.string(),
    industry: z.string(),
    size: z.string(),
    website: z.string().optional(),
    description: z.string().optional(),
    revenue_range: z.string().optional(),
  }),
  persona_profile: z.object({
    name: z.string(),
    tone: z.string(),
    goals: z.array(z.string())
  }),
  user_id: z.string().uuid().optional() // Created by (optional)
});

// Validate environment variables
const env = validateEnv(requiredEnv);
logEnvStatus(env);

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StrategyResponse {
  title: string;
  description: string;
  tags: string[];
  priority: 'high' | 'medium' | 'low';
  due_date: string; // ISO date string
}

serve(async (req) => {
  const startTime = performance.now();
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`${MODULE_NAME}: Processing request`);
    
    // Check if environment variables are valid
    if (!env.OPENAI_API_KEY) {
      console.error(`${MODULE_NAME}: Missing OPENAI_API_KEY`);
      return formatErrorResponse(
        500,
        "OPENAI_API_KEY is not configured",
        undefined,
        (performance.now() - startTime) / 1000
      );
    }

    // Create Supabase client with admin privileges
    const supabaseAdmin = env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
      ? createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
      : null;
      
    // Check if Supabase client was initialized properly
    if (!supabaseAdmin) {
      console.error(`${MODULE_NAME}: Missing Supabase configuration`);
      return formatErrorResponse(
        500, 
        "Supabase client could not be initialized", 
        "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured",
        (performance.now() - startTime) / 1000
      );
    }

    // Parse and validate request using zod schema
    const [payload, parseError] = await safeParseRequest(req, generateStrategySchema);
    
    if (parseError || !payload) {
      console.error(`${MODULE_NAME}: Invalid payload - ${parseError}`);
      return formatErrorResponse(400, parseError || "Invalid request", undefined, (performance.now() - startTime) / 1000);
    }
    
    const { tenant_id, company_profile, persona_profile, user_id } = payload;
    
    // Verify tenant exists
    try {
      const { data: tenant, error: tenantError } = await supabaseAdmin
        .from('tenants')
        .select('id, name')
        .eq('id', tenant_id)
        .maybeSingle();
        
      if (tenantError) {
        throw new Error(`Failed to verify tenant: ${tenantError.message}`);
      }
      
      if (!tenant) {
        return formatErrorResponse(404, `Tenant with ID ${tenant_id} not found`, undefined, (performance.now() - startTime) / 1000);
      }
      
      console.log(`${MODULE_NAME}: Generating strategy for tenant ${tenant.name}`);
    } catch (tenantError) {
      console.error(`${MODULE_NAME}: Error verifying tenant:`, tenantError);
      return formatErrorResponse(500, "Failed to verify tenant", String(tenantError), (performance.now() - startTime) / 1000);
    }

    // Log start of strategy generation
    const generationId = crypto.randomUUID();
    await supabaseAdmin
      .from('system_logs')
      .insert({
        tenant_id,
        module: 'strategy',
        event: 'strategy_generation_started',
        context: {
          generation_id: generationId,
          company_name: company_profile.name,
          company_industry: company_profile.industry,
          company_size: company_profile.size,
          persona_name: persona_profile.name
        }
      });
    
    // Create system prompt
    const systemPrompt = `You are an AI business strategist. Generate a go-to-market plan based on the company profile and marketing persona provided.
Focus on creating an actionable strategy with specific, measurable objectives.
Your strategy should be appropriate for a ${company_profile.size} company in the ${company_profile.industry} industry.`;

    // Create user prompt with company and persona details
    const userPrompt = `
Company Profile:
- Name: ${company_profile.name}
- Industry: ${company_profile.industry}
- Size: ${company_profile.size}
${company_profile.revenue_range ? `- Revenue Range: ${company_profile.revenue_range}` : ''}
${company_profile.website ? `- Website: ${company_profile.website}` : ''}
${company_profile.description ? `- Description: ${company_profile.description}` : ''}

Marketing Persona:
- Name: ${persona_profile.name}
- Tone: ${persona_profile.tone}
- Goals: ${persona_profile.goals.join(", ")}

Generate a comprehensive go-to-market strategy for this company targeting the specified persona. 
Include a catchy title, detailed plan description, relevant tags, priority level (high, medium, or low), and a reasonable due date.`;

    try {
      console.log(`${MODULE_NAME}: Calling OpenAI API - generation ID: ${generationId}`);
      
      // Log progress
      await supabaseAdmin
        .from('system_logs')
        .insert({
          tenant_id,
          module: 'strategy',
          event: 'strategy_generation_progress',
          context: {
            generation_id: generationId,
            step: 'calling_openai',
            progress_percent: 25
          }
        });
      
      // OpenAI API call to generate strategy
      const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      });

      if (!openAiResponse.ok) {
        const error = await openAiResponse.text();
        console.error(`${MODULE_NAME}: OpenAI API error:`, error);
        
        // Log failure
        await supabaseAdmin
          .from('system_logs')
          .insert({
            tenant_id,
            module: 'strategy',
            event: 'strategy_generation_failed',
            context: {
              generation_id: generationId,
              error: `OpenAI API error: ${error}`,
              stage: 'openai_request'
            }
          });
          
        return formatErrorResponse(
          500, 
          "Failed to generate strategy", 
          `OpenAI API error: ${error}`,
          (performance.now() - startTime) / 1000
        );
      }

      // Log progress
      await supabaseAdmin
        .from('system_logs')
        .insert({
          tenant_id,
          module: 'strategy',
          event: 'strategy_generation_progress',
          context: {
            generation_id: generationId,
            step: 'processing_response',
            progress_percent: 50
          }
        });

      const aiResponse = await openAiResponse.json();
      let generatedContent;
      try {
        generatedContent = JSON.parse(aiResponse.choices[0].message.content);
      } catch (parseError) {
        console.error(`${MODULE_NAME}: Error parsing OpenAI response:`, parseError);
        console.log("Raw content:", aiResponse.choices[0].message.content);
        
        // Log failure
        await supabaseAdmin
          .from('system_logs')
          .insert({
            tenant_id,
            module: 'strategy',
            event: 'strategy_generation_failed',
            context: {
              generation_id: generationId,
              error: `Failed to parse OpenAI response: ${parseError}`,
              stage: 'response_parsing'
            }
          });
        
        return formatErrorResponse(
          500, 
          "Failed to parse strategy from OpenAI", 
          String(parseError),
          (performance.now() - startTime) / 1000
        );
      }
      
      // Format and validate the AI response
      const strategy: StrategyResponse = {
        title: generatedContent.title || `Strategy for ${company_profile.name}`,
        description: generatedContent.description || "Generated strategy description",
        tags: Array.isArray(generatedContent.tags) ? generatedContent.tags : [],
        priority: ['high', 'medium', 'low'].includes(generatedContent.priority) 
          ? generatedContent.priority as 'high' | 'medium' | 'low'
          : 'medium',
        due_date: generatedContent.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      console.log(`${MODULE_NAME}: Strategy generated, storing in database`);
      
      // Log progress
      await supabaseAdmin
        .from('system_logs')
        .insert({
          tenant_id,
          module: 'strategy',
          event: 'strategy_generation_progress',
          context: {
            generation_id: generationId,
            step: 'storing_in_database',
            progress_percent: 75,
            strategy_title: strategy.title
          }
        });
      
      try {
        // Store the generated strategy in the database
        const { data: strategyData, error: strategyError } = await supabaseAdmin
          .from('strategies')
          .insert({
            tenant_id,
            created_by: user_id || tenant_id, // Use user_id if provided, otherwise tenant_id
            title: strategy.title,
            description: strategy.description,
            tags: strategy.tags,
            priority: strategy.priority,
            due_date: strategy.due_date,
            status: 'pending'
          })
          .select('id')
          .single();

        if (strategyError) {
          console.error(`${MODULE_NAME}: Error storing strategy:`, strategyError);
          
          // Log failure
          await supabaseAdmin
            .from('system_logs')
            .insert({
              tenant_id,
              module: 'strategy',
              event: 'strategy_generation_failed',
              context: {
                generation_id: generationId,
                error: `Failed to store strategy: ${strategyError.message}`,
                stage: 'database_insert'
              }
            });
          
          return formatErrorResponse(
            500, 
            "Failed to store generated strategy", 
            strategyError.message,
            (performance.now() - startTime) / 1000
          );
        }

        // Log completion
        await supabaseAdmin
          .from('system_logs')
          .insert({
            tenant_id,
            module: 'strategy',
            event: 'strategy_generated',
            context: {
              generation_id: generationId,
              strategy_id: strategyData.id,
              execution_time: (performance.now() - startTime) / 1000
            }
          });

        console.log(`${MODULE_NAME}: Strategy generated successfully with ID ${strategyData.id}`);
        
        return formatSuccessResponse({
          message: "Strategy generated successfully",
          strategy: { ...strategy, id: strategyData.id },
          generation_id: generationId
        }, (performance.now() - startTime) / 1000);
      } catch (dbError) {
        console.error(`${MODULE_NAME}: Database error:`, dbError);
        
        // Log failure
        await supabaseAdmin
          .from('system_logs')
          .insert({
            tenant_id,
            module: 'strategy',
            event: 'strategy_generation_failed',
            context: {
              generation_id: generationId,
              error: `Database error: ${String(dbError)}`,
              stage: 'database_operation'
            }
          });
        
        return formatErrorResponse(
          500, 
          "Failed to store strategy in database", 
          String(dbError),
          (performance.now() - startTime) / 1000
        );
      }
    } catch (openAiError) {
      console.error(`${MODULE_NAME}: Error calling OpenAI API:`, openAiError);
      
      // Log failure
      await supabaseAdmin
        .from('system_logs')
        .insert({
          tenant_id,
          module: 'strategy',
          event: 'strategy_generation_failed',
          context: {
            generation_id: generationId,
            error: `OpenAI error: ${String(openAiError)}`,
            stage: 'openai_communication'
          }
        });
      
      return formatErrorResponse(
        500,
        "Failed to generate strategy with OpenAI", 
        String(openAiError),
        (performance.now() - startTime) / 1000
      );
    }
  } catch (error) {
    console.error(`${MODULE_NAME}: Unhandled error:`, error);
    return formatErrorResponse(
      500,
      "Failed to generate strategy", 
      String(error),
      (performance.now() - startTime) / 1000
    );
  }
});
