import { useState } from 'react'
import { X, Trash2, Plus, Minus, MapPin, Loader, MessageCircle, ShoppingBag } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useShipping } from '../../hooks/useShipping'
import { supabase } from '../../lib/supabase'
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

  async function handleCP() {
    if (!cp || cp.length < 4) { toast.error('Ingresá un código postal válido'); return }
    calcularEnvio({ cp, subtotal })
  }

  async function handleCheckout() {
    if (!address) { toast.error('Ingresá la dirección de entrega'); return }
    setLoadingOrder(true)

    try {
      const cartDetails = items.map(i => ({
        product_id: i.id,
        nombre: i.nombre,
        cantidad: i.cantidad,
        precio_unitario: i.precio
      }))

      const { data: order, error } = await supabase.from('orders').insert({
        user_id: user?.id || null,
        detalles_carrito: cartDetails,
        direccion_entrega: address,
        costo_envio: shipping?.costo || 0,
        subtotal,
        total,
        estado: 'Pendiente',
        metodo_pago: 'WhatsApp'
      }).select().single()

      if (error) throw error

      // Construir mensaje WhatsApp
      const lineas = items.map(i => `▪️ ${i.cantidad}x ${i.nombre} — $${(i.precio * i.cantidad).toLocaleString('es-AR')}`)
      const msg = [
        `🛒 *NUEVO PEDIDO MatecaTech #${order.id.slice(-8).toUpperCase()}*`,
        '',
        ...lineas,
        '',
        `📍 *Envío:* ${address}`,
        `🚚 *Costo de envío:* $${(shipping?.costo || 0).toLocaleString('es-AR')}`,
        `💰 *TOTAL: $${total.toLocaleString('es-AR')}*`,
        '',
        `👤 *Cliente:* ${profile?.nombre || user?.email || 'Invitado'}`,
        `📱 Por favor confirmar disponibilidad y forma de pago.`
      ].join('\n')

      const phone = import.meta.env.VITE_WHATSAPP_NUMBER || '5491100000000'
      const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
      window.open(waUrl, '_blank')

      clearCart()
      setStep('cart')
      onClose()
      toast.success('¡Pedido enviado por WhatsApp!', { duration: 4000 })
    } catch (err) {
      toast.error('Error al crear el pedido: ' + err.message)
    } finally {
      setLoadingOrder(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.drawer}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <ShoppingBag size={20} />
            <span>Tu Carrito {items.length > 0 && `(${items.length})`}</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><X size={22} /></button>
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <ShoppingBag size={52} opacity={0.3} />
            <p>Tu carrito está vacío</p>
            <button className="btn btn-primary" onClick={onClose}>Ver Smart TVs</button>
          </div>
        ) : step === 'cart' ? (
          <>
            <div className={styles.items}>
              {items.map(item => (
                <div key={item.id} className={styles.item}>
                  <div className={styles.itemImg}>
                    {item.imagen_url
                      ? <img src={item.imagen_url} alt={item.nombre} />
                      : <div className={styles.itemImgPlaceholder}>📺</div>
                    }
                  </div>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.nombre}</span>
                    <span className={styles.itemPrice}>${item.precio.toLocaleString('es-AR')}</span>
                    <div className={styles.qtyControls}>
                      <button onClick={() => updateQty(item.id, item.cantidad - 1)}><Minus size={14} /></button>
                      <span>{item.cantidad}</span>
                      <button onClick={() => updateQty(item.id, item.cantidad + 1)}><Plus size={14} /></button>
                    </div>
                  </div>
                  <button className={styles.removeBtn} onClick={() => removeItem(item.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.footer}>
              <div className={styles.subtotalRow}>
                <span>Subtotal</span>
                <span className={styles.subtotalAmt}>${subtotal.toLocaleString('es-AR')}</span>
              </div>
              <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setStep('shipping')}>
                <MapPin size={17} /> Calcular Envío y Continuar
              </button>
            </div>
          </>
        ) : step === 'shipping' ? (
          <div className={styles.shippingStep}>
            <h3 className={styles.stepTitle}>📍 Calculá el envío</h3>

            <div className={styles.methodTabs}>
              <button className={`${styles.tab} ${locMethod === 'geo' ? styles.tabActive : ''}`} onClick={() => setLocMethod('geo')}>
                <MapPin size={15} /> GPS
              </button>
              <button className={`${styles.tab} ${locMethod === 'cp' ? styles.tabActive : ''}`} onClick={() => setLocMethod('cp')}>
                📮 Código Postal
              </button>
            </div>

            {locMethod === 'geo' ? (
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleGeo}>
                {loadingShip ? <Loader size={16} className="spin" /> : <MapPin size={16} />}
                Usar mi ubicación
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Ej: 1437"
                  value={cp}
                  onChange={e => setCp(e.target.value)}
                  maxLength={6}
                  style={{ flex: 1, padding: '0.65rem 0.8rem', border: '2px solid var(--gris-medio)', borderRadius: '6px', fontSize: '1rem' }}
                />
                <button className="btn btn-primary" onClick={handleCP} disabled={loadingShip}>
                  {loadingShip ? <Loader size={16} /> : 'Calcular'}
                </button>
              </div>
            )}

            {shipping && (
              <div className={styles.shippingResult}>
                <p className={styles.shippingMsg}>{shipping.mensaje}</p>
                <div className={styles.shippingCost}>
                  {shipping.costo === 0
                    ? <span className={styles.free}>¡ENVÍO GRATIS!</span>
                    : <span>${shipping.costo.toLocaleString('es-AR')}</span>
                  }
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Dirección de entrega</label>
              <input
                type="text"
                placeholder="Calle, número, piso, localidad"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>

            <div className={styles.totalBlock}>
              <div className={styles.totalRow}><span>Subtotal</span><span>${subtotal.toLocaleString('es-AR')}</span></div>
              <div className={styles.totalRow}><span>Envío</span><span>{shipping ? `$${shipping.costo.toLocaleString('es-AR')}` : '—'}</span></div>
              <div className={`${styles.totalRow} ${styles.totalFinal}`}><span>TOTAL</span><span>${total.toLocaleString('es-AR')}</span></div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-outline" onClick={() => setStep('cart')}>← Volver</button>
              <button
                className="btn btn-green"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleCheckout}
                disabled={!shipping || !address || loadingOrder}
              >
                {loadingOrder ? <Loader size={16} className="spin" /> : <MessageCircle size={17} />}
                Finalizar por WhatsApp
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}
