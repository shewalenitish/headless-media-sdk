import { useCallback } from 'react';
import type { ListRenderItemInfo } from 'react-native';

export interface UseGridOptions<T> {
  items: T[];
  keyExtractor: (item: T, index: number) => string;
  numColumns?: number;
  hasNextPage?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

export interface UseGridResult<T> {
  items: T[];
  numColumns: number;
  keyExtractor: (item: T, index: number) => string;
  renderItem: (
    render: (item: T, index: number) => React.ReactElement | null,
  ) => ({ item, index }: ListRenderItemInfo<T>) => React.ReactElement | null;
  onEndReached: () => void;
}

export function useGrid<T>({
  items,
  keyExtractor,
  numColumns = 2,
  hasNextPage = false,
  loadingMore = false,
  onLoadMore,
}: UseGridOptions<T>): UseGridResult<T> {
  const renderItem = useCallback(
    (
      render: (item: T, index: number) => React.ReactElement | null,
    ) =>
      ({ item, index }: ListRenderItemInfo<T>) =>
        render(item, index),
    [],
  );

  const onEndReached = useCallback(() => {
    if (hasNextPage && !loadingMore) {
      onLoadMore?.();
    }
  }, [hasNextPage, loadingMore, onLoadMore]);

  return {
    items,
    numColumns,
    keyExtractor,
    renderItem,
    onEndReached,
  };
}