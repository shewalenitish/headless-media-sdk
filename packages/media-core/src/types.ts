// ---------------------------------------------------------------------------
// Pexels API shapes (subset actually consumed by this SDK).
// ---------------------------------------------------------------------------

export interface PexelsPhotoSrc {
  original: string;
  large2x: string;
  large: string;
  medium: string;
  small: string;
  portrait: string;
  landscape: string;
  tiny: string;
}

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string | null;
  src: PexelsPhotoSrc;
  alt: string;
}

export interface PexelsVideoFile {
  id: number;
  quality: 'hd' | 'sd' | 'hls' | string;
  file_type: string;
  width: number | null;
  height: number | null;
  link: string;
}

export interface PexelsVideoPicture {
  id: number;
  nr: number;
  picture: string;
}

export interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  url: string;
  image: string;
  duration: number;
  user: { id: number; name: string; url: string };
  video_files: PexelsVideoFile[];
  video_pictures: PexelsVideoPicture[];
}

export type MediaKind = 'photo' | 'video';

/** Normalized item shape the rest of the SDK/UI layers operate on,
 *  so consumers don't need to branch on Pexels' two very different shapes. */
export interface MediaItem {
  id: string;
  kind: MediaKind;
  width: number;
  height: number;
  thumbnailUrl: string;
  previewUrl: string;
  fullUrl: string;
  durationSec?: number;
  authorName: string;
  authorUrl: string;
  sourceUrl: string;
  alt?: string;
  raw: PexelsPhoto | PexelsVideo;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  perPage: number;
  totalResults: number;
  hasNextPage: boolean;
  nextPage?: number;
}

export interface SearchParams {
  query: string;
  page?: number;
  perPage?: number;
  orientation?: 'landscape' | 'portrait' | 'square';
}

export interface ListParams {
  page?: number;
  perPage?: number;
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class MediaCoreError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'MediaCoreError';
  }
}

export class MediaCoreAuthError extends MediaCoreError {
  constructor(message = 'Missing or invalid Pexels API key') {
    super(message, 401);
    this.name = 'MediaCoreAuthError';
  }
}

export class MediaCoreRateLimitError extends MediaCoreError {
  constructor(message = 'Pexels API rate limit exceeded') {
    super(message, 429);
    this.name = 'MediaCoreRateLimitError';
  }
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export type MediaEventType = 'view' | 'download' | 'search' | 'error';

export interface MediaEventPayloadMap {
  view: { item: MediaItem; timestamp: number };
  download: { item: MediaItem; timestamp: number };
  search: { query: string; page: number; timestamp: number };
  error: { error: MediaCoreError; context?: string; timestamp: number };
}

export type MediaEventListener<T extends MediaEventType> = (
  payload: MediaEventPayloadMap[T]
) => void;

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export interface MediaCoreConfig {
  /** Pexels API key. Required — read from env/config at init, never hardcoded. */
  apiKey: string;
  /** Override the API base URL (useful for tests/mocking). */
  baseUrl?: string;
  /** In-memory cache TTL in ms. Set 0 to disable caching. Default: 60_000. */
  cacheTtlMs?: number;
  /** Attach the built-in console listener for all events. Default: true. */
  enableDefaultLogging?: boolean;
}
