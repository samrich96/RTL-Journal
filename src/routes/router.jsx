import { createBrowserRouter, Navigate } from 'react-router'
import RootLayout from '../layouts/RootLayout'
import MainLayout from '../layouts/MainLayout'
import { paths } from './paths'

function lazyPage(importer) {
  return async () => {
    const module = await importer()
    return { Component: module.default }
  }
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      {
        Component: MainLayout,
        children: [
          {
            index: true,
            lazy: lazyPage(() => import('../pages/Discover')),
          },
          {
            path: 'discover',
            children: [
              {
                index: true,
                element: <Navigate to={paths.home} replace />,
              },
              {
                path: 'popular',
                lazy: lazyPage(() => import('../pages/Discover')),
              },
            ],
          },
          {
            path: 'plan',
            lazy: lazyPage(() => import('../pages/Plan')),
          },
          {
            path: 'calendar',
            lazy: lazyPage(() => import('../pages/Calendar')),
          },
          {
            path: 'profile',
            children: [
              {
                index: true,
                lazy: lazyPage(() => import('../pages/Profile')),
              },
              {
                path: 'itineraries',
                lazy: lazyPage(() => import('../pages/Profile')),
              },
            ],
          },
        ],
      },
      {
        path: 'search',
        lazy: lazyPage(() => import('../pages/Search')),
      },
      {
        path: 'itineraries/:itineraryId',
        lazy: lazyPage(() => import('../pages/ItineraryDetail')),
      },
      {
        path: '*',
        lazy: lazyPage(() => import('../pages/NotFound')),
      },
    ],
  },
])
