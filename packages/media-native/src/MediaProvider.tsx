import React, { createContext, useContext, useMemo } from 'react';
import {
  createMediaCore,
  type MediaCore,
  type MediaCoreConfig,
} from 'media-core';

const MediaCoreContext = createContext<MediaCore | null>(null);

export interface MediaProviderProps extends MediaCoreConfig {
  children: React.ReactNode;
  instance?: MediaCore;
}

/**
 * Provides a MediaCore instance to React Native components and hooks.
 *
 * The API key belongs at this provider boundary and is never hardcoded
 * inside individual components.
 */
export function MediaProvider({
  children,
  instance,
  ...config
}: MediaProviderProps) {
  const core = useMemo(
    () => instance ?? createMediaCore(config),
    [instance, config.apiKey]
  );

  return (
    <MediaCoreContext.Provider value={core}>
      {children}
    </MediaCoreContext.Provider>
  );
}

export function useMediaCore(): MediaCore {
  const core = useContext(MediaCoreContext);

  if (!core) {
    throw new Error('useMediaCore must be used within a MediaProvider');
  }

  return core;
}
