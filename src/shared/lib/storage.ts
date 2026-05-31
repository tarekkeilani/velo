/**
 * Storage abstraction. Features depend on the `Storage` interface, never on a
 * concrete engine — so swapping the in-memory default for AsyncStorage or MMKV
 * later is a one-line change in the composition root, with zero feature edits.
 */

export type Storage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

/**
 * Default volatile implementation so the app (and tests) run with no native
 * dependency. Replace in `app/providers` with a persistent engine for release.
 */
export function createInMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: async key => store.get(key) ?? null,
    setItem: async (key, value) => {
      store.set(key, value);
    },
    removeItem: async key => {
      store.delete(key);
    },
  };
}
