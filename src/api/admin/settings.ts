// Admin-only endpoints: site configuration.
import type { SiteConfig } from '../types'
import { ApiError, latency, mutate } from '../store'
import { requireActor } from '../auth'
import { resetDb } from '../seed'

export async function updateConfig(patch: SiteConfig): Promise<SiteConfig> {
  requireActor('settings')
  await latency()
  const digits = patch.whatsappNumber.replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 15) throw new ApiError('WhatsApp number needs the country code, e.g. 91XXXXXXXXXX.')
  if (!(patch.shippingFee >= 0)) throw new ApiError('Shipping fee cannot be negative.')
  if (!(patch.maxUploadMB >= 1 && patch.maxUploadMB <= 200)) throw new ApiError('Upload limit must be between 1 and 200 MB.')
  const { x, y, z } = patch.buildVolume
  if (![x, y, z].every((v) => v > 0 && v <= 2000)) throw new ApiError('Build volume must be between 1 and 2000 mm per axis.')
  return mutate((db) => {
    db.config = { ...patch, whatsappNumber: digits }
    return db.config
  })
}

/** Wipe every record and uploaded file in this browser and start from the seed data. */
export async function resetAllData() {
  requireActor('settings')
  await resetDb()
}
