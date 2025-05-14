
/**
 * @file Plugin Development Guide
 * Comprehensive documentation for plugin development in Allora OS
 */

import { CodeExample } from "@/types/documentation";

/**
 * Plugin Development Overview
 * This documentation provides guidelines and examples for developing plugins for Allora OS
 */
export const pluginDevelopmentGuide = {
  /**
   * Introduction to the plugin system
   */
  introduction: `
    # Plugin Development Guide
    
    Plugins are modular extensions that add functionality to the Allora OS platform.
    They can integrate external services, implement business logic, or provide analytics.
    This guide walks through the process of creating custom plugins.
  `,

  /**
   * Plugin architecture overview
   */
  architecture: `
    ## Plugin Architecture
    
    Plugins in Allora OS follow a modular architecture consisting of:
    
    1. **Metadata** - Information about the plugin (name, version, description)
    2. **Execute Function** - Core functionality that runs when the plugin is executed
    3. **Configuration** - Parameters that can be adjusted by users
    4. **Schema** - Defines the expected inputs and outputs
    
    Plugins can be versioned, allowing for continuous improvement while maintaining compatibility.
  `,

  /**
   * Step-by-step guide to creating a plugin
   */
  gettingStarted: `
    ## Creating Your First Plugin
    
    To create a plugin:
    
    1. Define your plugin using the Plugin interface
    2. Implement the execute() function
    3. Register your plugin in the plugin registry
    4. Test your plugin execution
  `,

  /**
   * Code examples for plugin development
   */
  codeExamples: [
    {
      title: "Basic Plugin Template",
      description: "Starting point for creating a new plugin",
      language: "typescript",
      code: `
import { Plugin, PluginResult } from '@/types/plugin';

const myPlugin: Plugin = {
  id: 'my-unique-plugin-id',
  name: 'My Plugin',
  version: '1.0.0',
  description: 'A simple plugin that does something useful',
  
  // Main execution function
  execute: async (input: any, context: any): Promise<PluginResult> => {
    try {
      // Your plugin logic here
      const result = { message: 'Plugin executed successfully!' };
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};

export default myPlugin;
      `
    },
    {
      title: "Plugin with External API Integration",
      description: "Example of a plugin that integrates with an external API",
      language: "typescript",
      code: `
import { Plugin, PluginResult } from '@/types/plugin';

const weatherPlugin: Plugin = {
  id: 'weather-data-plugin',
  name: 'Weather Data Plugin',
  version: '1.0.0',
  description: 'Retrieves weather data for a specified location',
  
  execute: async (input: { location: string }, context: any): Promise<PluginResult> => {
    try {
      // Validate input
      if (!input.location) {
        throw new Error('Location is required');
      }
      
      // Call external API (example)
      const response = await fetch(
        \`https://api.weatherapi.com/v1/current.json?key=\${context.apiKeys.weather}&q=\${input.location}\`
      );
      
      if (!response.ok) {
        throw new Error(\`API returned \${response.status}: \${response.statusText}\`);
      }
      
      const weatherData = await response.json();
      
      return {
        success: true,
        data: {
          temperature: weatherData.current.temp_c,
          condition: weatherData.current.condition.text,
          humidity: weatherData.current.humidity,
          location: weatherData.location.name
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch weather data'
      };
    }
  }
};

export default weatherPlugin;
      `
    }
  ] as CodeExample[],

  /**
   * Testing guidelines for plugins
   */
  testing: `
    ## Testing Your Plugin
    
    Proper testing is essential for plugin reliability:
    
    1. **Unit Tests** - Test the plugin's core functionality in isolation
    2. **Integration Tests** - Test the plugin's interaction with external systems
    3. **Mock Services** - Use mock services for external API dependencies
    4. **Error Handling Tests** - Verify the plugin handles errors gracefully
    
    Use the built-in testing utility functions from \`@/lib/plugins/testing\` to simplify your tests.
  `,

  /**
   * Best practices for plugin development
   */
  bestPractices: `
    ## Best Practices
    
    When developing plugins:
    
    - **Validate all inputs** to prevent unexpected behavior
    - **Handle errors gracefully** and provide meaningful error messages
    - **Implement proper logging** for debugging and monitoring
    - **Version your plugins** appropriately when making changes
    - **Document your plugin** thoroughly, including expected inputs and outputs
    - **Keep plugins focused** on a single responsibility
    - **Cache results** when appropriate to improve performance
  `,

  /**
   * Versioning and evolution guidance
   */
  versioning: `
    ## Plugin Versioning and Evolution
    
    Plugins evolve over time and proper versioning is crucial:
    
    - Use semantic versioning (MAJOR.MINOR.PATCH)
    - Major version changes indicate breaking changes
    - Minor version changes add functionality in a backward-compatible manner
    - Patch version changes represent backward-compatible bug fixes
    
    When creating a new plugin version:
    1. Increment the version number appropriately
    2. Document changes in the version history
    3. Keep backward compatibility when possible
    4. Use the evolution system to track performance improvements
  `
};
