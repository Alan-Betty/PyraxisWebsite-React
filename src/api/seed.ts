import type { Asset, Coupon, PrintOrder, PrintTemplate, Role, SiteConfig, Tier, User } from './types'
import { blobs, clearDb, hashPassword, hasDb, now, randomSalt, uid, writeDb, type DbShape } from './store'
import { computeQuote, toBreakdown } from '../lib/pricing'

export const DEFAULT_CONFIG: SiteConfig = {
  whatsappNumber: '918848901279',
  shippingFee: 80,
  pricingMode: 'slab',
  buildVolume: { x: 220, y: 220, z: 250 },
  maxUploadMB: 50,
  acceptingOrders: true,
}

/**
 * Starting accounts. The admin login is the bootstrap account for a fresh
 * install; outside dev it must be changed on first sign-in.
 */
export const DEMO_ACCOUNTS: { email: string; password: string; role: Role; name: string; tier: Tier }[] = [
  { email: 'admin@pyraxis.local', password: 'pyraxis-admin', role: 'admin', name: 'Pyraxis Admin', tier: 'platinum' },
  ...(import.meta.env.DEV
    ? [
        { email: 'mod@pyraxis.local', password: 'pyraxis-mod', role: 'moderator' as const, name: 'Print Desk', tier: 'gold' as const },
        { email: 'premium@pyraxis.local', password: 'pyraxis-premium', role: 'premium' as const, name: 'Demo Customer', tier: 'gold' as const },
      ]
    : []),
]

const day = (offset: number) => new Date(Date.now() + offset * 86_400_000).toISOString()

const TEMPLATES: Omit<PrintTemplate, 'id'>[] = [
  { name: 'Name keychain', description: 'Raised-letter keychain, up to 10 characters.', productType: 'keychain', material: 'PLA', weightG: 8, dims: { h: 4, w: 60, d: 20 }, layerHeight: 0.2, infill: 30, active: true },
  { name: 'Logo keychain', description: 'Your logo, two-colour layer swap.', productType: 'keychain', material: 'PLA', weightG: 10, dims: { h: 4, w: 45, d: 45 }, layerHeight: 0.16, infill: 30, active: true },
  { name: 'Phone stand', description: 'Adjustable-angle desk stand.', productType: 'print', material: 'PLA', weightG: 55, dims: { h: 110, w: 80, d: 90 }, layerHeight: 0.2, infill: 20, active: true },
  { name: 'Cable organiser (×5)', description: 'Desk-edge clips, set of five.', productType: 'print', material: 'PETG', weightG: 18, dims: { h: 20, w: 40, d: 25 }, layerHeight: 0.2, infill: 25, active: true },
  { name: 'Raspberry Pi 4 case', description: 'Vented two-part enclosure.', productType: 'print', material: 'PETG', weightG: 85, dims: { h: 32, w: 95, d: 68 }, layerHeight: 0.2, infill: 20, active: true },
  { name: 'Desk nameplate', description: 'Engraved nameplate, 20 cm.', productType: 'print', material: 'PLA', weightG: 70, dims: { h: 50, w: 200, d: 30 }, layerHeight: 0.2, infill: 15, active: true },
]

const ASSETS: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'PyKey firmware', filename: 'pykey-firmware', description: 'Source and releases on GitHub.', category: 'pykey', version: 'latest', mime: 'text/html', size: 0, source: { kind: 'external', url: 'https://github.com/Pyraxis/pykey-firmware' }, enabled: true, access: 'public', downloads: 0 },
  { name: 'PyKey config tool', filename: 'pykey-config-tool.zip', description: 'Desktop keymap configurator.', category: 'pykey', version: '1.2', mime: 'application/zip', size: 68, source: { kind: 'static', url: '/downloads/pykey-config-tool.zip' }, enabled: true, access: 'public', downloads: 0 },
  { name: 'PyKey keymap doc', filename: 'PyKey Map Doc.pdf', description: 'Full keymap and Braille layout manual.', category: 'pykey', version: '1.1', mime: 'application/pdf', size: 302_993, source: { kind: 'static', url: '/downloads/PyKey Map Doc.pdf' }, enabled: true, access: 'public', downloads: 0 },
  { name: 'PyKey manual', filename: 'pykey-manual.pdf', description: 'Quick-start manual.', category: 'pykey', version: '1.0', mime: 'application/pdf', size: 65, source: { kind: 'static', url: '/downloads/pykey-manual.pdf' }, enabled: false, access: 'premium', downloads: 0 },
]

