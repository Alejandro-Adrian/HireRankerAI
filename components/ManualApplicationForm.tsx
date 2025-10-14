"use client"
import { useState } from "react"
import type React from "react"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Send,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

interface ManualApplicationFormProps {
  ranking: any
}

export default function ManualApplicationForm({ ranking }: ManualApplicationFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    applicant_name: "",
    applicant_email: "",
    applicant_phone: "",
    applicant_city: "",
    experience_years: "",
    education_level: "",
    key_skills: "",
    certifications: "",
    resume_summary: "",
    previous_roles: "",
    personality_traits: "",
    additional_notes: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const getPositionExamples = () => {
    const position = ranking.position?.toLowerCase() || ""

    if (position.includes("kitchen") || position.includes("cook") || position.includes("chef")) {
      return {
        skills:
          "Food preparation, knife skills, sanitation, cooking techniques, recipe following, time management, food safety",
        certifications: "ServSafe Food Handler, HACCP, Food Safety Manager Certification",
        summary:
          "Experienced kitchen helper with 2 years in fast-paced restaurant environments. Skilled in food prep, maintaining cleanliness, and supporting head chefs.",
        roles: "Kitchen Assistant at ABC Restaurant, Prep Cook at XYZ Cafe",
        traits: "Team player, detail-oriented, works well under pressure, punctual, reliable",
      }
    } else if (position.includes("server") || position.includes("waiter") || position.includes("waitress")) {
      return {
        skills: "Customer service, order taking, POS systems, menu knowledge, multitasking, communication, upselling",
        certifications: "Food Handler Certificate, Alcohol Service Certification (TIPS/ServSafe Alcohol)",
        summary:
          "Friendly and efficient server with 3 years of experience in casual and fine dining. Excellent at building rapport with customers and maximizing sales.",
        roles: "Server at Fine Dining Restaurant, Waitstaff at Family Restaurant",
        traits: "Friendly, energetic, excellent communicator, patient, customer-focused",
      }
    } else if (position.includes("housekeeping") || position.includes("cleaner")) {
      return {
        skills: "Cleaning techniques, laundry, organization, attention to detail, time management, chemical safety",
        certifications: "Housekeeping Certification, OSHA Safety Training",
        summary:
          "Dedicated housekeeper with 4 years of experience in hotels and residential settings. Known for thoroughness and efficiency.",
        roles: "Housekeeper at Luxury Hotel, Residential Cleaner at Cleaning Service",
        traits: "Thorough, trustworthy, independent, organized, physically fit",
      }
    } else if (position.includes("cashier")) {
      return {
        skills: "Cash handling, POS systems, customer service, basic math, inventory management, problem-solving",
        certifications: "Cash Handling Certification, Customer Service Training",
        summary:
          "Reliable cashier with 2 years of retail experience. Accurate with transactions and excellent at resolving customer issues.",
        roles: "Cashier at Retail Store, Front Desk Cashier at Supermarket",
        traits: "Honest, accurate, friendly, patient, good with numbers",
      }
    } else if (position.includes("barista")) {
      return {
        skills:
          "Espresso preparation, latte art, customer service, POS systems, inventory management, coffee knowledge",
        certifications: "Barista Training Certificate, Food Handler Certificate",
        summary:
          "Passionate barista with 3 years of experience crafting specialty coffee drinks. Skilled in latte art and customer engagement.",
        roles: "Barista at Coffee Shop, Lead Barista at Specialty Cafe",
        traits: "Creative, friendly, detail-oriented, fast learner, passionate about coffee",
      }
    } else if (position.includes("receptionist")) {
      return {
        skills:
          "Phone etiquette, scheduling, Microsoft Office, customer service, organization, multitasking, communication",
        certifications: "Administrative Assistant Certification, Customer Service Training",
        summary:
          "Professional receptionist with 5 years of experience managing front desk operations. Excellent at coordinating schedules and greeting visitors.",
        roles: "Receptionist at Medical Office, Front Desk Coordinator at Corporate Office",
        traits: "Professional, organized, excellent communicator, friendly, tech-savvy",
      }
    } else if (position.includes("gardener") || position.includes("landscap")) {
      return {
        skills:
          "Plant care, landscaping, lawn maintenance, pruning, irrigation systems, equipment operation, pest control",
        certifications: "Landscape Technician Certification, Pesticide Applicator License",
        summary:
          "Experienced gardener with 6 years maintaining residential and commercial properties. Knowledgeable in plant care and landscape design.",
        roles: "Gardener at Landscaping Company, Groundskeeper at Golf Course",
        traits: "Hardworking, knowledgeable, physically fit, detail-oriented, reliable",
      }
    }

    return {
      skills: "Relevant technical skills, soft skills, industry-specific knowledge",
      certifications: "Professional certifications, licenses, training programs completed",
      summary: "Brief professional summary highlighting your experience and key strengths",
      roles: "Previous job titles and companies you've worked for",
      traits: "Personality traits and soft skills that make you a good fit",
    }
  }

  const examples = getPositionExamples()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate required fields
    if (!formData.applicant_name.trim()) {
      setError("Applicant name is required")
      return
    }

    if (!formData.applicant_email.trim() && !formData.applicant_phone.trim()) {
      setError("Please provide at least email or phone number")
      return
    }

    setSubmitting(true)

    try {
      // Create OCR transcript from all fields (simulating extracted text)
      const ocrTranscript = `
Name: ${formData.applicant_name}
Email: ${formData.applicant_email}
Phone: ${formData.applicant_phone}
Location: ${formData.applicant_city}

PROFESSIONAL SUMMARY
${formData.resume_summary}

EXPERIENCE
Years of Experience: ${formData.experience_years} years
Previous Roles: ${formData.previous_roles}

EDUCATION
${formData.education_level}

SKILLS
${formData.key_skills}

CERTIFICATIONS
${formData.certifications}

PERSONALITY & SOFT SKILLS
${formData.personality_traits}

ADDITIONAL INFORMATION
${formData.additional_notes}
      `.trim()

      const submitData = {
        ranking_id: ranking.id,
        applicant_name: formData.applicant_name.trim(),
        applicant_email: formData.applicant_email.trim() || `manual-${Date.now()}@placeholder.com`,
        applicant_phone: formData.applicant_phone.trim() || null,
        applicant_city: formData.applicant_city.trim() || null,
        experience_years: Number.parseInt(formData.experience_years) || 0,
        education_level: formData.education_level || "Not specified",
        key_skills: formData.key_skills.trim() || "Not specified",
        certifications: formData.certifications.trim() || "None specified",
        resume_summary: formData.resume_summary.trim() || "Manually entered application",
        ocr_transcript: ocrTranscript,
        is_manual_entry: true,
      }

      console.log("Submitting manual application:", submitData)

      const response = await fetch("/api/applications/manual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      const responseData = await response.json()

      if (response.ok) {
        console.log("Manual application submitted successfully:", responseData)
        setSubmitted(true)
      } else {
        console.error("Manual application submission failed:", responseData)
        setError(responseData.error || `Failed to submit application (${response.status})`)
      }
    } catch (error) {
      console.error("Error submitting manual application:", error)
      setError("An error occurred while submitting your application. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-card rounded-lg shadow-sm border border-border p-8 text-center animate-scale-in">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Application Submitted!</h2>
        <p className="text-muted-foreground mb-4">
          Thank you for your interest in the {ranking.position.replace("/", " / ")} position.
        </p>
        <p className="text-sm text-muted-foreground">
          Your manually entered application has been received and is being processed automatically. The HR team will
          contact you if you are selected for the next stage.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start space-x-3 animate-shake">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <p className="text-sm text-foreground">
          <strong>Manual Entry Mode:</strong> Enter all applicant details below. This information will be processed the
          same way as resume uploads. Examples are provided based on the {ranking.position} position.
        </p>
      </div>

      {/* Personal Information */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <User className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Personal Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Full Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              name="applicant_name"
              value={formData.applicant_name}
              onChange={handleInputChange}
              placeholder="e.g., John Smith"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                name="applicant_email"
                value={formData.applicant_email}
                onChange={handleInputChange}
                placeholder="e.g., john.smith@email.com"
                className="w-full pl-10 pr-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="tel"
                name="applicant_phone"
                value={formData.applicant_phone}
                onChange={handleInputChange}
                placeholder="e.g., (555) 123-4567"
                className="w-full pl-10 pr-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">City/Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                name="applicant_city"
                value={formData.applicant_city}
                onChange={handleInputChange}
                placeholder="e.g., New York, NY"
                className="w-full pl-10 pr-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Professional Experience */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Briefcase className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Professional Experience</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Years of Experience</label>
            <input
              type="number"
              name="experience_years"
              value={formData.experience_years}
              onChange={handleInputChange}
              placeholder="e.g., 3"
              min="0"
              max="50"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Key Skills</label>
            <textarea
              name="key_skills"
              value={formData.key_skills}
              onChange={handleInputChange}
              placeholder={`Example: ${examples.skills}`}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-muted-foreground mt-1">List relevant skills separated by commas</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Previous Roles/Experience</label>
            <textarea
              name="previous_roles"
              value={formData.previous_roles}
              onChange={handleInputChange}
              placeholder={`Example: ${examples.roles}`}
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Professional Summary</label>
            <textarea
              name="resume_summary"
              value={formData.resume_summary}
              onChange={handleInputChange}
              placeholder={`Example: ${examples.summary}`}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-muted-foreground mt-1">Brief summary of professional background and strengths</p>
          </div>
        </div>
      </div>

      {/* Education & Certifications */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <GraduationCap className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Education & Certifications</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Education Level</label>
            <select
              name="education_level"
              value={formData.education_level}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select education level</option>
              <option value="High School">High School</option>
              <option value="Associate's Degree">Associate's Degree</option>
              <option value="Bachelor's Degree">Bachelor's Degree</option>
              <option value="Master's Degree">Master's Degree</option>
              <option value="PhD/Doctorate">PhD/Doctorate</option>
              <option value="Trade/Vocational">Trade/Vocational School</option>
              <option value="Some College">Some College</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Certifications & Training</label>
            <textarea
              name="certifications"
              value={formData.certifications}
              onChange={handleInputChange}
              placeholder={`Example: ${examples.certifications}`}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-muted-foreground mt-1">
              List professional certifications, licenses, or training programs
            </p>
          </div>
        </div>
      </div>

      {/* Personality & Additional Info */}
      <div className="bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Award className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Personality & Additional Information</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Personality Traits & Soft Skills</label>
            <textarea
              name="personality_traits"
              value={formData.personality_traits}
              onChange={handleInputChange}
              placeholder={`Example: ${examples.traits}`}
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-muted-foreground mt-1">Describe personality traits and soft skills</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Additional Notes</label>
            <textarea
              name="additional_notes"
              value={formData.additional_notes}
              onChange={handleInputChange}
              placeholder="Any additional information about the applicant..."
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center space-x-2 px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-lg font-medium transform hover:scale-105 hover:shadow-lg active:scale-95"
        >
          {submitting ? (
            <>
              <div className="loading-spinner"></div>
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>Submit Manual Application</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
