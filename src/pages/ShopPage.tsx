import Header from '../components/Header'
import Footer from '../components/Footer'
import TerminalBackground from '../components/TerminalBackground'
import Ticker from '../components/Ticker'
import SaleBanner from '../components/shop/SaleBanner'
import ShopHero from '../components/shop/ShopHero'
import ProductGrid from '../components/shop/ProductGrid'
import ShopFeatures from '../components/shop/ShopFeatures'
import SpecsSection from '../components/shop/SpecsSection'
import DownloadsSection from '../components/shop/DownloadsSection'
import AccessibilitySection from '../components/shop/AccessibilitySection'
import GallerySection from '../components/shop/GallerySection'
import BuySection from '../components/shop/BuySection'
import CartDrawer from '../components/shop/CartDrawer'

export default function ShopPage() {
  return (
    <div className="relative min-h-screen grain overflow-hidden">
      <TerminalBackground />
      <SaleBanner />
      <Header />
      <main>
        <ShopHero />
        <Ticker />
        <ProductGrid />
        <ShopFeatures />
        <SpecsSection />
        <DownloadsSection />
        <AccessibilitySection />
        <GallerySection />
        <BuySection />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
