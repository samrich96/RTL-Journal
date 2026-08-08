import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Briefcase,
  ChevronDown,
  ChevronLeft,
  CircleDollarSign,
  Heart,
  Hourglass,
  Mountain,
  PartyPopper,
  Search,
  ShoppingBag,
  Sparkles,
  UserRound,
  Users,
  X,
} from 'lucide-react'
import {
  budgetOptions,
  destinationOptions,
  durationOptions,
  EMPTY_DISCOVER_FILTERS,
  tripTypeOptions,
} from '../data/discoverFilters'
import './DiscoverFilters.css'

const TRIP_ICONS = {
  heart: Heart,
  users: Users,
  party: PartyPopper,
  solo: UserRound,
  mountain: Mountain,
  briefcase: Briefcase,
  shopping: ShoppingBag,
  sparkles: Sparkles,
}

function cloneFilters(value) {
  return {
    tripTypes: [...(value?.tripTypes ?? [])],
    destinations: [...(value?.destinations ?? [])],
    durations: [...(value?.durations ?? [])],
    budget: value?.budget ?? EMPTY_DISCOVER_FILTERS.budget,
  }
}

export default function DiscoverFilters({ open, value, onClose, onApply }) {
  const [draft, setDraft] = useState(() => cloneFilters(value))
  const [destinationQuery, setDestinationQuery] = useState('')
  const [openMenu, setOpenMenu] = useState(null)
  const wasOpenRef = useRef(false)

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setDraft(cloneFilters(value))
      setDestinationQuery('')
      setOpenMenu(null)
    }
    wasOpenRef.current = open

    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open, value])

  const selectedDestinations = useMemo(
    () =>
      destinationOptions.filter((option) =>
        draft.destinations.includes(option.id),
      ),
    [draft.destinations],
  )

  const selectedDurations = useMemo(
    () =>
      durationOptions.filter((option) => draft.durations.includes(option.id)),
    [draft.durations],
  )

  const filteredDestinations = useMemo(() => {
    const needle = destinationQuery.trim().toLowerCase()
    return destinationOptions.filter((option) => {
      if (draft.destinations.includes(option.id)) return false
      if (!needle) return true
      return option.label.toLowerCase().includes(needle)
    })
  }, [destinationQuery, draft.destinations])

  const budgetLabel =
    budgetOptions.find((option) => option.id === draft.budget)?.shortLabel ??
    'Any budget'

  if (!open) return null

  function toggleTripType(id) {
    setDraft((current) => {
      const exists = current.tripTypes.includes(id)
      return {
        ...current,
        tripTypes: exists
          ? current.tripTypes.filter((item) => item !== id)
          : [...current.tripTypes, id],
      }
    })
  }

  function toggleDestination(id) {
    setDraft((current) => {
      const exists = current.destinations.includes(id)
      return {
        ...current,
        destinations: exists
          ? current.destinations.filter((item) => item !== id)
          : [...current.destinations, id],
      }
    })
    setDestinationQuery('')
    setOpenMenu(null)
  }

  function toggleDuration(id) {
    setDraft((current) => {
      const exists = current.durations.includes(id)
      return {
        ...current,
        durations: exists
          ? current.durations.filter((item) => item !== id)
          : [...current.durations, id],
      }
    })
  }

  function selectBudget(id) {
    setDraft((current) => ({ ...current, budget: id }))
    setOpenMenu(null)
  }

  function resetDraft() {
    setDraft(cloneFilters(EMPTY_DISCOVER_FILTERS))
    setDestinationQuery('')
    setOpenMenu(null)
  }

  return (
    <div className="discover-filters" role="dialog" aria-modal="true" aria-label="Filter by">
      <div className="discover-filters__shell">
        <header className="discover-filters__header">
          <button
            type="button"
            className="discover-filters__back"
            aria-label="Close filters"
            onClick={onClose}
          >
            <ChevronLeft size={22} strokeWidth={2} aria-hidden />
          </button>
          <h1 className="discover-filters__title">Filter by</h1>
          <button
            type="button"
            className="discover-filters__reset"
            onClick={resetDraft}
          >
            Reset
          </button>
        </header>

        <div className="discover-filters__body">
          <section className="discover-filters__section" aria-labelledby="filter-categories">
            <h2 id="filter-categories" className="discover-filters__section-title">
              Categories
            </h2>
            <div className="discover-filters__chips">
              {tripTypeOptions.map((option) => {
                const Icon = TRIP_ICONS[option.icon]
                const active = draft.tripTypes.includes(option.id)
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`discover-filters__chip${
                      active ? ' discover-filters__chip--active' : ''
                    }`}
                    aria-pressed={active}
                    onClick={() => toggleTripType(option.id)}
                  >
                    <Icon size={16} strokeWidth={active ? 2.25 : 1.75} aria-hidden />
                    <span>{option.label}</span>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="discover-filters__section" aria-labelledby="filter-destination">
            <h2 id="filter-destination" className="discover-filters__section-title">
              Destination
            </h2>
            <div className="discover-filters__field-wrap">
              <label className="discover-filters__field">
                <Search size={20} strokeWidth={1.75} aria-hidden />
                <input
                  type="search"
                  value={destinationQuery}
                  placeholder="Search country"
                  aria-expanded={openMenu === 'destination'}
                  onChange={(event) => {
                    setDestinationQuery(event.target.value)
                    setOpenMenu('destination')
                  }}
                  onFocus={() => setOpenMenu('destination')}
                />
                <button
                  type="button"
                  className="discover-filters__caret"
                  aria-label="Browse destinations"
                  onClick={() =>
                    setOpenMenu((current) =>
                      current === 'destination' ? null : 'destination',
                    )
                  }
                >
                  <ChevronDown size={20} strokeWidth={1.75} aria-hidden />
                </button>
              </label>
              {openMenu === 'destination' ? (
                <ul className="discover-filters__menu" role="listbox">
                  {filteredDestinations.length ? (
                    filteredDestinations.map((option) => (
                      <li key={option.id}>
                        <button
                          type="button"
                          role="option"
                          onClick={() => toggleDestination(option.id)}
                        >
                          <img src={option.flag} alt="" width={18} height={18} />
                          <span>{option.label}</span>
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="discover-filters__menu-empty">No countries found</li>
                  )}
                </ul>
              ) : null}
            </div>
            {selectedDestinations.length ? (
              <div className="discover-filters__tags">
                {selectedDestinations.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className="discover-filters__tag"
                    onClick={() => toggleDestination(option.id)}
                    aria-label={`Remove ${option.label}`}
                  >
                    <img src={option.flag} alt="" width={15} height={15} />
                    <span>{option.label}</span>
                    <X size={14} strokeWidth={2.25} aria-hidden />
                  </button>
                ))}
              </div>
            ) : null}
          </section>

          <section className="discover-filters__section" aria-labelledby="filter-duration">
            <h2 id="filter-duration" className="discover-filters__section-title">
              Duration
            </h2>
            <div className="discover-filters__field-wrap">
              <button
                type="button"
                className="discover-filters__field discover-filters__field--button"
                aria-expanded={openMenu === 'duration'}
                onClick={() =>
                  setOpenMenu((current) => (current === 'duration' ? null : 'duration'))
                }
              >
                <Hourglass size={20} strokeWidth={1.75} aria-hidden />
                <span className="discover-filters__placeholder">Filter by duration</span>
                <ChevronDown size={20} strokeWidth={1.75} aria-hidden />
              </button>
              {openMenu === 'duration' ? (
                <ul className="discover-filters__menu" role="listbox">
                  {durationOptions.map((option) => {
                    const checked = draft.durations.includes(option.id)
                    return (
                      <li key={option.id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={checked}
                          className={checked ? 'is-selected' : undefined}
                          onClick={() => toggleDuration(option.id)}
                        >
                          <Hourglass size={16} strokeWidth={1.75} aria-hidden />
                          <span>{option.label}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : null}
            </div>
            {selectedDurations.length ? (
              <div className="discover-filters__tags">
                {selectedDurations.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className="discover-filters__tag"
                    onClick={() => toggleDuration(option.id)}
                    aria-label={`Remove ${option.label}`}
                  >
                    <Hourglass size={14} strokeWidth={1.75} aria-hidden />
                    <span>{option.label}</span>
                    <X size={14} strokeWidth={2.25} aria-hidden />
                  </button>
                ))}
              </div>
            ) : null}
          </section>

          <section className="discover-filters__section" aria-labelledby="filter-budget">
            <h2 id="filter-budget" className="discover-filters__section-title">
              Budget
            </h2>
            <div className="discover-filters__field-wrap">
              <button
                type="button"
                className="discover-filters__field discover-filters__field--button"
                aria-expanded={openMenu === 'budget'}
                onClick={() =>
                  setOpenMenu((current) => (current === 'budget' ? null : 'budget'))
                }
              >
                <CircleDollarSign size={20} strokeWidth={1.75} aria-hidden />
                <span
                  className={
                    draft.budget === EMPTY_DISCOVER_FILTERS.budget
                      ? 'discover-filters__placeholder'
                      : undefined
                  }
                >
                  {draft.budget === EMPTY_DISCOVER_FILTERS.budget
                    ? 'Select a budget'
                    : budgetLabel}
                </span>
                <ChevronDown size={20} strokeWidth={1.75} aria-hidden />
              </button>
              {openMenu === 'budget' ? (
                <ul className="discover-filters__menu" role="listbox">
                  {budgetOptions.map((option) => {
                    const checked = draft.budget === option.id
                    return (
                      <li key={option.id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={checked}
                          className={checked ? 'is-selected' : undefined}
                          onClick={() => selectBudget(option.id)}
                        >
                          <CircleDollarSign size={16} strokeWidth={1.75} aria-hidden />
                          <span>{option.shortLabel}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : null}
            </div>
          </section>
        </div>

        <footer className="discover-filters__footer">
          <button
            type="button"
            className="discover-filters__apply"
            onClick={() => onApply?.(cloneFilters(draft))}
          >
            Apply Filter
          </button>
        </footer>
      </div>
    </div>
  )
}
