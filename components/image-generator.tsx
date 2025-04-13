"use client"

import { useState, useEffect, useRef, type KeyboardEvent } from "react"
import ImageGallery from "./image-gallery"
import SecurityInfo from "./security-info"
import GenerationStatus from "./generation-status"
import GenerationLimit from "./generation-limit"
import { useLanguage } from "@/contexts/language-context"
import { generateImage } from "@/actions/generate-image"
import { checkGenerationLimit } from "@/lib/rate-limit"
import { checkGenerationEnabled } from "@/actions/admin-control"
import { emitImageGenerated } from "@/lib/events"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

export default function ImageGenerator() {
  const { t } = useLanguage()
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [terminalText, setTerminalText] = useState<string[]>([])
  const [cursorVisible, setCursorVisible] = useState(true)
  const [canGenerate, setCanGenerate] = useState(true)
  const [adminEnabled, setAdminEnabled] = useState(true)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Verifica il limite di generazione e lo stato di abilitazione all'avvio
  const checkStatus = async () => {
    try {
      // Verifica il limite di generazione
      const limitResult = await checkGenerationLimit()

      // Verifica se la generazione è abilitata dall'amministratore
      const adminResult = await checkGenerationEnabled()

      setCanGenerate(limitResult.canGenerate)
      setAdminEnabled(adminResult.enabled)

      return { canGenerate: limitResult.canGenerate, adminEnabled: adminResult.enabled }
    } catch (error) {
      console.error("Failed to check generation status:", error)
      return { canGenerate: false, adminEnabled: false }
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  // Initialize terminal text with translations
  useEffect(() => {
    setTerminalText([t("terminalWelcome"), t("terminalInstructions"), t("terminalExample")])
  }, [t])

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // Focus the hidden input when terminal is clicked
  useEffect(() => {
    const handleTerminalClick = () => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }

    const terminal = terminalRef.current
    if (terminal) {
      terminal.addEventListener("click", handleTerminalClick)
      return () => {
        terminal.removeEventListener("click", handleTerminalClick)
      }
    }
  }, [])

  // Auto-scroll terminal to bottom when content changes
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [terminalText])

  const handleGenerate = async (inputPrompt: string) => {
    if (!inputPrompt.trim()) {
      setError(t("promptEmpty"))
      setTerminalText((prev) => [...prev, t("promptEmpty")])
      return
    }

    if (inputPrompt.length > 1000) {
      setError(t("promptTooLong"))
      setTerminalText((prev) => [...prev, t("promptTooLong")])
      return
    }

    // Verifica se la generazione è abilitata dall'amministratore e se l'utente può generare
    const status = await checkStatus()

    if (!status.adminEnabled) {
      setError(t("generationDisabledByAdmin"))
      setTerminalText((prev) => [...prev, t("generationDisabledByAdmin")])
      return
    }

    if (!status.canGenerate) {
      const limitCheck = await checkGenerationLimit()
      const errorMessage = t("rateLimitExceeded")
      setError(errorMessage)
      setTerminalText((prev) => [...prev, errorMessage])

      if (limitCheck.hoursRemaining !== undefined && limitCheck.minutesRemaining !== undefined) {
        setTerminalText((prev) => [
          ...prev,
          `${t("nextGenerationIn")} ${limitCheck.hoursRemaining} ${t("hoursRemaining")} ${limitCheck.minutesRemaining} ${t("minutesRemaining")} ${limitCheck.secondsRemaining} ${t("secondsRemaining")}`,
        ])
      }
      return
    }

    setError(null)
    setIsGenerating(true)

    // Add the command to terminal
    setTerminalText((prev) => [...prev, `> ${inputPrompt}`])

    // Add processing messages
    setTerminalText((prev) => [...prev, t("initializingModel")])

    setTimeout(() => {
      setTerminalText((prev) => [...prev, t("processingPrompt")])
    }, 800)

    try {
      // Call the server action to generate the image
      const result = await generateImage(inputPrompt)

      if (result.adminDisabled) {
        setError(result.error || t("generationDisabledByAdmin"))
        setTerminalText((prev) => [...prev, result.error || t("generationDisabledByAdmin")])
        setAdminEnabled(false)
      } else if (result.rateLimited) {
        setError(result.error || t("rateLimitExceeded"))
        setTerminalText((prev) => [...prev, result.error || t("rateLimitExceeded")])

        if (result.hoursRemaining !== undefined && result.minutesRemaining !== undefined) {
          setTerminalText((prev) => [
            ...prev,
            `${t("nextGenerationIn")} ${result.hoursRemaining} ${t("hoursRemaining")} ${result.minutesRemaining} ${t("minutesRemaining")}`,
          ])
        }

        // Aggiorna lo stato del limite
        setCanGenerate(false)
      } else if (result.success && result.images && result.images.length > 0) {
        // Sostituisci le immagini precedenti con quella nuova
        setImages(result.images)
        setTerminalText((prev) => [...prev, t("imagesGenerated")])

        // Aggiorna lo stato del limite dopo una generazione riuscita
        setCanGenerate(false)
        // Emetti un evento per notificare gli altri componenti
        emitImageGenerated()
      } else {
        const errorMessage = result.error || t("apiError")
        setError(errorMessage)
        setTerminalText((prev) => [...prev, `Error: ${errorMessage}`])
        setTerminalText((prev) => [...prev, t("tryAgain")])
      }
    } catch (err) {
      console.error("Failed to generate image:", err)
      setError(t("apiError"))
      setTerminalText((prev) => [...prev, t("apiError")])
      setTerminalText((prev) => [...prev, t("tryAgain")])
    } finally {
      setIsGenerating(false)
      setTerminalText((prev) => [...prev, "> "])
      setPrompt("")

      // Verifica nuovamente lo stato dopo la generazione
      await checkStatus()

      // Riattiva il focus sull'input
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 100)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isGenerating) {
      e.preventDefault()
      handleGenerate(prompt)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-8 py-10 w-full max-w-4xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold text-center">
        <span className="text-gray-900 dark:text-white">AI </span>
        <span className="text-[#9333EA]">Image Generator</span>
      </h1>

      {/* Generation Status */}
      <GenerationStatus />

      {/* Generation Limit - Mostra sempre il componente */}
      <GenerationLimit />

      {/* Terminal-like interface */}
      <div className="w-full border border-gray-300 dark:border-gray-800 bg-white/80 dark:bg-[#010817]/80 rounded-md overflow-hidden backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-[#0a0f1f] border-b border-gray-300 dark:border-gray-800">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">image-generator.sh</div>
          <div className="w-4"></div>
        </div>
        <div
          ref={terminalRef}
          className="p-4 font-mono text-sm text-gray-700 dark:text-gray-300 h-64 overflow-y-auto cursor-text relative"
          onClick={() => inputRef.current?.focus()}
        >
          {terminalText.map((line, i) => (
            <div key={i} className="mb-1">
              {line}
            </div>
          ))}
          <div className="flex items-center">
            <span className="text-[#9333EA]">❯</span>
            <span className="ml-2">{prompt}</span>
            <span
              className={`ml-0.5 inline-block w-2 h-4 bg-[#9333EA] ${cursorVisible ? "opacity-100" : "opacity-0"}`}
            ></span>
          </div>

          {/* Hidden input that captures keystrokes */}
          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            className="opacity-0 absolute top-0 left-0 h-0 w-0"
            autoFocus
            disabled={isGenerating}
          />
        </div>

        {/* Pulsante per inviare il comando */}
        <div className="p-3 border-t border-gray-300 dark:border-gray-800 bg-gray-100 dark:bg-[#0a0f1f] flex">
          <Button
            onClick={() => handleGenerate(prompt)}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-[#9333EA] hover:bg-[#7928CA] flex items-center justify-center"
          >
            <Send className="h-4 w-4 mr-2" />
            {isGenerating ? t("generating") : t("generateButton")}
          </Button>
        </div>
      </div>

      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-t-2 border-b-2 border-[#9333EA] animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border-l-2 border-r-2 border-[#9333EA] animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-[#9333EA] font-medium">AI</div>
          </div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">{t("creatingMasterpiece")}</p>
        </div>
      )}

      {error && (
        <div className="w-full p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      <ImageGallery images={images} />

      <SecurityInfo />
    </div>
  )
}
