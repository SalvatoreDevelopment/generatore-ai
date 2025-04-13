"use client"

import { useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Shield, ChevronDown, ChevronUp } from "lucide-react"

export default function SecurityInfo() {
  const { t } = useLanguage()
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="w-full mt-8 border border-gray-300 dark:border-gray-800 rounded-md overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gray-100 dark:bg-[#0a0f1f] text-left"
      >
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-[#9333EA] mr-2" />
          <span className="font-medium text-gray-900 dark:text-white">{t("securityInfo")}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 bg-white dark:bg-[#010817]/80">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{t("apiKeySecurity")}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{t("apiKeySecurityDesc")}</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{t("promptValidation")}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{t("promptValidationDesc")}</p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{t("securityLogging")}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{t("securityLoggingDesc")}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
