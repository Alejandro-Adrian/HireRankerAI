"use client"
import { useParams, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"

export default function VideoCallPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const meetingId = params.meetingId as string
  const role = searchParams.get("role") || "participant"

  const [roomUrl, setRoomUrl] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeRoom = async () => {
      try {
        const response = await fetch("/api/jitsi/rooms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ meetingId, isHost: role === "host" }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to create room")
        }

        setRoomUrl(data.roomUrl)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    initializeRoom()
  }, [meetingId, role])

  const copyMeetingLink = () => {
    const participantLink = `${window.location.origin}/video-call/${meetingId}`
    navigator.clipboard.writeText(participantLink)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Setting up your meeting...</h2>
          <p className="text-gray-400">Please wait</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Unable to join meeting</h2>
            <p className="text-red-200 mb-6">{error}</p>
            <button
              onClick={() => (window.location.href = "/dashboard")}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700 flex-shrink-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg md:text-xl font-bold truncate">
            Interview Session ({role === "host" ? "Host" : "Participant"})
          </h1>
          <p className="text-gray-400 text-xs md:text-sm truncate">Meeting ID: {meetingId}</p>
        </div>
        <div className="flex gap-2 ml-4">
          {role === "host" && (
            <button
              onClick={copyMeetingLink}
              className="px-3 py-2 md:px-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-xs md:text-sm font-medium whitespace-nowrap"
            >
              Copy Link
            </button>
          )}
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="px-3 py-2 md:px-4 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-xs md:text-sm font-medium whitespace-nowrap"
          >
            End Call
          </button>
        </div>
      </div>

      <div className="flex-1 relative bg-black">
        <iframe
          src={roomUrl}
          className="absolute inset-0 w-full h-full"
          style={{ border: "none" }}
          allow="camera; microphone; fullscreen; speaker; display-capture; autoplay; clipboard-read; clipboard-write"
          allowFullScreen
          title="Video Conference"
        />
      </div>
    </div>
  )
}
