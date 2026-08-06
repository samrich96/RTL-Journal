import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { categories } from '../data/itineraries'
import './CategoryPills.css'

export default function CategoryPills() {
  const [active, setActive] = useState(categories[0])

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
              onClick={() => setActive(category)}
            >
              {category}
            </button>
          )
        })}
      </div>
      <div className="categories__results">
        <p>Showing over 1,000 results</p>
        <button className="filter-button" type="button" aria-label="Filter results">
          <SlidersHorizontal size={16} strokeWidth={1.75} />
        </button>
      </div>
    </section>
  )
}
