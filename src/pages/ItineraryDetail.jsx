import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BedDouble,
  Calendar,
  Camera,
  Car,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock,
  CloudSun,
  Heart,
  Lock,
  Map,
  MessageCircle,
  Minus,
  MoreHorizontal,
  Plane,
  Play,
  Plus,
  SmilePlus,
  Send,
  Share,
  Star,
  Ticket,
  Utensils,
} from 'lucide-react'
import BudgetDonut from '../components/BudgetDonut'
import ItineraryMap from '../components/ItineraryMap'
import { profileUser } from '../data/profile'
import {
  EVENT_FILTERS,
  PIN_STYLES,
  switzerlandItinerary,
} from '../data/switzerlandItinerary'
import './ItineraryDetail.css'

const TABS = ['Overview', 'Itinerary', 'Budget', 'Extras']

const THREAD_REACTION_EMOJIS = ['❤️', '👍', '🙌', '😂', '😮', '🔥']

function buildThreadReactionState(posts) {
  const state = {}

  function addItem(item) {
    state[item.id] = (item.reactions || []).map((reaction) => ({
      emoji: reaction.emoji,
      count: reaction.count,
      mine: Boolean(reaction.mine),
    }))
    ;(item.replies || []).forEach(addItem)
  }

  posts.forEach(addItem)
  return state
}

const FILTER_ICONS = {
  food: Utensils,
  activity: Ticket,
  lodging: BedDouble,
}

const EVENT_ICONS = {
  flight: Plane,
  transport: Car,
  lodging: BedDouble,
  activity: Ticket,
  food: Utensils,
}

const BUDGET_ICONS = {
  bed: BedDouble,
  plane: Plane,
  ticket: Ticket,
  utensils: Utensils,
  car: Car,
  camera: Camera,
}

function formatMoney(value) {
  return `$${Number(value).toLocaleString('en-US')}`
}

