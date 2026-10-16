// Staff endpoints: pre-made models customers can book instantly.
import type { PrintTemplate } from '../types'
import { ApiError, latency, mutate, readDb, uid } from '../store'
import { requireActor } from '../auth'
import { hasErrors, validateSpec } from '../validation'

export async function listAllTemplates(): Promise<PrintTemplate[]> {
  requireActor('templates')
  return readDb().templates
}

export type TemplateInput = Omit<PrintTemplate, 'id'>

function clean(input: TemplateInput): TemplateInput {
  if (!input.name.trim()) throw new ApiError('Give the template a name.')
  if (hasErrors(validateSpec({ ...input, quantity: 1, notes: '' }))) throw new ApiError('Check the weight, material and print settings.')
  return { ...input, name: input.name.trim(), description: input.description.trim() }
}

export async function saveTemplate(id: string | null, input: TemplateInput): Promise<PrintTemplate> {
  requireActor('templates')
  await latency()
  const data = clean(input)
  return mutate((db) => {
    if (!id) {
      const t = { ...data, id: uid('tpl') }
      db.templates.push(t)
      return t
    }
    const t = db.templates.find((x) => x.id === id)
    if (!t) throw new ApiError('Template not found.', 404)
    Object.assign(t, data)
    return t
  })
}

export async function deleteTemplate(id: string): Promise<void> {
  requireActor('templates')
  await latency()
  mutate((db) => {
    db.templates = db.templates.filter((t) => t.id !== id)
  })
}
