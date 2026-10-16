import { useId, useState } from 'react'
import type { Asset, AssetAccess } from '../../../api/types'
import { addLink, ASSET_MAX_MB, updateAsset, uploadAsset } from '../../../api/admin/assets'
import { useAction } from '../../../hooks/useQuery'
import { formatBytes } from '../../../lib/format'
import { ACCESS_META, ASSET_CATEGORIES } from '../../../lib/assets'
import { Button, Field, Input, Modal, Notice, Select, Textarea, TextField, Toggle } from '../../../components/ui/ui'

type Mode = 'upload' | 'link' | 'edit'

export default function AssetEditor({ mode, asset, onClose, onSaved }: { mode: Mode; asset: Asset | null; onClose: () => void; onSaved: (msg: string) => void }) {
  const fileId = useId()
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [name, setName] = useState(asset?.name ?? '')
  const [filename, setFilename] = useState(asset?.filename ?? '')
  const [description, setDescription] = useState(asset?.description ?? '')
  const [category, setCategory] = useState(asset?.category ?? 'general')
  const [version, setVersion] = useState(asset?.version ?? '1.0')
  const [access, setAccess] = useState<AssetAccess>(asset?.access ?? 'public')
  const [enabled, setEnabled] = useState(asset?.enabled ?? false)

  const save = useAction(async () => {
    const meta = { name, filename, description, category, version, access, enabled }
    if (mode === 'upload') {
      if (!file) throw new Error('Choose a file to upload.')
      await uploadAsset(file, meta)
      return `Uploaded “${name || file.name}”${enabled ? '' : ' — it stays hidden until you switch it live'}.`
    }
    if (mode === 'link') {
      await addLink(url, meta)
      return `Added link “${name || url}”.`
    }
    await updateAsset(asset!.id, meta)
    return `Saved “${name}”.`
  })

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const r = await save.run()
    if (r.ok) onSaved(r.value)
  }

  const tooBig = file && file.size > ASSET_MAX_MB * 1024 * 1024

  return (
    <Modal title={mode === 'upload' ? 'upload asset' : mode === 'link' ? 'add external link' : `edit · ${asset?.name}`} onClose={onClose} wide>
      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {mode === 'upload' && (
          <Field label="file" htmlFor={fileId} className="sm:col-span-2" error={tooBig ? `Over the ${ASSET_MAX_MB} MB limit.` : null} hint={file ? `${file.type || 'unknown type'} · ${formatBytes(file.size)}` : `Up to ${ASSET_MAX_MB} MB. Executables and scripts are blocked — link to those instead.`}>
            <Input
              id={fileId}
              type="file"
              required
              className="h-auto py-2 file:mr-3 file:border-0 file:bg-flame file:text-black file:font-bold file:px-3 file:py-1 file:cursor-pointer"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null
                setFile(f)
                if (f && !filename) setFilename(f.name)
                if (f && !name) setName(f.name.replace(/\.[^.]+$/, ''))
              }}
            />
          </Field>
        )}
        {mode === 'link' && <TextField label="url" type="url" required placeholder="https://github.com/…" value={url} onChange={(e) => setUrl(e.target.value)} className="sm:col-span-2" />}

        <TextField label="display name" required value={name} onChange={(e) => setName(e.target.value)} />
        <TextField label="download file name" value={filename} onChange={(e) => setFilename(e.target.value)} hint="what the visitor's browser saves it as" />
        <Field label="description" className="sm:col-span-2">
          <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={300} />
        </Field>
        <Field label="placement" hint={ASSET_CATEGORIES.find((c) => c.id === category)?.where}>
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            {ASSET_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
        </Field>
        <TextField label="version" value={version} onChange={(e) => setVersion(e.target.value)} />
        <Field label="who can download" hint={ACCESS_META[access].note}>
          <Select value={access} onChange={(e) => setAccess(e.target.value as AssetAccess)}>
            {Object.entries(ACCESS_META).map(([k, m]) => (
              <option key={k} value={k}>
                {m.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="live on the site" group>
          <div className="h-10 flex items-center gap-3">
            <Toggle checked={enabled} onChange={setEnabled} label="Enabled" />
            <span className="font-mono simple:font-sans text-[12px] text-[var(--fg-dim)]">{enabled ? 'downloads enabled' : 'hidden'}</span>
          </div>
        </Field>

        {mode === 'upload' && (
          <div className="sm:col-span-2">
            <Notice>Uploaded files are stored in this browser until the site has a file host. Visitors on other devices won't see them yet.</Notice>
          </div>
        )}
        {save.error && (
          <div className="sm:col-span-2">
            <Notice tone="error">{save.error}</Notice>
          </div>
        )}
        <div className="sm:col-span-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={save.pending} disabled={!!tooBig}>
            {mode === 'edit' ? 'Save changes' : mode === 'upload' ? 'Upload' : 'Add link'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
