import type { PrintSpec } from './types'
import { MATERIALS, LAYER_HEIGHTS } from '../data/printing'
import { MAX_QUANTITY, MAX_WEIGHT_G } from '../lib/pricing'

export type SpecErrors = Partial<Record<'weightG' | 'quantity' | 'infill' | 'layerHeight' | 'material' | 'dims' | 'notes', string>>

/** Shared by the request forms (inline errors) and the submit handler (hard check). */
export function validateSpec(spec: PrintSpec): SpecErrors {
  const e: SpecErrors = {}
  if (!Number.isFinite(spec.weightG) || spec.weightG <= 0) e.weightG = 'Enter the estimated weight in grams.'
  else if (spec.weightG > MAX_WEIGHT_G) e.weightG = `Over ${MAX_WEIGHT_G / 1000} kg per piece — message us for large jobs.`
  if (!Number.isInteger(spec.quantity) || spec.quantity < 1) e.quantity = 'Quantity must be a whole number of at least 1.'
  else if (spec.quantity > MAX_QUANTITY) e.quantity = `Up to ${MAX_QUANTITY} pieces per request.`
  if (!Number.isFinite(spec.infill) || spec.infill < 0 || spec.infill > 100) e.infill = 'Infill must be between 0 and 100%.'
  if (!LAYER_HEIGHTS.some((l) => l.value === spec.layerHeight)) e.layerHeight = 'Pick a layer height.'
  if (!(spec.material in MATERIALS)) e.material = 'Pick a material.'
  const d = [spec.dims.h, spec.dims.w, spec.dims.d]
  if (d.some((v) => !Number.isFinite(v) || v < 0 || v > 2000)) e.dims = 'Dimensions must be between 0 and 2000 mm.'
  if (spec.notes.length > 1000) e.notes = 'Keep notes under 1000 characters.'
  return e
}

export const hasErrors = (e: object) => Object.keys(e).length > 0
