import { useEffect, useState, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import {
  Package, ShoppingBag, Settings, Plus, Edit2, Trash2,
  Check, X, Upload, Save, Loader, Layout, Image as ImageIcon
} from 'lucide-react'
import styles from './Admin.module.css'

export default function Admin() {
  const { user, isAdmin, loading } = useAuth()
  const [tab, setTab] = useState('products')

  if (loading) return <div className="spinner" />
  if (!user || !isAdmin) return <Navigate to="/" />

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.pageHeader}>
          <h1 className="page-title">PANEL ADMIN</h1>
          <span className="badge badge-red">🔒 Solo administradores</span>
        </div>

        <div className={styles.tabs}>
          {[
            { key: 'products', icon: <Package size={16} />, label: 'Inventario' },
            { key: 'orders', icon: <ShoppingBag size={16} />, label: 'Pedidos' },
            { key: 'config', icon: <Settings size={16} />, label: 'Configuración Envío' },
            { key: 'web', icon: <Layout size={16} />, label: 'Diseño Web' },
          ].map(t => (
            <button 
              key={t.key} 
              className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`} 
              onClick={() => setTab(t.key)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === 'products' && <ProductsAdmin />}
        {tab === 'orders' && <OrdersAdmin />}
        {tab === 'config' && <ShippingConfig />}
        {tab === 'web' && <WebAdmin />} 
      </div>
    </div>
  )
}

// ─── PRODUCTOS (INVENTARIO) ──────────────────────────────────────────────────
function ProductsAdmin() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()
  
  const emptyForm = { nombre: '', descripcion: '', precio: '', stock: '', resolucion: '', sistema_operativo: '', marca: '', pulgadas: '', destacado: false, badge: '', imagen_url: '' }
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { fetchProducts() }, [])

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const filename = `product-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(filename, file)
    if (error) {
      toast.error('Error al subir: ' + error.message)
    } else {
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filename)
      setForm(f => ({ ...f, imagen_url: publicUrl }))
      toast.success('Imagen lista')
    }
    setUploading(false)
  }

  async function handleSave() {
    const payload = { ...form, precio: parseFloat(form.precio), stock: parseInt(form.stock), pulgadas: form.pulgadas ? parseInt(form.pulgadas) : null }
    if (editId) {
      await supabase.from('products').update(payload).eq('id', editId)
      toast.success('Actualizado')
    } else {
      await supabase.from('products').insert(payload)
      toast.success('Creado')
    }
    setShowForm(false)
    fetchProducts()
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className="section-title">Inventario</h2>
        <button className="btn btn-gold" onClick={() => {setForm(emptyForm); setEditId(null); setShowForm(true)}}>
          <Plus size={16} /> Nuevo Producto
        </button>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <div className={styles.formGrid}>
            <div className="form-group"><label>Nombre</label><input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} /></div>
            <div className="form-group"><label>Precio</label><input type="number" value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} /></div>
            <div className="form-group"><label>Stock</label><input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} /></div>
            <div className="form-group">
              <label>Imagen</label>
              <input type="file" ref={fileRef} onChange={handleImageUpload} hidden />
              <button className="btn btn-outline" onClick={() => fileRef.current.click()} disabled={uploading}>
                {uploading ? <Loader className={styles.spin} /> : <Upload size={14}/>} Subir
              </button>
            </div>
          </div>
          <div style={{display:'flex', gap:'1rem', marginTop:'1rem'}}>
            <button className="btn btn-primary" onClick={handleSave}>Guardar</button>
            <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="table-wrapper">
        <table>
          <thead><tr><th>Imagen</th><th>Nombre</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td><img src={p.imagen_url} style={{width:50, height:30, objectFit:'cover'}} alt="" /></td>
                <td>{p.nombre}</td>
                <td>${p.precio.toLocaleString()}</td>
                <td>{p.stock}</td>
                <td>
                  <button onClick={() => {setForm(p); setEditId(p.id); setShowForm(true)}}><Edit2 size={14}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── PEDIDOS (INVENTARIO IGUAL) ──────────────────────────────────────────────
