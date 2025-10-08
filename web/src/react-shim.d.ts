// Temporary shims to allow TypeScript to compile without installed React types
// Remove this file when node_modules are properly installed.

/// <reference types="vite/client" />

declare namespace ReactShim {
  type SetStateAction<S> = S | ((prevState: S) => S);
  type Dispatch<A> = (value: A) => void;
}

declare module 'react' {
  const React: any;
  export default React;
  export function useState<T>(initialState: T | (() => T)): [T, ReactShim.Dispatch<ReactShim.SetStateAction<T>>];
  export function useEffect(effect: (...args: any[]) => any, deps?: any[]): void;
  export function useMemo<T>(factory: () => T, deps: any[]): T;
  export function useCallback<T extends (...args: any[]) => any>(cb: T, deps: any[]): T;
  export function useRef<T = any>(initial?: T): { current: T };
  export const Fragment: any;
  export namespace React {
    export type SyntheticEvent<T = Element> = any;
  }
}

declare module 'react-dom/client' {
  export const createRoot: any;
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
  interface IntrinsicAttributes {
    key?: any;
  }
}
