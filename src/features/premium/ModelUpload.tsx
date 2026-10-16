import { useRef, useState } from 'react'
import { FileBox, Loader2, RefreshCw, Trash2, Upload } from 'lucide-react'
import type { ModelFileRef } from '../../api/types'
import { discardModel, uploadModel } from '../../api/portal'
import { errorMessage } from '../../hooks/useQuery'
import { MODEL_ACCEPT } from '../../lib/files'
import { formatBytes, formatNum } from '../../lib/format'

/** Drag-and-drop model upload with type, size and content checks. */
export default function ModelUpload({ value, onChange, maxMB }: { value: ModelFileRef | null; onChange: (f: ModelFileRef | null) => void; maxMB: number }) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [drag, setDrag] = useState(false)

  async function take(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const ref = await uploadModel(file)
      if (value) await discardModel(value)
      onChange(ref)
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }

  async function remove() {
    if (value) await discardModel(value)
    onChange(null)
  }

  const picker = <input ref={input} type="file" accept={MODEL_ACCEPT} className="sr-only" onChange={(e) => take(e.target.files?.[0])} aria-label="3D model file" />

  if (value) {
    const m = value.measured
    return (
      <div className="border border-flame/50 soft p-4 flex flex-wrap items-center gap-4">
        {picker}
        <span className="grid place-items-center w-11 h-11 border border-line text-flame simple:rounded-lg">
          <FileBox size={20} />
        </span>
        <div className="flex-1 min-w-[180px]">
          <div className="font-mono simple:font-sans font-semibold text-[14px] break-all">{value.name}</div>
          <div className="kicker text-[9px] mt-1">
            {value.ext} · {formatBytes(value.size)}
            {m ? ` · ${formatNum(m.dims.h)}×${formatNum(m.dims.w)}×${formatNum(m.dims.d)} mm · ${formatNum(m.volumeCm3)} cm³` : value.ext === '3mf' ? ' · measured after review' : ''}
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => input.current?.click()} disabled={busy} className="h-8 px-3 border border-line hover:border-flame text-[12px] inline-flex items-center gap-1.5 simple:rounded-lg">
            {busy ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Replace
          </button>
          <button type="button" onClick={remove} className="h-8 px-3 border border-line hover:border-red-400 hover:text-red-400 text-[12px] inline-flex items-center gap-1.5 simple:rounded-lg">
            <Trash2 size={13} /> Remove
          </button>
        </div>
        {error && <p role="alert" className="basis-full font-mono text-[11px] text-red-400">{error}</p>}
      </div>
    )
  }

  return (
    <div>
      {picker}
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDrag(true)
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDrag(false)
          take(e.dataTransfer.files[0])
        }}
        className={`w-full border border-dashed p-8 grid place-items-center gap-3 text-center transition-colors soft ${drag ? 'border-flame bg-flame/[0.06]' : error ? 'border-red-500/60' : 'border-line hover:border-flame'}`}
      >
        {busy ? <Loader2 size={24} className="animate-spin text-flame" /> : <Upload size={24} className="text-flame" />}
        <span className="font-display simple:font-sans font-bold text-lg">{busy ? 'Checking your model…' : 'Drop your 3D model here'}</span>
        <span className="kicker text-[9px]">STL · OBJ · 3MF · up to {maxMB} MB · or click to browse</span>
      </button>
      {error && (
        <p role="alert" className="font-mono simple:font-sans text-[11px] text-red-400 mt-2">
          {error}
        </p>
      )}
    </div>
  )
}
