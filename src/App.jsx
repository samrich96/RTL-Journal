import { RouterProvider } from 'react-router'
import { router } from './routes/router'

function RouteFallback() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        color: '#717171',
        fontSize: '0.95rem',
      }}
    >
      Loading…
    </div>
  )
}

export default function App() {
  return <RouterProvider router={router} fallbackElement={<RouteFallback />} />
}
