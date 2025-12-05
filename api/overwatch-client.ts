/**
 * Overwatch Demo Client
 *
 * This client serves two purposes:
 * 1. TRACK visitors to this demo page using the real Overwatch SDK
 * 2. DISPLAY real-time analytics data via WebSocket subscription
 *
 * The demo "eats its own dogfood" - visitors to this page are tracked,
 * and their data is displayed back to them in real-time.
 */

import type {
  RealtimeData,
  WebSocketMessage,
  SessionInfo,
  RealtimeChannelData,
  EventChannelData,
  GeographicChannelData,
  PerformanceChannelData,
} from "@/types/analytics"

// We'll dynamically import the SDK to avoid SSR issues
let OverwatchSDK: any = null

class OverwatchDemoClient {
  private apiKey: string | null = null
  private isInitialized = false
  private ws: WebSocket | null = null
  private reconnectTimeout: NodeJS.Timeout | null = null
  private pingInterval: NodeJS.Timeout | null = null
  private subscribers = new Map<string, Set<(data: any) => void>>()
  private sdkInstance: any = null
  private session: SessionInfo = {
    sessionId: `sess_${Math.random().toString(36).substr(2, 9)}`,
    startedAt: Date.now(),
    pageCount: 1,
    eventCount: 0,
  }

  async init(config: { apiKey: string; debug?: boolean }) {
    this.apiKey = config.apiKey
    this.isInitialized = true

    if (config.debug) {
      console.log("[Overwatch Demo] Initialized with API key:", config.apiKey)
    }

    // Initialize the real SDK to TRACK this page's visitors
    await this.initializeSDK(config)

    // Connect to WebSocket to DISPLAY real-time data
    this.connectWebSocket()
  }

  private async initializeSDK(config: { apiKey: string; debug?: boolean }) {
    if (typeof window === "undefined") return

    try {
      // Dynamic import of the SDK (works with both npm package and local)
      const SDK = await import("overwatch-sdk").catch(() => null)

      if (SDK) {
        OverwatchSDK = SDK
        // Initialize with comprehensive tracking for the demo
        this.sdkInstance = SDK.Overwatch.withLocation(config.apiKey)

        // Track initial pageview
        this.sdkInstance.page({
          title: document.title,
          path: window.location.pathname,
        })

        console.log("[Overwatch Demo] SDK initialized - tracking enabled")
      } else {
        console.warn("[Overwatch Demo] SDK not available, tracking disabled")
      }
    } catch (error) {
      console.warn("[Overwatch Demo] Failed to initialize SDK:", error)
    }
  }

