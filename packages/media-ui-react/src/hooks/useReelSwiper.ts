import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';

export interface UseReelSwiperOptions<T> {
  items: T[];
  keyExtractor: (item: T, index: number) => string;
  initialIndex?: number;
  onActiveChange?: (index: number, item: T) => void;
  /** Fraction of an item that must be visible to count as "active". Default: 0.6. */
  activeThreshold?: number;
}

export interface UseReelSwiperResult<T> {
  items: T[];
  activeIndex: number;
  activeItem: T | null;
  scrollTo: (index: number) => void;
  getContainerProps: () => HTMLAttributes<HTMLDivElement> & {
    style: CSSProperties;
    ref: (node: HTMLDivElement | null) => void;
  };
  getItemProps: (item: T, index: number) => HTMLAttributes<HTMLDivElement> & {
    key: string;
    style: CSSProperties;
    ref: (node: HTMLDivElement | null) => void;
  };
}

/**
 * Headless vertical "reels" swiper: CSS scroll-snap for paging plus an
 * IntersectionObserver to report which item is currently active. No styling
 * beyond the minimal snap/scroll mechanics that make this behavior work at
 * all (scroll-snap-type, overflow, height) — everything visual is the
 * consumer's.
 */
export function useReelSwiper<T>(options: UseReelSwiperOptions<T>): UseReelSwiperResult<T> {
  const { items, keyExtractor, initialIndex = 0, onActiveChange, activeThreshold = 0.6 } = options;

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemNodesRef = useRef(new Map<number, HTMLDivElement>());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const onActiveChangeRef = useRef(onActiveChange);
  onActiveChangeRef.current = onActiveChange;

  const setActive = useCallback(
    (index: number) => {
      setActiveIndex((prev) => {
        if (prev === index) return prev;
        onActiveChangeRef.current?.(index, items[index]);
        return index;
      });
    },
    [items]
  );

  const containerCallbackRef = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;
      observerRef.current?.disconnect();
      if (!node) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const mostVisible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (!mostVisible) return;
          const index = Number((mostVisible.target as HTMLElement).dataset.reelIndex);
          if (!Number.isNaN(index)) setActive(index);
        },
        { root: node, threshold: activeThreshold }
      );

      itemNodesRef.current.forEach((el) => observerRef.current?.observe(el));
    },
    [activeThreshold, setActive]
  );

  useEffect(() => () => observerRef.current?.disconnect(), []);

  const itemRef = useCallback((index: number) => (node: HTMLDivElement | null) => {
    const prev = itemNodesRef.current.get(index);
    if (prev && observerRef.current) observerRef.current.unobserve(prev);

    if (node) {
      itemNodesRef.current.set(index, node);
      observerRef.current?.observe(node);
    } else {
      itemNodesRef.current.delete(index);
    }
  }, []);

  const scrollTo = useCallback((index: number) => {
    itemNodesRef.current.get(index)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const getContainerProps = useCallback(
    (): HTMLAttributes<HTMLDivElement> & {
      style: CSSProperties;
      ref: (node: HTMLDivElement | null) => void;
    } => ({
      ref: containerCallbackRef,
      onWheelCapture: (event) => {
        const container = containerRef.current;
        if (!container) return;
      
        event.preventDefault();
      
        container.scrollBy({
          top: event.deltaY,
          behavior: 'auto',
        });
      },
      style: {
        overflowY: 'auto',
        scrollSnapType: 'y mandatory',
        height: '100%',
      },
    }),
    [containerCallbackRef]
  );

  const getItemProps = useCallback(
    (item: T, index: number) => ({
      key: keyExtractor(item, index),
      ref: itemRef(index),
      'data-reel-index': index,
      style: {
        scrollSnapAlign: 'start' as const,
        scrollSnapStop: 'always' as const,
        height: '100%',
      },
    }),
    [keyExtractor, itemRef]
  );

  return {
    items,
    activeIndex,
    activeItem: items[activeIndex] ?? null,
    scrollTo,
    getContainerProps,
    getItemProps,
  };
}
