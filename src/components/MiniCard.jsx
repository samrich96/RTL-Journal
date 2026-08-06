import { CircleDollarSign, Star } from 'lucide-react'
import UserPill from './UserPill'
import './MiniCard.css'

export default function MiniCard({ itinerary, onOpen }) {
  const isLodging = itinerary.variant === 'lodging'
  const clickable = typeof onOpen === 'function'

  return (
    <article
      className={`mini-card${isLodging ? ' mini-card--lodging' : ''}${
        clickable ? ' mini-card--clickable' : ''
      }`}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={() => onOpen?.(itinerary)}
      onKeyDown={(event) => {
        if (!clickable) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen?.(itinerary)
        }
      }}
    >
      <div className="mini-card__media">
        <img
          className="mini-card__image"
          src={itinerary.image}
          alt=""
        />
        {!isLodging && itinerary.author ? (
          <div className="mini-card__overlay">
            <UserPill
              avatar={itinerary.avatar}
              name={itinerary.author}
              badge={itinerary.badge}
              size="mini"
            />
          </div>
        ) : null}
      </div>
      <div className="mini-card__body">
        <h3 className="mini-card__title">{itinerary.title}</h3>
        <div className="mini-card__meta">
          <div className="mini-card__flags">
            {itinerary.flags.map((flag) => (
              <img key={flag} src={flag} alt="" className="mini-card__flag" />
            ))}
          </div>
          {isLodging ? (
            <>
              <div className="mini-card__cost">
                <Star size={12} strokeWidth={1.75} />
                <span>{itinerary.lodgingType}</span>
              </div>
              <div className="mini-card__cost mini-card__cost--rating">
                <Star size={12} strokeWidth={0} fill="#fab005" color="#fab005" />
                <span>{itinerary.rating}</span>
              </div>
            </>
          ) : (
            <div className="mini-card__cost">
              <CircleDollarSign size={14} strokeWidth={1.75} />
              <span>{itinerary.price}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
