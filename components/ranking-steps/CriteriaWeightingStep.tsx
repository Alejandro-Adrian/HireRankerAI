"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
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
} from "lucide-react"
import type { RankingData } from "@/app/rankings/create/page"

interface CriteriaWeightingStepProps {
  data: RankingData
  onUpdate: (updates: Partial<RankingData>) => void
  onNext: () => void
  onPrev: () => void
}

const criteriaIcons: Record<string, any> = {
  personality: User,
  skill: Star,
  area_living: MapPin,
  experience: Briefcase,
  training: Award,
  certification: FileText,
  education: GraduationCap,
  other: Plus,
}

const criteriaLabels: Record<string, string> = {
  personality: "Personality",
  skill: "Skill",
  area_living: "Area Living",
  experience: "Experience",
  training: "Training",
  certification: "Certification",
  education: "Education",
  other: "Other",
}

export function CriteriaWeightingStep({ data, onUpdate, onNext, onPrev }: CriteriaWeightingStepProps) {
  const handleWeightChange = (criteriaId: string, value: number[]) => {
    const newWeights = {
      ...data.criteriaWeights,
      [criteriaId]: value[0],
    }
    onUpdate({ criteriaWeights: newWeights })
  }

  const getImportanceLabel = (weight: number) => {
    if (weight <= 20) return "Very Low"
    if (weight <= 40) return "Low"
    if (weight <= 60) return "Medium"
    if (weight <= 80) return "High"
    return "Very High"
  }

  const getImportanceColor = (weight: number) => {
    if (weight <= 20) return "text-gray-500"
    if (weight <= 40) return "text-amber-600"
    if (weight <= 60) return "text-emerald-600"
    if (weight <= 80) return "text-orange-600"
    return "text-red-600"
  }

  const totalWeight = Object.values(data.criteriaWeights).reduce((sum, weight) => sum + weight, 0)
  const averageWeight = totalWeight / data.selectedCriteria.length

  const handleRoundOff = () => {
    if (totalWeight === 100) return // Already at 100%

    const currentWeights = { ...data.criteriaWeights }
    const criteriaIds = data.selectedCriteria
    const difference = 100 - totalWeight

    // Distribute the difference proportionally
    const totalCurrentWeight = Object.values(currentWeights).reduce((sum, weight) => sum + weight, 0)
    const newWeights: Record<string, number> = {}

    let remainingDifference = difference

    criteriaIds.forEach((criteriaId, index) => {
      const currentWeight = currentWeights[criteriaId] || 0
      const proportion = totalCurrentWeight > 0 ? currentWeight / totalCurrentWeight : 1 / criteriaIds.length

      if (index === criteriaIds.length - 1) {
        // Last item gets the remaining difference to ensure exact 100%
        newWeights[criteriaId] = Math.max(0, Math.min(100, currentWeight + remainingDifference))
      } else {
        const adjustment = Math.round(difference * proportion)
        newWeights[criteriaId] = Math.max(0, Math.min(100, currentWeight + adjustment))
        remainingDifference -= adjustment
      }
    })

    onUpdate({ criteriaWeights: newWeights })
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="backdrop-blur-sm bg-emerald-50/80 dark:bg-emerald-900/30 p-4 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50 animate-fade-in-up shadow-lg">
        <h4 className="font-medium text-emerald-900 dark:text-emerald-100 mb-2">Set Criteria Importance</h4>
        <p className="text-sm text-emerald-800 dark:text-emerald-200">
          Drag the sliders to adjust how important each criteria is for evaluating applicants. Higher values mean the
          criteria will have more impact on the final ranking.
        </p>
      </div>

      {/* Weight Controls */}
      <div className="space-y-6">
        {data.selectedCriteria.map((criteriaId, index) => {
          const Icon = criteriaIcons[criteriaId]
          const weight = data.criteriaWeights[criteriaId] || 50

          return (
            <Card
              key={criteriaId}
              className="backdrop-blur-md bg-white/70 dark:bg-gray-800/70 border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-[1.02] animate-slide-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 rounded-xl shadow-lg backdrop-blur-sm">
                    <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{criteriaLabels[criteriaId]}</h3>
                    {criteriaId === "area_living" && data.areaLivingCity && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">Preferred city: {data.areaLivingCity}</p>
                    )}
                    {criteriaId === "other" && data.otherKeyword && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">Keyword: {data.otherKeyword}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                      {weight}%
                    </div>
                    <div className={`text-sm font-medium ${getImportanceColor(weight)} dark:brightness-125`}>
                      {getImportanceLabel(weight)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>Less Important</span>
                    <span>More Important</span>
                  </div>
                  <Slider
                    value={[weight]}
                    onValueChange={(value) => handleWeightChange(criteriaId, value)}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full [&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-emerald-500 [&_[role=slider]]:to-teal-500 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-emerald-500/30 [&_.bg-primary]:bg-gradient-to-r [&_.bg-primary]:from-emerald-500 [&_.bg-primary]:to-teal-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Weight Summary */}
      <Card className="backdrop-blur-sm bg-gray-50/80 dark:bg-gray-800/80 border-white/20 dark:border-gray-700/50 shadow-lg animate-fade-in-up">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Weight Summary</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Total: {totalWeight}% | Average: {averageWeight.toFixed(1)}%
              </p>
              {totalWeight !== 100 && (
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  {totalWeight < 100 ? `${100 - totalWeight}% remaining` : `${totalWeight - 100}% over limit`}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {totalWeight !== 100 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRoundOff}
                  className="text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-700/50 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 bg-transparent"
                >
                  Round Off to 100%
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const equalWeight = Math.round(100 / data.selectedCriteria.length)
                  const newWeights: Record<string, number> = {}
                  data.selectedCriteria.forEach((criteriaId) => {
                    newWeights[criteriaId] = equalWeight
                  })
                  onUpdate({ criteriaWeights: newWeights })
                }}
                className="border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50/80 dark:hover:bg-gray-800/80 backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                Reset to Equal Weights
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between animate-fade-in-up">
        <Button
          variant="outline"
          onClick={onPrev}
          className="flex items-center gap-2 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-emerald-200/50 dark:border-emerald-700/50 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-lg px-6 py-2.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
        <Button
          onClick={onNext}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/30 rounded-lg px-6 py-2.5 font-medium"
        >
          Next: Review & Generate
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
