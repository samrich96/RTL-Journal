import { useEffect, useRef, useState } from 'react'
import {
  BedDouble,
  Camera,
  Car,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock,
  Heart,
  Minus,
  MoreHorizontal,
  Plane,
  Plus,
  Share,
  Star,
  Ticket,
  Utensils,
} from 'lucide-react'
import BudgetDonut from '../components/BudgetDonut'
import ItineraryMap from '../components/ItineraryMap'
import {
  EVENT_FILTERS,
  PIN_STYLES,
  switzerlandItinerary,
} from '../data/switzerlandItinerary'
import './ItineraryDetail.css'

const TABS = ['Overview', 'Itinerary', 'Budget', 'Extras']

const FILTER_ICONS = {
  food: Utensils,
  activity: Ticket,
  lodging: BedDouble,
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
  const [sheetState, setSheetState] = useState('peek')
  const [eventFilter, setEventFilter] = useState('all')
  const [tab, setTab] = useState('Overview')
  const [expandedCopy, setExpandedCopy] = useState(false)
  const [expandedBudget, setExpandedBudget] = useState(null)
  const [selectedBudget, setSelectedBudget] = useState(null)

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
    }
  }, [sheetState])

  function expandSheet() {
    setSheetState('expanded')
  }

  function collapseSheet() {
    setSheetState('peek')
    setExpandedCopy(false)
  }

  function onBodyScroll(event) {
    if (sheetState === 'peek' && event.currentTarget.scrollTop > 12) {
      expandSheet()
    }
  }

  function onGrabberPointerDown(event) {
    dragStartY.current = event.clientY
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  function onGrabberPointerUp(event) {
    if (dragStartY.current == null) return
    const delta = event.clientY - dragStartY.current
    dragStartY.current = null

    if (delta > 40) {
      collapseSheet()
      return
    }
    if (delta < -40) {
      expandSheet()
    }
  }

  function onSheetWheel(event) {
    if (sheetState === 'peek' && event.deltaY > 8) {
      expandSheet()
    }
  }

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
            return (
              <button
                key={filter.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`itinerary-filter${active ? ' itinerary-filter--active' : ''}`}
                onClick={() => setEventFilter(filter.id)}
              >
                {Icon ? (
                  <span
                    className="itinerary-filter__swatch"
                    style={{ background: PIN_STYLES[filter.type].gradient }}
                  >
                    <Icon size={10} strokeWidth={2.4} color="#fffefd" />
                  </span>
                ) : null}
                {filter.label}
              </button>
            )
          })}
        </div>
      </div>

      <section
        ref={sheetRef}
        className={`itinerary-sheet itinerary-sheet--${sheetState}`}
        aria-label="Itinerary details"
        onWheel={onSheetWheel}
      >
        <div
          className="itinerary-sheet__grabber-hit"
          onPointerDown={onGrabberPointerDown}
          onPointerUp={onGrabberPointerUp}
          onClick={() =>
            sheetState === 'peek' ? expandSheet() : collapseSheet()
          }
        >
          <div className="itinerary-sheet__grabber" />
        </div>

        <div className="itinerary-sheet__hero">
          <img src={trip.hero || trip.coverFallback} alt="" />
          <div className="itinerary-sheet__hero-fade" />
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
        </div>

        <div
          ref={bodyRef}
          className="itinerary-sheet__body"
          onScroll={onBodyScroll}
        >
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
              <ChevronRight size={14} strokeWidth={2} className="itinerary-sheet__meta-chevron" />
            </div>
          </div>

          <div className="itinerary-sheet__tabs" role="tablist" aria-label="Itinerary sections">
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

          {tab === 'Overview' ? (
            <div className="itinerary-sheet__panel">
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
                <ul className="itinerary-sheet__highlights">
                  {trip.overviewHighlights.map((item) => (
                    <li key={item.label}>
                      <strong>{item.label}</strong>
                      <span>{item.value}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          {tab === 'Itinerary' ? (
            <div className="itinerary-sheet__panel">
              <ol className="itinerary-sheet__days">
                {trip.days.map((day) => (
                  <li key={day.day}>
                    <span className="itinerary-sheet__day-badge">Day {day.day}</span>
                    <div>
                      <strong>{day.title}</strong>
                      <p>{day.summary}</p>
                    </div>
                  </li>
                ))}
              </ol>
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
            <div className="itinerary-sheet__panel">
              <ul className="itinerary-sheet__extras">
                {trip.extras.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
