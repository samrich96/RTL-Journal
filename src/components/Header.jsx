import { NavLink, useNavigate } from 'react-router'
import {
  Bell,
  CalendarDays,
  LayoutGrid,
  PlusSquare,
  Search,
  UserRound,
} from 'lucide-react'
import { paths } from '../routes/paths'
import './Header.css'

const navItems = [
  { id: 'discover', label: 'Discover', to: paths.discover, icon: LayoutGrid },
  { id: 'plan', label: 'Plan', to: paths.plan, icon: PlusSquare },
  { id: 'calendar', label: 'Calendar', to: paths.calendar, icon: CalendarDays },
  { id: 'profile', label: 'Profile', to: paths.profile, icon: UserRound },
]

export default function Header({ active = 'discover' }) {
  const navigate = useNavigate()

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <NavLink className="site-header__brand" to={paths.home}>
          <img
            className="site-header__logo"
            src="/assets/logo.png"
            alt=""
            height={56}
          />
          <span className="site-header__title">RTL Journal</span>
        </NavLink>

        <nav className="site-header__nav" aria-label="Primary">
          {navItems.map(({ id, label, to }) => (
            <NavLink
              key={id}
              to={to}
              end={id === 'discover'}
              className={({ isActive }) =>
                `site-header__link${
                  isActive || active === id ? ' site-header__link--active' : ''
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="site-header__tools">
          {active === 'discover' ? (
            <button
              type="button"
              className="site-header__search"
              onClick={() => navigate(paths.search)}
            >
              <Search size={18} strokeWidth={1.75} aria-hidden />
              <span>Search itineraries</span>
            </button>
          ) : null}
          {/* Map icon hidden for initial release — not building map discovery yet.
              Re-enable with: import { Map } from 'lucide-react'
          {active === 'discover' ? (
            <button className="icon-button" type="button" aria-label="Map">
              <Map size={20} strokeWidth={1.75} />
            </button>
          ) : null}
          */}
          <button
            className="icon-button"
            type="button"
            aria-label="Notifications"
            onClick={() => navigate(paths.notifications)}
          >
            <Bell size={20} strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </header>
  )
}
