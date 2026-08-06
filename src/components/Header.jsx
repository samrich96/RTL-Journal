import {
  Bell,
  CalendarDays,
  LayoutGrid,
  Map,
  PlusSquare,
  Search,
  UserRound,
} from 'lucide-react'
import './Header.css'

const navItems = [
  { id: 'discover', label: 'Discover', icon: LayoutGrid },
  { id: 'plan', label: 'Plan', icon: PlusSquare },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'profile', label: 'Profile', icon: UserRound },
]

export default function Header({ active = 'discover', onNavigate }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <button
          className="site-header__brand"
          type="button"
          onClick={() => onNavigate?.('discover')}
        >
          <img
            className="site-header__logo"
            src="/assets/logo.png"
            alt=""
            height={56}
          />
          <span className="site-header__title">RTL Journal</span>
        </button>

        <nav className="site-header__nav" aria-label="Primary">
          {navItems.map(({ id, label }) => {
            const isActive = id === active
            return (
              <button
                key={id}
                type="button"
                className={`site-header__link${isActive ? ' site-header__link--active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onNavigate?.(id)}
              >
                {label}
              </button>
            )
          })}
        </nav>

        <div className="site-header__tools">
          {active === 'discover' ? (
            <button
              type="button"
              className="site-header__search"
              onClick={() => onNavigate?.('search')}
            >
              <Search size={18} strokeWidth={1.75} aria-hidden />
              <span>Search itineraries</span>
            </button>
          ) : null}
          {active === 'discover' ? (
            <button className="icon-button" type="button" aria-label="Map">
              <Map size={20} strokeWidth={1.75} />
            </button>
          ) : null}
          <button className="icon-button" type="button" aria-label="Notifications">
            <Bell size={20} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </header>
  )
}
