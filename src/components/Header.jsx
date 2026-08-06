import { Bell, BookOpen } from 'lucide-react'
import './Header.css'

export default function Header() {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <img
          className="app-header__logo"
          src="/assets/logo.png"
          alt="RTL Journal"
          width={45}
          height={38}
        />
        <span className="app-header__title">RTL Journal</span>
      </div>
      <div className="app-header__actions">
        <button className="icon-button" type="button" aria-label="Guidebook">
          <BookOpen size={20} strokeWidth={1.75} />
        </button>
        <button className="icon-button" type="button" aria-label="Notifications">
          <Bell size={20} strokeWidth={1.75} />
        </button>
      </div>
    </header>
  )
}
