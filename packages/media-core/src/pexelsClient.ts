import { MediaCoreAuthError, MediaCoreError, MediaCoreRateLimitError } from './types.js';
import type { ListParams, PexelsPhoto, PexelsVideo, SearchParams } from './types.js';

interface PexelsPhotosResponse {
  page: number;
  per_page: number;
  total_results: number;
  photos: PexelsPhoto[];
  next_page?: string;
}

interface PexelsVideosResponse {
  page: number;
  per_page: number;
  total_results: number;
  videos: PexelsVideo[];
  next_page?: string;
}

const DEFAULT_BASE_URL = 'https://api.pexels.com/v1';
const DEFAULT_VIDEO_BASE_URL = 'https://api.pexels.com/videos';

/**
 * Thin, private wrapper around the raw Pexels REST API.
 * Nothing above this file should ever build a Pexels URL or read the API key —
 * this is the single seam where auth is attached to outgoing requests.
 */
export class PexelsHttpClient {
  private readonly baseUrl: string;
  private readonly videoBaseUrl: string;

  constructor(private readonly apiKey: string, baseUrl?: string) {
    if (!apiKey) {
      throw new MediaCoreAuthError('media-core: apiKey is required at init');
    }
    this.baseUrl = baseUrl ?? DEFAULT_BASE_URL;
    this.videoBaseUrl = baseUrl ? `${baseUrl}/videos` : DEFAULT_VIDEO_BASE_URL;
  }

  private async request<T>(url: string): Promise<T> {
    let response: Response;
    try {
      response = await fetch(url, {
        headers: { Authorization: this.apiKey },
      });
    } catch (err) {
      throw new MediaCoreError('Network request to Pexels failed', undefined, err);
    }

    if (response.status === 401 || response.status === 403) {
      throw new MediaCoreAuthError();
    }
    if (response.status === 429) {
      throw new MediaCoreRateLimitError();
    }
    if (!response.ok) {
      throw new MediaCoreError(`Pexels API error: ${response.status} ${response.statusText}`, response.status);
    }

    return (await response.json()) as T;
  }

  async searchPhotos(params: SearchParams): Promise<PexelsPhotosResponse> {
    const qs = new URLSearchParams({
      query: params.query,
      page: String(params.page ?? 1),
      per_page: String(params.perPage ?? 20),
      ...(params.orientation ? { orientation: params.orientation } : {}),
    });
    return this.request<PexelsPhotosResponse>(`${this.baseUrl}/search?${qs}`);
  }

  async curatedPhotos(params: ListParams = {}): Promise<PexelsPhotosResponse> {
    const qs = new URLSearchParams({
      page: String(params.page ?? 1),
      per_page: String(params.perPage ?? 20),
    });
    return this.request<PexelsPhotosResponse>(`${this.baseUrl}/curated?${qs}`);
  }

  async getPhoto(id: string | number): Promise<PexelsPhoto> {
    return this.request<PexelsPhoto>(`${this.baseUrl}/photos/${id}`);
  }

  async searchVideos(params: SearchParams): Promise<PexelsVideosResponse> {
    const qs = new URLSearchParams({
      query: params.query,
      page: String(params.page ?? 1),
      per_page: String(params.perPage ?? 20),
      ...(params.orientation ? { orientation: params.orientation } : {}),
    });
    return this.request<PexelsVideosResponse>(`${this.videoBaseUrl}/search?${qs}`);
  }

  async popularVideos(params: ListParams = {}): Promise<PexelsVideosResponse> {
    const qs = new URLSearchParams({
      page: String(params.page ?? 1),
      per_page: String(params.perPage ?? 20),
    });
    return this.request<PexelsVideosResponse>(`${this.videoBaseUrl}/popular?${qs}`);
  }

  async getVideo(id: string | number): Promise<PexelsVideo> {
    return this.request<PexelsVideo>(`${this.videoBaseUrl}/videos/${id}`);
  }
}
