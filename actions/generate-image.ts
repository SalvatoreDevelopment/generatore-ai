"use server"

import { getOpenAI, isConfigured } from "@/lib/openai"
import { checkGenerationLimit, recordGeneration } from "@/lib/rate-limit"
import { isGenerationEnabled } from "@/lib/admin-control"

// Simple security validation functions
function validatePrompt(prompt: string) {
  if (!prompt || prompt.trim() === "") {
    return { isValid: false, error: "Prompt cannot be empty" }
  }

  if (prompt.length > 1000) {
    return { isValid: false, error: "Prompt is too long (max 1000 characters)" }
  }

  // Basic content filtering - could be expanded
  const forbiddenTerms = ["explicit", "nude", "pornography", "violence"]
  for (const term of forbiddenTerms) {
    if (prompt.toLowerCase().includes(term)) {
      return { isValid: false, error: "Prompt contains forbidden content" }
    }
  }

  return { isValid: true, error: null }
}

function validateApiConfig() {
  if (!isConfigured()) {
    return { isValid: false, error: "OpenAI API key is not configured" }
  }
  return { isValid: true, error: null }
}

function logSecurityEvent(event: string, details?: Record<string, any>) {
  // In a real app, you would log to a secure logging service
  console.log(`[SECURITY] ${event}`, details || {})
}

export type GenerateImageResult = {
  success: boolean
  images?: string[]
  error?: string
  rateLimited?: boolean
  adminDisabled?: boolean
  nextGenerationTime?: Date
  hoursRemaining?: number
  minutesRemaining?: number
  secondsRemaining?: number
}

export async function generateImage(prompt: string): Promise<GenerateImageResult> {
  try {
    // Verifica se la generazione è abilitata dall'amministratore
    const generationEnabled = await isGenerationEnabled()
    if (!generationEnabled) {
      return {
        success: false,
        error: "Image generation is currently disabled by the administrator.",
        adminDisabled: true,
      }
    }

    // Verifica il limite di generazione
    const rateLimitCheck = await checkGenerationLimit()
    if (!rateLimitCheck.canGenerate) {
      return {
        success: false,
        error: "Rate limit exceeded. You can generate only one image per day.",
        rateLimited: true,
        nextGenerationTime: rateLimitCheck.nextGenerationTime,
        hoursRemaining: rateLimitCheck.hoursRemaining,
        minutesRemaining: rateLimitCheck.minutesRemaining,
        secondsRemaining: rateLimitCheck.secondsRemaining,
      }
    }

    // Log the request (without the full prompt for privacy)
    const promptPreview = prompt.length > 20 ? `${prompt.substring(0, 20)}...` : prompt
    logSecurityEvent("image_generation_request", {
      promptLength: prompt.length,
      promptPreview,
    })

    // Validate the prompt
    const promptValidation = validatePrompt(prompt)
    if (!promptValidation.isValid) {
      logSecurityEvent("prompt_validation_failed", {
        error: promptValidation.error,
        promptPreview,
      })

      return {
        success: false,
        error: promptValidation.error,
      }
    }

    // Verify API configuration
    const apiConfigValidation = validateApiConfig()
    if (!apiConfigValidation.isValid) {
      logSecurityEvent("api_config_validation_failed", {
        error: apiConfigValidation.error,
      })

      return {
        success: false,
        error: apiConfigValidation.error,
      }
    }

    // Get the OpenAI client (server-side only)
    const openai = getOpenAI()

    // Generate the image with DALL-E
    const response = await openai.images.generate({
      model: "dall-e-2", // Utilizziamo DALL-E 2 per risparmiare sui costi
      prompt: prompt,
      n: 1, // Number of images to generate
      size: "1024x1024", // Image size
    })

    // Extract image URLs
    const images = response.data.map((item) => item.url || "")

    // Registra la generazione per il limite giornaliero
    await recordGeneration()

    logSecurityEvent("image_generation_success", {
      imageCount: images.length,
    })

    return {
      success: true,
      images,
    }
  } catch (error) {
    // Log the error
    logSecurityEvent("image_generation_error", {
      error: error instanceof Error ? error.message : "Unknown error",
    })

    console.error("Error generating image:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
