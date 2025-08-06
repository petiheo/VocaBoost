import React from 'react';

const Pagination = ({ pagination, onPageChange, className = '' }) => {
  if (!pagination || !pagination.totalPages || pagination.totalPages <= 1) {
    return null;
  }

  const { currentPage, totalPages } = pagination;
  const pages = [];

  // Show first page
  if (currentPage > 3) {
    pages.push(1);
    if (currentPage > 4) {
      pages.push('...');
    }
  }

  // Show pages around current page
  for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
    pages.push(i);
  }

  // Show last page
  if (currentPage < totalPages - 2) {
    if (currentPage < totalPages - 3) {
      pages.push('...');
    }
    pages.push(totalPages);
  }

  return (
    <div className={`pagination ${className}`}>
      <button
        className="pagination-btn prev"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ‹ Previous
      </button>

      <div className="pagination-numbers">
        {pages.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="pagination-dots">...</span>
            ) : (
              <button
                className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      <button
        className="pagination-btn next"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next ›
      </button>
    </div>
  );
};

export default Pagination;
