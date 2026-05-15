import { Link } from 'react-router-dom'
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone, Tv } from 'lucide-react'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          {/* Columna 1: Branding */}
          <div className={styles.brandCol}>
            <div className={styles.logo}>
              <Tv className={styles.logoIcon} size={28} />
              <span>MANTECATECH</span>
            </div>
            <p className={styles.description}>
              Líderes en tecnología visual. Ofrecemos la mejor selección de Smart TVs 
              con garantía oficial y asesoramiento personalizado.
            </p>
            <div className={styles.social}>
              <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
              <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
              <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
            </div>
          </div>

          {/* Columna 2: Navegación */}
          <div className={styles.linksCol}>
            <h4>Navegación</h4>
            <ul>
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/productos">Smart TVs</Link></li>
              <li><Link to="/perfil">Mi Cuenta</Link></li>
              <li><Link to="/admin">Panel Admin</Link></li>
            </ul>
          </div>

          {/* Columna 3: Contacto */}
          <div className={styles.contactCol}>
            <h4>Contacto</h4>
            <div className={styles.contactItem}>
              <MapPin size={18} />
              <span>Lomas del Mirador, Buenos Aires</span>
            </div>
            <div className={styles.contactItem}>
              <Phone size={18} />
              <span>+54 9 11 0000-0000</span>
            </div>
            <div className={styles.contactItem}>
              <Mail size={18} />
              <span>ventas@matecatech.com.ar</span>
            </div>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p>© {new Date().getFullYear()} MantecaTech. Todos los derechos reservados.</p>
          <div className={styles.legal}>
            <a href="#">Términos y Condiciones</a>
            <a href="#">Privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  )
}