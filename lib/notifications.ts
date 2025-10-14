import { createAdminClient } from "@/lib/supabase/server"

export interface NotificationData {
  user_id: string
  type: string
  title: string
  message: string
  data?: any
}

export class NotificationService {
  private static async getSupabaseClient() {
    return createAdminClient()
  }

  static async createNotification(notification: NotificationData) {
    try {
      const supabase = await this.getSupabaseClient()

      const { data, error } = await supabase.from("notifications").insert([notification]).select().single()

      if (error) {
        console.error("Error creating notification:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error in createNotification:", error)
      return null
    }
  }

  static async getUserNotifications(userId: string, limit = 50) {
    try {
      const supabase = await this.getSupabaseClient()

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Error fetching notifications:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error in getUserNotifications:", error)
      return []
    }
  }

  static async markAsRead(notificationId: string) {
    try {
      const supabase = await this.getSupabaseClient()

      const { error } = await supabase
        .from("notifications")
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq("id", notificationId)

      if (error) {
        console.error("Error marking notification as read:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error in markAsRead:", error)
      return false
    }
  }

  static async markAllAsRead(userId: string) {
    try {
      const supabase = await this.getSupabaseClient()

      const { error } = await supabase
        .from("notifications")
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("read", false)

      if (error) {
        console.error("Error marking all notifications as read:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error in markAllAsRead:", error)
      return false
    }
  }

  // Specific notification creators for different events
  static async notifyApplicationSubmitted(
    userId: string,
    applicantName: string,
    position: string,
    rankingTitle: string,
  ) {
    return this.createNotification({
      user_id: userId,
      type: "application_submitted",
      title: "New Application Received",
      message: `${applicantName} has applied for the ${position} position in "${rankingTitle}"`,
      data: { applicantName, position, rankingTitle },
    })
  }

  static async notifyRankingCreated(userId: string, rankingTitle: string, position: string) {
    return this.createNotification({
      user_id: userId,
      type: "ranking_created",
      title: "Ranking Created Successfully",
      message: `Your ranking "${rankingTitle}" for ${position} is now active and accepting applications`,
      data: { rankingTitle, position },
    })
  }

  static async notifyApplicationScored(userId: string, applicantName: string, score: number, rankingTitle: string) {
    return this.createNotification({
      user_id: userId,
      type: "application_scored",
      title: "Application Automatically Scored",
      message: `${applicantName}'s application for "${rankingTitle}" has been scored: ${score}/100`,
      data: { applicantName, score, rankingTitle },
    })
  }

  static async notifyHighScoreApplication(userId: string, applicantName: string, score: number, rankingTitle: string) {
    return this.createNotification({
      user_id: userId,
      type: "high_score_application",
      title: "High-Scoring Application Alert",
      message: `${applicantName} scored ${score}/100 for "${rankingTitle}" - Consider for immediate review!`,
      data: { applicantName, score, rankingTitle },
    })
  }

  static async notifyInterviewScheduled(
    userId: string,
    applicantName: string,
    interviewDate: string,
    rankingTitle: string,
  ) {
    return this.createNotification({
      user_id: userId,
      type: "interview_scheduled",
      title: "Interview Scheduled",
      message: `Interview scheduled with ${applicantName} for "${rankingTitle}" on ${interviewDate}`,
      data: { applicantName, interviewDate, rankingTitle },
    })
  }

  static async notifyBulkOperationComplete(userId: string, operation: string, count: number, rankingTitle: string) {
    return this.createNotification({
      user_id: userId,
      type: "bulk_operation_complete",
      title: "Bulk Operation Completed",
      message: `${operation} completed for ${count} applications in "${rankingTitle}"`,
      data: { operation, count, rankingTitle },
    })
  }

  static async notifyRankingUpdated(userId: string, rankingTitle: string, changes: string[]) {
    return this.createNotification({
      user_id: userId,
      type: "ranking_updated",
      title: "Ranking Updated",
      message: `"${rankingTitle}" has been updated: ${changes.join(", ")}`,
      data: { rankingTitle, changes },
    })
  }

  static async notifySystemAlert(userId: string, alertType: string, message: string) {
    return this.createNotification({
      user_id: userId,
      type: "system_alert",
      title: "System Alert",
      message: message,
      data: { alertType },
    })
  }
}
