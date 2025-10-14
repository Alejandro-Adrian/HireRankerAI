"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Users, Utensils, Home, CreditCard, Coffee, Flower, Phone } from "lucide-react"
import type { RankingData } from "@/app/rankings/create/page"

interface JobPositionStepProps {
  data: RankingData
  onUpdate: (updates: Partial<RankingData>) => void
  onNext: () => void
}

const jobPositions = [
  {
    id: "kitchen-helper",
    title: "Kitchen Helper",
    description: "Assist with food preparation and kitchen maintenance",
    icon: Utensils,
  },
  {
    id: "server/waiter",
    title: "Server/Waiter",
    description: "Serve customers and manage dining experience",
    icon: Users,
  },
  {
    id: "housekeeping",
    title: "House Keeping",
    description: "Maintain cleanliness and organization of facilities",
    icon: Home,
  },
  {
    id: "cashier",
    title: "Cashier",
    description: "Handle transactions and provide customer service at checkout",
    icon: CreditCard,
  },
  {
    id: "barista",
    title: "Barista",
    description: "Prepare coffee drinks and provide excellent customer service",
    icon: Coffee,
  },
  {
    id: "gardener",
    title: "Gardener",
    description: "Maintain landscapes, plants, and outdoor spaces",
    icon: Flower,
  },
  {
    id: "receptionist",
    title: "Receptionist",
    description: "Greet visitors and manage front desk operations",
    icon: Phone,
  },
]

export function JobPositionStep({ data, onUpdate, onNext }: JobPositionStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handlePositionSelect = (positionId: string) => {
    const position = jobPositions.find((p) => p.id === positionId)
    if (position) {
      onUpdate({
        position: positionId,
        title: data.title || position.title,
      })
    }
  }

  const handleNext = () => {
    const newErrors: Record<string, string> = {}

    if (!data.position) {
      newErrors.position = "Please select a job position"
    }
    if (!data.title.trim()) {
      newErrors.title = "Job title is required"
    }
    if (!data.description.trim()) {
      newErrors.description = "Job description is required"
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      {/* Position Selection */}
      <div className="animate-fade-in-up">
        <Label className="text-base font-medium text-gray-700 dark:text-gray-200">Select Job Position</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mt-3">
          {jobPositions.map((position, index) => {
            const Icon = position.icon
            return (
              <Card
                key={position.id}
                className={`cursor-pointer transition-all duration-500 hover:shadow-xl transform hover:scale-105 backdrop-blur-sm animate-slide-in-up ${
                  data.position === position.id
                    ? "ring-2 ring-emerald-500/50 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border-emerald-200/50 dark:border-emerald-700/50 shadow-lg shadow-emerald-500/20"
                    : "hover:bg-white/80 dark:hover:bg-gray-700/80 bg-white/60 dark:bg-gray-800/60 border-white/20 dark:border-gray-600/50 hover:border-emerald-200/50 dark:hover:border-emerald-700/50"
                }`}
                onClick={() => handlePositionSelect(position.id)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-3 sm:p-4 text-center">
                  <div
                    className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      data.position === position.id
                        ? "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30"
                        : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600"
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        data.position === position.id ? "text-white" : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base mb-1">
                    {position.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{position.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
        {errors.position && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-2 animate-shake">{errors.position}</p>
        )}
      </div>

      {/* Job Details */}
      <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
        <div>
          <Label htmlFor="title" className="text-gray-700 dark:text-gray-200 font-medium">
            Job Title
          </Label>
          <Input
            id="title"
            value={data.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Enter job title"
            className={`mt-2 backdrop-blur-sm bg-white/50 dark:bg-gray-700/50 border-emerald-200/50 dark:border-emerald-800/50 dark:text-gray-100 transition-all duration-300 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 hover:border-emerald-400 hover:bg-white/70 dark:hover:bg-gray-700/70 rounded-lg shadow-sm ${
              errors.title ? "border-red-500 dark:border-red-400 ring-2 ring-red-500/20" : ""
            }`}
          />
          {errors.title && <p className="text-sm text-red-600 dark:text-red-400 mt-1 animate-shake">{errors.title}</p>}
        </div>

        <div>
          <Label htmlFor="description" className="text-gray-700 dark:text-gray-200 font-medium">
            Job Description
          </Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Describe the job responsibilities and requirements"
            rows={4}
            className={`mt-2 backdrop-blur-sm bg-white/50 dark:bg-gray-700/50 border-emerald-200/50 dark:border-emerald-800/50 dark:text-gray-100 transition-all duration-300 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 hover:border-emerald-400 hover:bg-white/70 dark:hover:bg-gray-700/70 rounded-lg shadow-sm resize-none ${
              errors.description ? "border-red-500 dark:border-red-400 ring-2 ring-red-500/20" : ""
            }`}
          />
          {errors.description && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1 animate-shake">{errors.description}</p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
        <Button
          onClick={handleNext}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/30 rounded-lg px-6 py-2.5 font-medium"
        >
          Next: Select Criteria
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
