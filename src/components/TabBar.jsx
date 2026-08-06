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

export default function TabBar({ active = 'discover', onNavigate }) {
  return (
    <nav className="mobile-nav" aria-label="Mobile primary">
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = id === active
        return (
          <button
            key={id}
            type="button"
            className={`mobile-nav__item${isActive ? ' mobile-nav__item--active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onNavigate?.(id)}
          >
            <Icon size={20} strokeWidth={1.75} />
            <span>{label}</span>
          </button>
        )
      })}
      <button
        className={`mobile-nav__item${active === 'search' ? ' mobile-nav__item--active' : ''}`}
        type="button"
        aria-current={active === 'search' ? 'page' : undefined}
        onClick={() => onNavigate?.('search')}
      >
        <Search size={20} strokeWidth={1.75} />
        <span>Search</span>
      </button>
    </nav>
  )
}
