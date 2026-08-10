import React, { useState } from 'react';
import { useMediaEvent } from 'media-react';
import type { MediaItem } from 'media-core';
import { SearchBar } from './components/SearchBar.js';
import { PhotoGridView } from './components/PhotoGridView.js';
import { PhotoLightbox } from './components/PhotoLightbox.js';
import { ReelsView } from './components/ReelsView.js';

type Tab = 'photos' | 'videos';

export function App() {
  const [tab, setTab] = useState<Tab>('photos');
  const [query, setQuery] = useState('');
  const [lightbox, setLightbox] = useState<{ items: MediaItem[]; index: number } | null>(null);

  // Demonstrates the app subscribing to media-core events independently of
  // any UI component — e.g. for its own analytics pipeline, separate from
  // the SDK's built-in console logger.
  useMediaEvent('download', (payload) => {
    console.info('[app] user downloaded', payload.item.id, 'at', new Date(payload.timestamp).toISOString());
  });

  return (
    <div className="app">
      <header className="app__header">
        <h1>Media SDK Demo</h1>
        <nav className="tabs">
          <button className={tab === 'photos' ? 'tab tab--active' : 'tab'} onClick={() => setTab('photos')}>
            Photos
          </button>
          <button className={tab === 'videos' ? 'tab tab--active' : 'tab'} onClick={() => setTab('videos')}>
            Videos
          </button>
        </nav>
        <SearchBar initialQuery={query} onSearch={setQuery} />
      </header>

      <main className="app__main">
        {tab === 'photos' ? (
          <PhotoGridView query={query} onSelect={(items, index) => setLightbox({ items, index })} />
        ) : (
          <ReelsView query={query} />
        )}
      </main>

      {lightbox && (
        <PhotoLightbox items={lightbox.items} initialIndex={lightbox.index} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}
