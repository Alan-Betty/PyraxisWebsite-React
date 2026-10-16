import Header from '../components/Header'
import Footer from '../components/Footer'
import TerminalBackground from '../components/TerminalBackground'
import Ticker from '../components/Ticker'
import Hero from '../components/Hero'
import PreviewSection from '../components/PreviewSection'
import FeaturesSection from '../components/FeaturesSection'
import DownloadHub from '../components/DownloadHub'
import ShopTeaser from '../components/ShopTeaser'
import PrintSpotlight from '../components/printing/PrintSpotlight'
import { PRINT_TICKER } from '../data/printing'

export default function LandingPage() {
  return (
    <div className="relative min-h-screen grain overflow-hidden">
      <TerminalBackground />
      <Header />
      <main>
        <Hero />
        <Ticker items={PRINT_TICKER} />
        <PrintSpotlight />
        <Ticker />
        <FeaturesSection />
        <PreviewSection />
        <DownloadHub />
        <Ticker reverse />
        <ShopTeaser />
      </main>
      <Footer />
    </div>
  )
}
