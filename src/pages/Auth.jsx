import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Tv, LogIn, UserPlus, Eye, EyeOff, Mail, User } from 'lucide-react'
import styles from './Auth.module.css'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) toast.error(error.message)
      else { toast.success('¡Bienvenido de vuelta!'); navigate('/') }
    } else {
      if (!nombre.trim()) { toast.error('Ingresá tu nombre'); setLoading(false); return }
      const { error } = await signUp(email, password, nombre)
      if (error) toast.error(error.message)
      else toast.success('¡Cuenta creada! Revisá tu email para confirmar.', { duration: 5000 })
    }
    setLoading(false)
  }

  return (
    <div className={styles.splitPage}>
      {/* LADO IZQUIERDO: Banner cinematográfico */}
      <div className={styles.bannerSection}>
        <div className={styles.bannerOverlay} />
        <div className={styles.bannerContent}>
          <div className={styles.logoBadge}>
            <Tv size={35} />
            <span>MatecaTech Premium</span>
          </div>
          <h1>Tu portal tecnológico de confianza.</h1>
          <p>Gestiona tus compras, accede al panel de administrador avanzado y mantén tus credenciales seguras bajo los más altos estándares de cifrado.</p>
        </div>
      </div>

      {/* LADO DERECHO: Formulario Unificado */}
      <div className={styles.formSection}>
        <div className={styles.card}>
          
          <div className={styles.mobileHeader}>
            <Tv size={32} color="var(--oro, #ffb800)" />
            <span className={styles.brand}>MatecaTech</span>
          </div>

          <div className={styles.tabs}>
            <button 
              type="button"
              className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`} 
              onClick={() => setMode('login')}
            >
              <LogIn size={16} /> Ingresar
            </button>
            <button 
              type="button"
              className={`${styles.tab} ${mode === 'register' ? styles.tabActive : ''}`} 
              onClick={() => setMode('register')}
            >
              <UserPlus size={16} /> Registrarme
            </button>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {mode === 'register' && (
              <div className={styles.formGroup}>
                <label>Nombre completo</label>
                <div className={`${styles.inputFieldBlock} ${styles.hasIcon}`}>
                  <User className={styles.inputIcon} size={18} />
                  <input 
                    type="text" 
                    value={nombre} 
                    onChange={e => setNombre(e.target.value)} 
                    placeholder="Tu nombre" 
                    required 
                  />
                </div>
              </div>
            )}

            <div className={styles.formGroup}>
              <label>Email</label>
              <div className={`${styles.inputFieldBlock} ${styles.hasIcon}`}>
                <Mail className={styles.inputIcon} size={18} />
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="tu@email.com" 
                  required 
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Contraseña</label>
              <div className={`${styles.inputFieldBlock} ${styles.hasIcon} ${styles.hasEye}`}>
                <Mail className={styles.inputIcon} size={18} style={{ display: 'none' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button 
                  type="button" 
                  className={styles.eyeBtn} 
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className={styles.formOptions}>
                <Link to="/forgot-password" className={styles.forgotPass}>
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            )}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? '...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
