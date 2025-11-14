"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, User, Award, MapPin, Briefcase, GraduationCap, FileText, Star, Plus } from 'lucide-react'
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
      <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 dark:bg-primary/10 animate-in fade-in">
        <h4 className="font-medium text-foreground mb-2">Set Criteria Importance</h4>
        <p className="text-sm text-muted-foreground">
          Adjust the importance of each criteria. Higher values have more impact on ranking.
        </p>
      </div>

      {/* Weight Controls */}
      <div className="space-y-4 sm:space-y-5">
        {data.selectedCriteria.map((criteriaId, index) => {
          const Icon = criteriaIcons[criteriaId]
          const weight = data.criteriaWeights[criteriaId] || 50

          return (
            <Card
              key={criteriaId}
              className="border border-border bg-card/80 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01] animate-in fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                  <div className="p-2.5 bg-primary/10 rounded-lg flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground">{criteriaLabels[criteriaId]}</h3>
                    {criteriaId === "area_living" && data.areaLivingCity && (
                      <p className="text-xs text-muted-foreground mt-0.5">Preferred city: {data.areaLivingCity}</p>
                    )}
                    {criteriaId === "other" && data.otherKeyword && (
                      <p className="text-xs text-muted-foreground mt-0.5">Keyword: {data.otherKeyword}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xl sm:text-2xl font-bold text-primary">
                      {weight}%
                    </div>
                    <div className="text-xs font-medium text-muted-foreground">
                      {getImportanceLabel(weight)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Less Important</span>
                    <span>More Important</span>
                  </div>
                  <Slider
                    value={[weight]}
                    onValueChange={(value) => handleWeightChange(criteriaId, value)}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
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
      <Card className="border border-border bg-muted/50">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h4 className="font-semibold text-foreground">Weight Summary</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Total: {totalWeight}% | Average: {averageWeight.toFixed(1)}%
              </p>
              {totalWeight !== 100 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  {totalWeight < 100 ? `${100 - totalWeight}% remaining` : `${totalWeight - 100}% over limit`}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              {totalWeight !== 100 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRoundOff}
                  className="w-full sm:w-auto bg-card hover:bg-muted"
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
                className="w-full sm:w-auto bg-card hover:bg-muted"
              >
                Reset to Equal Weights
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
          onClick={onNext}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:shadow-lg rounded-lg px-6 py-2.5 font-medium"
        >
          Next: Review & Generate
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
