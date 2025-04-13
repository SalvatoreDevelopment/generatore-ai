"use server"

import { checkGenerationLimit } from "@/lib/rate-limit"

export async function checkRateLimit() {
  return await checkGenerationLimit()
}
