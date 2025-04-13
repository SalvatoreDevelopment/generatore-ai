"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { checkApiStatus } from "@/actions/check-api"
import { checkRateLimit } from "@/actions/check-limit"
import { checkGenerationEnabled } from "@/actions/admin-control"

export default function GenerationStatus() {
  const { t } = useLanguage()
  const [apiStatus, setApiStatus] = useState<"loading" | "configured" | "not-configured">("loading")
  const [rateStatus, setRateStatus] = useState<"loading" | "available" | "limited">("loading")
  const [adminEnabled, setAdminEnabled] = useState<boolean>(false)
  const [isChecking, setIsChecking] = useState(false)
  const [lastCheck, setLastCheck] = useState<number>(0)

  const checkStatus = async () => {
    setIsChecking(true)
    try {
      // Verifica lo stato dell'API
      const apiResult = await checkApiStatus()
      setApiStatus(apiResult.configured ? "configured" : "not-configured")

      // Verifica lo stato del limite di generazione
      const rateResult = await checkRateLimit()
      setRateStatus(rateResult.canGenerate ? "available" : "limited")

      // Verifica se la generazione è abilitata dall'amministratore
      const adminResult = await checkGenerationEnabled()
      setAdminEnabled(adminResult.enabled)

      setLastCheck(Date.now())
    } catch (error) {
      console.error("Failed to check status:", error)
      setApiStatus("not-configured")
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkStatus()

    // Controlla lo stato ogni minuto
    const interval = setInterval(() => {
      checkStatus()
    }, 60000) // 60000 ms = 1 minuto

    return () => clearInterval(interval)
  }, [])

  // Aggiungi un listener per gli eventi personalizzati
  useEffect(() => {
    const handleImageGenerated = () => {
      // Ricontrolla lo stato dopo la generazione di un'immagine
      checkStatus()
    }

    window.addEventListener("imageGenerated", handleImageGenerated)

    return () => {
      window.removeEventListener("imageGenerated", handleImageGenerated)
    }
  }, [])

  // Determina se la generazione è attiva (API configurata E limite non raggiunto E abilitata dall'admin)
  const isGenerationActive = apiStatus === "configured" && rateStatus === "available" && adminEnabled

  return (
    <div className="w-full mt-4 p-4 rounded-md border bg-white/80 dark:bg-[#010817]/80 border-gray-300 dark:border-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {apiStatus === "loading" || rateStatus === "loading" ? (
            <RefreshCw className="h-5 w-5 text-gray-500 dark:text-gray-400 animate-spin mr-2" />
          ) : isGenerationActive ? (
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          ) : (
            <XCircle className="h-5 w-5 text-amber-500 mr-2" />
          )}
          <span className="font-medium text-gray-900 dark:text-white">
            {apiStatus === "loading" || rateStatus === "loading"
              ? t("checkingGenerationStatus")
              : isGenerationActive
                ? t("generationActive")
                : t("generationInactive")}
          </span>
        </div>
        <Button size="sm" variant="outline" onClick={checkStatus} disabled={isChecking} className="text-xs">
          {isChecking ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : null}
          {t("checkAgain")}
        </Button>
      </div>
    </div>
  )
}
