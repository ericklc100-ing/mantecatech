import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Tv, Eye, EyeOff, KeyRound, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import styles from './Auth.module.css'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [validSession, setValidSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase maneja el token del link via hash en la URL automáticamente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setValidSession(true)
      else setValidSession(false)
      setCheckingSession(false)
    })
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      toast.error(error.message || 'Error al actualizar la contraseña')
    } else {
      setIsDone(true)
      toast.success('¡Contraseña actualizada!')
    }
    setLoading(false)
  }

  return (
    <div className={styles.splitPage}>
      <div className={styles.bannerSection}>
        <div className={styles.bannerOverlay} />
        <div className={styles.bannerContent}>
          <div className={styles.logoBadge}>
            <Tv size={35} />
            <span>MatecaTech Premium</span>
          </div>
          <h1>Establecé tu nueva contraseña.</h1>
          <p>Elegí una contraseña segura para proteger tu cuenta y toda tu configuración avanzada.</p>
        </div>
      </div>

      <div className={styles.formSection}>
        <div className={styles.card}>

          <div className={styles.mobileHeader}>
            <Tv size={32} color="var(--oro, #ffb800)" />
            <span className={styles.brand}>MatecaTech</span>
          </div>

          {checkingSession ? (
            <div className={styles.successState}>
              <Loader2 size={40} className={styles.spinner} color="var(--oro, #ffb800)" />
              <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '1rem' }}>Verificando enlace...</p>
            </div>

          ) : !validSession ? (
            <div className={styles.successState}>
              <KeyRound size={52} color="rgba(255,255,255,0.2)" className={styles.successIcon} />
              <h2>Enlace inválido o expirado</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>
                Este enlace ya fue usado o expiró. Solicitá uno nuevo desde la pantalla de recuperación.
              </p>
              <Link to="/forgot-password" className={styles.submitBtn} style={{ textDecoration: 'none', textAlign: 'center' }}>
                Solicitar nuevo enlace
              </Link>
              <div className={styles.backToLoginWrapper}>
                <Link to="/login" className={styles.backToLogin}>
                  <ArrowLeft size={16} /> Volver al inicio de sesión
                </Link>
              </div>
            </div>

          ) : isDone ? (
            <div className={styles.successState}>
              <CheckCircle2 size={60} color="#4ade80" className={styles.successIcon} />
              <h2>¡Listo!</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>
                Tu contraseña fue actualizada correctamente. Ya podés ingresar con tus nuevas credenciales.
              </p>
              <button onClick={() => navigate('/login')} className={styles.submitBtn}>
                Ir al inicio de sesión
              </button>
            </div>

          ) : (
            <>
              <div className={styles.welcomeText}>
                <h2>Nueva contraseña</h2>
                <p>Ingresá y confirmá tu nueva contraseña para completar el proceso.</p>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label>Nueva contraseña</label>
                  <div className={`${styles.inputFieldBlock} ${styles.hasIcon} ${styles.hasEye}`}>
                    <KeyRound className={styles.inputIcon} size={18} />
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

                <div className={styles.formGroup}>
                  <label>Confirmar contraseña</label>
                  <div className={`${styles.inputFieldBlock} ${styles.hasIcon} ${styles.hasEye}`}>
                    <KeyRound className={styles.inputIcon} size={18} />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? (
                    <div className={styles.spinnerWrap}>
                      <Loader2 className={styles.spinner} size={18} />
                      <span>Actualizando...</span>
                    </div>
                  ) : 'Guardar nueva contraseña'}
                </button>

                <div className={styles.backToLoginWrapper}>
                  <Link to="/login" className={styles.backToLogin}>
                    <ArrowLeft size={16} /> Volver al inicio de sesión
                  </Link>
                </div>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
