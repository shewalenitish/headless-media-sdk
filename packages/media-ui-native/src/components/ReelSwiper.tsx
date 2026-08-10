import React from 'react';
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Dimensions,
} from 'react-native';
import { useReelSwiper } from '../hooks/useReelSwiper.js';

export interface ReelSwiperProps<T> {
  items: T[];
  keyExtractor: (item: T, index: number) => string;
  initialIndex?: number;
  onActiveChange?: (index: number, item: T) => void;
  renderItem: (
    item: T,
    index: number,
    isActive: boolean
  ) => React.ReactElement | null;
}

const { height } = Dimensions.get('window');

export function ReelSwiper<T>({
  items,
  keyExtractor,
  initialIndex = 0,
  onActiveChange,
  renderItem,
}: ReelSwiperProps<T>) {
  const swiper = useReelSwiper({
    items,
    keyExtractor,
    initialIndex,
    onActiveChange,
  });

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / height);

    swiper.setActiveIndex(index);
  };

  return (
    <FlatList
      data={swiper.items}
      keyExtractor={swiper.keyExtractor}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      initialScrollIndex={initialIndex}
      getItemLayout={(_, index) => ({
        length: height,
        offset: height * index,
        index,
      })}
      renderItem={({ item, index }) => (
        renderItem(
          item,
          index,
          index === swiper.activeIndex
        )
      )}
    />
  );
}
