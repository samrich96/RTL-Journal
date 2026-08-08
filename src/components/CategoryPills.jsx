import { SlidersHorizontal, X } from 'lucide-react'
import { categories } from '../data/itineraries'
import './CategoryPills.css'

const ALL_CATEGORY = categories[0]

export default function CategoryPills({
  active = ALL_CATEGORY,
  onChange,
  onOpenFilters,
  activeChips = [],
  onRemoveChip,
  resultCount,
}) {
  function selectCategory(category) {
    onChange?.(category)
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
      {activeChips.length ? (
        <div className="categories__active-filters" aria-label="Active filters">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              className="categories__range-chip"
              onClick={() => onRemoveChip?.(chip)}
              aria-label={`Clear ${chip.label} filter`}
            >
              {chip.flag ? (
                <img
                  className="categories__range-chip-flag"
                  src={chip.flag}
                  alt=""
                  width={16}
                  height={16}
                />
              ) : null}
              <span>{chip.label}</span>
              <X size={14} strokeWidth={2.25} aria-hidden />
            </button>
          ))}
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
        <button
          className="filter-button"
          type="button"
          aria-label="Filter results"
          onClick={onOpenFilters}
        >
          <SlidersHorizontal size={16} strokeWidth={1.75} />
        </button>
      </div>
    </section>
  )
}
