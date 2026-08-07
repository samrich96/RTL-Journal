import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { applyShareMetaToDocument, getShareMeta } from '../data/shareMeta'

/**
 * Keeps document Open Graph / Twitter meta in sync with the current route
 * (for in-app browsers and scrapers that execute JS).
 */
export function useShareMeta() {
  const { pathname } = useLocation()

  useEffect(() => {
    const base =
      typeof window !== 'undefined' ? window.location.origin : ''
    applyShareMetaToDocument(getShareMeta(pathname, base))
  }, [pathname])
}
