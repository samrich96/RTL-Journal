import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, ChevronLeft, SlidersHorizontal, X } from 'lucide-react'
import Header from '../components/Header'
import MiniCard from '../components/MiniCard'
import BigCard from '../components/BigCard'
import CategoryPills from '../components/CategoryPills'
import Pagination from '../components/Pagination'
import TabBar from '../components/TabBar'
import FilterSheet from '../components/FilterSheet'
import { allItineraries, page2Itineraries, popularItineraries } from '../data/itineraries'
import './Discover.css'
import './Profile.css'

const POPULAR_FILTERS = [
  { id: 'closeFriend', label: 'Close friend', color: '#46ae24', chipClass: 'profile-chip--close-friend' },
  { id: 'shared', label: 'Shared', color: '#a55fde', chipClass: 'profile-chip--shared' },
  { id: 'myTrips', label: 'My trips', color: '#198cf8', chipClass: 'profile-chip--trips' },
  { id: 'others', label: 'Others', color: '#111111', chipClass: 'profile-chip--others' },
]

const DEFAULT_POPULAR_FILTERS = {
  closeFriend: true,
  shared: true,
  myTrips: true,
  others: true,
}

const PAGE_COUNT = 2
const DESKTOP_QUERY = '(min-width: 1024px)'
const MOBILE_BATCH_SIZE = 16

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(DESKTOP_QUERY).matches
  })

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY)
    const onChange = (event) => setIsDesktop(event.matches)
    setIsDesktop(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return isDesktop
}

export default function Discover({ active = 'discover', onNavigate, onOpenItinerary }) {
  const isDesktop = useIsDesktop()
  const [page, setPage] = useState(1)
  const [visibleCount, setVisibleCount] = useState(MOBILE_BATCH_SIZE)
  const [view, setView] = useState('home')
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState(DEFAULT_POPULAR_FILTERS)
  const [draftFilters, setDraftFilters] = useState(DEFAULT_POPULAR_FILTERS)
  const feedRef = useRef(null)
  const sentinelRef = useRef(null)

  const pages = useMemo(
    () => [allItineraries, page2Itineraries],
    [],
  )

  const mobileList = useMemo(
    () => [
      ...pages[0].map((item) => ({ ...item, id: `m1-${item.id}` })),
      ...pages[1].map((item) => ({ ...item, id: `m2-${item.id}` })),
    ],
    [pages],
  )

  const popularVisible = popularItineraries.filter(
    (trip) => filters[trip.filter],
  )

  const hasMore = visibleCount < mobileList.length
  const desktopItems = pages[page - 1] ?? pages[0]
  const visibleItems = isDesktop
    ? desktopItems
    : mobileList.slice(0, visibleCount)

  useEffect(() => {
    if (!isDesktop || page === 1) return
    feedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [isDesktop, page])

  useEffect(() => {
    if (isDesktop || !hasMore || view !== 'home') return undefined
    const sentinel = sentinelRef.current
    if (!sentinel) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        setVisibleCount((count) =>
          Math.min(count + MOBILE_BATCH_SIZE, mobileList.length),
        )
      },
      { rootMargin: '240px 0px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [isDesktop, hasMore, mobileList.length, visibleCount, view])

  function applyFilters() {
    setFilters({ ...draftFilters })
    setFilterOpen(false)
  }

  function removeFilter(id) {
    setFilters((current) => ({ ...current, [id]: false }))
  }

  if (view === 'popularAll') {
    return (
      <div className="discover">
        <Header active={active} onNavigate={onNavigate} />
        <div className="discover__shell discover__shell--all">
          <main className="profile-page__main profile-page__main--all">
            <div className="profile-all__toolbar">
              <button
                type="button"
                className="profile-icon-btn"
                aria-label="Back to Discover"
                onClick={() => setView('home')}
              >
                <ChevronLeft size={20} strokeWidth={2} />
              </button>
              <h1>Popular itineraries</h1>
              <button
                type="button"
                className="profile-icon-btn"
                aria-label="Filter itineraries"
                onClick={() => {
                  setDraftFilters(filters)
                  setFilterOpen(true)
                }}
              >
                <SlidersHorizontal size={18} strokeWidth={1.75} />
              </button>
            </div>

            <div className="profile-all__chips">
              {POPULAR_FILTERS.filter((item) => filters[item.id]).map((item) => (
                <span key={item.id} className={`profile-chip ${item.chipClass}`}>
                  {item.label}
                  <button
                    type="button"
                    aria-label={`Remove ${item.label}`}
                    onClick={() => removeFilter(item.id)}
                  >
                    <X size={13} strokeWidth={2.5} />
                  </button>
                </span>
              ))}
            </div>
            <p className="profile-all__count">
              Showing {popularVisible.length} popular trips
            </p>

            <div className="profile-all__feed">
              {popularVisible.map((trip) => (
                <BigCard
                  key={trip.id}
                  itinerary={trip}
                  onOpen={onOpenItinerary}
                />
              ))}
            </div>
          </main>
        </div>
        <TabBar active={active} onNavigate={onNavigate} />

        <FilterSheet
          open={filterOpen}
          label="Filter itineraries"
          options={POPULAR_FILTERS}
          values={draftFilters}
          onToggle={(id) =>
            setDraftFilters((current) => ({
              ...current,
              [id]: !current[id],
            }))
          }
          onClose={() => setFilterOpen(false)}
          onApply={applyFilters}
        />
      </div>
    )
  }

  return (
    <div className="discover">
      <Header active={active} onNavigate={onNavigate} />
      <div className="discover__shell">
        <main className="discover__main">
          <section className="page-intro">
            <div className="page-intro__copy">
              <p className="page-intro__eyebrow">Travel planning</p>
              <h1 className="page-intro__title">Discover places through real itineraries</h1>
              <p className="page-intro__subtitle">Browse • Plan • Travel</p>
            </div>
          </section>

          <section className="popular">
            <div className="section-heading">
              <h2 className="section-title">Popular itineraries</h2>
              <button
                className="section-link"
                type="button"
                onClick={() => setView('popularAll')}
              >
                View all
                <ArrowRight size={16} strokeWidth={2} aria-hidden />
              </button>
            </div>
            <div className="popular__grid">
              {popularItineraries.map((itinerary) => (
                <MiniCard
                  key={itinerary.id}
                  itinerary={itinerary}
                  onOpen={onOpenItinerary}
                />
              ))}
            </div>
          </section>

          <CategoryPills />

          <section
            className="feed-section"
            aria-label="All itineraries"
            ref={feedRef}
          >
            <div className="section-heading">
              <h2 className="section-title">All itineraries</h2>
              <p className="section-note">Estimated cost per traveler</p>
            </div>
            <div className="feed">
              {visibleItems.map((itinerary) => (
                <BigCard
                  key={isDesktop ? `${page}-${itinerary.id}` : itinerary.id}
                  itinerary={itinerary}
                  onOpen={onOpenItinerary}
                />
              ))}
            </div>

            {isDesktop ? (
              <Pagination
                page={page}
                pageCount={PAGE_COUNT}
                onPageChange={setPage}
                label="All itineraries pages"
              />
            ) : (
              <div className="infinite-feed" aria-live="polite">
                {hasMore ? (
                  <>
                    <div ref={sentinelRef} className="infinite-feed__sentinel" />
                    <p className="infinite-feed__status">Scroll for more itineraries</p>
                  </>
                ) : (
                  <p className="infinite-feed__status">You’ve reached the end</p>
                )}
              </div>
            )}
          </section>
        </main>
      </div>
      <TabBar active={active} onNavigate={onNavigate} />
    </div>
  )
}
