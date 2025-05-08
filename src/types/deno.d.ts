
/**
 * Type definitions for Deno API
 * This helps with TypeScript errors when using Deno in edge functions
 */

declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    toObject(): Record<string, string>;
  }

  export const env: Env;

  export interface ConnInfo {
    localAddr: Addr;
    remoteAddr: Addr;
  }

  export interface Addr {
    transport: 'tcp' | 'udp';
    hostname: string;
    port: number;
  }

  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
  export function serveHttp(conn: any): Promise<any>;

  export function upgradeWebSocket(req: Request, options?: any): { socket: WebSocket, response: Response };
}

declare module 'https://deno.land/std@0.168.0/http/server.ts' {
  export { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
}

declare module 'https://esm.sh/@supabase/supabase-js@2' {
  export * from '@supabase/supabase-js';
}

declare module 'https://esm.sh/stripe@12.0.0?target=deno' {
  import Stripe from 'stripe';
  export default Stripe;
}
