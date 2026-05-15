import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Tv, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react'
import styles from './Auth.module.css'

export default function Auth() {
  const [mode, setMode] = useState('login') // login | register
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
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <Tv size={30} className={styles.tvIcon} />
          <span className={styles.brand}>MatecaTech</span>
        </div>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`} onClick={() => setMode('login')}>
            <LogIn size={16} /> Ingresar
          </button>
          <button className={`${styles.tab} ${mode === 'register' ? styles.tabActive : ''}`} onClick={() => setMode('register')}>
            <UserPlus size={16} /> Registrarme
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === 'register' && (
            <div className="form-group">
              <label>Nombre completo</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" required />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <div className={styles.passWrap}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? '...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  )
}
