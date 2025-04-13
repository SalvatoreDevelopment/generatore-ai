"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { checkApiStatus } from "@/actions/check-api"

export default function ApiStatus() {
  const { t } = useLanguage()
  const [status, setStatus] = useState<"loading" | "configured" | "not-configured">("loading")
  const [isChecking, setIsChecking] = useState(false)

  const checkStatus = async () => {
    setIsChecking(true)
    try {
      const result = await checkApiStatus()
      setStatus(result.configured ? "configured" : "not-configured")
    } catch (error) {
      console.error("Failed to check API status:", error)
      setStatus("not-configured")
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  return (
    <div className="w-full mt-4 p-4 rounded-md border bg-white/80 dark:bg-[#010817]/80 border-gray-300 dark:border-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {status === "loading" ? (
            <RefreshCw className="h-5 w-5 text-gray-500 dark:text-gray-400 animate-spin mr-2" />
          ) : status === "configured" ? (
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          )}
          <span className="font-medium text-gray-900 dark:text-white">
            {status === "loading"
              ? t("checkingApiStatus")
              : status === "configured"
                ? t("apiConfigured")
                : t("apiNotConfigured")}
          </span>
        </div>
        <Button size="sm" variant="outline" onClick={checkStatus} disabled={isChecking} className="text-xs">
          {isChecking ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : null}
          {t("checkAgain")}
        </Button>
      </div>

      {status === "not-configured" && (
        <div className="mt-3 text-sm text-red-600 dark:text-red-400">
          <p>{t("apiKeyMissingHelp")}</p>
          <ol className="list-decimal ml-5 mt-2 space-y-1">
            <li>{t("apiKeyStep1")}</li>
            <li>{t("apiKeyStep2")}</li>
            <li>{t("apiKeyStep3")}</li>
          </ol>
        </div>
      )}
    </div>
  )
}
