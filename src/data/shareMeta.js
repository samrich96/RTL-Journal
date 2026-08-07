/** Site name used in Open Graph / Twitter cards */
export const SITE_NAME = 'RTL Journal'

const DEFAULT_DESCRIPTION =
  'Browse · Plan · Travel — discover places through real itineraries.'

const PROFILE = {
  name: 'Samantha Richards',
  handle: 'sammy_bammy_',
  bio: 'NYC Based traveler! Always traveling direct flights with my husband! View all my travel recs. and past itineraries',
  itinerariesCount: 6,
  countriesCount: 14,
  cover: '/assets/profile-cover.png',
}

const SWISS_ITINERARY = {
  id: 'switzerland-baecation',
  title: 'Switzerland Baecation',
  price: '3,877',
  duration: '5 Days',
  hero: '/assets/swiss-hero.png',
  description:
    'A romantic 5-day escape through alpine lakes, mountain trains, and cozy Swiss villages.',
}

/**
 * Resolve absolute asset URL for crawlers (iMessage, Slack, etc.).
 * @param {string} baseUrl e.g. https://example.com
 * @param {string} assetPath e.g. /assets/swiss-hero.png
 */
export function absoluteUrl(baseUrl, assetPath) {
  const base = (baseUrl || '').replace(/\/$/, '')
  if (!assetPath) return `${base}/assets/logo.png`
  if (/^https?:\/\//i.test(assetPath)) return assetPath
  const path = assetPath.startsWith('/') ? assetPath : `/${assetPath}`
  return base ? `${base}${path}` : path
}

function normalizePath(pathname = '/') {
  if (!pathname || pathname === '') return '/'
  const withSlash = pathname.startsWith('/') ? pathname : `/${pathname}`
  if (withSlash.length > 1 && withSlash.endsWith('/')) {
    return withSlash.slice(0, -1)
  }
  return withSlash
}

/**
 * Build rich-link preview metadata for a route.
 * @param {string} pathname
 * @param {string} [baseUrl]
 */
export function getShareMeta(pathname, baseUrl = '') {
  const path = normalizePath(pathname)
  const base = (baseUrl || '').replace(/\/$/, '')

  // Discover / app home
  if (path === '/' || path.startsWith('/discover')) {
    return {
      type: 'website',
      title: `${SITE_NAME} — Discover itineraries`,
      description: DEFAULT_DESCRIPTION,
      image: absoluteUrl(base, '/assets/big-2.png'),
      imageAlt: 'Featured travel itineraries on RTL Journal',
      url: base ? `${base}/` : '/',
      siteName: SITE_NAME,
    }
  }

  // Profile (and vanity /profile/:handle)
  if (path === '/profile' || path.startsWith('/profile/')) {
    return {
      type: 'profile',
      title: `${PROFILE.name} (@${PROFILE.handle}) · ${SITE_NAME}`,
      description:
        PROFILE.bio ||
        `${PROFILE.itinerariesCount} itineraries · ${PROFILE.countriesCount} countries`,
      image: absoluteUrl(base, PROFILE.cover),
      imageAlt: `${PROFILE.name}'s profile on RTL Journal`,
      url: base ? `${base}/profile/${PROFILE.handle}` : `/profile/${PROFILE.handle}`,
      siteName: SITE_NAME,
    }
  }

  // Itinerary detail
  const itineraryMatch = path.match(/^\/itineraries\/([^/]+)$/)
  if (itineraryMatch) {
    const id = itineraryMatch[1]
    if (id === SWISS_ITINERARY.id) {
      const blurb = SWISS_ITINERARY.description.slice(0, 140)
      return {
        type: 'article',
        title: `${SWISS_ITINERARY.title} · ${SITE_NAME}`,
        description: `${SWISS_ITINERARY.duration} · $${SWISS_ITINERARY.price} per traveler — ${blurb}`,
        image: absoluteUrl(base, SWISS_ITINERARY.hero),
        imageAlt: SWISS_ITINERARY.title,
        url: base ? `${base}/itineraries/${id}` : `/itineraries/${id}`,
        siteName: SITE_NAME,
      }
    }

    return {
      type: 'article',
      title: `Itinerary · ${SITE_NAME}`,
      description: DEFAULT_DESCRIPTION,
      image: absoluteUrl(base, '/assets/big-2.png'),
      imageAlt: 'RTL Journal itinerary',
      url: base ? `${base}/itineraries/${id}` : `/itineraries/${id}`,
      siteName: SITE_NAME,
    }
  }

  // Fallback — app / discover
  return {
    type: 'website',
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    image: absoluteUrl(base, '/assets/logo.png'),
    imageAlt: SITE_NAME,
    url: base ? `${base}${path === '/' ? '/' : path}` : path,
    siteName: SITE_NAME,
  }
}

/**
 * Apply meta tags in the browser document head.
 * @param {ReturnType<typeof getShareMeta>} meta
 */
export function applyShareMetaToDocument(meta) {
  if (typeof document === 'undefined' || !meta) return

  document.title = meta.title

  const tags = {
    description: meta.description,
    'og:type': meta.type,
    'og:site_name': meta.siteName,
    'og:title': meta.title,
    'og:description': meta.description,
    'og:image': meta.image,
    'og:image:alt': meta.imageAlt,
    'og:url': meta.url,
    'twitter:card': 'summary_large_image',
    'twitter:title': meta.title,
    'twitter:description': meta.description,
    'twitter:image': meta.image,
    'twitter:image:alt': meta.imageAlt,
  }

  Object.entries(tags).forEach(([key, value]) => {
    if (!value) return
    if (key.startsWith('twitter:')) {
      upsertMeta('name', key, value)
      return
    }
    if (key.startsWith('og:')) {
      upsertMeta('property', key, value)
      return
    }
    upsertMeta('name', key, value)
  })

  let canonical = document.querySelector('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    document.head.appendChild(canonical)
  }
  canonical.setAttribute('href', meta.url)
}

function upsertMeta(attr, key, value) {
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}
