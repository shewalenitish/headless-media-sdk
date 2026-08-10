import React from 'react';
import { useLightbox } from '../hooks/useLightbox.js';
import type { UseLightboxOptions } from '../hooks/useLightbox.js';

export interface LightboxProps<T> extends UseLightboxOptions<T> {
  renderItem: (item: T, index: number) => React.ReactNode;
  renderControls?: (api: {
    next: () => void;
    prev: () => void;
    close: () => void;
    hasNext: boolean;
    hasPrev: boolean;
  }) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Lightbox<T>({ renderItem, renderControls, className, style, ...options }: LightboxProps<T>) {
  const lightbox = useLightbox(options);
  if (!lightbox.isOpen || !lightbox.currentItem) return null;

  return (
    <div {...lightbox.getOverlayProps()} className={className} style={style}>
      <div {...lightbox.getContentProps()}>
        {renderItem(lightbox.currentItem, lightbox.currentIndex)}
        {renderControls?.({
          next: lightbox.next,
          prev: lightbox.prev,
          close: lightbox.close,
          hasNext: lightbox.hasNext,
          hasPrev: lightbox.hasPrev,
        })}
      </div>
    </div>
  );
}
