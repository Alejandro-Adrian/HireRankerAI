"use client"

import React from "react"
import dynamic from "next/dynamic"

const AIChatbot = dynamic(() => import("@/components/AIChatbot"), { ssr: false })

export default function AIOverlay(): JSX.Element {
  return (
    <div className="w-full h-full">
      <AIChatbot />
    </div>
  )
}
