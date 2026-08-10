import type { MediaEventListener, MediaEventPayloadMap, MediaEventType } from './types.js';

/**
 * Minimal typed event emitter. No Node `events` dependency so this stays
 * portable to React Native / browser / any JS runtime.
 */
export class MediaEventEmitter {
  private listeners: {
    [K in MediaEventType]?: Set<MediaEventListener<K>>;
  } = {};

  on<T extends MediaEventType>(type: T, listener: MediaEventListener<T>): () => void {
    this.listeners[type] ??= new Set() as unknown as MediaEventEmitter['listeners'][T];
    const set = this.listeners[type] as unknown as Set<MediaEventListener<T>>;
    set.add(listener);
    return () => this.off(type, listener);
  }

  off<T extends MediaEventType>(type: T, listener: MediaEventListener<T>): void {
    const set = this.listeners[type] as Set<MediaEventListener<T>> | undefined;
    set?.delete(listener);
  }

  emit<T extends MediaEventType>(type: T, payload: MediaEventPayloadMap[T]): void {
    const set = this.listeners[type] as Set<MediaEventListener<T>> | undefined;
    if (!set) return;
    // Copy to array so a listener unsubscribing mid-emit doesn't break iteration.
    for (const listener of Array.from(set)) {
      listener(payload);
    }
  }

  removeAllListeners(type?: MediaEventType): void {
    if (type) {
      delete this.listeners[type];
    } else {
      this.listeners = {};
    }
  }
}
