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
  type: "connected" | "authenticated" | "realtime" | "event" | "geographic" | "performance" | "subscribed" | "unsubscribed" | "pong" | "error"
  projectId?: string
  message?: string
  channel?: string
  code?: string
  timestamp?: number
  // Realtime channel data
  data?: RealtimeChannelData | EventChannelData | GeographicChannelData | PerformanceChannelData
}

// Daemon's realtime channel payload
export interface RealtimeChannelData {
  activeUsersCount: number
  activeSessions: Array<{
    sessionId: string
    page: string
    device: string
  }>
  eventsPerSecond: number
  pageviewsLastMinute: number
  clicksLastMinute: number
  errorsLastMinute: number
}

// Daemon's event channel payload
export interface EventChannelData {
  eventId: string
  type: string
  timestamp: number
  sessionId: string
  pageUrl: string
  country?: string
  device?: string
  browser?: string
  data?: Record<string, unknown>
}

// Daemon's geographic channel payload
export interface GeographicChannelData {
  liveLocations: Array<{
    countryCode: string
    countryName: string
    activeCount: number
    lat: number
    lng: number
  }>
}

// Daemon's performance channel payload
export interface PerformanceChannelData {
  metricName: "LCP" | "FID" | "CLS" | "TTFB" | "FCP" | "INP"
  value: number
  rating: "good" | "needs-improvement" | "poor"
  pageUrl: string
  timestamp: number
}

export interface SessionInfo {
  sessionId: string
  startedAt: number
  pageCount: number
  eventCount: number
}
