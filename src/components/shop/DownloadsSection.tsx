import { listPublicAssets } from '../../api/public'
import { useQuery } from '../../hooks/useQuery'
import AssetLinks from '../AssetLinks'

export default function DownloadsSection() {
  const { data: assets = [], loading } = useQuery(listPublicAssets)
  const pykey = assets.filter((a) => a.category === 'pykey')

  return (
    <section id="downloads" className="px-5 py-24 border-t border-line">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <span className="kicker"><span className="dev-only">// software &amp; downloads</span><span className="simple-only">Software &amp; Downloads</span></span>
          <h2 className="display text-[clamp(2rem,5.5vw,4rem)] mt-3">flash it. <span className="flame-text">tune it</span>.</h2>
        </div>
        {pykey.length > 0 ? (
          <AssetLinks assets={pykey} />
        ) : (
          <div className="border border-dashed border-line p-6 font-mono text-[12px] text-[var(--fg-dim)] text-center">
            {loading ? 'loading downloads…' : 'Downloads are being updated — check back soon.'}
          </div>
        )}
        <p className="font-mono text-[12px] text-[var(--fg-dim)] mt-5">
          accessibility needs? mail{' '}
          <a href="mailto:Pyraxis.official@gmail.com" className="text-flame hover:underline">Pyraxis.official@gmail.com</a>{' '}
          for tailored builds.
        </p>
      </div>
    </section>
  )
}
