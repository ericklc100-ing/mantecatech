import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, Menu, X, Tv, Search, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import styles from './Navbar.module.css'

export default function Navbar({ onCartOpen }) {
  const { user, profile, isAdmin } = useAuth()
  const { totalItems } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false) // Para móvil
  const navigate = useNavigate()

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      navigate(`/productos?search=${e.target.value}`)
      setSearchOpen(false)
    }
  }

  return (
    <>
      <nav className={styles.navbar}>
        <div className={`container ${styles.inner}`}>
          
          <div className={styles.leftSection}>
            <button className={styles.menuToggle} onClick={() => setMenuOpen(true)}>
              <Menu size={26} />
            </button>

            <Link to="/" className={styles.logo}>
              <Tv size={28} color="var(--oro)" />
              <span className={styles.logoText}>MaNtecaTech</span>
            </Link>
          </div>

          {/* BUSCADOR DESKTOP */}
          <div className={styles.searchDesktop}>
            <Search className={styles.searchIcon} size={18} />
            <input 
              type="text" 
              placeholder="¿Qué Smart TV buscas?" 
              onKeyDown={handleSearch}
            />
          </div>

          <div className={styles.desktopNav}>
            <Link to="/productos" className={styles.navLink}>Productos</Link>
            {isAdmin && (
              <Link to="/admin" className={`${styles.navLink} ${styles.adminLink}`}>
                <ShieldCheck size={18} /> Admin
              </Link>
            )}
          </div>

          <div className={styles.actions}>
            {/* Icono búsqueda móvil */}
            <button className={styles.mobileSearchBtn} onClick={() => setSearchOpen(!searchOpen)}>
              <Search size={24} />
            </button>

            <button className={styles.cartBtn} onClick={onCartOpen}>
              <ShoppingCart size={24} />
              {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
            </button>

            <Link to={user ? "/perfil" : "/login"}>
              <div className={styles.avatar}>
                {user ? (profile?.nombre || user.email)[0].toUpperCase() : <User size={20} />}
              </div>
            </Link>
          </div>
        </div>

        {/* BUSCADOR DESPLEGABLE MÓVIL */}
        <div className={`${styles.mobileSearchWrap} ${searchOpen ? styles.showSearch : ''}`}>
           <input 
              type="text" 
              placeholder="Buscar..." 
              onKeyDown={handleSearch}
              autoFocus={searchOpen}
           />
        </div>
      </nav>

      {/* PANEL MÓVIL (DRAWER) */}
      {menuOpen && <div className={styles.overlay} onClick={() => setMenuOpen(false)} />}
      <div className={`${styles.mobileNav} ${menuOpen ? styles.mobileNavActive : ''}`}>
        <div className={styles.mobileHeader}>
           <span className={styles.menuTitle}>Menú</span>
           <button onClick={() => setMenuOpen(false)} className={styles.closeBtn}><X size={30} /></button>
        </div>
        <Link to="/" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Inicio</Link>
        <Link to="/productos" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Smart TVs</Link>
        <div className={styles.mobileSeparator}>Cuenta</div>
        {user ? (
          <>
            <Link to="/perfil" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Mi Perfil</Link>
            {isAdmin && <Link to="/admin" className={`${styles.mobileLink} ${styles.adminMobile}`} onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
          </>
        ) : (
          <Link to="/login" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Ingresar</Link>
        )}
      </div>
    </>
  )
}