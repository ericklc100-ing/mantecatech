import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext' // Corregido a un solo nivel de subida
import toast from 'react-hot-toast'
import { Tv, Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import styles from './Auth.module.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  
  const { resetPassword } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (resetPassword) {
        const { error } = await resetPassword(email)
        if (error) throw error
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
      toast.success('Correo de recuperación enviado')
      setIsSent(true)
    } catch (error) {
      toast.error(error.message || 'Ocurrió un error al enviar el correo')
    } finally {
      setLoading(false)
    }
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
          <h1>Seguridad de credenciales avanzadas.</h1>
          <p>No te preocupes, suele pasar. Validamos tu identidad de forma segura para proteger tus configuraciones avanzadas.</p>
        </div>
      </div>

      <div className={styles.formSection}>
        <div className={styles.card}>
          
          <div className={styles.mobileHeader}>
            <Tv size={32} color="var(--oro, #ffb800)" />
            <span className={styles.brand}>MatecaTech</span>
          </div>

          {!isSent ? (
            <>
              <div className={styles.welcomeText}>
                <h2>¿Olvidaste tu contraseña?</h2>
                <p>Ingresá tu correo electrónico asociado y te enviaremos un enlace seguro para restablecerla.</p>
              </div>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label>Correo Electrónico</label>
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

                <button type="submit" className={styles.submitBtn} disabled={loading}>
                  {loading ? (
                    <div className={styles.spinnerWrap}>
                      <Loader2 className={styles.spinner} size={18} />
                      <span>Verificando...</span>
                    </div>
                  ) : 'Enviar Enlace'}
                </button>

                <div className={styles.backToLoginWrapper}>
                  <Link to="/login" className={styles.backToLogin}>
                    <ArrowLeft size={16} /> Volver al inicio de sesión
                  </Link>
                </div>
              </form>
            </>
          ) : (
            <div className={styles.successState}>
              <CheckCircle2 size={60} color="#4ade80" className={styles.successIcon} />
              <h2>Revisá tu bandeja</h2>
              <p>Hemos enviado un correo a <strong>{email}</strong> con los pasos a seguir.</p>
              
              <button 
                onClick={() => setIsSent(false)} 
                className={`${styles.submitBtn} ${styles.btnSecondary}`}
              >
                Intentar con otro correo
              </button>

              <div className={styles.backToLoginWrapper}>
                <Link to="/login" className={styles.backToLogin}>
                  <ArrowLeft size={16} /> Volver al login
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}