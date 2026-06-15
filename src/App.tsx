import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { CartProvider } from './context/CartContext'
import ScrollToTop from './components/ScrollToTop'
import LandingPage from './pages/LandingPage'
import ShopPage from './pages/ShopPage'

function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/shop" element={<ShopPage />} />
        </Routes>
      </CartProvider>
    </ThemeProvider>
  )
}

export default App
