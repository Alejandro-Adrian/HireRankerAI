"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, User, Award, MapPin, Briefcase, GraduationCap, FileText, Star, Plus, CheckSquare, Square } from 'lucide-react'
import type { RankingData } from "@/app/rankings/create/page"

interface CriteriaSelectionStepProps {
  data: RankingData
  onUpdate: (updates: Partial<RankingData>) => void
  onNext: () => void
  onPrev: () => void
}

const availableCriteria = [
  {
    id: "personality",
    title: "Personality",
    description: "Communication skills, attitude, and cultural fit",
    icon: User,
  },
  {
    id: "skill",
    title: "Skill",
    description: "Technical abilities and job-specific competencies",
    icon: Star,
  },
  {
    id: "area_living",
    title: "Area Living",
    description: "Geographic location and proximity to workplace",
    icon: MapPin,
    hasInput: true,
  },
  {
    id: "experience",
    title: "Experience",
    description: "Previous work experience in relevant roles",
    icon: Briefcase,
  },
  {
    id: "training",
    title: "Training",
    description: "Professional training and workshops completed",
    icon: Award,
  },
  {
    id: "certification",
    title: "Certification",
    description: "Industry certifications and licenses",
    icon: FileText,
  },
  {
    id: "education",
    title: "Education",
    description: "Educational background and qualifications",
    icon: GraduationCap,
  },
  {
    id: "other",
    title: "Other",
    description: "Custom criteria with keyword matching (adds 50 points if keyword found in resume)",
    icon: Plus,
    hasInput: true,
  },
]

