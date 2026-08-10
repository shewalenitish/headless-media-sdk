import React from 'react';
import { useMediaTracking } from 'media-react';
import type { MediaItem } from 'media-core';
import { Lightbox } from 'media-ui-react';

export interface PhotoLightboxProps {
  items: MediaItem[];
  initialIndex: number;
  onClose: () => void;
}

export function PhotoLightbox({ items, initialIndex, onClose }: PhotoLightboxProps) {
  const { trackView, trackDownload } = useMediaTracking();

  return (
    <Lightbox
      items={items}
      initialIndex={initialIndex}
      onClose={onClose}
      onIndexChange={(_index, item) => trackView(item)}
      className="lightbox"
      renderItem={(item) => (
        <figure className="lightbox__figure">
          <img src={item.previewUrl} alt={item.alt ?? `Photo by ${item.authorName}`} className="lightbox__image" />
          <figcaption>
            Photo by{' '}
            <a href={item.authorUrl} target="_blank" rel="noreferrer">
              {item.authorName}
            </a>{' '}
            on{' '}
            <a href={item.sourceUrl} target="_blank" rel="noreferrer">
              Pexels
            </a>
            <a href={item.fullUrl} download className="lightbox__download" onClick={() => trackDownload(item)}>
              Download
            </a>
          </figcaption>
        </figure>
      )}
      renderControls={({ next, prev, close, hasNext, hasPrev }) => (
        <>
          {hasPrev && (
            <button className="lightbox__prev" onClick={prev}>
              ‹
            </button>
          )}
      
          {hasNext && (
            <button className="lightbox__next" onClick={next}>
              ›
            </button>
          )}
      
          <button className="lightbox__close" onClick={close}>
            ✕
          </button>
        </>
      )}
    />
  );
}
