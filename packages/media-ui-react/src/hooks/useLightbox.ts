import { useCallback, useEffect, useRef, useState } from 'react';
import type { HTMLAttributes } from 'react';

export interface UseLightboxOptions<T> {
  items: T[];
  initialIndex?: number;
  onClose?: () => void;
  onIndexChange?: (index: number, item: T) => void;
  /** Enable Escape / ArrowLeft / ArrowRight handling. Default: true. */
  enableKeyboard?: boolean;
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
  getOverlayProps: () => HTMLAttributes<HTMLDivElement> & { role: string; 'aria-modal': boolean };
  /** Spread onto the focusable content container — wires focus trap + ref. */
  getContentProps: () => HTMLAttributes<HTMLDivElement> & {
    ref: (node: HTMLDivElement | null) => void;
    tabIndex: number;
    role: string;
  };
}

/**
 * Headless lightbox: index state, keyboard nav (web), and a simple focus
 * trap. No image/video rendering opinions — the consumer's renderItem does
 * that entirely, so this works for photos, videos, or mixed content.
 */
export function useLightbox<T>(options: UseLightboxOptions<T>): UseLightboxResult<T> {
  const { items, initialIndex = 0, onClose, onIndexChange, enableKeyboard = true } = options;

  const [isOpen, setIsOpen] = useState(initialIndex >= 0 && initialIndex < items.length);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<Element | null>(null);

  const currentItem = isOpen && items[currentIndex] !== undefined ? items[currentIndex] : null;
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
      previouslyFocusedRef.current = typeof document !== 'undefined' ? document.activeElement : null;
      setIsOpen(true);
      goTo(index);
    },
    [goTo]
  );

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
    (previouslyFocusedRef.current as HTMLElement | null)?.focus?.();
  }, [onClose]);

  const next = useCallback(() => hasNext && goTo(currentIndex + 1), [hasNext, goTo, currentIndex]);
  const prev = useCallback(() => hasPrev && goTo(currentIndex - 1), [hasPrev, goTo, currentIndex]);

  // Keyboard handling: Escape closes, arrows navigate.
  useEffect(() => {
    if (!isOpen || !enableKeyboard || typeof window === 'undefined') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, enableKeyboard, close, next, prev]);

  // Focus the content container whenever the lightbox opens, for a11y.
  useEffect(() => {
    if (isOpen) contentRef.current?.focus();
  }, [isOpen]);

  // Basic focus trap: keep Tab focus cycling within the content container.
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;
    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !contentRef.current) return;
      const focusable = contentRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', trap);
    return () => window.removeEventListener('keydown', trap);
  }, [isOpen]);

  const getOverlayProps = useCallback(
    (): HTMLAttributes<HTMLDivElement> & { role: string; 'aria-modal': boolean } => ({
      role: 'dialog',
      'aria-modal': true,
      onClick: (e) => {
        if (e.target === e.currentTarget) close();
      },
    }),
    [close]
  );

  const getContentProps = useCallback(
    (): HTMLAttributes<HTMLDivElement> & {
      ref: (node: HTMLDivElement | null) => void;
      tabIndex: number;
      role: string;
    } => ({
      ref: (node: HTMLDivElement | null) => {
        contentRef.current = node;
      },
      tabIndex: -1,
      role: 'document',
    }),
    []
  );

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
    getOverlayProps,
    getContentProps,
  };
}