const COUPONS: Omit<Coupon, 'id' | 'createdAt'>[] = [
  { code: 'WELCOME10', description: 'First-order welcome offer', type: 'percent', value: 10, minWeightG: 0, expiresAt: null, maxUses: null, uses: 0, active: true },
  { code: 'BULK200', description: '₹200 off big orders', type: 'flat', value: 200, minWeightG: 300, expiresAt: day(90).slice(0, 10), maxUses: 50, uses: 0, active: true },
  { code: 'SHIPFREE', description: 'Free shipping over 100 g', type: 'free_shipping', value: 0, minWeightG: 100, expiresAt: day(30).slice(0, 10), maxUses: null, uses: 0, active: true },
]

async function makeUser(a: (typeof DEMO_ACCOUNTS)[number]): Promise<User> {
  const salt = randomSalt()
  return {
    id: uid('usr'),
    email: a.email,
    name: a.name,
    phone: '',
    role: a.role,
    tier: a.tier,
    status: 'active',
    salt,
    passwordHash: await hashPassword(a.password, salt),
    mustChangePassword: a.role === 'admin' && !import.meta.env.DEV,
    shipping:
      a.role === 'premium'
        ? { name: a.name, phone: '9800000000', line1: '12 Demo Street', line2: '', city: 'Kochi', state: 'Kerala', pincode: '682001' }
        : null,
    billing: null,
    billingSameAsShipping: true,
    createdAt: now(),
    lastLoginAt: null,
  }
}

/** A handful of past orders so the dashboard has something to show in dev. */
function demoOrders(customer: User, admin: User, templates: PrintTemplate[], cfg: SiteConfig): PrintOrder[] {
  const rows: { t: number; qty: number; status: PrintOrder['status']; ago: number }[] = [
    { t: 0, qty: 20, status: 'completed', ago: 26 },
    { t: 2, qty: 2, status: 'completed', ago: 19 },
    { t: 4, qty: 1, status: 'shipped', ago: 9 },
    { t: 3, qty: 3, status: 'printing', ago: 4 },
    { t: 5, qty: 1, status: 'quoted', ago: 2 },
    { t: 1, qty: 40, status: 'submitted', ago: 0 },
  ]
  return rows.map((r, i) => {
    const t = templates[r.t]
    const spec = { productType: t.productType, material: t.material, layerHeight: t.layerHeight, infill: t.infill, dims: t.dims, weightG: t.weightG, quantity: r.qty, notes: '' }
    const est = toBreakdown(computeQuote({ productType: t.productType, weightG: t.weightG, quantity: r.qty, shippingFee: cfg.shippingFee, mode: cfg.pricingMode }))
    const at = day(-r.ago)
    const quoted = r.status !== 'submitted'
    const flow: PrintOrder['status'][] = ['submitted', 'quoted', 'accepted', 'printing', 'shipped', 'completed']
    const reached = flow.slice(0, flow.indexOf(r.status) + 1)
    return {
      id: uid('ord'),
      ref: `PX-${String(1001 + i)}`,
      userId: customer.id,
      mode: 'instant',
      templateId: t.id,
      title: t.name,
      spec,
      file: null,
      estimate: est,
      quote: quoted ? { amount: est.subtotal, shipping: est.shipping, total: est.total, weightG: est.totalWeightG, note: 'Confirmed from template.', sentAt: at, by: admin.name } : null,
      status: r.status,
      trackingNumber: r.status === 'shipped' || r.status === 'completed' ? `DTDC${7300 + i}` : '',
      history: reached.map((s) => ({ status: s, at, by: s === 'submitted' ? customer.name : admin.name })),
      createdAt: at,
      updatedAt: at,
    }
  })
}

let initPromise: Promise<void> | null = null

/** Seed a fresh database on first run. Safe to call repeatedly. */
export function ensureDb(): Promise<void> {
  if (hasDb()) return Promise.resolve()
  initPromise ??= (async () => {
    const users = await Promise.all(DEMO_ACCOUNTS.map(makeUser))
    const templates = TEMPLATES.map((t) => ({ ...t, id: uid('tpl') }))
    const t = now()
    const db: DbShape = {
      version: 1,
      users,
      orders: [],
      coupons: COUPONS.map((c) => ({ ...c, id: uid('cpn'), createdAt: t })),
      templates,
      assets: ASSETS.map((a) => ({ ...a, id: uid('ast'), createdAt: t, updatedAt: t })),
      downloads: [],
      config: { ...DEFAULT_CONFIG },
      seq: { order: 1000 },
    }
    const customer = users.find((u) => u.role === 'premium')
    if (import.meta.env.DEV && customer) {
      db.orders = demoOrders(customer, users[0], templates, db.config)
      db.seq.order = 1000 + db.orders.length
    }
    if (!hasDb()) writeDb(db)
  })().finally(() => {
    initPromise = null
  })
  return initPromise
}

export async function resetDb() {
  clearDb()
  await blobs.clear().catch(() => undefined)
  await ensureDb()
}
