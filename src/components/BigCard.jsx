import {
  CircleDollarSign,
  Clock,
  Heart,
  MoreVertical,
} from 'lucide-react'
import UserPill from './UserPill'
import './BigCard.css'

export default function BigCard({ itinerary }) {
  return (
    <article className="big-card">
      <div className="big-card__media">
        <img className="big-card__image" src={itinerary.image} alt="" />
        <div className="big-card__overlay">
          <UserPill
            avatar={itinerary.avatar}
            name={itinerary.author}
            badge={itinerary.badge}
            size="big"
          />
          <button className="big-card__favorite" type="button" aria-label="Save itinerary">
            <Heart size={18} strokeWidth={1.75} />
          </button>
        </div>
      </div>
      <div className="big-card__footer">
        <div className="big-card__info">
          <h3 className="big-card__title">{itinerary.title}</h3>
          <div className="big-card__meta">
            <div className="big-card__flags">
              {itinerary.flags.map((flag) => (
                <img key={flag} src={flag} alt="" className="big-card__flag" />
              ))}
              {itinerary.extraFlags ? (
                <span className="big-card__more-flags">+{itinerary.extraFlags}</span>
              ) : null}
            </div>
            <div className="big-card__stat">
              <CircleDollarSign size={16} strokeWidth={1.75} />
              <span>{itinerary.price}</span>
            </div>
            <div className="big-card__stat">
              <Clock size={16} strokeWidth={1.75} />
              <span>{itinerary.duration}</span>
            </div>
          </div>
        </div>
        <button className="big-card__menu" type="button" aria-label="More options">
          <MoreVertical size={20} strokeWidth={1.75} />
        </button>
      </div>
    </article>
  )
}
