import type { MediaItem, PexelsPhoto, PexelsVideo } from './types.js';

export function normalizePhoto(photo: PexelsPhoto): MediaItem {
  return {
    id: `photo_${photo.id}`,
    kind: 'photo',
    width: photo.width,
    height: photo.height,
    thumbnailUrl: photo.src.small,
    previewUrl: photo.src.large,
    fullUrl: photo.src.original,
    authorName: photo.photographer,
    authorUrl: photo.photographer_url,
    sourceUrl: photo.url,
    alt: photo.alt || undefined,
    raw: photo,
  };
}

function bestVideoFile(video: PexelsVideo) {
  // Prefer HD mp4, fall back to the largest available file.
  const mp4Files = video.video_files.filter((f) => f.file_type === 'video/mp4');
  const pool = mp4Files.length ? mp4Files : video.video_files;
  return (
    pool.find((f) => f.quality === 'hd') ??
    [...pool].sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0] ??
    pool[0]
  );
}

export function normalizeVideo(video: PexelsVideo): MediaItem {
  const best = bestVideoFile(video);
  return {
    id: `video_${video.id}`,
    kind: 'video',
    width: video.width,
    height: video.height,
    thumbnailUrl: video.image,
    previewUrl: video.image,
    fullUrl: best?.link ?? video.video_files[0]?.link ?? '',
    durationSec: video.duration,
    authorName: video.user.name,
    authorUrl: video.user.url,
    sourceUrl: video.url,
    raw: video,
  };
}
