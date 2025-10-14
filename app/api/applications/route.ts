import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { simpleResumeParser } from "@/lib/simple-resume-parser"
import { duplicateDetectionService } from "@/lib/duplicate-detection"

export async function POST(request: NextRequest) {
  try {
    console.log("Starting application submission process")

    let supabase
    try {
      supabase = createClient()
      console.log("Supabase client created successfully")

      // Test database connection
      const { data: testQuery, error: testError } = await supabase.from("rankings").select("count").limit(1)

      if (testError) {
        console.error("Database connection test failed:", testError)
        return NextResponse.json(
          {
            error: "Database connection failed",
            details: testError.message,
          },
          { status: 500 },
        )
      }

      console.log("Database connection verified")
    } catch (clientError) {
      console.error("Failed to create Supabase client:", clientError)
      return NextResponse.json(
        {
          error: "Database client initialization failed",
          details: clientError.message,
        },
        { status: 500 },
      )
    }

    const formData = await request.formData()

    console.log("Processing application submission")

    const ranking_id = formData.get("ranking_id") as string
    const hr_name = formData.get("hr_name") as string
    const company_name = formData.get("company_name") as string

    if (!ranking_id) {
      console.error("Missing ranking ID")
      return NextResponse.json({ error: "Missing ranking ID" }, { status: 400 })
    }

    if (!hr_name?.trim()) {
      console.error("Missing HR contact name")
      return NextResponse.json({ error: "HR contact name is required" }, { status: 400 })
    }

    if (!company_name?.trim()) {
      console.error("Missing company name")
      return NextResponse.json({ error: "Company name is required" }, { status: 400 })
    }

    console.log("Ranking ID:", ranking_id)
    console.log("HR Name:", hr_name)
    console.log("Company Name:", company_name)

    // Process uploaded files
    const fileEntries = Array.from(formData.entries()).filter(
      ([key]) => key.startsWith("file_") && !key.includes("_category"),
    )

    let resumeFile: File | null = null
    const allFiles: { file: File; category: string; index: string }[] = []

    for (const [key, file] of fileEntries) {
      if (file instanceof File) {
        const index = key.split("_")[1]
        const category = (formData.get(`file_${index}_category`) as string) || "other"

        allFiles.push({ file, category, index })

        if (category === "resume") {
          resumeFile = file
        }
      }
    }

    if (!resumeFile) {
      console.error("No resume file found")
      return NextResponse.json({ error: "Resume file is required" }, { status: 400 })
    }

    console.log(`Found ${allFiles.length} files, including resume: ${resumeFile.name}`)

    let resumeData
    try {
      console.log("Starting resume parsing...")
      console.log("Resume file details:", {
        name: resumeFile.name,
        size: resumeFile.size,
        type: resumeFile.type,
      })

      resumeData = await simpleResumeParser.parseFromFile(resumeFile)

      console.log("Resume parsing completed successfully")
      console.log("Parsed resume data:", resumeData)

      if (!resumeData.applicant_name || resumeData.applicant_name === "Name Not Found") {
        console.error("Resume parsing incomplete - no name found")
        return NextResponse.json(
          {
            error: "Failed to extract information from resume",
            details:
              "Could not extract applicant name from resume. Please ensure the file contains readable text or is a clear image.",
          },
          { status: 400 },
        )
      }
    } catch (parseError) {
      console.error("Resume parsing failed:", parseError)

      if (parseError.message.includes("PDF processing failed") && allFiles.length > 1) {
        return NextResponse.json(
          {
            error: "PDF processing failed when mixed with other files",
            details: "Please submit PDF files separately from images, or use only image files (JPG, PNG).",
          },
          { status: 400 },
        )
      }

      return NextResponse.json(
        {
          error: "Failed to parse resume",
          details: parseError.message,
        },
        { status: 500 },
      )
    }

    // Verify ranking exists and is active
    console.log("Validating ranking...")
    const { data: ranking, error: rankingError } = await supabase
      .from("rankings")
      .select("id, is_active, title")
      .eq("id", ranking_id)
      .eq("is_active", true)
      .single()

    if (rankingError || !ranking) {
      console.error("Ranking validation failed:", rankingError)
      return NextResponse.json({ error: "Invalid or inactive ranking" }, { status: 400 })
    }

    console.log("Validated ranking:", ranking.title)

    console.log("Performing comprehensive duplicate detection...")

    // Get all existing applications for this ranking
    const { data: existingApplications, error: fetchError } = await supabase
      .from("applications")
      .select("id, applicant_name, applicant_email, applicant_phone, applicant_city")
      .eq("ranking_id", ranking_id)

    if (fetchError) {
      console.error("Error fetching existing applications:", fetchError)
      return NextResponse.json(
        {
          error: "Failed to check for duplicates",
          details: fetchError.message,
        },
        { status: 500 },
      )
    }

    if (existingApplications && existingApplications.length > 0) {
      const duplicateResult = await duplicateDetectionService.checkDuplicate(
        {
          applicant_name: resumeData.applicant_name,
          applicant_email: resumeData.applicant_email,
          applicant_phone: resumeData.applicant_phone,
          applicant_city: resumeData.applicant_city,
        },
        existingApplications,
      )

      if (duplicateResult.isDuplicate) {
        console.log("Duplicate detected with confidence:", duplicateResult.confidence)
        console.log("Matched fields:", duplicateResult.matchedFields)

        return NextResponse.json(
          {
            error: "Duplicate application detected",
            details: `A very similar application already exists for this position. Matched fields: ${duplicateResult.matchedFields.join(", ")}. Confidence: ${Math.round(duplicateResult.confidence * 100)}%`,
            confidence: duplicateResult.confidence,
            matchedFields: duplicateResult.matchedFields,
          },
          { status: 409 },
        )
      }
    }

    console.log("No duplicates found, proceeding with application creation")

    // Creating application record...
    const applicationData = {
      ranking_id,
      applicant_name: resumeData.applicant_name,
      applicant_email: resumeData.applicant_email || `applicant-${Date.now()}@placeholder.com`,
      applicant_phone: resumeData.applicant_phone || null,
      applicant_city: resumeData.applicant_city || null,
      hr_name: hr_name.trim(),
      company_name: company_name.trim(),
      status: "pending",
      submitted_at: new Date().toISOString(),
      resume_summary: resumeData.resume_summary,
      key_skills: resumeData.key_skills,
      experience_years: resumeData.experience_years,
      education_level: resumeData.education_level,
      certifications: resumeData.certifications,
      ocr_transcript: resumeData.raw_text || null,
    }

    console.log("Application data to insert:", JSON.stringify(applicationData, null, 2))

    const requiredFields = ["ranking_id", "applicant_name", "status", "submitted_at", "hr_name", "company_name"]
    const missingFields = requiredFields.filter((field) => !applicationData[field])

    if (missingFields.length > 0) {
      console.error("Missing required fields for application:", missingFields)
      return NextResponse.json(
        {
          error: "Missing required application data",
          details: `Missing fields: ${missingFields.join(", ")}`,
        },
        { status: 400 },
      )
    }

    const { data: application, error: applicationError } = await supabase
      .from("applications")
      .insert(applicationData)
      .select()
      .single()

    if (applicationError) {
      console.error("Error creating application:", applicationError)
      console.error("Application error details:", JSON.stringify(applicationError, null, 2))

      if (applicationError.code === "23505") {
        return NextResponse.json(
          {
            error: "Duplicate application",
            details: "An application with this information already exists",
          },
          { status: 409 },
        )
      } else if (applicationError.code === "23503") {
        return NextResponse.json(
          {
            error: "Invalid ranking reference",
            details: "The specified ranking does not exist",
          },
          { status: 400 },
        )
      }

      return NextResponse.json(
        {
          error: "Failed to create application",
          details: applicationError.message,
          code: applicationError.code,
        },
        { status: 500 },
      )
    }

    console.log("Created application:", application.id)

    // Upload files to Supabase Storage
    const uploadedFiles: any[] = []

    for (const { file, category } of allFiles) {
      try {
        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          console.warn(`File ${file.name} exceeds size limit, skipping`)
          continue
        }

        const fileName = `applications/${application.id}/${category}/${Date.now()}-${file.name}`
        console.log(`Uploading file: ${fileName}`)

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("application-files")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) {
          console.error(`Error uploading file ${file.name}:`, uploadError)
          continue
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("application-files").getPublicUrl(fileName)

        const { data: fileRecord, error: fileError } = await supabase
          .from("application_files")
          .insert({
            application_id: application.id,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            file_url: publicUrl,
            file_category: category,
            uploaded_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (fileError) {
          console.error("Error saving file info:", fileError)
        } else {
          uploadedFiles.push(fileRecord)
          console.log(`Successfully uploaded: ${file.name}`)
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
      }
    }

    console.log(`Successfully uploaded ${uploadedFiles.length} files`)

    console.log("Starting automatic scoring process")
    try {
      const { directScoringService } = await import("@/lib/direct-scoring-service")

      console.log("Attempting to score application:", application.id)
      const scoringResult = await directScoringService.scoreApplication(application.id)

      if (scoringResult) {
        console.log("Application scored successfully")

        try {
          const { data: ranking } = await supabase
            .from("rankings")
            .select("title, created_by")
            .eq("id", ranking_id)
            .single()

          if (ranking?.created_by) {
            await supabase.from("notifications").insert({
              user_id: ranking.created_by,
              type: "application_submitted",
              title: "New Application Received",
              message: `${resumeData.applicant_name} has submitted an application for ${ranking.title} at ${company_name}`,
              data: {
                application_id: application.id,
                ranking_id: ranking_id,
                applicant_name: resumeData.applicant_name,
                company_name: company_name,
                hr_name: hr_name,
              },
            })
            console.log("Notification created for new application")
          }
        } catch (notificationError) {
          console.error("Failed to create notification:", notificationError)
          // Don't fail the entire application if notification fails
        }
      } else {
        console.error("Direct scoring failed: No result returned")
        // Don't fail the entire application if scoring fails
      }
    } catch (scoringError) {
      console.error("Scoring service error:", scoringError)
      // Continue without failing - scoring can be done manually later
    }

    return NextResponse.json(
      {
        message: "Application submitted successfully",
        application_id: application.id,
        extracted_info: {
          name: resumeData.applicant_name,
          email: resumeData.applicant_email || "Email not detected",
          phone: resumeData.applicant_phone || "Phone not detected",
          city: resumeData.applicant_city || "Location not detected",
        },
        company_info: {
          hr_name: hr_name,
          company_name: company_name,
        },
        uploaded_files: uploadedFiles.length,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error in applications API:", error)
    console.error("Error stack:", error.stack)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
