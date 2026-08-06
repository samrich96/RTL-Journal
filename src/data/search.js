import { popularItineraries, allItineraries } from './itineraries'

export const DEFAULT_RECENT_SEARCHES = [
  'Japan Cherry Blossom',
  'Amalfi Coast road trip',
  'Safari in Kenya',
  'Paris girls weekend',
  'Iceland ring road',
]

function asMiniCard(source, id, title) {
  const { duration: _duration, ...card } = source
  return {
    ...card,
    id,
    ...(title ? { title } : {}),
  }
}

/** Seeded “trending today” cards in the Popular Itineraries mini-card format. */
export const trendingItineraries = [
  asMiniCard(
    allItineraries.find((item) => item.id === 'b9'),
    'trend-1',
    'Tokyo cherry week',
  ),
  asMiniCard(popularItineraries[0], 'trend-2'),
  asMiniCard(allItineraries.find((item) => item.id === 'b12'), 'trend-3'),
  asMiniCard(
    allItineraries.find((item) => item.id === 'b14'),
    'trend-4',
    'Bali temple hopping',
  ),
  asMiniCard(popularItineraries[1], 'trend-5'),
]

const STORAGE_KEY = 'rtl-journal-recent-searches'

export function loadRecentSearches() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return [...DEFAULT_RECENT_SEARCHES]
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [...DEFAULT_RECENT_SEARCHES]
    }
    return parsed.slice(0, 5)
  } catch {
    return [...DEFAULT_RECENT_SEARCHES]
  }
}

export function saveRecentSearch(term) {
  const cleaned = term.trim()
  if (!cleaned) return loadRecentSearches()

  const next = [
    cleaned,
    ...loadRecentSearches().filter(
      (item) => item.toLowerCase() !== cleaned.toLowerCase(),
    ),
  ].slice(0, 5)

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ignore quota / private mode
  }

  return next
}
