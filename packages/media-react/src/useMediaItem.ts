import { useEffect, useState } from 'react';
import type { MediaItem, MediaKind } from 'media-core';
import { useMediaCore } from './MediaProvider.js';

export interface UseMediaItemResult {
  item: MediaItem | null;
  loading: boolean;
  error: Error | null;
}

/** Fetches a single photo or video by id — e.g. for a deep-linked Lightbox. */
export function useMediaItem(id: string | number | null, kind: MediaKind): UseMediaItemResult {
  const core = useMediaCore();
  const [item, setItem] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (id == null) {
      setItem(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetcher = kind === 'photo' ? core.getPhoto(id) : core.getVideo(id);
    fetcher
      .then((result) => {
        if (!cancelled) setItem(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [core, id, kind]);

  return { item, loading, error };
}
