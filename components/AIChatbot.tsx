"use client"

import React, { useEffect, useRef, useState } from "react"
import { Send, Loader2, X } from 'lucide-react'

type EonState = "neutral" | "thinking" | "answering"

export default function AIChatbot() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [eonState, setEonState] = useState<EonState>("neutral")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const eonImage =
    eonState === "neutral"
      ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ai_neutral-gadZ12IIivX6wr5sn8IsHGA80h9Rnk.png"
      : eonState === "thinking"
      ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ai_thinking-IAoyFn80CoMzgiZSo1NzjlGUA893eA.png"
      : "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ai_answering-M0HtFa32899gg2Tmj6FMTUMW9NUMj4.png"

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
      const aiResponse = data.response.slice(0, 150)

      setMessages([
        ...updatedMessages,
        { role: "assistant", content: aiResponse },
      ])
      setEonState("answering")
      
      // Return to neutral after 3 seconds
      setTimeout(() => setEonState("neutral"), 3000)
    } catch (error) {
      console.error("[v0] Chat error:", error)
      const errorMsg = "Sorry, try again."
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
        <button
          onClick={clearChat}
          className="p-1 hover:bg-slate-700 rounded transition-colors"
          title="Clear conversation"
        >
          <X className="w-4 h-4 text-slate-400 hover:text-white" />
        </button>
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

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-800/30">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-slate-400 text-center">
              Ask me about rankings, applications, or interviews
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
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${
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

      <div className="flex-shrink-0 flex gap-2 p-3 bg-slate-900/50 border-t border-slate-700">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask..."
          className="flex-1 rounded-full px-3 py-2 text-xs bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          onKeyDown={onKeyDown}
          disabled={loading}
          maxLength={100}
        />
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
