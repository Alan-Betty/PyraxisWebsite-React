import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import { FaGithub } from 'react-icons/fa'
import type { Asset } from '../api/types'
import { startDownload } from '../api/public'
import { errorMessage } from '../hooks/useQuery'
import { formatBytes } from '../lib/format'

/**
 * Download rows backed by the asset registry: the admin panel controls what
 * shows here, and every click is counted.
 */
export default function AssetLinks({ assets }: { assets: Asset[] }) {
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function get(a: Asset) {
    setBusy(a.id)
    setError(null)
    try {
      await startDownload(a.id)
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <div className="border border-line soft overflow-hidden">
        {assets.map((a) => {
          const external = a.source.kind === 'external'
          return (
            <button
              key={a.id}
              onClick={() => get(a)}
              disabled={busy === a.id}
              className="group w-full flex items-center justify-between gap-4 px-5 py-5 border-b border-line last:border-b-0 hover:bg-flame/[0.04] transition-colors text-left"
            >
              <span className="flex items-center gap-4 min-w-0">
                <span className="text-flame">{busy === a.id ? <Loader2 size={18} className="animate-spin" /> : external ? <FaGithub size={18} /> : <FileDown size={18} />}</span>
                <span className="min-w-0">
                  <span className="block font-mono simple:font-sans font-semibold text-[14px] truncate">{a.filename}</span>
                  <span className="block kicker text-[9px] mt-0.5">
                    {a.name} · {external ? 'external' : `v${a.version} · ${formatBytes(a.size)}`}
                  </span>
                </span>
              </span>
              <span className="font-mono text-[12px] text-flame group-hover:translate-x-1 transition-transform shrink-0">↓ get</span>
            </button>
          )
        })}
      </div>
      {error && (
        <p role="alert" className="font-mono text-[12px] text-red-400 mt-3">
          {error}
        </p>
      )}
    </>
  )
}
