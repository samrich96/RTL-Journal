import { X } from 'lucide-react'
import { categories, categoryRanges } from '../data/itineraries'
import './CategoryPills.css'

const ALL_CATEGORY = categories[0]

export default function CategoryPills({
  active = ALL_CATEGORY,
  onChange,
  resultCount,
}) {
  const range = categoryRanges[active]
  const isFiltered = Boolean(range)

  function selectCategory(category) {
    onChange?.(category)
  }

  function clearFilter() {
    onChange?.(ALL_CATEGORY)
  }

  return (
    <section className="categories">
      <div className="section-heading">
        <h2 className="section-title">Categories</h2>
      </div>
      <div className="categories__scroll" role="tablist" aria-label="Itinerary categories">
        {categories.map((category) => {
          const isActive = category === active
          return (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`category-pill${isActive ? ' category-pill--active' : ''}`}
              onClick={() => selectCategory(category)}
            >
              {category}
            </button>
          )
        })}
      </div>
      {isFiltered ? (
        <div className="categories__active-filters" aria-label="Active filters">
          <button
            type="button"
            className="categories__range-chip"
            onClick={clearFilter}
            aria-label={`Clear ${active} filter`}
          >
            <span>{range.label}</span>
            <X size={14} strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      ) : null}
      <div className="categories__results">
        <p>
          {typeof resultCount === 'number' && resultCount > 1000
            ? 'Showing over 1,000 results'
            : `Showing ${(resultCount ?? 0).toLocaleString('en-US')} result${
                resultCount === 1 ? '' : 's'
              }`}
        </p>
      </div>
    </section>
  )
}
