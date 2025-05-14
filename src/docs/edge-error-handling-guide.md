
# Edge Function Error Handling Guide

This guide explains our standardized approach to handling errors in Supabase Edge Functions.

## 1. Standard Response Format

All edge function responses follow a consistent format that makes error handling predictable:

**Success Response:**
```json
{
  "success": true,
  "data": { /* Response data */ },
  "timestamp": "2023-05-14T10:30:00.000Z", 
  "requestId": "req_1684062600000_abcdef"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { /* Additional error details */ },
  "timestamp": "2023-05-14T10:30:00.000Z",
  "requestId": "req_1684062600000_abcdef",
  "status": 400
}
```

## 2. Error Codes Standard

Use these standardized error codes for consistency across edge functions:

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `BAD_REQUEST` | 400 | Invalid request format or data |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Authenticated but not authorized |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |
| `DEPENDENCY_ERROR` | 502 | External service failure |
| `CONFLICT` | 409 | Resource conflict |

## 3. Server-Side Implementation

### Basic Structure

All edge functions should follow this error handling pattern:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createSuccessResponse, createErrorResponse, handleCorsRequest, generateRequestId } from "../_shared/edgeUtils.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsRequest(req);
  if (corsResponse) return corsResponse;
  
  const requestId = generateRequestId();
  console.log(`[${requestId}] Processing request`);
  
  try {
    // Parse request
    const body = await req.json().catch(error => {
      throw new Error("Invalid JSON payload");
    });
    
    // Process request
    const result = await processRequest(body);
    
    // Return success response
    return createSuccessResponse(result, requestId);
  } catch (error) {
    console.error(`[${requestId}] Error:`, error);
    
    // Determine status code and error code
    const statusCode = determineStatusCode(error);
    const errorCode = determineErrorCode(error);
    
    // Return error response
    return createErrorResponse(
      error.message || "An unexpected error occurred",
      statusCode,
      errorCode,
      getErrorDetails(error),
      requestId
    );
  }
});
```

### Input Validation

Always validate input before processing:

```typescript
function validateInput(data) {
  if (!data.requiredField) {
    throw new Error("Missing required field");
  }
  
  if (typeof data.numericField !== 'number' || data.numericField < 0) {
    throw new Error("Invalid numeric field");
  }
  
  return data; // Return validated data
}
```

### Error Helper Functions

Implement helpers for consistent error handling:

```typescript
function determineStatusCode(error) {
  if (error.name === 'ValidationError') return 400;
  if (error.name === 'AuthError') return 401;
  if (error.name === 'ForbiddenError') return 403;
  if (error.name === 'NotFoundError') return 404;
  if (error.name === 'RateLimitError') return 429;
  if (error.name === 'DependencyError') return 502;
  return 500; // Default to server error
}

function determineErrorCode(error) {
  if (error.name === 'ValidationError') return 'VALIDATION_ERROR';
  if (error.name === 'AuthError') return 'UNAUTHORIZED';
  if (error.name === 'ForbiddenError') return 'FORBIDDEN';
  if (error.name === 'NotFoundError') return 'NOT_FOUND';
  if (error.name === 'RateLimitError') return 'RATE_LIMITED';
  if (error.name === 'DependencyError') return 'DEPENDENCY_ERROR';
  return 'INTERNAL_ERROR'; // Default error code
}

function getErrorDetails(error) {
  // Only include details in development or for specific error types
  if (Deno.env.get('ENVIRONMENT') === 'development' || 
      error.name === 'ValidationError') {
    return error.details || undefined;
  }
  return undefined;
}
```

## 4. Client-Side Implementation

### Using useEdgeFunction Hook

The simplest way to handle edge function errors:

```tsx
const { 
  execute, 
  data, 
  error, 
  isLoading,
  retry 
} = useEdgeFunction(
  (params) => supabase.functions.invoke('function-name', { body: params }),
  {
    showToast: true,
    errorMessage: 'Custom error message',
    retryOnError: true
  }
);

// Call the function
await execute({ param1: 'value' });

// In your component
return (
  <EdgeFunctionHandler
    isLoading={isLoading}
    error={error}
    onRetry={retry}
  >
    <YourSuccessComponent data={data} />
  </EdgeFunctionHandler>
);
```

### Using useEdgeFunctionOperation Hook

For more advanced operations:

```tsx
const { 
  execute, 
  retry,
  data, 
  error, 
  isLoading,
  retryCount,
  isRetrying
} = useEdgeFunctionOperation({
  functionName: 'your-function',
  showLoadingToast: true,
  showSuccessToast: true,
  successMessage: 'Operation completed successfully',
  maxRetries: 3
});

