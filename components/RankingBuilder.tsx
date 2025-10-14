"use client"
import { useState, useEffect, useRef } from "react"
import {
  ArrowLeft,
  Save,
  Link2,
  MapPin,
  Sliders,
  CheckCircle,
  Sparkles,
  CheckSquare,
  Square,
  AlertTriangle,
  Star,
  Zap,
  Plus,
  X,
} from "lucide-react"

interface Criterion {
  id: string
  name: string
  description: string
  weight: number
}

interface CustomCriterion {
  id: string
  keyword: string
  points: number
}

interface RankingBuilderProps {
  ranking?: any
  onBack: () => void
  onComplete: () => void
  onNotification?: (message: string, type: "success" | "error" | "info") => void
}

const JOB_POSITIONS = [
  { value: "kitchen-helper", label: "Kitchen Helper" },
  { value: "server/waiter", label: "Server/Waiter" },
  { value: "housekeeping", label: "House Keeping" },
  { value: "cashier", label: "Cashier" },
  { value: "barista", label: "Barista" },
  { value: "gardener", label: "Gardener" },
  { value: "receptionist", label: "Receptionist" },
]

const DEFAULT_CRITERIA: Criterion[] = [
  { id: "personality", name: "Personality", description: "Personality traits and soft skills assessment", weight: 0.5 },
  { id: "skill", name: "Skill", description: "Technical and job-specific skills evaluation", weight: 0.8 },
  {
    id: "area_living",
    name: "Area Living",
    description: "Geographic location and proximity to workplace",
    weight: 0.3,
  },
  { id: "experience", name: "Experience", description: "Previous work experience and background", weight: 0.7 },
  { id: "training", name: "Training", description: "Professional training and certifications completed", weight: 0.4 },
  { id: "certification", name: "Certification", description: "Industry certifications and licenses", weight: 0.6 },
  { id: "education", name: "Education", description: "Educational background and qualifications", weight: 0.5 },
]

const SPECIFIC_CRITERIA = [
  { id: "bilingual", name: "Bilingual", description: "Speaks multiple languages fluently", bonus: 50 },
  { id: "driver_license", name: "Driver's License", description: "Valid driver's license", bonus: 50 },
  { id: "weekend_availability", name: "Weekend Availability", description: "Available to work weekends", bonus: 50 },
  { id: "night_shift", name: "Night Shift", description: "Available for night shift work", bonus: 50 },
  {
    id: "management_experience",
    name: "Management Experience",
    description: "Previous management or leadership experience",
    bonus: 50,
  },
  { id: "customer_service", name: "Customer Service", description: "Strong customer service background", bonus: 50 },
  {
    id: "food_safety_cert",
    name: "Food Safety Certification",
    description: "Food safety or handling certification",
    bonus: 50,
  },
  {
    id: "pos_experience",
    name: "POS System Experience",
    description: "Experience with point-of-sale systems",
    bonus: 50,
  },
]

