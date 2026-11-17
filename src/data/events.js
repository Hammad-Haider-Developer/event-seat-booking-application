export const events = [
  {
    id: 'evt-001',
    name: 'Neon Nights Live',
    category: 'Music',
    date: '2026-09-12',
    time: '20:00',
    venue: 'Lahore Expo Centre',
    location: 'Lahore, Pakistan',
    description: 'A high-energy live music experience with immersive visuals, premium seating and a full evening of performances.',
    startingPrice: 2500,
    duration: '2h 30m',
    rows: [
      { label: 'A', category: 'VIP', count: 10 },
      { label: 'B', category: 'VIP', count: 10 },
      { label: 'C', category: 'Premium', count: 12 },
      { label: 'D', category: 'Premium', count: 12 },
      { label: 'E', category: 'Standard', count: 14 },
      { label: 'F', category: 'Standard', count: 14 },
      { label: 'G', category: 'Standard', count: 14 }
    ],
    blockedSeats: ['A10', 'G1', 'G14']
  },
  {
    id: 'evt-002',
    name: 'TechForward Summit',
    category: 'Technology',
    date: '2026-09-19',
    time: '10:00',
    venue: 'Pearl Continental Lahore',
    location: 'Lahore, Pakistan',
    description: 'A one-day technology summit featuring product leaders, engineering talks and hands-on sessions.',
    startingPrice: 1800,
    duration: '6h',
    rows: [
      { label: 'A', category: 'VIP', count: 8 },
      { label: 'B', category: 'Premium', count: 10 },
      { label: 'C', category: 'Premium', count: 10 },
      { label: 'D', category: 'Standard', count: 12 },
      { label: 'E', category: 'Standard', count: 12 },
      { label: 'F', category: 'Standard', count: 12 }
    ],
    blockedSeats: ['A1', 'A8', 'F12']
  },
  {
    id: 'evt-003',
    name: 'The Grand Theatre',
    category: 'Theatre',
    date: '2026-09-26',
    time: '19:30',
    venue: 'Alhamra Arts Centre',
    location: 'Lahore, Pakistan',
    description: 'An intimate theatrical production with carefully tiered seating for an excellent stage view.',
    startingPrice: 1500,
    duration: '2h',
    rows: [
      { label: 'A', category: 'VIP', count: 8 },
      { label: 'B', category: 'Premium', count: 10 },
      { label: 'C', category: 'Premium', count: 10 },
      { label: 'D', category: 'Standard', count: 12 },
      { label: 'E', category: 'Standard', count: 12 },
      { label: 'F', category: 'Standard', count: 12 },
      { label: 'G', category: 'Standard', count: 12 }
    ],
    blockedSeats: ['B10', 'E1', 'G12']
  },
  {
    id: 'evt-004',
    name: 'Champions Indoor Cup',
    category: 'Sports',
    date: '2026-10-03',
    time: '18:00',
    venue: 'National Hockey Stadium',
    location: 'Lahore, Pakistan',
    description: 'Fast-paced indoor sporting action with flexible seating and a lively supporter atmosphere.',
    startingPrice: 1200,
    duration: '3h',
    rows: [
      { label: 'A', category: 'VIP', count: 10 },
      { label: 'B', category: 'Premium', count: 12 },
      { label: 'C', category: 'Premium', count: 12 },
      { label: 'D', category: 'Standard', count: 16 },
      { label: 'E', category: 'Standard', count: 16 },
      { label: 'F', category: 'Standard', count: 16 }
    ],
    blockedSeats: ['A10', 'D1', 'F16']
  },
  {
    id: 'evt-005',
    name: 'Food & Culture Festival',
    category: 'Festival',
    date: '2026-10-10',
    time: '16:00',
    venue: 'Fortress Stadium',
    location: 'Lahore, Pakistan',
    description: 'A weekend festival celebrating local food, culture, crafts and live entertainment.',
    startingPrice: 900,
    duration: '5h',
    rows: [
      { label: 'A', category: 'VIP', count: 8 },
      { label: 'B', category: 'Premium', count: 10 },
      { label: 'C', category: 'Premium', count: 10 },
      { label: 'D', category: 'Standard', count: 14 },
      { label: 'E', category: 'Standard', count: 14 },
      { label: 'F', category: 'Standard', count: 14 }
    ],
    blockedSeats: ['C1', 'F14']
  },
  {
    id: 'evt-006',
    name: 'Future Minds Conference',
    category: 'Business',
    date: '2026-10-17',
    time: '09:30',
    venue: 'Nishat Hotel',
    location: 'Lahore, Pakistan',
    description: 'A practical business conference focused on leadership, growth and the future of work.',
    startingPrice: 2200,
    duration: '7h',
    rows: [
      { label: 'A', category: 'VIP', count: 8 },
      { label: 'B', category: 'Premium', count: 10 },
      { label: 'C', category: 'Premium', count: 10 },
      { label: 'D', category: 'Standard', count: 12 },
      { label: 'E', category: 'Standard', count: 12 }
    ],
    blockedSeats: ['A8', 'E1']
  }
]
