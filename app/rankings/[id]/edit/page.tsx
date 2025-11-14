"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Check, ArrowLeft, Save, Loader2, AlertTriangle } from 'lucide-react'
import { JobPositionStep } from "@/components/ranking-steps/JobPositionStep"
import { CriteriaSelectionStep } from "@/components/ranking-steps/CriteriaSelectionStep"
import { CriteriaWeightingStep } from "@/components/ranking-steps/CriteriaWeightingStep"
import { EditReviewStep } from "@/components/ranking-steps/EditReviewStep"
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"

export interface RankingData {
  title: string
  position: string
  description: string
  selectedCriteria: string[]
  criteriaWeights: Record<string, number>
  areaLivingCity?: string
  otherKeyword?: string
}

const steps = [
  { id: 1, title: "Job Position", description: "Edit the job position and details" },
  { id: 2, title: "Criteria Selection", description: "Modify evaluation criteria" },
  { id: 3, title: "Criteria Weighting", description: "Adjust importance weights" },
  { id: 4, title: "Review & Save", description: "Review and save changes" },
]

export default function EditRankingPage({ params }: { params: { id: string } }) {
  const [currentStep, setCurrentStep] = useState(1)
  const router = useRouter()
  const [rankingData, setRankingData] = useState<RankingData>({
    title: "",
    position: "",
    description: "",
    selectedCriteria: [],
    criteriaWeights: {},
    areaLivingCity: "",
    otherKeyword: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [originalData, setOriginalData] = useState<RankingData | null>(null)

  // Load ranking data on mount
  useEffect(() => {
    const loadRanking = async () => {
      try {
        setIsLoading(true)
        setError("")

        const supabase = createClient()

        const { data: ranking, error: fetchError } = await supabase
          .from("rankings")
          .select("*")
          .eq("id", params.id)
          .single()

        if (fetchError) {
          throw new Error(fetchError.message)
        }

        if (!ranking) {
          throw new Error("Ranking not found")
        }

        const transformedData: RankingData = {
          title: ranking.title || "",
          position: ranking.position || "",
          description: ranking.description || "",
          selectedCriteria: ranking.criteria || [], // Map from criteria field
          criteriaWeights: ranking.criteria_weights || {}, // Map from criteria_weights field
          areaLivingCity: ranking.area_city || "", // Map from area_city field
          otherKeyword: ranking.other_keyword || "", // Map from other_keyword field
        }

        console.log("[v0] Loaded ranking data:", transformedData)
        setRankingData(transformedData)
        setOriginalData(transformedData)
      } catch (err) {
        console.error("Error loading ranking:", err)
        setError(err instanceof Error ? err.message : "Failed to load ranking")
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      loadRanking()
    }
  }, [params.id])

  const updateRankingData = (updates: Partial<RankingData>) => {
    setRankingData((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const hasChanges = () => {
    if (!originalData) return false
    return JSON.stringify(rankingData) !== JSON.stringify(originalData)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <JobPositionStep data={rankingData} onUpdate={updateRankingData} onNext={nextStep} />
      case 2:
        return (
          <CriteriaSelectionStep data={rankingData} onUpdate={updateRankingData} onNext={nextStep} onPrev={prevStep} />
        )
      case 3:
        return (
          <CriteriaWeightingStep data={rankingData} onUpdate={updateRankingData} onNext={nextStep} onPrev={prevStep} />
        )
      case 4:
        return <EditReviewStep data={rankingData} onPrev={prevStep} rankingId={params.id} />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50 dark:from-slate-900 dark:via-emerald-950/30 dark:to-teal-950 py-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto" />
          <p className="text-black dark:text-gray-300">Loading ranking data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50 dark:from-slate-900 dark:via-emerald-950/30 dark:to-teal-950 py-8 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <Alert className="border-red-200/50 dark:border-red-800/50 backdrop-blur-sm bg-red-50/80 dark:bg-red-950/50">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-black dark:text-red-200">{error}</AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-emerald-200/50 dark:border-emerald-700/50 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50 dark:from-slate-900 dark:via-emerald-950/30 dark:to-teal-950 py-4 sm:py-8 transition-all duration-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => {
                if (hasChanges()) {
                  if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
                    router.push("/")
                  }
                } else {
                  router.push("/")
                }
              }}
              className="flex items-center gap-2 text-black dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 hover:scale-105 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/50 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/30 rounded-lg px-4 py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>

            {hasChanges() && (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm backdrop-blur-sm bg-amber-50/80 dark:bg-amber-950/50 border border-amber-200/50 dark:border-amber-800/50 rounded-lg px-3 py-1.5">
                <Save className="w-4 h-4" />
                Unsaved changes
              </div>
            )}
          </div>
        </div>

        <div className="mb-6 sm:mb-8 backdrop-blur-md bg-white/70 dark:bg-gray-800/70 rounded-xl border border-white/20 dark:border-gray-700/50 p-6 animate-fade-in-up shadow-lg hover:shadow-xl transition-all duration-500">
          <div className="mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              Edit Ranking: {rankingData.title}
            </h1>
            <p className="text-black dark:text-gray-300 text-sm mt-1">
              Make changes to your job ranking criteria and settings
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="flex items-center animate-slide-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-500 transform hover:scale-110 ${
                    currentStep > step.id
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                      : currentStep === step.id
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/40 animate-pulse"
                        : "bg-white/80 dark:bg-gray-800/80 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 backdrop-blur-sm"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5 animate-bounce-gentle" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <div className="ml-3 flex-1 sm:flex-none">
                  <p
                    className={`text-sm font-medium transition-all duration-300 ${
                      currentStep >= step.id
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-black dark:text-gray-400 hidden sm:block">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`hidden sm:flex flex-1 h-0.5 mx-4 rounded-full transition-all duration-500 ${
                      currentStep > step.id
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/70 dark:bg-gray-800/70 rounded-xl border border-white/20 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-700 animate-fade-in-up">
          <div className="p-6 border-b border-white/20 dark:border-gray-700/50">
            <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              Step {currentStep}: {steps[currentStep - 1].title}
            </h2>
          </div>
          <div className="p-6">{renderStep()}</div>
        </div>
      </div>
    </div>
  )
}
