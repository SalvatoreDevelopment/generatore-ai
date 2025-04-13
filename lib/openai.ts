// This file should only be imported by server components or server actions
import OpenAI from "openai"

// Check if we're on the server side
const isServer = typeof window === "undefined"

// Only initialize OpenAI on the server
let openaiInstance: OpenAI | null = null

// Debug information
const debugApiKey = process.env.OPENAI_API_KEY
  ? `${process.env.OPENAI_API_KEY.substring(0, 3)}...${process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 4)}`
  : "not found"

console.log(`[DEBUG] OpenAI API key status: ${debugApiKey}`)
console.log(`[DEBUG] Environment: ${process.env.NODE_ENV}`)

if (isServer) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error("[ERROR] OPENAI_API_KEY environment variable is not set")
    } else {
      openaiInstance = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
      console.log("[INFO] OpenAI client initialized successfully")
    }
  } catch (error) {
    console.error("[ERROR] Failed to initialize OpenAI client:", error)
  }
}

export function getOpenAI() {
  if (!isServer) {
    throw new Error("OpenAI client can only be used on the server")
  }

  if (!openaiInstance) {
    throw new Error("OpenAI client not initialized. Make sure OPENAI_API_KEY is set in your environment variables.")
  }

  return openaiInstance
}

// Verifica se l'API key è configurata
export function isConfigured() {
  return isServer && !!process.env.OPENAI_API_KEY
}
