"use client"

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Home, Zap, Database, Brain, FileText, Users } from 'lucide-react'

export default function SystemFlowchart() {
  const [animationStep, setAnimationStep] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 8)
    }, 2000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-950 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-400/5 rounded-full blur-2xl animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6 w-full">
        <div className="w-full">
          {/* Header */}
          <div className="glass-emerald border border-emerald-200/20 dark:border-emerald-800/20 rounded-2xl mb-6 animate-fade-in-down">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-gentle">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl sm:text-3xl font-bold gradient-text font-work-sans">
                      HR Dashboard System Flow
                    </CardTitle>
                    <p className="text-sm text-black dark:text-slate-400 font-open-sans">
                      Interactive system architecture and user journey visualization
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Link href="/flowchart2">
                    <Button
                      variant="outline"
                      className="flex items-center space-x-2 glass hover-lift rounded-xl border-2 border-emerald-200/50 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300 font-work-sans bg-transparent"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="hidden sm:inline">File Architecture</span>
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button
                      variant="outline"
                      className="flex items-center space-x-2 glass hover-lift rounded-xl border-2 border-emerald-200/50 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300 font-work-sans bg-transparent"
                    >
                      <Home className="h-4 w-4" />
                      <span className="hidden sm:inline">Dashboard</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
          </div>

          {/* Legend */}
          <div
            className="glass-emerald border border-emerald-200/20 dark:border-emerald-800/20 rounded-2xl mb-6 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white font-work-sans flex items-center space-x-2">
                <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span>Flowchart Legend</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="flex items-center gap-3 animate-slide-in-left" style={{ animationDelay: "0.2s" }}>
                  <svg width="60" height="40" className="drop-shadow-lg">
                    <ellipse
                      cx="30"
                      cy="20"
                      rx="28"
                      ry="18"
                      fill="#10b981"
                      stroke="#065f46"
                      strokeWidth="2"
                      className="animate-pulse-emerald"
                    />
                  </svg>
                  <div>
                    <span className="text-sm font-bold text-black dark:text-white font-work-sans">Start/End</span>
                    <p className="text-xs text-black dark:text-slate-400 font-open-sans">Entry & exit points</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 animate-slide-in-left" style={{ animationDelay: "0.3s" }}>
                  <svg width="60" height="40" className="drop-shadow-lg">
                    <rect x="4" y="8" width="52" height="24" rx="4" fill="#3b82f6" stroke="#1e40af" strokeWidth="2" />
                  </svg>
                  <div>
                    <span className="text-sm font-bold text-black dark:text-white font-work-sans">Process</span>
                    <p className="text-xs text-black dark:text-slate-400 font-open-sans">System operations</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 animate-slide-in-left" style={{ animationDelay: "0.4s" }}>
                  <svg width="60" height="40" className="drop-shadow-lg">
                    <polygon points="30,4 54,20 30,36 6,20" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
                  </svg>
                  <div>
                    <span className="text-sm font-bold text-black dark:text-white font-work-sans">Decision</span>
                    <p className="text-xs text-black dark:text-slate-400 font-open-sans">Logic branches</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 animate-slide-in-left" style={{ animationDelay: "0.5s" }}>
                  <svg width="60" height="40" className="drop-shadow-lg">
                    <polygon points="10,8 50,8 54,32 6,32" fill="#8b5cf6" stroke="#7c3aed" strokeWidth="2" />
                  </svg>
                  <div>
                    <span className="text-sm font-bold text-black dark:text-white font-work-sans">
                      Input/Output
                    </span>
                    <p className="text-xs text-black dark:text-slate-400 font-open-sans">Data flow</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 animate-slide-in-left" style={{ animationDelay: "0.6s" }}>
                  <svg width="60" height="40" className="drop-shadow-lg">
                    <rect x="15" y="8" width="30" height="24" rx="15" fill="#ef4444" stroke="#dc2626" strokeWidth="2" />
                  </svg>
                  <div>
                    <span className="text-sm font-bold text-black dark:text-white font-work-sans">Database</span>
                    <p className="text-xs text-black dark:text-slate-400 font-open-sans">Data storage</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>

          {/* Flowchart */}
          <div
            className="glass-emerald border border-emerald-200/20 dark:border-emerald-800/20 rounded-2xl animate-fade-in-up w-full"
            style={{ animationDelay: "0.2s" }}
          >
            <CardContent className="p-4 sm:p-8">
              <div className="w-full overflow-x-auto">
                <svg
                  width="100%"
                  height="2400"
                  viewBox="0 0 2400 2400"
                  className="border rounded-2xl bg-gradient-to-br from-white/80 to-emerald-50/80 dark:from-slate-900/80 dark:to-emerald-950/80 backdrop-blur-sm shadow-2xl min-w-[2400px]"
                >
                  {/* Gradient Definitions */}
                  <defs>
                    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#065f46" />
                    </linearGradient>
                    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1e40af" />
                    </linearGradient>
                    <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                    <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                    <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#dc2626" />
                    </linearGradient>

                    {/* Arrow markers */}
                    <marker id="arrowhead" markerWidth="12" markerHeight="8" refX="11" refY="4" orient="auto">
                      <polygon points="0 0, 12 4, 0 8" fill="#374151" />
                    </marker>
                    <marker id="arrowhead-success" markerWidth="12" markerHeight="8" refX="11" refY="4" orient="auto">
                      <polygon points="0 0, 12 4, 0 8" fill="#059669" />
                    </marker>
                    <marker id="arrowhead-error" markerWidth="12" markerHeight="8" refX="11" refY="4" orient="auto">
                      <polygon points="0 0, 12 4, 0 8" fill="#dc2626" />
                    </marker>

                    {/* Glow filters */}
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Background Grid */}
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.3" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* START */}
                  <g className="animate-pulse-slow">
                    <ellipse
                      cx="300"
                      cy="100"
                      rx="120"
                      ry="60"
                      fill="url(#emeraldGrad)"
                      stroke="#065f46"
                      strokeWidth="3"
                      filter="url(#glow)"
                    />
                    <text x="300" y="90" textAnchor="middle" className="fill-white font-bold text-xl">
                      START
                    </text>
                    <text x="300" y="110" textAnchor="middle" className="fill-white text-sm">
                      User Visits Application
                    </text>
                  </g>

                  {/* File Path Annotation */}
                  <rect
                    x="450"
                    y="70"
                    width="200"
                    height="30"
                    fill="#f3f4f6"
                    stroke="#d1d5db"
                    strokeWidth="1"
                    rx="15"
                  />
                  <text x="550" y="88" textAnchor="middle" className="fill-gray-700 text-xs font-mono">
                    📁 app/page.tsx
                  </text>

                  {/* Middleware Authentication */}
                  <g>
                    <rect
                      x="600"
                      y="200"
                      width="300"
                      height="80"
                      fill="url(#blueGrad)"
                      stroke="#1e40af"
                      strokeWidth="2"
                      rx="15"
                      filter="url(#glow)"
                    />
                    <text x="750" y="225" textAnchor="middle" className="fill-white font-bold text-lg">
                      🛡️ Middleware Authentication
                    </text>
                    <text x="750" y="245" textAnchor="middle" className="fill-white text-sm">
                      Check user session & cookies
                    </text>
                    <text x="750" y="265" textAnchor="middle" className="fill-white text-xs">
                      Validates authentication state
                    </text>
                  </g>

                  {/* File Path */}
                  <rect
                    x="920"
                    y="220"
                    width="180"
                    height="25"
                    fill="#f3f4f6"
                    stroke="#d1d5db"
                    strokeWidth="1"
                    rx="12"
                  />
                  <text x="1010" y="235" textAnchor="middle" className="fill-gray-700 text-xs font-mono">
                    📁 middleware.ts
                  </text>

                  {/* Authentication Decision */}
                  <g>
                    <polygon
                      points="750,350 850,400 750,450 650,400"
                      fill="url(#orangeGrad)"
                      stroke="#d97706"
                      strokeWidth="2"
                      filter="url(#glow)"
                    />
                    <text x="750" y="390" textAnchor="middle" className="fill-white font-bold text-sm">
                      Authenticated?
                    </text>
                    <text x="750" y="410" textAnchor="middle" className="fill-white text-xs">
                      Session validation
                    </text>
                  </g>

                  {/* Login Form (NO path) */}
                  <g>
                    <rect
                      x="200"
                      y="500"
                      width="280"
                      height="100"
                      fill="url(#blueGrad)"
                      stroke="#1e40af"
                      strokeWidth="2"
                      rx="15"
                      filter="url(#glow)"
                    />
                    <text x="340" y="530" textAnchor="middle" className="fill-white font-bold text-lg">
                      📝 Login Form
                    </text>
                    <text x="340" y="550" textAnchor="middle" className="fill-white text-sm">
                      Email & password authentication
                    </text>
                    <text x="340" y="570" textAnchor="middle" className="fill-white text-xs">
                      User credential validation
                    </text>
                    <text x="340" y="585" textAnchor="middle" className="fill-white text-xs">
                      Session creation & cookie setup
                    </text>
                  </g>

                  {/* File Path */}
                  <rect
                    x="500"
                    y="530"
                    width="220"
                    height="25"
                    fill="#f3f4f6"
                    stroke="#d1d5db"
                    strokeWidth="1"
                    rx="12"
                  />
                  <text x="610" y="545" textAnchor="middle" className="fill-gray-700 text-xs font-mono">
                    📁 components/LoginForm.tsx
                  </text>

                  {/* Dashboard (YES path) */}
                  <g>
                    <rect
                      x="1200"
                      y="500"
                      width="300"
                      height="100"
                      fill="url(#emeraldGrad)"
                      stroke="#065f46"
                      strokeWidth="2"
                      rx="15"
                      filter="url(#glow)"
                    />
                    <text x="1350" y="530" textAnchor="middle" className="fill-white font-bold text-lg">
                      🏠 HR Dashboard
                    </text>
                    <text x="1350" y="550" textAnchor="middle" className="fill-white text-sm">
                      Main application interface
                    </text>
                    <text x="1350" y="570" textAnchor="middle" className="fill-white text-xs">
                      Rankings, Applications, Results
                    </text>
                    <text x="1350" y="585" textAnchor="middle" className="fill-white text-xs">
                      User management & analytics
                    </text>
                  </g>

                  {/* File Path */}
                  <rect
                    x="1520"
                    y="530"
                    width="200"
                    height="25"
                    fill="#f3f4f6"
                    stroke="#d1d5db"
                    strokeWidth="1"
                    rx="12"
                  />
                  <text x="1620" y="545" textAnchor="middle" className="fill-gray-700 text-xs font-mono">
                    📁 components/Dashboard.tsx
                  </text>

                  {/* Login API */}
                  <g>
                    <polygon
                      points="200,700 380,700 400,750 380,800 200,800 180,750"
                      fill="url(#purpleGrad)"
                      stroke="#7c3aed"
                      strokeWidth="2"
                      filter="url(#glow)"
                    />
                    <text x="290" y="735" textAnchor="middle" className="fill-white font-bold text-sm">
                      🔐 Login API
                    </text>
                    <text x="290" y="750" textAnchor="middle" className="fill-white text-xs">
                      Supabase authentication
                    </text>
                    <text x="290" y="765" textAnchor="middle" className="fill-white text-xs">
                      JWT token generation
                    </text>
                  </g>

                  {/* File Path */}
                  <rect
                    x="420"
                    y="735"
                    width="240"
                    height="25"
                    fill="#f3f4f6"
                    stroke="#d1d5db"
                    strokeWidth="1"
                    rx="12"
                  />
                  <text x="540" y="750" textAnchor="middle" className="fill-gray-700 text-xs font-mono">
                    📁 app/api/auth/login/route.ts
                  </text>

                  {/* Database */}
                  <g>
                    <ellipse cx="290" cy="950" rx="80" ry="40" fill="url(#redGrad)" stroke="#dc2626" strokeWidth="2" />
                    <rect
                      x="250"
                      y="930"
                      width="80"
                      height="40"
                      fill="url(#redGrad)"
                      stroke="#dc2626"
                      strokeWidth="2"
                    />
                    <text x="290" y="940" textAnchor="middle" className="fill-white font-bold text-sm">
                      🗄️ Database
                    </text>
                    <text x="290" y="955" textAnchor="middle" className="fill-white text-xs">
                      User data storage
                    </text>
                    <text x="290" y="970" textAnchor="middle" className="fill-white text-xs">
                      Supabase PostgreSQL
                    </text>
                  </g>

                  {/* Ranking Builder */}
                  <g>
                    <rect
                      x="1000"
                      y="700"
                      width="280"
                      height="80"
                      fill="url(#blueGrad)"
                      stroke="#1e40af"
                      strokeWidth="2"
                      rx="15"
                      filter="url(#glow)"
                    />
                    <text x="1140" y="725" textAnchor="middle" className="fill-white font-bold text-lg">
                      ⚡ Ranking Builder
                    </text>
                    <text x="1140" y="745" textAnchor="middle" className="fill-white text-sm">
                      Create & manage job rankings
                    </text>
                    <text x="1140" y="765" textAnchor="middle" className="fill-white text-xs">
                      Criteria definition & weighting
                    </text>
                  </g>

                  {/* File Path */}
                  <rect
                    x="1300"
                    y="725"
                    width="240"
                    height="25"
                    fill="#f3f4f6"
                    stroke="#d1d5db"
                    strokeWidth="1"
                    rx="12"
                  />
                  <text x="1420" y="740" textAnchor="middle" className="fill-gray-700 text-xs font-mono">
                    📁 components/RankingBuilder.tsx
                  </text>

                  {/* Application Form */}
                  <g>
                    <rect
                      x="1400"
                      y="850"
                      width="280"
                      height="80"
                      fill="url(#purpleGrad)"
                      stroke="#7c3aed"
                      strokeWidth="2"
                      rx="15"
                      filter="url(#glow)"
                    />
                    <text x="1540" y="875" textAnchor="middle" className="fill-white font-bold text-lg">
                      📋 Application Form
                    </text>
                    <text x="1540" y="895" textAnchor="middle" className="fill-white text-sm">
                      Candidate application submission
                    </text>
                    <text x="1540" y="915" textAnchor="middle" className="fill-white text-xs">
                      File uploads & data collection
                    </text>
                  </g>

                  {/* File Path */}
                  <rect
                    x="1700"
                    y="875"
                    width="240"
                    height="25"
                    fill="#f3f4f6"
                    stroke="#d1d5db"
                    strokeWidth="1"
                    rx="12"
                  />
                  <text x="1820" y="890" textAnchor="middle" className="fill-gray-700 text-xs font-mono">
                    📁 components/ApplicationForm.tsx
                  </text>

                  {/* Results Dashboard */}
                  <g>
                    <rect
                      x="800"
                      y="1000"
                      width="280"
                      height="80"
                      fill="url(#emeraldGrad)"
                      stroke="#065f46"
                      strokeWidth="2"
                      rx="15"
                      filter="url(#glow)"
                    />
                    <text x="940" y="1025" textAnchor="middle" className="fill-white font-bold text-lg">
                      📊 Results Dashboard
                    </text>
                    <text x="940" y="1045" textAnchor="middle" className="fill-white text-sm">
                      Application scoring & analytics
                    </text>
                    <text x="940" y="1065" textAnchor="middle" className="fill-white text-xs">
                      Candidate ranking & evaluation
                    </text>
                  </g>

                  {/* File Path */}
                  <rect
                    x="1100"
                    y="1025"
                    width="250"
                    height="25"
                    fill="#f3f4f6"
                    stroke="#d1d5db"
                    strokeWidth="1"
                    rx="12"
                  />
                  <text x="1225" y="1040" textAnchor="middle" className="fill-gray-700 text-xs font-mono">
                    📁 components/ResultsDashboard.tsx
                  </text>

                  {/* Connection Lines */}

                  {/* START to Middleware */}
                  <path
                    d="M 420 100 Q 500 100 600 200"
                    stroke="#374151"
                    strokeWidth="3"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                    className="animate-draw-line"
                  />

                  {/* Middleware to Decision */}
                  <path
                    d="M 750 280 L 750 350"
                    stroke="#374151"
                    strokeWidth="3"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                    className="animate-draw-line"
                    style={{ animationDelay: "0.5s" }}
                  />

                  {/* Decision to Login (NO) */}
                  <path
                    d="M 650 400 Q 500 400 340 500"
                    stroke="#dc2626"
                    strokeWidth="3"
                    fill="none"
                    markerEnd="url(#arrowhead-error)"
                    className="animate-draw-line"
                    style={{ animationDelay: "1s" }}
                  />
                  <text x="550" y="390" className="fill-red-600 font-bold text-sm">
                    ❌ NO
                  </text>

                  {/* Decision to Dashboard (YES) */}
                  <path
                    d="M 850 400 Q 1000 400 1200 500"
                    stroke="#059669"
                    strokeWidth="3"
                    fill="none"
                    markerEnd="url(#arrowhead-success)"
                    className="animate-draw-line"
                    style={{ animationDelay: "1s" }}
                  />
                  <text x="950" y="390" className="fill-green-600 font-bold text-sm">
                    ✅ YES
                  </text>

                  {/* Login to API */}
                  <path
                    d="M 340 600 L 290 700"
                    stroke="#374151"
                    strokeWidth="3"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                    className="animate-draw-line"
                    style={{ animationDelay: "1.5s" }}
                  />

                  {/* API to Database */}
                  <path
                    d="M 290 800 L 290 910"
                    stroke="#374151"
                    strokeWidth="3"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                    className="animate-draw-line"
                    style={{ animationDelay: "2s" }}
                  />

                  {/* Login Success Loop */}
                  <path
                    d="M 480 550 Q 600 450 650 400"
                    stroke="#059669"
                    strokeWidth="3"
                    fill="none"
                    markerEnd="url(#arrowhead-success)"
                    className="animate-draw-line"
                    style={{ animationDelay: "2.5s" }}
                  />
                  <text x="580" y="480" className="fill-green-600 font-bold text-sm">
                    ✅ SUCCESS
                  </text>

                  {/* Dashboard to Ranking Builder */}
                  <path
                    d="M 1350 600 Q 1350 650 1140 700"
                    stroke="#374151"
                    strokeWidth="3"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                    className="animate-draw-line"
                    style={{ animationDelay: "3s" }}
                  />

                  {/* Dashboard to Application Form */}
                  <path
                    d="M 1450 600 Q 1500 700 1540 850"
                    stroke="#374151"
                    strokeWidth="3"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                    className="animate-draw-line"
                    style={{ animationDelay: "3.5s" }}
                  />

                  {/* Ranking Builder to Results */}
                  <path
                    d="M 1140 780 Q 1100 850 940 1000"
                    stroke="#374151"
                    strokeWidth="3"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                    className="animate-draw-line"
                    style={{ animationDelay: "4s" }}
                  />

                  {/* Application Form to Results */}
                  <path
                    d="M 1540 930 Q 1400 950 1080 1040"
                    stroke="#374151"
                    strokeWidth="3"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                    className="animate-draw-line"
                    style={{ animationDelay: "4.5s" }}
                  />

                  {/* Flow Indicators */}
                  <g className="animate-pulse">
                    <circle cx="500" cy="150" r="4" fill="#10b981" />
                    <circle cx="750" cy="320" r="4" fill="#f59e0b" />
                    <circle cx="1100" cy="450" r="4" fill="#10b981" />
                  </g>
                </svg>
              </div>
            </CardContent>
          </div>

          {/* Quick Access Panel */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Link href="/" className="block">
              <div className="glass-emerald border border-emerald-200/20 dark:border-emerald-800/20 rounded-2xl p-6 hover-lift transition-all duration-300 group">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-black dark:text-white font-work-sans">Dashboard</h3>
                    <p className="text-xs text-black dark:text-slate-400 font-open-sans">Main Interface</p>
                  </div>
                </div>
              </div>
            </Link>

            <div className="glass-emerald border border-emerald-200/20 dark:border-emerald-800/20 rounded-2xl p-6 hover-lift transition-all duration-300 group cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-black dark:text-white font-work-sans">Rankings</h3>
                  <p className="text-xs text-black dark:text-slate-400 font-open-sans">Job Postings</p>
                </div>
              </div>
            </div>

            <div className="glass-emerald border border-emerald-200/20 dark:border-emerald-800/20 rounded-2xl p-6 hover-lift transition-all duration-300 group cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-black dark:text-white font-work-sans">AI Engine</h3>
                  <p className="text-xs text-black dark:text-slate-400 font-open-sans">Smart Scoring</p>
                </div>
              </div>
            </div>

            <div className="glass-emerald border border-emerald-200/20 dark:border-emerald-800/20 rounded-2xl p-6 hover-lift transition-all duration-300 group cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-black dark:text-white font-work-sans">Database</h3>
                  <p className="text-xs text-black dark:text-slate-400 font-open-sans">Supabase</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
