import type { Dimensions, Material, ModelFileRef } from '../api/types'
import { MATERIALS } from '../data/printing'

export const MODEL_EXTENSIONS = ['stl', 'obj', '3mf'] as const
export type ModelExt = (typeof MODEL_EXTENSIONS)[number]

export const MODEL_ACCEPT = '.stl,.obj,.3mf'

export function extOf(name: string) {
  const i = name.lastIndexOf('.')
  return i === -1 ? '' : name.slice(i + 1).toLowerCase()
}

export type FileCheck = { ok: true; ext: ModelExt } | { ok: false; error: string }

/**
 * Type, size and content checks for 3D model uploads. The extension alone is
 * not trusted: the first bytes have to look like the format they claim to be.
 */
export async function validateModelFile(file: File, maxMB: number): Promise<FileCheck> {
  const ext = extOf(file.name)
  if (!(MODEL_EXTENSIONS as readonly string[]).includes(ext)) {
    return { ok: false, error: `“.${ext || '?'}” isn't supported. Upload an STL, OBJ or 3MF file.` }
  }
  if (file.size === 0) return { ok: false, error: 'That file is empty.' }
  if (file.size > maxMB * 1024 * 1024) {
    return { ok: false, error: `File is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is ${maxMB} MB.` }
  }

  const head = new Uint8Array(await file.slice(0, 512).arrayBuffer())
  const text = new TextDecoder().decode(head)

  if (ext === '3mf') {
    // 3MF is a zip container: "PK\x03\x04"
    if (!(head[0] === 0x50 && head[1] === 0x4b && head[2] === 0x03 && head[3] === 0x04)) {
      return { ok: false, error: "This doesn't look like a valid 3MF file." }
    }
  } else if (ext === 'stl') {
    // some exporters write "solid" into binary headers too, so the size check wins
    if (!isBinaryStlSize(file.size, head) && !/^\s*solid\b/i.test(text)) {
      return { ok: false, error: "This doesn't look like a valid STL file." }
    }
  } else if (ext === 'obj') {
    if (!/^\s*(#|v |vn |vt |o |g |mtllib|usemtl|s )/m.test(text)) {
      return { ok: false, error: "This doesn't look like a valid OBJ file." }
    }
  }
  return { ok: true, ext: ext as ModelExt }
}

function isBinaryStlSize(size: number, head: Uint8Array) {
  if (size < 84 || head.length < 84) return false
  const count = new DataView(head.buffer, head.byteOffset, head.byteLength).getUint32(80, true)
  return 84 + count * 50 === size
}

/* --------------------------------------------------------- mesh measure */

export interface MeshInfo {
  dims: Dimensions
  volumeCm3: number
}

type Tri = (ax: number, ay: number, az: number, bx: number, by: number, bz: number, cx: number, cy: number, cz: number) => void

function measurer() {
  let minX = Infinity, minY = Infinity, minZ = Infinity
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity
  let vol = 0
  const pt = (x: number, y: number, z: number) => {
    if (x < minX) minX = x
    if (y < minY) minY = y
    if (z < minZ) minZ = z
    if (x > maxX) maxX = x
    if (y > maxY) maxY = y
    if (z > maxZ) maxZ = z
  }
  // signed volume of the tetrahedron (origin, a, b, c)
  const tri: Tri = (ax, ay, az, bx, by, bz, cx, cy, cz) => {
    pt(ax, ay, az)
    pt(bx, by, bz)
    pt(cx, cy, cz)
    vol += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6
  }
  const result = (): MeshInfo | null => {
    if (!Number.isFinite(minX)) return null
    const r1 = (n: number) => Math.round(n * 10) / 10
    // slicer convention: Z is up → height
    return {
      dims: { h: r1(maxZ - minZ), w: r1(maxX - minX), d: r1(maxY - minY) },
      volumeCm3: Math.round((Math.abs(vol) / 1000) * 100) / 100,
    }
  }
  return { tri, result }
}

function measureStl(buf: ArrayBuffer): MeshInfo | null {
  const view = new DataView(buf)
  const m = measurer()
  if (buf.byteLength >= 84 && 84 + view.getUint32(80, true) * 50 === buf.byteLength) {
    const n = view.getUint32(80, true)
    for (let i = 0; i < n; i++) {
      const o = 84 + i * 50 + 12
      const f = (k: number) => view.getFloat32(o + k * 4, true)
      m.tri(f(0), f(1), f(2), f(3), f(4), f(5), f(6), f(7), f(8))
    }
    return m.result()
  }
  const text = new TextDecoder().decode(buf)
  const re = /vertex\s+(\S+)\s+(\S+)\s+(\S+)/g
  const v: number[] = []
  let match: RegExpExecArray | null
  while ((match = re.exec(text))) {
    v.push(+match[1], +match[2], +match[3])
    if (v.length === 9) {
      m.tri(v[0], v[1], v[2], v[3], v[4], v[5], v[6], v[7], v[8])
      v.length = 0
    }
  }
  return m.result()
}

function measureObj(buf: ArrayBuffer): MeshInfo | null {
  const text = new TextDecoder().decode(buf)
  const verts: number[] = []
  const m = measurer()
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (line.startsWith('v ')) {
      const [, x, y, z] = line.split(/\s+/)
      verts.push(+x, +y, +z)
    } else if (line.startsWith('f ')) {
      const idx = line
        .split(/\s+/)
        .slice(1)
        .map((tok) => {
          const n = parseInt(tok.split('/')[0], 10)
          return n < 0 ? verts.length / 3 + n : n - 1
        })
      // fan-triangulate polygons
      for (let k = 1; k + 1 < idx.length; k++) {
        const a = idx[0] * 3, b = idx[k] * 3, c = idx[k + 1] * 3
        m.tri(verts[a], verts[a + 1], verts[a + 2], verts[b], verts[b + 1], verts[b + 2], verts[c], verts[c + 1], verts[c + 2])
      }
    }
  }
  return m.result()
}

/** Bounding box and enclosed volume for STL / OBJ. 3MF (zipped XML) is left for the admin to inspect. */
export async function measureModel(file: File, ext: ModelExt): Promise<MeshInfo | null> {
  if (ext === '3mf') return null
  try {
    const buf = await file.arrayBuffer()
    const info = ext === 'stl' ? measureStl(buf) : measureObj(buf)
    if (!info || info.volumeCm3 <= 0 || !Number.isFinite(info.volumeCm3)) return info && { ...info, volumeCm3: 0 }
    return info
  } catch {
    return null
  }
}

/**
 * Rough grams from volume: walls and top/bottom skins are always solid, the
 * inside is filled at the infill percentage. ~30% of a small part is shell.
 */
export function estimateWeight(volumeCm3: number, material: Material, infill: number) {
  const fill = 0.3 + 0.7 * (Math.min(100, Math.max(0, infill)) / 100)
  return Math.round(volumeCm3 * MATERIALS[material].density * fill * 10) / 10
}

/** True when the part won't fit the build volume in any axis-aligned orientation. */
export function exceedsBuildVolume(dims: Dimensions, vol: { x: number; y: number; z: number }) {
  const part = [dims.h, dims.w, dims.d].sort((a, b) => b - a)
  const bed = [vol.x, vol.y, vol.z].sort((a, b) => b - a)
  return part.some((p, i) => p > bed[i])
}

export function toFileRef(id: string, file: File, ext: ModelExt, measured: MeshInfo | null): ModelFileRef {
  return { id, name: file.name, ext, size: file.size, measured }
}
