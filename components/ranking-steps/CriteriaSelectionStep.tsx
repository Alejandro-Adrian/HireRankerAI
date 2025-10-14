"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  ArrowRight,
  User,
  Award,
  MapPin,
  Briefcase,
  GraduationCap,
  FileText,
  Star,
  Plus,
  CheckSquare,
  Square,
} from "lucide-react"
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
      {/* Criteria Selection */}
      <div className="animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Label className="text-base font-medium text-gray-700 dark:text-gray-200">Select Evaluation Criteria</Label>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Choose the criteria you want to use for evaluating applicants
            </p>
          </div>

          <Button
            variant="outline"
            onClick={handleSelectAll}
            className="flex items-center gap-2 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-emerald-200/50 dark:border-emerald-700/50 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-lg px-4 py-2"
          >
            {isAllSelected ? (
              <>
                <Square className="w-4 h-4" />
                Deselect All
              </>
            ) : (
              <>
                <CheckSquare className="w-4 h-4" />
                Select All
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {availableCriteria.map((criteria, index) => {
            const Icon = criteria.icon
            const isSelected = data.selectedCriteria.includes(criteria.id)

            return (
              <Card
                key={criteria.id}
                className={`cursor-pointer transition-all duration-500 hover:shadow-xl transform hover:scale-105 backdrop-blur-sm animate-slide-in-up ${
                  isSelected
                    ? "ring-2 ring-emerald-500/50 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border-emerald-200/50 dark:border-emerald-700/50 shadow-lg shadow-emerald-500/20"
                    : "hover:bg-white/80 dark:hover:bg-gray-800/80 bg-white/60 dark:bg-gray-800/60 border-white/20 dark:border-gray-700/50 hover:border-emerald-200/50 dark:hover:border-emerald-700/50"
                }`}
                onClick={() => handleCriteriaToggle(criteria.id)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => {}}
                        className={`transition-all duration-300 ${
                          isSelected ? "border-emerald-500 bg-emerald-500" : ""
                        }`}
                      />
                    </div>
                    <div
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        isSelected
                          ? "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30"
                          : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${isSelected ? "text-white" : "text-emerald-600 dark:text-emerald-400"}`}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">{criteria.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{criteria.description}</p>

                      {/* Special input for Area Living */}
                      {criteria.id === "area_living" && criteria.hasInput && isSelected && (
                        <div className="mt-3 animate-slide-in-down">
                          <Label
                            htmlFor="areaLivingCity"
                            className="text-sm text-gray-700 dark:text-gray-300 font-medium"
                          >
                            Preferred City
                          </Label>
                          <Input
                            id="areaLivingCity"
                            value={data.areaLivingCity || ""}
                            onChange={(e) => onUpdate({ areaLivingCity: e.target.value })}
                            placeholder="Enter preferred city"
                            className="mt-1 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border-emerald-200/50 dark:border-emerald-600/50 text-gray-900 dark:text-gray-100 transition-all duration-300 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 hover:border-emerald-400 rounded-lg shadow-sm"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      )}

                      {criteria.id === "other" && criteria.hasInput && isSelected && (
                        <div className="mt-3 animate-slide-in-down">
                          <Label
                            htmlFor="otherKeyword"
                            className="text-sm text-gray-700 dark:text-gray-300 font-medium"
                          >
                            Keyword to Match
                          </Label>
                          <Input
                            id="otherKeyword"
                            value={data.otherKeyword || ""}
                            onChange={(e) => onUpdate({ otherKeyword: e.target.value })}
                            placeholder="Enter keyword to search in resumes"
                            className="mt-1 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border-emerald-200/50 dark:border-emerald-600/50 text-gray-900 dark:text-gray-100 transition-all duration-300 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 hover:border-emerald-400 rounded-lg shadow-sm"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            If this keyword is found in an applicant's resume, they will receive 50 bonus points
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
          <p className="text-sm text-red-600 dark:text-red-400 mt-2 animate-shake">{errors.criteria}</p>
        )}
        {errors.areaLivingCity && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-2 animate-shake">{errors.areaLivingCity}</p>
        )}
        {errors.otherKeyword && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-2 animate-shake">{errors.otherKeyword}</p>
        )}
      </div>

      {/* Selected Criteria Summary */}
      {data.selectedCriteria.length > 0 && (
        <div className="backdrop-blur-sm bg-emerald-50/80 dark:bg-emerald-900/30 p-4 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50 animate-fade-in-up shadow-lg">
          <h4 className="font-medium text-emerald-900 dark:text-emerald-100 mb-2">
            Selected Criteria ({data.selectedCriteria.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.selectedCriteria.map((criteriaId, index) => {
              const criteria = availableCriteria.find((c) => c.id === criteriaId)
              return (
                <span
                  key={criteriaId}
                  className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded-full text-sm border border-emerald-200/50 dark:border-emerald-700/50 backdrop-blur-sm shadow-sm animate-fade-in hover:scale-105 transition-transform duration-200"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {criteria?.title}
                  {criteriaId === "other" && data.otherKeyword && (
                    <span className="ml-1 text-xs opacity-75">({data.otherKeyword})</span>
                  )}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
        <Button
          variant="outline"
          onClick={onPrev}
          className="flex items-center gap-2 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-emerald-200/50 dark:border-emerald-700/50 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-lg px-6 py-2.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/30 rounded-lg px-6 py-2.5 font-medium"
        >
          Next: Set Weights
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
