"use client"

import { useState, useEffect } from "react"
import { Mail, Send, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface EmailTest {
  type: string
  to: string
  subject: string
  status: "idle" | "sending" | "success" | "error"
  message?: string
  timestamp?: string
}

export default function EmailTestPage() {
  const [recipientEmail, setRecipientEmail] = useState("")
  const [customSubject, setCustomSubject] = useState("Test Email from HireRankerAI")
  const [customMessage, setCustomMessage] = useState("This is a test email sent from the Brevo email service.")
  const [tests, setTests] = useState<EmailTest[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [brevoConfig, setBrevoConfig] = useState<any>(null)
  const [loadingConfig, setLoadingConfig] = useState(false)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`])
  }

  const checkBrevoConfig = async () => {
    setLoadingConfig(true)
    addLog("Checking Brevo configuration...")
    try {
      const response = await fetch('/api/test-email', {
        method: 'GET',
      })
      const data = await response.json()
      setBrevoConfig(data)
      addLog("✓ Brevo configuration loaded")
      console.log('[v0] 📋 Brevo Configuration:', data)
    } catch (error) {
      console.error('[v0] ❌ Error checking Brevo config:', error)
      addLog("✗ Failed to load Brevo configuration")
    } finally {
      setLoadingConfig(false)
    }
  }

  useEffect(() => {
    checkBrevoConfig()
  }, [])

  const updateTestStatus = (type: string, status: "idle" | "sending" | "success" | "error", message?: string) => {
    setTests((prev) =>
      prev.map((test) =>
        test.type === type
          ? { ...test, status, message, timestamp: new Date().toLocaleTimeString() }
          : test
      )
    )
  }

  const sendTestEmail = async (type: string) => {
    if (!recipientEmail) {
      addLog("Error: Please enter a recipient email address")
      return
    }

    const emailTest: EmailTest = {
      type,
      to: recipientEmail,
      subject: customSubject,
      status: "sending",
    }

    setTests((prev) => {
      const filtered = prev.filter((t) => t.type !== type)
      return [...filtered, emailTest]
    })

    addLog(`Sending ${type} email to ${recipientEmail}...`)
    updateTestStatus(type, "sending")

    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          to: recipientEmail,
          subject: customSubject,
          message: customMessage,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        updateTestStatus(type, "success", data.message)
        addLog(`✓ ${type} email sent successfully`)
      } else {
        updateTestStatus(type, "error", data.error || "Failed to send email")
        addLog(`✗ ${type} email failed: ${data.error}`)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error"
      updateTestStatus(type, "error", errorMsg)
      addLog(`✗ ${type} email error: ${errorMsg}`)
    }
  }

  const emailTemplates = [
    {
      id: "verification",
      name: "Verification Email",
      description: "Test the email verification flow",
    },
    {
      id: "password-reset",
      name: "Password Reset",
      description: "Test password reset email with verification code",
    },
    {
      id: "interview-invitation",
      name: "Interview Invitation",
      description: "Test interview invitation email",
    },
    {
      id: "application-status",
      name: "Application Status",
      description: "Test application status notification",
    },
    {
      id: "custom",
      name: "Custom Email",
      description: "Send a custom test email",
    },
  ]

  const getStatusIcon = (status: EmailTest["status"]) => {
    switch (status) {
      case "sending":
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const resetTests = () => {
    setTests([])
    setLogs([])
    addLog("Tests reset")
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Email Service Test</h1>
          <p className="text-muted-foreground">Test the Brevo email integration and email templates</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Brevo Configuration</h2>
            <Button
              onClick={checkBrevoConfig}
              disabled={loadingConfig}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loadingConfig ? 'animate-spin' : ''}`} />
              {loadingConfig ? 'Checking...' : 'Refresh'}
            </Button>
          </div>
          
          {brevoConfig && (
            <div className="space-y-4">
              {brevoConfig.account?.success && (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 rounded-lg">
                  <h3 className="text-emerald-700 dark:text-emerald-400 font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Account Connected
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Email: {brevoConfig.account.account?.email || 'N/A'}
                  </p>
                </div>
              )}
              
              {brevoConfig.senders?.success && (
                <div className="bg-background border border-border p-4 rounded-lg">
                  <h3 className="text-foreground font-semibold mb-3">Verified Senders</h3>
                  {brevoConfig.senders.senders?.length > 0 ? (
                    <ul className="space-y-2">
                      {brevoConfig.senders.senders.map((sender: any, idx: number) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          <span className="font-medium">{sender.name}</span>
                          <span className="text-xs">({sender.email})</span>
                          {sender.active && <span className="text-xs text-emerald-500">[Active]</span>}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 rounded">
                      <p className="text-amber-700 dark:text-amber-400 text-sm flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        No verified senders found. Please verify a sender email in your Brevo account.
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {brevoConfig.note && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                  <p className="text-blue-700 dark:text-blue-300 text-sm">{brevoConfig.note}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Email Configuration */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Configuration
          </h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipient" className="text-sm font-medium text-foreground">
                Recipient Email
              </Label>
              <Input
                id="recipient"
                type="email"
                placeholder="test@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="subject" className="text-sm font-medium text-foreground">
                Email Subject
              </Label>
              <Input
                id="subject"
                type="text"
                placeholder="Test Email Subject"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="message" className="text-sm font-medium text-foreground">
                Email Message
              </Label>
              <Textarea
                id="message"
                placeholder="Enter your test email message..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Email Templates */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Email Templates</h2>
            <Button onClick={resetTests} variant="outline" size="sm" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Reset Tests
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emailTemplates.map((template) => {
              const test = tests.find((t) => t.type === template.id)
              return (
                <div key={template.id} className="bg-background border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-foreground">{template.name}</h3>
                    {test && getStatusIcon(test.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                  <Button
                    onClick={() => sendTestEmail(template.id)}
                    disabled={!recipientEmail || test?.status === "sending"}
                    size="sm"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {test?.status === "sending" ? "Sending..." : "Send Test"}
                  </Button>
                  {test?.message && (
                    <p
                      className={`text-xs mt-2 ${
                        test.status === "success" ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {test.message}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Test Results</h2>
          {tests.length === 0 ? (
            <p className="text-muted-foreground text-sm">No tests run yet. Send a test email to see results.</p>
          ) : (
            <div className="space-y-2">
              {tests.map((test, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded border ${
                    test.status === "success"
                      ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
                      : test.status === "error"
                        ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                        : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <p className="font-medium text-sm text-foreground">{test.type}</p>
                      <p className="text-xs text-muted-foreground">To: {test.to}</p>
                    </div>
                  </div>
                  {test.timestamp && <span className="text-xs text-muted-foreground">{test.timestamp}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Event Logs */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Event Logs</h2>
            <button
              onClick={() => setLogs([])}
              className="text-xs px-3 py-1 rounded bg-background hover:bg-muted text-foreground"
            >
              Clear Logs
            </button>
          </div>
          <div className="bg-background rounded-lg p-4 h-64 overflow-y-auto font-mono text-xs text-muted-foreground space-y-1">
            {logs.length === 0 ? (
              <p className="text-muted-foreground/50">No logs yet. Send a test email to see logs.</p>
            ) : (
              logs.map((log, i) => <div key={i}>{log}</div>)
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-sm text-blue-800 dark:text-blue-200">
          <h3 className="font-semibold mb-2">How to use this test page:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Check the Brevo Configuration section to verify your sender email is verified</li>
            <li>Enter your email address in the "Recipient Email" field</li>
            <li>Customize the subject and message if desired</li>
            <li>Click "Send Test" on any email template to test that specific email type</li>
            <li>Check your inbox for the test emails</li>
            <li>Monitor the Test Results section for success/failure status</li>
            <li>View detailed logs in the Event Logs section</li>
            <li>Use the "Reset Tests" button to clear all test results and start fresh</li>
          </ol>
        </div>
      </div>
    </main>
  )
}
