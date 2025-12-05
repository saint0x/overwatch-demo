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

import type { RealtimeData, WebSocketMessage, SessionInfo } from "@/types/analytics"
import {
  generateRandomEvent,
  getInitialMetrics,
  getInitialDeviceStats,
  getGeographicData,
  getInitialPerformanceScore,
} from "./mock-data"

// We'll dynamically import the SDK to avoid SSR issues
let OverwatchSDK: any = null

class OverwatchDemoClient {
  private apiKey: string | null = null
  private isInitialized = false
  private ws: WebSocket | null = null
  private reconnectTimeout: NodeJS.Timeout | null = null
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

  private handleWebSocketMessage(data: WebSocketMessage) {
    switch (data.type) {
      case "authenticated":
        console.log("[Overwatch Demo] Authenticated, project:", data.projectId)
        this.subscribeToChannel("events")
        this.subscribeToChannel("geographic")
        this.subscribeToChannel("realtime")
        break

      case "realtime":
        this.notifySubscribers("metrics", {
          activeUsers: data.activeUsers,
          pageViews: data.eventsLast5Min,
        })
        break

      case "event":
        if (data.event) {
          const formattedEvent = {
            id: data.event.id,
            city: data.event.location.city,
            country: data.event.location.country,
            action: data.event.eventType === "pageview" ? "viewed" : "clicked",
            page: new URL(data.event.url).pathname || "/",
            timestamp: data.event.timestamp,
          }
          this.notifySubscribers("events", formattedEvent)
        }
        break

      case "geographic":
        if (data.locations) {
          this.notifySubscribers("geographic", data.locations)
        }
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

  private notifySubscribers(type: string, data: any) {
    const callbacks = this.subscribers.get(type)
    if (callbacks) {
      callbacks.forEach((callback) => callback(data))
    }
  }

  private startMockDataStream() {
    const metricsInterval = setInterval(() => {
      this.notifySubscribers("metrics", {
        activeUsers: Math.floor(Math.random() * 100) + 20,
        pageViews: Math.floor(Math.random() * 50) + 1200,
      })
    }, 2000)

    const eventInterval = setInterval(
      () => {
        this.notifySubscribers("events", generateRandomEvent())
      },
      Math.random() * 2000 + 1000,
    )

    const deviceInterval = setInterval(() => {
      this.notifySubscribers("devices", {
        desktop: Math.floor(Math.random() * 20) + 50,
        mobile: Math.floor(Math.random() * 15) + 25,
        tablet: Math.floor(Math.random() * 5) + 8,
      })
    }, 5000)

    if (this.ws) {
      this.ws.addEventListener(
        "open",
        () => {
          clearInterval(metricsInterval)
          clearInterval(eventInterval)
          clearInterval(deviceInterval)
        },
        { once: true },
      )
    }
  }

  async getSnapshot(): Promise<RealtimeData> {
    this.ensureInitialized()

    return {
      metrics: getInitialMetrics(),
      events: [],
      geographic: getGeographicData(),
      devices: getInitialDeviceStats(),
      performance: getInitialPerformanceScore(),
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

  subscribe(type: "metrics" | "events" | "devices" | "geographic", callback: (data: any) => void): () => void {
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
