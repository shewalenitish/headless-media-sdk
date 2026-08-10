import React, { createContext, useContext, useMemo } from 'react';
import { createMediaCore, MediaCore, type MediaCoreConfig } from 'media-core';

const MediaCoreContext = createContext<MediaCore | null>(null);

export interface MediaProviderProps extends MediaCoreConfig {
  children: React.ReactNode;
  /** Provide an already-constructed MediaCore instance instead of config
   *  (useful for tests, or sharing one instance across React + non-React code). */
  instance?: MediaCore;
}

/**
 * Wires a MediaCore instance into React context. This is the only auth
 * boundary on the React side — the API key lives here, not in components.
 */
export function MediaProvider({ children, instance, ...config }: MediaProviderProps) {
  const core = useMemo(() => instance ?? createMediaCore(config), [instance, config.apiKey]);
  return <MediaCoreContext.Provider value={core}>{children}</MediaCoreContext.Provider>;
}

/** Escape hatch for advanced use (direct event subscription, cache clearing, etc). */
export function useMediaCore(): MediaCore {
  const core = useContext(MediaCoreContext);
  if (!core) {
    throw new Error('useMediaCore must be used within a <MediaProvider>');
  }
  return core;
}
