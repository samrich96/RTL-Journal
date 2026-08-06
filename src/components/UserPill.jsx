import { Crown, Star, Users } from 'lucide-react'
import './UserPill.css'

const badgeIcons = {
  star: Star,
  group: Users,
  crown: Crown,
}

const badgeColors = {
  star: 'rgba(70, 174, 36, 0.85)',
  group: 'rgba(91, 82, 132, 0.85)',
  crown: 'rgba(4, 97, 118, 0.85)',
}

export default function UserPill({
  avatar,
  name,
  badge,
  size = 'mini',
}) {
  const BadgeIcon = badge ? badgeIcons[badge] : null

  return (
    <div className={`user-pill user-pill--${size}`}>
      <div className="user-pill__identity">
        <img
          className="user-pill__avatar"
          src={avatar}
          alt=""
          width={size === 'mini' ? 20 : 26}
          height={size === 'mini' ? 20 : 26}
        />
        <span className="user-pill__name">{name}</span>
      </div>
      {BadgeIcon ? (
        <span
          className="user-pill__badge"
          style={{ backgroundColor: badgeColors[badge] }}
          aria-hidden
        >
          <BadgeIcon size={size === 'mini' ? 10 : 12} fill="currentColor" strokeWidth={0} />
        </span>
      ) : null}
    </div>
  )
}
