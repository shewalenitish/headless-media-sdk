import React from 'react';
import { useReelSwiper } from '../hooks/useReelSwiper.js';
import type { UseReelSwiperOptions } from '../hooks/useReelSwiper.js';

export interface ReelSwiperProps<T> extends UseReelSwiperOptions<T> {
  renderItem: (item: T, index: number, isActive: boolean) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function ReelSwiper<T>({ renderItem, className, style, ...options }: ReelSwiperProps<T>) {
  const { items, activeIndex, getContainerProps, getItemProps } = useReelSwiper(options);
  const { style: containerStyle, ...containerProps } = getContainerProps();

  return (
    <div {...containerProps} className={className} style={{ ...containerStyle, ...style }}>
      {items.map((item, index) => {
        const { key, style: itemStyle, ...itemProps } = getItemProps(item, index);
        return (
          <div key={key} {...itemProps} style={itemStyle}>
            {renderItem(item, index, index === activeIndex)}
          </div>
        );
      })}
    </div>
  );
}
