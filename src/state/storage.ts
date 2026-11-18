export interface SaveData {
  unlockedLevel: number;
  deathsByLevel: Record<number, number>;
  totalDeaths: number;
  bestTimeByLevel: Record<number, number>;
  muted: boolean;
}

const STORAGE_KEY = 'stack_panic_save_v1';

const DEFAULT_SAVE: SaveData = {
  unlockedLevel: 1,
  deathsByLevel: {},
  totalDeaths: 0,
  bestTimeByLevel: {},
  muted: false,
};

let memoryFallback: SaveData = structuredClone(DEFAULT_SAVE);

export function loadSave(): SaveData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(memoryFallback);
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    const merged: SaveData = {
      unlockedLevel: Math.max(1, Math.min(15, Number(parsed.unlockedLevel ?? 1))),
      deathsByLevel: parsed.deathsByLevel && typeof parsed.deathsByLevel === 'object' ? { ...parsed.deathsByLevel } : {},
      totalDeaths: Number(parsed.totalDeaths ?? 0),
      bestTimeByLevel: parsed.bestTimeByLevel && typeof parsed.bestTimeByLevel === 'object' ? { ...parsed.bestTimeByLevel } : {},
      muted: Boolean(parsed.muted ?? false),
    };
    memoryFallback = merged;
    return structuredClone(merged);
  } catch {
    return structuredClone(memoryFallback);
  }
}

export function persistSave(data: SaveData): void {
  memoryFallback = structuredClone(data);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota / private mode errors; in-memory fallback stays active.
  }
}
