
// Helper function to safely get environment variables
export function getEnv(name: string, fallback: string = ""): string {
  try {
    // Try to get from Deno.env first
    if (typeof Deno !== 'undefined' && Deno.env && Deno.env.get) {
      const value = Deno.env.get(name);
      if (value !== undefined) return value;
    }
    
    // Try to get from process.env as fallback (for local dev)
    if (typeof process !== 'undefined' && process.env && process.env[name]) {
      return process.env[name] as string;
    }
    
    return fallback;
  } catch (err) {
    console.error(`Error accessing env variable ${name}:`, err);
    return fallback;
  }
}

export default {
  getEnv
};
