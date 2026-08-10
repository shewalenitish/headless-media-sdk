export { MediaProvider, useMediaCore } from './MediaProvider.js';
export { useMediaList } from './useMediaList.js';
export type { MediaListSource, UseMediaListOptions, UseMediaListResult } from './useMediaList.js';
export { useMediaItem } from './useMediaItem.js';
export type { UseMediaItemResult } from './useMediaItem.js';
export { useMediaEvent, useMediaTracking } from './useMediaEvents.js';
export type { MediaTracking } from './useMediaEvents.js';

// Re-export the core types consumers need without importing media-core directly.
export type {
  MediaItem,
  MediaKind,
  PaginatedResult,
  MediaEventType,
  MediaEventPayloadMap,
} from 'media-core';