// Call the function
const result = await execute({ param1: 'value' });

// In your component
return (
  <EdgeFunctionHandler
    isLoading={isLoading}
    error={error}
    onRetry={retry}
    retryCount={retryCount}
    maxRetries={3}
    isRetrying={isRetrying}
  >
    <YourSuccessComponent data={data} />
  </EdgeFunctionHandler>
);
```

### Using processEdgeResponse Directly

For manual error handling:

```tsx
import { processEdgeResponse, handleEdgeError } from '@/lib/errors/clientErrorHandler';

async function callFunction() {
  try {
    const response = await supabase.functions.invoke('function-name', { 
      body: { /* params */ } 
    });
    
    const data = await processEdgeResponse(response);
    // Handle success
    return data;
  } catch (error) {
    handleEdgeError(error, { 
      showToast: true,
      fallbackMessage: 'Custom error message',
      retryHandler: () => callFunction()
    });
    return null;
  }
}
```

## 5. Testing Edge Function Errors

### Simulating Errors

Use our demo-error-handling function to test client-side error handling:

```tsx
// Call with different error types
const response = await supabase.functions.invoke('demo-error-handling', {
  body: { 
    errorType: 'badRequest', // or 'unauthorized', 'forbidden', 'notFound', etc.
    simulateDelay: 1000 // optional delay in ms
  }
});
```

### Testing Client Response

Write tests for client-side error handling:

```tsx
// In your test file
it('should handle edge function errors correctly', async () => {
  // Mock the function to return an error
  supabase.functions.invoke.mockResolvedValue({
    error: {
      message: 'Test error',
      status: 400
    }
  });
  
  // Test your component
  render(<YourComponent />);
  
  // Verify error state is displayed
  expect(await screen.findByText('Error message')).toBeInTheDocument();
  
  // Test retry functionality
  const retryButton = screen.getByText('Try Again');
  fireEvent.click(retryButton);
  
  // Verify retry was attempted
  expect(supabase.functions.invoke).toHaveBeenCalledTimes(2);
});
```

## 6. Best Practices

1. **Always include request IDs** - These are crucial for tracing errors in logs
2. **Provide appropriate error messages** - User-facing vs. developer-facing
3. **Use consistent error codes** - Stick to the standard set of codes
4. **Implement proper validation** - Validate all inputs before processing
5. **Secure error details** - Don't leak sensitive information in error responses
6. **Log all errors server-side** - Ensure comprehensive error tracking
7. **Use proper status codes** - Match HTTP status codes to error types
8. **Handle CORS properly** - Always add CORS headers for browser requests
9. **Implement retry mechanisms** - For transient errors only
10. **Provide recovery paths** - Give users clear next steps when errors occur

## 7. Common Error Patterns

### Authentication Errors

```typescript
// Server-side
if (!user) {
  return createErrorResponse(
    'Authentication required',
    401,
    'UNAUTHORIZED',
    undefined,
    requestId
  );
}

// Client-side
if (error && error.status === 401) {
  // Redirect to login
  navigate('/login');
}
```

### Resource Not Found

```typescript
// Server-side
const item = await getItem(id);
if (!item) {
  return createErrorResponse(
    'Item not found',
    404,
    'NOT_FOUND',
    { itemId: id },
    requestId
  );
}

// Client-side
if (error && error.status === 404) {
  return <NotFoundState message="The requested item could not be found" />;
}
```

### Validation Errors

```typescript
// Server-side
const errors = validateInput(data);
if (errors.length > 0) {
  return createErrorResponse(
    'Validation failed',
    400,
    'VALIDATION_ERROR',
    { fields: errors },
    requestId
  );
}

// Client-side
if (error && error.code === 'VALIDATION_ERROR') {
  return <ValidationErrorList errors={error.details.fields} />;
}
```

### Rate Limiting

```typescript
// Server-side
if (isRateLimited(userId)) {
  return createErrorResponse(
    'Too many requests, please try again later',
    429,
    'RATE_LIMITED',
    { retryAfter: 60 },
    requestId
  );
}

// Client-side
if (error && error.status === 429) {
  const retryAfter = error.details?.retryAfter || 60;
  return <RateLimitedState secondsRemaining={retryAfter} />;
}
```
