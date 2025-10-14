"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Eye,
  EyeOff,
  User,
  Shield,
  Palette,
  AlertTriangle,
  Mail,
  Lock,
  Trash2,
  Building,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// Define the SettingsProps interface
interface SettingsProps {
  onBack: () => void
  userEmail: string
  onNotification: (enabled: boolean) => void
}

interface UserProfile {
  name: string
  email: string
  bio: string
  company_name: string
}

export default function Settings({ onBack, userEmail, onNotification }: SettingsProps) {
  const [profile, setProfile] = useState<UserProfile>({ name: "", email: userEmail, bio: "", company_name: "" })
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [deletePassword, setDeletePassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showDeletePassword, setShowDeletePassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [passwordChangeStep, setPasswordChangeStep] = useState<"form" | "verification">("form")
  const [deleteStep, setDeleteStep] = useState<"form" | "verification">("form")
  const [verificationCode, setVerificationCode] = useState("")

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const supabase = createClient()

        // Get current user from Supabase
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          console.error("No authenticated user found:", userError)
          return
        }

        // Try to get profile from API using authenticated user's email
        const response = await fetch(`/api/auth/profile?email=${encodeURIComponent(user.email || "")}`)
        if (response.ok) {
          const data = await response.json()
          setProfile({
            name: data.name || data.full_name || "",
            email: data.email || user.email || "",
            bio: data.bio || "",
            company_name: data.company_name || "",
          })
        } else {
          // If profile doesn't exist in custom storage, use Supabase user metadata
          setProfile({
            name: user.user_metadata?.full_name || user.user_metadata?.name || "",
            email: user.email || "",
            bio: user.user_metadata?.bio || "",
            company_name: user.user_metadata?.company_name || "",
          })
        }
      } catch (error) {
        console.error("Failed to load profile:", error)
      }
    }
    loadProfile()
  }, [])

  const updateProfile = async () => {
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setError("Authentication required")
        return
      }

      // Update Supabase user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: profile.name,
          company_name: profile.company_name,
          bio: profile.bio,
        },
      })

      if (updateError) {
        console.error("Failed to update Supabase profile:", updateError)
      }

      // Also update custom profile storage
      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          full_name: profile.name, // Map name to full_name for consistency
        }),
      })

      if (response.ok) {
        setMessage("Profile updated successfully!")
      } else {
        const data = await response.json()
        setError(data.error || "Failed to update profile")
      }
    } catch (error) {
      setError("An error occurred while updating profile")
    } finally {
      setLoading(false)
    }
  }

  const sendPasswordChangeCode = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all password fields")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/send-password-change-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          currentPassword,
          newPassword,
        }),
      })

      if (response.ok) {
        setPasswordChangeStep("verification")
        setMessage("Verification code sent to your email!")
      } else {
        const data = await response.json()
        setError(data.error || "Failed to send verification code")
      }
    } catch (error) {
      setError("An error occurred while sending verification code")
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async () => {
    if (!verificationCode) {
      setError("Please enter the verification code")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          verificationCode,
          newPassword,
        }),
      })

      if (response.ok) {
        setMessage("Password changed successfully!")
        setPasswordChangeStep("form")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setVerificationCode("")
      } else {
        const data = await response.json()
        setError(data.error || "Failed to change password")
      }
    } catch (error) {
      setError("An error occurred while changing password")
    } finally {
      setLoading(false)
    }
  }

  const sendDeleteCode = async () => {
    if (!deletePassword) {
      setError("Please enter your password to confirm account deletion")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/send-delete-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          password: deletePassword,
        }),
      })

      if (response.ok) {
        setDeleteStep("verification")
        setMessage("Verification code sent to your email!")
      } else {
        const data = await response.json()
        setError(data.error || "Failed to send verification code")
      }
    } catch (error) {
      setError("An error occurred while sending verification code")
    } finally {
      setLoading(false)
    }
  }

  const deleteAccount = async () => {
    if (!verificationCode) {
      setError("Please enter the verification code")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/delete-account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          verificationCode,
        }),
      })

      if (response.ok) {
        setMessage("Account deleted successfully. You will be logged out.")
        setTimeout(() => {
          window.location.href = "/"
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.error || "Failed to delete account")
      }
    } catch (error) {
      setError("An error occurred while deleting account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-4 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-slide-in-down">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white hover:bg-white/10 hover:text-emerald-300 transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-slate-400">Manage your account and preferences</p>
          </div>
        </div>

        {/* Notifications */}
        {message && (
          <Alert className="mb-6 border-emerald-500/20 bg-emerald-500/10 text-emerald-300 animate-slide-in-up">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 border-red-500/20 bg-red-500/10 text-red-300 animate-slide-in-up">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 animate-slide-in-up">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all duration-300"
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all duration-300"
            >
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger
              value="appearance"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all duration-300"
            >
              <Palette className="w-4 h-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger
              value="danger"
              className="data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all duration-300"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Danger Zone
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="animate-fade-in">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/60 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-emerald-300 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Update your personal information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-300">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white focus:border-emerald-500 transition-all duration-300"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_name" className="text-slate-300 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Company Name
                    </Label>
                    <Input
                      id="company_name"
                      value={profile.company_name}
                      onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                      className="bg-slate-700/50 border-slate-600 text-white focus:border-emerald-500 transition-all duration-300"
                      placeholder="Enter your company name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="bg-slate-700/50 border-slate-600 text-white focus:border-emerald-500 transition-all duration-300"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-slate-300">
                    Bio
                  </Label>
                  <textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full min-h-[100px] px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:border-emerald-500 focus:outline-none transition-all duration-300 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <Button
                  onClick={updateProfile}
                  disabled={loading}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all duration-300 hover:scale-105"
                >
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="animate-fade-in">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/60 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-emerald-300 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Change Password
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {passwordChangeStep === "form" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="current-password" className="text-slate-300">
                        Current Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="bg-slate-700/50 border-slate-600 text-white focus:border-emerald-500 transition-all duration-300 pr-10"
                          placeholder="Enter current password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-password" className="text-slate-300">
                          New Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="new-password"
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="bg-slate-700/50 border-slate-600 text-white focus:border-emerald-500 transition-all duration-300 pr-10"
                            placeholder="Enter new password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-slate-300">
                          Confirm New Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="bg-slate-700/50 border-slate-600 text-white focus:border-emerald-500 transition-all duration-300 pr-10"
                            placeholder="Confirm new password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Alert className="border-amber-500/20 bg-amber-500/10 text-amber-300">
                      <Mail className="w-4 h-4" />
                      <AlertDescription>
                        For security, we'll send a verification code to your email before changing your password.
                      </AlertDescription>
                    </Alert>
                    <Button
                      onClick={sendPasswordChangeCode}
                      disabled={loading}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all duration-300 hover:scale-105"
                    >
                      {loading ? "Sending..." : "Send Verification Code"}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="verification-code" className="text-slate-300">
                        Verification Code
                      </Label>
                      <Input
                        id="verification-code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white focus:border-emerald-500 transition-all duration-300"
                        placeholder="Enter 6-digit code from email"
                        maxLength={6}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={changePassword}
                        disabled={loading}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all duration-300 hover:scale-105"
                      >
                        {loading ? "Changing..." : "Change Password"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setPasswordChangeStep("form")
                          setVerificationCode("")
                        }}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 transition-all duration-300"
                      >
                        Back
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="animate-fade-in">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:bg-slate-800/60 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-emerald-300 flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Appearance Settings
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Customize the look and feel of your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">Appearance customization options coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger" className="animate-fade-in">
            <Card className="bg-red-900/20 backdrop-blur-sm border-red-500/30 hover:bg-red-900/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-red-300 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Delete Account
                </CardTitle>
                <CardDescription className="text-red-400">
                  Permanently delete your account and all associated data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-red-500/30 bg-red-500/10 text-red-300">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription>
                    <strong>Warning:</strong> This action cannot be undone. This will permanently delete your account
                    and remove all data including:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>All your rankings and job postings</li>
                      <li>Candidate applications and data</li>
                      <li>Interview records and notes</li>
                      <li>Account settings and preferences</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                {deleteStep === "form" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="delete-password" className="text-slate-300">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="delete-password"
                          type={showDeletePassword ? "text" : "password"}
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          className="bg-slate-700/50 border-slate-600 text-white focus:border-red-500 transition-all duration-300 pr-10"
                          placeholder="Enter your password to confirm"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white"
                          onClick={() => setShowDeletePassword(!showDeletePassword)}
                        >
                          {showDeletePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <Alert className="border-amber-500/20 bg-amber-500/10 text-amber-300">
                      <Mail className="w-4 h-4" />
                      <AlertDescription>We'll send a verification code to confirm account deletion.</AlertDescription>
                    </Alert>
                    <Button
                      onClick={sendDeleteCode}
                      disabled={loading}
                      variant="destructive"
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-300 hover:scale-105"
                    >
                      {loading ? "Sending..." : "Send Verification Code"}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="delete-verification-code" className="text-slate-300">
                        Verification Code
                      </Label>
                      <Input
                        id="delete-verification-code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="bg-slate-700/50 border-slate-600 text-white focus:border-red-500 transition-all duration-300"
                        placeholder="Enter 6-digit code from email"
                        maxLength={6}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={deleteAccount}
                        disabled={loading}
                        variant="destructive"
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-300 hover:scale-105"
                      >
                        {loading ? "Deleting..." : "Delete Account"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setDeleteStep("form")
                          setVerificationCode("")
                        }}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 transition-all duration-300"
                      >
                        Back
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
