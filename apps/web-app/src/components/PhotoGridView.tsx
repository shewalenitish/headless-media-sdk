import React from 'react';
import { useMediaList } from 'media-react';
import type { MediaItem } from 'media-core';
import { Grid } from 'media-ui-react';

export interface PhotoGridViewProps {
  query: string;
  onSelect: (items: MediaItem[], index: number) => void;
}

export function PhotoGridView({ query, onSelect }: PhotoGridViewProps) {
  const { items, loading, loadingMore, error, hasNextPage, loadMore } = useMediaList(
    query ? { kind: 'search-photos', query } : { kind: 'curated-photos' },
    { perPage: 24 }
  );

  if (loading) return <p className="status">Loading photos…</p>;
  if (error) return <p className="status status--error">Couldn't load photos: {error.message}</p>;
  if (items.length === 0) return <p className="status">No photos found.</p>;

  return (
    <Grid
      items={items}
      keyExtractor={(item) => item.id}
      hasNextPage={hasNextPage}
      loadingMore={loadingMore}
      onLoadMore={loadMore}
      className="media-grid"
      renderItem={(item, index) => (
        <button className="media-grid__item" onClick={() => onSelect(items, index)}>
          <img src={item.thumbnailUrl} alt={item.alt ?? `Photo by ${item.authorName}`} loading="lazy" />
        </button>
      )}
      renderLoadingMore={() => <p className="status">Loading more…</p>}
    />
  );
}
