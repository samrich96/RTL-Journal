import { NavLink } from 'react-router'
import {
  CalendarDays,
  LayoutGrid,
  PlusSquare,
  Search,
  UserRound,
} from 'lucide-react'
import { paths } from '../routes/paths'
import './TabBar.css'

const tabs = [
  { id: 'discover', label: 'Discover', to: paths.discover, icon: LayoutGrid },
  { id: 'plan', label: 'Plan', to: paths.plan, icon: PlusSquare },
  { id: 'calendar', label: 'Calendar', to: paths.calendar, icon: CalendarDays },
  { id: 'profile', label: 'Profile', to: paths.profile, icon: UserRound },
  { id: 'search', label: 'Search', to: paths.search, icon: Search },
]

export default function TabBar({ active = 'discover' }) {
  return (
    <nav className="mobile-nav" aria-label="Mobile primary">
      {tabs.map(({ id, label, to, icon: Icon }) => (
        <NavLink
          key={id}
          to={to}
          end={id === 'discover' || id === 'profile'}
          className={({ isActive }) =>
            `mobile-nav__item${
              isActive || active === id ? ' mobile-nav__item--active' : ''
            }`
          }
          aria-current={active === id ? 'page' : undefined}
        >
          <Icon size={20} strokeWidth={1.75} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
