declare module '@koa/cors' {
  import { Context, Next } from 'koa';
  
  interface Options {
    origin?: string | ((ctx: Context) => string) | ((ctx: Context) => string[]) | ((ctx: Context) => Promise<string>) | ((ctx: Context) => Promise<string[]>);
    allowMethods?: string | string[];
    allowHeaders?: string | string[];
    exposeHeaders?: string | string[];
    credentials?: boolean;
    keepHeadersOnError?: boolean;
    maxAge?: number;
  }
  
  function cors(options?: Options): (ctx: Context, next: Next) => Promise<void>;
  export = cors;
}
