
// Type definitions for virtual:pwa-register module
declare module 'virtual:pwa-register' {
  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: any) => void;
    onUpdate?: (registration: () => Promise<boolean>) => void;
  }

  export function registerSW(options?: RegisterSWOptions): Promise<(() => Promise<boolean>)>;
}
