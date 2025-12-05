import type { Event, GeographicData, DeviceStats } from "@/types/analytics"

const CITIES = [
  { name: "New York", country: "US" },
  { name: "San Francisco", country: "US" },
  { name: "London", country: "GB" },
  { name: "Tokyo", country: "JP" },
  { name: "Berlin", country: "DE" },
  { name: "Paris", country: "FR" },
  { name: "Sydney", country: "AU" },
  { name: "Toronto", country: "CA" },
] as const

const PAGES = ["/home", "/pricing", "/docs", "/about", "/blog"] as const

const ACTIONS = ["viewed", "clicked", "scrolled to"] as const

const GEOGRAPHIC_DATA: GeographicData[] = [
  { country: "United States", code: "US", count: 23, color: "#3B82F6" },
  { country: "United Kingdom", code: "GB", count: 8, color: "#52a2ff" },
  { country: "Germany", code: "DE", count: 6, color: "#60a5fa" },
  { country: "Japan", code: "JP", count: 5, color: "#93c5fd" },
  { country: "Canada", code: "CA", count: 5, color: "#3B82F6" },
]

export function generateRandomEvent(): Event {
  const city = CITIES[Math.floor(Math.random() * CITIES.length)]
  const page = PAGES[Math.floor(Math.random() * PAGES.length)]
  const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)]

  return {
    id: Math.random().toString(36).substring(2, 11),
    city: city.name,
    country: city.country,
    action,
    page,
    timestamp: Date.now(),
  }
}

export function getInitialMetrics() {
  return {
    activeUsers: 47,
    pageViews: 1284,
    avgDuration: "2:34",
  }
}

export function getInitialDeviceStats(): DeviceStats {
  return {
    desktop: 58,
    mobile: 32,
    tablet: 10,
  }
}

export function getGeographicData(): GeographicData[] {
  return GEOGRAPHIC_DATA
}

export function getInitialPerformanceScore() {
  return {
    score: 87,
    metrics: {
      fcp: 1.2,
      lcp: 2.1,
      cls: 0.05,
      fid: 80,
    },
  }
}

// Simulate metric updates with business rules
export function updateActiveUsers(current: number): number {
  const change = Math.floor(Math.random() * 10 - 5)
  return Math.max(20, Math.min(150, current + change))
}

export function updatePageViews(current: number): number {
  return current + Math.floor(Math.random() * 5)
}

export function updateDeviceStats(current: DeviceStats): DeviceStats {
  // Small random fluctuations while maintaining total of ~100%
  const delta = Math.floor(Math.random() * 3 - 1)
  return {
    desktop: Math.max(40, Math.min(70, current.desktop + delta)),
    mobile: Math.max(20, Math.min(50, current.mobile - delta)),
    tablet: Math.max(5, Math.min(15, current.tablet)),
  }
}
