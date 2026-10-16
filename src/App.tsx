import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { ThemeProvider } from './context/ThemeContext'
import { ModeProvider } from './context/ModeContext'
import { CartProvider } from './context/CartContext'
import AuthProvider from './auth/AuthProvider'
import RequireRole from './auth/RequireRole'
import ScrollToTop from './components/ScrollToTop'
import { Loading } from './components/ui/ui'
import LandingPage from './pages/LandingPage'
import ShopPage from './pages/ShopPage'
import PrintingPage from './pages/PrintingPage'
import LoginPage from './pages/LoginPage'

// signed-in areas load on demand so the public pages stay light
const PortalPage = lazy(() => import('./features/premium/PortalPage'))
const AdminPage = lazy(() => import('./features/admin/AdminPage'))

function App() {
  return (
    <ThemeProvider>
      <ModeProvider>
      <CartProvider>
      <AuthProvider>
        <ScrollToTop />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/print" element={<PrintingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/portal" element={<RequireRole roles={['premium']}><PortalPage /></RequireRole>} />
            <Route path="/admin" element={<RequireRole roles={['admin', 'moderator']}><AdminPage /></RequireRole>} />
          </Routes>
        </Suspense>
        <Analytics />
      </AuthProvider>
      </CartProvider>
      </ModeProvider>
    </ThemeProvider>
  )
}

export default App
