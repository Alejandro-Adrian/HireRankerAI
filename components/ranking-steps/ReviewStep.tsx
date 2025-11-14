"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Copy, ExternalLink, CheckCircle, Loader2, AlertTriangle, Eye, EyeOff } from 'lucide-react'
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
      <div className="text-center space-y-6 animate-in fade-in">
        <div className="flex justify-center animate-bounce">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
          </div>
        </div>

        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
            Ranking Created Successfully!
          </h3>
          <p className="text-sm sm:text-base text-muted-foreground">
            Your job ranking is ready to receive applications.
          </p>
        </div>

        <Card className="border border-border bg-card/80 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg text-primary">
              Application Link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={applicationLink}
                readOnly
                className="font-mono text-xs sm:text-sm bg-muted/50 flex-1"
              />
              <Button
                onClick={copyToClipboard}
                size="sm"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground whitespace-nowrap"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => window.open(applicationLink, "_blank")}
                variant="outline"
                className="flex-1 bg-card hover:bg-muted"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Preview Form
              </Button>
              <Button
                onClick={() => (window.location.href = "/")}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
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
        <Alert className="border-destructive/50 bg-destructive/10 animate-shake">
          <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
          <AlertDescription className="text-destructive ml-2">{error}</AlertDescription>
        </Alert>
      )}

      {/* Job Details Review */}
      <Card className="border border-border bg-card/80 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg text-primary">
            Job Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Position</Label>
            <p className="text-foreground capitalize mt-1">{data.position.replace("-", " ")}</p>
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Title</Label>
            <p className="text-foreground mt-1">{data.title}</p>
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Description</Label>
            <p className="text-foreground mt-1 whitespace-pre-wrap">{data.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Criteria Review */}
      <Card className="border border-border bg-card/80 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg text-primary">
            Evaluation Criteria & Weights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 sm:space-y-4">
            {data.selectedCriteria.map((criteriaId, index) => (
              <div
                key={criteriaId}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-muted/30 rounded-lg border border-border/50 hover:scale-[1.01] transition-transform"
              >
                <div className="min-w-0">
                  <span className="font-medium text-foreground text-sm">{criteriaLabels[criteriaId]}</span>
                  {criteriaId === "area_living" && data.areaLivingCity && (
                    <span className="text-xs text-muted-foreground ml-2">({data.areaLivingCity})</span>
                  )}
                  {criteriaId === "other" && data.otherKeyword && (
                    <span className="text-xs text-muted-foreground ml-2">({data.otherKeyword})</span>
                  )}
                </div>
                <Badge
                  variant="secondary"
                  className="w-fit text-xs sm:text-sm bg-primary/10 text-primary border-primary/20"
                >
                  {data.criteriaWeights[criteriaId]}% weight
                </Badge>
              </div>
            ))}
          </div>

          <div
            className={`p-3 rounded-lg border transition-all duration-300 ${
              isValidWeight
                ? "bg-primary/5 border-primary/20"
                : "bg-destructive/5 border-destructive/20"
            }`}
          >
            <p
              className={`text-sm font-medium ${
                isValidWeight ? "text-primary" : "text-destructive"
              }`}
            >
              <strong>Total Weight:</strong> {totalWeight}%{isValidWeight ? " ✓" : ` (Must equal 100%)`}
            </p>
          </div>

          {!isValidWeight && (
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
              <AlertDescription className="text-destructive ml-2">
                {totalWeight > 100
                  ? `Total is ${totalWeight}%. Please reduce the weights to equal exactly 100%.`
                  : `Total is ${totalWeight}%. Please increase the weights to equal exactly 100%.`}
              </AlertDescription>
            </Alert>
          )}

          <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 dark:bg-primary/10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <Label className="text-sm font-medium text-foreground">
                  Show Criteria to Applicants
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  They'll see evaluation criteria and importance levels
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowCriteriaToApplicants(!showCriteriaToApplicants)}
                className={`w-full sm:w-auto whitespace-nowrap transition-all duration-300 ${
                  showCriteriaToApplicants
                    ? "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {showCriteriaToApplicants ? (
                  <>
                    <Eye className="w-4 h-4 mr-2 flex-shrink-0" />
                    Visible
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4 mr-2 flex-shrink-0" />
                    Hidden
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
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
          onClick={handleCreateRanking}
          disabled={isCreating || !isValidWeight}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 rounded-lg px-6 py-2.5 font-medium"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              Create Ranking & Generate Link
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
