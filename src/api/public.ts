// Endpoints anyone can call — no session required.
import type { Asset, SiteConfig } from './types'
import { ApiError, blobs, latency, MAX_DOWNLOAD_EVENTS, mutate, now, readDb } from './store'
import { ensureDb } from './seed'
import { sessionUser } from './auth'
import { isStaff } from './permissions'

export async function getConfig(): Promise<SiteConfig> {
  await ensureDb()
  return readDb().config
}

export async function listPublicAssets(): Promise<Asset[]> {
  await ensureDb()
  return readDb().assets.filter((a) => a.enabled && a.access === 'public')
}

function canDownload(a: Asset) {
  if (!a.enabled) return false
  if (a.access === 'public') return true
  const u = sessionUser()
  if (!u) return false
  return a.access === 'premium' ? true : isStaff(u.role)
}

/**
 * Check access, count the download and hand back a URL to fetch it from.
 * Callers revoke blob: URLs once the download has started.
 */
export async function downloadAsset(id: string): Promise<{ url: string; filename: string; external: boolean; revoke: boolean }> {
  await ensureDb()
  await latency(60)
  const asset = readDb().assets.find((a) => a.id === id)
  if (!asset || !canDownload(asset)) throw new ApiError('This download is unavailable.', 404)

  let url: string
  let revoke = false
  if (asset.source.kind === 'blob') {
    const blob = await blobs.get(asset.source.blobId)
    if (!blob) throw new ApiError('The file for this download is missing.', 404)
    url = URL.createObjectURL(blob)
    revoke = true
  } else {
    url = asset.source.url
  }

  mutate((db) => {
    const a = db.assets.find((x) => x.id === id)!
    a.downloads += 1
    db.downloads.push({ assetId: id, at: now(), bytes: a.size })
    if (db.downloads.length > MAX_DOWNLOAD_EVENTS) db.downloads.splice(0, db.downloads.length - MAX_DOWNLOAD_EVENTS)
  })
  return { url, filename: asset.filename, external: asset.source.kind === 'external', revoke }
}

/** Trigger the browser download for an asset. */
export async function startDownload(id: string) {
  const d = await downloadAsset(id)
  if (d.external) {
    window.open(d.url, '_blank', 'noopener')
    return
  }
  const a = document.createElement('a')
  a.href = d.url
  a.download = d.filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  if (d.revoke) setTimeout(() => URL.revokeObjectURL(d.url), 30_000)
}
