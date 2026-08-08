import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { ArrowRight, ChevronLeft, SlidersHorizontal, X } from 'lucide-react'
import MiniCard from '../components/MiniCard'
import BigCard from '../components/BigCard'
import CategoryPills from '../components/CategoryPills'
import Pagination from '../components/Pagination'
import FilterSheet from '../components/FilterSheet'
import { useOpenItinerary } from '../hooks/useOpenItinerary'
import { allItineraries, page2Itineraries, popularItineraries, categories, itineraryMatchesCategory } from '../data/itineraries'
import { profileUser } from '../data/profile'
import { paths } from '../routes/paths'
import './Discover.css'
import './Profile.css'

const POPULAR_FILTERS = [
  { id: 'closeFriend', label: 'Close friend', color: '#46ae24', chipClass: 'profile-chip--close-friend' },
  { id: 'shared', label: 'Shared', color: '#a55fde', chipClass: 'profile-chip--shared' },
  {
    id: 'myTrips',
    label: profileUser.name,
    color: '#198cf8',
    chipClass: 'profile-chip--trips',
    avatar: profileUser.avatar,
  },
  { id: 'others', label: 'Others', color: '#111111', chipClass: 'profile-chip--others' },
]

const DEFAULT_POPULAR_FILTERS = {
  closeFriend: true,
  shared: true,
  myTrips: true,
  others: true,
}

const DESKTOP_QUERY = '(min-width: 1024px)'
const MOBILE_BATCH_SIZE = 16
const DESKTOP_PAGE_SIZE = 12
const ALL_CATEGORY = categories[0]

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

export default function Discover() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const onOpenItinerary = useOpenItinerary()
  const isPopularAll = pathname.startsWith(paths.discoverPopular)
  const isDesktop = useIsDesktop()
  const [page, setPage] = useState(1)
  const [visibleCount, setVisibleCount] = useState(MOBILE_BATCH_SIZE)
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORY)
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

  const filteredFeed = useMemo(() => {
    const source = isDesktop
      ? [...pages[0], ...pages[1]]
      : mobileList
    return source.filter((item) =>
      itineraryMatchesCategory(item, categoryFilter),
    )
  }, [isDesktop, pages, mobileList, categoryFilter])

  const popularVisible = popularItineraries.filter(
    (trip) => filters[trip.filter],
  )

  const desktopPageCount = Math.max(
    1,
    Math.ceil(filteredFeed.length / DESKTOP_PAGE_SIZE),
  )
  const hasMore = visibleCount < filteredFeed.length
  const visibleItems = isDesktop
    ? filteredFeed.slice(
        (page - 1) * DESKTOP_PAGE_SIZE,
        page * DESKTOP_PAGE_SIZE,
      )
    : filteredFeed.slice(0, visibleCount)

  useEffect(() => {
    setPage(1)
    setVisibleCount(MOBILE_BATCH_SIZE)
  }, [categoryFilter])

  useEffect(() => {
    if (page > desktopPageCount) setPage(desktopPageCount)
  }, [page, desktopPageCount])

  useEffect(() => {
    if (isDesktop || isPopularAll || !hasMore) return undefined
    const sentinel = sentinelRef.current
    const root = feedRef.current
    if (!sentinel) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((current) =>
            Math.min(current + MOBILE_BATCH_SIZE, filteredFeed.length),
          )
        }
      },
      { root: root ?? null, rootMargin: '240px 0px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [
    isDesktop,
    hasMore,
    filteredFeed.length,
    visibleCount,
    isPopularAll,
  ])

  function applyFilters() {
    setFilters({ ...draftFilters })
    setFilterOpen(false)
  }

  function removeFilter(id) {
    setFilters((current) => ({ ...current, [id]: false }))
  }

  function onCategoryChange(category) {
    setCategoryFilter(category)
  }

  if (isPopularAll) {
    return (
      <div className="discover">
        <div className="discover__shell discover__shell--all">
          <main className="profile-page__main profile-page__main--all">
            <div className="profile-all__toolbar">
              <button
                type="button"
                className="profile-icon-btn"
                aria-label="Back to Discover"
                onClick={() => navigate(paths.home)}
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
                  {item.avatar ? (
                    <img
                      className="profile-chip__avatar"
                      src={item.avatar}
                      alt=""
                      width={18}
                      height={18}
                    />
                  ) : null}
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
                onClick={() => navigate(paths.discoverPopular)}
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

          <CategoryPills
            active={categoryFilter}
            onChange={onCategoryChange}
            resultCount={filteredFeed.length}
          />

          <section
            className="feed-section"
            aria-label="All itineraries"
            ref={feedRef}
          >
            <div className="section-heading">
              <h2 className="section-title">All itineraries</h2>
              <p className="section-note">Estimated cost per traveler</p>
            </div>
            {visibleItems.length ? (
              <div className="feed">
                {visibleItems.map((itinerary) => (
                  <BigCard
                    key={
                      isDesktop
                        ? `${categoryFilter}-${page}-${itinerary.id}`
                        : `${categoryFilter}-${itinerary.id}`
                    }
                    itinerary={itinerary}
                    onOpen={onOpenItinerary}
                  />
                ))}
              </div>
            ) : (
              <p className="infinite-feed__status">
                No itineraries in this price range yet
              </p>
            )}

            {isDesktop && visibleItems.length ? (
              <Pagination
                page={page}
                pageCount={desktopPageCount}
                onPageChange={setPage}
                label="All itineraries pages"
              />
            ) : null}

            {!isDesktop && visibleItems.length ? (
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
            ) : null}
          </section>
        </main>
      </div>
    </div>
  )
}
