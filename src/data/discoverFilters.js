import { categories, categoryRanges } from './itineraries'

export const tripTypeOptions = [
  { id: 'couple', label: 'Couple', icon: 'heart' },
  { id: 'family', label: 'Family', icon: 'users' },
  { id: 'celebration', label: 'Celebration', icon: 'party' },
  { id: 'solo', label: 'Solo', icon: 'solo' },
  { id: 'adventure', label: 'Adventure', icon: 'mountain' },
  { id: 'business', label: 'Business', icon: 'briefcase' },
  { id: 'shopping', label: 'Shopping', icon: 'shopping' },
  { id: 'hiddenGem', label: 'Hidden gem', icon: 'sparkles' },
]

export const destinationOptions = [
  { id: 'jamaica', label: 'Jamaica', flag: '/assets/profile-flag-0.png', match: ['jamaica'] },
  { id: 'mexico', label: 'Mexico', flag: '/assets/profile-flag-5.png', match: ['mexico'] },
  { id: 'switzerland', label: 'Switzerland', flag: '/assets/swiss-flag.png', match: ['switzerland', 'swiss'] },
  { id: 'kenya', label: 'Kenya', flag: '/assets/flag-2.png', match: ['kenya'] },
  { id: 'japan', label: 'Japan', flag: '/assets/flag-japan.png', match: ['japan', 'tokyo'] },
  { id: 'indonesia', label: 'Indonesia', flag: '/assets/flag-indonesia.png', match: ['bali', 'indonesia'] },
  { id: 'greece', label: 'Greece', flag: '/assets/profile-flag-13.png', match: ['santorini', 'greece'] },
  { id: 'italy', label: 'Italy', flag: '/assets/flag-11.png', match: ['amalfi', 'italy'] },
  { id: 'vietnam', label: 'Vietnam', flag: '/assets/profile-flag-4.png', match: ['vietnam', 'ha long'] },
  { id: 'egypt', label: 'Egypt', flag: '/assets/flag-egypt.png', match: ['egypt'] },
  { id: 'norway', label: 'Norway', flag: '/assets/flag-norway.png', match: ['norway'] },
  { id: 'brazil', label: 'Brazil', flag: '/assets/flag-brazil.png', match: ['rio', 'brazil'] },
  { id: 'scotland', label: 'Scotland', flag: '/assets/flag-scotland.png', match: ['scotland'] },
  { id: 'uae', label: 'UAE', flag: '/assets/flag-uae.png', match: ['dubai', 'uae'] },
  { id: 'croatia', label: 'Croatia', flag: '/assets/flag-croatia.png', match: ['croatia'] },
  { id: 'newzealand', label: 'New Zealand', flag: '/assets/flag-newzealand.png', match: ['zealand'] },
  { id: 'peru', label: 'Peru', flag: '/assets/flag-peru.png', match: ['machu', 'peru'] },
  { id: 'morocco', label: 'Morocco', flag: '/assets/flag-morocco.png', match: ['morocco'] },
  { id: 'nepal', label: 'Nepal', flag: '/assets/flag-nepal.png', match: ['nepal'] },
  { id: 'usa', label: 'USA', flag: '/assets/profile-flag-1.png', match: ['nyc', 'new york'] },
]

export const durationOptions = [
  { id: '1-3', label: '1-3 Days', min: 1, max: 3 },
  { id: '4-7', label: '4-7 Days', min: 4, max: 7 },
  { id: '8-14', label: '8-14 Days', min: 8, max: 14 },
  { id: '15+', label: '15+ Days', min: 15, max: Infinity },
]

export const budgetOptions = categories.map((category) => {
  const range = categoryRanges[category]
  let shortLabel = category
  if (range) {
    const priceLabel =
      range.max === Infinity
        ? range.label
        : range.min === 0
          ? `< $${range.max.toLocaleString('en-US')}`
          : range.label
    shortLabel = `${category} ${priceLabel}`
  } else {
    shortLabel = 'Any budget'
  }
  return {
    id: category,
    label: shortLabel,
    shortLabel,
  }
})

export const EMPTY_DISCOVER_FILTERS = {
  tripTypes: [],
  destinations: [],
  durations: [],
  budget: categories[0],
}

export function parseDurationDays(duration) {
  const match = String(duration ?? '').match(/(\d+)/)
  return match ? Number(match[1]) : 0
}

export function itineraryMatchesDiscoverFilters(itinerary, filters) {
  if (!filters) return true

  if (filters.budget && filters.budget !== categories[0]) {
    const range = categoryRanges[filters.budget]
    if (range) {
      const price = Number(String(itinerary.price ?? '').replace(/[^0-9.]/g, '')) || 0
      if (price < range.min || price > range.max) return false
    }
  }

  if (filters.destinations?.length) {
    const haystack = String(itinerary.title ?? '').toLowerCase()
    const matched = filters.destinations.some((id) => {
      const option = destinationOptions.find((item) => item.id === id)
      return option?.match.some((term) => haystack.includes(term))
    })
    if (!matched) return false
  }

  if (filters.durations?.length) {
    const days = parseDurationDays(itinerary.duration)
    const matched = filters.durations.some((id) => {
      const option = durationOptions.find((item) => item.id === id)
      return option && days >= option.min && days <= option.max
    })
    if (!matched) return false
  }

  return true
}

export function getDiscoverFilterChips(filters) {
  const chips = []
  if (!filters) return chips

  if (filters.budget && filters.budget !== categories[0]) {
    const range = categoryRanges[filters.budget]
    if (range) {
      chips.push({
        key: 'budget',
        type: 'budget',
        id: filters.budget,
        label: range.label,
      })
    }
  }

  for (const id of filters.tripTypes ?? []) {
    const option = tripTypeOptions.find((item) => item.id === id)
    if (option) {
      chips.push({
        key: `trip-${id}`,
        type: 'tripType',
        id,
        label: option.label,
      })
    }
  }

  for (const id of filters.destinations ?? []) {
    const option = destinationOptions.find((item) => item.id === id)
    if (option) {
      chips.push({
        key: `destination-${id}`,
        type: 'destination',
        id,
        label: option.label,
        flag: option.flag,
      })
    }
  }

  for (const id of filters.durations ?? []) {
    const option = durationOptions.find((item) => item.id === id)
    if (option) {
      chips.push({
        key: `duration-${id}`,
        type: 'duration',
        id,
        label: option.label,
      })
    }
  }

  return chips
}

export function removeDiscoverFilterChip(filters, chip) {
  const next = {
    tripTypes: [...(filters?.tripTypes ?? [])],
    destinations: [...(filters?.destinations ?? [])],
    durations: [...(filters?.durations ?? [])],
    budget: filters?.budget ?? categories[0],
  }

  if (chip.type === 'tripType') {
    next.tripTypes = next.tripTypes.filter((item) => item !== chip.id)
  } else if (chip.type === 'destination') {
    next.destinations = next.destinations.filter((item) => item !== chip.id)
  } else if (chip.type === 'duration') {
    next.durations = next.durations.filter((item) => item !== chip.id)
  } else if (chip.type === 'budget') {
    next.budget = categories[0]
  }

  return next
}
