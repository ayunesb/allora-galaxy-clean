
# Allora OS Error Handling Architecture Guide

This document provides a comprehensive guide to the error handling system in Allora OS.

## 1. Core Principles

- **User-First**: All error messages prioritize user understanding and action
- **Consistency**: Standardized approach across the application
- **Traceability**: Error tracking with unique identifiers
- **Recovery**: Errors should provide clear recovery paths where possible
- **Informative**: Error information should be appropriate for the audience

## 2. Error Handling Components

### UI Components
- **ErrorState**: Top-level error display for major UI sections
- **InlineError**: Inline error component for form fields and small UI areas
- **CardErrorState**: Card-based error component for contained sections
- **PartialErrorState**: For when only part of the UI fails
- **EmptyState**: For when no data is available
- **FormErrorSummary**: Aggregated form validation errors

### Data Components
- **DataStateHandler**: Handles loading, error, empty states for data-driven UI
- **PartialDataStateHandler**: Handles partial data loading with section-specific errors
- **AsyncDataRenderer**: Component to handle loading, error, and empty states consistently
- **RetryFeedback**: Shows feedback during automatic retries

### Error Boundaries
- **ErrorBoundary**: Base React error boundary
- **PageErrorBoundary**: Page-level error handling
- **RetryableErrorBoundary**: Error boundary with retry functionality

## 3. Error Types & Classification

### Base Types
- **AlloraError**: Base error type
- **NetworkError**: Network connectivity issues
- **ApiError**: API-related errors
- **DatabaseError**: Database operation errors
- **AuthError**: Authentication & authorization errors
- **PermissionError**: Access permission issues
- **ValidationError**: Input validation errors
- **NotFoundError**: Resource not found errors

### Severity Levels
- **Low**: Non-critical, does not affect core functionality
- **Medium**: Affects some functionality, but app is still usable
- **High**: Major functionality is impacted
- **Critical**: Application cannot function

## 4. Error Handling Flows

### Client-Side Flow
1. Error occurs in component or data fetching
2. Error is caught by nearest error boundary
3. Error is logged to system logs
4. User is shown appropriate error UI
5. Recovery options are presented

### Edge Function Flow
1. Request is validated
2. Operation is attempted with error handling
3. Standardized error response is generated
4. Client processes error response
5. User is shown appropriate notification

## 5. Retry Mechanisms

### Circuit Breaker Pattern
- **Closed**: Normal operation
- **Open**: Too many failures, requests immediately fail
- **Half-Open**: Testing if system has recovered

### Retry Strategies
- **Exponential Backoff**: Increasing delay between retries
- **Jitter**: Random variation in retry timing
- **Max Attempts**: Limited number of retry attempts

### When to Use Retry Mechanisms
- **Transient Network Issues**: Temporary connectivity problems
- **Rate Limiting**: When hitting API rate limits
- **Temporary Service Unavailability**: Brief downtime of external services
- **Resource Contention**: Database locks or high load situations

### When NOT to Use Retry Mechanisms
- **Authentication Failures**: Invalid credentials won't fix themselves
- **Authorization Issues**: Permission problems require user action
- **Validation Errors**: Input validation failures need correction
- **Not Found Resources**: Missing resources won't appear with retries
- **Server-Side Errors**: 500-level errors may need developer intervention

## 6. Logging & Monitoring

### System Logs
- All errors are logged to the system_logs table
- Errors include context data for debugging
- Request IDs connect related logs

### Error Monitoring Dashboard
- Visualizes error trends
- Groups similar errors
- Prioritizes errors by impact
- Sends alerts for critical issues

## 7. Implementation Examples

### Form Validation
```tsx
// Form with error handling
const form = useForm({
  resolver: zodResolver(schema)
});

// Display field errors
{errors.email && (
  <InlineError message={errors.email.message} />
)}

// Display summary
{Object.keys(errors).length > 0 && (
  <FormErrorSummary errors={errors} />
)}
```

### Data Fetching with React Query
```tsx
// Using DataStateHandler
<DataStateHandler
  isLoading={isLoading}
  isError={isError}
  error={error}
  data={data}
  onRetry={refetch}
>
  {(data) => (
    <YourComponent data={data} />
  )}
</DataStateHandler>
```

### Edge Function Error Handling
```tsx
// Server-side
try {
  // Operation
  return createSuccessResponse(result);
} catch (error) {
  return createErrorResponse(
    'Operation failed',
    error.details,
    500,
    'OPERATION_ERROR',
    requestId
  );
}

// Client-side
const { execute, isLoading, error } = useEdgeFunction(fetchData, {
  showToast: true,
  retryOnError: true
});
```

