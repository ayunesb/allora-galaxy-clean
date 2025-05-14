
import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { ButtonProps, buttonVariants } from "@/components/ui/button";

export interface PaginationProps extends React.ComponentProps<"nav"> {
  /** Current page number */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Show sibling pages (number of pages to show before and after current) */
  siblings?: number;
  /** Show first and last page buttons */
  showFirstLast?: boolean;
  /** Show previous and next page buttons */
  showPrevNext?: boolean;
  /** Whether the pagination is disabled */
  disabled?: boolean;
}

/**
 * Unified Pagination component
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblings = 1,
  showFirstLast = false,
  showPrevNext = true,
  disabled = false,
  className,
  ...props
}: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    
    // Always include first page
    pages.push(1);
    
    // Calculate range of pages to show around current page
    const leftSiblingIndex = Math.max(2, currentPage - siblings);
    const rightSiblingIndex = Math.min(totalPages - 1, currentPage + siblings);
    
    // Add ellipsis indicator if needed
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;
    
    if (shouldShowLeftDots) {
      pages.push(-1); // Use -1 to indicate ellipsis
    }
    
    // Add page numbers
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      if (i !== 1 && i !== totalPages) { // Skip first and last as they're added separately
        pages.push(i);
      }
    }
    
    if (shouldShowRightDots) {
      pages.push(-2); // Use -2 to indicate ellipsis
    }
    
    // Always include last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    >
      <ul className="flex flex-row items-center gap-1">
        {/* First page button */}
        {showFirstLast && currentPage > 1 && (
          <li>
            <PaginationLink
              aria-label="Go to first page"
              onClick={() => !disabled && onPageChange(1)}
              disabled={disabled || currentPage === 1}
            >
              <span className="sr-only">First page</span>
              <span aria-hidden="true">1</span>
            </PaginationLink>
          </li>
        )}

        {/* Previous button */}
        {showPrevNext && (
          <li>
            <PaginationLink
              aria-label="Go to previous page"
              onClick={() => !disabled && onPageChange(currentPage - 1)}
              disabled={disabled || currentPage === 1}
              className="gap-1 pl-2.5"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </PaginationLink>
          </li>
        )}

        {/* Page numbers */}
        {pages.map((page, i) => (
          <li key={`page-${i}`}>
            {page < 0 ? (
              <span
                aria-hidden
                className={cn("flex h-9 w-9 items-center justify-center")}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More pages</span>
              </span>
            ) : (
              <PaginationLink
                aria-label={`Go to page ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
                onClick={() => !disabled && onPageChange(page)}
                disabled={disabled}
                isActive={page === currentPage}
              >
                {page}
              </PaginationLink>
            )}
          </li>
        ))}

        {/* Next button */}
        {showPrevNext && (
          <li>
            <PaginationLink
              aria-label="Go to next page"
              onClick={() => !disabled && onPageChange(currentPage + 1)}
              disabled={disabled || currentPage >= totalPages}
              className="gap-1 pr-2.5"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </PaginationLink>
          </li>
        )}

        {/* Last page button */}
        {showFirstLast && currentPage < totalPages && (
          <li>
            <PaginationLink
              aria-label="Go to last page"
              onClick={() => !disabled && onPageChange(totalPages)}
              disabled={disabled || currentPage === totalPages}
            >
              <span className="sr-only">Last page</span>
              <span aria-hidden="true">{totalPages}</span>
            </PaginationLink>
          </li>
        )}
      </ul>
    </nav>
  );
}

type PaginationLinkProps = {
  isActive?: boolean;
  disabled?: boolean;
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"button">;

function PaginationLink({
  className,
  isActive,
  disabled,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <button
      aria-current={isActive ? "page" : undefined}
      disabled={disabled}
      className={cn(
        buttonVariants({
          variant: isActive ? "default" : "outline",
          size,
        }),
        disabled && "pointer-events-none opacity-50",
        className
      )}
      {...props}
    />
  );
}
