import { Outlet, useLocation } from 'react-router'
import Header from '../components/Header'
import TabBar from '../components/TabBar'
import { navIdFromPathname } from '../routes/paths'

export default function MainLayout() {
  const { pathname } = useLocation()
  const active = navIdFromPathname(pathname)

  return (
    <>
      <Header active={active} />
      <Outlet />
      <TabBar active={active} />
    </>
  )
}
