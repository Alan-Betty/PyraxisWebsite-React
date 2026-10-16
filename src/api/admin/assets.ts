// Staff endpoints: site-wide downloadable assets.
import type { Asset, AssetAccess } from '../types'
import { ApiError, blobs, latency, mutate, now, readDb, uid } from '../store'
import { requireActor } from '../auth'

export const ASSET_MAX_MB = 100
const BLOCKED_EXT = ['exe', 'msi', 'bat', 'cmd', 'sh', 'ps1', 'scr', 'com', 'js', 'html', 'htm', 'svg']

export async function listAssets(): Promise<Asset[]> {
  requireActor('assets')
  return [...readDb().assets].sort((a, b) => a.name.localeCompare(b.name))
}

function checkFile(file: File) {
  if (file.size === 0) throw new ApiError('That file is empty.')
  if (file.size > ASSET_MAX_MB * 1024 * 1024) throw new ApiError(`Files up to ${ASSET_MAX_MB} MB can be stored here. Host larger installers externally and add them as a link.`)
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (BLOCKED_EXT.includes(ext)) throw new ApiError(`.${ext} files can't be uploaded here — link to them instead.`)
}

function cleanFilename(name: string) {
  const n = name.trim().replace(/[\\/:*?"<>|]+/g, '-')
  if (!n) throw new ApiError('File name is required.')
  return n
}

export interface AssetMeta {
  name: string
  filename: string
  description: string
  category: string
  version: string
  access: AssetAccess
  enabled: boolean
}

export async function uploadAsset(file: File, meta: Partial<AssetMeta>): Promise<Asset> {
  requireActor('assets')
  checkFile(file)
  const blobId = uid('blob')
  try {
    await blobs.put(blobId, file)
  } catch {
    throw new ApiError("Couldn't store that file in this browser.")
  }
  const t = now()
  const asset: Asset = {
    id: uid('ast'),
    name: meta.name?.trim() || file.name.replace(/\.[^.]+$/, ''),
    filename: cleanFilename(meta.filename || file.name),
    description: meta.description?.trim() ?? '',
    category: meta.category?.trim() || 'general',
    version: meta.version?.trim() || '1.0',
    mime: file.type || 'application/octet-stream',
    size: file.size,
    source: { kind: 'blob', blobId },
    enabled: meta.enabled ?? false,
    access: meta.access ?? 'public',
    downloads: 0,
    createdAt: t,
    updatedAt: t,
  }
  mutate((db) => {
    db.assets.push(asset)
  })
  return asset
}

export async function addLink(url: string, meta: Partial<AssetMeta>): Promise<Asset> {
  requireActor('assets')
  await latency()
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new ApiError('Enter a full URL starting with https://')
  }
  if (parsed.protocol !== 'https:') throw new ApiError('Links must use https://')
  const t = now()
  const asset: Asset = {
    id: uid('ast'),
    name: meta.name?.trim() || parsed.hostname,
    filename: meta.filename?.trim() || parsed.pathname.split('/').pop() || parsed.hostname,
    description: meta.description?.trim() ?? '',
    category: meta.category?.trim() || 'general',
    version: meta.version?.trim() || 'latest',
    mime: 'text/html',
    size: 0,
    source: { kind: 'external', url: parsed.toString() },
    enabled: meta.enabled ?? false,
    access: meta.access ?? 'public',
    downloads: 0,
    createdAt: t,
    updatedAt: t,
  }
  mutate((db) => {
    db.assets.push(asset)
  })
  return asset
}

/** Swap the file behind an asset (new version), keeping its URL, stats and settings. */
export async function replaceAssetFile(id: string, file: File, version: string): Promise<void> {
  requireActor('assets')
  checkFile(file)
  const existing = readDb().assets.find((a) => a.id === id)
  if (!existing) throw new ApiError('Asset not found.', 404)
  const blobId = uid('blob')
  await blobs.put(blobId, file)
  mutate((db) => {
    const a = db.assets.find((x) => x.id === id)!
    a.source = { kind: 'blob', blobId }
    a.size = file.size
    a.mime = file.type || a.mime
    a.version = version.trim() || a.version
    a.updatedAt = now()
  })
  if (existing.source.kind === 'blob') await blobs.remove(existing.source.blobId).catch(() => undefined)
}

export async function updateAsset(id: string, patch: Partial<AssetMeta>): Promise<void> {
  requireActor('assets')
  await latency(60)
  mutate((db) => {
    const a = db.assets.find((x) => x.id === id)
    if (!a) throw new ApiError('Asset not found.', 404)
    if (patch.name !== undefined && !patch.name.trim()) throw new ApiError('Display name is required.')
    if (patch.filename !== undefined) patch.filename = cleanFilename(patch.filename)
    Object.assign(a, patch, { updatedAt: now() })
  })
}

export async function deleteAsset(id: string): Promise<void> {
  requireActor('assets')
  await latency()
  const a = readDb().assets.find((x) => x.id === id)
  if (!a) return
  if (a.source.kind === 'static') throw new ApiError('Bundled files ship with the site build — disable this one instead.')
  mutate((db) => {
    db.assets = db.assets.filter((x) => x.id !== id)
    db.downloads = db.downloads.filter((d) => d.assetId !== id)
  })
  if (a.source.kind === 'blob') await blobs.remove(a.source.blobId).catch(() => undefined)
}
