
# Plugin System

This directory contains the plugin system that allows extending application functionality.

## Overview

The plugin system provides a framework for creating, managing, and executing plugins that can add functionality to the application. Plugins are modular units that can:

- Connect to external services and APIs
- Transform and process data
- Add new capabilities to strategies
- Earn XP and contribute to agent evolution

## Key Components

### Plugin Types (`types.ts`)

The core types that define the plugin system:

```typescript
interface Plugin {
  id: string;
  name: string;
  description?: string;
  version: string;
  parameters?: Record<string, any>;
}

interface PluginConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  parameters?: Record<string, any>;
}

interface PluginResult {
  success: boolean;
  output?: any;
  error?: string;
  xp_earned: number;
  execution_time: number;
}

interface PluginExecutionOptions {
  timeout?: number;
  maxRetries?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}
```

### Plugin Execution

The plugin system includes utilities for executing plugins:

- `executePlugin` - Execute a single plugin
- `executePluginChain` - Execute a chain of plugins where outputs can feed into inputs
- `getPluginConfig` - Retrieve plugin configuration
- `validatePluginInput` - Validate plugin input parameters

### Plugin Logging

The system logs plugin execution for monitoring and debugging:

- `recordLogExecution` - Record plugin execution details to the database
- `logPluginError` - Log plugin errors with context
- `logPluginSuccess` - Log successful plugin executions

## Usage Examples

### Executing a Plugin

```typescript
import { executePlugin } from '@/lib/plugins';

// Execute a plugin with parameters
const result = await executePlugin('data-enrichment', {
  input: {
    companyName: 'Acme Corp',
    domain: 'acme.com'
  },
  options: {
    timeout: 30000, // 30 seconds
    maxRetries: 2
  }
});

if (result.success) {
  console.log('Plugin result:', result.output);
  console.log('XP earned:', result.xp_earned);
} else {
  console.error('Plugin error:', result.error);
}
```

### Creating a Plugin Chain

```typescript
import { executePluginChain } from '@/lib/plugins';

// Define a chain of plugins
const chain = [
  {
    pluginId: 'data-fetch',
    parameters: { source: 'api', endpoint: '/users' }
  },
  {
    pluginId: 'data-transform',
    parameters: { format: 'csv' }
  },
  {
    pluginId: 'file-export',
    parameters: { destination: 's3', bucket: 'exports' }
  }
];

// Execute the chain
const result = await executePluginChain(chain);

console.log('Chain success:', result.success);
console.log('Outputs:', result.outputs);
console.log('Total XP earned:', result.totalXpEarned);
```

### Recording Plugin Execution

```typescript
import { recordLogExecution } from '@/lib/plugins/logging';

// Record execution details
await recordLogExecution({
  pluginId: 'email-sender',
  tenantId: 'tenant-123',
  status: 'success',
  input: { recipient: 'user@example.com', subject: 'Welcome!' },
  output: { messageId: '123', status: 'sent' },
  executionTime: 1250, // ms
  xpEarned: 10,
  strategyId: 'strategy-456'
});
```

## Plugin Development

Plugins can be developed using the plugin API:

1. Define plugin metadata in the database
2. Implement the plugin logic
3. Register the plugin with the system
4. Add the plugin to strategies or make it available for agent use

### Plugin Structure

```typescript
// Plugin implementation
async function myPlugin(input, context) {
  // Validate input
  if (!input.requiredParam) {
    throw new Error('Missing required parameter');
  }
  
  // Plugin logic
  const result = await processData(input.requiredParam);
  
  // Return output
  return {
    success: true,
    output: result,
    xp_earned: calculateXp(result)
  };
}

// Plugin registration
registerPlugin({
  id: 'my-plugin',
  name: 'My Custom Plugin',
  description: 'Does something awesome',
  version: '1.0.0',
  implementation: myPlugin,
  schema: {
    input: {
      type: 'object',
      properties: {
        requiredParam: { type: 'string' }
      },
      required: ['requiredParam']
    },
    output: {
      type: 'object',
      properties: {
        result: { type: 'string' }
      }
    }
  }
});
```

## Best Practices

1. Always validate plugin inputs before processing
2. Implement proper error handling within plugins
3. Set reasonable timeouts for external API calls
4. Include retry logic for network operations
5. Log plugin execution for monitoring and debugging
6. Document plugin inputs, outputs, and behavior
7. Use schema validation for input/output validation
8. Consider performance impact in plugin chains
