import React from 'react';
import { useGrid } from '../hooks/useGrid.js';
import type { UseGridOptions } from '../hooks/useGrid.js';

export interface GridProps<T> extends UseGridOptions<T> {
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Rendered after the last item; visibility triggers onLoadMore. Default: an empty 1px div. */
  renderSentinel?: () => React.ReactNode;
  renderLoadingMore?: () => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Optional convenience component. Ships no CSS — pass `className`/`style`
 * for layout (e.g. a CSS grid). Everything here is buildable directly from
 * `useGrid` if you want full control over markup instead.
 */
export function Grid<T>({
  renderItem,
  renderSentinel,
  renderLoadingMore,
  className,
  style,
  ...gridOptions
}: GridProps<T>) {
  const { items, getContainerProps, getItemProps, sentinelRef } = useGrid(gridOptions);

  return (
    <div {...getContainerProps()} className={className} style={style}>
      {items.map((item, index) => {
        const { key, ...itemProps } = getItemProps(item, index);
        return (
          <div key={key} {...itemProps}>
            {renderItem(item, index)}
          </div>
        );
      })}
      <div ref={sentinelRef as React.Ref<HTMLDivElement>} aria-hidden="true" style={{ height: 1 }}>
        {renderSentinel?.()}
      </div>
      {gridOptions.loadingMore ? renderLoadingMore?.() : null}
    </div>
  );
}
