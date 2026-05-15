import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { User, Package, Save } from 'lucide-react'
import styles from './Profile.module.css'

export default function Profile() {
  const { user, profile, updateProfile, loading } = useAuth()
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [nombre, setNombre] = useState('')
  const [direccion, setDireccion] = useState('')
  const [telefono, setTelefono] = useState('')
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('profile')

  useEffect(() => {
    if (profile) {
      setNombre(profile.nombre || '')
      setDireccion(profile.direccion || '')
      setTelefono(profile.telefono || '')
    }
  }, [profile])

  useEffect(() => {
    if (user) {
      supabase.from('orders')
        .select('*')
        .eq('user_id', user.id)
        .eq('estado', 'Finalizado')
        .order('created_at', { ascending: false })
        .then(({ data }) => { setOrders(data || []); setLoadingOrders(false) })
    }
  }, [user])

  if (loading) return <div className="spinner" />
  if (!user) return <Navigate to="/login" />

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const { error } = await updateProfile({ nombre, direccion, telefono })
    if (error) toast.error('Error al guardar: ' + error.message)
    else toast.success('Perfil actualizado ✓')
    setSaving(false)
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.pageHeader}>
          <h1 className="page-title">MI CUENTA</h1>
          <p className={styles.email}>{user.email}</p>
        </div>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'profile' ? styles.tabActive : ''}`} onClick={() => setTab('profile')}>
            <User size={16} /> Mis datos
          </button>
          <button className={`${styles.tab} ${tab === 'orders' ? styles.tabActive : ''}`} onClick={() => setTab('orders')}>
            <Package size={16} /> Mis compras
          </button>
        </div>

        {tab === 'profile' && (
          <div className={styles.card}>
            <form onSubmit={handleSave} className={styles.form}>
              <div className={styles.formGrid}>
                <div className="form-group">
                  <label>Nombre completo</label>
                  <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input type="text" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="+54 11 ..." />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Dirección de entrega</label>
                  <input type="text" value={direccion} onChange={e => setDireccion(e.target.value)} placeholder="Calle, número, localidad" />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          </div>
        )}

        {tab === 'orders' && (
          <div className={styles.card}>
            {loadingOrders ? <div className="spinner" /> :
              orders.length === 0 ? (
                <div className={styles.empty}>
                  <Package size={48} opacity={0.3} />
                  <p>Todavía no tenés compras finalizadas.</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Pedido</th>
                        <th>Fecha</th>
                        <th>Productos</th>
                        <th>Envío</th>
                        <th>Total</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id}>
                          <td><code className={styles.orderId}>#{o.id.slice(-8).toUpperCase()}</code></td>
                          <td>{new Date(o.created_at).toLocaleDateString('es-AR')}</td>
                          <td>
                            <ul className={styles.orderItems}>
                              {o.detalles_carrito.map((item, i) => (
                                <li key={i}>{item.cantidad}x {item.nombre}</li>
                              ))}
                            </ul>
                          </td>
                          <td>${o.costo_envio.toLocaleString('es-AR')}</td>
                          <td><strong>${o.total.toLocaleString('es-AR')}</strong></td>
                          <td><span className="badge badge-green">{o.estado}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>
        )}
      </div>
    </div>
  )
}
