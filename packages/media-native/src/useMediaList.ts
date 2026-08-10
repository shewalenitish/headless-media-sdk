import { useCallback, useEffect, useRef, useState } from 'react';
import type { MediaItem, PaginatedResult } from 'media-core';
import { useMediaCore } from './MediaProvider.js';

export type MediaListSource =
  | {
      kind: 'search-photos';
      query: string;
      orientation?: 'landscape' | 'portrait' | 'square';
    }
  | {
      kind: 'curated-photos';
    }
  | {
      kind: 'search-videos';
      query: string;
      orientation?: 'landscape' | 'portrait' | 'square';
    }
  | {
      kind: 'popular-videos';
    };

export interface UseMediaListOptions {
  perPage?: number;
  enabled?: boolean;
}

export interface UseMediaListResult {
  items: MediaItem[];
  loading: boolean;
  loadingMore: boolean;
  error: Error | null;
  hasNextPage: boolean;
  loadMore: () => void;
  refetch: () => void;
}

function sourceKey(source: MediaListSource): string {
  return JSON.stringify(source);
}

export function useMediaList(
  source: MediaListSource,
  options: UseMediaListOptions = {},
): UseMediaListResult {
  const { perPage = 20, enabled = true } = options;
  const core = useMediaCore();

  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const activeKeyRef = useRef(sourceKey(source));

  const fetchPage = useCallback(
    async (targetPage: number, mode: 'replace' | 'append') => {
      const key = sourceKey(source);

      activeKeyRef.current = key;

      if (mode === 'replace') {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

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
            result = await core.curatedPhotos({
              page: targetPage,
              perPage,
            });
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
            result = await core.popularVideos({
              page: targetPage,
              perPage,
            });
            break;
        }

        if (activeKeyRef.current !== key) {
          return;
        }

        setItems((previous) =>
          mode === 'replace'
            ? result.items
            : [...previous, ...result.items],
        );

        setPage(result.page);
        setHasNextPage(result.hasNextPage);
      } catch (err) {
        if (activeKeyRef.current !== key) {
          return;
        }

        setError(
          err instanceof Error ? err : new Error(String(err)),
        );
      } finally {
        if (activeKeyRef.current !== key) {
          return;
        }

        setLoading(false);
        setLoadingMore(false);
      }
    },
    [core, perPage, source],
  );

  useEffect(() => {
    if (!enabled) {
      setItems([]);
      setHasNextPage(false);
      return;
    }

    if (
      (source.kind === 'search-photos' ||
        source.kind === 'search-videos') &&
      !source.query.trim()
    ) {
      setItems([]);
      setHasNextPage(false);
      return;
    }

    setPage(1);
    fetchPage(1, 'replace');
  }, [enabled, fetchPage, source]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore || !hasNextPage) {
      return;
    }

    fetchPage(page + 1, 'append');
  }, [fetchPage, hasNextPage, loading, loadingMore, page]);

  const refetch = useCallback(() => {
    setPage(1);
    fetchPage(1, 'replace');
  }, [fetchPage]);

  return {
    items,
    loading,
    loadingMore,
    error,
    hasNextPage,
    loadMore,
    refetch,
  };
}
