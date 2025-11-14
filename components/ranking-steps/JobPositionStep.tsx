"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Users, Utensils, Home, CreditCard, Coffee, Flower, Phone } from 'lucide-react'
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
        <Label className="text-base font-medium text-foreground">Select Job Position</Label>
        <p className="text-sm text-muted-foreground mt-1 mb-4">Choose the position you want to rank candidates for</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mt-4">
          {jobPositions.map((position, index) => {
            const Icon = position.icon
            return (
              <Card
                key={position.id}
                className={`cursor-pointer transition-all duration-500 hover:shadow-lg transform hover:scale-105 backdrop-blur-sm animate-slide-in-up overflow-hidden ${
                  data.position === position.id
                    ? "ring-2 ring-primary/50 bg-primary/5 dark:bg-primary/10 border-primary/50 shadow-lg shadow-primary/20"
                    : "hover:bg-muted/50 bg-card/80 border-border hover:border-primary/30 hover:shadow-md"
                }`}
                onClick={() => handlePositionSelect(position.id)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent className="p-3 sm:p-4 text-center">
                  <div
                    className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                      data.position === position.id
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-1 mb-1">
                    {position.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{position.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
        {errors.position && (
          <p className="text-sm text-destructive mt-3 animate-shake">{errors.position}</p>
        )}
      </div>

      {/* Job Details */}
      <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
        <div>
          <Label htmlFor="title" className="text-foreground font-medium text-sm">
            Job Title
          </Label>
          <Input
            id="title"
            value={data.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Enter job title"
            className={`mt-2 transition-all duration-300 focus:ring-2 focus:ring-primary/50 focus:border-primary ${
              errors.title ? "border-destructive ring-2 ring-destructive/20" : ""
            }`}
          />
          {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
        </div>

        <div>
          <Label htmlFor="description" className="text-foreground font-medium text-sm">
            Job Description
          </Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Describe the job responsibilities and requirements"
            rows={4}
            className={`mt-2 transition-all duration-300 focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none ${
              errors.description ? "border-destructive ring-2 ring-destructive/20" : ""
            }`}
          />
          {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col-reverse sm:flex-row justify-between gap-2 sm:gap-4 pt-4 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
        <div></div>
        <Button
          onClick={handleNext}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:shadow-lg rounded-lg px-6 py-2.5 font-medium"
        >
          Next: Select Criteria
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
