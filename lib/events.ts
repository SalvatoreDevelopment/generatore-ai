"use client"

// Funzione per emettere un evento di generazione immagine
export function emitImageGenerated() {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("imageGenerated")
    window.dispatchEvent(event)
  }
}
