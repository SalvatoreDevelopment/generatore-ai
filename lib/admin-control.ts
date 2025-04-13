"use server"

import { cookies } from "next/headers"

const GENERATION_ENABLED_COOKIE = "generation_enabled"
const GENERATION_LIMIT_COUNT_COOKIE = "generation_limit_count"
const GENERATION_LIMIT_HOURS_COOKIE = "generation_limit_hours"
const ADMIN_PASSWORD = "admin123" // In un'applicazione reale, usare un sistema più sicuro

export type AdminControlResult = {
  success: boolean
  message?: string
}

export type GenerationSettings = {
  enabled: boolean
  limitCount: number
  limitHours: number
}

export async function getGenerationSettings(): Promise<GenerationSettings> {
  const cookieStore = cookies()
  const enabledCookie = cookieStore.get(GENERATION_ENABLED_COOKIE)
  const limitCountCookie = cookieStore.get(GENERATION_LIMIT_COUNT_COOKIE)
  const limitHoursCookie = cookieStore.get(GENERATION_LIMIT_HOURS_COOKIE)

  // Valori predefiniti se i cookie non esistono
  return {
    enabled: enabledCookie ? enabledCookie.value === "true" : true, // Default a true se il cookie non esiste
    limitCount: limitCountCookie ? Number.parseInt(limitCountCookie.value, 10) : 1,
    limitHours: limitHoursCookie ? Number.parseInt(limitHoursCookie.value, 10) : 24,
  }
}

export async function isGenerationEnabled(): Promise<boolean> {
  const settings = await getGenerationSettings()
  return settings.enabled
}

export async function getGenerationLimitCount(): Promise<number> {
  const settings = await getGenerationSettings()
  return settings.limitCount
}

export async function getGenerationLimitHours(): Promise<number> {
  const settings = await getGenerationSettings()
  return settings.limitHours
}

export async function updateGenerationSettings(
  password: string,
  settings: Partial<GenerationSettings>,
): Promise<AdminControlResult> {
  // Verifica la password
  if (password !== ADMIN_PASSWORD) {
    return {
      success: false,
      message: "Password non valida",
    }
  }

  const cookieStore = cookies()
  const currentSettings = await getGenerationSettings()

  // Aggiorna solo i valori forniti
  const newSettings = {
    ...currentSettings,
    ...settings,
  }

  // Imposta i cookie per le impostazioni
  if (settings.enabled !== undefined) {
    cookieStore.set(GENERATION_ENABLED_COOKIE, newSettings.enabled ? "true" : "false", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
  }

  if (settings.limitCount !== undefined) {
    cookieStore.set(GENERATION_LIMIT_COUNT_COOKIE, newSettings.limitCount.toString(), {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
  }

  if (settings.limitHours !== undefined) {
    cookieStore.set(GENERATION_LIMIT_HOURS_COOKIE, newSettings.limitHours.toString(), {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
  }

  return {
    success: true,
    message: "Impostazioni aggiornate con successo",
  }
}

export async function resetUserGenerationLimit(password: string): Promise<AdminControlResult> {
  // Verifica la password
  if (password !== ADMIN_PASSWORD) {
    return {
      success: false,
      message: "Password non valida",
    }
  }

  const cookieStore = cookies()

  // Elimina i cookie relativi al limite di generazione dell'utente
  cookieStore.delete("last_image_generation")
  cookieStore.delete("image_generation_count")

  return {
    success: true,
    message: "Limite di generazione dell'utente resettato con successo",
  }
}
