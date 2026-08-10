import { useCallback, useState } from 'react';

export interface UseReelSwiperOptions<T> {
  items: T[];
  keyExtractor: (item: T, index: number) => string;
  initialIndex?: number;
  onActiveChange?: (index: number, item: T) => void;
}

export interface UseReelSwiperResult<T> {
  items: T[];
  activeIndex: number;
  activeItem: T | null;
  setActiveIndex: (index: number) => void;
  keyExtractor: (item: T, index: number) => string;
}

export function useReelSwiper<T>(
  options: UseReelSwiperOptions<T>
): UseReelSwiperResult<T> {
  const {
    items,
    keyExtractor,
    initialIndex = 0,
    onActiveChange,
  } = options;

  const [activeIndex, setActiveIndexState] = useState(initialIndex);

  const setActiveIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= items.length) return;

      setActiveIndexState((previous) => {
        if (previous === index) return previous;

        const item = items[index];

        if (item !== undefined) {
          onActiveChange?.(index, item);
        }

        return index;
      });
    },
    [items, onActiveChange]
  );

  return {
    items,
    activeIndex,
    activeItem: items[activeIndex] ?? null,
    setActiveIndex,
    keyExtractor,
  };
}
