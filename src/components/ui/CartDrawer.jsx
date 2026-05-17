import { useState } from 'react'
import { X, Trash2, Plus, Minus, MapPin, Loader, MessageCircle, ShoppingBag } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useShipping } from '../../hooks/useShipping'
import toast from 'react-hot-toast'
import styles from './CartDrawer.module.css'

export default function CartDrawer({ isOpen, onClose }) {
  const { items, removeItem, updateQty, clearCart, subtotal } = useCart()
  const { user, profile } = useAuth()
  const { shipping, loadingShip, calcularEnvio } = useShipping()

  const [step, setStep] = useState('cart') // cart | shipping | confirm
  const [locMethod, setLocMethod] = useState('geo') // geo | cp
  const [cp, setCp] = useState('')
  const [address, setAddress] = useState(profile?.direccion || '')
  const [loadingOrder, setLoadingOrder] = useState(false)

  const total = subtotal + (shipping?.costo || 0)

  if (!isOpen) return null

  async function handleGeo() {
    if (!navigator.geolocation) {
      toast.error('Tu navegador no soporta geolocalización')
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => calcularEnvio({ lat: pos.coords.latitude, lng: pos.coords.longitude, subtotal }),
      () => toast.error('No se pudo obtener la ubicación. Usá el código postal.')
    )
  }

  async function handleCP(e) {
    e.preventDefault()
    if (!cp.trim()) return
    calcularEnvio({ cp: cp.trim(), subtotal })
  }

  async function handleCheckout() {
    setLoadingOrder(true)
    try {
      let mensaje = `*NUEVO PEDIDO - MANTECATECH*\n\n`
      mensaje += `*Cliente:* ${profile?.nombre || user?.email || 'Detalle'}\n`
      mensaje += `*Dirección:* ${address}\n\n`
      mensaje += `*Productos:*\n`
      
      items.forEach(item => {
        mensaje += `• ${item.cantidad}x ${item.nombre} - $${(item.precio * item.cantidad).toLocaleString('es-AR')}\n`
      })

      mensaje += `\n*Subtotal:* $${subtotal.toLocaleString('es-AR')}`
      mensaje += `\n*Envío:* $${shipping.costo.toLocaleString('es-AR')}`
      mensaje += `\n*TOTAL:* $${total.toLocaleString('es-AR')}`

      const encoded = encodeURIComponent(mensaje)
      window.open(`https://wa.me/541138627202?text=${encoded}`, '_blank')
      clearCart()
      onClose()
      setStep('cart')
    } catch (err) {
      toast.error('Error al procesar el pedido')
    } finally {
      setLoadingOrder(false)
    }
  }

  return (
    <>
      {/* Cierre al hacer clic en la zona oscura exterior */}
      <div className={styles.overlay} onClick={onClose} />
      
      <div className={styles.drawer}>
        
        {/* ENCABEZADO CON CIERRE EN LOGO Y EN CRUZ */}
        <div className={styles.header}>
          {/* El contenedor del logo ahora es un botón que ejecuta onClose al tocarlo */}
          <button className={styles.logoCloseBtn} onClick={onClose} title="Cerrar carrito">
            <ShoppingBag size={20} />
            <h2>Mi Carrito</h2>
          </button>
          
          {/* Cruz clásica de cierre siempre presente en PC y Celular */}
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar carrito">
            <X size={24} />
          </button>
        </div>

        {/* CUERPO DEL CARRITO */}
        {items.length === 0 ? (
          <div className={styles.empty}>
            <ShoppingBag size={44} strokeWidth={1.5} />
            <p>Tu carrito está vacío</p>
            <button className="btn btn-gold" onClick={onClose}>Ver productos</button>
          </div>
        ) : step === 'cart' ? (
          <>
            <div className={styles.items}>
              {items.map(item => (
                <div key={item.id} className={styles.item}>
                  {item.image_url && (
                    <img src={item.image_url} alt={item.nombre} className={styles.itemImage} />
                  )}
                  <div className={styles.itemInfo}>
                    <h4 className={styles.itemName}>{item.nombre}</h4>
                    <span className={styles.itemPrice}>${item.precio.toLocaleString('es-AR')}</span>
                  </div>
                  
                  <div className={styles.qtyAction}>
                    <button className={styles.qtyBtn} onClick={() => updateQty(item.id, item.cantidad - 1)}>
                      <Minus size={13} />
                    </button>
                    <span className={styles.qtyNum}>{item.cantidad}</span>
                    <button className={styles.qtyBtn} onClick={() => updateQty(item.id, item.cantidad + 1)}>
                      <Plus size={13} />
                    </button>
                  </div>

                  <button className={styles.removeBtn} onClick={() => removeItem(item.id)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.footer}>
              <div className={styles.totalBlock}>
                <div className={styles.totalRow}>
                  <span>Subtotal:</span>
                  <strong>${subtotal.toLocaleString('es-AR')}</strong>
                </div>
              </div>
              <button className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={() => setStep('shipping')}>
                Continuar con el envío →
              </button>
            </div>
          </>
        ) : step === 'shipping' ? (
          <div className={styles.items} style={{ gap: '1.25rem' }}>
            <h3>Método de Entrega</h3>
            
            <div className={styles.methodTabs}>
              <button 
                className={`${styles.tab} ${locMethod === 'geo' ? styles.tabActive : ''}`}
                onClick={() => setLocMethod('geo')}
              >
                <MapPin size={15} /> Ubicación GPS
              </button>
              <button 
                className={`${styles.tab} ${locMethod === 'cp' ? styles.tabActive : ''}`}
                onClick={() => setLocMethod('cp')}
              >
                Código Postal
              </button>
            </div>

            {locMethod === 'geo' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.4' }}>
                  Calculá el costo de entrega express mediante el GPS de tu celular.
                </p>
                <button className="btn btn-outline" style={{ justifyContent: 'center' }} onClick={handleGeo} disabled={loadingShip}>
                  {loadingShip ? <Loader size={16} className="spin" /> : <MapPin size={15} />}
                  Calcular por GPS
                </button>
              </div>
            ) : (
              <form onSubmit={handleCP} style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  placeholder="Ej: 1752" 
                  value={cp} 
                  onChange={e => setCp(e.target.value)}
                  style={{ flex: 1, padding: '0.6rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.9rem' }}
                />
                <button type="submit" className="btn btn-primary" disabled={loadingShip}>
                  {loadingShip ? <Loader size={16} className="spin" /> : 'Calcular'}
                </button>
              </form>
            )}

            {shipping && (
              <div className={styles.shippingBox}>
                <div className={styles.shippingInfo}>
                  <span className={styles.shipZone}>Zona: {shipping.zona}</span>
                  <span className={styles.shipPrice}>Costo: ${shipping.costo.toLocaleString('es-AR')}</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem' }}>
              <button className="btn btn-outline" onClick={() => setStep('cart')}>← Volver</button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, justifyContent: 'center' }} 
                onClick={() => setStep('confirm')}
                disabled={!shipping}
              >
                Siguiente
              </button>
            </div>
          </div>
        ) : step === 'confirm' ? (
          <div className={styles.items} style={{ gap: '1.25rem' }}>
            <h3>Confirmar Datos</h3>

            <div className="form-group">
              <label>Dirección de entrega</label>
              <input
                type="text"
                placeholder="Calle, número, piso, localidad"
                value={address}
                onChange={e => setAddress(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.9rem' }}
              />
            </div>

            <div className={styles.totalBlock}>
              <div className={styles.totalRow}><span>Subtotal</span><span>${subtotal.toLocaleString('es-AR')}</span></div>
              <div className={styles.totalRow}><span>Envío</span><span>{shipping ? `$${shipping.costo.toLocaleString('es-AR')}` : '—'}</span></div>
              <div className={`${styles.totalRow} ${styles.totalFinal}`}><span>TOTAL</span><span>${total.toLocaleString('es-AR')}</span></div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem' }}>
              <button className="btn btn-outline" onClick={() => setStep('shipping')}>← Volver</button>
              <button
                className="btn btn-green"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleCheckout}
                disabled={!shipping || !address.trim() || loadingOrder}
              >
                {loadingOrder ? <Loader size={16} className="spin" /> : <MessageCircle size={16} />}
                Finalizar por WhatsApp
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}