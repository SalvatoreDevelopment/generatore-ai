"use server"

import { isConfigured } from "@/lib/openai"

export async function checkApiStatus() {
  return {
    configured: isConfigured(),
    timestamp: new Date().toISOString(),
  }
}
