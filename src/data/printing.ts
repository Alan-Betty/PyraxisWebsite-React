import type { Material } from '../api/types'

export interface MaterialInfo {
  name: Material
  full: string
  /** g/cm³ — used for weight estimates from a mesh volume */
  density: number
  traits: string[]
  bestFor: string
  /** 1–5 */
  strength: number
  flex: number
  heat: number
}

export const MATERIALS: Record<Material, MaterialInfo> = {
  PLA: {
    name: 'PLA',
    full: 'Polylactic acid',
    density: 1.24,
    traits: ['crisp detail', 'wide colour range', 'plant-based'],
    bestFor: 'Prototypes, display models, keychains, desk gear',
    strength: 3,
    flex: 1,
    heat: 1,
  },
  ABS: {
    name: 'ABS',
    full: 'Acrylonitrile butadiene styrene',
    density: 1.04,
    traits: ['heat resistant', 'sandable', 'impact tough'],
    bestFor: 'Enclosures, automotive clips, parts near heat',
    strength: 4,
    flex: 2,
    heat: 4,
  },
  PETG: {
    name: 'PETG',
    full: 'Glycol-modified PET',
    density: 1.27,
    traits: ['durable', 'moisture resistant', 'low warp'],
    bestFor: 'Functional parts, brackets, outdoor fixtures',
    strength: 4,
    flex: 3,
    heat: 3,
  },
  TPU: {
    name: 'TPU',
    full: 'Thermoplastic polyurethane',
    density: 1.21,
    traits: ['rubber-like', 'shock absorbing', 'abrasion proof'],
    bestFor: 'Phone cases, gaskets, grips, bumpers',
    strength: 3,
    flex: 5,
    heat: 2,
  },
}

export const MATERIAL_LIST = Object.values(MATERIALS)

export const LAYER_HEIGHTS = [
  { value: 0.12, label: '0.12 mm · fine detail' },
  { value: 0.16, label: '0.16 mm · high quality' },
  { value: 0.2, label: '0.20 mm · standard' },
  { value: 0.24, label: '0.24 mm · draft' },
  { value: 0.28, label: '0.28 mm · fast draft' },
]

export const CAPABILITIES = [
  { id: '01', name: 'Rapid prototyping', flag: '--proto', desc: 'Turn a CAD file into something you can hold in a day or two. Iterate fast, fail cheap.' },
  { id: '02', name: 'Functional parts', flag: '--tough', desc: 'Brackets, mounts, enclosures and replacement parts in PETG or ABS, tuned for strength.' },
  { id: '03', name: 'Custom keychains', flag: '--merch', desc: 'Names, logos and event merch at a flat ₹7/g — perfect for gifts and small runs.' },
  { id: '04', name: 'Small-batch manufacturing', flag: '--batch', desc: 'Tens to hundreds of identical pieces. Bigger batches unlock lower per-gram tiers.' },
]

export const PROCESS = [
  { step: '01', title: 'Send your model', body: 'Upload STL, OBJ or 3MF in the portal — or drop it on WhatsApp.' },
  { step: '02', title: 'Get a quote', body: 'Instant estimate from weight, then a confirmed quote after we slice it.' },
  { step: '03', title: 'We print', body: 'Layer by layer on our Creality Ender, checked before it leaves the bed.' },
  { step: '04', title: 'Pick up or ship', body: 'Track every stage in the portal until it reaches you.' },
]

export const PRINT_TICKER = [
  'FDM 3D PRINTING',
  'PLA · ABS · PETG · TPU',
  'INSTANT QUOTES',
  'FROM ₹5 / GRAM',
  'STL · OBJ · 3MF',
  'CUSTOM KEYCHAINS',
  'SMALL-BATCH RUNS',
  'PREMIUM PORTAL',
]
