"use server"

import { cookies } from "next/headers"
import { getGenerationLimitHours } from "./admin-control"

const GENERATION_LIMIT_COOKIE = "last_image_generation"
const GENERATION_COUNT_COOKIE = "image_generation_count"

export type RateLimitCheck = {
  canGenerate: boolean
  nextGenerationTime?: Date
  hoursRemaining?: number
  minutesRemaining?: number
  secondsRemaining?: number
  generationsLeft?: number
  totalGenerations?: number
}

export async function checkGenerationLimit(): Promise<RateLimitCheck> {
  const cookieStore = cookies()
  const lastGenerationCookie = cookieStore.get(GENERATION_LIMIT_COOKIE)
  const generationCountCookie = cookieStore.get(GENERATION_COUNT_COOKIE)

  // Controlla se c'è stato un reset globale
  const globalResetCookie = cookieStore.get("global_reset_timestamp")

  if (globalResetCookie) {
    const globalResetTime = Number.parseInt(globalResetCookie.value, 10)
    const lastGenTime = lastGenerationCookie ? new Date(lastGenerationCookie.value).getTime() : 0

    // Se il reset globale è più recente dell'ultima generazione, resetta i limiti
    if (globalResetTime > lastGenTime) {
      // Elimina i cookie di limite per questo utente
      cookieStore.delete(GENERATION_LIMIT_COOKIE)
      cookieStore.delete(GENERATION_COUNT_COOKIE)

      return {
        canGenerate: true,
        generationsLeft: 1,
        totalGenerations: 1,
      }
    }
  }

  // Ottieni il limite di ore dalle impostazioni amministrative
  const limitHours = await getGenerationLimitHours()

  if (!lastGenerationCookie) {
    return {
      canGenerate: true,
      generationsLeft: 1,
      totalGenerations: 1,
    }
  }

  const lastGeneration = new Date(lastGenerationCookie.value)
  const now = new Date()

  // Calcola il tempo trascorso dall'ultima generazione in millisecondi
  const msSinceLastGeneration = now.getTime() - lastGeneration.getTime()

  // Converti il limite di ore in millisecondi
  const limitMs = limitHours * 60 * 60 * 1000

  if (msSinceLastGeneration >= limitMs) {
    // Se è passato abbastanza tempo, resetta il contatore
    return {
      canGenerate: true,
      generationsLeft: 1,
      totalGenerations: 1,
    }
  }

  // Calcola quando sarà possibile generare la prossima immagine
  const nextGenerationTime = new Date(lastGeneration.getTime() + limitMs)

  // Calcola il tempo rimanente in millisecondi
  const msRemaining = limitMs - msSinceLastGeneration

  // Converti in ore, minuti e secondi
  const hoursRemaining = Math.floor(msRemaining / (1000 * 60 * 60))
  const minutesRemaining = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60))
  const secondsRemaining = Math.floor((msRemaining % (1000 * 60)) / 1000)

  return {
    canGenerate: false,
    nextGenerationTime,
    hoursRemaining,
    minutesRemaining,
    secondsRemaining,
    generationsLeft: 0,
    totalGenerations: 1,
  }
}

export async function recordGeneration(): Promise<void> {
  const cookieStore = cookies()
  const now = new Date().toISOString()
  const limitHours = await getGenerationLimitHours()

  // Imposta un cookie che scade dopo il periodo di limitazione
  cookieStore.set(GENERATION_LIMIT_COOKIE, now, {
    expires: new Date(Date.now() + limitHours * 60 * 60 * 1000),
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  })

  // Incrementa il contatore di generazioni
  const countCookie = cookieStore.get(GENERATION_COUNT_COOKIE)
  const currentCount = countCookie ? Number.parseInt(countCookie.value, 10) : 0

  cookieStore.set(GENERATION_COUNT_COOKIE, (currentCount + 1).toString(), {
    expires: new Date(Date.now() + limitHours * 60 * 60 * 1000),
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  })
}
