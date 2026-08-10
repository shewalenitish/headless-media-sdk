import React from 'react';
import { useMediaList, useMediaTracking } from 'media-react';
import { ReelSwiper } from 'media-ui-react';

export interface ReelsViewProps {
  query: string;
}

export function ReelsView({ query }: ReelsViewProps) {
  const { items, loading, error } = useMediaList(
    query ? { kind: 'search-videos', query } : { kind: 'popular-videos' },
    { perPage: 10 }
  );
  const { trackView } = useMediaTracking();

  if (loading) return <p className="status">Loading videos…</p>;
  if (error) return <p className="status status--error">Couldn't load videos: {error.message}</p>;
  if (items.length === 0) return <p className="status">No videos found.</p>;

  return (
    <ReelSwiper
      items={items}
      keyExtractor={(item) => item.id}
      className="reel-swiper"
      onActiveChange={(_index, item) => trackView(item)}
      renderItem={(item, _index, isActive) => (
        <div className="reel-item">
          <video
            src={item.fullUrl}
            poster={item.thumbnailUrl}
            playsInline
            muted
            autoPlay={isActive}
            loop
            className="reel-item__video"
          />
                    <div className="reel-item__caption">
            by{' '}
            <a href={item.authorUrl} target="_blank" rel="noreferrer">
              {item.authorName}
            </a>
          </div>
        </div>
      )}
    />
  );
}