function OrdersAdmin() {
  const [orders, setOrders] = useState([])
  useEffect(() => {
    supabase.from('orders').select('*').order('created_at', {ascending: false})
      .then(({data}) => setOrders(data || []))
  }, [])

  return (
    <div className={styles.section}>
      <h2 className="section-title">Pedidos Recientes</h2>
      <div className="table-wrapper">
        <table>
          <thead><tr><th>ID</th><th>Cliente</th><th>Total</th><th>Estado</th></tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}>
                <td>#{o.id.slice(-6)}</td>
                <td>{o.direccion_entrega}</td>
                <td>${o.total?.toLocaleString()}</td>
                <td><span className="badge badge-gold">{o.estado}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── CONFIGURACIÓN DE ENVÍO (IGUAL) ──────────────────────────────────────────
function ShippingConfig() {
  const [config, setConfig] = useState(null)
  useEffect(() => {
    supabase.from('config_envio').select('*').eq('id', 1).single().then(({data}) => setConfig(data))
  }, [])

  async function save() {
    await supabase.from('config_envio').update(config).eq('id', 1)
    toast.success('Configuración guardada')
  }

  if (!config) return null

  return (
    <div className={styles.section}>
      <h2 className="section-title">Configuración de Envío</h2>
      <div className={styles.configCard}>
        <div className="form-group">
          <label>Precio por KM</label>
          <input type="number" value={config.precio_por_km} onChange={e => setConfig({...config, precio_por_km: e.target.value})} />
        </div>
        <button className="btn btn-primary" onClick={save} style={{marginTop:'1rem'}}>Actualizar</button>
      </div>
    </div>
  )
}

// ─── DISEÑO WEB (MODIFICADO: CUADRITOS CON CRUZ Y EDICIÓN COMPLETA) ───────────────────────────
function WebAdmin() {
  const [eslogan, setEslogan] = useState('')
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const fileRef = useRef()

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const { data: conf } = await supabase.from('config_envio').select('eslogan_principal').eq('id', 1).single()
    setEslogan(conf?.eslogan_principal || '')
    const { data: bans } = await supabase.from('banners').select('*').order('order_index')
    setBanners(bans || [])
    if (bans && bans.length > 0 && !editingBanner) setEditingBanner(bans[0])
  }

  async function handleAddBanner(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const filename = `banner-${Date.now()}`
    await supabase.storage.from('product-images').upload(filename, file)
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filename)
    
    const { data: newBan } = await supabase.from('banners').insert([{ 
      image_url: publicUrl, 
      title: 'NUEVO BANNER',
      show_badge: true,
      badge_text: 'FIFA WORLD CUP 2026™',
      badge_color: '#ffcc00',
      link_url: '/products' 
    }]).select().single()
    
    fetchData()
    setEditingBanner(newBan)
    setUploading(false)
  }

  async function saveBannerChanges() {
    if (!editingBanner) return
    setLoading(true)
    const { error } = await supabase
      .from('banners')
      .update({
        title: editingBanner.title,
        subtitle: editingBanner.subtitle,
        button_text: editingBanner.button_text,
        link_url: editingBanner.link_url,
        show_badge: editingBanner.show_badge, // ON/OFF
        badge_text: editingBanner.badge_text, // Contenido
        badge_color: editingBanner.badge_color // Color
      })
      .eq('id', editingBanner.id)

    if (error) toast.error('Error al guardar')
    else {
      toast.success('Banner actualizado correctamente')
      fetchData()
    }
    setLoading(false)
  }

  return (
    <div className={styles.section}>
      <h2 className="section-title">Diseño de Portada</h2>
      
      {/* ESLOGAN */}
      <div className={styles.configCard} style={{marginBottom: '2rem'}}>
        <label>Eslogan Principal (Home)</label>
        <div style={{display: 'flex', gap: '1rem', marginTop: '0.5rem'}}>
          <input value={eslogan} onChange={e => setEslogan(e.target.value)} style={{flex: 1}} />
          <button className="btn btn-primary" onClick={async () => {
             await supabase.from('config_envio').update({ eslogan_principal: eslogan }).eq('id', 1)
             toast.success('Eslogan guardado')
          }}>Guardar</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* IZQUIERDA: MINIATURAS */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h3 className="section-title">Imágenes del Carrusel</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
            <div onClick={() => fileRef.current.click()} style={{ aspectRatio: '16/9', border: '2px dashed #ddd', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              {uploading ? <Loader className={styles.spin} /> : <Plus size={24} color="#aaa" />}
              <input type="file" ref={fileRef} onChange={handleAddBanner} hidden accept="image/*" />
            </div>
            {banners.map(b => (
              <img key={b.id} src={b.image_url} onClick={() => setEditingBanner(b)} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: '8px', border: editingBanner?.id === b.id ? '3px solid #003366' : '1px solid #eee', cursor: 'pointer' }} />
            ))}
          </div>
        </div>

        {/* DERECHA: EDITOR COMPLETO */}
        <div style={{ flex: '1.2', minWidth: '350px' }}>
          {editingBanner && (
            <div className={styles.formCard} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <h4 style={{marginBottom: '1.5rem'}}>Configuración del Banner</h4>
              
              {/* --- BLOQUE ETIQUETA (BADGE) --- */}
              <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #e9ecef' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <label style={{ fontWeight: 'bold', color: '#444' }}>Etiqueta Superior (Badge)</label>
                  {/* INTERRUPTOR ON/OFF */}
                  <div 
                    onClick={() => setEditingBanner({...editingBanner, show_badge: !editingBanner.show_badge})}
                    style={{
                      width: '50px', height: '24px', borderRadius: '12px', cursor: 'pointer',
                      background: editingBanner.show_badge ? '#4cd137' : '#d2dae2',
                      position: 'relative', transition: '0.3s'
                    }}
                  >
                    <div style={{ 
                      width: '18px', height: '18px', background: 'white', borderRadius: '50%',
                      position: 'absolute', top: '3px', left: editingBanner.show_badge ? '29px' : '3px',
                      transition: '0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                  </div>
                </div>

                {editingBanner.show_badge && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '1rem' }}>
                    <div>
                      <label style={{fontSize: '12px'}}>Texto de la Etiqueta</label>
                      <input 
                        value={editingBanner.badge_text} 
                        onChange={e => setEditingBanner({...editingBanner, badge_text: e.target.value})}
                        style={{width: '100%', padding: '6px'}}
                      />
                    </div>
                    <div>
                      <label style={{fontSize: '12px'}}>Color</label>
                      <input 
                        type="color"
                        value={editingBanner.badge_color} 
                        onChange={e => setEditingBanner({...editingBanner, badge_color: e.target.value})}
                        style={{width: '100%', height: '34px', padding: '2px', cursor: 'pointer'}}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* CONTENIDO PRINCIPAL */}
              <div className="form-group" style={{marginBottom: '1rem'}}>
                <label>Título Principal</label>
                <input value={editingBanner.title} onChange={e => setEditingBanner({...editingBanner, title: e.target.value})} style={{width:'100%', padding:'8px'}} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                  <label>Texto Botón</label>
                  <input value={editingBanner.button_text} onChange={e => setEditingBanner({...editingBanner, button_text: e.target.value})} style={{width:'100%', padding:'8px'}} />
                </div>
                <div className="form-group">
                  <label>Enlace (URL)</label>
                  <input value={editingBanner.link_url} onChange={e => setEditingBanner({...editingBanner, link_url: e.target.value})} style={{width:'100%', padding:'8px'}} />
                </div>
              </div>

              <button className="btn btn-primary" onClick={saveBannerChanges} style={{width:'100%'}}>
                Guardar Todo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}