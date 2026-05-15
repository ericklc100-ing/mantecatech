import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Navbar from './components/layout/Navbar'
import CartDrawer from './components/ui/CartDrawer'
import Footer from './components/layout/Footer'

// Páginas
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail' // Nueva página importada
import Auth from './pages/Auth'
import Profile from './pages/Profile'
import Admin from './pages/Admin'

import './styles/globals.css'

export default function App() {
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          {/* Componentes Globales */}
          <Navbar onCartOpen={() => setCartOpen(true)} />
          <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
          <Toaster 
            position="top-right" 
            toastOptions={{
              style: {
                background: '#003153',
                color: '#fff',
              },
            }} 
          />

          {/* Definición de Rutas */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/productos" element={<Products />} />
            
            {/* RUTA DINÁMICA: El :id permite capturar el ID de la TV desde la URL */}
            <Route path="/producto/:id" element={<ProductDetail setOpenCart={() => setCartOpen(true)} />} />
            
            <Route path="/login" element={<Auth />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
          <Footer />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}