// Funzione per validare il prompt dell'utente
export function validatePrompt(prompt: string): { isValid: boolean; error?: string } {
  // Verifica che il prompt non sia vuoto
  if (!prompt || prompt.trim() === "") {
    return { isValid: false, error: "Il prompt non può essere vuoto" }
  }

  // Verifica la lunghezza del prompt (OpenAI ha limiti)
  if (prompt.length > 1000) {
    return { isValid: false, error: "Il prompt è troppo lungo (max 1000 caratteri)" }
  }

  // Lista di parole chiave potenzialmente problematiche
  const forbiddenKeywords = [
    "hack",
    "exploit",
    "bypass",
    "illegal",
    "nude",
    "naked",
    "pornography",
    "violence",
    "gore",
    "blood",
    "kill",
    "murder",
    "suicide",
    "terrorist",
  ]

  // Verifica se il prompt contiene parole chiave problematiche
  const lowercasePrompt = prompt.toLowerCase()
  for (const keyword of forbiddenKeywords) {
    if (lowercasePrompt.includes(keyword)) {
      return {
        isValid: false,
        error: "Il prompt contiene contenuti non consentiti",
      }
    }
  }

  return { isValid: true }
}

// Funzione per verificare la configurazione dell'API
export function validateApiConfig(): { isValid: boolean; error?: string } {
  // Verifica che la chiave API sia presente
  if (!process.env.OPENAI_API_KEY) {
    return { isValid: false, error: "Chiave API OpenAI non configurata" }
  }

  // Verifica che la chiave API abbia un formato valido (inizia con "sk-")
  if (!process.env.OPENAI_API_KEY.startsWith("sk-")) {
    return { isValid: false, error: "Formato della chiave API OpenAI non valido" }
  }

  return { isValid: true }
}

// Funzione per mascherare la chiave API nei log
export function maskApiKey(apiKey: string): string {
  if (!apiKey) return "undefined"

  // Mostra solo i primi 3 e gli ultimi 4 caratteri
  const firstPart = apiKey.substring(0, 3)
  const lastPart = apiKey.substring(apiKey.length - 4)

  return `${firstPart}...${lastPart}`
}

// Funzione per registrare gli eventi di sicurezza
export function logSecurityEvent(event: string, details: Record<string, any> = {}): void {
  // Maschera eventuali informazioni sensibili
  if (details.apiKey) {
    details.apiKey = maskApiKey(details.apiKey)
  }

  // In produzione, potresti inviare questi log a un servizio di monitoraggio
  console.log(`[SECURITY EVENT] ${event}`, JSON.stringify(details))
}
