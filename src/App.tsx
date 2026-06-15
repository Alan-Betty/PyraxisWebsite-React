import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { ModeProvider } from './context/ModeContext'
import { CartProvider } from './context/CartContext'
import ScrollToTop from './components/ScrollToTop'
import LandingPage from './pages/LandingPage'
import ShopPage from './pages/ShopPage'

function App() {
  return (
    <ThemeProvider>
      <ModeProvider>
      <CartProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/shop" element={<ShopPage />} />
        </Routes>
      </CartProvider>
      </ModeProvider>
    </ThemeProvider>
  )
}

export default App
