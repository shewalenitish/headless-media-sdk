import { useCallback, useState } from 'react';

export interface UseLightboxOptions<T> {
  items: T[];
  initialIndex?: number;
  onClose?: () => void;
  onIndexChange?: (index: number, item: T) => void;
}

export interface UseLightboxResult<T> {
  isOpen: boolean;
  currentIndex: number;
  currentItem: T | null;
  open: (index: number) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export function useLightbox<T>(
  options: UseLightboxOptions<T>
): UseLightboxResult<T> {
  const {
    items,
    initialIndex = 0,
    onClose,
    onIndexChange,
  } = options;

  const [isOpen, setIsOpen] = useState(
    initialIndex >= 0 && initialIndex < items.length
  );

  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const currentItem =
    isOpen && items[currentIndex] !== undefined
      ? items[currentIndex]
      : null;

  const hasNext = currentIndex < items.length - 1;
  const hasPrev = currentIndex > 0;

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= items.length) return;

      setCurrentIndex(index);
      onIndexChange?.(index, items[index]);
    },
    [items, onIndexChange]
  );

  const open = useCallback(
    (index: number) => {
      if (index < 0 || index >= items.length) return;

      setIsOpen(true);
      goTo(index);
    },
    [items.length, goTo]
  );

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const next = useCallback(() => {
    if (hasNext) {
      goTo(currentIndex + 1);
    }
  }, [currentIndex, goTo, hasNext]);

  const prev = useCallback(() => {
    if (hasPrev) {
      goTo(currentIndex - 1);
    }
  }, [currentIndex, goTo, hasPrev]);

  return {
    isOpen,
    currentIndex,
    currentItem,
    open,
    close,
    next,
    prev,
    hasNext,
    hasPrev,
  };
}
