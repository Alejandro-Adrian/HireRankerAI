"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Copy, ExternalLink, CheckCircle, Loader2, AlertTriangle, Eye, EyeOff } from "lucide-react"
import type { RankingData } from "@/app/rankings/create/page"

interface ReviewStepProps {
  data: RankingData
  onPrev: () => void
  onRankingCreated?: () => void
}

export function ReviewStep({ data, onPrev, onRankingCreated }: ReviewStepProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [applicationLink, setApplicationLink] = useState("")
  const [isCreated, setIsCreated] = useState(false)
  const [error, setError] = useState("")
  const [showCriteriaToApplicants, setShowCriteriaToApplicants] = useState(true)

  const totalWeight = Object.values(data.criteriaWeights).reduce((sum, weight) => sum + weight, 0)
  const isValidWeight = totalWeight === 100

  const handleCreateRanking = async () => {
    if (!isValidWeight) {
      alert("Total weight must equal 100% before creating the ranking.")
      return
    }

    setIsCreating(true)
    setError("")

    try {
      console.log("[v0] Sending ranking data:", {
        title: data.title,
        position: data.position,
        description: data.description,
        criteria: data.selectedCriteria,
        criteriaWeights: data.criteriaWeights,
        areaLivingCity: data.areaLivingCity,
        otherKeyword: data.otherKeyword,
        showCriteriaToApplicants,
      })

      const requestBody = {
        title: data.title,
        position: data.position,
        description: data.description,
        criteriaWeights: data.criteriaWeights, // Use camelCase for frontend consistency
        selectedCriteria: data.selectedCriteria, // Use camelCase for frontend consistency
        areaLivingCity: data.areaLivingCity, // Use camelCase for frontend consistency
        otherKeyword: data.otherKeyword, // Use camelCase for frontend consistency
        show_criteria_to_applicants: showCriteriaToApplicants,
        is_active: true,
      }

      console.log("[v0] Sending corrected request body:", requestBody)

      const response = await fetch("/api/rankings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()
      console.log("[v0] API Response:", result)

      if (response.ok) {
        const link = `${window.location.origin}/apply/${result.linkId}`
        setApplicationLink(link)
        setIsCreated(true)
        onRankingCreated?.()
      } else {
        const errorMessage = result.details || result.error || "Failed to create ranking"
        console.error("[v0] API Error:", result)
        setError(`Error: ${errorMessage}`)
      }
    } catch (error) {
      console.error("[v0] Network error creating ranking:", error)
      setError(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsCreating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(applicationLink)
    alert("Application link copied to clipboard!")
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

  if (isCreated) {
    return (
      <div className="text-center space-y-6 animate-fade-in-up">
        <div className="flex justify-center animate-bounce-gentle">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm">
            <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent mb-2">
            Ranking Created Successfully!
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Your job ranking has been created and is ready to receive applications.
          </p>
        </div>

        <Card className="backdrop-blur-md bg-white/70 dark:bg-gray-800/70 border-white/20 dark:border-gray-700/50 shadow-xl animate-slide-in-up">
          <CardHeader>
            <CardTitle className="text-lg bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              Application Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={applicationLink}
                readOnly
                className="font-mono text-sm backdrop-blur-sm bg-gray-50/80 dark:bg-gray-900/80 border-emerald-200/50 dark:border-emerald-700/50 text-gray-900 dark:text-gray-100"
              />
              <Button
                onClick={copyToClipboard}
                size="sm"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => window.open(applicationLink, "_blank")}
                variant="outline"
                className="flex-1 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-emerald-200/50 dark:border-emerald-700/50 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 transition-all duration-300 hover:scale-105"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Preview Application Form
              </Button>
              <Button
                onClick={() => (window.location.href = "/")}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert className="border-red-200/50 dark:border-red-800/50 backdrop-blur-sm bg-red-50/80 dark:bg-red-950/50 animate-shake">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
        </Alert>
      )}

      {/* Job Details Review */}
      <Card className="backdrop-blur-md bg-white/70 dark:bg-gray-800/70 border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in-up">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
            Job Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Position</Label>
            <p className="text-gray-900 dark:text-gray-100 capitalize">{data.position.replace("-", " ")}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</Label>
            <p className="text-gray-900 dark:text-gray-100">{data.title}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</Label>
            <p className="text-gray-900 dark:text-gray-100">{data.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Criteria Review */}
      <Card
        className="backdrop-blur-md bg-white/70 dark:bg-gray-800/70 border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-500 animate-fade-in-up"
        style={{ animationDelay: "0.1s" }}
      >
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
            Evaluation Criteria & Weights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.selectedCriteria.map((criteriaId, index) => (
              <div
                key={criteriaId}
                className="flex items-center justify-between p-3 backdrop-blur-sm bg-gray-50/80 dark:bg-gray-700/80 rounded-lg border border-gray-200/50 dark:border-gray-600/50 animate-slide-in-left hover:scale-[1.02] transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{criteriaLabels[criteriaId]}</span>
                  {criteriaId === "area_living" && data.areaLivingCity && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({data.areaLivingCity})</span>
                  )}
                  {criteriaId === "other" && data.otherKeyword && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({data.otherKeyword})</span>
                  )}
                </div>
                <Badge
                  variant="secondary"
                  className="text-sm bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 text-emerald-800 dark:text-emerald-200 border-emerald-200/50 dark:border-emerald-700/50"
                >
                  {data.criteriaWeights[criteriaId]}% weight
                </Badge>
              </div>
            ))}
          </div>

          <div
            className={`mt-4 p-3 rounded-lg border backdrop-blur-sm transition-all duration-300 ${
              isValidWeight
                ? "bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-200/50 dark:border-emerald-800/50"
                : "bg-red-50/80 dark:bg-red-950/50 border-red-200/50 dark:border-red-800/50"
            }`}
          >
            <p
              className={`text-sm font-medium ${
                isValidWeight ? "text-emerald-800 dark:text-emerald-200" : "text-red-800 dark:text-red-200"
              }`}
            >
              <strong>Total Weight:</strong> {totalWeight}%{isValidWeight ? " ✓" : ` (Must equal 100%)`}
            </p>
          </div>

          {!isValidWeight && (
            <Alert className="border-red-200/50 dark:border-red-800/50 backdrop-blur-sm bg-red-50/80 dark:bg-red-950/50 animate-shake">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                {totalWeight > 100
                  ? `Total weight is ${totalWeight}%. Please go back and reduce the weights to equal exactly 100%.`
                  : `Total weight is ${totalWeight}%. Please go back and increase the weights to equal exactly 100%.`}
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-4 p-4 backdrop-blur-sm bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-200/50 dark:border-emerald-800/50 rounded-lg animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                  Show Evaluation Criteria to Applicants
                </Label>
                <p className="text-xs text-emerald-700 dark:text-emerald-200 mt-1">
                  When enabled, applicants will see what criteria they'll be evaluated on and their importance levels.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCriteriaToApplicants(!showCriteriaToApplicants)}
                className={`flex items-center gap-2 transition-all duration-300 hover:scale-105 ${
                  showCriteriaToApplicants
                    ? "bg-emerald-100/80 dark:bg-emerald-900/50 border-emerald-300/50 dark:border-emerald-700/50 text-emerald-700 dark:text-emerald-200"
                    : "bg-gray-100/80 dark:bg-gray-800/80 border-gray-300/50 dark:border-gray-600/50 text-gray-600 dark:text-gray-300"
                }`}
              >
                {showCriteriaToApplicants ? (
                  <>
                    <Eye className="w-4 h-4" />
                    Visible
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Hidden
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
        <Button
          variant="outline"
          onClick={onPrev}
          className="flex items-center gap-2 backdrop-blur-sm bg-white/50 dark:bg-gray-800/50 border-emerald-200/50 dark:border-emerald-700/50 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-lg px-6 py-2.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
        <Button
          onClick={handleCreateRanking}
          disabled={isCreating || !isValidWeight}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 rounded-lg px-6 py-2.5 font-medium"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating Ranking...
            </>
          ) : (
            "Create Ranking & Generate Link"
          )}
        </Button>
      </div>
    </div>
  )
}
