import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { simpleResumeParser } from "@/lib/simple-resume-parser"
import { duplicateDetectionService } from "@/lib/duplicate-detection"

export async function POST(request: NextRequest) {
  try {
    console.log("Starting application submission process")

    // Initialize Supabase client
    let supabase
    try {
      supabase = createClient()
      console.log("Supabase client created successfully")

      const { data: testQuery, error: testError } = await supabase.from("rankings").select("count").limit(1)
      if (testError) {
        console.error("Database connection test failed:", testError)
        return NextResponse.json(
          { error: "Database connection failed", details: testError.message },
          { status: 500 },
        )
      }
      console.log("Database connection verified")
    } catch (clientError: any) {
      console.error("Failed to create Supabase client:", clientError)
      return NextResponse.json(
        { error: "Database client initialization failed", details: clientError.message },
        { status: 500 },
      )
    }

    const formData = await request.formData()
    console.log("Processing application submission")

    const ranking_id = formData.get("ranking_id") as string
    const hr_name = (formData.get("hr_name") as string) || null
    const company_name = (formData.get("company_name") as string) || null

    if (!ranking_id) {
      console.error("Missing ranking ID")
      return NextResponse.json({ error: "Missing ranking ID" }, { status: 400 })
    }

    console.log("Ranking ID:", ranking_id)
    if (hr_name) console.log("HR Name:", hr_name)
    if (company_name) console.log("Company Name:", company_name)

    // --- Process uploaded files ---
    const fileEntries = Array.from(formData.entries()).filter(
      ([key]) => key.startsWith("file_") && !key.includes("_category"),
    )

    let resumeFile: { buffer: Buffer; name: string; type: string } | null = null
    const allFiles: { buffer: Buffer; name: string; type: string; category: string; index: string }[] = []

    for (const [key, file] of fileEntries) {
      if (typeof file === "object" && typeof (file as any).arrayBuffer === "function") {
        const index = key.split("_")[1]
        const category = (formData.get(`file_${index}_category`) as string) || "other"
        const arrayBuffer = await (file as any).arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const name = (file as any).name || "unknown"
        const type = (file as any).type || "application/octet-stream"

        allFiles.push({ buffer, name, type, category, index })
        if (category === "resume") {
          resumeFile = { buffer, name, type }
        }
      }
    }

    if (!resumeFile) {
      console.error("No resume file found")
      return NextResponse.json({ error: "Resume file is required" }, { status: 400 })
    }

    console.log(`Found ${allFiles.length} files, including resume: ${resumeFile.name}`)

    // --- Resume parsing ---
    let resumeData
    try {
      console.log("Starting resume parsing...")
      console.log("Resume file details:", {
        name: resumeFile.name,
        size: resumeFile.buffer.length,
        type: resumeFile.type,
      })

      resumeData = await simpleResumeParser.parseFromBuffer(
        resumeFile.buffer,
        resumeFile.name,
        resumeFile.type,
      )

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
    } catch (parseError: any) {
      console.error("Resume parsing failed:", parseError)
      return NextResponse.json(
        { error: "Failed to parse resume", details: parseError.message },
        { status: 500 },
      )
    }

    // --- Validate ranking ---
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

    // --- Duplicate detection ---
    console.log("Performing comprehensive duplicate detection...")
    const { data: existingApplications, error: fetchError } = await supabase
      .from("applications")
      .select("id, applicant_name, applicant_email, applicant_phone, applicant_city")
      .eq("ranking_id", ranking_id)

    if (fetchError) {
      console.error("Error fetching existing applications:", fetchError)
      return NextResponse.json(
        { error: "Failed to check for duplicates", details: fetchError.message },
        { status: 500 },
      )
    }

    if (existingApplications?.length > 0) {
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
        return NextResponse.json(
          {
            error: "Duplicate application detected",
            details: `A very similar application already exists for this position.`,
            confidence: duplicateResult.confidence,
            matchedFields: duplicateResult.matchedFields,
          },
          { status: 409 },
        )
      }
    }

    console.log("No duplicates found, proceeding with application creation")

    // --- Create application record ---
    const applicationData = {
      ranking_id,
      applicant_name: resumeData.applicant_name,
      applicant_email: resumeData.applicant_email || `applicant-${Date.now()}@placeholder.com`,
      applicant_phone: resumeData.applicant_phone || null,
      applicant_city: resumeData.applicant_city || null,
      hr_name: hr_name?.trim() || null,
      company_name: company_name?.trim() || null,
      status: "pending",
      submitted_at: new Date().toISOString(),
      resume_summary: resumeData.resume_summary,
      key_skills: resumeData.key_skills,
      experience_years: resumeData.experience_years,
      education_level: resumeData.education_level,
      certifications: resumeData.certifications,
      ocr_transcript: resumeData.raw_text || null,
    }

    const { data: application, error: applicationError } = await supabase
      .from("applications")
      .insert(applicationData)
      .select()
      .single()

    if (applicationError) {
      console.error("Error creating application:", applicationError)
      return NextResponse.json(
        { error: "Failed to create application", details: applicationError.message },
        { status: 500 },
      )
    }

    console.log("Created application:", application.id)

    // --- Upload files to Supabase Storage ---
    const uploadedFiles: any[] = []
    for (const { buffer, name, type, category } of allFiles) {
      try {
        if (buffer.length > 10 * 1024 * 1024) {
          console.warn(`File ${name} exceeds size limit, skipping`)
          continue
        }

        const fileName = `applications/${application.id}/${category}/${Date.now()}-${name}`
        console.log(`Uploading file: ${fileName}`)

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("application-files")
          .upload(fileName, buffer, {
            cacheControl: "3600",
            upsert: false,
            contentType: type,
          })

        if (uploadError) {
          console.error(`Error uploading file ${name}:`, uploadError)
          continue
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("application-files").getPublicUrl(fileName)

        const { data: fileRecord, error: fileError } = await supabase
          .from("application_files")
          .insert({
            application_id: application.id,
            file_name: name,
            file_type: type,
            file_size: buffer.length,
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
          console.log(`Successfully uploaded: ${name}`)
        }
      } catch (error: any) {
        console.error(`Error processing file ${name}:`, error)
      }
    }

    console.log(`Successfully uploaded ${uploadedFiles.length} files`)

    // --- Scoring & notifications ---
    console.log("Starting automatic scoring process")
    try {
      const { directScoringService } = await import("@/lib/direct-scoring-service")
      const scoringResult = await directScoringService.scoreApplication(application.id)

      if (scoringResult) {
        console.log("Application scored successfully")
        const { data: rankingInfo } = await supabase
          .from("rankings")
          .select("title, created_by")
          .eq("id", ranking_id)
          .single()

        if (rankingInfo?.created_by) {
          await supabase.from("notifications").insert({
            user_id: rankingInfo.created_by,
            type: "application_submitted",
            title: "New Application Received",
            message: `${resumeData.applicant_name} applied for ${rankingInfo.title}${
              company_name ? ` at ${company_name}` : ""
            }`,
            data: {
              application_id: application.id,
              ranking_id: ranking_id,
              applicant_name: resumeData.applicant_name,
              company_name,
              hr_name,
            },
          })
          console.log("Notification created for new application")
        }
      }
    } catch (scoringError) {
      console.error("Scoring service error:", scoringError)
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
        ...(company_name &&
          hr_name && {
            company_info: {
              hr_name,
              company_name,
            },
          }),
        uploaded_files: uploadedFiles.length,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Error in applications API:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    )
  }
}
