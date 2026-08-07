import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Clock3, Search as SearchIcon, TrendingUp, X } from 'lucide-react'
import TabBar from '../components/TabBar'
import MiniCard from '../components/MiniCard'
import {
  loadRecentSearches,
  saveRecentSearch,
  trendingItineraries,
} from '../data/search'
import { useOpenItinerary } from '../hooks/useOpenItinerary'
import { paths } from '../routes/paths'
import { allItineraries, popularItineraries } from '../data/itineraries'
import './Search.css'

const TABLET_MAX = 1023

function useShouldAutofocus() {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.matchMedia(`(max-width: ${TABLET_MAX}px)`).matches
  })

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${TABLET_MAX}px)`)
    const onChange = (event) => setEnabled(event.matches)
    setEnabled(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return enabled
}

export default function Search() {
  const navigate = useNavigate()
  const onOpenItinerary = useOpenItinerary()
  const inputRef = useRef(null)
  const shouldAutofocus = useShouldAutofocus()
  const [query, setQuery] = useState('')
  const [recentSearches, setRecentSearches] = useState(() =>
    loadRecentSearches(),
  )

  useEffect(() => {
    if (!shouldAutofocus) return undefined

    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [shouldAutofocus])

  const suggestions = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return recentSearches

    const pool = [
      ...recentSearches,
      ...popularItineraries.map((item) => item.title),
      ...allItineraries.map((item) => item.title),
    ]

    const seen = new Set()
    return pool
      .filter((term) => {
        const key = term.toLowerCase()
        if (seen.has(key) || !key.includes(needle)) return false
        seen.add(key)
        return true
      })
      .slice(0, 5)
  }, [query, recentSearches])

  function commitSearch(term) {
    const next = saveRecentSearch(term)
    setRecentSearches(next)
    setQuery(term)
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!query.trim()) return
    commitSearch(query)
  }

  function handleClose() {
    if (window.history.length > 1) navigate(-1)
    else navigate(paths.home)
  }

  const showIdleSections = query.trim().length === 0

  return (
    <div className="search-page">
      <div className="search-page__shell">
        <form className="search-page__bar" onSubmit={handleSubmit} role="search">
          <label className="search-page__field">
            <SearchIcon size={18} strokeWidth={1.75} aria-hidden />
            <input
              ref={inputRef}
              type="search"
              name="q"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Search destinations, trips…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search itineraries"
            />
            {query ? (
              <button
                type="button"
                className="search-page__clear"
                aria-label="Clear search"
                onClick={() => {
                  setQuery('')
                  inputRef.current?.focus()
                }}
              >
                <X size={16} strokeWidth={2} />
              </button>
            ) : null}
          </label>
          <button
            type="button"
            className="search-page__close"
            aria-label="Close search"
            onClick={handleClose}
          >
            <X size={20} strokeWidth={2} />
          </button>
        </form>

        <main className="search-page__main">
          {showIdleSections ? (
            <>
              <section className="search-section" aria-label="Popular search">
                <div className="section-heading">
                  <h2 className="section-title">Popular search</h2>
                </div>
                <ul className="search-suggestions">
                  {recentSearches.map((term) => (
                    <li key={term}>
                      <button
                        type="button"
                        className="search-suggestions__item"
                        onClick={() => commitSearch(term)}
                      >
                        <Clock3 size={16} strokeWidth={1.75} aria-hidden />
                        <span>{term}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="search-section" aria-label="Trending itineraries">
                <div className="section-heading">
                  <h2 className="section-title">Trending itineraries</h2>
                  <p className="section-note">Hot today</p>
                </div>
                <div className="search-trending">
                  {trendingItineraries.map((itinerary) => (
                    <MiniCard
                      key={itinerary.id}
                      itinerary={itinerary}
                      onOpen={onOpenItinerary}
                    />
                  ))}
                </div>
              </section>
            </>
          ) : (
            <section className="search-section" aria-label="Suggestions">
              <div className="section-heading">
                <h2 className="section-title">Suggestions</h2>
              </div>
              {suggestions.length === 0 ? (
                <p className="search-empty">No matches for “{query.trim()}”.</p>
              ) : (
                <ul className="search-suggestions">
                  {suggestions.map((term) => (
                    <li key={term}>
                      <button
                        type="button"
                        className="search-suggestions__item"
                        onClick={() => commitSearch(term)}
                      >
                        <TrendingUp size={16} strokeWidth={1.75} aria-hidden />
                        <span>{term}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </main>
      </div>
      <TabBar active="search" />
    </div>
  )
}
