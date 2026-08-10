import { useCallback, useEffect, useRef } from 'react';
import type { HTMLAttributes } from 'react';

export interface UseGridOptions<T> {
  items: T[];
  keyExtractor: (item: T, index: number) => string;
  hasNextPage?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  /** Root margin for the load-more sentinel's IntersectionObserver. Default: '200px'. */
  rootMargin?: string;
}

export interface UseGridResult<T> {
  items: T[];
  keyExtractor: (item: T, index: number) => string;
  getContainerProps: () => HTMLAttributes<HTMLDivElement> & { role: string };
  getItemProps: (item: T, index: number) => HTMLAttributes<HTMLDivElement> & { key: string; role: string };
  /** Attach to a sentinel element placed after the last item to trigger onLoadMore. */
  sentinelRef: (node: HTMLElement | null) => void;
}

/**
 * Headless infinite-scroll grid. Ships no markup and no styles — it only
 * returns prop-getters and a sentinel ref. Consumers own the DOM structure,
 * grid CSS (grid-template-columns etc.), and item rendering entirely.
 */
export function useGrid<T>(options: UseGridOptions<T>): UseGridResult<T> {
  const { items, keyExtractor, hasNextPage = false, loadingMore = false, onLoadMore, rootMargin = '200px' } = options;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;
  const stateRef = useRef({ hasNextPage, loadingMore });
  stateRef.current = { hasNextPage, loadingMore };

  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      observerRef.current?.disconnect();
      if (!node) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const isVisible = entries.some((e) => e.isIntersecting);
          if (isVisible && stateRef.current.hasNextPage && !stateRef.current.loadingMore) {
            onLoadMoreRef.current?.();
          }
        },
        { rootMargin }
      );
      observerRef.current.observe(node);
    },
    [rootMargin]
  );

  useEffect(() => () => observerRef.current?.disconnect(), []);

  const getContainerProps = useCallback(
    (): HTMLAttributes<HTMLDivElement> & { role: string } => ({
      role: 'list',
      'aria-busy': loadingMore || undefined,
    }),
    [loadingMore]
  );

  const getItemProps = useCallback(
    (item: T, index: number): HTMLAttributes<HTMLDivElement> & { key: string; role: string } => ({
      key: keyExtractor(item, index),
      role: 'listitem',
    }),
    [keyExtractor]
  );

  return { items, keyExtractor, getContainerProps, getItemProps, sentinelRef };
}
