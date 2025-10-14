"use client"

import type React from "react"
import { useState } from "react"

interface SignupFormProps {
  onSwitchToLogin: () => void
}

export default function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstname, setFirstname] = useState("")
  const [lastname, setLastname] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState<"signup" | "verify">("signup")
  const [message, setMessage] = useState("")
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signup")
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [verificationCode, setVerificationCode] = useState("")

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          firstname,
          lastname,
          company_name: companyName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Signup failed")
        return
      }

      if (data.requiresVerification) {
        setStep("verify")
        setMessage("Please check your email and enter the verification code sent to you!")
      } else {
        setMessage("Account created successfully! Redirecting to dashboard...")
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    } catch (err) {
      console.error("Signup error:", err)
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Account verified successfully! Signing you in...")

        try {
          const loginResponse = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          })

          const loginData = await loginResponse.json()

          if (loginResponse.ok) {
            setMessage("Welcome! Redirecting to dashboard...")
            setTimeout(() => {
              window.location.reload() // This will trigger the auth check in the main app
            }, 1500)
          } else {
            // If auto-login fails, just redirect to login
            setMessage("Account verified successfully! You can now sign in.")
            setTimeout(() => onSwitchToLogin(), 2000)
          }
        } catch (loginError) {
          // If auto-login fails, just redirect to login
          setMessage("Account verified successfully! You can now sign in.")
          setTimeout(() => onSwitchToLogin(), 2000)
        }
      } else {
        setError(data.error || "Verification failed")
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0) return

    setResendLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("New verification code sent to your email!")
        setResendCooldown(60)
        const interval = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setError(data.error || "Failed to resend code")
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="relative animate-scale-in">
      <div className="text-center mb-8 animate-fade-in-down">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-lg animate-bounce-gentle hover-glow transition-all duration-500">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-bold gradient-text mb-3 font-work-sans">
          {step === "signup" ? "Join HireRankerAI" : "Check Your Email"}
        </h2>
        <p className="text-slate-700 dark:text-slate-300 font-open-sans">
          {step === "signup"
            ? "Create your account and transform hiring"
            : "Click the confirmation link in your email to verify your account"}
        </p>
      </div>

      <div className="flex glass-emerald rounded-2xl p-1.5 mb-8 animate-slide-in-left">
        <button
          onClick={() => {
            setActiveTab("signin")
            onSwitchToLogin()
          }}
          className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-500 font-work-sans transform ${
            activeTab === "signin"
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg scale-105 hover-glow"
              : "text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 hover-float hover:scale-105"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setActiveTab("signup")}
          className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-500 font-work-sans transform ${
            activeTab === "signup"
              ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg scale-105 hover-glow"
              : "text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 hover-float hover:scale-105"
          }`}
        >
          Sign Up
        </button>
      </div>

      {step === "signup" ? (
        <form onSubmit={handleSignup} className="space-y-6 animate-slide-in-right">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative group animate-fade-in-up hover-lift" style={{ animationDelay: "0.1s" }}>
              <input
                type="text"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                placeholder=" "
                className="w-full px-4 py-4 bg-white/60 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-transparent focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-500 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-lg hover:scale-[1.02] peer font-open-sans backdrop-blur-sm"
                required
              />
              <label className="absolute left-4 -top-2.5 bg-white dark:bg-slate-800 px-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-700 dark:peer-placeholder-shown:text-slate-300 peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-emerald-600 peer-focus:bg-white dark:peer-focus:bg-slate-800 font-work-sans">
                First Name
              </label>
            </div>
            <div className="relative group animate-fade-in-up hover-lift" style={{ animationDelay: "0.15s" }}>
              <input
                type="text"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                placeholder=" "
                className="w-full px-4 py-4 bg-white/60 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-transparent focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-500 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-lg hover:scale-[1.02] peer font-open-sans backdrop-blur-sm"
                required
              />
              <label className="absolute left-4 -top-2.5 bg-white dark:bg-slate-800 px-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-700 dark:peer-placeholder-shown:text-slate-300 peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-emerald-600 peer-focus:bg-white dark:peer-focus:bg-slate-800 font-work-sans">
                Last Name
              </label>
            </div>
          </div>

          <div className="relative group animate-fade-in-up hover-lift" style={{ animationDelay: "0.17s" }}>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder=" "
              className="w-full px-4 py-4 bg-white/60 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-transparent focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-500 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-lg hover:scale-[1.02] peer font-open-sans backdrop-blur-sm"
              required
            />
            <label className="absolute left-4 -top-2.5 bg-white dark:bg-slate-800 px-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-700 dark:peer-placeholder-shown:text-slate-300 peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-emerald-600 peer-focus:bg-white dark:peer-focus:bg-slate-800 font-work-sans">
              Company Name
            </label>
          </div>

          <div className="relative group animate-fade-in-up hover-lift" style={{ animationDelay: "0.2s" }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              className="w-full px-4 py-4 bg-white/60 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-transparent focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-500 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-lg hover:scale-[1.02] peer font-open-sans backdrop-blur-sm"
              required
            />
            <label className="absolute left-4 -top-2.5 bg-white dark:bg-slate-800 px-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-700 dark:peer-placeholder-shown:text-slate-300 peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-emerald-600 peer-focus:bg-white dark:peer-focus:bg-slate-800 font-work-sans">
              Email Address
            </label>
          </div>

          <div className="relative group animate-fade-in-up hover-lift" style={{ animationDelay: "0.25s" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              className="w-full px-4 py-4 pr-12 bg-white/60 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-transparent focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-500 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-lg hover:scale-[1.02] peer font-open-sans backdrop-blur-sm"
              required
            />
            <label className="absolute left-4 -top-2.5 bg-white dark:bg-slate-800 px-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-700 dark:peer-placeholder-shown:text-slate-300 peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-emerald-600 peer-focus:bg-white dark:peer-focus:bg-slate-800 font-work-sans">
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-500 hover:scale-110 group"
            >
              <div className="p-1 rounded-lg group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-all duration-300 hover:scale-110">
                {showPassword ? (
                  <svg
                    className="h-5 w-5 transition-transform duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 transition-transform duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
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

          <div className="relative group animate-fade-in-up hover-lift" style={{ animationDelay: "0.3s" }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder=" "
              className="w-full px-4 py-4 pr-12 bg-white/60 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-transparent focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-500 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-lg hover:scale-[1.02] peer font-open-sans backdrop-blur-sm"
              required
            />
            <label className="absolute left-4 -top-2.5 bg-white dark:bg-slate-800 px-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-700 dark:peer-placeholder-shown:text-slate-300 peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-emerald-600 peer-focus:bg-white dark:peer-focus:bg-slate-800 font-work-sans">
              Confirm Password
            </label>
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-500 hover:scale-110 group"
            >
              <div className="p-1 rounded-lg group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 transition-all duration-300 hover:scale-110">
                {showConfirmPassword ? (
                  <svg
                    className="h-5 w-5 transition-transform duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 transition-transform duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
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
            <div className="animate-bounce-gentle hover-lift">
              <div className="flex items-center space-x-3 text-red-600 dark:text-red-400 text-sm bg-red-50/80 dark:bg-red-900/30 p-4 rounded-2xl border border-red-200 dark:border-red-800 shadow-lg backdrop-blur-sm transition-all duration-300">
                <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0 animate-pulse">
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
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 px-6 rounded-2xl font-semibold hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 transform hover:scale-105 hover:shadow-2xl active:scale-95 ripple-effect animate-fade-in-up font-work-sans hover-glow"
            style={{ animationDelay: "0.35s" }}
          >
            <div className="flex items-center justify-center space-x-2">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <svg
                    className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
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
      ) : (
        <div className="text-center space-y-6 animate-slide-in-right">
          <div className="flex justify-center animate-bounce-gentle">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm">
              <svg
                className="w-10 h-10 text-emerald-600 dark:text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          <div className="relative group animate-fade-in-up hover-lift" style={{ animationDelay: "0.4s" }}>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder=" "
              className="w-full px-4 py-4 bg-white/60 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-transparent focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-500 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-lg hover:scale-[1.02] peer font-open-sans backdrop-blur-sm"
              required
            />
            <label className="absolute left-4 -top-2.5 bg-white dark:bg-slate-800 px-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-700 dark:peer-placeholder-shown:text-slate-300 peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-emerald-600 peer-focus:bg-white dark:peer-focus:bg-slate-800 font-work-sans">
              Verification Code
            </label>
          </div>

          {message && (
            <div className="animate-bounce-gentle hover-lift">
              <div className="flex items-center space-x-3 text-emerald-600 dark:text-emerald-400 text-sm bg-emerald-50/80 dark:bg-emerald-900/30 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-lg backdrop-blur-sm transition-all duration-300">
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="font-medium font-open-sans">{message}</span>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleVerify}
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 px-6 rounded-2xl font-semibold hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 transform hover:scale-105 hover:shadow-2xl active:scale-95 ripple-effect animate-fade-in-up font-work-sans hover-glow"
            style={{ animationDelay: "0.45s" }}
          >
            <div className="flex items-center justify-center space-x-2">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Verifying Account...</span>
                </>
              ) : (
                <>
                  <span>Verify Account</span>
                  <svg
                    className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
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

          <div className="text-center animate-fade-in">
            <button
              onClick={handleResendCode}
              disabled={resendLoading || resendCooldown > 0}
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-sm font-medium transition-all duration-500 hover:scale-105 hover-float font-work-sans"
            >
              {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : "Resend Verification Code"}
            </button>
          </div>

          <div className="text-center animate-fade-in">
            <button
              onClick={onSwitchToLogin}
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-sm font-medium transition-all duration-500 hover:scale-105 hover-float font-work-sans"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      )}

      <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-200/20 rounded-full blur-2xl animate-pulse-slow pointer-events-none"></div>
      <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-emerald-300/10 rounded-full blur-3xl animate-float pointer-events-none"></div>
    </div>
  )
}
