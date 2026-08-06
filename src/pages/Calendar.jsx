import { useMemo, useState } from 'react'
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Crown,
  Plus,
  SlidersHorizontal,
  Star,
  Users,
} from 'lucide-react'
import Header from '../components/Header'
import TabBar from '../components/TabBar'
import { FILTERS, calendarTrips } from '../data/calendarTrips'
import './Calendar.css'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const FILTER_ICONS = {
  myTrips: Crown,
  shared: Users,
  myCircle: Star,
}

function buildMonthCells(year, month) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevMonthDays = new Date(year, month, 0).getDate()
  const cells = []

  for (let i = firstDay - 1; i >= 0; i -= 1) {
    cells.push({
      day: prevMonthDays - i,
      inMonth: false,
      monthOffset: -1,
    })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ day, inMonth: true, monthOffset: 0 })
  }

  let nextDay = 1
  while (cells.length % 7 !== 0) {
    cells.push({
      day: nextDay,
      inMonth: false,
      monthOffset: 1,
    })
    nextDay += 1
  }

  return cells
}

function getEventSegments(trip, cells) {
  const segments = []
  let current = null

  cells.forEach((cell, index) => {
    const inRange =
      cell.inMonth && cell.day >= trip.startDay && cell.day <= trip.endDay

    if (inRange) {
      if (!current) {
        current = {
          startIndex: index,
          endIndex: index,
          label: trip.calendarLabel,
          isStart: cell.day === trip.startDay,
        }
      } else {
        current.endIndex = index
      }

      if ((index + 1) % 7 === 0 || cell.day === trip.endDay) {
        segments.push(current)
        current = null
      }
    } else if (current) {
      segments.push(current)
      current = null
    }
  })

  return segments
}

function assignEventLanes(segments) {
  const byWeek = new Map()

  segments.forEach((segment) => {
    const weekIndex = Math.floor(segment.startIndex / 7)
    if (!byWeek.has(weekIndex)) byWeek.set(weekIndex, [])
    byWeek.get(weekIndex).push(segment)
  })

  const withLanes = []

  byWeek.forEach((weekSegments) => {
    const lanes = []
    weekSegments
      .slice()
      .sort((a, b) => a.startIndex - b.startIndex || b.endIndex - a.endIndex)
      .forEach((segment) => {
        let lane = 0
        while (
          lanes[lane]?.some(
            (placed) =>
              !(
                segment.endIndex < placed.startIndex ||
                segment.startIndex > placed.endIndex
              ),
          )
        ) {
          lane += 1
        }
        if (!lanes[lane]) lanes[lane] = []
        lanes[lane].push(segment)
        withLanes.push({ ...segment, lane })
      })
  })

  return withLanes
}

