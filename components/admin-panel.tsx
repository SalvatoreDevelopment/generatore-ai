"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Settings, RefreshCw } from "lucide-react"
import {
  toggleGenerationStatus,
  checkGenerationEnabled,
  updateLimitSettings,
  resetUserLimit,
} from "@/actions/admin-control"

export default function AdminPanel() {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null)
  const [limitCount, setLimitCount] = useState<number>(1)
  const [limitHours, setLimitHours] = useState<number>(24)
  const [isLoading, setIsLoading] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const handleToggle = async (enabled: boolean) => {
    if (!password) {
      setMessage(t("enterPassword"))
      return
    }

    setIsLoading(true)
    try {
      const result = await toggleGenerationStatus(password, enabled)
      if (result.success) {
        setMessage(result.message || (enabled ? t("generationEnabled") : t("generationDisabled")))
        setIsEnabled(enabled)
      } else {
        setMessage(result.message || t("invalidPassword"))
      }
    } catch (error) {
      console.error("Failed to toggle generation:", error)
      setMessage(t("errorOccurred"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateLimits = async () => {
    if (!password) {
      setMessage(t("enterPassword"))
      return
    }

    if (limitCount < 1 || limitHours < 1) {
      setMessage(t("invalidLimitValues"))
      return
    }

    setIsLoading(true)
    try {
      const result = await updateLimitSettings(password, limitCount, limitHours)
      if (result.success) {
        setMessage(result.message || t("limitsUpdated"))
      } else {
        setMessage(result.message || t("invalidPassword"))
      }
    } catch (error) {
      console.error("Failed to update limits:", error)
      setMessage(t("errorOccurred"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetUserLimit = async () => {
    if (!password) {
      setMessage(t("enterPassword"))
      return
    }

    setIsResetting(true)
    try {
      const result = await resetUserLimit(password)
      if (result.success) {
        setMessage(result.message || t("userLimitReset"))
        // Emetti un evento per aggiornare gli altri componenti
        if (typeof window !== "undefined") {
          const event = new CustomEvent("imageGenerated")
          window.dispatchEvent(event)
        }
      } else {
        setMessage(result.message || t("invalidPassword"))
      }
    } catch (error) {
      console.error("Failed to reset user limit:", error)
      setMessage(t("errorOccurred"))
    } finally {
      setIsResetting(false)
    }
  }

  const checkStatus = async () => {
    setIsLoading(true)
    try {
      const result = await checkGenerationEnabled()
      setIsEnabled(result.enabled)
      setLimitCount(result.limitCount)
      setLimitHours(result.limitHours)
      setMessage(result.enabled ? t("generationIsEnabled") : t("generationIsDisabled"))
    } catch (error) {
      console.error("Failed to check generation status:", error)
      setMessage(t("errorOccurred"))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      checkStatus()
    }
  }, [isOpen])

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-white/80 dark:bg-[#0a0f1f]/80 border-gray-300 dark:border-gray-800 z-50"
      >
        <Settings className="h-4 w-4 mr-2" />
        {t("adminPanel")}
      </Button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white dark:bg-[#0a0f1f] border border-gray-300 dark:border-gray-800 rounded-md shadow-lg w-80 z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-gray-900 dark:text-white">{t("adminPanel")}</h3>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
          ✕
        </Button>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("adminPassword")}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={() => handleToggle(true)}
            disabled={isLoading}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {t("enableGeneration")}
          </Button>
          <Button
            onClick={() => handleToggle(false)}
            disabled={isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {t("disableGeneration")}
          </Button>
        </div>

        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium mb-2 text-gray-900 dark:text-white">{t("limitSettings")}</h4>

          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">{t("imagesPerPeriod")}</label>
              <Input
                type="number"
                min="1"
                value={limitCount}
                onChange={(e) => setLimitCount(Number.parseInt(e.target.value, 10))}
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">{t("periodHours")}</label>
              <Input
                type="number"
                min="1"
                value={limitHours}
                onChange={(e) => setLimitHours(Number.parseInt(e.target.value, 10))}
                className="text-sm"
              />
            </div>
          </div>

          <Button onClick={handleUpdateLimits} disabled={isLoading} className="w-full bg-[#9333EA] hover:bg-[#7928CA]">
            {t("updateLimits")}
          </Button>
        </div>

        {/* Nuova sezione per resettare il limite dell'utente */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium mb-2 text-gray-900 dark:text-white">{t("userLimitReset")}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t("userLimitResetDesc")}</p>

          <Button
            onClick={handleResetUserLimit}
            disabled={isResetting}
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            {isResetting ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
            {t("resetUserLimit")}
          </Button>
        </div>

        <Button onClick={checkStatus} variant="outline" disabled={isLoading} className="w-full">
          {t("checkStatus")}
        </Button>

        {message && (
          <div
            className={`p-2 text-sm rounded ${
              message.includes("success") ||
              message.includes("enabled") ||
              message.includes("attivat") ||
              message.includes("updated") ||
              message.includes("aggiornate") ||
              message.includes("reset")
                ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                : "bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
