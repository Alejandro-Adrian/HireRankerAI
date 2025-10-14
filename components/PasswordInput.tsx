"use client"
import { useState } from "react"

interface PasswordInputProps {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  required?: boolean
  disabled?: boolean
  label?: string
  error?: string
}

export default function PasswordInput({
  id = "password",
  value,
  onChange,
  placeholder = " ",
  className = "",
  required = false,
  disabled = false,
  label = "Password",
  error,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  const baseClassName = `w-full px-4 py-4 pr-12 bg-white/50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-transparent focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-600 hover-lift peer font-open-sans ${
    error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""
  } ${className}`

  return (
    <div className="relative group">
      <input
        id={id}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={baseClassName}
        required={required}
        disabled={disabled}
      />
      <label
        htmlFor={id}
        className={`absolute left-4 -top-2.5 bg-white dark:bg-slate-800 px-2 text-sm font-medium transition-all duration-300 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-sm peer-focus:bg-white dark:peer-focus:bg-slate-800 font-work-sans ${
          error
            ? "text-red-600 dark:text-red-400 peer-placeholder-shown:text-slate-700 dark:peer-placeholder-shown:text-slate-300 peer-focus:text-red-600"
            : "text-emerald-600 dark:text-emerald-400 peer-placeholder-shown:text-slate-700 dark:peer-placeholder-shown:text-slate-300 peer-focus:text-emerald-600"
        }`}
      >
        {label}
      </label>
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 hover:scale-110 group"
        aria-label={showPassword ? "Hide password" : "Show password"}
        disabled={disabled}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
      {error && (
        <div className="mt-2 flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium font-open-sans">{error}</span>
        </div>
      )}
    </div>
  )
}
