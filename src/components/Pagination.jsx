import { ChevronLeft, ChevronRight } from 'lucide-react'
import './Pagination.css'

function getPageNumbers(current, total) {
  if (total <= 5) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  if (current <= 3) {
    return [1, 2, 3, 4, '…', total]
  }

  if (current >= total - 2) {
    return [1, '…', total - 3, total - 2, total - 1, total]
  }

  return [1, '…', current - 1, current, current + 1, '…', total]
}

export default function Pagination({
  page,
  pageCount,
  onPageChange,
  label = 'Pagination',
}) {
  if (pageCount <= 1) return null

  const pages = getPageNumbers(page, pageCount)

  return (
    <nav className="pagination" aria-label={label}>
      <button
        type="button"
        className="pagination__control"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft size={18} strokeWidth={2} aria-hidden />
        <span>Previous</span>
      </button>

      <ol className="pagination__pages">
        {pages.map((item, index) => {
          if (item === '…') {
            return (
              <li key={`ellipsis-${index}`} className="pagination__ellipsis" aria-hidden>
                …
              </li>
            )
          }

          const isActive = item === page
          return (
            <li key={item}>
              <button
                type="button"
                className={`pagination__page${isActive ? ' pagination__page--active' : ''}`}
                onClick={() => onPageChange(item)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Page ${item}`}
              >
                {item}
              </button>
            </li>
          )
        })}
      </ol>

      <button
        type="button"
        className="pagination__control"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Next page"
      >
        <span>Next</span>
        <ChevronRight size={18} strokeWidth={2} aria-hidden />
      </button>
    </nav>
  )
}
