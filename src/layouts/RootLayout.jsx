import { Outlet } from 'react-router'
import { useShareMeta } from '../hooks/useShareMeta'
import './RootLayout.css'

export default function RootLayout() {
  useShareMeta()

  return (
    <div className="app-root">
      <Outlet />
    </div>
  )
}
