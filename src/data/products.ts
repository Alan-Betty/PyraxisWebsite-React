export interface Product {
  id: string
  name: string
  image: string
  rating?: number
  reviews?: number
  description: string
  price: number
  oldPrice?: number
  discount?: string
  badge?: { label: string; tone: 'success' | 'popular' | 'warning' }
  comingSoon?: boolean
}

export const PRODUCTS: Product[] = [
  {
    id: 'pykey-core',
    name: 'PyKey Core',
    image: '/images/PyKey Core.jpeg',
    rating: 5,
    reviews: 24,
    description: 'Compact tactile model with haptic feedback and Braille-ready keycaps.',
    price: 15,
    oldPrice: 20,
    discount: '-25%',
    badge: { label: 'In Stock', tone: 'success' },
  },
  {
    id: 'pykey-pro',
    name: 'PyKey Pro',
    image: '/images/PyKey Pro.jpeg',
    rating: 5,
    reviews: 18,
    description: 'Includes programmable keys, more characters, and mouse control features.',
    price: 38,
    oldPrice: 50,
    discount: '-25%',
    badge: { label: 'Popular', tone: 'popular' },
  },
  {
    id: 'pykey-demo',
    name: 'Demo Kit',
    image: '/images/demokit.jpg',
    description: 'Try tactile keycaps and Braille templates for testing.',
    price: 10,
    oldPrice: 20,
    discount: '-50%',
    badge: { label: 'Coming Soon', tone: 'warning' },
    comingSoon: true,
  },
]
