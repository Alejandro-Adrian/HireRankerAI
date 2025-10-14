"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Check, ArrowLeft, Save, RotateCcw } from "lucide-react"
import { JobPositionStep } from "@/components/ranking-steps/JobPositionStep"
import { CriteriaSelectionStep } from "@/components/ranking-steps/CriteriaSelectionStep"
import { CriteriaWeightingStep } from "@/components/ranking-steps/CriteriaWeightingStep"
import { ReviewStep } from "@/components/ranking-steps/ReviewStep"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
  { id: 1, title: "Job Position", description: "Select the job position and add details" },
  { id: 2, title: "Criteria Selection", description: "Choose evaluation criteria" },
  { id: 3, title: "Criteria Weighting", description: "Set importance weights" },
  { id: 4, title: "Review & Generate", description: "Review and create application link" },
]

const STORAGE_KEY = "ranking-creation-progress"

export default function CreateRankingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  const [rankingData, setRankingData] = useState<RankingData>({
    title: "",
    position: "",
    description: "",
    selectedCriteria: [],
    criteriaWeights: {},
    areaLivingCity: "",
    otherKeyword: "",
  })
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false)
  const [showProgressAlert, setShowProgressAlert] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated by trying to fetch user profile
        const response = await fetch("/api/auth/profile", {
          method: "GET",
          credentials: "include",
        })

        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
          setIsLoading(false)
        } else {
          console.log("No authenticated user found, redirecting to login")
          router.push("/")
          return
        }
      } catch (error) {
        console.error("Auth check error:", error)
        setAuthError("Failed to verify authentication")
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    const saveProgress = () => {
      try {
        const progressData = {
          data: rankingData,
          step: currentStep,
          timestamp: Date.now(),
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData))
      } catch (error) {
        console.error("Failed to save progress:", error)
      }
    }

    if (rankingData.title || rankingData.position || rankingData.selectedCriteria.length > 0) {
      const timeoutId = setTimeout(saveProgress, 1000)
      return () => clearTimeout(timeoutId)
    }
  }, [rankingData, currentStep])

  useEffect(() => {
    const loadSavedProgress = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const { data, step, timestamp } = JSON.parse(saved)

          const isRecent = Date.now() - timestamp < 24 * 60 * 60 * 1000

          if (isRecent && (data.title || data.position || data.selectedCriteria.length > 0)) {
            setRankingData(data)
            setCurrentStep(step)
            setHasRestoredProgress(true)
            setShowProgressAlert(true)

            setTimeout(() => setShowProgressAlert(false), 5000)
          } else {
            localStorage.removeItem(STORAGE_KEY)
          }
        }
      } catch (error) {
        console.error("Failed to load saved progress:", error)
        localStorage.removeItem(STORAGE_KEY)
      }
    }

    if (!user) return

    loadSavedProgress()
  }, [user])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (rankingData.title || rankingData.position || rankingData.selectedCriteria.length > 0) {
        e.preventDefault()
        e.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [rankingData])

  const clearProgress = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error("Failed to clear progress:", error)
    }
  }

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

  const handleRankingCreated = () => {
    clearProgress()
  }

  const resetProgress = () => {
    setRankingData({
      title: "",
      position: "",
      description: "",
      selectedCriteria: [],
      criteriaWeights: {},
      areaLivingCity: "",
      otherKeyword: "",
    })
    setCurrentStep(1)
    clearProgress()
    setShowProgressAlert(false)
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
        return <ReviewStep data={rankingData} onPrev={prevStep} onRankingCreated={handleRankingCreated} />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50 dark:from-slate-900 dark:via-emerald-950/30 dark:to-teal-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50 dark:from-slate-900 dark:via-emerald-950/30 dark:to-teal-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 dark:text-red-400 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Authentication Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{authError}</p>
          <Button onClick={() => router.push("/")} className="bg-emerald-600 hover:bg-emerald-700">
            Return to Home
          </Button>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50 dark:from-slate-900 dark:via-emerald-950/30 dark:to-teal-950 py-4 sm:py-8 transition-all duration-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => {
                if (rankingData.title || rankingData.position || rankingData.selectedCriteria.length > 0) {
                  if (confirm("You have unsaved progress. Are you sure you want to leave?")) {
                    clearProgress()
                    router.push("/")
                  }
                } else {
                  router.push("/")
                }
              }}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 hover:scale-105 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/50 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/30 rounded-lg px-4 py-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>

            {hasRestoredProgress && (
              <Button
                variant="outline"
                onClick={resetProgress}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 hover:scale-105 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/50 hover:bg-red-50/80 dark:hover:bg-red-900/30 rounded-lg px-4 py-2"
              >
                <RotateCcw className="w-4 h-4" />
                Start Fresh
              </Button>
            )}
          </div>

          {showProgressAlert && (
            <Alert className="mb-4 border-emerald-200/50 dark:border-emerald-800/50 backdrop-blur-sm bg-emerald-50/80 dark:bg-emerald-950/50 animate-slide-in-up">
              <Save className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <AlertDescription className="text-emerald-800 dark:text-emerald-200">
                Your previous progress has been restored. You can continue where you left off or start fresh.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="mb-6 sm:mb-8 backdrop-blur-md bg-white/70 dark:bg-gray-800/70 rounded-xl border border-white/20 dark:border-gray-700/50 p-6 animate-fade-in-up shadow-lg hover:shadow-xl transition-all duration-500">
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
                  <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{step.description}</p>
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