export default function Calendar({ active = 'calendar', onNavigate, onOpenItinerary }) {
  const today = useMemo(() => new Date(), [])
  const [year, setYear] = useState(2026)
  const [month, setMonth] = useState(4)
  const [selectedDay, setSelectedDay] = useState(1)
  const [filters, setFilters] = useState({
    myTrips: true,
    shared: true,
    myCircle: true,
  })
  const [draftFilters, setDraftFilters] = useState(filters)
  const [sheetOpen, setSheetOpen] = useState(false)

  const cells = useMemo(() => buildMonthCells(year, month), [year, month])
  const weeks = useMemo(() => {
    const rows = []
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7))
    }
    return rows
  }, [cells])

  const visibleTrips = useMemo(
    () =>
      calendarTrips.filter(
        (trip) =>
          trip.year === year &&
          trip.month === month &&
          filters[trip.filter],
      ),
    [filters, month, year],
  )

  const eventSegments = useMemo(() => {
    const segments = visibleTrips.flatMap((trip) =>
      getEventSegments(trip, cells).map((segment, index) => ({
        ...segment,
        trip,
        key: `${trip.id}-${index}`,
      })),
    )
    return assignEventLanes(segments)
  }, [cells, visibleTrips])

  const maxLaneByWeek = useMemo(() => {
    const map = new Map()
    eventSegments.forEach((segment) => {
      const weekIndex = Math.floor(segment.startIndex / 7)
      map.set(weekIndex, Math.max(map.get(weekIndex) ?? 0, segment.lane))
    })
    return map
  }, [eventSegments])

  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth()

  function shiftMonth(delta) {
    const date = new Date(year, month + delta, 1)
    setYear(date.getFullYear())
    setMonth(date.getMonth())
    setSelectedDay(1)
  }

  function goToToday() {
    setYear(today.getFullYear())
    setMonth(today.getMonth())
    setSelectedDay(today.getDate())
  }

  function openSheet() {
    setDraftFilters(filters)
    setSheetOpen(true)
  }

  function applySheet() {
    setFilters({ ...draftFilters, myTrips: true })
    setSheetOpen(false)
  }

  return (
    <div className="calendar-page">
      <Header active={active} onNavigate={onNavigate} />
      <div className="calendar-page__shell">
        <main className="calendar-page__main">
          <div className="calendar-page__heading">
            <div>
              <h1 className="calendar-page__title">Calendar</h1>
              <p className="calendar-page__subtitle">
                Track trips across My Trips, Shared, and My Circle
              </p>
            </div>
            <button
              className="calendar-page__filter-btn"
              type="button"
              aria-label="Filter trips"
              onClick={openSheet}
            >
              <SlidersHorizontal size={18} strokeWidth={1.75} />
            </button>
          </div>

          <div className="calendar-legend" aria-label="Color key">
            {Object.values(FILTERS).map((filter) => {
              const Icon = FILTER_ICONS[filter.id]
              const active = filters[filter.id]
              return (
                <button
                  key={filter.id}
                  type="button"
                  className={`calendar-legend__item${
                    active ? '' : ' calendar-legend__item--off'
                  }`}
                  onClick={() => {
                    if (filter.locked) return
                    setFilters((current) => ({
                      ...current,
                      [filter.id]: !current[filter.id],
                    }))
                  }}
                  disabled={filter.locked}
                >
                  <span
                    className="calendar-legend__swatch"
                    style={{ backgroundColor: filter.color }}
                  />
                  <Icon size={13} fill="currentColor" strokeWidth={0} />
                  <span>{filter.label}</span>
                </button>
              )
            })}
          </div>

          <section className="calendar-board" aria-label="Month calendar">
            <div className="calendar-toolbar">
              <div className="calendar-toolbar__left">
                <button
                  type="button"
                  className="calendar-toolbar__today"
                  onClick={goToToday}
                >
                  Today
                </button>
                <div className="calendar-toolbar__nav">
                  <button
                    type="button"
                    className="calendar-toolbar__icon-btn"
                    aria-label="Previous month"
                    onClick={() => shiftMonth(-1)}
                  >
                    <ChevronLeft size={18} strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    className="calendar-toolbar__icon-btn"
                    aria-label="Next month"
                    onClick={() => shiftMonth(1)}
                  >
                    <ChevronRight size={18} strokeWidth={2} />
                  </button>
                </div>
                <h2 className="calendar-toolbar__title">
                  {MONTH_NAMES[month]} {year}
                </h2>
              </div>

              <div className="calendar-toolbar__right">
                <button type="button" className="calendar-toolbar__view">
                  Month
                  <ChevronDown size={14} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  className="calendar-toolbar__new"
                  onClick={() => onNavigate?.('plan')}
                >
                  <Plus size={16} strokeWidth={2} />
                  New trip
                </button>
              </div>
            </div>

            <div className="calendar-grid">
              <div className="calendar-grid__weekdays">
                {WEEKDAYS.map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className="calendar-grid__body">
                {weeks.map((week, weekIndex) => {
                  const laneCount = (maxLaneByWeek.get(weekIndex) ?? -1) + 1
                  const weekMinHeight = 88 + Math.max(laneCount, 1) * 24

                  return (
                    <div
                      key={`week-${weekIndex}`}
                      className="calendar-grid__week"
                      style={{ minHeight: weekMinHeight }}
                    >
                      {week.map((cell, dayIndex) => {
                        const absoluteIndex = weekIndex * 7 + dayIndex
                        const isSelected =
                          cell.inMonth && cell.day === selectedDay
                        const isToday =
                          cell.inMonth &&
                          isCurrentMonth &&
                          cell.day === today.getDate()

                        return (
                          <button
                            key={`day-${absoluteIndex}`}
                            type="button"
                            className={`calendar-grid__day${
                              cell.inMonth ? '' : ' calendar-grid__day--muted'
                            }${isSelected ? ' calendar-grid__day--selected' : ''}${
                              isToday ? ' calendar-grid__day--today' : ''
                            }`}
                            onClick={() => {
                              if (!cell.inMonth) {
                                shiftMonth(cell.monthOffset)
                                setSelectedDay(cell.day)
                                return
                              }
                              setSelectedDay(cell.day)
                            }}
                          >
                            <span className="calendar-grid__day-number">
                              {cell.day}
                            </span>
                          </button>
                        )
                      })}

                      {eventSegments
                        .filter(
                          (segment) =>
                            Math.floor(segment.startIndex / 7) === weekIndex,
                        )
                        .map((segment) => {
                          const startCol = segment.startIndex % 7
                          const endCol = segment.endIndex % 7
                          const span = endCol - startCol + 1
                          const continuesLeft = startCol === 0 && !segment.isStart
                          const continuesRight =
                            endCol === 6 &&
                            segment.trip.endDay >
                              cells[segment.endIndex].day

                          return (
                            <div
                              key={segment.key}
                              className={`calendar-grid__event${
                                continuesLeft
                                  ? ' calendar-grid__event--continues-left'
                                  : ''
                              }${
                                continuesRight
                                  ? ' calendar-grid__event--continues-right'
                                  : ''
                              }`}
                              style={{
                                left: `calc(${(startCol / 7) * 100}% + 4px)`,
                                width: `calc(${(span / 7) * 100}% - 8px)`,
                                top: `${34 + segment.lane * 24}px`,
                                backgroundColor:
                                  FILTERS[segment.trip.filter].color,
                              }}
                              title={segment.trip.title}
                            >
                              <span>{segment.trip.calendarLabel}</span>
                            </div>
                          )
                        })}
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          <section className="calendar-trips" aria-label="Trips this month">
            <h2 className="calendar-trips__heading">
              {MONTH_NAMES[month]} trips · {visibleTrips.length}
            </h2>
            <div className="calendar-trips__list">
              {visibleTrips.length === 0 ? (
                <p className="calendar-trips__empty">No trips for these filters.</p>
              ) : (
                visibleTrips.map((trip) => {
                  const filter = FILTERS[trip.filter]
                  const Icon = FILTER_ICONS[trip.filter]
                  return (
                    <article
                      key={trip.id}
                      className={`trip-card${
                        trip.id === 'swiss' ? ' trip-card--clickable' : ''
                      }`}
                      role={trip.id === 'swiss' ? 'button' : undefined}
                      tabIndex={trip.id === 'swiss' ? 0 : undefined}
                      onClick={() => {
                        if (trip.id === 'swiss') onOpenItinerary?.(trip)
                      }}
                      onKeyDown={(event) => {
                        if (trip.id !== 'swiss') return
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          onOpenItinerary?.(trip)
                        }
                      }}
                    >
                      <div className="trip-card__main">
                        <div className="trip-card__media">
                          <span
                            className="trip-card__accent"
                            style={{ backgroundColor: filter.color }}
                          />
                          <img src={trip.image} alt="" />
                        </div>
                        <div className="trip-card__body">
                          <h3>{trip.title}</h3>
                          <p>{trip.rangeLabel}</p>
                          <div className="trip-card__meta">
                            <span
                              className="trip-card__tag"
                              style={{ backgroundColor: filter.color }}
                            >
                              <Icon size={14} fill="currentColor" strokeWidth={0} />
                              {filter.label}
                            </span>
                            <div className="trip-card__avatars">
                              {trip.avatars.map((avatar) => (
                                <img key={avatar} src={avatar} alt="" />
                              ))}
                              {trip.extraPeople > 0 ? (
                                <span className="trip-card__more">
                                  +{trip.extraPeople}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="trip-card__days">
                        <strong>{trip.days}</strong>
                        <span>days</span>
                      </div>
                    </article>
                  )
                })
              )}
            </div>
          </section>
        </main>
      </div>
      <TabBar active={active} onNavigate={onNavigate} />

      {sheetOpen ? (
        <div className="filter-sheet" role="dialog" aria-modal="true" aria-label="Filter trips">
          <button
            type="button"
            className="filter-sheet__backdrop"
            aria-label="Close filters"
            onClick={() => setSheetOpen(false)}
          />
          <div className="filter-sheet__panel">
            <div className="filter-sheet__grabber" />
            <div className="filter-sheet__list">
              {Object.values(FILTERS).map((filter) => {
                const checked = draftFilters[filter.id]
                const locked = filter.locked
                return (
                  <button
                    key={filter.id}
                    type="button"
                    className={`filter-sheet__row${locked ? ' filter-sheet__row--locked' : ''}${
                      checked ? ' filter-sheet__row--checked' : ''
                    }`}
                    onClick={() => {
                      if (locked) return
                      setDraftFilters((current) => ({
                        ...current,
                        [filter.id]: !current[filter.id],
                      }))
                    }}
                  >
                    <span
                      className={`filter-sheet__check${checked ? ' filter-sheet__check--on' : ''}${
                        locked ? ' filter-sheet__check--locked' : ''
                      }`}
                      style={
                        checked
                          ? { backgroundColor: filter.color, borderColor: filter.color }
                          : undefined
                      }
                    >
                      {checked ? <Check size={14} strokeWidth={3} /> : null}
                    </span>
                    <span
                      className="filter-sheet__swatch"
                      style={{ backgroundColor: filter.color }}
                    />
                    <span>{filter.label}</span>
                  </button>
                )
              })}
            </div>
            <button
              type="button"
              className="filter-sheet__apply"
              onClick={applySheet}
            >
              Apply
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
