"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { usePathname } from "next/navigation";
import AIImage from "@/public/dices.png";

const AIChatbot = dynamic(() => import('@/components/AIChatbot'), { ssr: false });

export default function AIOverlay(): JSX.Element {
  const pathname = usePathname();

  // Hide the overlay on the landing page and any video conference routes
  const isExcludedRoute = !!pathname && (pathname === "/" || pathname.startsWith("/video-call"));
  if (isExcludedRoute) return <></>;

  const [isVisible, setVisible] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVisible(false);
    };
    if (mounted) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mounted]);

  const toggle = () => {
    if (!mounted) {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  };

  const onPanelTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (!isVisible && e.propertyName === 'opacity') setMounted(false);
  };

  return (
    <div className={"z-10000"}>
      <button
        onClick={toggle}
        aria-expanded={isVisible}
        style={{ zIndex: 100000 }}
        className={`
          fixed flex items-center justify-center rounded-full shadow-lg
          bottom-5 left-3 w-14 h-10 md:w-16 md:h-12
          bg-gradient-to-r from-red-500 via-purple-600 to-blue-500
          animate-gradient hover:animate-none hover:shadow-[0_0_15px_rgba(255,0,255,0.7)]
          transform hover:scale-110 transition-transform active:scale-95
          ${isVisible ? 'animate-none' : ''}
        `}
      >
        <Image src={AIImage} alt="Dice Icon" width={30} height={30} />
      </button>

      {mounted && (
        <>
          <div
            className={`overlay-backdrop ${isVisible ? 'overlay-backdrop--visible' : 'overlay-backdrop--hidden'}`}
            onClick={() => setVisible(false)}
          />
          <div
            className={`ai-overlay ${isVisible ? 'ai-overlay--visible' : 'ai-overlay--hidden'}`}
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
          z-index: 99990;
        }

        .overlay-backdrop--visible {
          background: rgba(0,0,0,0.45);
          pointer-events: auto;
        }

        .ai-overlay {
          position: fixed;
          right: 0.4rem;
          bottom: 0.4rem;
          z-index: 100000;
          transform-origin: bottom right;
          transition: opacity 200ms cubic-bezier(0.22, 1, 0.36, 1),
                      transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
          opacity: 0;
          transform: translateY(6px) scale(0.98);
          pointer-events: none;
          display: flex;
          align-items: flex-end;
          padding: 0;
        }

        .ai-overlay__inner {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          max-height: 66vh;
          overflow: hidden;
          border-radius: 12px;
          background: transparent;
          box-shadow: 0 8px 30px rgba(0,0,0,0.18);
        }

        .ai-overlay__inner > * {
          margin: 0 !important;
          padding-bottom: 0 !important;
          box-sizing: border-box;
        }

        .ai-overlay__inner * {
          margin-bottom: 0 !important;
          margin-top: 0 !important;
          padding-bottom: 0 !important;
          padding-top: 0 !important;
        }

        .ai-overlay--visible {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
          filter: drop-shadow(0 8px 30px rgba(0,0,0,0.22));
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
          .ai-overlay { right: 0.75rem; bottom: 3.6rem; }
          .ai-overlay__inner { max-height: 60vh; border-radius: 10px; }
        }
      `}</style>
    </div>
  );
}
