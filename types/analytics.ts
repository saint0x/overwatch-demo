export interface Event {
  id: string
  city: string
  country: string
  action: string
  page: string
  timestamp: number
}

export interface GeographicData {
  country: string
  code: string
  count: number
  color: string
}

export interface DeviceStats {
  desktop: number
  mobile: number
  tablet: number
}

export interface AnalyticsMetrics {
  activeUsers: number
  pageViews: number
  avgDuration: string
}

export interface PerformanceScore {
  score: number
  metrics: {
    fcp: number
    lcp: number
    cls: number
    fid: number
  }
}

export interface RealtimeData {
  metrics: AnalyticsMetrics
  events: Event[]
  geographic: GeographicData[]
  devices: DeviceStats
  performance: PerformanceScore
}

export interface WebSocketMessage {
  type: "authenticated" | "realtime" | "event" | "geographic" | "subscribe"
  projectId?: string
  activeUsers?: number
  activeSessions?: number
  eventsLast5Min?: number
  event?: {
    id: string
    eventType: string
    url: string
    timestamp: number
    location: { city: string; country: string }
    device: { type: string; browser: string }
  }
  locations?: Array<{
    city: string
    country: string
    lat: number
    lng: number
    activeUsers: number
  }>
  channel?: string
}

export interface SessionInfo {
  sessionId: string
  startedAt: number
  pageCount: number
  eventCount: number
}