### Async Operations with useAsyncOperation
```tsx
const { 
  execute, 
  retry,
  isLoading, 
  isError, 
  error, 
  data 
} = useAsyncOperation({
  onSuccess: (result) => console.log('Operation succeeded:', result),
  onError: (error) => console.error('Operation failed:', error),
  showSuccessToast: true,
  maxRetries: 3
});

// Later in your code
try {
  const result = await execute(yourAsyncFunction, params);
  // Handle success
} catch (error) {
  // Handle error (though useAsyncOperation already handles it)
}
```

### Edge Function Operations
```tsx
const { 
  execute,
  retry, 
  isLoading, 
  error,
  retryCount,
  isRetrying
} = useEdgeFunctionOperation({
  functionName: 'your-function',
  showLoadingToast: true,
  successMessage: 'Operation completed successfully',
  maxRetries: 3
});

// In your UI
<EdgeFunctionHandler
  isLoading={isLoading}
  error={error}
  onRetry={retry}
  retryCount={retryCount}
  isRetrying={isRetrying}
  showDetails={isDevelopment}
>
  <SuccessUI />
</EdgeFunctionHandler>
```

## 8. Adding New Error States

### Step 1: Identify the Error Type
Determine which error type best fits your situation from the AlloraError hierarchy:
```tsx
// For authentication issues
throw new AuthError({
  message: 'Failed to authenticate user',
  userMessage: 'Your session has expired. Please sign in again.',
  severity: 'high',
});

// For API issues
throw new ApiError({
  message: 'API request to external service failed',
  status: 503,
  userMessage: 'Service temporarily unavailable',
  context: { service: 'payment-gateway', requestId: 'req_123' },
});
```

### Step 2: Choose the Appropriate UI Component
Select the right component based on where and how the error should be displayed:

```tsx
// For page-level errors
<ErrorState
  title="Payment Processing Failed"
  message="We couldn't process your payment at this time."
  error={error}
  retry={handleRetry}
  showDetails={isDevelopment}
/>

// For card-based UI sections
<CardErrorState
  title="Analytics Unavailable"
  message="We're having trouble loading your analytics data."
  onRetry={refetchAnalytics}
/>

// For inline errors in forms
<InlineError message="Please enter a valid email address" />
```

### Step 3: Implement Error Logging
Ensure errors are properly logged for debugging:

```tsx
// Log error to system logs
await logSystemEvent(
  'payments',
  'error',
  {
    description: `Payment processing failed: ${error.message}`,
    payment_id: paymentId,
    error_code: error.code,
    user_id: userId
  },
  tenantId
);
```

### Step 4: Add Recovery Paths
Provide users with clear actions to recover:

```tsx
// In error state component
<Button onClick={handleRetry}>Try Again</Button>
<Button variant="outline" onClick={handleAlternatePayment}>
  Use Different Payment Method
</Button>
```

## 9. Best Practices

### General Guidelines
1. Always use typed error objects extending `AlloraError`
2. Include sufficient context for debugging
3. Use user-friendly messages that explain what happened
4. Provide clear next steps for users
5. Log all errors to the system logs

### Edge Function Error Handling
1. Use consistent response format across all functions
2. Include request IDs in all responses for traceability
3. Return appropriate HTTP status codes
4. Handle CORS properly for browser requests
5. Implement proper validation before processing

### Error Boundaries
1. Place boundaries strategically to contain failures
2. Consider the scope of what each boundary protects
3. Use fallback UIs that match the surrounding design
4. Log all boundary-caught errors to system logs
5. Implement reset mechanisms where appropriate

### Data Fetching
1. Use DataStateHandler for consistent loading/error states
2. Implement retry mechanisms for transient failures
3. Show appropriate empty states when no data is available
4. Cache successful responses to reduce failure impact
5. Use the circuit breaker pattern for failing dependencies

## 10. Frequently Asked Questions

### How do I decide between showing a toast vs. inline error?
Use toasts for:
- Asynchronous operations that happen in the background
- Non-blocking errors that don't prevent the user from continuing
- Confirmations of actions

Use inline errors for:
- Form validation issues
- Immediate feedback on user input
- Context-specific errors that relate to a particular UI element

### When should I use retry mechanisms?
Implement retries when:
- The error is likely transient (network connectivity)
- The operation is idempotent (can be safely repeated)
- The user initiated the action and is waiting for a result

Avoid retries when:
- The error is permanent (validation errors, auth failures)
- Repeated attempts could cause data corruption
- The user has navigated away from the relevant context

### How do I handle partial failures?
For operations that involve multiple steps:
1. Use the PartialDataStateHandler component
2. Show which parts succeeded and which failed
3. Allow retrying only the failed portions
4. Preserve successful data to avoid duplicate operations
5. Provide clear visual distinction between succeeded and failed sections

### How can I test error handling?
1. Write tests that deliberately trigger errors
2. Mock external dependencies to return error responses
3. Test boundary behavior by throwing errors in components
4. Verify error logging calls
5. Test retry mechanisms with mock timers
