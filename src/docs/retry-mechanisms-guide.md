
# Retry Mechanisms Guide

This guide explains retry mechanisms used in Allora OS, including when and how to implement them.

## 1. Introduction to Retry Mechanisms

Retry mechanisms help handle transient failures by automatically repeating failed operations after a delay. In distributed systems like Allora OS, they are essential for maintaining reliability and resilience.

## 2. When to Use Retry Mechanisms

### Appropriate Scenarios

Retry mechanisms are appropriate for:

- **Transient Network Issues**: Temporary connectivity problems
- **Rate Limiting**: API rate limits may require waiting before retrying
- **Temporary Service Unavailability**: Short-term downtime of external services
- **Resource Contention**: Database locks or high load situations
- **Edge Function Timeouts**: Temporary processing delays
- **Throttled API Calls**: When external APIs throttle requests

### When NOT to Use Retries

Avoid retry mechanisms for:

- **Authentication Failures**: Invalid credentials won't fix themselves
- **Authorization Errors**: Permission issues require user action
- **Validation Errors**: Input data issues need correction
- **Not Found Resources**: Missing resources won't appear with retries
- **Permanent Server Errors**: Some 500-level errors indicate serious issues
- **Business Logic Errors**: Application-specific failures

## 3. Retry Strategies

### Exponential Backoff

This strategy increases the delay between retry attempts, reducing load on a struggling system.

```typescript
const initialDelay = 1000; // 1 second
const backoffFactor = 2;
const maxRetries = 3;

for (let attempt = 0; attempt < maxRetries; attempt++) {
  try {
    return await operation();
  } catch (error) {
    const delay = initialDelay * Math.pow(backoffFactor, attempt);
    console.log(`Retry ${attempt + 1}/${maxRetries} after ${delay}ms`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

// Final attempt
return await operation();
```

### Jitter

Adding randomness to retry delays prevents "thundering herd" problems when many clients retry simultaneously.

```typescript
function calculateDelayWithJitter(attempt, initialDelay, backoffFactor) {
  const baseDelay = initialDelay * Math.pow(backoffFactor, attempt);
  const jitter = baseDelay * 0.2; // 20% jitter
  return baseDelay + (Math.random() * jitter);
}
```

### Circuit Breaker Pattern

This pattern prevents cascading failures by "tripping" after multiple failures and stopping further attempts temporarily.

```typescript
class CircuitBreaker {
  constructor(options) {
    this.failureThreshold = options.failureThreshold || 3;
    this.resetTimeout = options.resetTimeout || 30000; // 30 seconds
    this.failures = 0;
    this.state = 'CLOSED'; // CLOSED = normal, OPEN = failing
    this.lastFailure = null;
  }

  async execute(operation) {
    if (this.state === 'OPEN') {
      // Check if we should try again
      if (Date.now() - this.lastFailure > this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }
    
    try {
      const result = await operation();
      if (this.state === 'HALF_OPEN') {
        this.reset();
      }
      return result;
    } catch (error) {
      this.handleFailure();
      throw error;
    }
  }

  handleFailure() {
    this.failures++;
    this.lastFailure = Date.now();
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  reset() {
    this.failures = 0;
    this.state = 'CLOSED';
  }
}
```

## 4. Implementation Patterns

### Using withRetry Utility

For direct implementation, use our `withRetry` utility:

```typescript
import { withRetry } from '@/lib/errors/retryUtils';

async function fetchData() {
  return withRetry(
    async () => {
      const response = await fetch('https://api.example.com/data');
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      return response.json();
    },
    {
      maxRetries: 3,
      initialDelay: 1000,
      backoffFactor: 2,
      onRetry: (error, attempt, delay) => {
        console.log(`Retry ${attempt} after ${delay}ms due to: ${error.message}`);
      }
    }
  );
}
```

### Using createRetryableFunction

For functions you want to always have retry behavior:

```typescript
import { createRetryableFunction } from '@/lib/errors/retryUtils';

const fetchDataWithRetry = createRetryableFunction(
  async (userId) => {
    const response = await fetch(`https://api.example.com/users/${userId}`);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return response.json();
  },
  {
    maxRetries: 3,
    initialDelay: 1000,
    backoffFactor: 2
  }
);

