import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  itemLabel?: string;
  showInfo?: boolean;
  siblingCount?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  itemLabel = 'stays',
  showInfo = true,
  siblingCount = 1,
  className = '',
}) => {
  // Generate pagination items (numbers + ellipses)
  const paginationRange = useMemo(() => {
    if (totalPages <= 0) return [];
    if (totalPages === 1) return [1];

    const totalPageNumbers = siblingCount * 2 + 5; // siblingCount + first + last + current + 2*dots

    // Case 1: Total pages is less than the page numbers we want to show
    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Case 2: No left dots, but right dots needed
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, 'DOTS', totalPages];
    }

    // Case 3: No right dots, but left dots needed
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [firstPageIndex, 'DOTS', ...rightRange];
    }

    // Case 4: Both left and right dots needed
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [firstPageIndex, 'DOTS', ...middleRange, 'DOTS', lastPageIndex];
    }

    return [];
  }, [totalPages, siblingCount, currentPage]);

  if (totalPages < 1 || (totalItems !== undefined && totalItems === 0)) return null;

  const startIndex = itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : undefined;
  const endIndex =
    itemsPerPage && totalItems
      ? Math.min(currentPage * itemsPerPage, totalItems)
      : undefined;

  return (
    <nav
      aria-label="Pagination Navigation"
      className={`mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-200/80 pt-6 sm:flex-row ${className}`}
    >
      {/* Items count summary */}
      {showInfo && totalItems !== undefined && (
        <p className="text-sm text-gray-500">
          {startIndex !== undefined && endIndex !== undefined ? (
            <>
              Showing <span className="font-semibold text-gray-800">{startIndex}</span> to{' '}
              <span className="font-semibold text-gray-800">{endIndex}</span> of{' '}
              <span className="font-semibold text-gray-800">{totalItems}</span> {itemLabel}
            </>
          ) : (
            <>
              Total <span className="font-semibold text-gray-800">{totalItems}</span> {itemLabel}
            </>
          )}
        </p>
      )}

      {/* Pagination Controls */}
      <div className="inline-flex items-center gap-1.5 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm">
        {/* Previous Page Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous Page"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Page numbers and ellipsis */}
        {paginationRange.map((pageNumber, idx) => {
          if (pageNumber === 'DOTS') {
            return (
              <span
                key={`dots-${idx}`}
                className="w-8 h-8 flex items-center justify-center text-gray-400"
                aria-hidden="true"
              >
                <MoreHorizontal className="w-4 h-4" />
              </span>
            );
          }

          const page = pageNumber as number;
          const isActive = page === currentPage;

          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-8 h-8 rounded-xl text-sm font-semibold transition cursor-pointer flex items-center justify-center ${
                isActive
                  ? 'bg-[#fe424d] text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Next Page Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next Page"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition cursor-pointer"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};
