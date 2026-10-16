import type { PriceBreakdown, PrintSpec } from '../api/types'
import { formatINR, formatRate } from './format'
import { MATERIALS } from '../data/printing'

export function whatsappLink(number: string, message: string) {
  const digits = number.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

interface QuoteMessage {
  spec: Partial<PrintSpec> & Pick<PrintSpec, 'productType' | 'weightG' | 'quantity'>
  estimate?: PriceBreakdown
  ref?: string
  fileName?: string
}

/** Pre-filled WhatsApp message with the project details lined up for a quick reply. */
export function quoteMessage({ spec, estimate, ref, fileName }: QuoteMessage) {
  const lines: string[] = []
  lines.push(ref ? `Hi Pyraxis! Following up on print order ${ref}.` : "Hi Pyraxis! I'd like a 3D print quote.")
  lines.push('')
  lines.push(`• Type: ${spec.productType === 'keychain' ? 'Keychain' : 'Standard 3D print'}`)
  if (spec.material) {
    const extra = [
      spec.infill !== undefined ? `${spec.infill}% infill` : '',
      spec.layerHeight ? `${spec.layerHeight} mm layers` : '',
    ].filter(Boolean)
    lines.push(`• Material: ${MATERIALS[spec.material].name}${extra.length ? ` · ${extra.join(' · ')}` : ''}`)
  }
  if (spec.dims && (spec.dims.h || spec.dims.w || spec.dims.d)) {
    lines.push(`• Size (H×W×D): ${spec.dims.h || '?'} × ${spec.dims.w || '?'} × ${spec.dims.d || '?'} mm`)
  }
  lines.push(`• Weight: ${spec.weightG} g × ${spec.quantity} pc${spec.quantity === 1 ? '' : 's'}`)
  if (fileName) lines.push(`• File: ${fileName} (I'll attach it here)`)
  if (estimate && estimate.total > 0) {
    lines.push(`• Website estimate: ${formatINR(estimate.total)} (${formatRate(estimate.rate)}, ${estimate.tierLabel})`)
  }
  if (spec.notes?.trim()) lines.push(`• Notes: ${spec.notes.trim()}`)
  return lines.join('\n')
}
