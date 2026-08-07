import { Check } from 'lucide-react'
import './FilterSheet.css'

export default function FilterSheet({
  open,
  label = 'Filter',
  options,
  values,
  onToggle,
  onClose,
  onApply,
}) {
  if (!open) return null

  return (
    <div className="filter-sheet" role="dialog" aria-modal="true" aria-label={label}>
      <button
        type="button"
        className="filter-sheet__backdrop"
        aria-label="Close filters"
        onClick={onClose}
      />
      <div className="filter-sheet__panel">
        <div className="filter-sheet__grabber" />
        <div className="filter-sheet__list">
          {options.map((option) => {
            const checked = Boolean(values[option.id])
            const locked = Boolean(option.locked)
            return (
              <button
                key={option.id}
                type="button"
                className={`filter-sheet__row${locked ? ' filter-sheet__row--locked' : ''}${
                  checked ? ' filter-sheet__row--checked' : ''
                }`}
                onClick={() => {
                  if (locked) return
                  onToggle?.(option.id)
                }}
              >
                <span
                  className={`filter-sheet__check${checked ? ' filter-sheet__check--on' : ''}${
                    locked ? ' filter-sheet__check--locked' : ''
                  }`}
                  style={
                    checked
                      ? { backgroundColor: option.color, borderColor: option.color }
                      : undefined
                  }
                >
                  {checked ? <Check size={14} strokeWidth={3} /> : null}
                </span>
                {option.avatar ? (
                  <img
                    className="filter-sheet__avatar"
                    src={option.avatar}
                    alt=""
                    width={20}
                    height={20}
                  />
                ) : (
                  <span
                    className="filter-sheet__swatch"
                    style={{ backgroundColor: option.color }}
                    aria-hidden
                  />
                )}
                <span>{option.label}</span>
              </button>
            )
          })}
        </div>
        <button type="button" className="filter-sheet__apply" onClick={onApply}>
          Apply
        </button>
      </div>
    </div>
  )
}
