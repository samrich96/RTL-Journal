import { useEffect, useState } from 'react'
import { planCollage } from '../data/planCollage'
import Header from '../components/Header'
import TabBar from '../components/TabBar'
import './Plan.css'

const COLLAGE_BASE_WIDTH = 316

/** Comfortable read time before the next quote */
const QUOTE_INTERVAL_MS = 5000

const PLAN_QUOTES = [
  {
    body: 'Who needs a tour guide when you have a Type-A friend with a detailed itinerary?',
    attribution: 'The rest of the group chat',
  },
  {
    body: 'Nothing tests a friendship like deciding where to eat.',
    attribution: 'Every vacation',
  },
  {
    body: 'Some people collect souvenirs. We collect inside jokes.',
    attribution: 'Every great trip',
  },
  {
    body: "I'm just here to carry the emotional support snacks.",
    attribution: 'The least organized friend',
  },
  {
    body: "I didn't overpack. I packed for every possible version of myself.",
    attribution: 'Every overpacker ever',
  },
]

export default function Plan({ active = 'plan', onNavigate }) {
  const [animateIn, setAnimateIn] = useState(false)
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [quoteVisible, setQuoteVisible] = useState(true)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimateIn(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    let fadeTimer = 0
    const interval = window.setInterval(() => {
      setQuoteVisible(false)
      fadeTimer = window.setTimeout(() => {
        setQuoteIndex((current) => (current + 1) % PLAN_QUOTES.length)
        setQuoteVisible(true)
      }, 320)
    }, QUOTE_INTERVAL_MS)

    return () => {
      window.clearInterval(interval)
      window.clearTimeout(fadeTimer)
    }
  }, [])

  const quote = PLAN_QUOTES[quoteIndex]

  return (
    <div className={`plan${animateIn ? ' plan--ready' : ''}`}>
      <Header active={active} onNavigate={onNavigate} />
      <div className="plan__shell">
        <main className="plan__main">
          <section className="plan-hero" aria-label="Travel inspiration collage">
            <div className="plan-collage">
              {planCollage.map((photo, index) => {
                const isCenter = photo.id === 'center'
                const delay = isCenter ? 0.42 : 0.05 + index * 0.045
                const fromX = (photo.x - 42) * 2.4
                const fromY = (photo.y - 45) * 2.4

                return (
                  <div
                    key={photo.id}
                    className={`plan-collage__item${
                      isCenter ? ' plan-collage__item--center' : ''
                    }`}
                    style={{
                      left: `${photo.x}%`,
                      top: `${photo.y}%`,
                      width: `${(photo.size / COLLAGE_BASE_WIDTH) * 100}%`,
                      ['--rotate']: `${photo.rotate}deg`,
                      ['--from-x']: `${fromX}px`,
                      ['--from-y']: `${fromY}px`,
                      ['--delay']: `${delay}s`,
                      ['--float-amp']: isCenter ? '4px' : `${5 + (index % 3) * 2}px`,
                      zIndex: isCenter ? 3 : 1,
                    }}
                  >
                    <img src={photo.src} alt="" />
                  </div>
                )
              })}
            </div>
          </section>

          <section className="plan-copy">
            <h1 className="plan-copy__title">A new adventure awaits</h1>
            <div
              className={`plan-copy__quote${
                quoteVisible ? ' plan-copy__quote--visible' : ''
              }`}
              aria-live="polite"
            >
              <p className="plan-copy__body">{quote.body}</p>
              <p className="plan-copy__attribution">— {quote.attribution}</p>
            </div>
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
