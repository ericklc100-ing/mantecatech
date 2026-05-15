import { ShoppingCart, Tv, Star } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { Link } from 'react-router-dom' // 1. Importamos Link
import toast from 'react-hot-toast'
import styles from './ProductCard.module.css'

export default function ProductCard({ product }) {
  const { addItem } = useCart()

  function handleAdd(e) {
    e.preventDefault() // 2. Evitamos que al tocar el botón se abra la página de detalles
    if (product.stock <= 0) return
    addItem(product)
    toast.success(`"${product.nombre}" agregado al carrito`, {
      icon: '📺',
      style: { background: '#003153', color: '#fff', borderLeft: '4px solid #FFD700' }
    })
  }

  const badgeClass = {
    'Precio Mundial': styles.badgeGold,
    'Premium': styles.badgeBlue,
    'Más Vendido': styles.badgeGreen,
    'Top de Línea': styles.badgePurple,
    'Oferta': styles.badgeRed,
  }[product.badge] || styles.badgeGold

  return (
    <div className={styles.card}>
      {/* 3. Envolvemos todo el contenido visual en un Link hacia el detalle */}
      <Link to={`/producto/${product.id}`} className={styles.productLink}>
        {product.badge && (
          <span className={`${styles.badge} ${badgeClass}`}>{product.badge}</span>
        )}
        {product.destacado && (
          <span className={styles.starBadge}><Star size={12} fill="currentColor" /></span>
        )}

        <div className={styles.imageWrapper}>
          {product.imagen_url ? (
            <img src={product.imagen_url} alt={product.nombre} loading="lazy" />
          ) : (
            <div className={styles.placeholder}>
              <Tv size={48} />
              <span>{product.pulgadas}" {product.resolucion}</span>
            </div>
          )}
        </div>

        <div className={styles.body}>
          <div className={styles.brand}>{product.marca} · {product.pulgadas}"</div>
          <h3 className={styles.title}>{product.nombre}</h3>

          <div className={styles.specs}>
            {product.resolucion && <span className={styles.spec}>{product.resolucion}</span>}
            {product.sistema_operativo && <span className={styles.spec}>{product.sistema_operativo}</span>}
          </div>

          <p className={styles.desc}>
            {product.descripcion?.slice(0, 90)}{product.descripcion?.length > 90 ? '…' : ''}
          </p>

          <div className={styles.footer}>
            <div className={styles.priceBlock}>
              <span className={styles.pricePre}>$</span>
              <span className={styles.price}>{product.precio.toLocaleString('es-AR')}</span>
            </div>

            <button
              className={`btn ${product.stock > 0 ? 'btn-gold' : ''} ${styles.addBtn} ${product.stock <= 0 ? styles.disabled : ''}`}
              onClick={handleAdd} // El preventDefault en handleAdd evita que navegue al agregar
              disabled={product.stock <= 0}
            >
              <ShoppingCart size={16} />
              {product.stock > 0 ? 'Agregar' : 'Sin stock'}
            </button>
          </div>

          {product.stock > 0 && product.stock <= 5 && (
            <p className={styles.lowStock}>⚡ Solo {product.stock} en stock</p>
          )}
        </div>
      </Link>
    </div>
  )
}