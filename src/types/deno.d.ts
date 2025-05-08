
/**
 * TypeScript definitions for Deno APIs
 * Used in edge functions
 */

declare namespace Deno {
  export interface ConnInfo {
    readonly localAddr: Addr;
    readonly remoteAddr: Addr;
  }

  export interface Addr {
    transport: "tcp" | "udp";
    hostname: string;
    port: number;
  }

  export interface ServeOptions {
    port?: number;
    hostname?: string;
  }

  export interface ServeInit extends ServeOptions {
    onListen?: (params: { hostname: string; port: number }) => void;
  }

  export interface RequestEvent {
    request: Request;
    respondWith(response: Response | Promise<Response>): Promise<void>;
  }

  export function serve(
    handler: (request: Request, connInfo: ConnInfo) => Response | Promise<Response>,
    options?: ServeInit,
  ): void;

  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): boolean;
    has(key: string): boolean;
    toObject(): { [key: string]: string };
  }

  export const env: Env;

  export function exit(code?: number): never;
}
