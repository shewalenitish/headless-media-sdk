import React from 'react';
import {
  FlatList,
  type FlatListProps,
  type ListRenderItem,
  View,
} from 'react-native';

import { useGrid, type UseGridOptions } from '../hooks/useGrid.js';

export interface GridProps<T> extends UseGridOptions<T> {
  renderItem: (item: T, index: number) => React.ReactElement | null;
  columnWrapperStyle?: FlatListProps<T>['columnWrapperStyle'];
  contentContainerStyle?: FlatListProps<T>['contentContainerStyle'];
  style?: FlatListProps<T>['style'];
}

export function Grid<T>({
  renderItem,
  columnWrapperStyle,
  contentContainerStyle,
  style,
  ...options
}: GridProps<T>) {
  const grid = useGrid(options);

  const render: ListRenderItem<T> = ({ item, index }) =>
    renderItem(item, index);

  return (
    <FlatList
      data={grid.items}
      keyExtractor={grid.keyExtractor}
      numColumns={grid.numColumns}
      renderItem={render}
      onEndReached={grid.onEndReached}
      onEndReachedThreshold={0.5}
      columnWrapperStyle={columnWrapperStyle}
      contentContainerStyle={contentContainerStyle}
      style={style}
      ListFooterComponent={
        options.loadingMore ? <View style={{ height: 40 }} /> : null
      }
    />
  );
}