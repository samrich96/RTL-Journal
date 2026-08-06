import { planCollage } from '../data/planCollage'
import Header from '../components/Header'
import TabBar from '../components/TabBar'
import './Plan.css'

const COLLAGE_BASE_WIDTH = 316

export default function Plan({ active = 'plan', onNavigate }) {
  return (
    <div className="plan">
      <Header active={active} onNavigate={onNavigate} />
      <div className="plan__shell">
        <main className="plan__main">
          <section className="plan-hero" aria-label="Travel inspiration collage">
            <div className="plan-collage">
              {planCollage.map((photo) => (
                <div
                  key={photo.id}
                  className={`plan-collage__item${photo.id === 'center' ? ' plan-collage__item--center' : ''}`}
                  style={{
                    left: `${photo.x}%`,
                    top: `${photo.y}%`,
                    width: `${(photo.size / COLLAGE_BASE_WIDTH) * 100}%`,
                    ['--rotate']: `${photo.rotate}deg`,
                  }}
                >
                  <img src={photo.src} alt="" />
                </div>
              ))}
            </div>
          </section>

          <section className="plan-copy">
            <h1 className="plan-copy__title">A new adventure awaits</h1>
            <p className="plan-copy__body">
              Who needs a tour guide when you have a Type-A friend with a detailed itinerary?
            </p>
            <p className="plan-copy__attribution">- The rest of the group chat</p>
            <button className="plan-copy__cta" type="button">
              Start planning
            </button>
          </section>
        </main>
      </div>
      <TabBar active={active} onNavigate={onNavigate} />
    </div>
  )
}
