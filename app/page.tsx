"use client"

import { useEffect } from "react"
import { Card } from "@/components/ui/card"
import {
  Radio,
  Users,
  Eye,
  Clock,
  TrendingUp,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Activity,
  BarChart3,
  Gauge,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { overwatch } from "@/api/overwatch-client"
import {
  useRealtimeMetrics,
  useRealtimeEvents,
  useDeviceStats,
  useGeographicData,
  usePerformanceScore,
} from "@/hooks/use-analytics"

export default function Page() {
  // Initialize Overwatch SDK (tracks visitors + displays real-time data)
  useEffect(() => {
    overwatch.init({
      apiKey: "owk_live_fH1uColFx9U8LjZ42mQNjG93QoCuxXGP",
      debug: true,
    })

    // Cleanup on unmount
    return () => {
      overwatch.disconnect()
    }
  }, [])

  // Use hooks for all data
  const metrics = useRealtimeMetrics()
  const events = useRealtimeEvents()
  const deviceStats = useDeviceStats()
  const geographic = useGeographicData()
  const performance = usePerformanceScore()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-[60px] border-b border-white/[0.08] bg-black/80 backdrop-blur-xl">
        <div className="mx-auto h-full max-w-[1400px] px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#52a2ff] to-[#3b82f6] flex items-center justify-center shadow-lg shadow-[#52a2ff]/30">
              <Radio className="w-5 h-5 text-white drop-shadow-lg" />
            </div>
            <span className="text-lg font-bold tracking-tight">Overwatch</span>
            <Badge className="bg-gradient-to-r from-[#3b82f6] via-[#52a2ff] to-[#60a5fa] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider">
              BETA
            </Badge>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-[13px] text-gray-400 hover:text-white transition-colors tracking-wide">
                Demo
              </a>
              <a href="#" className="text-[13px] text-gray-400 hover:text-white transition-colors tracking-wide">
                Docs
              </a>
              <a href="#" className="text-[13px] text-gray-400 hover:text-white transition-colors tracking-wide">
                Pricing
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-[60px]">
        {/* Hero Section */}
        <section className="py-[80px] md:py-[100px]">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-16">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[0.95] max-w-4xl mb-6 text-balance">
                See your analytics{" "}
                <span className="bg-gradient-to-r from-[#3b82f6] via-[#52a2ff] via-[#60a5fa] to-[#93c5fd] text-transparent bg-clip-text">
                  come alive
                </span>
              </h1>
              <p className="text-lg text-gray-400 leading-[1.7] tracking-wide max-w-2xl">
                Real-time visitor tracking with zero cookies. Watch events stream in as they happen.
              </p>
            </div>

            {/* Hero Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-8 hover:border-white/[0.12] transition-colors duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#52a2ff]" />
                  </div>
                  <span className="text-sm text-gray-400 tracking-wide">Active Users</span>
                </div>
                <div className="text-5xl font-semibold mb-2 tabular-nums">{metrics.activeUsers}</div>
                <div className="text-sm text-gray-500 tracking-wide">People on site right now</div>
              </Card>

              <Card className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-8 hover:border-white/[0.12] transition-colors duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-[#52a2ff]" />
                  </div>
                  <span className="text-sm text-gray-400 tracking-wide">Page Views</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-5xl font-semibold mb-2 tabular-nums">{metrics.pageViews}</div>
                  <TrendingUp className="w-5 h-5 text-green-500 mb-2" />
                </div>
                <div className="text-sm text-gray-500 tracking-wide">Today</div>
              </Card>

              <Card className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-8 hover:border-white/[0.12] transition-colors duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[#52a2ff]" />
                  </div>
                  <span className="text-sm text-gray-400 tracking-wide">Avg. Duration</span>
                </div>
                <div className="text-5xl font-semibold mb-2 tabular-nums">{metrics.avgDuration}</div>
                <div className="text-sm text-gray-500 tracking-wide">Time on site</div>
              </Card>
            </div>
          </div>
        </section>

        {/* Live Activity Section */}
        <section className="py-12">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-3xl font-semibold mb-3 tracking-tight">Live Activity</h2>
              <p className="text-gray-400 tracking-wide">Watch events stream in real-time</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Event Stream */}
              <Card className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Activity className="w-5 h-5 text-[#52a2ff]" />
                  <h3 className="text-xl font-normal tracking-wide">Event Stream</h3>
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] animate-in fade-in slide-in-from-top-2 duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">
                          <span className="font-medium text-white">{event.city}</span> visitor {event.action}{" "}
                          <span className="text-[#52a2ff]">{event.page}</span>
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 tabular-nums">just now</span>
                    </div>
                  ))}
                  {events.length === 0 && <div className="text-center py-12 text-gray-500">Waiting for events...</div>}
                </div>
              </Card>

              {/* Geographic Activity */}
              <Card className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Globe className="w-5 h-5 text-[#52a2ff]" />
                  <h3 className="text-xl font-normal tracking-wide">Where Visitors Are From</h3>
                </div>
                <div className="space-y-4">
                  {geographic.map((country) => (
                    <div key={country.code} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: country.color }} />
                        <span className="text-sm text-gray-300">{country.country}</span>
                      </div>
                      <span className="text-sm font-medium tabular-nums">{country.count}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Audience Section */}
        <section className="py-12">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-3xl font-semibold mb-3 tracking-tight">Who's here</h2>
              <p className="text-gray-400 tracking-wide">Audience breakdown updated live</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Device Breakdown */}
              <Card className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="w-5 h-5 text-[#52a2ff]" />
                  <h3 className="text-xl font-normal tracking-wide">Device Types</h3>
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-5 h-5 text-[#3B82F6]" />
                        <span className="text-sm text-gray-300">Desktop</span>
                      </div>
                      <span className="text-sm font-medium tabular-nums">{deviceStats.desktop}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#3B82F6] rounded-full transition-all duration-500"
                        style={{ width: `${deviceStats.desktop}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-[#10B981]" />
                        <span className="text-sm text-gray-300">Mobile</span>
                      </div>
                      <span className="text-sm font-medium tabular-nums">{deviceStats.mobile}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#10B981] rounded-full transition-all duration-500"
                        style={{ width: `${deviceStats.mobile}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Tablet className="w-5 h-5 text-[#F59E0B]" />
                        <span className="text-sm text-gray-300">Tablet</span>
                      </div>
                      <span className="text-sm font-medium tabular-nums">{deviceStats.tablet}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#F59E0B] rounded-full transition-all duration-500"
                        style={{ width: `${deviceStats.tablet}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Performance Score */}
              <Card className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Gauge className="w-5 h-5 text-[#52a2ff]" />
                  <h3 className="text-xl font-normal tracking-wide">Performance Score</h3>
                </div>
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="relative w-48 h-48">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                      {/* Progress circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${performance.score * 2.827} 282.7`}
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="50%" stopColor="#52a2ff" />
                          <stop offset="100%" stopColor="#60a5fa" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-semibold tabular-nums">{performance.score}</span>
                      <span className="text-sm text-gray-400">/ 100</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 tracking-wide mt-4">Core Web Vitals</p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* SDK Integration Section */}
        <section className="py-12 pb-24">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-3xl font-semibold mb-3 tracking-tight">
                Start tracking in{" "}
                <span className="bg-gradient-to-r from-[#3b82f6] via-[#52a2ff] via-[#60a5fa] to-[#93c5fd] text-transparent bg-clip-text">
                  3 lines of code now
                </span>
              </h2>
              <p className="text-gray-400 tracking-wide">Self-hosted analytics with zero cookies</p>
            </div>

            <Card className="bg-gradient-to-br from-slate-900 to-slate-900 border border-white/[0.08] rounded-2xl p-8">
              <pre className="font-mono text-[14px] leading-[1.8] tracking-wide overflow-x-auto">
                <code className="text-gray-300">
                  <span className="text-gray-500">{"// Initialize Overwatch"}</span>
                  {"\n"}
                  <span className="text-purple-400">{"import"}</span> <span className="text-white">{"overwatch"}</span>{" "}
                  <span className="text-purple-400">{"from"}</span>{" "}
                  <span className="text-green-400">{"'overwatch-sdk'"}</span>
                  {"\n\n"}
                  <span className="text-white">{"overwatch"}</span>
                  <span className="text-gray-300">{"."}</span>
                  <span className="text-[#52a2ff]">{"init"}</span>
                  <span className="text-gray-300">{"({"}</span>
                  {"\n"}
                  {"  "}
                  <span className="text-[#52a2ff]">{"apiKey"}</span>
                  <span className="text-gray-300">{": "}</span>
                  <span className="text-green-400">{"'owk_live_your_api_key'"}</span>
                  {"\n"}
                  <span className="text-gray-300">{"});"}</span>
                </code>
              </pre>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card className="bg-[#0a0a0a] border border-white/[0.08] rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">{"<"}11KB</h3>
                <p className="text-sm text-gray-400 tracking-wide">Lighter than a tweet</p>
              </Card>
              <Card className="bg-[#0a0a0a] border border-white/[0.08] rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">Zero cookies</h3>
                <p className="text-sm text-gray-400 tracking-wide">No consent popups needed</p>
              </Card>
              <Card className="bg-[#0a0a0a] border border-white/[0.08] rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-2">100k+ events/sec</h3>
                <p className="text-sm text-gray-400 tracking-wide">Built for scale</p>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
