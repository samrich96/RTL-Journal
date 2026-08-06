import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Flag,
  Heart,
  LogOut,
  Settings,
  Share,
  Shield,
  SlidersHorizontal,
  SquareArrowOutUpRight,
  Star,
  X,
} from 'lucide-react'
import Header from '../components/Header'
import TabBar from '../components/TabBar'
import MiniCard from '../components/MiniCard'
import BigCard from '../components/BigCard'
import {
  profileAllPreview,
  profileItineraries,
  profileLodging,
  profileSettings,
  profileTopTrips,
  profileUser,
} from '../data/profile'
import './Profile.css'

const SEGMENTS = [
  { id: 'trips', label: 'Top 3 Trips' },
  { id: 'lodging', label: 'Top 3 Lodging' },
  { id: 'all', label: 'All Itineraries' },
]

function SettingsIcon({ type }) {
  if (type === 'about') {
    return <img src={profileUser.aboutIcon} alt="" width={25} height={25} />
  }

  const icons = {
    settings: Settings,
    heart: Heart,
    doc: FileText,
    shield: Shield,
    star: Star,
    share: SquareArrowOutUpRight,
    logout: LogOut,
  }
  const Icon = icons[type] || Settings
  return <Icon size={22} strokeWidth={1.75} />
}

export default function Profile({ active = 'profile', onNavigate, onOpenItinerary }) {
  const [segment, setSegment] = useState('trips')
  const [view, setView] = useState('main')
  const [shareOpen, setShareOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState({ myTrips: true, shared: true })
  const [draftFilters, setDraftFilters] = useState(filters)

  const visibleItineraries = profileItineraries.filter(
    (trip) => filters[trip.filter],
  )

  const carouselItems =
    segment === 'lodging'
      ? profileLodging
      : segment === 'all'
        ? profileAllPreview
        : profileTopTrips

  const carouselTitle =
    segment === 'lodging'
      ? 'Samantha’s Top Lodging'
      : segment === 'all'
        ? 'All Itineraries - owned & shared'
        : 'Samantha’s Top Trips'

  function openAllItineraries() {
    setSegment('all')
    setView('all')
  }

  function handleSegment(id) {
    setSegment(id)
    setView('main')
  }

  function applyFilters() {
    setFilters({ ...draftFilters, myTrips: true })
    setFilterOpen(false)
  }

  if (view === 'all') {
    return (
      <div className="profile-page">
        <Header active={active} onNavigate={onNavigate} />
        <div className="profile-page__shell">
          <main className="profile-page__main profile-page__main--all">
            <div className="profile-all__toolbar">
              <button
                type="button"
                className="profile-icon-btn"
                aria-label="Back to profile"
                onClick={() => {
                  setView('main')
                  setSegment('all')
                }}
              >
                <ChevronLeft size={20} strokeWidth={2} />
              </button>
              <h1>All Itineraries</h1>
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
              {filters.myTrips ? (
                <span className="profile-chip profile-chip--trips">My Trips</span>
              ) : null}
              {filters.shared ? (
                <span className="profile-chip profile-chip--shared">
                  Shared
                  <button
                    type="button"
                    aria-label="Remove Shared"
                    onClick={() =>
                      setFilters((current) => ({ ...current, shared: false }))
                    }
                  >
                    <X size={13} strokeWidth={2.5} />
                  </button>
                </span>
              ) : null}
            </div>
            <p className="profile-all__count">
              Showing Samantha&apos;s {visibleItineraries.length} trips
            </p>

            <div className="profile-all__feed">
              {visibleItineraries.map((trip) => (
                <BigCard key={trip.id} itinerary={trip} onOpen={onOpenItinerary} />
              ))}
            </div>
          </main>
        </div>
        <TabBar active={active} onNavigate={onNavigate} />

        {filterOpen ? (
          <div
            className="profile-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Filter itineraries"
          >
            <button
              type="button"
              className="profile-sheet__backdrop"
              aria-label="Close"
              onClick={() => setFilterOpen(false)}
            />
            <div className="profile-sheet__panel">
              <div className="profile-sheet__grabber" />
              <div className="profile-sheet__list">
                {[
                  { id: 'myTrips', label: 'My Trips', locked: true },
                  { id: 'shared', label: 'Shared', locked: false },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`profile-sheet__row${
                      item.locked ? ' profile-sheet__row--locked' : ''
                    }`}
                    onClick={() => {
                      if (item.locked) return
                      setDraftFilters((current) => ({
                        ...current,
                        [item.id]: !current[item.id],
                      }))
                    }}
                  >
                    <span
                      className={`profile-sheet__check${
                        draftFilters[item.id] ? ' profile-sheet__check--on' : ''
                      }${item.locked ? ' profile-sheet__check--locked' : ''}`}
                    >
                      {draftFilters[item.id] ? '✓' : ''}
                    </span>
                    {item.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="profile-sheet__apply"
                onClick={applyFilters}
              >
                Apply
              </button>
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className="profile-page">
      <Header active={active} onNavigate={onNavigate} />
      <div className="profile-page__shell profile-page__shell--flush">
        <main className="profile-page__main">
          <section className="profile-hero">
            <div className="profile-hero__cover">
              <img src={profileUser.cover} alt="" />
              <button
                type="button"
                className="profile-hero__share"
                aria-label="Share profile"
                onClick={() => setShareOpen(true)}
              >
                <Share size={18} strokeWidth={1.75} />
              </button>
            </div>
            <img
              className="profile-hero__avatar"
              src={profileUser.avatar}
              alt=""
            />
          </section>

          <section className="profile-info">
            <div className="profile-info__top">
              <div>
                <h1>{profileUser.name}</h1>
                <p className="profile-info__handle">{profileUser.handle}</p>
              </div>
              <div className="profile-info__stats">
                <div>
                  <strong>{profileUser.itinerariesCount}</strong>
                  <span>Itineraries</span>
                </div>
                <div>
                  <strong>{profileUser.countriesCount}</strong>
                  <span>Countries</span>
                </div>
              </div>
            </div>
            <p className="profile-info__bio">{profileUser.bio}</p>
            <div className="profile-info__meta">
              <span>📍 {profileUser.location}</span>
              <div className="profile-info__socials">
                <img
                  src={profileUser.tiktok}
                  alt="TikTok"
                  width={24}
                  height={24}
                />
                <img
                  src={profileUser.instagram}
                  alt="Instagram"
                  width={24}
                  height={24}
                />
              </div>
            </div>
          </section>

          <section className="profile-flags">
            <h2>Flags Collected</h2>
            <p>
              {profileUser.flagsCollected} / {profileUser.flagsTotal}
            </p>
            <div className="profile-flags__grid">
              {profileUser.collectedFlags.map((flag) => (
                <img key={flag} src={flag} alt="" width={24} height={20} />
              ))}
            </div>
          </section>

          <section className="profile-content">
            <div
              className="profile-segments"
              role="tablist"
              aria-label="Profile content"
            >
              {SEGMENTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={segment === item.id}
                  className={`profile-segments__btn${
                    segment === item.id ? ' profile-segments__btn--active' : ''
                  }`}
                  onClick={() => handleSegment(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="profile-carousel">
              {segment === 'all' ? (
                <button
                  type="button"
                  className="profile-carousel__heading"
                  onClick={openAllItineraries}
                >
                  <h2>{carouselTitle}</h2>
                  <ChevronRight size={17} strokeWidth={2.5} />
                </button>
              ) : (
                <h2>{carouselTitle}</h2>
              )}
              <div className="profile-carousel__track">
                {carouselItems.map((item) => (
                  <MiniCard key={item.id} itinerary={item} onOpen={onOpenItinerary} />
                ))}
                {segment === 'all' ? (
                  <button
                    type="button"
                    className="profile-view-all"
                    onClick={openAllItineraries}
                  >
                    <span>View All</span>
                    <span className="profile-view-all__icon" aria-hidden>
                      <ChevronRight size={20} strokeWidth={2} />
                    </span>
                  </button>
                ) : null}
              </div>
            </div>
          </section>

          <section className="profile-settings">
            <h2>Restricted to you</h2>
            <div className="profile-settings__card">
              {profileSettings.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`profile-settings__row${
                    item.id === 'logout' ? ' profile-settings__row--danger' : ''
                  }`}
                >
                  <span className="profile-settings__label">
                    <SettingsIcon type={item.icon} />
                    {item.label}
                  </span>
                  {item.id !== 'shareApp' && item.id !== 'logout' ? (
                    <ChevronRight size={18} strokeWidth={2} />
                  ) : null}
                </button>
              ))}
            </div>
          </section>
        </main>
      </div>
      <TabBar active={active} onNavigate={onNavigate} />

      {shareOpen ? (
        <div
          className="profile-sheet"
          role="dialog"
          aria-modal="true"
          aria-label="Profile actions"
        >
          <button
            type="button"
            className="profile-sheet__backdrop"
            aria-label="Close"
            onClick={() => setShareOpen(false)}
          />
          <div className="profile-sheet__panel profile-sheet__panel--actions">
            <div className="profile-sheet__grabber" />
            <div className="profile-sheet__list">
              <button type="button" className="profile-sheet__row">
                <SquareArrowOutUpRight size={20} strokeWidth={1.75} />
                Share profile
              </button>
              <button type="button" className="profile-sheet__row">
                <span className="profile-sheet__circle-icon" aria-hidden>
                  <Star size={12} strokeWidth={0} fill="white" />
                </span>
                Request “My Circle” invite
              </button>
              <button
                type="button"
                className="profile-sheet__row profile-sheet__row--danger"
              >
                <Flag size={20} strokeWidth={1.75} />
                Report / Block
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
