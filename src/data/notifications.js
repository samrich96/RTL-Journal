import { allItineraries } from './itineraries'

const africaTrip =
  allItineraries.find((item) => item.title.includes('30th in Africa')) ?? {
    id: 'b5',
    title: 'Sam’s 30th in Africa',
    image: '/assets/big-5.png',
    avatar: '/assets/profile-avatar.png',
    author: 'Samantha Richards',
    badge: 'crown',
    flags: ['/assets/flag-8.png', '/assets/flag-7.png', '/assets/flag-1.png'],
    price: '8,750',
    duration: '18 Days',
  }

const switzerlandTrip =
  allItineraries.find((item) => item.title === 'Switzerland Baecation') ?? {
    id: 'b2',
    title: 'Switzerland Baecation',
    image: '/assets/big-2.png',
    avatar: '/assets/avatar-alysa.png',
    author: 'Alysa Jayaramam',
    badge: 'star',
    flags: ['/assets/flag-5.png'],
    price: '3,875',
    duration: '5 Days',
  }

/** Demo “now” for relative Today labeling (matches app session date). */
export const NOTIFICATIONS_NOW = new Date(2026, 7, 7, 18, 0, 0)

export const notifications = [
  {
    id: 'n1',
    createdAt: '2026-08-07T14:22:00',
    type: 'closeFriendRequest',
    actor: {
      name: 'Nithin Bedasi',
      avatar: '/assets/avatar-nithin.png',
    },
    body: 'requested to be close friend',
  },
  {
    id: 'n2',
    createdAt: '2026-08-07T11:05:00',
    type: 'upcomingTrip',
    actor: {
      name: 'Alysa Jayaramam',
      avatar: '/assets/swiss-av-2.png',
    },
    daysUntil: 5,
    itinerary: switzerlandTrip,
  },
  {
    id: 'n3',
    createdAt: '2026-08-07T09:18:00',
    type: 'wishlist',
    actor: {
      name: 'Diego Vargas',
      avatar: '/assets/avatar-ellipse695.png',
    },
    itinerary: africaTrip,
  },
  {
    id: 'n4',
    createdAt: '2026-08-06T20:41:00',
    type: 'wishlist',
    actor: {
      name: 'June Hernando',
      avatar: '/assets/avatar-june.png',
    },
    itinerary: africaTrip,
  },
  {
    id: 'n5',
    createdAt: '2026-08-06T16:12:00',
    type: 'featured',
    itinerary: africaTrip,
  },
  {
    id: 'n6',
    createdAt: '2026-08-06T10:03:00',
    type: 'profileView',
    actor: {
      name: 'Stacy Analese',
      avatar: '/assets/avatar-ellipse688.png',
    },
  },
]

function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function formatNotificationTime(iso, now = NOTIFICATIONS_NOW) {
  const date = new Date(iso)
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
  const dayStart = startOfLocalDay(date).getTime()
  const todayStart = startOfLocalDay(now).getTime()
  if (dayStart === todayStart) return time
  return time
}

export function formatNotificationDayLabel(iso, now = NOTIFICATIONS_NOW) {
  const date = new Date(iso)
  const dayStart = startOfLocalDay(date).getTime()
  const todayStart = startOfLocalDay(now).getTime()
  if (dayStart === todayStart) return 'Today'

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function groupNotificationsByDay(
  items = notifications,
  now = NOTIFICATIONS_NOW,
) {
  const groups = []
  const indexByKey = new Map()

  const sorted = [...items].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  )

  for (const item of sorted) {
    const label = formatNotificationDayLabel(item.createdAt, now)
    const key = startOfLocalDay(new Date(item.createdAt)).toISOString()
    if (!indexByKey.has(key)) {
      indexByKey.set(key, groups.length)
      groups.push({ key, label, items: [] })
    }
    groups[indexByKey.get(key)].items.push(item)
  }

  return groups
}