export default function RankingBuilder({ ranking, onBack, onComplete, onNotification }: RankingBuilderProps) {
  const [title, setTitle] = useState("")
  const [position, setPosition] = useState("")
  const [description, setDescription] = useState("")
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([])
  const [criteriaWeights, setCriteriaWeights] = useState<Record<string, number>>({})
  const [selectedSpecificCriteria, setSelectedSpecificCriteria] = useState<string[]>([])
  const [customCriteria, setCustomCriteria] = useState<CustomCriterion[]>([])
  const [areaCity, setAreaCity] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showReloadWarning, setShowReloadWarning] = useState(false)
  const initialDataRef = useRef<any>(null)

  const progressKey = ranking ? `ranking-edit-${ranking.id}` : "ranking-create-draft"

  const loadSavedProgress = () => {
    if (typeof window === "undefined") return null
    try {
      const saved = localStorage.getItem(progressKey)
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error("Error loading saved progress:", error)
      return null
    }
  }

  const saveProgress = (data: any) => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(progressKey, JSON.stringify(data))
    } catch (error) {
      console.error("Error saving progress:", error)
    }
  }

  const clearSavedProgress = () => {
    if (typeof window === "undefined") return
    try {
      localStorage.removeItem(progressKey)
    } catch (error) {
      console.error("Error clearing saved progress:", error)
    }
  }

  useEffect(() => {
    if (ranking) {
      // Edit mode - populate existing data
      setTitle(ranking.title || "")
      setPosition(ranking.position || "")
      setDescription(ranking.description || "")
      setAreaCity(ranking.area_city || "")
      setIsActive(ranking.is_active ?? true)

      // Parse criteria weights from JSON
      const weights = ranking.criteria_weights || {}
      const selectedCriteriaIds = Object.keys(weights)
      setSelectedCriteria(selectedCriteriaIds)
      setCriteriaWeights(weights)

      const specificCriteria = ranking.specific_criteria || []
      setSelectedSpecificCriteria(specificCriteria)

      const customCriteriaData = ranking.custom_criteria || []
      setCustomCriteria(customCriteriaData)

      // Store initial data for comparison
      initialDataRef.current = {
        title: ranking.title || "",
        position: ranking.position || "",
        description: ranking.description || "",
        selectedCriteria: selectedCriteriaIds,
        criteriaWeights: weights,
        selectedSpecificCriteria: specificCriteria,
        customCriteria: customCriteriaData,
        areaCity: ranking.area_city || "",
        isActive: ranking.is_active ?? true,
      }
    } else {
      const savedProgress = loadSavedProgress()

      if (savedProgress) {
        // Restore from saved progress
        setTitle(savedProgress.title || "")
        setPosition(savedProgress.position || "")
        setDescription(savedProgress.description || "")
        setSelectedCriteria(savedProgress.selectedCriteria || [])
        setCriteriaWeights(savedProgress.criteriaWeights || {})
        setSelectedSpecificCriteria(savedProgress.selectedSpecificCriteria || [])
        setCustomCriteria(savedProgress.customCriteria || [])
        setAreaCity(savedProgress.areaCity || "")
        setIsActive(savedProgress.isActive ?? true)

        // Store initial data for comparison
        initialDataRef.current = savedProgress

        // Show notification about restored progress
        onNotification?.("Progress restored from previous session", "info")
      } else {
        // Set defaults
        const defaultSelected = ["personality", "skill", "experience"]
        setSelectedCriteria(defaultSelected)
        const defaultWeights: Record<string, number> = {}
        defaultSelected.forEach((criterionId) => {
          const criterion = DEFAULT_CRITERIA.find((c) => c.id === criterionId)
          if (criterion) {
            defaultWeights[criterionId] = criterion.weight
          }
        })
        setCriteriaWeights(defaultWeights)

        // Store initial data for comparison
        initialDataRef.current = {
          title: "",
          position: "",
          description: "",
          selectedCriteria: defaultSelected,
          criteriaWeights: defaultWeights,
          selectedSpecificCriteria: [],
          customCriteria: [],
          areaCity: "",
          isActive: true,
        }
      }
    }
  }, [ranking])

  useEffect(() => {
    if (!ranking && initialDataRef.current) {
      // Only for create mode
      const currentData = {
        title,
        position,
        description,
        selectedCriteria,
        criteriaWeights,
        selectedSpecificCriteria,
        customCriteria,
        areaCity,
        isActive,
      }

      // Only save if there are actual changes from initial state
      const hasChanges = JSON.stringify(currentData) !== JSON.stringify(initialDataRef.current)
      if (hasChanges) {
        // Debounce the save operation
        const timeoutId = setTimeout(() => {
          saveProgress(currentData)
        }, 1000)

        return () => clearTimeout(timeoutId)
      }
    }
  }, [
    title,
    position,
    description,
    selectedCriteria,
    criteriaWeights,
    selectedSpecificCriteria,
    customCriteria,
    areaCity,
    isActive,
    ranking,
  ])

  useEffect(() => {
    if (!initialDataRef.current) return

    const currentData = {
      title,
      position,
      description,
      selectedCriteria,
      criteriaWeights,
      selectedSpecificCriteria,
      customCriteria,
      areaCity,
      isActive,
    }

    const hasChanges = JSON.stringify(currentData) !== JSON.stringify(initialDataRef.current)
    setHasUnsavedChanges(hasChanges)
  }, [
    title,
    position,
    description,
    selectedCriteria,
    criteriaWeights,
    selectedSpecificCriteria,
    customCriteria,
    areaCity,
    isActive,
  ])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ""
        setShowReloadWarning(true)
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedChanges])

  const handleCriterionToggle = (criterionId: string) => {
    if (selectedCriteria.includes(criterionId)) {
      // Remove criterion
      setSelectedCriteria(selectedCriteria.filter((id) => id !== criterionId))
      const newWeights = { ...criteriaWeights }
      delete newWeights[criterionId]
      setCriteriaWeights(newWeights)
    } else {
      // Add criterion
      setSelectedCriteria([...selectedCriteria, criterionId])
      const criterion = DEFAULT_CRITERIA.find((c) => c.id === criterionId)
      if (criterion) {
        setCriteriaWeights({
          ...criteriaWeights,
          [criterionId]: criterion.weight,
        })
      }
    }
  }

  const handleSelectAllCriteria = () => {
    const allCriteriaIds = DEFAULT_CRITERIA.map((c) => c.id)
    const allSelected = allCriteriaIds.every((id) => selectedCriteria.includes(id))

    if (allSelected) {
      // Deselect all
      setSelectedCriteria([])
      setCriteriaWeights({})
    } else {
      // Select all
      setSelectedCriteria(allCriteriaIds)
      const newWeights: Record<string, number> = {}
      DEFAULT_CRITERIA.forEach((criterion) => {
        newWeights[criterion.id] = criterion.weight
      })
      setCriteriaWeights(newWeights)
    }
  }

  const handleSpecificCriterionToggle = (criterionId: string) => {
    if (selectedSpecificCriteria.includes(criterionId)) {
      setSelectedSpecificCriteria(selectedSpecificCriteria.filter((id) => id !== criterionId))
    } else {
      setSelectedSpecificCriteria([...selectedSpecificCriteria, criterionId])
    }
  }

  const handleSelectAllSpecificCriteria = () => {
    const allSpecificIds = SPECIFIC_CRITERIA.map((c) => c.id)
    const allSelected = allSpecificIds.every((id) => selectedSpecificCriteria.includes(id))

    if (allSelected) {
      setSelectedSpecificCriteria([])
    } else {
      setSelectedSpecificCriteria(allSpecificIds)
    }
  }

  const addCustomCriterion = () => {
    const newId = `custom_${Date.now()}`
    setCustomCriteria([...customCriteria, { id: newId, keyword: "", points: 50 }])
  }

  const updateCustomCriterion = (id: string, field: "keyword" | "points", value: string | number) => {
    setCustomCriteria(
      customCriteria.map((criterion) => (criterion.id === id ? { ...criterion, [field]: value } : criterion)),
    )
  }

  const removeCustomCriterion = (id: string) => {
    setCustomCriteria(customCriteria.filter((criterion) => criterion.id !== id))
  }

  const handleWeightChange = (criterionId: string, weight: number) => {
    setCriteriaWeights({
      ...criteriaWeights,
      [criterionId]: weight,
    })
  }

  const generateLinkId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  const handleSave = async () => {
    if (!title.trim() || !position || selectedCriteria.length === 0) {
      onNotification?.("Please fill in all required fields and select at least one criterion", "error")
      return
    }

    const invalidCustomCriteria = customCriteria.filter((c) => !c.keyword.trim())
    if (invalidCustomCriteria.length > 0) {
      onNotification?.("Please fill in all custom criteria keywords or remove empty ones", "error")
      return
    }

    setSaving(true)

    try {
      console.log("[v0] Sending ranking data:", {
        title: title.trim(),
        position,
        description: description.trim(),
        criteria_weights: criteriaWeights,
        specific_criteria: selectedSpecificCriteria,
        custom_criteria: customCriteria,
        area_city: areaCity.trim() || null,
        is_active: isActive,
        application_link_id: ranking?.application_link_id || generateLinkId(),
      })

      const rankingData = {
        title: title.trim(),
        position,
        description: description.trim(),
        criteria_weights: criteriaWeights,
        specific_criteria: selectedSpecificCriteria,
        custom_criteria: customCriteria,
        area_city: areaCity.trim() || null,
        is_active: isActive,
        application_link_id: ranking?.application_link_id || generateLinkId(),
      }

      const url = ranking ? `/api/rankings/${ranking.id}` : "/api/rankings"
      const method = ranking ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rankingData),
      })

      console.log("[v0] API Response:", response.status, response.statusText)

      if (response.ok) {
        const result = await response.json()
        console.log("[v0] API Result:", result)
        onNotification?.(ranking ? "Ranking updated successfully!" : "Ranking created successfully!", "success")
        setHasUnsavedChanges(false)

        clearSavedProgress()

        setTimeout(() => {
          onComplete()
        }, 1000)
      } else {
        const error = await response.json()
        console.error("[v0] API Error:", error)
        onNotification?.(error.error || `Failed to save ranking (${response.status})`, "error")
      }
    } catch (error) {
      console.error("[v0] Error saving ranking:", error)
      onNotification?.(
        `An error occurred while saving: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error",
      )
    } finally {
      setSaving(false)
    }
  }

  const getWeightLabel = (weight: number) => {
    if (weight <= 0.3) return "Low"
    if (weight <= 0.6) return "Medium"
    if (weight <= 0.8) return "High"
    return "Critical"
  }

  const getWeightColor = (weight: number) => {
    if (weight <= 0.3) return "text-gray-600"
    if (weight <= 0.6) return "text-blue-600"
    if (weight <= 0.8) return "text-orange-600"
    return "text-red-600"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-950 relative overflow-hidden">
      {showReloadWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md mx-4 shadow-2xl animate-scale-in">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Unsaved Changes</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              You have unsaved changes. Are you sure you want to leave without saving?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowReloadWarning(false)}
                className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-200"
              >
                Stay
              </button>
              <button
                onClick={() => {
                  setHasUnsavedChanges(false)
                  setShowReloadWarning(false)
                  clearSavedProgress()
                  onBack()
                }}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-400/5 rounded-2xl blur-2xl animate-pulse-slow"></div>
      </div>

      <header className="relative z-10 glass-emerald border-b border-emerald-200/20 dark:border-emerald-800/20 animate-fade-in-down">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4 animate-slide-in-right">
              <button
                onClick={() => {
                  if (hasUnsavedChanges) {
                    setShowReloadWarning(true)
                  } else {
                    onBack()
                  }
                }}
                className="flex items-center space-x-2 p-3 glass-emerald hover-glow rounded-xl transition-all duration-300 group"
              >
                <ArrowLeft className="h-5 w-5 text-emerald-600 dark:text-emerald-400 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="text-emerald-700 dark:text-emerald-300 font-medium font-work-sans hidden sm:block">
                  Back to Dashboard
                </span>
              </button>
              <div className="h-8 w-px bg-emerald-200/50 dark:bg-emerald-800/50 hidden sm:block"></div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-gentle">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold gradient-text font-work-sans">
                    {ranking ? "Edit Ranking" : "Create New Ranking"}
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-open-sans hidden sm:block">
                    Design your perfect hiring criteria
                    {hasUnsavedChanges && (
                      <span className="ml-2 text-amber-600 dark:text-amber-400 font-medium">• Unsaved changes</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-xl ripple-effect font-work-sans font-semibold animate-slide-in-left"
            >
              <Save className="h-5 w-5" />
              <span>{saving ? "Saving..." : "Save Ranking"}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 p-4 sm:p-6 max-w-6xl mx-auto">
        <div className="space-y-6 sm:space-y-8">
          <div
            className="glass rounded-2xl border border-emerald-200/20 dark:border-emerald-800/20 p-6 sm:p-8 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-work-sans">Basic Information</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="title"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300 font-work-sans"
                >
                  Ranking Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Restaurant Server Position - Downtown Location"
                  className="w-full px-4 py-4 bg-white/50 dark:bg-slate-800/50 border-2 border-emerald-200/50 dark:border-emerald-800/50 rounded-2xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-600 font-open-sans"
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="position"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300 font-work-sans"
                >
                  Job Position *
                </label>
                <select
                  id="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-4 py-4 bg-white/50 dark:bg-slate-800/50 border-2 border-emerald-200/50 dark:border-emerald-800/50 rounded-2xl text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-600 font-open-sans"
                >
                  <option value="">Select a position</option>
                  {JOB_POSITIONS.map((pos) => (
                    <option key={pos.value} value={pos.value}>
                      {pos.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 font-work-sans"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe the role, requirements, and what you're looking for in candidates..."
                className="w-full px-4 py-4 bg-white/50 dark:bg-slate-800/50 border-2 border-emerald-200/50 dark:border-emerald-800/50 rounded-2xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 hover:border-emerald-300 dark:hover:border-emerald-600 font-open-sans resize-none"
              />
            </div>
            <div className="mt-6 flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-2 border-emerald-300 rounded-lg transition-all duration-200"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-slate-700 dark:text-slate-300 font-work-sans"
              >
                Active (accepting applications)
              </label>
            </div>
          </div>

          <div
            className="glass rounded-2xl border border-emerald-200/20 dark:border-emerald-800/20 p-6 sm:p-8 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white font-work-sans">
                    Evaluation Criteria
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-open-sans">
                    Select criteria and adjust their importance using the sliders
                  </p>
                </div>
              </div>
              <button
                onClick={handleSelectAllCriteria}
                className="flex items-center space-x-2 px-4 py-2 glass-emerald hover-glow rounded-xl transition-all duration-300 group"
              >
                {DEFAULT_CRITERIA.every((c) => selectedCriteria.includes(c.id)) ? (
                  <CheckSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Square className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                )}
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Select All</span>
              </button>
            </div>

            <div className="space-y-4">
              {DEFAULT_CRITERIA.map((criterion, index) => {
                const isSelected = selectedCriteria.includes(criterion.id)
                const weight = criteriaWeights[criterion.id] || criterion.weight

                return (
                  <div
                    key={criterion.id}
                    className={`border-2 rounded-2xl p-6 transition-all duration-300 animate-fade-in-up ${
                      isSelected
                        ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/20 shadow-lg"
                        : "border-slate-200 dark:border-slate-700 bg-white/30 dark:bg-slate-800/30 hover:border-emerald-200 dark:hover:border-emerald-800"
                    }`}
                    style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                  >
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        id={criterion.id}
                        checked={isSelected}
                        onChange={() => handleCriterionToggle(criterion.id)}
                        className="mt-1 h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-2 border-emerald-300 rounded-lg transition-all duration-200"
                      />
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                          <div>
                            <label
                              htmlFor={criterion.id}
                              className="text-lg font-bold text-slate-900 dark:text-white cursor-pointer font-work-sans flex items-center"
                            >
                              {criterion.name}
                              {criterion.id === "area_living" && (
                                <MapPin className="inline h-5 w-5 ml-2 text-emerald-500 dark:text-emerald-400" />
                              )}
                            </label>
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-open-sans mt-1">
                              {criterion.description}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="flex items-center space-x-3 glass-emerald rounded-xl px-4 py-2">
                              <Sliders className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                              <span className={`text-sm font-bold ${getWeightColor(weight)} font-work-sans`}>
                                {getWeightLabel(weight)}
                              </span>
                            </div>
                          )}
                        </div>

                        {isSelected && (
                          <div className="space-y-4 animate-slide-in-down">
                            <div className="relative">
                              <input
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.1"
                                value={weight}
                                onChange={(e) => handleWeightChange(criterion.id, Number.parseFloat(e.target.value))}
                                className="w-full h-3 bg-gradient-to-r from-emerald-200 to-emerald-300 dark:from-emerald-800 dark:to-emerald-700 rounded-full appearance-none cursor-pointer slider-emerald"
                              />
                              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2 font-work-sans font-medium">
                                <span>Low</span>
                                <span>Medium</span>
                                <span>High</span>
                                <span>Critical</span>
                              </div>
                            </div>

                            {criterion.id === "area_living" && (
                              <div className="animate-fade-in">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 font-work-sans">
                                  Preferred City (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={areaCity}
                                  onChange={(e) => setAreaCity(e.target.value)}
                                  placeholder="e.g., New York, Los Angeles"
                                  className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border-2 border-emerald-200/50 dark:border-emerald-800/50 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300 font-open-sans"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {selectedCriteria.length === 0 && (
              <div className="mt-6 p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl animate-pulse-gentle">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">!</span>
                  </div>
                  <p className="text-amber-800 dark:text-amber-200 font-medium font-work-sans">
                    Please select at least one evaluation criterion.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div
            className="glass rounded-2xl border border-emerald-200/20 dark:border-emerald-800/20 p-6 sm:p-8 animate-fade-in-up"
            style={{ animationDelay: "0.25s" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white font-work-sans">Bonus Criteria</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-open-sans">
                    Each selected criterion adds bonus points if matched
                  </p>
                </div>
              </div>
              <button
                onClick={handleSelectAllSpecificCriteria}
                className="flex items-center space-x-2 px-4 py-2 glass-emerald hover-glow rounded-xl transition-all duration-300 group"
              >
                {SPECIFIC_CRITERIA.every((c) => selectedSpecificCriteria.includes(c.id)) ? (
                  <CheckSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Square className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                )}
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Select All</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SPECIFIC_CRITERIA.map((criterion, index) => {
                const isSelected = selectedSpecificCriteria.includes(criterion.id)

                return (
                  <div
                    key={criterion.id}
                    className={`border-2 rounded-2xl p-4 transition-all duration-300 cursor-pointer animate-fade-in-up ${
                      isSelected
                        ? "border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/20 shadow-lg"
                        : "border-slate-200 dark:border-slate-700 bg-white/30 dark:bg-slate-800/30 hover:border-orange-200 dark:hover:border-orange-800"
                    }`}
                    style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                    onClick={() => handleSpecificCriterionToggle(criterion.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id={`specific_${criterion.id}`}
                        checked={isSelected}
                        onChange={() => handleSpecificCriterionToggle(criterion.id)}
                        className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-2 border-orange-300 rounded transition-all duration-200"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor={`specific_${criterion.id}`}
                            className="text-sm font-bold text-slate-900 dark:text-white cursor-pointer font-work-sans"
                          >
                            {criterion.name}
                          </label>
                          <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-full">
                            <Zap className="h-3 w-3" />
                            <span>+{criterion.bonus}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-open-sans mt-1">
                          {criterion.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-work-sans">Custom Keywords</h3>
                <button
                  onClick={addCustomCriterion}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm font-medium">Add Custom</span>
                </button>
              </div>

              {customCriteria.length > 0 && (
                <div className="space-y-3">
                  {customCriteria.map((criterion, index) => (
                    <div
                      key={criterion.id}
                      className="border-2 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/20 rounded-2xl p-4 animate-fade-in-up"
                      style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                              Keyword to Match
                            </label>
                            <input
                              type="text"
                              value={criterion.keyword}
                              onChange={(e) => updateCustomCriterion(criterion.id, "keyword", e.target.value)}
                              placeholder="e.g., Python, Leadership, MBA"
                              className="w-full px-3 py-2 bg-white/50 dark:bg-slate-800/50 border-2 border-purple-200/50 dark:border-purple-800/50 rounded-xl text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                              Bonus Points
                            </label>
                            <input
                              type="number"
                              value={criterion.points}
                              onChange={(e) =>
                                updateCustomCriterion(criterion.id, "points", Number.parseInt(e.target.value) || 0)
                              }
                              min="1"
                              max="100"
                              className="w-full px-3 py-2 bg-white/50 dark:bg-slate-800/50 border-2 border-purple-200/50 dark:border-purple-800/50 rounded-xl text-slate-900 dark:text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => removeCustomCriterion(criterion.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {customCriteria.length === 0 && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <Plus className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No custom keywords added yet</p>
                  <p className="text-xs mt-1">Add specific keywords to look for in resumes</p>
                </div>
              )}
            </div>

            {(selectedSpecificCriteria.length > 0 || customCriteria.length > 0) && (
              <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <Star className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <p className="text-orange-800 dark:text-orange-200 font-medium font-work-sans">
                    Selected {selectedSpecificCriteria.length} preset criteria worth{" "}
                    <span className="font-bold">{selectedSpecificCriteria.length * 50} points</span>
                    {customCriteria.length > 0 && (
                      <>
                        {" "}
                        + {customCriteria.length} custom criteria worth{" "}
                        <span className="font-bold">{customCriteria.reduce((sum, c) => sum + c.points, 0)} points</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {(title || ranking) && (
            <div
              className="glass rounded-2xl border border-emerald-200/20 dark:border-emerald-800/20 p-6 sm:p-8 animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white font-work-sans">Application Link</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-open-sans">
                    Share this link with candidates to apply
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 p-4 glass-emerald rounded-2xl">
                <Link2 className="h-6 w-6 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                <code className="text-sm text-slate-700 dark:text-slate-300 flex-1 break-all font-mono bg-white/50 dark:bg-slate-800/50 px-3 py-2 rounded-xl">
                  {typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}/apply/
                  {ranking?.application_link_id || "your-link-id"}
                </code>
                <button
                  onClick={() => {
                    if (ranking?.application_link_id) {
                      const url = `${window.location.origin}/apply/${ranking.application_link_id}`
                      navigator.clipboard.writeText(url)
                      onNotification?.("Link copied to clipboard!", "success")
                    }
                  }}
                  disabled={!ranking?.application_link_id}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 ripple-effect font-work-sans font-semibold"
                >
                  Copy Link
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .slider-emerald::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #059669);
          cursor: pointer;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
          transition: all 0.2s ease;
        }

        .slider-emerald::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.6);
        }

        .slider-emerald::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981, #059669);
          cursor: pointer;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
          transition: all 0.2s ease;
        }

        .slider-emerald::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.6);
        }
      `}</style>
    </div>
  )
}
