import { ChevronRight } from 'lucide-react'
import Header from '../components/Header'
import MiniCard from '../components/MiniCard'
import BigCard from '../components/BigCard'
import CategoryPills from '../components/CategoryPills'
import TabBar from '../components/TabBar'
import { allItineraries, popularItineraries } from '../data/itineraries'
import './Discover.css'

export default function Discover() {
  return (
    <div className="discover">
      <div className="discover__shell">
        <Header />
        <main className="discover__main">
          <section className="popular">
            <div className="popular__heading">
              <h2 className="section-title">Popular Itineraries</h2>
              <ChevronRight size={17} color="#bdbdbd" strokeWidth={2.5} aria-hidden />
            </div>
            <div className="popular__scroll">
              {popularItineraries.map((itinerary) => (
                <MiniCard key={itinerary.id} itinerary={itinerary} />
              ))}
            </div>
          </section>

          <CategoryPills />

          <section className="feed" aria-label="All itineraries">
            {allItineraries.map((itinerary) => (
              <BigCard key={itinerary.id} itinerary={itinerary} />
            ))}
          </section>
        </main>
      </div>
      <TabBar />
    </div>
  )
}
