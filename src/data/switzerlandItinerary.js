export const SWISS_ITINERARY_ID = 'switzerland-baecation'

export const EVENT_FILTERS = [
  { id: 'all', label: 'All Events' },
  { id: 'food', label: 'Food & Drinks', type: 'food' },
  { id: 'activity', label: 'Activity', type: 'activity' },
  { id: 'lodging', label: 'Lodging', type: 'lodging' },
]

export const PIN_STYLES = {
  activity: {
    gradient: 'linear-gradient(180deg, #ff83de 0%, #e33299 100%)',
    solid: '#e33299',
  },
  food: {
    gradient: 'linear-gradient(180deg, #ff9700 0%, #f95200 100%)',
    solid: '#f95200',
  },
  lodging: {
    gradient: 'linear-gradient(180deg, #ca83fd 0%, #9550d1 100%)',
    solid: '#9550d1',
  },
}

export const switzerlandItinerary = {
  id: SWISS_ITINERARY_ID,
  title: 'Switzerland Baecation',
  price: '3,877',
  duration: '5 Days',
  flag: '/assets/swiss-flag.png',
  hero: '/assets/swiss-hero.png',
  coverFallback: '/assets/big-2.png',
  avatars: [
    { src: '/assets/swiss-av-1.png', badge: 'star' },
    { src: '/assets/swiss-av-2.png' },
  ],
  authors: ['Alysa Jayaramam', 'Partner'],
  mapCenter: [46.65, 8.05],
  mapZoom: 8,
  description:
    'This Switzerland baecation was about slowing down and soaking in every moment together, from quiet walks through charming towns to sunrise views over alpine lakes.',
  descriptionFull:
    'This Switzerland baecation was about slowing down and soaking in every moment together, from quiet walks through charming towns to sunrise views over alpine lakes. We mixed train rides, fondue nights, and mountain mornings — keeping the pace soft and the scenery loud.',
  overviewHighlights: [
    { label: 'Base cities', value: 'Zürich · Lucerne · Interlaken · Zermatt' },
    { label: 'Best for', value: 'Couples · Scenic trains · Soft adventure' },
    { label: 'Season', value: 'Late spring / early fall' },
  ],
  days: [
    {
      day: 1,
      title: 'Zürich arrival',
      summary: 'Old town stroll, lakeside sunset, first fondue night.',
    },
    {
      day: 2,
      title: 'Lucerne & Pilatus',
      summary: 'Chapel Bridge photos, lake cruise, mountain viewpoint.',
    },
    {
      day: 3,
      title: 'Interlaken slow day',
      summary: 'Harderbrücke brunch, soft hike, spa evening.',
    },
    {
      day: 4,
      title: 'Jungfrau region',
      summary: 'Grindelwald views, cable car, alpine picnic.',
    },
    {
      day: 5,
      title: 'Zermatt farewell',
      summary: 'Matterhorn sunrise, car-free village, train home.',
    },
  ],
  budget: [
    {
      id: 'lodging',
      label: 'Lodging',
      amount: 1640,
      icon: 'bed',
      gradientFrom: '#ca83fd',
      color: '#9550d1',
      items: [
        { name: 'Zürich boutique stay', amount: 820, note: '2 nights' },
        { name: 'Zermatt lodge', amount: 820, note: '3 nights' },
      ],
    },
    {
      id: 'flights',
      label: 'Flights',
      amount: 890,
      icon: 'plane',
      gradientFrom: '#2da5ff',
      color: '#006def',
      items: [
        { name: 'JFK → Zürich (roundtrip)', amount: 890, note: '2 travelers' },
      ],
    },
    {
      id: 'activity',
      label: 'Activity',
      amount: 680,
      icon: 'ticket',
      gradientFrom: '#ff83de',
      color: '#e33299',
      items: [
        { name: 'Pilatus ascent', amount: 180, note: 'Day 2' },
        { name: 'Jungfrau cable car', amount: 280, note: 'Day 4' },
        { name: 'Soft alpine hike', amount: 120, note: 'Day 3' },
        { name: 'City & museum entries', amount: 100, note: 'Mixed' },
      ],
    },
    {
      id: 'food',
      label: 'Food & Drinks',
      amount: 520,
      icon: 'utensils',
      gradientFrom: '#ff9700',
      color: '#f95200',
      items: [
        { name: 'Fondue night', amount: 140, note: 'Zürich' },
        { name: 'Lakeside cafés', amount: 160, note: 'Lucerne / Interlaken' },
        { name: 'Village dinners', amount: 220, note: 'Zermatt' },
      ],
    },
    {
      id: 'transportation',
      label: 'Transportation',
      amount: 127,
      icon: 'car',
      gradientFrom: '#00d958',
      color: '#00ac31',
      items: [
        { name: 'Swiss Travel Pass days', amount: 100, note: '3 days' },
        { name: 'Local transit', amount: 27, note: 'Buses & trams' },
      ],
    },
    {
      id: 'photoshoot',
      label: 'Photoshoot',
      amount: 20,
      icon: 'camera',
      gradientFrom: '#ffd500',
      color: '#ff8f00',
      items: [{ name: 'Matterhorn polaroids', amount: 20, note: 'Zermatt' }],
    },
  ],
  extras: [
    'Swiss Travel Pass for flexible train days',
    'One fancy fondue reservation on night one',
    'Pack layers — alpine mornings run cold',
    'Save offline maps for tunnel stretches',
  ],
  pins: [
    { id: 'p1', type: 'lodging', lat: 47.3769, lng: 8.5417, label: null, title: 'Zürich boutique stay' },
    { id: 'p2', type: 'activity', lat: 47.3702, lng: 8.5441, label: '2', title: 'Old town walk' },
    { id: 'p3', type: 'food', lat: 47.3673, lng: 8.5456, label: '3', title: 'Fondue night' },
    { id: 'p4', type: 'activity', lat: 47.0502, lng: 8.3093, label: '2', title: 'Chapel Bridge' },
    { id: 'p5', type: 'food', lat: 47.051, lng: 8.305, label: '2', title: 'Lakeside café' },
    { id: 'p6', type: 'activity', lat: 46.9806, lng: 8.2532, label: '4', title: 'Pilatus ascent' },
    { id: 'p7', type: 'food', lat: 46.6863, lng: 7.8632, label: '6', title: 'Interlaken brunch' },
    { id: 'p8', type: 'activity', lat: 46.6244, lng: 8.0343, label: '2', title: 'Grindelwald views' },
    { id: 'p9', type: 'activity', lat: 46.687, lng: 7.87, label: '4', title: 'Soft alpine hike' },
    { id: 'p10', type: 'lodging', lat: 46.0207, lng: 7.7491, label: null, title: 'Zermatt lodge' },
    { id: 'p11', type: 'food', lat: 46.024, lng: 7.748, label: '2', title: 'Village dinner' },
    { id: 'p12', type: 'food', lat: 46.2044, lng: 6.1432, label: null, title: 'Geneva layover bite' },
  ],
}

export function isSwitzerlandItinerary(item) {
  if (!item) return false
  if (item.id === 'b2' || item.id === 'swiss' || item.id === SWISS_ITINERARY_ID) {
    return true
  }
  return String(item.title || '').includes('Switzerland Baecation')
}
