// Brevo Email Service using direct REST API calls
// This implementation uses Brevo's REST API directly instead of the SDK to avoid build issues

const BREVO_API_KEY = process.env.BREVO_API_KEY || ''
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

// Hardcoded sender configuration - these are verified in Brevo account
const DEFAULT_SENDER_EMAIL = "adrianalejandro052004@gmail.com"
const DEFAULT_SENDER_NAME = "HireRankerAI"

if (!BREVO_API_KEY) {
  console.error("[v0] ❌ BREVO_API_KEY environment variable is not set!")
}
console.log("[v0] 🔧 Brevo Configuration:")
console.log("[v0] 📧 Sender Email:", DEFAULT_SENDER_EMAIL)
console.log("[v0] 📧 Sender Name:", DEFAULT_SENDER_NAME)
console.log("[v0] 🔑 API Key exists:", !!BREVO_API_KEY)

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

interface BrevoResponse {
  messageId?: string
  message?: string
}

export async function sendEmailViaBrevo(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { 
    to, 
    subject, 
    html, 
    text
  } = options

  if (!BREVO_API_KEY) {
    const error = "BREVO_API_KEY environment variable is not set"
    console.error("[v0] ❌", error)
    return {
      success: false,
      error
    }
  }

  try {
    console.log("[v0] 🚀 Starting email send via Brevo API...")
    console.log("[v0] 📧 From:", DEFAULT_SENDER_EMAIL)
    console.log("[v0] 📧 To:", to)
    console.log("[v0] 📝 Subject:", subject)

    // Brevo API request body
    const requestBody = {
      sender: {
        name: DEFAULT_SENDER_NAME,
        email: DEFAULT_SENDER_EMAIL
      },
      to: [
        {
          email: to
        }
      ],
      subject: subject,
      htmlContent: html,
      ...(text && { textContent: text })
    }

    console.log("[v0] 📤 Sending request to Brevo API...")
    console.log("[v0] 📋 Request body:", JSON.stringify(requestBody, null, 2))

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    const responseText = await response.text()
    console.log("[v0] 📥 Brevo API response status:", response.status)
    console.log("[v0] 📥 Brevo API response body:", responseText)

    if (!response.ok) {
      console.error("[v0] ❌ Brevo API error:", responseText)
      
      let errorMessage = `Brevo API error (${response.status}): ${responseText}`
      try {
        const errorData = JSON.parse(responseText)
        if (errorData.message) {
          errorMessage = `Brevo API error: ${errorData.message}`
        }
        if (errorData.code) {
          errorMessage += ` (Code: ${errorData.code})`
        }
      } catch (e) {
        // Keep original error message if parsing fails
      }
      
      return {
        success: false,
        error: errorMessage
      }
    }

    let data: BrevoResponse
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error("[v0] ❌ Failed to parse Brevo response:", e)
      return {
        success: false,
        error: "Failed to parse Brevo API response"
      }
    }

    console.log("[v0] ✅ Email sent successfully via Brevo API!")
    console.log("[v0] 📬 Message ID:", data.messageId)

    return {
      success: true,
      messageId: data.messageId
    }
  } catch (error: any) {
    console.error("[v0] ❌ Brevo email sending failed:", error)
    return {
      success: false,
      error: error.message || "Unknown error sending email via Brevo"
    }
  }
}

export async function testBrevoConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("[v0] 🔍 Testing Brevo API connection...")

    const result = await sendEmailViaBrevo({
      to: "test@example.com",
      subject: "Brevo Connection Test",
      html: "<p>Testing Brevo API connection from HireRankerAI</p>",
      text: "Testing Brevo API connection from HireRankerAI"
    })

    if (result.success) {
      console.log("[v0] ✅ Brevo API connection test successful")
      return { success: true }
    } else {
      console.error("[v0] ❌ Brevo API connection test failed:", result.error)
      return { success: false, error: result.error }
    }
  } catch (error) {
    console.error("[v0] ❌ Brevo API connection test failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}

export async function getBrevoAccountInfo(): Promise<{ success: boolean; account?: any; error?: string }> {
  try {
    console.log("[v0] 🔍 Fetching Brevo account information...")
    
    if (!BREVO_API_KEY) {
      console.error("[v0] ❌ BREVO_API_KEY is not set")
      return {
        success: false,
        error: "BREVO_API_KEY environment variable is not set. Please add it to your environment variables."
      }
    }
    
    const response = await fetch('https://api.brevo.com/v3/account', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY
      }
    })

    const responseText = await response.text()
    console.log("[v0] 📥 Account info response status:", response.status)
    console.log("[v0] 📥 Account info response:", responseText)

    if (!response.ok) {
      let errorMessage = `API returned ${response.status}`
      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.message || errorData.error || errorMessage
        console.error("[v0] ❌ Brevo API Error:", JSON.stringify(errorData, null, 2))
      } catch (e) {
        console.error("[v0] ❌ Brevo API Error (raw):", responseText)
      }
      
      return {
        success: false,
        error: `Failed to get account info: ${errorMessage}`
      }
    }

    const data = JSON.parse(responseText)
    console.log("[v0] ✅ Brevo account info fetched successfully")
    return {
      success: true,
      account: data
    }
  } catch (error) {
    console.error("[v0] ❌ Failed to get Brevo account info:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}

export async function getBrevoSenders(): Promise<{ success: boolean; senders?: any[]; error?: string }> {
  try {
    console.log("[v0] 🔍 Fetching Brevo senders...")
    
    if (!BREVO_API_KEY) {
      console.error("[v0] ❌ BREVO_API_KEY is not set")
      return {
        success: false,
        error: "BREVO_API_KEY environment variable is not set. Please add it to your environment variables."
      }
    }
    
    const response = await fetch('https://api.brevo.com/v3/senders', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY
      }
    })

    const responseText = await response.text()
    console.log("[v0] 📥 Senders response status:", response.status)
    console.log("[v0] 📥 Senders response:", responseText)

    if (!response.ok) {
      let errorMessage = `API returned ${response.status}`
      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.message || errorData.error || errorMessage
        console.error("[v0] ❌ Brevo API Error:", JSON.stringify(errorData, null, 2))
      } catch (e) {
        console.error("[v0] ❌ Brevo API Error (raw):", responseText)
      }
      
      return {
        success: false,
        error: `Failed to get senders: ${errorMessage}`
      }
    }

    const data = JSON.parse(responseText)
    console.log("[v0] ✅ Brevo senders fetched successfully:", data.senders?.length || 0, "senders")
    return {
      success: true,
      senders: data.senders || []
    }
  } catch (error) {
    console.error("[v0] ❌ Failed to get Brevo senders:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}
