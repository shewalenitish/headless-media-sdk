import { RequestCache } from './cache.js';
import { MediaEventEmitter } from './emitter.js';
import { normalizePhoto, normalizeVideo } from './normalize.js';
import { PexelsHttpClient } from './pexelsClient.js';
import type {
  ListParams,
  MediaCoreConfig,
  MediaEventListener,
  MediaEventType,
  MediaItem,
  PaginatedResult,
  SearchParams,
} from './types.js';
import { MediaCoreError } from './types.js';

const DEFAULT_CACHE_TTL_MS = 60_000;

function toPaginated(
  items: MediaItem[],
  page: number,
  perPage: number,
  totalResults: number
): PaginatedResult<MediaItem> {
  const hasNextPage = page * perPage < totalResults;
  return {
    items,
    page,
    perPage,
    totalResults,
    hasNextPage,
    nextPage: hasNextPage ? page + 1 : undefined,
  };
}

/**
 * Framework-agnostic Pexels media SDK. Pure TypeScript — safe to use from a
 * CLI, a server, a React app (via media-react) or React Native (via
 * media-native) with zero changes.
 */
export class MediaCore {
  private readonly http: PexelsHttpClient;
  private readonly cache: RequestCache;
  private readonly emitter = new MediaEventEmitter();
  private unsubscribeDefaultLogger?: () => void;

  constructor(config: MediaCoreConfig) {
    this.http = new PexelsHttpClient(config.apiKey, config.baseUrl);
    this.cache = new RequestCache(config.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS);

    if (config.enableDefaultLogging ?? true) {
      this.attachDefaultLogger();
    }
  }

  // -- events ---------------------------------------------------------------

  on<T extends MediaEventType>(type: T, listener: MediaEventListener<T>): () => void {
    return this.emitter.on(type, listener);
  }

  off<T extends MediaEventType>(type: T, listener: MediaEventListener<T>): void {
    this.emitter.off(type, listener);
  }

  /** Call when a user views an item (e.g. opens a lightbox / detail view). */
  recordView(item: MediaItem): void {
    this.emitter.emit('view', { item, timestamp: Date.now() });
  }

  /** Call when a user downloads/saves an item. */
  recordDownload(item: MediaItem): void {
    this.emitter.emit('download', { item, timestamp: Date.now() });
  }

  private attachDefaultLogger(): void {
    const unsubs = [
      this.emitter.on('view', (p) => console.log('[media-core] view', p.item.id)),
      this.emitter.on('download', (p) => console.log('[media-core] download', p.item.id)),
      this.emitter.on('search', (p) => console.log('[media-core] search', p.query, 'page', p.page)),
      this.emitter.on('error', (p) => console.error('[media-core] error', p.error.message, p.context)),
    ];
    this.unsubscribeDefaultLogger = () => unsubs.forEach((u) => u());
  }

  /** Detach the built-in console logger, e.g. in production if the app owns logging. */
  disableDefaultLogging(): void {
    this.unsubscribeDefaultLogger?.();
    this.unsubscribeDefaultLogger = undefined;
  }

  // -- reads ------------------------------------------------------------------

  async searchPhotos(params: SearchParams): Promise<PaginatedResult<MediaItem>> {
    const key = `searchPhotos:${JSON.stringify(params)}`;
    try {
      const res = await this.cache.dedupe(key, () => this.http.searchPhotos(params));
      this.emitter.emit('search', { query: params.query, page: params.page ?? 1, timestamp: Date.now() });
      return toPaginated(res.photos.map(normalizePhoto), res.page, res.per_page, res.total_results);
    } catch (err) {
      this.reportError(err, 'searchPhotos');
      throw err;
    }
  }

  async curatedPhotos(params: ListParams = {}): Promise<PaginatedResult<MediaItem>> {
    const key = `curatedPhotos:${JSON.stringify(params)}`;
    try {
      const res = await this.cache.dedupe(key, () => this.http.curatedPhotos(params));
      return toPaginated(res.photos.map(normalizePhoto), res.page, res.per_page, res.total_results);
    } catch (err) {
      this.reportError(err, 'curatedPhotos');
      throw err;
    }
  }

  async getPhoto(id: string | number): Promise<MediaItem> {
    const key = `photo:${id}`;
    try {
      const photo = await this.cache.dedupe(key, () => this.http.getPhoto(id));
      return normalizePhoto(photo);
    } catch (err) {
      this.reportError(err, 'getPhoto');
      throw err;
    }
  }

  async searchVideos(params: SearchParams): Promise<PaginatedResult<MediaItem>> {
    const key = `searchVideos:${JSON.stringify(params)}`;
    try {
      const res = await this.cache.dedupe(key, () => this.http.searchVideos(params));
      this.emitter.emit('search', { query: params.query, page: params.page ?? 1, timestamp: Date.now() });
      return toPaginated(res.videos.map(normalizeVideo), res.page, res.per_page, res.total_results);
    } catch (err) {
      this.reportError(err, 'searchVideos');
      throw err;
    }
  }

  async popularVideos(params: ListParams = {}): Promise<PaginatedResult<MediaItem>> {
    const key = `popularVideos:${JSON.stringify(params)}`;
    try {
      const res = await this.cache.dedupe(key, () => this.http.popularVideos(params));
      return toPaginated(res.videos.map(normalizeVideo), res.page, res.per_page, res.total_results);
    } catch (err) {
      this.reportError(err, 'popularVideos');
      throw err;
    }
  }

  async getVideo(id: string | number): Promise<MediaItem> {
    const key = `video:${id}`;
    try {
      const video = await this.cache.dedupe(key, () => this.http.getVideo(id));
      return normalizeVideo(video);
    } catch (err) {
      this.reportError(err, 'getVideo');
      throw err;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  private reportError(err: unknown, context: string): void {
    const error = err instanceof MediaCoreError ? err : new MediaCoreError(String(err), undefined, err);
    this.emitter.emit('error', { error, context, timestamp: Date.now() });
  }
}

/** Factory — the intended entry point instead of `new MediaCore()` directly. */
export function createMediaCore(config: MediaCoreConfig): MediaCore {
  return new MediaCore(config);
}
