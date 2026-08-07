import { Outlet } from 'react-router'
import './RootLayout.css'

export default function RootLayout() {
  return (
    <div className="app-root">
      <Outlet />
    </div>
  )
}
