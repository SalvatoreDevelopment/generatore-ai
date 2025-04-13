"use server"

import { updateGenerationSettings, getGenerationSettings, resetUserGenerationLimit } from "@/lib/admin-control"

export async function toggleGenerationStatus(password: string, enabled: boolean) {
  return await updateGenerationSettings(password, { enabled })
}

export async function updateLimitSettings(password: string, limitCount: number, limitHours: number) {
  return await updateGenerationSettings(password, { limitCount, limitHours })
}

export async function checkGenerationEnabled() {
  const settings = await getGenerationSettings()
  return {
    enabled: settings.enabled,
    limitCount: settings.limitCount,
    limitHours: settings.limitHours,
  }
}

export async function resetUserLimit(password: string) {
  return await resetUserGenerationLimit(password)
}
