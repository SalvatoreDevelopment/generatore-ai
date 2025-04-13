"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Clock } from "lucide-react"
import { checkGenerationLimit } from "@/lib/rate-limit"

export default function GenerationLimit() {
  const { t } = useLanguage()
  const [canGenerate, setCanGenerate] = useState<boolean>(true)
  const [timeRemaining, setTimeRemaining] = useState<{ hours: number; minutes: number; seconds: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastCheck, setLastCheck] = useState<number>(0)

  const checkLimit = async () => {
    try {
      const result = await checkGenerationLimit()
      setCanGenerate(result.canGenerate)

      if (
        result.hoursRemaining !== undefined &&
        result.minutesRemaining !== undefined &&
        result.secondsRemaining !== undefined
      ) {
        setTimeRemaining({
          hours: result.hoursRemaining,
          minutes: result.minutesRemaining,
          seconds: result.secondsRemaining,
        })
      } else {
        setTimeRemaining(null)
      }

      setLastCheck(Date.now())
    } catch (error) {
      console.error("Failed to check generation limit:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Controlla lo stato all'avvio e ogni 30 secondi
  useEffect(() => {
    checkLimit()

    const interval = setInterval(() => {
      checkLimit()
    }, 30000) // Controlla ogni 30 secondi

    return () => clearInterval(interval)
  }, [])

  // Aggiorna il tempo rimanente ogni secondo
  useEffect(() => {
    const interval = setInterval(() => {
      if (timeRemaining) {
        let newSeconds = timeRemaining.seconds - 1
        let newMinutes = timeRemaining.minutes
        let newHours = timeRemaining.hours

        if (newSeconds < 0) {
          newSeconds = 59
          newMinutes -= 1
        }

        if (newMinutes < 0) {
          newMinutes = 59
          newHours -= 1
        }

        if (newHours < 0 && newMinutes <= 0 && newSeconds <= 0) {
          setCanGenerate(true)
          setTimeRemaining(null)
          // Ricontrolla con il server
          checkLimit()
        } else {
          setTimeRemaining({ hours: newHours, minutes: newMinutes, seconds: newSeconds })
        }
      }

      // Se sono passati più di 5 secondi dall'ultimo controllo, ricontrolla
      if (Date.now() - lastCheck > 5000 && !timeRemaining) {
        checkLimit()
      }
    }, 1000) // 1000 ms = 1 secondo

    return () => clearInterval(interval)
  }, [timeRemaining, lastCheck])

  // Aggiungi un listener per gli eventi personalizzati
  useEffect(() => {
    const handleImageGenerated = () => {
      // Ricontrolla lo stato dopo la generazione di un'immagine
      checkLimit()
    }

    window.addEventListener("imageGenerated", handleImageGenerated)

    return () => {
      window.removeEventListener("imageGenerated", handleImageGenerated)
    }
  }, [])

  if (isLoading) {
    return null
  }

  // Mostra sempre il componente, anche se canGenerate è true
  return (
    <div
      className={`w-full mt-4 p-4 rounded-md border ${
        canGenerate
          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300"
          : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300"
      }`}
    >
      <div className="flex items-start">
        <Clock className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-medium">{canGenerate ? t("generationAvailable") : t("rateLimitTitle")}</h3>

          {canGenerate ? (
            <p className="mt-1 text-sm">{t("generationReadyMessage")}</p>
          ) : (
            <p className="mt-1 text-sm">{t("rateLimitMessage")}</p>
          )}

          {timeRemaining ? (
            <p className="mt-2 text-sm font-medium">
              {canGenerate ? t("nextResetIn") : t("nextGenerationIn")} {timeRemaining.hours} {t("hoursRemaining")}{" "}
              {timeRemaining.minutes} {t("minutesRemaining")} {timeRemaining.seconds} {t("secondsRemaining")}
            </p>
          ) : canGenerate ? (
            <p className="mt-2 text-sm font-medium">{t("readyToGenerate")}</p>
          ) : null}

          <p className="mt-3 text-xs opacity-75">{t("generationLimited")}</p>
        </div>
      </div>
    </div>
  )
}
