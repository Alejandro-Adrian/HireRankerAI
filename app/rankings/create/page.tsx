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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-border border-t-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-destructive mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Authentication Error</h2>
          <p className="text-muted-foreground mb-4">{authError}</p>
          <Button onClick={() => router.push("/")} className="bg-primary hover:bg-primary/90">
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
    <div className="min-h-screen bg-background py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6">
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
              className="flex items-center gap-2 text-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>

            {hasRestoredProgress && (
              <Button
                variant="outline"
                onClick={resetProgress}
                className="flex items-center gap-2 text-foreground hover:bg-muted transition-colors bg-transparent"
              >
                <RotateCcw className="w-4 h-4" />
                Start Fresh
              </Button>
            )}
          </div>

          {showProgressAlert && (
            <Alert className="mb-4 border-primary/50 bg-primary/10">
              <Save className="h-4 w-4 text-primary" />
              <AlertDescription className="text-foreground">
                Your previous progress has been restored. You can continue where you left off or start fresh.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Progress Steps */}
        <div className="mb-6 sm:mb-8 bg-card border border-border rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    currentStep > step.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : currentStep === step.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <div className="ml-3 flex-1 sm:flex-none">
                  <p
                    className={`text-sm font-medium transition-colors ${
                      currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground hidden sm:block">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`hidden sm:flex flex-1 h-0.5 mx-4 transition-colors ${
                      currentStep > step.id ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-card border border-border rounded-lg">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">
              Step {currentStep}: {steps[currentStep - 1].title}
            </h2>
          </div>
          <div className="p-6">{renderStep()}</div>
        </div>
      </div>
    </div>
  )
}
