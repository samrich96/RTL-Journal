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

  const markers = useMemo(
    () =>
      visiblePins.map((pin) => ({
        ...pin,
        icon: createPinIcon(pin),
      })),
    [visiblePins],
  )

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
