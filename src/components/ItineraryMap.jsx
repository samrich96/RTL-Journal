import { useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { PIN_STYLES } from '../data/switzerlandItinerary'
import 'leaflet/dist/leaflet.css'
import './ItineraryMap.css'

const ICON_SVGS = {
  lodging:
    '<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fffefd" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M12 4v6"/></svg>',
  food:
    '<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fffefd" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>',
  activity:
    '<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fffefd" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>',
  photoshoot:
    '<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fffefd" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>',
}

function FitBounds({ pins, recenterToken }) {
  const map = useMap()
  const didMount = useRef(false)

  useEffect(() => {
    if (!pins.length) return
    const bounds = L.latLngBounds(pins.map((pin) => [pin.lat, pin.lng]))
    map.fitBounds(bounds.pad(0.28), { animate: didMount.current })
    didMount.current = true
  }, [map, pins, recenterToken])

  return null
}

function InvalidateSize({ sheetState }) {
  const map = useMap()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize()
    }, 280)
    return () => window.clearTimeout(timer)
  }, [map, sheetState])

  return null
}

function distanceKm(a, b) {
  const toRad = (degrees) => (degrees * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)))
}

/**
 * Keep event icons always. When same-type pins sit on top of each other,
 * fan them out slightly and only then show 1..n so each stop stays readable.
 */
function withClusterPresentation(pins, thresholdKm = 0.35) {
  const byType = new Map()
  pins.forEach((pin) => {
    const list = byType.get(pin.type) || []
    list.push(pin)
    byType.set(pin.type, list)
  })

  const presented = new Map()

  byType.forEach((group) => {
    const n = group.length
    const parent = group.map((_, index) => index)

    function find(index) {
      if (parent[index] !== index) parent[index] = find(parent[index])
      return parent[index]
    }

    function unite(a, b) {
      const rootA = find(a)
      const rootB = find(b)
      if (rootA !== rootB) parent[rootB] = rootA
    }

    for (let i = 0; i < n; i += 1) {
      for (let j = i + 1; j < n; j += 1) {
        if (distanceKm(group[i], group[j]) <= thresholdKm) unite(i, j)
      }
    }

    const clusters = new Map()
    group.forEach((pin, index) => {
      const root = find(index)
      const cluster = clusters.get(root) || []
      cluster.push(pin)
      clusters.set(root, cluster)
    })

    clusters.forEach((cluster) => {
      const ordered = cluster
        .slice()
        .sort(
          (a, b) => a.lat - b.lat || a.lng - b.lng || a.id.localeCompare(b.id),
        )

      if (ordered.length < 2) {
        ordered.forEach((pin) => {
          presented.set(pin.id, { ...pin, label: null })
        })
        return
      }

      // ~40m ring so stacked same-type pins don't hide each other.
      const radiusDeg = 0.00038
      ordered.forEach((pin, index) => {
        const angle = (Math.PI * 2 * index) / ordered.length - Math.PI / 2
        presented.set(pin.id, {
          ...pin,
          lat: pin.lat + Math.sin(angle) * radiusDeg,
          lng: pin.lng + Math.cos(angle) * radiusDeg,
          label: String(index + 1),
        })
      })
    })
  })

  return pins.map((pin) => presented.get(pin.id) || { ...pin, label: null })
}

function createPinIcon(pin) {
  const style = PIN_STYLES[pin.type] || PIN_STYLES.activity
  const inner = pin.label
    ? `<span class="itinerary-pin__label">${pin.label}</span>`
    : ICON_SVGS[pin.type] || ICON_SVGS.activity

  return L.divIcon({
    className: 'itinerary-pin-wrap',
    html: `<div class="itinerary-pin" style="background:${style.gradient}">${inner}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

export default function ItineraryMap({
  center,
  zoom,
  pins,
  sheetState,
  activeFilter,
  recenterToken = 0,
}) {
  const visiblePins = useMemo(() => {
    if (activeFilter === 'all') return pins
    return pins.filter((pin) => pin.type === activeFilter)
  }, [activeFilter, pins])

  const markers = useMemo(() => {
    const presented = withClusterPresentation(visiblePins)
    return presented.map((pin) => ({
      ...pin,
      icon: createPinIcon(pin),
    }))
  }, [visiblePins])

  return (
    <div
      className={`itinerary-map${
        sheetState === 'expanded' ? ' itinerary-map--dimmed' : ''
      }`}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        className="itinerary-map__canvas"
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap &copy; CARTO'
        />
        <FitBounds pins={visiblePins} recenterToken={recenterToken} />
        <InvalidateSize sheetState={sheetState} />
        {markers.map((pin) => (
          <Marker
            key={pin.id}
            position={[pin.lat, pin.lng]}
            icon={pin.icon}
            title={pin.title}
          />
        ))}
      </MapContainer>
    </div>
  )
}
