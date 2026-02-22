// Mock data for client portal pages

export const mockPortalGalleries = [
  {
    id: "g1",
    title: "Engagement Session",
    status: "published",
    publishedAt: "2026-01-15T10:00:00Z",
    createdAt: "2026-01-10T10:00:00Z",
    photoCount: 142,
    coverImage:
      "https://images.unsplash.com/photo-1542810185-a9c0362dcff4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmdhZ2VtZW50JTIwcmluZyUyMHByb3Bvc2FsJTIwcm9tYW50aWN8ZW58MXx8fHwxNzcxNjk5MzY1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    booking: { id: "b2" },
    photos: [
      {
        id: "p1",
        filename: "engagement-001.jpg",
        r2Key:
          "https://images.unsplash.com/photo-1542810185-a9c0362dcff4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmdhZ2VtZW50JTIwcmluZyUyMHByb3Bvc2FsJTIwcm9tYW50aWN8ZW58MXx8fHwxNzcxNjk5MzY1fDA&ixlib=rb-4.1.0&q=80&w=1080",
        r2ThumbnailKey: "",
        isFavorite: true,
      },
      {
        id: "p2",
        filename: "engagement-002.jpg",
        r2Key:
          "https://images.unsplash.com/photo-1667565454350-fd0484baaa2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdW5zZXQlMjBjb3VwbGUlMjBzaWxob3VldHRlJTIwb3V0ZG9vciUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MTczODY3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
        r2ThumbnailKey: "",
        isFavorite: false,
      },
      {
        id: "p3",
        filename: "engagement-003.jpg",
        r2Key:
          "https://images.unsplash.com/photo-1637537791710-a78698013174?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjB3YWxraW5nJTIwbmF0dXJlJTIwdHJhaWwlMjBmb3Jlc3R8ZW58MXx8fHwxNzcxNzM4Njc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
        r2ThumbnailKey: "",
        isFavorite: false,
      },
      {
        id: "p4",
        filename: "engagement-004.jpg",
        r2Key:
          "https://images.unsplash.com/photo-1768039376092-70e587cb7b94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmlkZSUyMGdldHRpbmclMjByZWFkeSUyMHByZXBhcmF0aW9uJTIwY2FuZGlkfGVufDF8fHx8MTc3MTczODY3N3ww&ixlib=rb-4.1.0&q=80&w=1080",
        r2ThumbnailKey: "",
        isFavorite: true,
      },
      {
        id: "p5",
        filename: "engagement-005.jpg",
        r2Key:
          "https://images.unsplash.com/photo-1677768061409-3d4fbd0250d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcmVjZXB0aW9uJTIwdGFibGUlMjBkZWNvciUyMGZsb3dlcnN8ZW58MXx8fHwxNzcxNzM4Njc4fDA&ixlib=rb-4.1.0&q=80&w=1080",
        r2ThumbnailKey: "",
        isFavorite: false,
      },
      {
        id: "p6",
        filename: "engagement-006.jpg",
        r2Key:
          "https://images.unsplash.com/photo-1649191717256-d4a81a6df923?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY291cGxlJTIwZ29sZGVuJTIwaG91ciUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MTczODYzNnww&ixlib=rb-4.1.0&q=80&w=1080",
        r2ThumbnailKey: "",
        isFavorite: false,
      },
    ],
  },
  {
    id: "g2",
    title: "Wedding Day",
    status: "draft",
    publishedAt: null,
    createdAt: "2026-03-22T10:00:00Z",
    photoCount: 0,
    coverImage:
      "https://images.unsplash.com/photo-1649191717256-d4a81a6df923?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY291cGxlJTIwZ29sZGVuJTIwaG91ciUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MTczODYzNnww&ixlib=rb-4.1.0&q=80&w=1080",
    booking: { id: "b1" },
    photos: [],
  },
];

