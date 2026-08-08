import { useNavigate } from 'react-router'
import { ChevronLeft, CircleDollarSign } from 'lucide-react'
import {
  formatNotificationTime,
  groupNotificationsByDay,
} from '../data/notifications'
import { paths } from '../routes/paths'
import './Notifications.css'

function TripPreview({ itinerary }) {
  if (!itinerary) return null

  return (
    <div className="notification-trip" aria-hidden>
      <img className="notification-trip__image" src={itinerary.image} alt="" />
      <div className="notification-trip__body">
        <p className="notification-trip__title">{itinerary.title}</p>
        <div className="notification-trip__meta">
          {itinerary.flags?.length ? (
            <div className="notification-trip__flags">
              {itinerary.flags.slice(0, 3).map((flag) => (
                <img key={flag} src={flag} alt="" />
              ))}
            </div>
          ) : null}
          {itinerary.price ? (
            <span className="notification-trip__price">
              <CircleDollarSign size={12} strokeWidth={1.75} aria-hidden />
              {itinerary.price}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function NotificationMessage({ item }) {
  switch (item.type) {
    case 'closeFriendRequest':
      return (
        <p>
          <strong>{item.actor.name}</strong> {item.body}
        </p>
      )
    case 'upcomingTrip':
      return (
        <p>
          Your close friend - <strong>{item.actor.name}</strong> trip is upcoming
          in {item.daysUntil} days!
        </p>
      )
    case 'wishlist':
      return (
        <p>
          <strong>{item.actor.name}</strong> saved your trip as wishlist — “
          {item.itinerary.title}”
        </p>
      )
    case 'featured':
      return (
        <p>
          Your itinerary “{item.itinerary.title}” is featured in{' '}
          <strong>Popular itineraries</strong> this month.
        </p>
      )
    case 'profileView':
      return (
        <p>
          <strong>{item.actor.name}</strong> just viewed your profile
        </p>
      )
    default:
      return <p>{item.body}</p>
  }
}

export default function Notifications() {
  const navigate = useNavigate()
  const groups = groupNotificationsByDay()

  function handleBack() {
    if (window.history.length > 1) navigate(-1)
    else navigate(paths.home)
  }

  return (
    <div className="notifications-page">
      <div className="notifications-page__shell">
        <header className="notifications-page__toolbar">
          <button
            type="button"
            className="notifications-page__back"
            aria-label="Go back"
            onClick={handleBack}
          >
            <ChevronLeft size={20} strokeWidth={2} aria-hidden />
          </button>
          <h1>Notifications</h1>
          <span className="notifications-page__spacer" aria-hidden />
        </header>

        <main className="notifications-page__main">
          {groups.map((group) => (
            <section
              key={group.key}
              className="notifications-group"
              aria-labelledby={`notifications-${group.key}`}
            >
              <h2 id={`notifications-${group.key}`}>{group.label}</h2>
              <ul className="notifications-list">
                {group.items.map((item) => (
                  <li key={item.id} className="notification-item">
                    <div className="notification-item__row">
                      {item.actor?.avatar ? (
                        <img
                          className="notification-item__avatar"
                          src={item.actor.avatar}
                          alt=""
                          width={44}
                          height={44}
                        />
                      ) : (
                        <img
                          className="notification-item__avatar notification-item__avatar--brand"
                          src="/assets/logo.png"
                          alt=""
                          width={44}
                          height={44}
                        />
                      )}
                      <div className="notification-item__content">
                        <NotificationMessage item={item} />
                        <time dateTime={item.createdAt}>
                          {formatNotificationTime(item.createdAt)}
                        </time>
                      </div>
                    </div>
                    {item.itinerary ? <TripPreview itinerary={item.itinerary} /> : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </main>
      </div>
    </div>
  )
}
