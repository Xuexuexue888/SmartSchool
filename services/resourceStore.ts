// services/resourceStore.ts
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

// ===== 收藏 =====
export function getBookmarks(): string[] {
  return loadJSON<string[]>(KEY_BOOKMARKS, []);
}

export function toggleBookmark(id: string): string[] {
  const set = new Set(getBookmarks());
  if (set.has(id)) set.delete(id);
  else set.add(id);
  const arr = Array.from(set);
  saveJSON(KEY_BOOKMARKS, arr);
  return arr;
}

// ===== 最近浏览 =====
export function getRecents(): RecentItem[] {
  return loadJSON<RecentItem[]>(KEY_RECENTS, []);
}

export function addRecent(id: string): RecentItem[] {
  const now = Date.now();
  const list = getRecents().filter((x) => x.id !== id);
  list.unshift({ id, ts: now });
  const trimmed = list.slice(0, 30);
  saveJSON(KEY_RECENTS, trimmed);
  return trimmed;
}
