"use client"
import { useState, useEffect } from "react"
import { ArrowLeft, Search, ChevronRight, Users, Check, Loader2, X } from 'lucide-react'

interface Ranking {
  id: string
  title: string
  position: string
  applications_count?: number
}

interface Application {
  id: string
  applicant_name: string
  applicant_email: string
  total_score?: number
  ranking_id: string
}

interface InterviewSessionManagerProps {
  rankings: Ranking[]
  onBack: () => void
  onNotification: (message: string, type: "success" | "error" | "info") => void
  user: any
}

const InterviewSessionManager = ({
  rankings,
  onBack,
  onNotification,
  user,
}: InterviewSessionManagerProps) => {
  const [step, setStep] = useState<"ranking-select" | "applicants">("ranking-select")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRanking, setSelectedRanking] = useState<Ranking | null>(null)
  const [applicants, setApplicants] = useState<Application[]>([])
  const [selectedApplicants, setSelectedApplicants] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)

  const filteredRankings = rankings.filter((r) =>
    `${r.title} ${r.position}`.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const loadApplicants = async (rankingId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/rankings/${rankingId}/applications`)
      if (response.ok) {
        const data = await response.json()
        const applicationsArray = Array.isArray(data) ? data : data.applications || []
        
        const mapped = applicationsArray.map((app: any) => ({
          id: app.id,
          applicant_name: app.applicant_name || app.candidate_name || "Unknown",
          applicant_email: app.applicant_email || app.candidate_email || "No email",
          total_score: app.total_score,
          ranking_id: rankingId,
        }))
        
        setApplicants(mapped)
        setSelectedApplicants(new Set())
      } else {
        onNotification("Failed to load applicants", "error")
      }
    } catch (error) {
      console.error("Error loading applicants:", error)
      onNotification("Error loading applicants", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectRanking = async (ranking: Ranking) => {
    setSelectedRanking(ranking)
    await loadApplicants(ranking.id)
    setStep("applicants")
  }

  const toggleApplicant = (applicantId: string) => {
    const newSelected = new Set(selectedApplicants)
    if (newSelected.has(applicantId)) {
      newSelected.delete(applicantId)
    } else {
      newSelected.add(applicantId)
    }
    setSelectedApplicants(newSelected)
  }

  const sendMeetingLinks = async () => {
    if (!selectedRanking || selectedApplicants.size === 0) {
      onNotification("Please select applicants to send links", "error")
      return
    }

    try {
      setSending(true)
      const response = await fetch("/api/applications/bulk-schedule-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationIds: Array.from(selectedApplicants),
          scheduledAt: null,
          notes: `Interview scheduled for ranking: ${selectedRanking.title}`,
        }),
      })

      const data = await response.json()

      if (response.ok && data.results) {
        const successCount = data.results.filter((r: any) => r.success).length
        onNotification(
          `Successfully sent meeting links to ${successCount} applicant${successCount !== 1 ? "s" : ""}`,
          "success",
        )
        
        // Reset and go back to ranking selection
        setStep("ranking-select")
        setSelectedRanking(null)
        setApplicants([])
        setSelectedApplicants(new Set())
        setSearchQuery("")
      } else {
        onNotification(data.error || "Failed to send meeting links", "error")
      }
    } catch (error) {
      console.error("Error sending meeting links:", error)
      onNotification("Error sending meeting links", "error")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-40 bg-card">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-1 text-primary hover:text-primary/80 transition-all"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline text-sm">Back</span>
              </button>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-foreground">Send Interview Links</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  {step === "ranking-select"
                    ? "Select a ranking to get started"
                    : "Choose which applicants to send links"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6">
        {/* Step 1: Ranking Selection */}
        {step === "ranking-select" && (
          <div className="max-w-3xl mx-auto">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search rankings by title or position..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field w-full pl-10"
                />
              </div>
            </div>

            {/* Rankings List */}
            <div className="border border-border rounded-lg bg-card divide-y divide-border overflow-hidden">
              {filteredRankings.length === 0 ? (
                <div className="p-8 sm:p-12 text-center">
                  <Users className="h-12 w-12 text-muted mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">No rankings found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? "Try adjusting your search" : "Create a ranking to get started"}
                  </p>
                </div>
              ) : (
                filteredRankings.map((ranking) => (
                  <div
                    key={ranking.id}
                    onClick={() => handleSelectRanking(ranking)}
                    className="p-4 sm:p-6 hover:bg-muted/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                          {ranking.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          Position: {ranking.position}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            {ranking.applications_count || 0} applicants
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Step 2: Applicant Selection */}
        {step === "applicants" && selectedRanking && (
          <div className="max-w-3xl mx-auto">
            {/* Selected Ranking Info */}
            <div className="mb-6 p-4 bg-muted rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-medium text-foreground">{selectedRanking.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Position: {selectedRanking.position}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setStep("ranking-select")
                    setSelectedRanking(null)
                    setApplicants([])
                    setSelectedApplicants(new Set())
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Applicants List */}
            <div className="border border-border rounded-lg bg-card overflow-hidden">
              {loading ? (
                <div className="p-8 sm:p-12 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Loading applicants...</p>
                </div>
              ) : applicants.length === 0 ? (
                <div className="p-8 sm:p-12 text-center">
                  <Users className="h-12 w-12 text-muted mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">No applicants found</h3>
                  <p className="text-sm text-muted-foreground">This ranking has no applicants yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {/* Select All Header */}
                  <div className="p-4 sm:p-6 bg-muted/30 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {selectedApplicants.size} of {applicants.length} selected
                    </span>
                    <button
                      onClick={() => {
                        if (selectedApplicants.size === applicants.length) {
                          setSelectedApplicants(new Set())
                        } else {
                          setSelectedApplicants(new Set(applicants.map((a) => a.id)))
                        }
                      }}
                      className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium"
                    >
                      {selectedApplicants.size === applicants.length ? "Deselect All" : "Select All"}
                    </button>
                  </div>

                  {/* Applicant Items */}
                  {applicants.map((applicant) => (
                    <div
                      key={applicant.id}
                      onClick={() => toggleApplicant(applicant.id)}
                      className="p-4 sm:p-6 hover:bg-muted/50 transition-all cursor-pointer flex items-center space-x-3 sm:space-x-4"
                    >
                      <div
                        className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                          selectedApplicants.has(applicant.id)
                            ? "bg-primary border-primary"
                            : "border-border hover:border-primary"
                        }`}
                      >
                        {selectedApplicants.has(applicant.id) && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate text-sm sm:text-base">
                          {applicant.applicant_name}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {applicant.applicant_email}
                        </p>
                        {applicant.total_score && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Score: {applicant.total_score.toFixed(1)}%
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {applicants.length > 0 && (
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setStep("ranking-select")
                    setSelectedRanking(null)
                    setApplicants([])
                    setSelectedApplicants(new Set())
                  }}
                  className="flex-1 px-4 py-2 text-foreground bg-muted rounded-lg hover:bg-muted/80 transition-all font-medium text-sm"
                >
                  Back
                </button>
                <button
                  onClick={sendMeetingLinks}
                  disabled={selectedApplicants.size === 0 || sending}
                  className="flex-1 px-4 py-2 btn-primary rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Links ({selectedApplicants.size})
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default InterviewSessionManager
