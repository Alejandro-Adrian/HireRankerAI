"use client"

import React, { useEffect, useRef, useState } from "react"
import { Send, Loader2, X, HelpCircle } from 'lucide-react'

type EonState = "neutral" | "thinking" | "answering"

export default function AIChatbot() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [eonState, setEonState] = useState<EonState>("neutral")
  const [loading, setLoading] = useState(false)
  const [showFAQ, setShowFAQ] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const eonImage =
    eonState === "neutral"
      ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ai_neutral-gadZ12IIivX6wr5sn8IsHGA80h9Rnk.png"
      : eonState === "thinking"
      ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ai_thinking-IAoyFn80CoMzgiZSo1NzjlGUA893eA.png"
      : "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ai_answering-M0HtFa32899gg2Tmj6FMTUMW9NUMj4.png"

  const faqData = [
    { q: "How do I create a new ranking?", a: "Go to Rankings tab → Click 'Create New' → Select job position → Add criteria and weights → Review and save." },
    { q: "How do I schedule an interview?", a: "Select candidate → Click 'Schedule Interview' → Choose date/time → Add interview type → Send invitation." },
    { q: "How do I upload resumes?", a: "Click 'Upload Resumes' → Drag & drop PDF/DOC files → System auto-extracts candidate info → Review and save." },
    { q: "How do I score applications?", a: "Open ranking → View applications → Click score icon → Rate against criteria → AI calculates total score." },
    { q: "How do video interviews work?", a: "Schedule interview → Candidate receives link → Join call → AI records & transcribes → Get auto-generated summary." },
    { q: "Can I export results?", a: "Yes! In Results tab → Click 'Export' → Choose CSV or PDF → Download ranking with all scores." },
    { q: "How is the final rank calculated?", a: "Each criterion gets a score (1-10) × weight → Total = sum of weighted scores → Candidates sorted automatically." },
    { q: "Can I edit a ranking after creation?", a: "Yes, click the ranking → Edit tab → Modify criteria/weights → Save changes (re-scoring recommended)." },
    { q: "How do I delete a ranking or application?", a: "Open ranking/application → Click 3-dot menu → Select 'Delete' → Confirm action (irreversible)." },
    { q: "What happens during a video interview?", a: "Host and candidate join → AI records conversation → Deepgram transcribes audio → Grok generates summary." },
    { q: "How do I reset my password?", a: "Click 'Forgot Password' on login → Enter email → Verify with code sent to inbox → Create new password." },
    { q: "Can I undo a decision (approve/reject)?", a: "No, approval/rejection is final. You'll need to recreate the ranking to change candidate status." },
    { q: "How do I invite multiple candidates?", a: "Select ranking → Use checkboxes to select candidates → Click 'Bulk Invite' → Confirm sending." },
    { q: "What video platform is used?", a: "We use VideoSDK for video calls. You don't need additional software—just a browser and webcam." },
    { q: "Can I see interview analytics?", a: "Yes! Analytics tab shows rankings performance, completion rates, time data, and scoring trends." },
    { q: "How do I change my profile settings?", a: "Click your avatar → Settings → Update name, email, password, or preferences → Save changes." },
    { q: "Can I delete my account?", a: "Go to Settings → Scroll to 'Delete Account' → Confirm with verification code → Account removed (cannot restore)." },
    { q: "How do I share rankings with my team?", a: "Currently for individual use. Contact support for team collaboration features." },
    { q: "What's the maximum file size for resumes?", a: "5MB per file. Supported formats: PDF, DOC, DOCX. Larger files may be rejected." },
    { q: "How long does transcription take?", a: "Usually 2-5 minutes after interview ends. You'll get a notification when ready." },
    { q: "Can I host multiple interviews simultaneously?", a: "Yes! Create separate video sessions. You can manage them independently." },
    { q: "How do I know if a candidate accepted the interview?", a: "Check video session details → See RSVP status → Green = accepted, Gray = pending." },
    { q: "What if audio doesn't record?", a: "Check microphone permissions in browser settings → Refresh page → Try again. Contact support if issue persists." },
    { q: "Can I resend an interview invitation?", a: "Yes! Open video session → Click candidate name → 'Resend Invitation' → Email sent." },
    { q: "How do I filter applications by status?", a: "Rankings tab → Click filter icon → Select status (New, Reviewing, Approved, Rejected) → Apply filter." },
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    localStorage.setItem("chatbot-history", JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    const saved = localStorage.getItem("chatbot-history")
    if (saved) {
      try {
        setMessages(JSON.parse(saved))
      } catch (e) {
        console.error("[v0] Failed to load chat history:", e)
      }
    }
  }, [])

  const sendMessage = async () => {
    const trimmed = message.trim()
    if (!trimmed || loading) return

    setMessage("")
    setEonState("thinking")
    setLoading(true)

    const userMessage = { role: "user", content: trimmed }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)

    try {
      const response = await fetch("/api/grok-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages,
        }),
      })

      if (!response.ok) {
        throw new Error("Chat request failed")
      }

      const data = await response.json()
      const aiResponse = data.response.slice(0, 200)

      setMessages([
        ...updatedMessages,
        { role: "assistant", content: aiResponse },
      ])
      setEonState("answering")
      
      setTimeout(() => setEonState("neutral"), 3000)
    } catch (error) {
      console.error("[v0] Chat error:", error)
      const errorMsg = "I couldn't process that. Try rephrasing or check the FAQ for quick answers."
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: errorMsg },
      ])
      setEonState("neutral")
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    localStorage.removeItem("chatbot-history")
    setEonState("neutral")
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-full flex flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-2xl"
      style={{ maxHeight: "500px" }}
    >
      <div className="flex items-center justify-between p-4 bg-slate-900/50 border-b border-slate-700">
        <h3 className="text-white font-semibold text-sm">HR Assistant</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFAQ(!showFAQ)}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
            title="Show FAQ"
          >
            <HelpCircle className="w-4 h-4 text-slate-400 hover:text-white" />
          </button>
          <button
            onClick={clearChat}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
            title="Clear conversation"
          >
            <X className="w-4 h-4 text-slate-400 hover:text-white" />
          </button>
        </div>
      </div>

      <div 
        className="flex-shrink-0 relative h-32 bg-gradient-to-b from-slate-800 to-slate-850 flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url('${eonImage}')`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          backgroundPosition: "center",
        }}
      />

      {showFAQ ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-800/30">
          <p className="text-xs text-slate-400 mb-3 sticky top-0">Quick reference — Common questions:</p>
          {faqData.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-700/50 rounded-lg p-2 cursor-pointer hover:bg-slate-700 transition-colors"
              onClick={() => {
                setMessage(item.q)
                setShowFAQ(false)
              }}
            >
              <p className="text-xs font-semibold text-blue-300 mb-1">{item.q}</p>
              <p className="text-xs text-slate-300 line-clamp-2">{item.a}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-800/30">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-xs text-slate-400 text-center">
                Ask me about rankings, applications, interviews, or scoring
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-700 text-slate-100"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      )}

      <div className="flex-shrink-0 flex gap-2 p-3 bg-slate-900/50 border-t border-slate-700">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={showFAQ ? "Select a question or type..." : "Ask..."}
          className="flex-1 rounded-full px-3 py-2 text-xs bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          onKeyDown={onKeyDown}
          disabled={loading}
          maxLength={100}
        />
        <button
          className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white px-2 py-2 rounded-full transition-colors flex-shrink-0"
          onClick={() => setMessage("")}
          disabled={!message.trim()}
          title="Clear input"
        >
          <X className="w-4 h-4" />
        </button>
        <button
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-2 rounded-full transition-colors flex-shrink-0"
          onClick={sendMessage}
          disabled={loading || !message.trim()}
          title="Send message"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  )
}
