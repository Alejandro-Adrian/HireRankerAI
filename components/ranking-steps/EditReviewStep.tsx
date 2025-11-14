"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Save, CheckCircle, Loader2, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import type { RankingData } from "@/app/rankings/create/page"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'

interface EditReviewStepProps {
  data: RankingData
  onPrev: () => void
  rankingId: string
}

export function EditReviewStep({ data, onPrev, rankingId }: EditReviewStepProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState("")
  const [showCriteriaToApplicants, setShowCriteriaToApplicants] = useState(true)
  const router = useRouter()

  const totalWeight = Object.values(data.criteriaWeights).reduce((sum, weight) => sum + weight, 0)
  const isValidWeight = totalWeight === 100

  const handleSaveChanges = async () => {
    if (!isValidWeight) {
      alert("Total weight must equal 100% before saving changes.")
      return
    }

    setIsSaving(true)
    setError("")

    try {
      const supabase = createClient()

      const { error: updateError } = await supabase
        .from("rankings")
        .update({
          title: data.title,
          position: data.position,
          description: data.description,
          criteria: data.selectedCriteria, // Store selected criteria in criteria field
          criteria_weights: data.criteriaWeights, // Use snake_case for database
          area_city: data.areaLivingCity, // Map to database field name
          other_keyword: data.otherKeyword, // Map to database field name
          show_criteria_to_applicants: showCriteriaToApplicants,
          updated_at: new Date().toISOString(),
        })
        .eq("id", rankingId)

      if (updateError) {
        throw new Error(updateError.message)
      }

      setIsSaved(true)
    } catch (err) {
      console.error("Error saving ranking:", err)
      setError(err instanceof Error ? err.message : "Failed to save changes")
    } finally {
      setIsSaving(false)
    }
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

  if (isSaved) {
    return (
      <div className="text-center space-y-6 animate-fade-in-up">
        <div className="flex justify-center animate-bounce-gentle">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm">
            <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent mb-2">
            Changes Saved Successfully!
          </h3>
          <p className="text-black dark:text-gray-300">
            Your ranking has been updated with the new criteria and settings.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => router.push("/")}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            Back to Dashboard
          </Button>
        </div>
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
            <Label className="text-sm font-medium text-black dark:text-gray-400">Position</Label>
            <p className="text-black dark:text-gray-100 capitalize">{data.position.replace("-", " ")}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-black dark:text-gray-400">Title</Label>
            <p className="text-black dark:text-gray-100">{data.title}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-black dark:text-gray-400">Description</Label>
            <p className="text-black dark:text-gray-100">{data.description}</p>
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
                  <span className="font-medium text-black dark:text-gray-100">{criteriaLabels[criteriaId]}</span>
                  {criteriaId === "area_living" && data.areaLivingCity && (
                    <span className="text-sm text-black dark:text-gray-400 ml-2">({data.areaLivingCity})</span>
                  )}
                  {criteriaId === "other" && data.otherKeyword && (
                    <span className="text-sm text-black dark:text-gray-400 ml-2">({data.otherKeyword})</span>
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
                isValidWeight ? "text-black dark:text-emerald-200" : "text-black dark:text-red-200"
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
                <Label className="text-sm font-medium text-black dark:text-emerald-100">
                  Show Evaluation Criteria to Applicants
                </Label>
                <p className="text-xs text-black dark:text-emerald-200 mt-1">
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
          onClick={handleSaveChanges}
          disabled={isSaving || !isValidWeight}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 rounded-lg px-6 py-2.5 font-medium"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
