"use client"

import { useState, useEffect } from "react"
import { overwatch } from "@/api/overwatch-client"
import type {
  Event,
  AnalyticsMetrics,
  DeviceStats,
  GeographicData,
  PerformanceScore,
  RealtimeData,
} from "@/types/analytics"

// Initial loading state values
const INITIAL_METRICS: AnalyticsMetrics = { activeUsers: 0, pageViews: 0, avgDuration: "0:00" }
const INITIAL_DEVICES: DeviceStats = { desktop: 0, mobile: 0, tablet: 0 }
const INITIAL_PERFORMANCE: PerformanceScore = { score: 0, metrics: { fcp: 0, lcp: 0, cls: 0, fid: 0 } }

export function useRealtimeMetrics() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics>(INITIAL_METRICS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = overwatch.subscribe("metrics", (data) => {
      setLoading(false)
      setMetrics((prev) => ({
        ...prev,
        activeUsers: data.activeUsers ?? prev.activeUsers,
        pageViews: data.pageViews ?? prev.pageViews,
        avgDuration: data.avgDuration ?? prev.avgDuration,
      }))
    })

    return unsubscribe
  }, [])

  return { metrics, loading }
}

export function useRealtimeEvents() {
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    const unsubscribe = overwatch.subscribe("events", (newEvent: Event) => {
      setEvents((prev) => [newEvent, ...prev.slice(0, 9)])
    })

    return unsubscribe
  }, [])

  return events
}

export function useDeviceStats() {
  const [devices, setDevices] = useState<DeviceStats>(INITIAL_DEVICES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = overwatch.subscribe("devices", (data: DeviceStats) => {
      setLoading(false)
      setDevices(data)
    })

    return unsubscribe
  }, [])

  return { devices, loading }
}

export function useGeographicData() {
  const [geographic, setGeographic] = useState<GeographicData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = overwatch.subscribe("geographic", (data: GeographicData[]) => {
      setLoading(false)
      setGeographic(data)
    })

    return unsubscribe
  }, [])

  return { geographic, loading }
}

export function usePerformanceScore() {
  const [performance, setPerformance] = useState<PerformanceScore>(INITIAL_PERFORMANCE)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Performance metrics come as individual updates from the daemon
    const unsubscribe = overwatch.subscribe("performance", (data: { metricName: string; value: number; rating: string }) => {
      setLoading(false)
      setPerformance((prev) => {
        const metrics = { ...prev.metrics }
        const metricKey = data.metricName.toLowerCase() as keyof typeof metrics
        if (metricKey in metrics) {
          metrics[metricKey] = data.value
        }
        // Recalculate score based on updated metrics
        const score = Math.round(
          (metrics.fcp < 1.8 ? 25 : metrics.fcp < 3 ? 15 : 5) +
          (metrics.lcp < 2.5 ? 25 : metrics.lcp < 4 ? 15 : 5) +
          (metrics.cls < 0.1 ? 25 : metrics.cls < 0.25 ? 15 : 5) +
          (metrics.fid < 100 ? 25 : metrics.fid < 300 ? 15 : 5)
        )
        return { score, metrics }
      })
    })

    return unsubscribe
  }, [])

  return { performance, loading }
}

export function useAnalyticsSnapshot() {
  const [data, setData] = useState<RealtimeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    overwatch
      .getSnapshot()
      .then((snapshot) => {
        setData(snapshot)
        setLoading(false)
      })
      .catch((err) => {
        setError(err)
        setLoading(false)
      })
  }, [])

  return { data, loading, error }
}
