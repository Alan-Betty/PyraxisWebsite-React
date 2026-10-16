import { CheckCircle2 } from 'lucide-react'
import type { PrintOrder } from '../../api/types'
import { formatINR } from '../../lib/format'
import { Button, Panel } from '../../components/ui/ui'

export default function SubmittedCard({ order, onView, onAnother }: { order: PrintOrder; onView: () => void; onAnother: () => void }) {
  return (
    <Panel title="request sent">
      <div className="py-6 text-center grid grid-cols-1 gap-3 justify-items-center">
        <CheckCircle2 size={32} className="text-flame" />
        <h3 className="display text-[clamp(1.8rem,4vw,2.6rem)]">
          <span className="flame-text">{order.ref}</span> is in the queue.
        </h3>
        <p className="font-mono simple:font-sans text-[13px] simple:text-sm text-[var(--fg-dim)] max-w-md">
          Estimated at {formatINR(order.estimate.total)}. We'll review it, confirm the final price, and you'll see the quote under My orders.
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-3">
          <Button onClick={onView}>Track this order</Button>
          <Button variant="ghost" onClick={onAnother}>
            New request
          </Button>
        </div>
      </div>
    </Panel>
  )
}
