
# Edge Function Utilities

This directory contains utilities for working with Supabase Edge Functions.

## Overview

Edge Functions are serverless functions that run on Supabase's edge network. These utilities help with:

- Error handling for Edge Functions
- Environment variable management
- CORS handling 
- Response formatting
- Request ID generation for tracing

## Key Components

### Error Handling (`errorHandler.ts`)

```typescript
import { handleEdgeError } from '@/lib/edge';

// Inside your edge function
try {
  // Function logic
} catch (error) {
  return handleEdgeError(error, request);
}
```

### CORS Headers

```typescript
import { corsHeaders } from '@/lib/edge';

// Handle CORS preflight requests
if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}

// Add CORS headers to your response
return new Response(JSON.stringify(data), {
  headers: {
    ...corsHeaders,
    'Content-Type': 'application/json'
  }
});
```

### Environment Utilities

```typescript
import { getEnv, isProduction } from '@/lib/edge';

// Get environment variable with type safety
const apiKey = getEnv('API_KEY');

// Conditional logic based on environment
if (isProduction()) {
  // Production-specific code
}
```

### Request ID Generation

```typescript
import { generateRequestId } from '@/lib/edge';

const requestId = generateRequestId();
// Use for tracing and correlation
```

### Response Formatting

```typescript
import { createSuccessResponse, createErrorResponse } from '@/lib/edge';

// Success response
return createSuccessResponse({ 
  data: result,
  message: 'Operation successful'
});

// Error response
return createErrorResponse({
  error: 'Resource not found',
  status: 404,
  code: 'NOT_FOUND'
});
```

## Edge Function Template

Here's a template for creating a new edge function with error handling, CORS support, and proper response formatting:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  corsHeaders,
  handleEdgeError,
  createSuccessResponse,
  generateRequestId,
  getEnv
} from "../_shared/utils.ts";

serve(async (req) => {
  // Generate request ID for tracing
  const requestId = generateRequestId();
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse request body
    const { param1, param2 } = await req.json();
    
    // Validate input
    if (!param1) {
      return createErrorResponse({
        error: "Missing required parameter: param1",
        status: 400,
        code: "INVALID_INPUT",
        requestId
      });
    }
    
    // Get environment variables
    const apiKey = getEnv("API_KEY");
    
    // Function logic here
    const result = await processData(param1, param2);
    
    // Return success response
    return createSuccessResponse({
      data: result,
      message: "Operation completed successfully",
      requestId
    });
    
  } catch (error) {
    // Handle errors and return appropriate response
    return handleEdgeError(error, req, requestId);
  }
});

async function processData(param1, param2) {
  // Implementation
}
```

## Best Practices

1. Always handle CORS for browser-accessible functions
2. Use the provided error handling utilities for consistent error responses
3. Include request IDs for all requests to aid debugging and tracing
4. Validate all input parameters before processing
5. Use typed environment variable helpers instead of direct Deno.env access
6. Return standardized response formats using createSuccessResponse/createErrorResponse
7. Add appropriate error logging for debugging
8. Use try/catch blocks to handle unexpected errors
