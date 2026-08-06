import { useState } from 'react'
import {
  CalendarDays,
  LayoutGrid,
  PlusSquare,
  Search,
  UserRound,
} from 'lucide-react'
import './TabBar.css'

const tabs = [
  { id: 'discover', label: 'Discover', icon: LayoutGrid },
  { id: 'plan', label: 'Plan', icon: PlusSquare },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'profile', label: 'Profile', icon: UserRound },
]

export default function TabBar() {
  const [active, setActive] = useState('discover')

  return (
    <nav className="tab-bar" aria-label="Primary">
      <div className="tab-bar__group">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = id === active
          return (
            <button
              key={id}
              type="button"
              className={`tab-bar__item${isActive ? ' tab-bar__item--active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
              onClick={() => setActive(id)}
            >
              <Icon size={22} strokeWidth={1.75} />
            </button>
          )
        })}
      </div>
      <button className="tab-bar__search" type="button" aria-label="Search">
        <Search size={22} strokeWidth={1.75} />
      </button>
    </nav>
  )
}
