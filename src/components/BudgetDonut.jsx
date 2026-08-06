import {
  BedDouble,
  Camera,
  Car,
  CircleDollarSign,
  Plane,
  Ticket,
  Utensils,
} from 'lucide-react'
import './BudgetDonut.css'

const SIZE = 280
const CX = SIZE / 2
const CY = SIZE / 2
const STROKE = 36
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
/* Round caps extend STROKE/2 past each dash end, so GAP must exceed STROKE
   for a visible white gap between segments. */
const GAP = STROKE + 16
const ICON_SIZE = 14

const ICONS = {
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

/** Angle 0 = top, clockwise — matches visual donut after -90° SVG rotation */
function polar(r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: CX + r * Math.cos(rad),
    y: CY + r * Math.sin(rad),
  }
}

export default function BudgetDonut({ categories, selectedId = null, onSelect }) {
  const sum = categories.reduce((acc, row) => acc + row.amount, 0) || 1
  const usable = Math.max(CIRCUMFERENCE - GAP * categories.length, 0)
  const selected = categories.find((row) => row.id === selectedId)
  const displayTotal = selected ? selected.amount : sum
  const displayPct = selected
    ? `${Math.round((selected.amount / sum) * 100)}%`
    : '100%'

  let cursor = 0
  const segments = categories.map((row) => {
    const length = (row.amount / sum) * usable
    const startAngle = (cursor / CIRCUMFERENCE) * 360
    const sweep = (length / CIRCUMFERENCE) * 360
    const midAngle = startAngle + sweep / 2
    const iconPos = polar(RADIUS, midAngle)
    const gradFrom = polar(RADIUS + STROKE / 2, midAngle)
    const gradTo = polar(RADIUS - STROKE / 2, midAngle)
    const segment = {
      ...row,
      length,
      dashOffset: cursor,
      iconPos,
      gradFrom,
      gradTo,
      Icon: ICONS[row.icon] || CircleDollarSign,
    }
    cursor += length + GAP
    return segment
  })

  function handleSelect(id) {
    onSelect?.(selectedId === id ? null : id)
  }

  return (
    <div className="budget-donut" aria-label="Expense breakdown chart">
      <svg
        className="budget-donut__svg"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={SIZE}
        height={SIZE}
        role="img"
      >
        <defs>
          {segments.map((segment) => (
            <linearGradient
              key={`grad-${segment.id}`}
              id={`budget-grad-${segment.id}`}
              gradientUnits="userSpaceOnUse"
              x1={segment.gradFrom.x}
              y1={segment.gradFrom.y}
              x2={segment.gradTo.x}
              y2={segment.gradTo.y}
            >
              <stop offset="0%" stopColor={segment.gradientFrom} />
              <stop offset="100%" stopColor={segment.color} />
            </linearGradient>
          ))}
        </defs>

        <g transform={`rotate(-90 ${CX} ${CY})`}>
          {segments.map((segment) => {
            const dimmed = selectedId && selectedId !== segment.id
            return (
              <circle
                key={segment.id}
                cx={CX}
                cy={CY}
                r={RADIUS}
                fill="none"
                stroke={`url(#budget-grad-${segment.id})`}
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={`${segment.length} ${CIRCUMFERENCE - segment.length}`}
                strokeDashoffset={-segment.dashOffset}
                className={`budget-donut__segment${
                  dimmed ? ' budget-donut__segment--dimmed' : ''
                }${
                  selectedId === segment.id ? ' budget-donut__segment--active' : ''
                }`}
                onClick={() => handleSelect(segment.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    handleSelect(segment.id)
                  }
                }}
                role="button"
                tabIndex={0}
                aria-pressed={selectedId === segment.id}
                aria-label={`${segment.label}, ${formatMoney(segment.amount)}`}
              >
                <title>
                  {segment.label}: {formatMoney(segment.amount)}
                </title>
              </circle>
            )
          })}
        </g>
      </svg>

      <div className="budget-donut__icons" aria-hidden>
        {segments.map((segment) => {
          const Icon = segment.Icon
          const dimmed = selectedId && selectedId !== segment.id
          return (
            <button
              key={`icon-${segment.id}`}
              type="button"
              className={`budget-donut__icon-btn${
                dimmed ? ' budget-donut__icon-btn--dimmed' : ''
              }`}
              style={{
                left: `${(segment.iconPos.x / SIZE) * 100}%`,
                top: `${(segment.iconPos.y / SIZE) * 100}%`,
              }}
              onClick={() => handleSelect(segment.id)}
              tabIndex={-1}
              aria-hidden
            >
              <Icon size={ICON_SIZE} strokeWidth={2.4} color="#fffefd" />
            </button>
          )
        })}
      </div>

      <button
        type="button"
        className="budget-donut__center"
        onClick={() => onSelect?.(null)}
        aria-label="Show all categories"
      >
        <CircleDollarSign size={26} strokeWidth={1.6} color="#2b2b2b" />
        <p className="budget-donut__label">Estimated spend</p>
        <p className="budget-donut__total">{formatMoney(displayTotal)}</p>
        <p className="budget-donut__pct">{displayPct}</p>
      </button>
    </div>
  )
}
