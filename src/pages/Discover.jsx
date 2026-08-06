import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import Header from '../components/Header'
import MiniCard from '../components/MiniCard'
import BigCard from '../components/BigCard'
import CategoryPills from '../components/CategoryPills'
import Pagination from '../components/Pagination'
import TabBar from '../components/TabBar'
import { allItineraries, popularItineraries } from '../data/itineraries'
import './Discover.css'

const PAGE_COUNT = 2
const DESKTOP_QUERY = '(min-width: 1024px)'
const MOBILE_BATCH_SIZE = 16

function shuffleItems(items) {
  const next = [...items]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  }
  return next
}

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
  const feedRef = useRef(null)
  const sentinelRef = useRef(null)

  const pages = useMemo(
    () => [
      allItineraries,
      shuffleItems(allItineraries),
    ],
    [],
  )

  const mobileList = useMemo(
    () => [
      ...pages[0].map((item) => ({ ...item, id: `m1-${item.id}` })),
      ...pages[1].map((item) => ({ ...item, id: `m2-${item.id}` })),
    ],
    [pages],
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
    if (isDesktop || !hasMore) return undefined
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
  }, [isDesktop, hasMore, mobileList.length, visibleCount])

  return (
    <div className="discover">
      <Header active={active} onNavigate={onNavigate} />
      <div className="discover__shell">
        <main className="discover__main">
          <section className="page-intro">
            <div className="page-intro__copy">
              <p className="page-intro__eyebrow">Travel planning</p>
              <h1 className="page-intro__title">Discover itineraries worth taking</h1>
              <p className="page-intro__subtitle">
                Browse curated trips from the community, filter by vibe, and find your next
                adventure across every budget.
              </p>
            </div>
          </section>

          <section className="popular">
            <div className="section-heading">
              <h2 className="section-title">Popular Itineraries</h2>
              <button className="section-link" type="button">
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
              <p className="section-note">Displaying total cost per person</p>
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
