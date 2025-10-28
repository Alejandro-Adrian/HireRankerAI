"use client"
import { useState } from "react"
import type React from "react"

import { Upload, FileText, Award, Briefcase, Send, CheckCircle, AlertCircle } from "lucide-react"
import ManualApplicationForm from "./ManualApplicationForm"

interface ApplicationFormProps {
  ranking: any
}

interface FileUpload {
  file: File
  category: "resume" | "certificate" | "portfolio" | "other"
  preview?: string
}

export default function ApplicationForm({ ranking }: ApplicationFormProps) {
  const [files, setFiles] = useState<FileUpload[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [extractedInfo, setExtractedInfo] = useState<any>(null)
  const [showManualEntry, setShowManualEntry] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, category: FileUpload["category"]) => {
    const selectedFiles = Array.from(e.target.files || [])

    const validFiles: FileUpload[] = []

    for (const file of selectedFiles) {
      if (file.size > 10 * 1024 * 1024) {
        setError(`File "${file.name}" is too large. Maximum size is 10MB.`)
        continue
      }

      if (category === "resume") {
        const validTypes = [".pdf", ".doc", ".docx", ".txt", ".jpg", ".jpeg", ".png"]
        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."))
        if (!validTypes.includes(fileExtension)) {
          setError(`Resume must be in PDF, DOC, DOCX, TXT, JPG, or PNG format. "${file.name}" is not supported.`)
          continue
        }
      }

      validFiles.push({
        file,
        category,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      })
    }

    setFiles((prev) => [...prev, ...validFiles])
    if (error && validFiles.length > 0) setError("")
  }

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev]
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!)
      }
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const hasResume = files.some((f) => f.category === "resume")
    if (!hasResume) {
      setError("Please upload your resume to continue")
      return
    }

    if (files.length === 0) {
      setError("Please upload at least your resume")
      return
    }

    setSubmitting(true)

    try {
      const submitData = new FormData()
      submitData.append("ranking_id", ranking.id)

      files.forEach((fileUpload, index) => {
        submitData.append(`file_${index}`, fileUpload.file)
        submitData.append(`file_${index}_category`, fileUpload.category)
      })

      const response = await fetch("/api/applications", {
        method: "POST",
        body: submitData,
      })

      const responseData = await response.json()

      if (response.ok) {
        setExtractedInfo(responseData.extracted_info)
        setSubmitted(true)
      } else {
        setError(responseData.error || `Failed to submit application (${response.status})`)
      }
    } catch (error) {
      setError("An error occurred while submitting your application. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-card rounded-lg shadow-sm border border-border p-8 text-center">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Application Submitted!</h2>
        <p className="text-muted-foreground mb-4">
          Thank you for your interest in the {ranking.position.replace("/", " / ")} position.
        </p>
        {extractedInfo && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-medium text-primary mb-2">Extracted Information</h3>
            <div className="text-sm text-foreground space-y-1">
              <p>
                <strong>Name:</strong> {extractedInfo.name}
              </p>
              <p>
                <strong>Email:</strong> {extractedInfo.email}
              </p>
              {extractedInfo.phone && (
                <p>
                  <strong>Phone:</strong> {extractedInfo.phone}
                </p>
              )}
              {extractedInfo.city && (
                <p>
                  <strong>City:</strong> {extractedInfo.city}
                </p>
              )}
            </div>
          </div>
        )}
        <p className="text-sm text-muted-foreground leading-relaxed">
          We have received your application and automatically extracted your personal information from your resume. Your
          application is being processed and scored automatically. The HR team will contact you if you are selected for
          the next stage.
        </p>
      </div>
    )
  }

  if (showManualEntry) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setShowManualEntry(false)}
          className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
        >
          <span>← Back to file upload</span>
        </button>
        <ManualApplicationForm ranking={ranking} />
      </div>
    )
  }

  const criteriaWeights = ranking.criteria_weights || {}
  const selectedCriteria = Object.keys(criteriaWeights)
  const showCriteria = ranking.show_criteria_to_applicants !== false

  const hasResume = files.some((f) => f.category === "resume")

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {hasResume && !error && (
        <div className="bg-success/10 border border-success/20 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
          <p className="text-success text-sm">
            Resume uploaded successfully. Personal information will be extracted automatically when you submit.
          </p>
        </div>
      )}

      <div className="bg-muted/30 border border-border rounded-lg p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">Don't have a resume file?</p>
          <p className="text-xs text-muted-foreground">You can manually enter applicant information instead</p>
        </div>
        <button
          type="button"
          onClick={() => setShowManualEntry(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium whitespace-nowrap"
        >
          Manual Entry
        </button>
      </div>

      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Documents</h2>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Upload your resume and any supporting documents. Your personal information (name, email, phone, location) will
          be automatically extracted from your resume.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Resume Upload */}
          <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center hover:border-primary/50 transition-colors bg-primary/5 hover:bg-primary/10">
            <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="text-sm font-medium text-foreground mb-1">Resume/CV *</h3>
            <p className="text-xs text-muted-foreground mb-3">PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB) - Required</p>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload(e, "resume")}
              className="hidden"
              id="resume-upload"
            />
            <label
              htmlFor="resume-upload"
              className="inline-flex items-center px-3 py-2 border border-primary shadow-sm text-sm leading-4 font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 cursor-pointer transition-colors"
            >
              Choose File
            </label>
          </div>

          {/* Certificates Upload */}
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center hover:border-primary/50 transition-colors bg-muted/20 hover:bg-muted/30">
            <Award className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <h3 className="text-sm font-medium text-foreground mb-1">Certificates</h3>
            <p className="text-xs text-muted-foreground mb-3">PDF, JPG, PNG (Max 10MB each)</p>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onChange={(e) => handleFileUpload(e, "certificate")}
              className="hidden"
              id="certificate-upload"
            />
            <label
              htmlFor="certificate-upload"
              className="inline-flex items-center px-3 py-2 border border-border shadow-sm text-sm leading-4 font-medium rounded-md text-foreground bg-background hover:bg-muted cursor-pointer transition-colors"
            >
              Choose Files
            </label>
          </div>

          {/* Portfolio Upload */}
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center hover:border-primary/50 transition-colors bg-muted/20 hover:bg-muted/30">
            <Briefcase className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <h3 className="text-sm font-medium text-foreground mb-1">Portfolio</h3>
            <p className="text-xs text-muted-foreground mb-3">PDF, JPG, PNG (Max 10MB each)</p>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onChange={(e) => handleFileUpload(e, "portfolio")}
              className="hidden"
              id="portfolio-upload"
            />
            <label
              htmlFor="portfolio-upload"
              className="inline-flex items-center px-3 py-2 border border-border shadow-sm text-sm leading-4 font-medium rounded-md text-foreground bg-background hover:bg-muted cursor-pointer transition-colors"
            >
              Choose Files
            </label>
          </div>

          {/* Other Documents Upload */}
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center hover:border-primary/50 transition-colors bg-muted/20 hover:bg-muted/30">
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <h3 className="text-sm font-medium text-foreground mb-1">Other Documents</h3>
            <p className="text-xs text-muted-foreground mb-3">Any format (Max 10MB each)</p>
            <input
              type="file"
              multiple
              onChange={(e) => handleFileUpload(e, "other")}
              className="hidden"
              id="other-upload"
            />
            <label
              htmlFor="other-upload"
              className="inline-flex items-center px-3 py-2 border border-border shadow-sm text-sm leading-4 font-medium rounded-md text-foreground bg-background hover:bg-muted cursor-pointer transition-colors"
            >
              Choose Files
            </label>
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-foreground mb-3">Uploaded Files</h3>
            <div className="space-y-2">
              {files.map((fileUpload, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{fileUpload.file.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {fileUpload.category} • {(fileUpload.file.size / 1024 / 1024).toFixed(2)} MB
                        {fileUpload.category === "resume" && (
                          <span className="text-primary font-medium"> (Required)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-destructive hover:text-destructive/80 text-sm transition-colors px-2 py-1 rounded hover:bg-destructive/10"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showCriteria && selectedCriteria.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
          <h3 className="text-sm font-medium text-primary mb-2">Evaluation Criteria</h3>
          <p className="text-sm text-foreground mb-3">
            Your application will be evaluated based on the following criteria (extracted from your resume and
            documents):
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedCriteria.map((criterion) => {
              const weight = criteriaWeights[criterion]
              const importance = weight <= 0.3 ? "Low" : weight <= 0.6 ? "Medium" : weight <= 0.8 ? "High" : "Critical"
              return (
                <span
                  key={criterion}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                >
                  {criterion.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())} ({importance})
                </span>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={submitting || !hasResume}
          className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-medium"
        >
          {submitting ? (
            <>
              <div className="loading-spinner"></div>
              <span>Submitting & Processing...</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>Submit Application</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
