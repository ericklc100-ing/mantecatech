import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext' 
import { ShoppingCart, Truck, ShieldCheck, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'
import ProductCard from '../components/ui/ProductCard'
import styles from './ProductDetail.module.css'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentImg, setCurrentImg] = useState(0)
  
  // CORRECCIÓN: Usamos addItem que es el nombre real en tu CartContext
  const { addItem } = useCart()

  useEffect(() => {
    window.scrollTo(0, 0)
    loadProductData()
  }, [id])

  async function loadProductData() {
    setLoading(true)
    const { data: prod } = await supabase.from('products').select('*').eq('id', id).single()

    if (prod) {
      setProduct(prod)
      const { data: rel } = await supabase.from('products').select('*').neq('id', id).limit(4)
      setRelated(rel || [])
    }
    setLoading(false)
  }

  if (loading) return <div className="spinner-container"><div className="spinner" /></div>
  if (!product) return <div className="container">Producto no encontrado.</div>

  const images = product.imagenes_secundarias || [product.imagen_url]

  return (
    <div className={styles.detailPage}>
      <div className="container">
        <nav className={styles.breadcrumb}>
          <Link to="/productos">Productos</Link> / <span>{product.nombre}</span>
        </nav>

        <div className={styles.mainGrid}>
          <div className={styles.gallerySection}>
            <div className={styles.mainImageWrapper}>
              <img src={images[currentImg]} alt={product.nombre} className={styles.mainImage} />
              {images.length > 1 && (
                <>
                  <button className={styles.navBtn} onClick={() => setCurrentImg(prev => prev === 0 ? images.length - 1 : prev - 1)}><ChevronLeft /></button>
                  <button className={`${styles.navBtn} ${styles.next}`} onClick={() => setCurrentImg(prev => (prev + 1) % images.length)}><ChevronRight /></button>
                </>
              )}
            </div>
            <div className={styles.thumbnails}>
              {images.map((img, idx) => (
                <img 
                  key={idx} src={img} 
                  className={`${styles.thumb} ${idx === currentImg ? styles.activeThumb : ''}`}
                  onClick={() => setCurrentImg(idx)}
                />
              ))}
            </div>
          </div>

          <div className={styles.infoSection}>
            <h1 className={styles.title}>{product.nombre}</h1>
            <div className={styles.priceTag}>
              ${product.precio?.toLocaleString('es-AR')}
              <span className={styles.cuotas}>en 1x transferencia (Precio Especial)</span>
            </div>

            <div className={styles.shippingBox}>
              <div className={styles.shippingItem}>
                <Truck className={styles.icon} size={20} />
                <div>
                  <strong>Envío a coordinar</strong>
                  <p>Bonificación especial en CABA y Lomas del Mirador.</p>
                </div>
              </div>
              <div className={styles.shippingItem}>
                <ShieldCheck className={styles.icon} size={20} />
                <div>
                  <strong>Garantía MatecaTech</strong>
                  <p>12 meses de garantía oficial.</p>
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              {/* CORRECCIÓN: Llamamos a addItem */}
              <button className="btn btn-gold btn-large" onClick={() => addItem(product)}>
                <ShoppingCart size={20} /> Agregar al carrito
              </button>
              <a 
                href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}?text=Hola! Me interesa: ${product.nombre}`}
                target="_blank" rel="noreferrer" className="btn btn-outline btn-large"
              >
                <MessageCircle size={20} /> Consultar por WhatsApp
              </a>
            </div>
          </div>
        </div>

        <section className={styles.descriptionSection}>
          <h2 className={styles.sectionTitle}>Descripción Técnica</h2>
          <div className={styles.descriptionGrid}>
            <div className={styles.descText}><p>{product.descripcion}</p></div>
            <div className={styles.specsTable}>
              <div className={styles.specRow}><span>Resolución</span> <span>{product.resolucion || '4K Ultra HD'}</span></div>
              <div className={styles.specRow}><span>Sistema</span> <span>{product.sistema_operativo || 'Android TV'}</span></div>
              <div className={styles.specRow}><span>HDMI / USB</span> <span>3 / 2</span></div>
            </div>
          </div>
        </section>

        <section className={styles.relatedSection}>
          <h2 className={styles.sectionTitle}>Propuestas similares</h2>
          <div className="products-grid">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      </div>

      {/* FOOTER AÑADIDO */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerContent}>
            <div>
              <h3 className={styles.footerLogo}>MANTECATECH</h3>
              <p>Expertos en Smart TVs de alta gama.</p>
            </div>
            <div className={styles.footerLinks}>
              <Link to="/">Inicio</Link>
              <Link to="/productos">Tienda</Link>
              <a href="#contacto">Contacto</a>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>© 2026 MantecaTech - Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}