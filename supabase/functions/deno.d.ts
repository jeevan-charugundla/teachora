// Ambient declarations for Deno runtime and Supabase Edge Functions in IDE
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    toObject(): Record<string, string>;
  }

  export const env: Env;

  export interface ServeOptions {
    port?: number;
    hostname?: string;
    signal?: AbortSignal;
    onError?: (error: unknown) => Response | Promise<Response>;
    onListen?: (params: { hostname: string; port: number }) => void;
  }

  export function serve(
    handler: (req: Request) => Response | Promise<Response>,
    options?: ServeOptions
  ): void;
}

declare module "jsr:@supabase/supabase-js@2" {
  export * from "@supabase/supabase-js";
}

declare module "jsr:@supabase/functions-js/edge-runtime.d.ts" {}
