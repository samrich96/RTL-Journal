import { useState } from 'react'
import Discover from './pages/Discover'
import Plan from './pages/Plan'
import Calendar from './pages/Calendar'
import Profile from './pages/Profile'
import Search from './pages/Search'
import ItineraryDetail from './pages/ItineraryDetail'
import {
  isSwitzerlandItinerary,
  SWISS_ITINERARY_ID,
} from './data/switzerlandItinerary'

export default function App() {
  const [active, setActive] = useState('discover')
  const [returnTo, setReturnTo] = useState('discover')
  const [openItineraryId, setOpenItineraryId] = useState(null)

  function navigate(id) {
    setActive((current) => {
      if (id === 'search' && current !== 'search') {
        setReturnTo(current)
      }
      return id
    })
  }

  function closeSearch() {
    setActive(returnTo || 'discover')
  }

  function openItinerary(item) {
    if (!isSwitzerlandItinerary(item)) return
    setOpenItineraryId(SWISS_ITINERARY_ID)
  }

  const pageProps = {
    active,
    onNavigate: navigate,
    onOpenItinerary: openItinerary,
  }

  return (
    <>
      {active === 'search' ? (
        <Search {...pageProps} onClose={closeSearch} />
      ) : active === 'plan' ? (
        <Plan {...pageProps} />
      ) : active === 'calendar' ? (
        <Calendar {...pageProps} />
      ) : active === 'profile' ? (
        <Profile {...pageProps} />
      ) : (
        <Discover {...pageProps} />
      )}

      {openItineraryId === SWISS_ITINERARY_ID ? (
        <ItineraryDetail onClose={() => setOpenItineraryId(null)} />
      ) : null}
    </>
  )
}
