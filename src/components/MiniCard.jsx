import { CircleDollarSign } from 'lucide-react'
import UserPill from './UserPill'
import './MiniCard.css'

export default function MiniCard({ itinerary }) {
  return (
    <article className="mini-card">
      <div className="mini-card__media">
        <img
          className="mini-card__image"
          src={itinerary.image}
          alt=""
        />
        <div className="mini-card__overlay">
          <UserPill
            avatar={itinerary.avatar}
            name={itinerary.author}
            badge={itinerary.badge}
            size="mini"
          />
        </div>
      </div>
      <div className="mini-card__body">
        <h3 className="mini-card__title">{itinerary.title}</h3>
        <div className="mini-card__meta">
          <div className="mini-card__flags">
            {itinerary.flags.map((flag) => (
              <img key={flag} src={flag} alt="" className="mini-card__flag" />
            ))}
          </div>
          <div className="mini-card__cost">
            <CircleDollarSign size={14} strokeWidth={1.75} />
            <span>{itinerary.price}</span>
          </div>
        </div>
      </div>
    </article>
  )
}
