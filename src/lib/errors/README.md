
# Allora OS Error Handling System

This directory contains the centralized error handling system for Allora OS.

## Overview

The error handling system provides consistent error handling across the application, including:

- Standardized error types
- Error logging & tracking
- User-friendly error messaging
- Error boundary components
- Edge function error handling

## Key Components

### Error Types

- `AlloraError`: Base error class with extended properties
- Specialized error types: `ApiError`, `AuthError`, `DatabaseError`, etc.
- See `errorTypes.ts` for the full list of error types and their properties

### Error Handlers

- `ErrorHandler`: Central error handling class
- `SupabaseErrorHandler`: Specialized for Supabase errors
- `EdgeFunctionErrorHandler`: Specialized for Edge Function errors

### Components

- `ErrorBoundary`: React error boundary for catching errors in component trees
- `RetryableErrorBoundary`: Error boundary with retry functionality
- `EdgeFunctionError`: Component for displaying edge function errors
- `ErrorState`: Generic error state component

## Usage Examples

### Basic Error Handling

```typescript
import { handleError } from '@/lib/errors';

try {
  // Risky operation
} catch (error) {
  // This will log the error, show an appropriate notification, and return a standardized error
  const alloraError = await handleError(error, { 
    showNotification: true,
    logToSystem: true
  });
}
```

### Specialized Error Handling

```typescript
import { handleSupabaseError } from '@/lib/errors';

try {
  // Supabase operation
} catch (error) {
  // This will handle Supabase-specific error patterns
  const alloraError = handleSupabaseError(error);
}
```

### Using Error Boundaries

```tsx
import { ErrorBoundary } from '@/lib/errors';

function MyComponent() {
  return (
    <ErrorBoundary>
      {/* Components that might throw errors */}
    </ErrorBoundary>
  );
}
```

### Edge Function Error Handling

```tsx
import { EdgeFunctionError } from '@/lib/errors';

function MyComponent({ error }) {
  if (error) {
    return <EdgeFunctionError error={error} retry={handleRetry} />;
  }
  
  return <div>Success!</div>;
}
```

## Best Practices

1. Always use the appropriate error handler for the context
2. Include meaningful context data when handling errors
3. Use error boundaries for UI components
4. Provide retry functionality when appropriate
5. Always include proper user-friendly messages

## Testing

Error handlers and components have comprehensive test coverage. See the test files in `__tests__/errors` for examples.
