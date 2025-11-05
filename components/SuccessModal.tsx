"use client"

import { CheckCircle } from "lucide-react"

interface SuccessModalProps {
  isOpen: boolean
  title: string
  message: string
  onOk: () => void
  okButtonText?: string
}

export default function SuccessModal({ isOpen, title, message, onOk, okButtonText = "OK" }: SuccessModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="border border-border rounded-xl p-4 sm:p-6 w-full max-w-md bg-card shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-shrink-0">
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-foreground">{title}</h3>
        </div>

        <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed">{message}</p>

        <button
          onClick={onOk}
          className="btn-primary w-full px-4 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200"
        >
          {okButtonText}
        </button>
      </div>
    </div>
  )
}
