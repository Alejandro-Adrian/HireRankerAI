"use client"
import { useState, useEffect } from "react"
import { Bell, CheckCheck, AlertCircle, Info, CheckCircle, Calendar, Users, TrendingUp } from "lucide-react"
import { createPortal } from "react-dom"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  data?: any
  read: boolean
  created_at: string
}

interface NotificationCenterProps {
  user: any
}

export default function NotificationCenter({ user }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notificationButtonRef, setNotificationButtonRef] = useState<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (user) {
      fetchNotifications()
      // Set up polling for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "POST",
      })

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif)),
        )
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      })

      if (response.ok) {
        setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "application_submitted":
        return <Users className="h-4 w-4" />
      case "ranking_created":
        return <CheckCircle className="h-4 w-4" />
      case "application_scored":
        return <TrendingUp className="h-4 w-4" />
      case "high_score_application":
        return <AlertCircle className="h-4 w-4" />
      case "interview_scheduled":
        return <Calendar className="h-4 w-4" />
      case "bulk_operation_complete":
        return <CheckCheck className="h-4 w-4" />
      case "ranking_updated":
        return <Info className="h-4 w-4" />
      case "system_alert":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "application_submitted":
        return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
      case "ranking_created":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
      case "application_scored":
        return "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20"
      case "high_score_application":
        return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20"
      case "interview_scheduled":
        return "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20"
      case "bulk_operation_complete":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
      case "ranking_updated":
        return "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
      case "system_alert":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
      default:
        return "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20"
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <>
      <div className="relative">
        <button
          ref={setNotificationButtonRef}
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 sm:p-3 glass-emerald hover-glow rounded-xl transition-all duration-300 group"
        >
          <Bell className="h-5 w-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-200" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center animate-pulse-emerald font-semibold">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {showNotifications &&
          notificationButtonRef &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              className="fixed w-80 sm:w-96 glass-emerald border border-emerald-200/20 dark:border-emerald-800/20 rounded-2xl shadow-2xl z-[99999] animate-scale-in max-h-[80vh] flex flex-col"
              style={{
                top: `${notificationButtonRef.getBoundingClientRect().bottom + 8}px`,
                right: `${window.innerWidth - notificationButtonRef.getBoundingClientRect().right}px`,
              }}
            >
              <div className="p-4 sm:p-6 border-b border-emerald-200/20 dark:border-emerald-800/20 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white font-work-sans">Notifications</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-open-sans">
                      {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all duration-200"
                    >
                      <CheckCheck className="h-3 w-3" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-center">
                    <div className="w-8 h-8 border-2 border-emerald-200 dark:border-emerald-800 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 dark:text-slate-400 font-open-sans">
                    <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No notifications yet</p>
                    <p className="text-xs mt-1">We'll notify you when something happens</p>
                  </div>
                ) : (
                  notifications.map((notification, index) => (
                    <div
                      key={notification.id}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                      className={`p-4 sm:p-6 border-b border-emerald-100/50 dark:border-emerald-800/20 cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all duration-300 animate-fade-in-up ${
                        !notification.read ? "bg-emerald-50/30 dark:bg-emerald-900/10" : ""
                      }`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)} flex-shrink-0`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p
                                className={`text-sm ${!notification.read ? "font-semibold" : "font-medium"} text-slate-900 dark:text-slate-100 font-work-sans`}
                              >
                                {notification.title}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400 font-open-sans mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-500 font-open-sans mt-2">
                                {formatTimeAgo(notification.created_at)}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-1 animate-pulse-emerald"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>,
            document.body,
          )}
      </div>

      {showNotifications &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[99998]" onClick={() => setShowNotifications(false)}></div>,
          document.body,
        )}
    </>
  )
}
