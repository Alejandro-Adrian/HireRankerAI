"use client"

import React, { useEffect, useRef, useState } from "react"
import { Send, Loader2, X, HelpCircle } from 'lucide-react'

type EonState = "neutral" | "thinking" | "answering"

interface AIChatbotProps {
  onClose?: () => void
}

export default function AIChatbot({ onClose }: AIChatbotProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [eonState, setEonState] = useState<EonState>("neutral")
  const [loading, setLoading] = useState(false)
  const [showFAQ, setShowFAQ] = useState(false)
  const [typingMessage, setTypingMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
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
  }, [messages, typingMessage])

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

  const typeMessage = (text: string) => {
    return new Promise<void>((resolve) => {
      setIsTyping(true)
      setTypingMessage("")
      let index = 0
      
      const interval = setInterval(() => {
        if (index < text.length) {
          setTypingMessage(text.slice(0, index + 1))
          index++
        } else {
          clearInterval(interval)
          setIsTyping(false)
          resolve()
        }
      }, 20) // 20ms per character for smooth typing
    })
  }

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
      const aiResponse = data.response

      setEonState("answering")
      await typeMessage(aiResponse)
      
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: aiResponse },
      ])
      setTypingMessage("")
      
      setTimeout(() => setEonState("neutral"), 1500)
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
    setTypingMessage("")
    setIsTyping(false)
  }

  return (
    <div 
      ref={containerRef}
      className="h-full w-full flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden border-l border-slate-700/50"
    >
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-4 border-b border-slate-700/50">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-white">HR Assistant</h2>
          <p className="text-xs text-slate-400 mt-1">Quick help & support</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFAQ(!showFAQ)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            title="Show FAQ"
          >
            <HelpCircle className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            title="Close chatbot"
          >
            <X className="w-5 h-5 text-slate-400 hover:text-white" />
          </button>
        </div>
      </div>

      {/* Background mascot */}
      <div 
        className="absolute inset-0 pointer-events-none flex items-end justify-center opacity-8 z-0"
        style={{
          backgroundImage: `url('${eonImage}')`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "45%",
          backgroundPosition: "center bottom",
        }}
      />

      {/* Messages container */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden min-h-0">
        {showFAQ ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <p className="text-xs text-slate-400 mb-4 sticky top-0 bg-gradient-to-b from-slate-950 to-transparent pb-2">
              Quick Questions
            </p>
            <div className="space-y-2">
              {faqData.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-lg p-3 cursor-pointer hover:bg-slate-800/60 hover:border-slate-600/70 transition-all duration-200 text-sm"
                  onClick={() => {
                    setMessage(item.q)
                    setShowFAQ(false)
                  }}
                >
                  <p className="font-semibold text-blue-400 mb-1 line-clamp-1">{item.q}</p>
                  <p className="text-xs text-slate-300 line-clamp-1">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-sm text-slate-300 mb-2 font-semibold">Welcome!</p>
                  <p className="text-xs text-slate-500">Ask about rankings, interviews & more</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`rounded-lg px-4 py-3 text-sm leading-relaxed break-words whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white max-w-[85%]"
                          : "bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 text-slate-100 w-full"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isTyping && typingMessage && (
                  <div className="flex justify-start">
                    <div className="rounded-lg px-4 py-3 text-sm leading-relaxed break-words whitespace-pre-wrap bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 text-slate-100 w-full">
                      {typingMessage}
                      <span className="inline-block w-1 h-4 bg-blue-400 ml-1 animate-pulse" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        )}
      </div>

      {/* Input section */}
      <div className="flex-shrink-0 relative z-20 px-4 py-3 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-950/50 border-t border-slate-700/50">
        <div className="flex gap-2 items-end">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask anything..."
            className="flex-1 glass rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-slate-800/50 transition-all duration-200"
            onKeyDown={onKeyDown}
            disabled={loading || isTyping}
          />
          
          <button
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-red-600/40 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400 hover:text-red-400 transition-colors flex-shrink-0"
            onClick={() => setMessage("")}
            disabled={!message.trim() || loading || isTyping}
            title="Clear input"
          >
            <X className="w-4 h-4" />
          </button>

          <button
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors flex-shrink-0"
            onClick={sendMessage}
            disabled={loading || !message.trim() || isTyping}
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
    </div>
  )
}