export const mockPortalBookings = [
  {
    id: "b1",
    eventType: "wedding",
    packageName: "Wedding - Signature",
    packagePrice: 6800,
    depositAmount: 2040,
    status: "confirmed",
    eventDate: "2026-03-22",
    eventLocation: "Golden Gate Park, San Francisco",
    contractUrl: "https://example.com/contract/MW-2026-0322",
    contractSignedAt: "2025-11-10T12:00:00Z",
    payments: [
      { id: "pay1", amount: 2040, status: "succeeded", paymentType: "deposit", paidAt: "2025-11-10T12:00:00Z" },
    ],
  },
  {
    id: "b2",
    eventType: "engagement",
    packageName: "Engagement - Full Story",
    packagePrice: 2200,
    depositAmount: 660,
    status: "completed",
    eventDate: "2026-01-15",
    eventLocation: "Baker Beach, San Francisco",
    contractUrl: "https://example.com/contract/MW-2026-0115",
    contractSignedAt: "2025-11-25T12:00:00Z",
    payments: [
      { id: "pay2", amount: 660, status: "succeeded", paymentType: "deposit", paidAt: "2025-11-25T12:00:00Z" },
      { id: "pay3", amount: 1540, status: "succeeded", paymentType: "final_payment", paidAt: "2026-01-01T12:00:00Z" },
    ],
  },
  {
    id: "b3",
    eventType: "headshot",
    packageName: "Headshots - Professional",
    packagePrice: 650,
    depositAmount: 195,
    status: "pending_deposit",
    eventDate: "2026-04-10",
    eventLocation: "Studio, San Francisco",
    contractUrl: null,
    contractSignedAt: null,
    payments: [],
  },
];

