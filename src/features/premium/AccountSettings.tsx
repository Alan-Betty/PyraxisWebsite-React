import { useState } from 'react'
import type { Address, PublicUser } from '../../api/types'
import { updateProfile } from '../../api/portal'
import { useAction } from '../../hooks/useQuery'
import { useAuth } from '../../auth/auth-context'
import ChangePasswordForm from '../../auth/ChangePasswordForm'
import { Button, Notice, Panel, TextField } from '../../components/ui/ui'

const blank = (name = '', phone = ''): Address => ({ name, phone, line1: '', line2: '', city: '', state: '', pincode: '' })

function AddressFields({ value, onChange, prefix }: { value: Address; onChange: (a: Address) => void; prefix: string }) {
  const set = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...value, [k]: e.target.value })
  const pinBad = value.pincode !== '' && !/^\d{6}$/.test(value.pincode)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <TextField label="full name" autoComplete={`${prefix} name`} value={value.name} onChange={set('name')} />
      <TextField label="phone" type="tel" autoComplete={`${prefix} tel`} value={value.phone} onChange={set('phone')} />
      <TextField label="address line 1" autoComplete={`${prefix} address-line1`} value={value.line1} onChange={set('line1')} className="sm:col-span-2" />
      <TextField label="address line 2" autoComplete={`${prefix} address-line2`} value={value.line2} onChange={set('line2')} className="sm:col-span-2" />
      <TextField label="city" autoComplete={`${prefix} address-level2`} value={value.city} onChange={set('city')} />
      <TextField label="state" autoComplete={`${prefix} address-level1`} value={value.state} onChange={set('state')} />
      <TextField label="pin code" inputMode="numeric" autoComplete={`${prefix} postal-code`} maxLength={6} value={value.pincode} onChange={set('pincode')} error={pinBad ? '6 digits' : null} />
    </div>
  )
}

export default function AccountSettings({ user }: { user: PublicUser }) {
  const { refresh } = useAuth()
  const [name, setName] = useState(user.name)
  const [phone, setPhone] = useState(user.phone)
  const [shipping, setShipping] = useState<Address>(user.shipping ?? blank(user.name, user.phone))
  const [billing, setBilling] = useState<Address>(user.billing ?? blank(user.name, user.phone))
  const [same, setSame] = useState(user.billingSameAsShipping)
  const [saved, setSaved] = useState(false)
  const save = useAction(updateProfile)

  const hasShipping = !!(shipping.line1.trim() && shipping.city.trim() && shipping.pincode.trim())

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaved(false)
    const r = await save.run({ name, phone, shipping: hasShipping ? shipping : null, billing: same ? null : billing, billingSameAsShipping: same })
    if (r.ok) {
      setSaved(true)
      await refresh()
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
      <form onSubmit={submit} className="grid grid-cols-1 gap-6">
        <Panel title="profile">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="name" required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            <TextField label="phone / whatsapp" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
            <TextField label="email" value={user.email} disabled hint="Ask us to change your login email." className="sm:col-span-2" />
          </div>
        </Panel>
        <Panel title="shipping address">
          <AddressFields value={shipping} onChange={setShipping} prefix="shipping" />
        </Panel>
        <Panel
          title="billing address"
          actions={
            <label className="flex items-center gap-2 kicker text-[9px] cursor-pointer">
              <input type="checkbox" checked={same} onChange={(e) => setSame(e.target.checked)} className="accent-[var(--color-flame)]" />
              same as shipping
            </label>
          }
        >
          {same ? <p className="font-mono simple:font-sans text-[12px] text-[var(--fg-dim)]">Invoices go to your shipping address.</p> : <AddressFields value={billing} onChange={setBilling} prefix="billing" />}
        </Panel>
        {save.error && <Notice tone="error">{save.error}</Notice>}
        {saved && <Notice tone="ok">Saved. New orders will ship here.</Notice>}
        <div>
          <Button type="submit" loading={save.pending}>
            Save details
          </Button>
        </div>
      </form>

      <Panel title="password">
        <ChangePasswordForm />
      </Panel>
    </div>
  )
}