export default function ItineraryDetail({ onClose }) {
  const trip = switzerlandItinerary
  const sheetRef = useRef(null)
  const bodyRef = useRef(null)
  const dragStartY = useRef(null)
  const dragDelta = useRef(0)
  const didDrag = useRef(false)
  const [sheetState, setSheetState] = useState('peek')
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [eventFilter, setEventFilter] = useState('all')
  const [tab, setTab] = useState('Overview')
  const [expandedCopy, setExpandedCopy] = useState(false)
  const [expandedBudget, setExpandedBudget] = useState(null)
  const [selectedBudget, setSelectedBudget] = useState(null)
  const [stickyPinned, setStickyPinned] = useState(false)
  const [photosOpen, setPhotosOpen] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [publicThreadsOpen, setPublicThreadsOpen] = useState(false)
  const [outfitsOpen, setOutfitsOpen] = useState(false)
  const [outfitDay, setOutfitDay] = useState(1)
  const [threadDraft, setThreadDraft] = useState('')
  const [threadComments, setThreadComments] = useState([])
  const [threadReactions, setThreadReactions] = useState(() =>
    buildThreadReactionState(trip.publicThread.posts),
  )
  const [reactionPickerId, setReactionPickerId] = useState(null)
  const [itinerarySelection, setItinerarySelection] = useState(1)
  const previewTrackRef = useRef(null)
  const threadScrollRef = useRef(null)

  const flatPhotos = useMemo(
    () =>
      trip.photoGallery.flatMap((day) =>
        day.photos.map((photo, photoIndex) => ({
          src: photo.src,
          label: day.label,
          date: day.date,
          day: day.day,
          photoIndex,
        })),
      ),
    [trip.photoGallery],
  )

  function photoGlobalIndex(dayNumber, photoIndex) {
    return flatPhotos.findIndex(
      (photo) => photo.day === dayNumber && photo.photoIndex === photoIndex,
    )
  }

  function openPhotoPreview(items, index = 0) {
    if (!items?.length || index < 0 || index >= items.length) return
    setPhotoPreview({ items, index })
  }

  function openFolder(folder) {
    if (folder.locked) return
    if (folder.id === 'public-threads') {
      setPublicThreadsOpen(true)
    }
    if (folder.id === 'outfits') {
      setOutfitDay(1)
      setOutfitsOpen(true)
    }
  }

  function closeOutfits() {
    setOutfitsOpen(false)
  }

  function closePublicThreads() {
    setPublicThreadsOpen(false)
    setReactionPickerId(null)
  }

  function toggleThreadReaction(postId, emoji) {
    setThreadReactions((current) => {
      const list = [...(current[postId] || [])]
      const index = list.findIndex((reaction) => reaction.emoji === emoji)

      if (index === -1) {
        list.push({ emoji, count: 1, mine: true })
      } else if (list[index].mine) {
        const nextCount = list[index].count - 1
        if (nextCount <= 0) list.splice(index, 1)
        else list[index] = { ...list[index], count: nextCount, mine: false }
      } else {
        list[index] = {
          ...list[index],
          count: list[index].count + 1,
          mine: true,
        }
      }

      return { ...current, [postId]: list }
    })
    setReactionPickerId(null)
  }

  function submitThreadComment(event) {
    event.preventDefault()
    const text = threadDraft.trim()
    if (!text) return

    const stamped = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
    const id = `local-${Date.now()}`

    setThreadComments((current) => [
      ...current,
      {
        id,
        author: profileUser.name,
        role: 'You',
        avatar: profileUser.avatar,
        stamped,
        kind: 'question',
        text,
        replies: [],
      },
    ])
    setThreadReactions((current) => ({ ...current, [id]: [] }))
    setThreadDraft('')
    setReactionPickerId(null)

    requestAnimationFrame(() => {
      const scroller = threadScrollRef.current
      if (scroller) {
        scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' })
      }
    })
  }

  function closePhotoPreview() {
    setPhotoPreview(null)
  }

  function closePhotos() {
    setPhotoPreview(null)
    setPhotosOpen(false)
  }

  function selectItineraryDay(selection) {
    setItinerarySelection(selection)
    if (typeof selection === 'number') {
      expandSheet()
    }
  }

  const selectedItineraryDay =
    typeof itinerarySelection === 'number'
      ? trip.itineraryDays.find((day) => day.day === itinerarySelection)
      : null

  const selectedOutfitDay =
    trip.outfitBoard.days.find((day) => day.day === outfitDay) ||
    trip.outfitBoard.days[0]

  function openEventPhotoPreview(event, imageIndex) {
    if (!event.images?.length) return
    openPhotoPreview(
      event.images.map((src) => ({
        src,
        label: event.title,
        date: selectedItineraryDay?.fullDate || '',
      })),
      imageIndex,
    )
  }

  const previewItems = photoPreview?.items ?? []
  const previewIndex = photoPreview?.index ?? null
  const previewPhoto =
    previewIndex != null ? previewItems[previewIndex] : null

  function toggleBudgetCategory(id) {
    setExpandedBudget((current) => (current === id ? null : id))
  }

  function selectBudgetCategory(id) {
    setSelectedBudget(id)
    setExpandedBudget(id)
    if (id) expandSheet()
  }

  const visibleBudget = selectedBudget
    ? trip.budget.filter((row) => row.id === selectedBudget)
    : trip.budget

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  useEffect(() => {
    if (sheetState === 'peek' && bodyRef.current) {
      bodyRef.current.scrollTop = 0
      setStickyPinned(false)
      setPhotoPreview(null)
      setPhotosOpen(false)
    }
  }, [sheetState])

  useEffect(() => {
    if (previewIndex == null || !previewTrackRef.current) return
    const track = previewTrackRef.current
    const target = previewIndex * track.clientWidth
    if (Math.abs(track.scrollLeft - target) > 4) {
      track.scrollTo({ left: target, behavior: 'auto' })
    }

    const activeDot = track.parentElement?.querySelector(
      '.itinerary-photo-preview__dot--active',
    )
    activeDot?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }, [previewIndex, previewItems.length])

  useEffect(() => {
    if (previewIndex == null) return undefined

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        closePhotoPreview()
        return
      }
      if (event.key === 'ArrowRight') {
        setPhotoPreview((current) => {
          if (!current) return current
          return {
            ...current,
            index: Math.min(current.index + 1, current.items.length - 1),
          }
        })
      }
      if (event.key === 'ArrowLeft') {
        setPhotoPreview((current) => {
          if (!current) return current
          return {
            ...current,
            index: Math.max(current.index - 1, 0),
          }
        })
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [previewIndex])

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = 0
      setStickyPinned(false)
    }
  }, [tab])

  function expandSheet() {
    setSheetState('expanded')
  }

  function collapseSheet() {
    setSheetState('peek')
    setExpandedCopy(false)
  }

  function resetDrag() {
    dragStartY.current = null
    dragDelta.current = 0
    setDragY(0)
    setIsDragging(false)
  }

  function onBodyScroll(event) {
    const scroller = event.currentTarget
    if (sheetState === 'peek' && scroller.scrollTop > 12) {
      expandSheet()
    }
    setStickyPinned(scroller.scrollTop > 48)
  }

  function onGrabberPointerDown(event) {
    if (event.button != null && event.button !== 0) return
    dragStartY.current = event.clientY
    dragDelta.current = 0
    didDrag.current = false
    setIsDragging(true)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  function onGrabberPointerMove(event) {
    if (dragStartY.current == null) return
    const delta = event.clientY - dragStartY.current

    // Expanded: only drag down. Peek: drag down to dismiss or up to expand.
    const next =
      sheetState === 'expanded' ? Math.max(0, delta) : delta

    if (Math.abs(delta) > 10) {
      didDrag.current = true
    }

    dragDelta.current = next
    setDragY(next)
  }

  function finishGrabberGesture() {
    if (dragStartY.current == null) return

    const delta = dragDelta.current
    const dragged = didDrag.current
    resetDrag()

    const dismissThreshold = 72
    const collapseThreshold = 56
    const expandThreshold = -40

    if (dragged && delta >= dismissThreshold && sheetState === 'peek') {
      onClose()
      return
    }

    if (dragged && delta >= collapseThreshold && sheetState === 'expanded') {
      collapseSheet()
      return
    }

    if (dragged && delta <= expandThreshold && sheetState === 'peek') {
      expandSheet()
    }
  }

  function onGrabberPointerUp() {
    finishGrabberGesture()
  }

  function onGrabberPointerCancel() {
    resetDrag()
    didDrag.current = false
  }

  function onGrabberClick() {
    if (didDrag.current) {
      didDrag.current = false
      return
    }
    if (sheetState === 'peek') expandSheet()
    else collapseSheet()
  }

  function onSheetWheel(event) {
    if (sheetState === 'peek' && event.deltaY > 8) {
      expandSheet()
    }
  }

  function renderThreadMessage(post, { nested = false } = {}) {
    const reactions = threadReactions[post.id] || []
    const pickerOpen = reactionPickerId === post.id

    return (
      <div
        className={`public-threads__post${
          nested ? ' public-threads__post--reply' : ''
        }`}
      >
        <img className="public-threads__avatar" src={post.avatar} alt="" />
        <div className="public-threads__bubble">
          <div className="public-threads__meta">
            <div className="public-threads__who">
              <strong>{post.author}</strong>
              {post.role && post.role !== 'RTL Journal' ? (
                <span>{post.role}</span>
              ) : null}
            </div>
            <time dateTime={post.stamped}>{post.stamped}</time>
          </div>

          {post.replyTo ? (
            <p className="public-threads__replying">
              Replying to <span>{post.replyTo}</span>
            </p>
          ) : null}

          {post.text ? <p className="public-threads__text">{post.text}</p> : null}

          {post.image ? (
            <button
              type="button"
              className="public-threads__image"
              onClick={() => openPhotoPreview([{ src: post.image }], 0)}
              aria-label="Open shared photo"
            >
              <img src={post.image} alt="" />
            </button>
          ) : null}

          {post.tiktok ? (
            <article className="public-threads__tiktok">
              <div className="public-threads__tiktok-preview">
                <img src={post.tiktok.preview} alt="" />
                <span className="public-threads__tiktok-play" aria-hidden>
                  <Play size={22} strokeWidth={2.4} fill="currentColor" />
                </span>
                <img
                  className="public-threads__tiktok-logo"
                  src="/assets/profile-tiktok.svg"
                  alt=""
                />
              </div>
              <div className="public-threads__tiktok-copy">
                <strong>{post.tiktok.title}</strong>
                <span>
                  {post.tiktok.creator} · {post.tiktok.views} views
                </span>
              </div>
            </article>
          ) : null}

          <div className="public-threads__reactions">
            {reactions.map((reaction) => (
              <button
                key={`${post.id}-${reaction.emoji}`}
                type="button"
                className={`public-threads__reaction${
                  reaction.mine ? ' public-threads__reaction--mine' : ''
                }`}
                aria-pressed={reaction.mine}
                aria-label={`${reaction.emoji} ${reaction.count}`}
                onClick={() => toggleThreadReaction(post.id, reaction.emoji)}
              >
                <span aria-hidden>{reaction.emoji}</span>
                <span>{reaction.count}</span>
              </button>
            ))}

            <div className="public-threads__react-wrap">
              <button
                type="button"
                className={`public-threads__react-add${
                  pickerOpen ? ' public-threads__react-add--open' : ''
                }`}
                aria-label="Add emoji reaction"
                aria-expanded={pickerOpen}
                onClick={() =>
                  setReactionPickerId((current) =>
                    current === post.id ? null : post.id,
                  )
                }
              >
                <SmilePlus size={15} strokeWidth={2.2} />
              </button>

              {pickerOpen ? (
                <div className="public-threads__emoji-picker" role="listbox">
                  {THREAD_REACTION_EMOJIS.map((emoji) => (
                    <button
                      key={`${post.id}-pick-${emoji}`}
                      type="button"
                      role="option"
                      aria-label={`React with ${emoji}`}
                      onClick={() => toggleThreadReaction(post.id, emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const sheetStyle =
    dragY !== 0
      ? { transform: `translate3d(0, ${dragY}px, 0)` }
      : undefined

  return (
    <div className="itinerary-detail">
      <ItineraryMap
        center={trip.mapCenter}
        zoom={trip.mapZoom}
        pins={trip.pins}
        sheetState={sheetState}
        activeFilter={eventFilter}
      />

      <div className="itinerary-detail__chrome">
        <div className="itinerary-detail__topbar">
          <button
            type="button"
            className="itinerary-detail__icon-btn"
            aria-label="Back"
            onClick={onClose}
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
          <div className="itinerary-detail__actions">
            <button type="button" className="itinerary-detail__icon-btn" aria-label="Share">
              <Share size={16} strokeWidth={1.75} />
            </button>
            <button type="button" className="itinerary-detail__icon-btn" aria-label="Save">
              <Heart size={16} strokeWidth={1.75} />
            </button>
            <button type="button" className="itinerary-detail__icon-btn" aria-label="More">
              <MoreHorizontal size={16} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <div className="itinerary-detail__filters" role="tablist" aria-label="Map event filters">
          {EVENT_FILTERS.map((filter) => {
            const Icon = FILTER_ICONS[filter.type]
            const active = eventFilter === filter.id
            const pinStyle = filter.type ? PIN_STYLES[filter.type] : null
            const background = pinStyle
              ? pinStyle.gradient
              : 'linear-gradient(180deg, #9a9a9a 0%, #6e6e6e 100%)'
            return (
              <button
                key={filter.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`itinerary-filter itinerary-filter--keyed${
                  active ? ' itinerary-filter--active' : ''
                }`}
                style={{
                  background,
                  color: '#fffefd',
                }}
                onClick={() => setEventFilter(filter.id)}
              >
                {Icon ? <Icon size={12} strokeWidth={2.4} color="#fffefd" /> : null}
                {filter.label}
              </button>
            )
          })}
        </div>
      </div>

      <section
        ref={sheetRef}
        className={`itinerary-sheet itinerary-sheet--${sheetState}${
          isDragging ? ' itinerary-sheet--dragging' : ''
        }`}
        aria-label="Itinerary details"
        style={sheetStyle}
        onWheel={onSheetWheel}
      >
        <div
          className="itinerary-sheet__grabber-hit"
          onPointerDown={onGrabberPointerDown}
          onPointerMove={onGrabberPointerMove}
          onPointerUp={onGrabberPointerUp}
          onPointerCancel={onGrabberPointerCancel}
          onClick={onGrabberClick}
          role="slider"
          aria-label="Resize itinerary card"
          aria-valuetext={sheetState === 'expanded' ? 'Expanded' : 'Collapsed'}
        >
          <div className="itinerary-sheet__grabber" />
        </div>

        <div
          ref={bodyRef}
          className="itinerary-sheet__scroll"
          onScroll={onBodyScroll}
        >
          <div className="itinerary-sheet__hero">
            <img
              className="itinerary-sheet__hero-img"
              src={trip.hero || trip.coverFallback}
              alt=""
            />
            <div className="itinerary-sheet__hero-fade" />
          </div>

          <div
            className={`itinerary-sheet__sticky${
              stickyPinned ? ' itinerary-sheet__sticky--pinned' : ''
            }`}
          >
            <div className="itinerary-sheet__avatars">
              {trip.avatars.map((avatar) => (
                <span key={avatar.src} className="itinerary-sheet__avatar">
                  <img src={avatar.src} alt="" />
                  {avatar.badge === 'star' ? (
                    <span className="itinerary-sheet__avatar-badge" aria-hidden>
                      <Star size={8} fill="currentColor" strokeWidth={0} />
                    </span>
                  ) : null}
                </span>
              ))}
            </div>

            <div className="itinerary-sheet__header">
              <h1>{trip.title}</h1>
              <div className="itinerary-sheet__meta">
                <img src={trip.flag} alt="" width={22} height={18} />
                <span>
                  <CircleDollarSign size={16} strokeWidth={1.75} />
                  {trip.price}
                </span>
                <span>
                  <Clock size={16} strokeWidth={1.75} />
                  {trip.duration}
                </span>
                <ChevronRight
                  size={14}
                  strokeWidth={2}
                  className="itinerary-sheet__meta-chevron"
                />
              </div>
            </div>

            <div
              className="itinerary-sheet__tabs"
              role="tablist"
              aria-label="Itinerary sections"
            >
              {TABS.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={tab === item}
                  className={`itinerary-sheet__tab${
                    tab === item ? ' itinerary-sheet__tab--active' : ''
                  }`}
                  onClick={() => {
                    setTab(item)
                    if (item !== 'Budget') {
                      setSelectedBudget(null)
                      setExpandedBudget(null)
                    }
                    expandSheet()
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="itinerary-sheet__body">
          {tab === 'Overview' ? (
            <div className="itinerary-sheet__panel itinerary-sheet__panel--overview">
              {sheetState === 'expanded' ? (
                <button type="button" className="itinerary-sheet__updated">
                  {trip.lastUpdated}
                </button>
              ) : null}

              <p>
                {expandedCopy || sheetState === 'expanded'
                  ? trip.descriptionFull
                  : `${trip.description.slice(0, 118)}... `}
                {sheetState === 'peek' && !expandedCopy ? (
                  <button
                    type="button"
                    className="itinerary-sheet__more"
                    onClick={() => {
                      setExpandedCopy(true)
                      expandSheet()
                    }}
                  >
                    See More
                  </button>
                ) : null}
              </p>

              {sheetState === 'expanded' ? (
                <>
                  <section className="itinerary-sheet__trip-photos">
                    <h2>Trip Photos</h2>
                    <button
                      type="button"
                      className="itinerary-sheet__photo-collage"
                      onClick={() => setPhotosOpen(true)}
                      aria-label="Open trip photos"
                    >
                      <img
                        className="itinerary-sheet__photo-collage-large"
                        src={trip.tripPhotos.large}
                        alt=""
                      />
                      <div className="itinerary-sheet__photo-collage-stack">
                        <img src={trip.tripPhotos.topRight} alt="" />
                        <span className="itinerary-sheet__photo-collage-more">
                          <img src={trip.tripPhotos.bottomRight} alt="" />
                          <span>+ {trip.tripPhotoCount}</span>
                        </span>
                      </div>
                    </button>
                  </section>

                  <section className="itinerary-sheet__daily-summary">
                    <div className="itinerary-sheet__daily-summary-head">
                      <p>{trip.dateRange}</p>
                      <span>
                        <Map size={14} strokeWidth={1.75} aria-hidden />
                        {trip.eventCount} Events
                      </span>
                    </div>
                    <div className="itinerary-sheet__daily-summary-body">
                      <div
                        className="itinerary-sheet__daily-timeline"
                        aria-hidden
                      >
                        <span className="itinerary-sheet__daily-line" />
                        {trip.daySummaries.map((day) => (
                          <span
                            key={day.day}
                            className="itinerary-sheet__daily-dot"
                          />
                        ))}
                      </div>
                      <ul className="itinerary-sheet__daily-cards">
                        {trip.daySummaries.map((day) => (
                          <li key={day.day}>
                            <img src={day.image} alt="" />
                            <div>
                              <div className="itinerary-sheet__daily-card-meta">
                                <span>DAY {day.day}</span>
                                <span>{day.events} Events</span>
                              </div>
                              <strong>{day.title}</strong>
                              <span className="itinerary-sheet__daily-card-date">
                                <Calendar
                                  size={14}
                                  strokeWidth={1.75}
                                  aria-hidden
                                />
                                {day.dateLabel}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>
                </>
              ) : null}
            </div>
          ) : null}

          {tab === 'Itinerary' ? (
            <div className="itinerary-sheet__panel itinerary-sheet__panel--itinerary">
              <div
                className="itinerary-day-slider"
                role="tablist"
                aria-label="Trip days"
              >
                {trip.itineraryDays.map((day) => {
                  const active = itinerarySelection === day.day
                  return (
                    <button
                      key={day.day}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      className={`itinerary-day-chip${
                        active ? ' itinerary-day-chip--active' : ''
                      }`}
                      onClick={() => selectItineraryDay(day.day)}
                    >
                      <span>{day.dateNum}</span>
                      <span>{day.weekday}</span>
                    </button>
                  )
                })}
                <button
                  type="button"
                  role="tab"
                  aria-selected={itinerarySelection === 'core'}
                  className={`itinerary-day-chip itinerary-day-chip--wide${
                    itinerarySelection === 'core'
                      ? ' itinerary-day-chip--active'
                      : ''
                  }`}
                  onClick={() => {
                    setItinerarySelection('core')
                    expandSheet()
                  }}
                >
                  <span>Core</span>
                  <span>Bookings</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={itinerarySelection === 'benched'}
                  className={`itinerary-day-chip itinerary-day-chip--wide${
                    itinerarySelection === 'benched'
                      ? ' itinerary-day-chip--active'
                      : ''
                  }`}
                  onClick={() => {
                    setItinerarySelection('benched')
                    expandSheet()
                  }}
                >
                  <span>Benched</span>
                </button>
              </div>

              {sheetState === 'expanded' && selectedItineraryDay ? (
                <div className="itinerary-day-detail">
                  <div className="itinerary-day-detail__header">
                    <div>
                      <p>Day {selectedItineraryDay.day}</p>
                      <h2>{selectedItineraryDay.title}</h2>
                    </div>
                    <div className="itinerary-day-detail__weather">
                      <CloudSun size={18} strokeWidth={1.75} aria-hidden />
                      <span>{selectedItineraryDay.weather}</span>
                    </div>
                  </div>

                  <div className="itinerary-day-detail__meta">
                    <p>{selectedItineraryDay.fullDate}</p>
                    <span>
                      <Map size={14} strokeWidth={1.75} aria-hidden />
                      {selectedItineraryDay.eventCount} Events
                    </span>
                  </div>

                  <ul className="itinerary-day-detail__events">
                    {selectedItineraryDay.events.map((event) => {
                      const Icon = EVENT_ICONS[event.type] || Ticket
                      const style = PIN_STYLES[event.type] || PIN_STYLES.activity
                      return (
                        <li key={event.id} className="itinerary-day-detail__row">
                          <div
                            className="itinerary-day-detail__marker"
                            aria-hidden
                          >
                            <span
                              className="itinerary-day-detail__pin"
                              style={{ background: style.gradient }}
                            >
                              <Icon
                                size={10}
                                strokeWidth={2.4}
                                color="#fffefd"
                              />
                            </span>
                          </div>
                          <div className="itinerary-day-detail__card">
                            <div className="itinerary-day-detail__event-copy">
                              <strong>{event.title}</strong>
                              <div className="itinerary-day-detail__event-meta">
                                {event.time ? <span>{event.time}</span> : null}
                                {event.rating != null ? (
                                  <span className="itinerary-day-detail__pill">
                                    <Star
                                      size={12}
                                      strokeWidth={0}
                                      fill="#fab005"
                                      color="#fab005"
                                      aria-hidden
                                    />
                                    {event.rating}
                                  </span>
                                ) : null}
                                {event.cost ? (
                                  <span className="itinerary-day-detail__pill">
                                    {event.cost}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                            {event.images?.length ? (
                              <div className="itinerary-day-detail__photos">
                                {event.images.map((src, imageIndex) => (
                                  <button
                                    key={`${event.id}-${src}-${imageIndex}`}
                                    type="button"
                                    className="itinerary-day-detail__photo"
                                    onClick={() =>
                                      openEventPhotoPreview(event, imageIndex)
                                    }
                                    aria-label={`Preview ${event.title} photo ${imageIndex + 1}`}
                                  >
                                    <img src={src} alt="" />
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ) : null}

              {sheetState === 'expanded' && itinerarySelection === 'core' ? (
                <div className="itinerary-day-detail">
                  <div className="itinerary-day-detail__header">
                    <div>
                      <p>Bookings</p>
                      <h2>Core Bookings</h2>
                    </div>
                  </div>
                  <ul className="itinerary-day-detail__events itinerary-day-detail__events--solo">
                    {trip.coreBookings.map((item) => (
                      <li key={item.title} className="itinerary-day-detail__row">
                        <div className="itinerary-day-detail__card">
                          <div className="itinerary-day-detail__event-copy">
                            <strong>{item.title}</strong>
                            <div className="itinerary-day-detail__event-meta">
                              <span>{item.detail}</span>
                              {item.cost ? (
                                <span className="itinerary-day-detail__pill">
                                  {item.cost}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {sheetState === 'expanded' && itinerarySelection === 'benched' ? (
                <div className="itinerary-day-detail">
                  <div className="itinerary-day-detail__header">
                    <div>
                      <p>Ideas</p>
                      <h2>Benched</h2>
                    </div>
                  </div>
                  <ul className="itinerary-day-detail__events itinerary-day-detail__events--solo">
                    {trip.benched.map((item) => (
                      <li key={item.title} className="itinerary-day-detail__row">
                        <div className="itinerary-day-detail__card">
                          <div className="itinerary-day-detail__event-copy">
                            <strong>{item.title}</strong>
                            <div className="itinerary-day-detail__event-meta">
                              <span>{item.detail}</span>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          {tab === 'Budget' ? (
            <div className="itinerary-sheet__panel itinerary-sheet__panel--budget">
              <div className="itinerary-sheet__budget-intro">
                <h2>Expense Breakdown</h2>
                <p>Estimated total before gifts and points are deducted</p>
              </div>

              <div className="itinerary-sheet__budget-card">
                <BudgetDonut
                  categories={trip.budget}
                  selectedId={selectedBudget}
                  onSelect={selectBudgetCategory}
                />
              </div>

              {selectedBudget ? (
                <button
                  type="button"
                  className="itinerary-sheet__budget-clear"
                  onClick={() => selectBudgetCategory(null)}
                >
                  Show all categories
                </button>
              ) : null}

              <ul className="itinerary-sheet__budget-list">
                {visibleBudget.map((row) => {
                  const Icon = BUDGET_ICONS[row.icon] || CircleDollarSign
                  const open = expandedBudget === row.id
                  return (
                    <li
                      key={row.id}
                      className={`itinerary-sheet__budget-row${
                        open ? ' itinerary-sheet__budget-row--open' : ''
                      }`}
                    >
                      <button
                        type="button"
                        className="itinerary-sheet__budget-toggle"
                        aria-expanded={open}
                        onClick={() => {
                          toggleBudgetCategory(row.id)
                          expandSheet()
                        }}
                      >
                        <span
                          className="itinerary-sheet__budget-icon"
                          style={{
                            background: `linear-gradient(180deg, ${row.gradientFrom} 0%, ${row.color} 100%)`,
                          }}
                        >
                          <Icon size={16} strokeWidth={2.2} color="#fff" />
                        </span>
                        <span className="itinerary-sheet__budget-copy">
                          <strong>{row.label}</strong>
                          <span>{formatMoney(row.amount)}</span>
                        </span>
                        {open ? (
                          <Minus size={20} strokeWidth={2.2} aria-hidden />
                        ) : (
                          <Plus size={20} strokeWidth={2.2} aria-hidden />
                        )}
                      </button>

                      {open ? (
                        <ul className="itinerary-sheet__budget-details">
                          {row.items.map((item) => (
                            <li key={item.name}>
                              <div>
                                <strong>{item.name}</strong>
                                {item.note ? <span>{item.note}</span> : null}
                              </div>
                              <em>{formatMoney(item.amount)}</em>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : null}

          {tab === 'Extras' ? (
            <div className="itinerary-sheet__panel itinerary-sheet__panel--extras">
              <p className="itinerary-extras__caption">{trip.extrasCaption}</p>

              {sheetState === 'expanded' ? (
                <div className="itinerary-extras__folders">
                  {trip.extrasFolders.map((folder) => (
                    <button
                      key={folder.id}
                      type="button"
                      className={`itinerary-extras__folder itinerary-extras__folder--${folder.id}`}
                      style={{ '--folder-glow': folder.glow }}
                      aria-label={`${folder.title}, ${folder.meta}${
                        folder.locked ? ', private' : ''
                      }`}
                      onClick={() => openFolder(folder)}
                    >
                      <span className="itinerary-extras__folder-shell">
                        <span
                          className="itinerary-extras__folder-glow"
                          aria-hidden
                        />
                        <span
                          className="itinerary-extras__folder-preview"
                          aria-hidden
                        >
                          {folder.preview === 'outfits' ? (
                            <>
                              <img
                                className="itinerary-extras__outfit itinerary-extras__outfit--left"
                                src="/assets/extra-outfit-1.png"
                                alt=""
                              />
                              <img
                                className="itinerary-extras__outfit itinerary-extras__outfit--right"
                                src="/assets/extra-outfit-2.png"
                                alt=""
                              />
                            </>
                          ) : null}

                          {folder.preview === 'papers' ||
                          folder.preview === 'discussion' ||
                          folder.preview === 'public' ? (
                            <>
                              <span className="itinerary-extras__paper itinerary-extras__paper--a">
                                {folder.preview === 'discussion' ||
                                folder.preview === 'public' ? (
                                  <MessageCircle size={14} strokeWidth={1.75} />
                                ) : null}
                              </span>
                              <span className="itinerary-extras__paper itinerary-extras__paper--b">
                                {folder.preview === 'discussion' ||
                                folder.preview === 'public' ? (
                                  <MessageCircle size={14} strokeWidth={1.75} />
                                ) : null}
                              </span>
                              <span className="itinerary-extras__paper itinerary-extras__paper--c">
                                {folder.preview === 'discussion' ||
                                folder.preview === 'public' ? (
                                  <MessageCircle size={14} strokeWidth={1.75} />
                                ) : null}
                              </span>
                            </>
                          ) : null}

                          {folder.preview === 'tickets' ? (
                            <>
                              <span className="itinerary-extras__ticket itinerary-extras__ticket--a">
                                <img src="/assets/extra-ticket-logo-1.png" alt="" />
                              </span>
                              <span className="itinerary-extras__ticket itinerary-extras__ticket--b">
                                <img src="/assets/extra-ticket-logo-2.png" alt="" />
                              </span>
                              <span className="itinerary-extras__ticket itinerary-extras__ticket--c" />
                            </>
                          ) : null}
                        </span>
                        <img
                          className="itinerary-extras__folder-face"
                          src={folder.face}
                          alt=""
                        />
                      </span>
                      <span className="itinerary-extras__folder-copy">
                        <strong>{folder.title}</strong>
                        <span>{folder.meta}</span>
                      </span>
                      {folder.locked ? (
                        <span
                          className="itinerary-extras__folder-lock"
                          aria-hidden
                        >
                          <Lock size={14} strokeWidth={2.2} />
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
          </div>
        </div>
      </section>

      {outfitsOpen ? (
        <div
          className="outfit-board"
          role="dialog"
          aria-modal="true"
          aria-labelledby="outfit-board-title"
        >
          <div className="outfit-board__toolbar">
            <button
              type="button"
              className="outfit-board__back"
              onClick={closeOutfits}
              aria-label="Back to extras"
            >
              <ChevronLeft size={22} strokeWidth={2.25} />
            </button>
            <div className="outfit-board__heading">
              <h2 id="outfit-board-title">{trip.outfitBoard.title}</h2>
              <p>{trip.outfitBoard.subtitle}</p>
            </div>
          </div>

          <div
            className="outfit-board__days itinerary-day-slider"
            role="tablist"
            aria-label="Outfit days"
          >
            {trip.outfitBoard.days.map((day) => {
              const active = day.day === selectedOutfitDay.day
              return (
                <button
                  key={day.day}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`itinerary-day-chip${
                    active ? ' itinerary-day-chip--active' : ''
                  }`}
                  onClick={() => setOutfitDay(day.day)}
                >
                  <span>{day.dateNum}</span>
                  <span>{day.weekday}</span>
                </button>
              )
            })}
          </div>

          <div className="outfit-board__scroll">
            <header className="outfit-board__day-header">
              <div>
                <p className="outfit-board__eyebrow">{selectedOutfitDay.dateLabel}</p>
                <h3>{selectedOutfitDay.title}</h3>
                <p className="outfit-board__vibe">{selectedOutfitDay.vibe}</p>
              </div>
              <span className="outfit-board__count">
                {selectedOutfitDay.looks.length} looks
              </span>
            </header>

            <div className="outfit-board__grid">
              {selectedOutfitDay.looks.map((look, lookIndex) => (
                <button
                  key={look.id}
                  type="button"
                  className="outfit-board__card"
                  onClick={() =>
                    openPhotoPreview(
                      selectedOutfitDay.looks
                        .filter((item) => item.image)
                        .map((item) => ({
                          src: item.image,
                          label: item.name,
                          date: selectedOutfitDay.dateLabel,
                        })),
                      lookIndex,
                    )
                  }
                  aria-label={`${look.name}. ${look.note}`}
                >
                  <span className="outfit-board__shot">
                    <img src={look.image} alt="" />
                    {look.pinterestUrl?.includes('/pin/') ? (
                      <span className="outfit-board__pin-badge" aria-hidden>
                        Pin
                      </span>
                    ) : null}
                  </span>
                  <span className="outfit-board__copy">
                    <strong>{look.name}</strong>
                    <span>{look.note}</span>
                    {look.pinterestUrl?.includes('/pin/') ? (
                      <a
                        className="outfit-board__pin-link"
                        href={look.pinterestUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(event) => event.stopPropagation()}
                      >
                        View on Pinterest
                      </a>
                    ) : null}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {publicThreadsOpen ? (
        <div
          className="public-threads"
          role="dialog"
          aria-modal="true"
          aria-labelledby="public-threads-title"
        >
          <div className="public-threads__toolbar">
            <button
              type="button"
              className="public-threads__back"
              onClick={closePublicThreads}
              aria-label="Back to extras"
            >
              <ChevronLeft size={22} strokeWidth={2.25} />
            </button>
            <div className="public-threads__heading">
              <h2 id="public-threads-title">{trip.publicThread.title}</h2>
              <p>{trip.publicThread.subtitle}</p>
            </div>
          </div>

          <div className="public-threads__scroll" ref={threadScrollRef}>
            <ul className="public-threads__feed">
              {[...trip.publicThread.posts, ...threadComments].map((post) => (
                <li key={post.id} className="public-threads__thread">
                  {renderThreadMessage(post)}
                  {(post.replies || []).length ? (
                    <ul className="public-threads__replies">
                      {post.replies.map((reply) => (
                        <li key={reply.id}>{renderThreadMessage(reply, { nested: true })}</li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          <form className="public-threads__composer" onSubmit={submitThreadComment}>
            <img
              className="public-threads__composer-avatar"
              src={profileUser.avatar}
              alt=""
            />
            <label className="public-threads__composer-field">
              <input
                type="text"
                value={threadDraft}
                onChange={(event) => setThreadDraft(event.target.value)}
                placeholder="Ask a question or share feedback…"
                aria-label="Add a public comment"
                autoComplete="off"
              />
            </label>
            <button
              type="submit"
              className="public-threads__send"
              aria-label="Post comment"
              disabled={!threadDraft.trim()}
            >
              <Send size={18} strokeWidth={2.2} />
            </button>
          </form>
        </div>
      ) : null}

      {photosOpen ? (
        <div className="itinerary-photos" role="dialog" aria-modal="true">
          <div className="itinerary-photos__toolbar">
            <button
              type="button"
              className="itinerary-photos__back"
              onClick={closePhotos}
              aria-label="Back to overview"
            >
              <ChevronLeft size={22} strokeWidth={2.25} />
            </button>
            <div className="itinerary-photos__toolbar-actions">
              <button type="button" aria-label="Share photos">
                <Share size={18} strokeWidth={1.75} />
              </button>
              <button type="button" aria-label="More options">
                <MoreHorizontal size={18} strokeWidth={1.75} />
              </button>
            </div>
          </div>

          <div className="itinerary-photos__scroll">
            <section className="itinerary-photos__covers">
              <h2>Daily Trip Photos</h2>
              <div className="itinerary-photos__cover-row">
                {trip.photoGallery.map((day) => {
                  const firstIndex = flatPhotos.findIndex(
                    (photo) => photo.day === day.day,
                  )
                  return (
                    <button
                      key={day.day}
                      type="button"
                      className="itinerary-photos__cover"
                      onClick={() => {
                        if (firstIndex >= 0) {
                          openPhotoPreview(flatPhotos, firstIndex)
                        }
                      }}
                    >
                      <img src={day.cover} alt="" />
                      <span>{day.label}</span>
                    </button>
                  )
                })}
              </div>
            </section>

            {trip.photoGallery.map((day) => (
              <section
                key={day.day}
                id={`trip-photo-day-${day.day}`}
                className="itinerary-photos__day"
              >
                <h3>
                  <span>
                    {day.label} •{' '}
                  </span>
                  <span>{day.date}</span>
                </h3>
                <div className="itinerary-photos__grid">
                  {day.photos.map((photo, index) => (
                    <button
                      key={`${day.day}-${index}`}
                      type="button"
                      className={
                        photo.span === 'full'
                          ? 'itinerary-photos__shot itinerary-photos__shot--full'
                          : 'itinerary-photos__shot itinerary-photos__shot--half'
                      }
                      onClick={() =>
                        openPhotoPreview(
                          flatPhotos,
                          photoGlobalIndex(day.day, index),
                        )
                      }
                      aria-label={`Preview ${day.label} photo ${index + 1}`}
                    >
                      <img src={photo.src} alt="" />
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      ) : null}

      {photoPreview ? (
        <div
          className="itinerary-photo-preview"
          role="dialog"
          aria-modal="true"
          aria-label="Photo preview"
        >
          <div className="itinerary-photo-preview__top">
            <button
              type="button"
              className="itinerary-photos__back"
              onClick={closePhotoPreview}
              aria-label="Close photo preview"
            >
              <ChevronLeft size={22} strokeWidth={2.25} />
            </button>
            <div className="itinerary-photo-preview__meta">
              <strong>{previewPhoto?.label}</strong>
              {previewPhoto?.date ? <span>{previewPhoto.date}</span> : null}
            </div>
            <span className="itinerary-photo-preview__count">
              {previewIndex + 1} / {previewItems.length}
            </span>
          </div>

          <div
            className="itinerary-photo-preview__track"
            ref={previewTrackRef}
            onScroll={(event) => {
              const track = event.currentTarget
              const next = Math.round(track.scrollLeft / track.clientWidth)
              if (
                next !== previewIndex &&
                next >= 0 &&
                next < previewItems.length
              ) {
                setPhotoPreview((current) =>
                  current ? { ...current, index: next } : current,
                )
              }
            }}
          >
            {previewItems.map((photo, index) => (
              <figure
                key={`${photo.src}-${index}`}
                className="itinerary-photo-preview__slide"
              >
                <img src={photo.src} alt={`${photo.label || 'Trip'} photo`} />
              </figure>
            ))}
          </div>

          <div className="itinerary-photo-preview__pagination">
            <div className="itinerary-photo-preview__dots">
              {previewItems.map((photo, index) => (
                <button
                  key={`dot-${photo.src}-${index}`}
                  type="button"
                  className={`itinerary-photo-preview__dot${
                    index === previewIndex
                      ? ' itinerary-photo-preview__dot--active'
                      : ''
                  }`}
                  aria-label={`Go to photo ${index + 1}`}
                  aria-current={index === previewIndex ? 'true' : undefined}
                  onClick={() => {
                    const track = previewTrackRef.current
                    if (!track) return
                    track.scrollTo({
                      left: index * track.clientWidth,
                      behavior: 'smooth',
                    })
                    setPhotoPreview((current) =>
                      current ? { ...current, index } : current,
                    )
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
