import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Crown,
  Plus,
  SlidersHorizontal,
  Star,
  Users,
} from 'lucide-react'
import FilterSheet from '../components/FilterSheet'
import { useOpenItinerary } from '../hooks/useOpenItinerary'
import { paths } from '../routes/paths'
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

function parseTripDate(value) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function cellDate(viewYear, viewMonth, cell) {
  return new Date(viewYear, viewMonth + cell.monthOffset, cell.day)
}

function tripOverlapsMonth(trip, viewYear, viewMonth) {
  const tripStart = parseTripDate(trip.startDate)
  const tripEnd = parseTripDate(trip.endDate)
  const monthStart = new Date(viewYear, viewMonth, 1)
  const monthEnd = new Date(viewYear, viewMonth + 1, 0)
  return tripStart <= monthEnd && tripEnd >= monthStart
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
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

function getEventSegments(trip, cells, viewYear, viewMonth) {
  const tripStart = startOfDay(parseTripDate(trip.startDate))
  const tripEnd = startOfDay(parseTripDate(trip.endDate))
  const segments = []
  let current = null

  cells.forEach((cell, index) => {
    const date = startOfDay(cellDate(viewYear, viewMonth, cell))
    const inRange = date >= tripStart && date <= tripEnd
    const isStart = sameDay(date, tripStart)
    const isEnd = sameDay(date, tripEnd)

    if (inRange) {
      if (!current) {
        current = {
          startIndex: index,
          endIndex: index,
          label: trip.calendarLabel,
          isStart,
          isEnd,
        }
      } else {
        current.endIndex = index
        current.isEnd = isEnd
      }

      if ((index + 1) % 7 === 0 || isEnd) {
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

export default function Calendar() {
  const navigate = useNavigate()
  const onOpenItinerary = useOpenItinerary()
  const today = useMemo(() => new Date(), [])
  const [year, setYear] = useState(() => today.getFullYear())
  const [month, setMonth] = useState(() => today.getMonth())
  const [selectedDate, setSelectedDate] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth(),
    day: today.getDate(),
  }))
  const [filters, setFilters] = useState({
    myTrips: true,
    shared: true,
    myCircle: true,
  })
  const [draftFilters, setDraftFilters] = useState(filters)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerYear, setPickerYear] = useState(year)
  const pickerRef = useRef(null)

  useEffect(() => {
    if (!pickerOpen) return undefined

    function handlePointerDown(event) {
      if (!pickerRef.current?.contains(event.target)) {
        setPickerOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') setPickerOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [pickerOpen])

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
          filters[trip.filter] && tripOverlapsMonth(trip, year, month),
      ),
    [filters, month, year],
  )

  const eventSegments = useMemo(() => {
    const segments = visibleTrips.flatMap((trip) =>
      getEventSegments(trip, cells, year, month).map((segment, index) => ({
        ...segment,
        trip,
        key: `${trip.id}-${index}`,
      })),
    )
    return assignEventLanes(segments)
  }, [cells, visibleTrips, year, month])

  const maxLaneByWeek = useMemo(() => {
    const map = new Map()
    eventSegments.forEach((segment) => {
      const weekIndex = Math.floor(segment.startIndex / 7)
      map.set(weekIndex, Math.max(map.get(weekIndex) ?? 0, segment.lane))
    })
    return map
  }, [eventSegments])

  function shiftMonth(delta) {
    const date = new Date(year, month + delta, 1)
    setYear(date.getFullYear())
    setMonth(date.getMonth())
  }

  function openMonthPicker() {
    setPickerYear(year)
    setPickerOpen((open) => !open)
  }

  function jumpToMonth(nextYear, nextMonth) {
    setYear(nextYear)
    setMonth(nextMonth)
    setPickerOpen(false)
  }

  function goToToday() {
    const nextYear = today.getFullYear()
    const nextMonth = today.getMonth()
    const nextDay = today.getDate()
    setYear(nextYear)
    setMonth(nextMonth)
    setSelectedDate({ year: nextYear, month: nextMonth, day: nextDay })
    setPickerOpen(false)
  }

  function selectDay(cell) {
    const nextYear = cell.inMonth
      ? year
      : new Date(year, month + cell.monthOffset, 1).getFullYear()
    const nextMonth = cell.inMonth
      ? month
      : new Date(year, month + cell.monthOffset, 1).getMonth()

    if (!cell.inMonth) {
      shiftMonth(cell.monthOffset)
    }

    setSelectedDate({
      year: nextYear,
      month: nextMonth,
      day: cell.day,
    })
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
                <div className="calendar-toolbar__picker" ref={pickerRef}>
                  <button
                    type="button"
                    className="calendar-toolbar__title-btn"
                    aria-haspopup="dialog"
                    aria-expanded={pickerOpen}
                    aria-label={`Choose month, currently ${MONTH_NAMES[month]} ${year}`}
                    onClick={openMonthPicker}
                  >
                    <span className="calendar-toolbar__title">
                      {MONTH_NAMES[month]} {year}
                    </span>
                    <ChevronDown
                      size={18}
                      strokeWidth={2}
                      className={`calendar-toolbar__title-chevron${
                        pickerOpen ? ' calendar-toolbar__title-chevron--open' : ''
                      }`}
                      aria-hidden
                    />
                  </button>

                  {pickerOpen ? (
                    <div
                      className="calendar-month-picker"
                      role="dialog"
                      aria-label="Choose month and year"
                    >
                      <div className="calendar-month-picker__year">
                        <button
                          type="button"
                          className="calendar-toolbar__icon-btn"
                          aria-label="Previous year"
                          onClick={() => setPickerYear((current) => current - 1)}
                        >
                          <ChevronLeft size={18} strokeWidth={2} />
                        </button>
                        <span className="calendar-month-picker__year-label">
                          {pickerYear}
                        </span>
                        <button
                          type="button"
                          className="calendar-toolbar__icon-btn"
                          aria-label="Next year"
                          onClick={() => setPickerYear((current) => current + 1)}
                        >
                          <ChevronRight size={18} strokeWidth={2} />
                        </button>
                      </div>
                      <div className="calendar-month-picker__months" role="listbox">
                        {MONTH_NAMES.map((name, index) => {
                          const isActive =
                            pickerYear === year && index === month
                          const isCurrent =
                            pickerYear === today.getFullYear() &&
                            index === today.getMonth()
                          return (
                            <button
                              key={name}
                              type="button"
                              role="option"
                              aria-selected={isActive}
                              className={`calendar-month-picker__month${
                                isActive ? ' calendar-month-picker__month--active' : ''
                              }${
                                isCurrent ? ' calendar-month-picker__month--today' : ''
                              }`}
                              onClick={() => jumpToMonth(pickerYear, index)}
                            >
                              {name.slice(0, 3)}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="calendar-toolbar__right">
                <button
                  type="button"
                  className="calendar-toolbar__new"
                  onClick={() => navigate(paths.plan)}
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
                          cell.inMonth &&
                          selectedDate?.year === year &&
                          selectedDate?.month === month &&
                          selectedDate?.day === cell.day
                        const isToday =
                          cell.inMonth &&
                          year === today.getFullYear() &&
                          month === today.getMonth() &&
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
                            aria-current={isToday ? 'date' : undefined}
                            onClick={() => selectDay(cell)}
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
                          const continuesRight = endCol === 6 && !segment.isEnd

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

      <FilterSheet
        open={sheetOpen}
        label="Filter trips"
        options={Object.values(FILTERS)}
        values={draftFilters}
        onToggle={(id) =>
          setDraftFilters((current) => ({
            ...current,
            [id]: !current[id],
          }))
        }
        onClose={() => setSheetOpen(false)}
        onApply={applySheet}
      />
    </div>
  )
}
