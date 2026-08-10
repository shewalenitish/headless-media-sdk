import { useCallback, useEffect, useRef, useState } from 'react';
import type { MediaItem, PaginatedResult } from 'media-core';
import { useMediaCore } from './MediaProvider.js';

export type MediaListSource =
  | { kind: 'search-photos'; query: string; orientation?: 'landscape' | 'portrait' | 'square' }
  | { kind: 'curated-photos' }
  | { kind: 'search-videos'; query: string; orientation?: 'landscape' | 'portrait' | 'square' }
  | { kind: 'popular-videos' };

export interface UseMediaListOptions {
  perPage?: number;
  /** Skip fetching (e.g. while a search box is empty). Default: true. */
  enabled?: boolean;
}

export interface UseMediaListResult {
  items: MediaItem[];
  loading: boolean;
  loadingMore: boolean;
  error: Error | null;
  hasNextPage: boolean;
  /** Fetch the next page and append. Safe to call repeatedly (e.g. from a Grid's onLoadMore). */
  loadMore: () => void;
  /** Reset and refetch page 1 — call when the query/source changes intentionally. */
  refetch: () => void;
}

function sourceKey(source: MediaListSource): string {
  return JSON.stringify(source);
}

/**
 * Drives Grid-style infinite-scroll UIs. Pure adaptation of media-core's
 * promise-based, page-based API into React state — no Pexels-specific logic
 * lives here, it all defers to the injected MediaCore instance.
 */
export function useMediaList(source: MediaListSource, options: UseMediaListOptions = {}): UseMediaListResult {
  const { perPage = 20, enabled = true } = options;
  const core = useMediaCore();

  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Tracks the source that's currently "active" so a stale in-flight request
  // for a previous query can't clobber newer results.
  const activeKeyRef = useRef<string>(sourceKey(source));

  const fetchPage = useCallback(
    async (targetPage: number, mode: 'replace' | 'append') => {
      const key = sourceKey(source);
      activeKeyRef.current = key;
      mode === 'replace' ? setLoading(true) : setLoadingMore(true);
      setError(null);

      try {
        let result: PaginatedResult<MediaItem>;
        switch (source.kind) {
          case 'search-photos':
            result = await core.searchPhotos({
              query: source.query,
              page: targetPage,
              perPage,
              orientation: source.orientation,
            });
            break;
          case 'curated-photos':
            result = await core.curatedPhotos({ page: targetPage, perPage });
            break;
          case 'search-videos':
            result = await core.searchVideos({
              query: source.query,
              page: targetPage,
              perPage,
              orientation: source.orientation,
            });
            break;
          case 'popular-videos':
            result = await core.popularVideos({ page: targetPage, perPage });
            break;
        }

        // Ignore results for a query the user has since moved away from.
        if (activeKeyRef.current !== key) return;

        setItems((prev) => (mode === 'replace' ? result.items : [...prev, ...result.items]));
        setPage(result.page);
        setHasNextPage(result.hasNextPage);
      } catch (err) {
        if (activeKeyRef.current !== key) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (activeKeyRef.current !== key) return;
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [core, perPage, sourceKey(source)]
  );

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setHasNextPage(false);
      return;
    }
    if (source.kind === 'search-photos' || source.kind === 'search-videos') {
      if (!source.query.trim()) {
        setItems([]);
        setHasNextPage(false);
        return;
      }
    }
    setPage(1);
    fetchPage(1, 'replace');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, sourceKey(source)]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasNextPage) return;
    fetchPage(page + 1, 'append');
  }, [fetchPage, loading, loadingMore, hasNextPage, page]);

  const refetch = useCallback(() => {
    setPage(1);
    fetchPage(1, 'replace');
  }, [fetchPage]);

  return { items, loading, loadingMore, error, hasNextPage, loadMore, refetch };
}
