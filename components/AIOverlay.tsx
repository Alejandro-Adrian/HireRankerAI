"use client"

import React, { useEffect, useState } from "react"
import dynamic from "next/dynamic"

const AIChatbot = dynamic(() => import("@/components/AIChatbot"), { ssr: false })

export default function AIOverlay(): JSX.Element {
  const [isVisible, setVisible] = useState<boolean>(false)
  const [mounted, setMounted] = useState<boolean>(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVisible(false)
    }
    if (mounted) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [mounted])

  const toggle = () => {
    if (!mounted) {
      setMounted(true)
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(!isVisible)
    }
  }

  const onPanelTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (!isVisible && e.propertyName === "opacity") setMounted(false)
  }

  return (
    <>
      <button
        onClick={toggle}
        aria-expanded={isVisible}
        className={`
          fixed flex items-center justify-center rounded-full shadow-lg
          bottom-5 left-3 w-14 h-10 md:w-16 md:h-12
          bg-gradient-to-r from-red-500 via-purple-600 to-blue-500
          animate-gradient hover:animate-none hover:shadow-[0_0_15px_rgba(255,0,255,0.7)]
          transform hover:scale-110 transition-transform active:scale-95 z-60
          ${isVisible ? "animate-none" : ""}
        `}
      >
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {mounted && (
        <>
          <div
            className={`overlay-backdrop ${isVisible ? "overlay-backdrop--visible" : "overlay-backdrop--hidden"}`}
            onClick={() => setVisible(false)}
          />
          <div
            className={`ai-overlay ${isVisible ? "ai-overlay--visible" : "ai-overlay--hidden"}`}
            onTransitionEnd={onPanelTransitionEnd}
            role="dialog"
            aria-modal="true"
          >
            <div className="ai-overlay__inner">
              <AIChatbot />
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-gradient {
          background-size: 300% 300%;
          animation: gradientShift 4s ease infinite;
        }

        .animate-none {
          animation: none !important;
        }

        .overlay-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0);
          pointer-events: none;
          transition: background 200ms ease;
          z-index: 50;
        }

        .overlay-backdrop--visible {
          background: rgba(0,0,0,0.45);
          pointer-events: auto;
        }

        .ai-overlay {
          position: fixed;
          right: 0.4rem;
          bottom: 4.5rem;
          z-index: 70;
          width: 360px;
          height: 500px;
          transform-origin: bottom right;
          transition: opacity 200ms cubic-bezier(0.22, 1, 0.36, 1),
                      transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
          opacity: 0;
          transform: translateY(6px) scale(0.98);
          pointer-events: none;
        }

        .ai-overlay__inner {
          width: 100%;
          height: 100%;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        }

        .ai-overlay--visible {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
          animation: popIn 220ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .ai-overlay--hidden {
          opacity: 0;
          transform: translateY(8px) scale(0.96);
          pointer-events: none;
        }

        @keyframes popIn {
          0% { transform: translateY(6px) scale(0.98); }
          60% { transform: translateY(-2px) scale(1.02); }
          100% { transform: translateY(0) scale(1); }
        }

        @media (max-width: 640px) {
          .ai-overlay {
            right: 0.75rem;
            bottom: 3.6rem;
            width: 320px;
            height: 450px;
          }
        }
      `}</style>
    </>
  )
}