  private connectWebSocket() {
    if (typeof window === "undefined") return

    const wsUrl = "wss://overwatch-daemon.fly.dev/ws/realtime"

    try {
      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log("[Overwatch Demo] WebSocket connected")
        this.ws?.send(
          JSON.stringify({
            type: "auth",
            apiKey: this.apiKey,
          }),
        )
      }

      this.ws.onmessage = (event) => {
        const data: WebSocketMessage = JSON.parse(event.data)
        this.handleWebSocketMessage(data)
      }

      this.ws.onerror = (error) => {
        console.error("[Overwatch Demo] WebSocket error:", error)
        this.startMockDataStream()
      }

      this.ws.onclose = () => {
        console.log("[Overwatch Demo] WebSocket closed")
        this.stopPingInterval()
        this.reconnectTimeout = setTimeout(() => {
          console.log("[Overwatch Demo] Attempting reconnect...")
          this.connectWebSocket()
        }, 5000)
        this.startMockDataStream()
      }
    } catch (error) {
      console.error("[Overwatch Demo] Failed to connect WebSocket:", error)
      this.startMockDataStream()
    }
  }

  private handleWebSocketMessage(msg: WebSocketMessage) {
    switch (msg.type) {
      case "connected":
        console.log("[Overwatch Demo] WebSocket connected:", msg.message)
        break

      case "authenticated":
        console.log("[Overwatch Demo] Authenticated, project:", msg.projectId)
        // Start heartbeat to keep connection alive
        this.startPingInterval()
        // Subscribe to all data channels we need
        this.subscribeToChannel("realtime")
        this.subscribeToChannel("events")
        this.subscribeToChannel("geographic")
        this.subscribeToChannel("performance")
        break

      case "pong":
        // Heartbeat acknowledged - connection is healthy
        break

      case "subscribed":
        console.log("[Overwatch Demo] Subscribed to channel:", msg.channel)
        break

      case "realtime": {
        const realtimeData = msg.data as RealtimeChannelData
        if (realtimeData) {
          // Format avgSessionDuration from ms to "M:SS" format
          const durationMs = realtimeData.avgSessionDuration || 0
          const minutes = Math.floor(durationMs / 60000)
          const seconds = Math.floor((durationMs % 60000) / 1000)
          const avgDurationFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`

          this.notifySubscribers("metrics", {
            activeUsers: realtimeData.activeUsersCount,
            pageViews: realtimeData.pageviewsLastMinute,
            avgDuration: avgDurationFormatted,
          })
          // Also extract device breakdown from active sessions
          if (realtimeData.activeSessions?.length > 0) {
            const deviceCounts = { desktop: 0, mobile: 0, tablet: 0 }
            for (const session of realtimeData.activeSessions) {
              const type = session.device?.toLowerCase() || "desktop"
              if (type === "desktop") deviceCounts.desktop++
              else if (type === "mobile") deviceCounts.mobile++
              else if (type === "tablet") deviceCounts.tablet++
              else deviceCounts.desktop++
            }
            const total = deviceCounts.desktop + deviceCounts.mobile + deviceCounts.tablet
            if (total > 0) {
              this.notifySubscribers("devices", {
                desktop: Math.round((deviceCounts.desktop / total) * 100),
                mobile: Math.round((deviceCounts.mobile / total) * 100),
                tablet: Math.round((deviceCounts.tablet / total) * 100),
              })
            }
          }
        }
        break
      }

      case "event": {
        const eventData = msg.data as EventChannelData
        if (eventData) {
          const formattedEvent = {
            id: eventData.eventId,
            city: "", // Not available in event stream
            country: eventData.country || "Unknown",
            action: eventData.type === "pageview" ? "viewed" : eventData.type === "click" ? "clicked" : eventData.type,
            page: eventData.pageUrl || "/",
            timestamp: eventData.timestamp,
          }
          this.notifySubscribers("events", formattedEvent)
        }
        break
      }

      case "geographic": {
        const geoData = msg.data as GeographicChannelData
        if (geoData?.liveLocations) {
          // Transform daemon format to frontend format
          const colors = ["#3B82F6", "#52a2ff", "#60a5fa", "#93c5fd", "#bfdbfe"]
          const formatted = geoData.liveLocations.map((loc, idx) => ({
            country: loc.countryName,
            code: loc.countryCode,
            count: loc.activeCount,
            color: colors[idx % colors.length],
          }))
          this.notifySubscribers("geographic", formatted)
        }
        break
      }

      case "performance": {
        const perfData = msg.data as PerformanceChannelData
        if (perfData) {
          this.notifySubscribers("performance", {
            metricName: perfData.metricName,
            value: perfData.value,
            rating: perfData.rating,
          })
        }
        break
      }

      case "error":
        console.error("[Overwatch Demo] WebSocket error:", msg.code, msg.message)
        break
    }
  }

  private subscribeToChannel(channel: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: "subscribe",
          channel,
        }),
      )
    }
  }

  private startPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
    }
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping" }))
      }
    }, 15000)
  }

  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  private notifySubscribers(type: string, data: any) {
    const callbacks = this.subscribers.get(type)
    if (callbacks) {
      callbacks.forEach((callback) => callback(data))
    }
  }

  private startMockDataStream() {
    // No mock data - just notify that we're in loading/disconnected state
    console.log("[Overwatch Demo] WebSocket disconnected, showing loading state")
    // Notify subscribers with empty/loading state
    this.notifySubscribers("connection", { connected: false })
  }

  async getSnapshot(): Promise<RealtimeData> {
    this.ensureInitialized()

    const baseUrl = "https://overwatch-daemon.fly.dev"
    const headers: HeadersInit = {
      "x-api-key": this.apiKey!,
      "Content-Type": "application/json",
    }

    try {
      // Fetch data from daemon REST endpoints in parallel
      const [overviewRes, realtimeRes, audienceRes, performanceRes] = await Promise.all([
        fetch(`${baseUrl}/stats/overview`, { headers }),
        fetch(`${baseUrl}/stats/realtime`, { headers }),
        fetch(`${baseUrl}/stats/audience`, { headers }),
        fetch(`${baseUrl}/stats/performance`, { headers }),
      ])

      const [overview, realtime, audience, performance] = await Promise.all([
        overviewRes.ok ? overviewRes.json() : null,
        realtimeRes.ok ? realtimeRes.json() : null,
        audienceRes.ok ? audienceRes.json() : null,
        performanceRes.ok ? performanceRes.json() : null,
      ])

      // Map daemon response to frontend types
      const metrics = {
        activeUsers: realtime?.activeUsers || 0,
        pageViews: overview?.pageViews || 0,
        avgDuration: overview?.avgDuration || "0:00",
      }

      // Map audience countries to geographic format (daemon returns {code, count})
      const colors = ["#3B82F6", "#52a2ff", "#60a5fa", "#93c5fd", "#bfdbfe"]
      const geographic = (audience?.countries || []).slice(0, 5).map((c: any, idx: number) => ({
        country: c.country || c.name || c.code || "Unknown",
        code: c.code || c.countryCode || "XX",
        count: c.count || c.visitors || 0,
        color: colors[idx % colors.length],
      }))

      // Map audience devices (daemon returns array of {type, count})
      const deviceArray = audience?.devices || []
      const totalDevices = deviceArray.reduce((sum: number, d: any) => sum + (d.count || 0), 0) || 1
      const devices = {
        desktop: Math.round(((deviceArray.find((d: any) => d.type === "desktop")?.count || 0) / totalDevices) * 100),
        mobile: Math.round(((deviceArray.find((d: any) => d.type === "mobile")?.count || 0) / totalDevices) * 100),
        tablet: Math.round(((deviceArray.find((d: any) => d.type === "tablet")?.count || 0) / totalDevices) * 100),
      }

      // Map performance metrics - calculate score from Web Vitals
      const perfMetrics = {
        fcp: performance?.fcp?.value || 1.5,
        lcp: performance?.lcp?.value || 2.5,
        cls: performance?.cls?.value || 0.1,
        fid: performance?.fid?.value || 100,
      }
      // Simple scoring: weight good metrics higher
      const score = Math.round(
        (perfMetrics.fcp < 1.8 ? 25 : perfMetrics.fcp < 3 ? 15 : 5) +
        (perfMetrics.lcp < 2.5 ? 25 : perfMetrics.lcp < 4 ? 15 : 5) +
        (perfMetrics.cls < 0.1 ? 25 : perfMetrics.cls < 0.25 ? 15 : 5) +
        (perfMetrics.fid < 100 ? 25 : perfMetrics.fid < 300 ? 15 : 5)
      )

      return {
        metrics,
        events: [],
        geographic,
        devices,
        performance: { score, metrics: perfMetrics },
      }
    } catch (error) {
      console.error("[Overwatch Demo] Failed to fetch snapshot:", error)
      // Return empty/loading state instead of mock data
      return {
        metrics: { activeUsers: 0, pageViews: 0, avgDuration: "0:00" },
        events: [],
        geographic: [],
        devices: { desktop: 0, mobile: 0, tablet: 0 },
        performance: { score: 0, metrics: { fcp: 0, lcp: 0, cls: 0, fid: 0 } },
      }
    }
  }

  /**
   * Track a custom event - forwards to the real SDK
   */
  track(eventData: { type: string; [key: string]: any }) {
    this.ensureInitialized()
    this.session.eventCount++

    // Forward to real SDK if available
    if (this.sdkInstance) {
      this.sdkInstance.track(eventData)
    }

    console.log("[Overwatch Demo] Track event:", eventData)
  }

  /**
   * Track a click event
   */
  trackClick(selector: string, data?: Record<string, any>) {
    if (this.sdkInstance) {
      this.sdkInstance.click(selector, data)
    }
  }

  getSession(): SessionInfo {
    // Return SDK session if available, otherwise fallback
    if (this.sdkInstance) {
      const sdkSession = this.sdkInstance.getSession()
      return {
        sessionId: sdkSession.sessionId,
        startedAt: this.session.startedAt,
        pageCount: this.session.pageCount,
        eventCount: sdkSession.eventCount || this.session.eventCount,
      }
    }
    return { ...this.session }
  }

  subscribe(
    type: "metrics" | "events" | "devices" | "geographic" | "performance" | "connection",
    callback: (data: any) => void
  ): () => void {
    this.ensureInitialized()

    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set())
    }
    this.subscribers.get(type)!.add(callback)

    return () => {
      const callbacks = this.subscribers.get(type)
      if (callbacks) {
        callbacks.delete(callback)
      }
    }
  }

  private ensureInitialized() {
    if (!this.isInitialized) {
      throw new Error("Overwatch client not initialized. Call overwatch.init() first.")
    }
  }

  disconnect() {
    // Cleanup SDK
    if (this.sdkInstance) {
      this.sdkInstance.destroy()
    }

    this.stopPingInterval()
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

// Export singleton instance
export const overwatch = new OverwatchDemoClient()
