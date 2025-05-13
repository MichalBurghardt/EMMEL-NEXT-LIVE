import React from 'react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className = '' }: PaginationProps) {
  return (
    <div className={`flex justify-center space-x-1 ${className}`}>
      <button
        className={`px-3 py-1 rounded border ${currentPage === 1 ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-white hover:bg-gray-100 border-gray-300'}`}
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        &laquo;
      </button>
      
      {totalPages <= 7 ? (
        // If we have 7 or fewer pages, show all page numbers
        [...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={`px-3 py-1 rounded ${
              currentPage === i + 1 
                ? 'bg-blue-500 text-white' 
                : 'bg-white border border-gray-300 hover:bg-gray-100'
            }`}
            onClick={() => onPageChange(i + 1)}
            aria-label={`Page ${i + 1}`}
            aria-current={currentPage === i + 1 ? 'page' : undefined}
          >
            {i + 1}
          </button>
        ))
      ) : (
        // For more than 7 pages, create a condensed view with ellipsis
        <>
          {/* First page is always displayed */}
          <button
            className={`px-3 py-1 rounded ${
              currentPage === 1 
                ? 'bg-blue-500 text-white' 
                : 'bg-white border border-gray-300 hover:bg-gray-100'
            }`}
            onClick={() => onPageChange(1)}
            aria-label="Page 1"
            aria-current={currentPage === 1 ? 'page' : undefined}
          >
            1
          </button>
          
          {/* Show ellipsis if current page is > 3 */}
          {currentPage > 3 && <span className="px-3 py-1">...</span>}
          
          {/* Display pages surrounding current page */}
          {[...Array(totalPages)].map((_, i) => {
            const pageNum = i + 1;
            const visibleRange = pageNum >= currentPage - 1 && 
                                pageNum <= currentPage + 1 && 
                                pageNum !== 1 && 
                                pageNum !== totalPages;
                                
            return visibleRange ? (
              <button
                key={i}
                className={`px-3 py-1 rounded ${
                  currentPage === pageNum 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white border border-gray-300 hover:bg-gray-100'
                }`}
                onClick={() => onPageChange(pageNum)}
                aria-label={`Page ${pageNum}`}
                aria-current={currentPage === pageNum ? 'page' : undefined}
              >
                {pageNum}
              </button>
            ) : null;
          })}
          
          {/* Show ellipsis if current page is < totalPages - 2 */}
          {currentPage < totalPages - 2 && <span className="px-3 py-1">...</span>}
          
          {/* Last page is always displayed */}
          <button
            className={`px-3 py-1 rounded ${
              currentPage === totalPages 
                ? 'bg-blue-500 text-white' 
                : 'bg-white border border-gray-300 hover:bg-gray-100'
            }`}
            onClick={() => onPageChange(totalPages)}
            aria-label={`Page ${totalPages}`}
            aria-current={currentPage === totalPages ? 'page' : undefined}
          >
            {totalPages}
          </button>
        </>
      )}
      
      <button
        className={`px-3 py-1 rounded border ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'bg-white hover:bg-gray-100 border-gray-300'}`}
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        &raquo;
      </button>
    </div>
  );
}