export function CriteriaSelectionStep({ data, onUpdate, onNext, onPrev }: CriteriaSelectionStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleCriteriaToggle = (criteriaId: string) => {
    const isSelected = data.selectedCriteria.includes(criteriaId)
    const newSelectedCriteria = isSelected
      ? data.selectedCriteria.filter((id) => id !== criteriaId)
      : [...data.selectedCriteria, criteriaId]

    onUpdate({ selectedCriteria: newSelectedCriteria })
  }

  const handleSelectAll = () => {
    const allCriteriaIds = availableCriteria.map((c) => c.id)
    const isAllSelected = allCriteriaIds.every((id) => data.selectedCriteria.includes(id))

    if (isAllSelected) {
      // Deselect all
      onUpdate({ selectedCriteria: [] })
    } else {
      // Select all
      onUpdate({ selectedCriteria: allCriteriaIds })
    }
  }

  const handleNext = () => {
    const newErrors: Record<string, string> = {}

    if (data.selectedCriteria.length === 0) {
      newErrors.criteria = "Please select at least one evaluation criteria"
    }

    if (data.selectedCriteria.includes("area_living") && !data.areaLivingCity?.trim()) {
      newErrors.areaLivingCity = "Please specify the preferred city for area living criteria"
    }

    if (data.selectedCriteria.includes("other") && !data.otherKeyword?.trim()) {
      newErrors.otherKeyword = "Please specify the keyword for the other criteria"
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      const initialWeights: Record<string, number> = {}
      data.selectedCriteria.forEach((criteriaId) => {
        // Ensure we don't have undefined weights that could cause React errors
        initialWeights[criteriaId] = data.criteriaWeights[criteriaId] || 50
      })

      // Clear any weights for unselected criteria to prevent stale data
      const cleanedWeights = { ...data.criteriaWeights }
      Object.keys(cleanedWeights).forEach((key) => {
        if (!data.selectedCriteria.includes(key)) {
          delete cleanedWeights[key]
        }
      })

      onUpdate({ criteriaWeights: { ...cleanedWeights, ...initialWeights } })
      onNext()
    }
  }

  const allCriteriaIds = availableCriteria.map((c) => c.id)
  const isAllSelected = allCriteriaIds.every((id) => data.selectedCriteria.includes(id))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="min-w-0">
            <Label className="text-base font-medium text-foreground block">Select Evaluation Criteria</Label>
            <p className="text-sm text-muted-foreground mt-1">Choose criteria for evaluating applicants</p>
          </div>

          <Button
            variant="outline"
            onClick={handleSelectAll}
            className="flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 w-full sm:w-auto bg-card hover:bg-muted"
          >
            {isAllSelected ? (
              <>
                <Square className="w-4 h-4 flex-shrink-0" />
                Deselect All
              </>
            ) : (
              <>
                <CheckSquare className="w-4 h-4 flex-shrink-0" />
                Select All
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-4">
          {availableCriteria.map((criteria, index) => {
            const Icon = criteria.icon
            const isSelected = data.selectedCriteria.includes(criteria.id)

            return (
              <Card
                key={criteria.id}
                className={`cursor-pointer transition-all duration-500 hover:shadow-lg transform hover:scale-[1.02] animate-slide-in-up overflow-hidden ${
                  isSelected
                    ? "ring-2 ring-primary/50 bg-primary/5 dark:bg-primary/10 border-primary/50 shadow-lg shadow-primary/20"
                    : "hover:bg-muted/50 bg-card/80 border-border hover:border-primary/30 hover:shadow-md"
                }`}
                onClick={() => handleCriteriaToggle(criteria.id)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => {}}
                        className="transition-all duration-300"
                      />
                    </div>
                    <div
                      className={`p-2 rounded-lg transition-all duration-300 flex-shrink-0 ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{criteria.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{criteria.description}</p>

                      {/* Special inputs */}
                      {criteria.id === "area_living" && criteria.hasInput && isSelected && (
                        <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                          <Label
                            htmlFor="areaLivingCity"
                            className="text-xs font-medium text-foreground"
                          >
                            Preferred City
                          </Label>
                          <Input
                            id="areaLivingCity"
                            value={data.areaLivingCity || ""}
                            onChange={(e) => onUpdate({ areaLivingCity: e.target.value })}
                            placeholder="Enter preferred city"
                            className="mt-1 text-sm transition-all duration-300"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      )}

                      {criteria.id === "other" && criteria.hasInput && isSelected && (
                        <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                          <Label
                            htmlFor="otherKeyword"
                            className="text-xs font-medium text-foreground"
                          >
                            Keyword to Match
                          </Label>
                          <Input
                            id="otherKeyword"
                            value={data.otherKeyword || ""}
                            onChange={(e) => onUpdate({ otherKeyword: e.target.value })}
                            placeholder="Enter keyword to search in resumes"
                            className="mt-1 text-sm transition-all duration-300"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Applicants with this keyword get 50 bonus points
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {errors.criteria && (
          <p className="text-sm text-destructive mt-3 animate-shake">{errors.criteria}</p>
        )}
      </div>

      {/* Selected Summary */}
      {data.selectedCriteria.length > 0 && (
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 dark:bg-primary/10 animate-in fade-in">
          <h4 className="font-medium text-foreground mb-2">
            Selected Criteria ({data.selectedCriteria.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.selectedCriteria.map((criteriaId, index) => {
              const criteria = availableCriteria.find((c) => c.id === criteriaId)
              return (
                <span
                  key={criteriaId}
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs sm:text-sm border border-primary/20 hover:scale-105 transition-transform"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {criteria?.title}
                  {criteriaId === "other" && data.otherKeyword && (
                    <span className="ml-1 opacity-75">({data.otherKeyword})</span>
                  )}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-col-reverse sm:flex-row justify-between gap-2 sm:gap-4 pt-4 animate-fade-in-up">
        <Button
          variant="outline"
          onClick={onPrev}
          className="flex items-center justify-center gap-2 w-full sm:w-auto transition-all duration-300 hover:scale-105 bg-card hover:bg-muted"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:shadow-lg rounded-lg px-6 py-2.5 font-medium"
        >
          Next: Set Weights
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
