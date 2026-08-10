import { useEffect, useRef } from 'react';
import type { MediaEventListener, MediaEventType, MediaItem } from 'media-core';
import { useMediaCore } from './MediaProvider.js';

/**
 * Subscribes to a media-core event for the lifetime of the component.
 * The app can use this independently of any UI component to track activity,
 * per the SDK's "app can also subscribe independently" requirement.
 */
export function useMediaEvent<T extends MediaEventType>(type: T, listener: MediaEventListener<T>): void {
  const core = useMediaCore();
  const listenerRef = useRef(listener);
  listenerRef.current = listener;

  useEffect(() => {
    return core.on(type, (payload) => listenerRef.current(payload));
  }, [core, type]);
}

export interface MediaTracking {
  trackView: (item: MediaItem) => void;
  trackDownload: (item: MediaItem) => void;
}

/** Convenience hook exposing the two write-side event triggers. */
export function useMediaTracking(): MediaTracking {
  const core = useMediaCore();
  return {
    trackView: (item) => core.recordView(item),
    trackDownload: (item) => core.recordDownload(item),
  };
}
