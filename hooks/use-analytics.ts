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
import {
  getInitialMetrics,
  getInitialDeviceStats,
  getGeographicData,
  getInitialPerformanceScore,
} from "@/api/mock-data"

export function useRealtimeMetrics() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics>(getInitialMetrics())

  useEffect(() => {
    const unsubscribe = overwatch.subscribe("metrics", (data) => {
      setMetrics((prev) => ({
        ...prev,
        activeUsers: data.activeUsers,
        pageViews: data.pageViews,
      }))
    })

    return unsubscribe
  }, [])

  return metrics
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
  const [devices, setDevices] = useState<DeviceStats>(getInitialDeviceStats())

  useEffect(() => {
    const unsubscribe = overwatch.subscribe("devices", (data: DeviceStats) => {
      setDevices(data)
    })

    return unsubscribe
  }, [])

  return devices
}

export function useGeographicData() {
  const [geographic] = useState<GeographicData[]>(getGeographicData())
  // In production, this would update in realtime
  return geographic
}

export function usePerformanceScore() {
  const [performance] = useState<PerformanceScore>(getInitialPerformanceScore())
  // In production, this would update periodically
  return performance
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
