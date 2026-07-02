// 本地店铺端鉴权 store（store-token 模式，非 cookie）
// 使用 useSyncExternalStore 实现轻量响应式，避免引入额外依赖
import { useSyncExternalStore } from 'react';

const TOKEN_KEY = 'msp_store_token';

export interface StoreAuthState {
  token: string | null;
  storeId: string | null;
}

// 从 token 解析 storeId，格式：msp_<storeId>_<rand>
export function parseStoreId(token: string | null): string | null {
  if (!token) return null;
  const m = token.match(/^msp_(.+)_[^_]+$/);
  return m ? m[1] : null;
}

function readFromStorage(): StoreAuthState {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
  return { token, storeId: parseStoreId(token) };
}

let state: StoreAuthState = readFromStorage();
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((l) => l());
}

function setToken(token: string): void {
  if (typeof localStorage !== 'undefined') localStorage.setItem(TOKEN_KEY, token);
  state = { token, storeId: parseStoreId(token) };
  emit();
}

function clear(): void {
  if (typeof localStorage !== 'undefined') localStorage.removeItem(TOKEN_KEY);
  state = { token: null, storeId: null };
  emit();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): StoreAuthState {
  return state;
}

export interface UseStoreAuth extends StoreAuthState {
  setToken: (token: string) => void;
  clear: () => void;
}

// 店铺端鉴权 hook
export function useStoreAuth(): UseStoreAuth {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { ...snapshot, setToken, clear };
}
