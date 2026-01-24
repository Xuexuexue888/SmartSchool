// services/resourceStore.ts
import { useSyncExternalStore } from "react";

export type RecentItem = { id: string; ts: number };

const KEY_BOOKMARKS = "smartschool_bookmarks_v1";
const KEY_RECENTS = "smartschool_recents_v1";

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function loadJSON<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key: string, value: any) {
  if (!canUseStorage()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

/** ========= 订阅机制：让 React 知道数据变了 ========= */
type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

export function subscribe(listener: Listener) {
  listeners.add(listener);

  // 跨标签页同步：别的 tab 改了，本 tab 也更新
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY_BOOKMARKS || e.key === KEY_RECENTS) notify();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/** ========= 收藏 ========= */
export function getBookmarks(): string[] {
  return loadJSON<string[]>(KEY_BOOKMARKS, []);
}

export function isBookmarked(id: string): boolean {
  return getBookmarks().includes(id);
}

export function toggleBookmark(id: string): string[] {
  const set = new Set(getBookmarks());
  if (set.has(id)) set.delete(id);
  else set.add(id);
  const arr = Array.from(set);
  saveJSON(KEY_BOOKMARKS, arr);
  notify(); // ✅ 通知页面刷新
  return arr;
}

/** ========= 最近 ========= */
export function getRecents(): RecentItem[] {
  return loadJSON<RecentItem[]>(KEY_RECENTS, []);
}

export function addRecent(id: string): RecentItem[] {
  const now = Date.now();
  const list = getRecents().filter((x) => x.id !== id);
  list.unshift({ id, ts: now });
  const trimmed = list.slice(0, 30);
  saveJSON(KEY_RECENTS, trimmed);
  notify(); // ✅ 通知页面刷新
  return trimmed;
}

/** ========= 给 React 用的 hook（最省事） ========= */
function getSnapshot() {
  return { bookmarks: getBookmarks(), recents: getRecents() };
}
function getServerSnapshot() {
  return { bookmarks: [], recents: [] as RecentItem[] };
}

export function useResourceStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
