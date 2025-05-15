
# Error Handling System

This directory contains the centralized error handling system for the application.

## Overview

The error handling system provides consistent error handling across the application, including:

- Standardized error types and classification
- Error logging and tracking with severity levels
- User-friendly error messaging and notifications
- Error boundary components for React component trees
- Edge function error handling utilities

## Key Components

### Error Types (`errorTypes.ts`)

The foundation of the error system is a set of standardized error classes that extend JavaScript's built-in `Error` class:

```typescript
// Base error class
class AlloraError extends Error {
  code: string;
  status: number;
  context: Record<string, any>;
  userMessage: string;
  source: ErrorSource;
  retry: boolean;
  severity: ErrorSeverity;
  timestamp: string;
  requestId?: string;
  
  // Constructor, toJSON and fromJSON methods...
}

// Specialized error types
class ApiError extends AlloraError { /* ... */ }
class AuthError extends AlloraError { /* ... */ }
class PermissionError extends AlloraError { /* ... */ }
class NotFoundError extends AlloraError { /* ... */ }
// etc.
```

Each error type automatically sets appropriate defaults for HTTP status codes, severity levels, and retry behavior.

### Error Handlers

- `ErrorHandler` (`ErrorHandler.ts`): Central error handling class
- `SupabaseErrorHandler` (`SupabaseErrorHandler.ts`): Specialized for Supabase errors
- `EdgeFunctionErrorHandler` (`EdgeFunctionErrorHandler.ts`): Specialized for Edge Function errors

### React Components

- `ErrorBoundary`: React error boundary for catching errors in component trees
- `RetryableErrorBoundary`: Error boundary with retry functionality
- `ErrorState`: Generic error state display component
- `EdgeFunctionError`: Component for displaying edge function errors

## Usage Examples

### Basic Error Handling

```typescript
import { handleError } from '@/lib/errors';

try {
  // Risky operation
} catch (error) {
  // This will log the error, show appropriate notification, and return a standardized error
  const standardError = await handleError(error, { 
    showNotification: true,
    logToSystem: true
  });
  
  // You can check error properties
  if (standardError.retry) {
    // Show retry UI
  }
}
```

### Specialized Error Handling

```typescript
import { handleSupabaseError } from '@/lib/errors';

try {
  // Supabase operation
} catch (error) {
  // This will handle Supabase-specific error patterns
  const standardError = handleSupabaseError(error);
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

### With Retry Logic

```tsx
import { RetryableErrorBoundary } from '@/lib/errors';

function DataComponent() {
  return (
    <RetryableErrorBoundary>
      <DataFetchingComponent />
    </RetryableErrorBoundary>
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
6. Use the severity property to categorize business impact
7. Include the module property to identify the source system
8. Use the requestId for correlation when applicable
