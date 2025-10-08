// Temporary shims to allow backend TypeScript to compile without installing type packages
// Remove when node_modules are installed in the API service.

declare var process: any;
declare var console: any;

declare module 'openai' {
  const OpenAI: any;
  export default OpenAI;
}

declare module '@koa/router' {
  const Router: any;
  export default Router;
}

declare module 'koa' {
  export type Context = any;
}

declare module 'zod' {
  export const z: any;
}
