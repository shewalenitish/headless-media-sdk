import type { HTMLAttributes, RefCallback } from 'react';

/**
 * These components are intentionally ignorant of "media" as a domain concept.
 * They never import MediaItem from media-core — any object works as long as
 * you give the hook a way to read a stable key from it (keyExtractor).
 * This is what keeps media-ui-react independent of media-core/media-react:
 * the app supplies MediaCore's MediaItem[] as `items`, but as far as this
 * package is concerned it's just `T[]`.
 */
export type PropGetter<TElement extends HTMLElement = HTMLElement> = (
  overrides?: HTMLAttributes<TElement>
) => HTMLAttributes<TElement> & { ref?: RefCallback<TElement> };
