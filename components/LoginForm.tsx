"use client"

import type React from "react"
import { useState } from "react"

interface LoginFormProps {
  onLogin: (userData: any) => void
  onSwitchToSignup: () => void
  onSwitchToForgot: () => void
  onSwitchToVerification?: (email: string) => void
}

export default function LoginForm({
  onLogin,
  onSwitchToSignup,
  onSwitchToForgot,
  onSwitchToVerification,
}: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.requiresVerification && onSwitchToVerification) {
          onSwitchToVerification(data.email)
          return
        }
        setError(data.error || "Login failed")
        return
      }

      if (data.user) {
        onLogin(data.user)
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative animate-scale-in">
      <div className="text-center mb-8 animate-fade-in-down">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-lg animate-bounce-gentle">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-bold gradient-text mb-3 font-work-sans">Welcome Back</h2>
        <p className="text-slate-700 dark:text-slate-300 font-open-sans">Sign in to continue your hiring journey</p>
      </div>

      <div className="flex glass-emerald rounded-2xl p-1.5 mb-8 animate-slide-in-left">
        <button
          data-testid="signin-tab-button"
          onClick={() => setActiveTab("signin")}
          className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 font-work-sans ${
            activeTab === "signin"
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg transform scale-105"
              : "text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 hover-float"
          }`}
        >
          Sign In
        </button>
        <button
          data-testid="signup-tab-button"
          onClick={() => {
            setActiveTab("signup")
            onSwitchToSignup()
          }}
          className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 font-work-sans ${
            activeTab === "signup"
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg transform scale-105"
              : "text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 hover-float"
          }`}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 animate-slide-in-right">
        <div className="relative group animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder=" "
            className="w-full px-4 py-4 bg-white/50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-transparent focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-600 hover-lift peer font-open-sans"
            required
          />
          <label
            htmlFor="email"
            className="absolute left-4 -top-2.5 bg-white dark:bg-slate-800 px-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-700 dark:peer-placeholder-shown:text-slate-300 peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-emerald-600 peer-focus:bg-white dark:peer-focus:bg-slate-800 font-work-sans"
          >
            Email Address
          </label>
        </div>

        <div className="relative group animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder=" "
            className="w-full px-4 py-4 pr-12 bg-white/50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-transparent focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-600 hover-lift peer font-open-sans"
            required
          />
          <label
            htmlFor="password"
            className="absolute left-4 -top-2.5 bg-white dark:bg-slate-800 px-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-700 dark:peer-placeholder-shown:text-slate-300 peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-emerald-600 peer-focus:bg-white dark:peer-focus:bg-slate-800 font-work-sans"
          >
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 hover:scale-110 group"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <div className="p-1 rounded-lg group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-colors duration-200">
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </div>
          </button>
        </div>

        {error && (
          <div className="animate-bounce-gentle">
            <div className="flex items-center space-x-3 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-200 dark:border-red-800 shadow-sm">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="font-medium font-open-sans">{error}</span>
            </div>
          </div>
        )}

        <button
          data-testid="login-submit-button"
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 px-6 rounded-2xl font-semibold hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95 ripple-effect animate-fade-in-up font-work-sans"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="flex items-center justify-center space-x-2">
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <svg
                  className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </div>
        </button>
      </form>

      <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
        <button
          onClick={onSwitchToForgot}
          className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-sm font-medium transition-all duration-300 hover:scale-105 hover-float font-work-sans"
        >
          Forgot your password?
        </button>
      </div>

      <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-200/20 rounded-full blur-2xl animate-pulse-slow pointer-events-none"></div>
      <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-emerald-300/10 rounded-full blur-3xl animate-float pointer-events-none"></div>
    </div>
  )
}
