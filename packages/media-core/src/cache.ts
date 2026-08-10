interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Tiny in-memory cache with TTL, plus in-flight request de-dupe so two
 * simultaneous callers for the same key share one network request.
 */
export class RequestCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private inFlight = new Map<string, Promise<unknown>>();

  constructor(private readonly ttlMs: number) {}

  private isFresh(entry: CacheEntry<unknown> | undefined): entry is CacheEntry<unknown> {
    return !!entry && entry.expiresAt > Date.now();
  }

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    return this.isFresh(entry) ? (entry.value as T) : undefined;
  }

  set<T>(key: string, value: T): void {
    if (this.ttlMs <= 0) return;
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  /** Runs `fn` unless a fresh cached value or an identical in-flight request exists. */
  async dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) return cached;

    const existing = this.inFlight.get(key) as Promise<T> | undefined;
    if (existing) return existing;

    const promise = fn()
      .then((result) => {
        this.set(key, result);
        return result;
      })
      .finally(() => {
        this.inFlight.delete(key);
      });

    this.inFlight.set(key, promise);
    return promise;
  }

  clear(): void {
    this.store.clear();
  }
}
