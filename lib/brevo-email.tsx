// Brevo Email Service using direct REST API calls
// This implementation uses Brevo's REST API directly instead of the SDK to avoid build issues

// Hardcoded Brevo API key (free public key)
const BREVO_API_KEY = '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'
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

// For Brevo free accounts, you need to verify your sender email first
// Common default is to use the email associated with your Brevo account
const DEFAULT_SENDER_EMAIL = "adrianalejandro052004@gmail.com" // Change this to your verified sender email
const DEFAULT_SENDER_NAME = "HireRankerAI"

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  senderName?: string
  senderEmail?: string
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
    text,
    senderName = DEFAULT_SENDER_NAME, 
    senderEmail = DEFAULT_SENDER_EMAIL 
  } = options

  try {
    console.log("[v0] 🚀 Starting email send via Brevo API...")
    console.log("[v0] 📧 From:", senderEmail)
    console.log("[v0] 📧 To:", to)
    console.log("[v0] 📝 Subject:", subject)

    // Brevo API request body
    const requestBody = {
      sender: {
        name: senderName,
        email: senderEmail
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
    
    const response = await fetch('https://api.brevo.com/v3/account', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY
      }
    })

    const responseText = await response.text()
    console.log("[v0] 📥 Account info response:", responseText)

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to get account info: ${responseText}`
      }
    }

    const data = JSON.parse(responseText)
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
    
    const response = await fetch('https://api.brevo.com/v3/senders', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY
      }
    })

    const responseText = await response.text()
    console.log("[v0] 📥 Senders response:", responseText)

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to get senders: ${responseText}`
      }
    }

    const data = JSON.parse(responseText)
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
