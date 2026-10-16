/*
 * Persistence for the API layer.
 *
 * This site has no server yet, so records live in localStorage and uploaded
 * files in IndexedDB — one browser, one database. Every read and write goes
 * through the service modules next to this file (auth, orders, coupons, …),
 * which are written like request handlers: they check the caller's session
 * and role, validate input, then touch the store. Swapping this file for
 * fetch() calls to a real backend leaves the UI untouched.
 */
import type { Asset, Coupon, DownloadEvent, PrintOrder, PrintTemplate, SiteConfig, User } from './types'

export interface DbShape {
  version: 1
  users: User[]
  orders: PrintOrder[]
  coupons: Coupon[]
  templates: PrintTemplate[]
  assets: Asset[]
  downloads: DownloadEvent[]
  config: SiteConfig
  seq: { order: number }
}

const DB_KEY = 'pyraxis-db-v1'
export const MAX_DOWNLOAD_EVENTS = 5000

let cache: DbShape | null = null
const listeners = new Set<() => void>()

export function hasDb() {
  try {
    return localStorage.getItem(DB_KEY) !== null
  } catch {
    return false
  }
}

export function readDb(): DbShape {
  if (cache) return cache
  const raw = localStorage.getItem(DB_KEY)
  if (!raw) throw new Error('Database not initialised')
  cache = JSON.parse(raw) as DbShape
  return cache
}

export function writeDb(db: DbShape) {
  cache = db
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch {
    throw new ApiError('Storage is full — clear old download logs or uploaded files and try again.')
  }
  listeners.forEach((l) => l())
}

/** Read-modify-write on a structured clone so a thrown handler leaves nothing half-applied. */
export function mutate<T>(fn: (db: DbShape) => T): T {
  const draft = structuredClone(readDb())
  const out = fn(draft)
  writeDb(draft)
  return out
}

export function clearDb() {
  cache = null
  localStorage.removeItem(DB_KEY)
}

/** Re-run queries when data changes in this tab or another one. */
export function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === DB_KEY || e.key === null) {
      cache = null
      listeners.forEach((l) => l())
    }
  })
}

/* ---------------------------------------------------------------- utils */

export class ApiError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

export function uid(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`
}

export const now = () => new Date().toISOString()

/** A tiny delay so loading states behave the way they will against a network. */
export const latency = (ms = 120) => new Promise((r) => setTimeout(r, ms))

export async function hashPassword(password: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

export function randomSalt() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('')
}

export function tempPassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  return Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => alphabet[b % alphabet.length]).join('')
}

/* ----------------------------------------------------------- blob store */

const IDB_NAME = 'pyraxis-files'
const IDB_STORE = 'blobs'

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function idb<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest): Promise<T> {
  const db = await openIdb()
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, mode)
    const req = run(tx.objectStore(IDB_STORE))
    req.onsuccess = () => resolve(req.result as T)
    req.onerror = () => reject(req.error)
  }).finally(() => db.close())
}

export const blobs = {
  put: (id: string, blob: Blob) => idb<IDBValidKey>('readwrite', (s) => s.put(blob, id)),
  get: (id: string) => idb<Blob | undefined>('readonly', (s) => s.get(id)),
  remove: (id: string) => idb<undefined>('readwrite', (s) => s.delete(id)),
  clear: () => idb<undefined>('readwrite', (s) => s.clear()),
}
