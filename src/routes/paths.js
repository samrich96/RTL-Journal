/** Central path helpers for clean, future-proof URLs */
export const paths = {
  home: '/',
  discover: '/',
  discoverPopular: '/discover/popular',
  plan: '/plan',
  calendar: '/calendar',
  profile: '/profile',
  profileItineraries: '/profile/itineraries',
  search: '/search',
  notifications: '/notifications',
  itinerary: (itineraryId) => `/itineraries/${itineraryId}`,
}

export function navIdFromPathname(pathname) {
  if (pathname.startsWith('/plan')) return 'plan'
  if (pathname.startsWith('/calendar')) return 'calendar'
  if (pathname.startsWith('/profile')) return 'profile'
  if (pathname.startsWith('/search')) return 'search'
  if (pathname.startsWith('/notifications')) return 'discover'
  if (pathname.startsWith('/itineraries')) return 'discover'
  return 'discover'
}