// Mock data for public portfolio page
export const mockPublicPortfolio = [
  {
    id: "port-1",
    slug: "sarah-james-elopement",
    title: "Sarah & James",
    category: "elopement",
    description: "An intimate sunrise elopement on the slopes of Mt. Hood.",
    coverImageKey:
      "https://images.unsplash.com/photo-1764773965414-7a0aa9c2a656?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjB3YWxraW5nJTIwZm9yZXN0JTIwcm9tYW50aWN8ZW58MXx8fHwxNzcxNzIxNjE0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    isFeatured: true,
    isPublished: true,
    eventDate: "2025-09-15",
    photos: [
      {
        id: "pp1",
        r2Key:
          "https://images.unsplash.com/photo-1764773965414-7a0aa9c2a656?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjB3YWxraW5nJTIwZm9yZXN0JTIwcm9tYW50aWN8ZW58MXx8fHwxNzcxNzIxNjE0fDA&ixlib=rb-4.1.0&q=80&w=1080",
        altText: "Couple walking in forest",
      },
      {
        id: "pp2",
        r2Key:
          "https://images.unsplash.com/photo-1578251133581-bf5e671b97fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBlbG9wZW1lbnQlMjBtb3VudGFpbiUyMGdvbGRlbiUyMGhvdXJ8ZW58MXx8fHwxNzcxNzIxNjEwfDA&ixlib=rb-4.1.0&q=80&w=1080",
        altText: "Mountain elopement golden hour",
      },
      {
        id: "pp3",
        r2Key:
          "https://images.unsplash.com/photo-1579035234222-1af9dc733cce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwYm91cXVldCUyMGJyaWRhbCUyMGZsb3dlcnN8ZW58MXx8fHwxNzcxNjU5NjcyfDA&ixlib=rb-4.1.0&q=80&w=1080",
        altText: "Wedding bouquet",
      },
      {
        id: "pp4",
        r2Key:
          "https://images.unsplash.com/photo-1645198012585-9c44844c64a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcmluZ3MlMjBkZXRhaWwlMjBjbG9zZXVwfGVufDF8fHx8MTc3MTY1ODgzOHww&ixlib=rb-4.1.0&q=80&w=1080",
        altText: "Wedding rings",
      },
      {
        id: "pp5",
        r2Key:
          "https://images.unsplash.com/photo-1752824062296-8e9b1a8162a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBsYXVnaGluZyUyMGNhbmRpZCUyMGhhcHB5fGVufDF8fHx8MTc3MTcyMTYxOHww&ixlib=rb-4.1.0&q=80&w=1080",
        altText: "Couple laughing",
      },
    ],
  },
  {
    id: "port-2",
    slug: "emily-david-wedding",
    title: "Emily & David",
    category: "wedding",
    description: "A garden wedding filled with laughter and golden hour light. Bend, Oregon",
    coverImageKey:
      "https://images.unsplash.com/photo-1634040616805-bfe7066251ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY291cGxlJTIwZmlyc3QlMjBkYW5jZXxlbnwxfHx8fDE3NzE3MjE2MTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    isFeatured: true,
    isPublished: true,
    eventDate: "2025-08-10",
    photos: [
      {
        id: "pp6",
        r2Key:
          "https://images.unsplash.com/photo-1634040616805-bfe7066251ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY291cGxlJTIwZmlyc3QlMjBkYW5jZXxlbnwxfHx8fDE3NzE3MjE2MTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
        altText: "First dance",
      },
      {
        id: "pp7",
        r2Key:
          "https://images.unsplash.com/photo-1769812344337-ec16a1b7cef8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY2VyZW1vbnklMjBvdXRkb29yJTIwZWxlZ2FudHxlbnwxfHx8fDE3NzE3MjE2MTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
        altText: "Outdoor ceremony",
      },
      {
        id: "pp8",
        r2Key:
          "https://images.unsplash.com/photo-1719223852076-6981754ebf76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcmVjZXB0aW9uJTIwdGFibGUlMjBkZWNvcmF0aW9ufGVufDF8fHx8MTc3MTcyMTYxM3ww&ixlib=rb-4.1.0&q=80&w=1080",
        altText: "Reception details",
      },
      {
        id: "pp9",
        r2Key:
          "https://images.unsplash.com/photo-1684244177286-8625c54bce6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmlkZSUyMGdldHRpbmclMjByZWFkeSUyMHdlZGRpbmclMjBkZXRhaWx8ZW58MXx8fHwxNzcxNzIxNjEyfDA&ixlib=rb-4.1.0&q=80&w=1080",
        altText: "Getting ready",
      },
    ],
  },
  {
    id: "port-3",
    slug: "marco-surprise-proposal",
    title: "Marco & Alicia",
    category: "proposal",
    description: "A sunset proposal at Cannon Beach with Haystack Rock. Cannon Beach, Oregon",
    coverImageKey:
      "https://images.unsplash.com/photo-1771570991164-efcc1a23be19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9wb3NhbCUyMGNvdXBsZSUyMHN1bnNldCUyMHJvbWFudGljfGVufDF8fHx8MTc3MTcyMTYxMXww&ixlib=rb-4.1.0&q=80&w=1080",
    isFeatured: true,
    isPublished: true,
    eventDate: "2025-07-20",
    photos: [
      {
        id: "pp10",
        r2Key:
          "https://images.unsplash.com/photo-1771570991164-efcc1a23be19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9wb3NhbCUyMGNvdXBsZSUyMHN1bnNldCUyMHJvbWFudGljfGVufDF8fHx8MTc3MTcyMTYxMXww&ixlib=rb-4.1.0&q=80&w=1080",
        altText: "Proposal at sunset",
      },
      {
        id: "pp11",
        r2Key:
          "https://images.unsplash.com/photo-1769566025603-2e694fb2ff68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBpbnRpbWF0ZSUyMHBvcnRyYWl0JTIwbmF0dXJhbCUyMGxpZ2h0fGVufDF8fHx8MTc3MTcyMTYxM3ww&ixlib=rb-4.1.0&q=80&w=1080",
        altText: "Intimate portrait",
      },
      {
        id: "pp12",
        r2Key:
          "https://images.unsplash.com/photo-1752824062296-8e9b1a8162a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBsYXVnaGluZyUyMGNhbmRpZCUyMGhhcHB5fGVufDF8fHx8MTc3MTcyMTYxOHww&ixlib=rb-4.1.0&q=80&w=1080",
        altText: "Couple laughing",
      },
    ],
  },
  {
    id: "port-4",
    slug: "outdoor-ceremony",
    title: "Rachel & Thomas",
    category: "wedding",
    description: "An elegant outdoor ceremony. Columbia River Gorge",
    coverImageKey:
      "https://images.unsplash.com/photo-1769812344337-ec16a1b7cef8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY2VyZW1vbnklMjBvdXRkb29yJTIwZWxlZ2FudHxlbnwxfHx8fDE3NzE3MjE2MTB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    isFeatured: false,
    isPublished: true,
    eventDate: "2025-06-14",
    photos: [],
  },
  {
    id: "port-5",
    slug: "graduation-maya",
    title: "Maya's Graduation",
    category: "portrait",
    description: "Celebrating a milestone. University of Oregon",
    coverImageKey:
      "https://images.unsplash.com/photo-1641335339082-f59be37f758d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFkdWF0aW9uJTIwcG9ydHJhaXQlMjBjZWxlYnJhdGlvbnxlbnwxfHx8fDE3NzE3MjE2MTF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    isFeatured: false,
    isPublished: true,
    eventDate: "2025-06-01",
    photos: [],
  },
  {
    id: "port-6",
    slug: "headshot-professional",
    title: "Executive Portraits",
    category: "corporate",
    description: "Professional headshots. Studio, San Francisco",
    coverImageKey:
      "https://images.unsplash.com/photo-1769636929388-99eff95d3bf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHN0dWRpbyUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MTY4ODA1N3ww&ixlib=rb-4.1.0&q=80&w=1080",
    isFeatured: false,
    isPublished: true,
    eventDate: "2025-05-20",
    photos: [],
  },
  {
    id: "port-7",
    slug: "corporate-event",
    title: "Annual Gala",
    category: "event",
    description: "Documenting an evening of celebration. San Francisco Art Museum",
    coverImageKey:
      "https://images.unsplash.com/photo-1767070806009-152054f6edd5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwZXZlbnQlMjBjZWxlYnJhdGlvbiUyMHBhcnR5fGVufDF8fHx8MTc3MTcyMTYxMnww&ixlib=rb-4.1.0&q=80&w=1080",
    isFeatured: false,
    isPublished: true,
    eventDate: "2025-04-15",
    photos: [],
  },
  {
    id: "port-8",
    slug: "urban-engagement",
    title: "Nadia & Kevin",
    category: "engagement",
    description: "Urban love story. Mission District, San Francisco",
    coverImageKey:
      "https://images.unsplash.com/photo-1768772918151-2d0100b534b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmdhZ2VtZW50JTIwY291cGxlJTIwY2l0eSUyMHVyYmFufGVufDF8fHx8MTc3MTcyMTYxOXww&ixlib=rb-4.1.0&q=80&w=1080",
    isFeatured: false,
    isPublished: true,
    eventDate: "2025-03-10",
    photos: [],
  },
  {
    id: "port-9",
    slug: "reception-details",
    title: "Lauren & Chris",
    category: "wedding",
    description: "Wine country wedding details. Wine Country, Willamette",
    coverImageKey:
      "https://images.unsplash.com/photo-1719223852076-6981754ebf76?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcmVjZXB0aW9uJTIwdGFibGUlMjBkZWNvcmF0aW9ufGVufDF8fHx8MTc3MTcyMTYxM3ww&ixlib=rb-4.1.0&q=80&w=1080",
    isFeatured: false,
    isPublished: true,
    eventDate: "2025-02-28",
    photos: [],
  },
];

// Mock testimonials for public pages
export const mockTestimonials = [
  {
    id: "t1",
    clientName: "Sarah & James",
    eventType: "Forest Elopement, Mt. Hood",
    content:
      "Mae has the most incredible ability to make you feel completely at ease. Our photos feel like they were pulled straight from a film -- timeless and full of emotion.",
    rating: 5,
    isFeatured: true,
    isPublished: true,
  },
  {
    id: "t2",
    clientName: "Emily & David",
    eventType: "Garden Wedding, Bend OR",
    content:
      "From the moment we inquired, Mae was communicative, thoughtful, and genuinely invested in our vision. She exceeded every expectation.",
    rating: 5,
    isFeatured: true,
    isPublished: true,
  },
  {
    id: "t3",
    clientName: "Marco & Alicia",
    eventType: "Sunset Proposal, Cannon Beach",
    content:
      "I still get chills looking at our proposal photos. Mae captured every single detail I would have missed in the moment. Absolutely priceless.",
    rating: 5,
    isFeatured: true,
    isPublished: true,
  },
];
