export type OS = 'macos' | 'windows' | 'linux' | 'mobile'
export type Channel = 'stable' | 'beta' | 'nightly'

export interface Build {
  os: OS
  url: string
  ext: string
  size: string
  arch: string
}

export interface Release {
  version: string
  channel: Channel
  date: string
  notes: string[]
  builds: Build[]
}

export const OS_META: Record<OS, { label: string; icon: string; cmd: string; comingSoon?: boolean }> = {
  macos: { label: 'macOS', icon: '', cmd: 'brew install --cask pyraxis' },
  windows: { label: 'Windows', icon: '⊞', cmd: 'winget install Pyraxis.Browser' },
  linux: { label: 'Linux', icon: '🐧', cmd: 'coming soon', comingSoon: true },
  mobile: { label: 'Mobile', icon: '▢', cmd: 'scan QR · or visit pyraxis.app' },
}

const BASE = 'https://media.githubusercontent.com/media/PyraxisBrowser/installers/refs/heads/main'

export const RELEASES: Release[] = [
  {
    version: '0.9.2',
    channel: 'beta',
    date: '2026-06-02',
    notes: [
      'TerraTabs AI now runs fully on-device',
      'Tracker firewall ruleset +4,200 entries',
      'Fixed Braille keyboard remap on wake',
    ],
    builds: [
      { os: 'macos', url: `${BASE}/Pyraxis.dmg?download=true`, ext: '.dmg', size: '94.2 MB', arch: 'universal' },
      { os: 'windows', url: `${BASE}/Pyraxis.exe?download=true`, ext: '.exe', size: '88.7 MB', arch: 'x64' },
      { os: 'linux', url: `${BASE}/Pyraxis.AppImage?download=true`, ext: '.AppImage', size: '101 MB', arch: 'x86_64' },
      { os: 'mobile', url: `${BASE.replace('media.', 'raw.')}/pyraxis.apk`, ext: '.apk', size: '42.1 MB', arch: 'arm64' },
    ],
  },
  {
    version: '0.9.1',
    channel: 'stable',
    date: '2026-05-14',
    notes: ['Hardened signed-update chain', 'Reader mode typography pass', 'Quick search switch hotkeys'],
    builds: [
      { os: 'macos', url: `${BASE}/Pyraxis.dmg?download=true`, ext: '.dmg', size: '93.8 MB', arch: 'universal' },
      { os: 'windows', url: `${BASE}/Pyraxis.exe?download=true`, ext: '.exe', size: '88.1 MB', arch: 'x64' },
      { os: 'linux', url: `${BASE}/Pyraxis.AppImage?download=true`, ext: '.AppImage', size: '100 MB', arch: 'x86_64' },
      { os: 'mobile', url: `${BASE.replace('media.', 'raw.')}/pyraxis.apk`, ext: '.apk', size: '41.7 MB', arch: 'arm64' },
    ],
  },
  {
    version: '0.9.0',
    channel: 'stable',
    date: '2026-04-28',
    notes: ['First public beta', 'Privacy engine v1', 'Accessibility suite launch'],
    builds: [
      { os: 'macos', url: `${BASE}/Pyraxis.dmg?download=true`, ext: '.dmg', size: '92.5 MB', arch: 'universal' },
      { os: 'windows', url: `${BASE}/Pyraxis.exe?download=true`, ext: '.exe', size: '87.0 MB', arch: 'x64' },
      { os: 'linux', url: `${BASE}/Pyraxis.AppImage?download=true`, ext: '.AppImage', size: '99 MB', arch: 'x86_64' },
      { os: 'mobile', url: `${BASE.replace('media.', 'raw.')}/pyraxis.apk`, ext: '.apk', size: '40.9 MB', arch: 'arm64' },
    ],
  },
]

export function detectOS(): OS {
  if (typeof navigator === 'undefined') return 'macos'
  const ua = navigator.userAgent
  if (/windows/i.test(ua)) return 'windows'
  if (/android/i.test(ua)) return 'mobile'
  if (/iphone|ipad|ipod/i.test(ua)) return 'mobile'
  if (/linux/i.test(ua)) return 'linux'
  return 'macos'
}