// Use it like a regular function
const data = await fetchDataWithRetry('user-123');
```

### Using useEdgeFunctionOperation Hook

For edge function calls with UI feedback:

```tsx
function MyComponent() {
  const { 
    execute, 
    retry, 
    isLoading, 
    error, 
    data,
    retryCount,
    isRetrying
  } = useEdgeFunctionOperation({
    functionName: 'my-function',
    showLoadingToast: true,
    maxRetries: 3
  });
  
  return (
    <div>
      {isRetrying && (
        <RetryFeedback 
          retryCount={retryCount} 
          maxRetries={3} 
          isRetrying={isRetrying} 
        />
      )}
      
      <button onClick={() => execute({ param: 'value' })}>
        Call Function
      </button>
      
      {error && (
        <ErrorState 
          error={error} 
          retry={retry} 
        />
      )}
      
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
```

### Using useAsyncOperation Hook

For general async operations:

```tsx
function DataFetchingComponent() {
  const { 
    execute, 
    retry,
    isLoading, 
    error, 
    data,
    retryCount
  } = useAsyncOperation({
    maxRetries: 3,
    showErrorToast: true
  });
  
  useEffect(() => {
    execute(fetchData);
  }, []);
  
  return (
    <AsyncDataRenderer
      isLoading={isLoading}
      isError={!!error}
      error={error}
      data={data}
      onRetry={retry}
      retryCount={retryCount}
    >
      {(data) => <DataDisplay data={data} />}
    </AsyncDataRenderer>
  );
}
```

## 5. UI Patterns for Retries

### Automatic Retries with Feedback

Show users that the system is automatically retrying:

```tsx
<RetryFeedback
  retryCount={retryCount}
  maxRetries={3}
  isRetrying={isRetrying}
/>
```

### Manual Retry Button

Always provide a manual retry option for user-initiated recovery:

```tsx
<Button
  onClick={retry}
  disabled={isRetrying}
  variant="outline"
>
  {isRetrying ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Retrying...
    </>
  ) : (
    <>
      <RefreshCw className="mr-2 h-4 w-4" />
      Try Again
    </>
  )}
</Button>
```

### Progress Indication

Show progress for long-running retries:

```tsx
<div className="space-y-2">
  <div className="flex justify-between text-xs">
    <span>Retrying ({retryCount}/{maxRetries})</span>
    <span>{Math.round((retryCount / maxRetries) * 100)}%</span>
  </div>
  <Progress value={(retryCount / maxRetries) * 100} />
</div>
```

## 6. Best Practices

1. **Idempotent Operations**: Only retry operations that are idempotent (can be repeated safely)
2. **Avoid Retry Storms**: Use jitter to prevent many clients retrying simultaneously
3. **Limit Maximum Retries**: Always set a reasonable maximum number of retries
4. **Consider Timeouts**: Set appropriate timeouts for operations
5. **Log Retry Attempts**: Record each retry for debugging
6. **Provide User Feedback**: Clearly show retry status in the UI
7. **Honor Retry-After Headers**: If services provide retry guidance, follow it
8. **Implement Backoff**: Increase delay between retries
9. **Use Circuit Breakers**: Prevent overwhelming failing services
10. **Consider User Patience**: Balance thoroughness with user experience

## 7. Common Retry Scenarios

### API Communication

```tsx
const { execute, retry, isLoading, error, data } = useEdgeFunctionOperation({
  functionName: 'external-api-call',
  maxRetries: 3
});

// When users take action
async function handleSubmit() {
  const result = await execute({ 
    endpoint: '/users',
    payload: userData 
  });
  
  if (result) {
    navigate('/success');
  }
}
```

### File Uploads

```tsx
async function uploadFile(file) {
  return withRetry(
    async () => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
      return response.json();
    },
    {
      maxRetries: 5,
      initialDelay: 2000,
      backoffFactor: 1.5,
      onRetry: (_, attempt) => {
        updateProgress(`Upload failed, retrying (${attempt}/5)...`);
      }
    }
  );
}
```

### Background Processing

```tsx
const processQueueWithRetry = createRetryableFunction(
  async (items) => {
    for (const item of items) {
      await processItem(item);
    }
    return { processedCount: items.length };
  },
  {
    maxRetries: 10,
    initialDelay: 5000,
    backoffFactor: 2,
    onRetry: (error, attempt) => {
      logSystemEvent('system', 'warning', {
        description: `Queue processing retry ${attempt}`,
        error: error.message,
        items_remaining: itemQueue.length
      });
    }
  }
);
```

## 8. Testing Retry Mechanisms

### Unit Testing

```typescript
describe('withRetry utility', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should retry failed operations', async () => {
    const operation = vi.fn();
    operation.mockRejectedValueOnce(new Error('Temporary failure'));
    operation.mockRejectedValueOnce(new Error('Temporary failure'));
    operation.mockResolvedValueOnce('success');
    
    const promise = withRetry(operation, { maxRetries: 3, initialDelay: 100 });
    
    // Fast-forward past retries
    await vi.runAllTimersAsync();
    
    const result = await promise;
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
  });
});
```

### Integration Testing

```typescript
test('component should retry API calls', async () => {
  // Mock fetch to fail twice then succeed
  fetch.mockImplementation((url) => {
    if (mockFailCount < 2) {
      mockFailCount++;
      return Promise.reject(new Error('Network error'));
    }
    return Promise.resolve(new Response(JSON.stringify({ success: true })));
  });
  
  render(<DataFetchingComponent />);
  
  // Initially shows loading
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  // Shows retry feedback
  await screen.findByText('Retrying (1/3)...');
  
  // After retries succeed, shows data
  await screen.findByText('Data loaded successfully');
  
  // Verify fetch was called 3 times (initial + 2 retries)
  expect(fetch).toHaveBeenCalledTimes(3);
});
```
