"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navigation() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              HR Dashboard
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/flowchart">
              <Button variant="outline" size="sm">
                📊 System Flow
              </Button>
            </Link>
            <Link href="/flowchart2">
              <Button variant="outline" size="sm">
                📁 File Architecture
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
