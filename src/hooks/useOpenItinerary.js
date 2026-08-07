import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import {
  isSwitzerlandItinerary,
  SWISS_ITINERARY_ID,
} from '../data/switzerlandItinerary'
import { paths } from '../routes/paths'

export function useOpenItinerary() {
  const navigate = useNavigate()

  return useCallback(
    (item) => {
      if (!isSwitzerlandItinerary(item)) return
      navigate(paths.itinerary(SWISS_ITINERARY_ID))
    },
    [navigate],
  )
}
