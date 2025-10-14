"use client"

import { useState, useEffect } from "react"
import LoginForm from "@/components/LoginForm"
import SignupForm from "@/components/SignupForm"
import ForgotPasswordForm from "@/components/ForgotPasswordForm"
import Dashboard from "@/components/Dashboard"

export default function Home() {
  const [currentView, setCurrentView] = useState<"login" | "signup" | "forgot" | "dashboard">("login")
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include", // Include cookies
        })

        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
          setCurrentView("dashboard")
        } else {
          // User is not authenticated
          setUser(null)
          setCurrentView("login")
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        setUser(null)
        setCurrentView("login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogin = (userData: any) => {
    setUser(userData)
    setCurrentView("dashboard")
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setUser(null)
      setCurrentView("login")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-950 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">Loading...</span>
        </div>
      </div>
    )
  }

  if (currentView === "dashboard") {
    return <Dashboard user={user} onLogout={handleLogout} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl animate-pulse-slow"></div>
      </div>

      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-6 animate-fade-in-down">
        <div className="flex items-center space-x-3 hover-lift">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg animate-scale-in">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-2xl sm:text-3xl font-bold gradient-text font-work-sans">HireRankerAI</span>
        </div>

        <nav className="hidden md:flex space-x-8">
          {["Features", "How it Works", "Pricing"].map((item, index) => (
            <a
              key={item}
              href="#"
              className="text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-all duration-300 hover-float stagger-item"
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              {item}
            </a>
          ))}
        </nav>

        <button className="md:hidden p-2 rounded-xl glass-emerald hover-glow">
          <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      <div className="relative z-10 flex flex-col lg:flex-row items-start justify-between px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 gap-8 lg:gap-16">
        <div className="flex-1 max-w-4xl animate-fade-in-left">
          <div className="mb-6 sm:mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full glass-emerald text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6 animate-bounce-gentle">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse-emerald"></span>
              Revolutionary AI-Powered Hiring
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-tight mb-6 font-work-sans">
              <span className="block animate-fade-in-up">Transform Your</span>
              <span className="block gradient-text animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                Hiring Process
              </span>
              <span
                className="block text-slate-700 dark:text-slate-300 animate-fade-in-up"
                style={{ animationDelay: "0.4s" }}
              >
                Forever
              </span>
            </h1>
          </div>

          <p
            className="text-lg sm:text-xl text-slate-700 dark:text-slate-300 mb-8 sm:mb-12 leading-relaxed font-open-sans animate-fade-in-up"
            style={{ animationDelay: "0.6s" }}
          >
            Rank applicants intelligently with AI-powered scoring, video interviews, and automated workflows. Make
            better hiring decisions faster than ever before.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                ),
                title: "AI-Powered Ranking",
                description: "Smart candidate scoring",
                color: "emerald",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                ),
                title: "Video Interviews",
                description: "Seamless remote screening",
                color: "teal",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                ),
                title: "Resume Analysis",
                description: "Intelligent document parsing",
                color: "emerald",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                title: "Automated Workflow",
                description: "Streamlined hiring pipeline",
                color: "teal",
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="flex items-start space-x-4 p-4 sm:p-6 rounded-2xl glass hover-lift stagger-item group"
                style={{ animationDelay: `${0.8 + index * 0.1}s` }}
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-br from-${feature.color}-500 to-${feature.color}-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-slate-800 dark:text-slate-100 font-semibold text-lg mb-1 font-work-sans">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm font-open-sans">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: "1.2s" }}>
            <button className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-2xl shadow-lg hover-glow ripple-effect transition-all duration-300 font-work-sans">
              Start Free Trial
            </button>
            <button className="px-8 py-4 glass-emerald text-emerald-700 dark:text-emerald-300 font-semibold rounded-2xl hover-float transition-all duration-300 font-work-sans">
              Watch Demo
            </button>
          </div>
        </div>

        <div className="w-full lg:w-96 animate-fade-in-right">
          <div className="glass-emerald rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl border border-emerald-200/20 dark:border-emerald-800/20 hover-lift bg-white/80 dark:bg-slate-800/80">
            {currentView === "login" && (
              <LoginForm
                onLogin={handleLogin}
                onSwitchToSignup={() => setCurrentView("signup")}
                onSwitchToForgot={() => setCurrentView("forgot")}
              />
            )}
            {currentView === "signup" && <SignupForm onSwitchToLogin={() => setCurrentView("login")} />}
            {currentView === "forgot" && <ForgotPasswordForm onSwitchToLogin={() => setCurrentView("login")} />}
          </div>
        </div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 sm:mb-12 animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6 font-work-sans">
              Everything You Need for
              <span className="gradient-text block sm:inline"> Smart Hiring</span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-700 dark:text-slate-300 leading-relaxed font-open-sans">
              From candidate screening to final interviews, HireRankerAI streamlines your entire hiring workflow with
              cutting-edge AI technology.
            </p>
          </div>

          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-12 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            {[
              { number: "10K+", label: "Companies" },
              { number: "500K+", label: "Candidates" },
              { number: "95%", label: "Success Rate" },
              { number: "50%", label: "Time Saved" },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="text-center stagger-item"
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                <div className="text-2xl sm:text-3xl font-bold gradient-text mb-2 font-work-sans">{stat.number}</div>
                <div className="text-slate-700 dark:text-slate-300 text-sm font-open-sans">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
            <button className="magnetic px-10 py-5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-lg rounded-2xl shadow-2xl hover-glow ripple-effect transition-all duration-300 font-work-sans">
              Transform Your Hiring Today
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
