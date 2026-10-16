import type { AssetAccess } from '../api/types'

/** Category decides where a public asset is listed on the site. */
export const ASSET_CATEGORIES = [
  { id: 'pykey', label: 'PyKey', where: 'shop page → downloads' },
  { id: 'printing', label: '3D printing', where: '3D printing page → resources' },
  { id: 'general', label: 'General', where: 'premium portal only' },
]

export const ACCESS_META: Record<AssetAccess, { label: string; note: string }> = {
  public: { label: 'Public', note: 'anyone on the site' },
  premium: { label: 'Premium', note: 'signed-in customers, in the portal' },
  staff: { label: 'Staff', note: 'admins and moderators only' },
}
