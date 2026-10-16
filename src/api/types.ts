// Data models shared by the API layer, the premium portal and the admin panel.

/* ---------------------------------------------------------------- users */

export type Role = 'premium' | 'moderator' | 'admin'
export type Tier = 'silver' | 'gold' | 'platinum'
export type AccountStatus = 'active' | 'suspended' | 'terminated'

export interface Address {
  name: string
  phone: string
  line1: string
  line2: string
  city: string
  state: string
  pincode: string
}

export interface User {
  id: string
  email: string
  name: string
  phone: string
  role: Role
  tier: Tier
  status: AccountStatus
  passwordHash: string
  salt: string
  mustChangePassword: boolean
  shipping: Address | null
  billing: Address | null
  billingSameAsShipping: boolean
  createdAt: string
  lastLoginAt: string | null
}

/** A user as the UI sees it — credentials never leave the API layer. */
export type PublicUser = Omit<User, 'passwordHash' | 'salt'>

export interface Session {
  userId: string
  token: string
  expiresAt: string
}

/* ------------------------------------------------------------- printing */

export type ProductType = 'print' | 'keychain'
export type Material = 'PLA' | 'ABS' | 'PETG' | 'TPU'

export interface Dimensions {
  /** millimetres */
  h: number
  w: number
  d: number
}

export interface PrintSpec {
  productType: ProductType
  material: Material
  layerHeight: number
  /** 0–100 */
  infill: number
  dims: Dimensions
  /** grams per piece */
  weightG: number
  quantity: number
  notes: string
}

export interface ModelFileRef {
  /** key in the blob store */
  id: string
  name: string
  ext: 'stl' | 'obj' | '3mf'
  size: number
  /** measured from the mesh when the format allows it */
  measured: { dims: Dimensions; volumeCm3: number } | null
}

export type OrderStatus =
  | 'submitted'
  | 'quoted'
  | 'accepted'
  | 'printing'
  | 'shipped'
  | 'completed'
  | 'rejected'
  | 'cancelled'

export type OrderMode = 'instant' | 'custom'

export interface PriceBreakdown {
  productType: ProductType
  totalWeightG: number
  /** effective ₹/g (blended when pricing mode is progressive) */
  rate: number
  tierLabel: string
  subtotal: number
  discount: number
  shipping: number
  shippingDiscount: number
  total: number
  couponCode: string | null
}

export interface FormalQuote {
  /** admin-confirmed print cost, before shipping */
  amount: number
  shipping: number
  total: number
  /** grams the admin priced against (may differ from the customer's estimate) */
  weightG: number
  note: string
  sentAt: string
  by: string
}

export interface OrderEvent {
  status: OrderStatus
  at: string
  by: string
  note?: string
}

export interface PrintOrder {
  id: string
  ref: string
  userId: string
  mode: OrderMode
  templateId: string | null
  title: string
  spec: PrintSpec
  file: ModelFileRef | null
  estimate: PriceBreakdown
  quote: FormalQuote | null
  status: OrderStatus
  trackingNumber: string
  history: OrderEvent[]
  createdAt: string
  updatedAt: string
}

export interface PrintTemplate {
  id: string
  name: string
  description: string
  productType: ProductType
  material: Material
  weightG: number
  dims: Dimensions
  layerHeight: number
  infill: number
  active: boolean
}

/* -------------------------------------------------------------- coupons */

export type CouponType = 'percent' | 'flat' | 'free_shipping'

export interface Coupon {
  id: string
  code: string
  description: string
  type: CouponType
  /** percent (0–100) or rupees; ignored for free_shipping */
  value: number
  /** order must weigh at least this many grams in total */
  minWeightG: number
  /** ISO date (inclusive, end of day) or null for no expiry */
  expiresAt: string | null
  maxUses: number | null
  uses: number
  active: boolean
  createdAt: string
}

/* --------------------------------------------------------------- assets */

export type AssetAccess = 'public' | 'premium' | 'staff'

export type AssetSource =
  | { kind: 'static'; url: string }
  | { kind: 'external'; url: string }
  | { kind: 'blob'; blobId: string }

export interface Asset {
  id: string
  name: string
  filename: string
  description: string
  category: string
  version: string
  mime: string
  /** bytes; 0 when unknown (external links) */
  size: number
  source: AssetSource
  enabled: boolean
  access: AssetAccess
  downloads: number
  createdAt: string
  updatedAt: string
}

export interface DownloadEvent {
  assetId: string
  at: string
  bytes: number
}

/* --------------------------------------------------------------- config */

export type PricingMode = 'slab' | 'progressive'

export interface SiteConfig {
  /** international format, digits only */
  whatsappNumber: string
  /** flat shipping fee in ₹ */
  shippingFee: number
  pricingMode: PricingMode
  /** printer build volume in mm */
  buildVolume: { x: number; y: number; z: number }
  maxUploadMB: number
  acceptingOrders: boolean
}
