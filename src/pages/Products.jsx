import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom' // Sincroniza con el Navbar
import { supabase } from '../lib/supabase'
import ProductCard from '../components/ui/ProductCard'
import { Search, SlidersHorizontal } from 'lucide-react'
import styles from './Products.module.css'

const BRANDS = ['Todas', 'Samsung', 'LG', 'Sony', 'TCL', 'Philips', 'Noblex']
const RESOLUCIONES = ['Todas', 'Full HD', '4K UHD', '4K QLED', '4K UHD OLED', '8K']

export default function Products() {
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [brand, setBrand] = useState('Todas')
  const [res, setRes] = useState('Todas')
  const [sortBy, setSortBy] = useState('default')
  
  const [searchParams] = useSearchParams()

  useEffect(() => {
    supabase.from('products').select('*').gt('stock', 0).then(({ data }) => {
      setProducts(data || [])
      setFiltered(data || [])
      setLoading(false)
    })
  }, [])

  // Escucha los cambios del buscador del Navbar de forma automática
  useEffect(() => {
    const queryParam = searchParams.get('search')
    if (queryParam) {
      setSearch(queryParam)
    } else {
      setSearch('')
    }
  }, [searchParams])

  useEffect(() => {
    let result = [...products]
    if (search) result = result.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()) || p.descripcion?.toLowerCase().includes(search.toLowerCase()))
    if (brand !== 'Todas') result = result.filter(p => p.marca === brand)
    if (res !== 'Todas') result = result.filter(p => p.resolucion === res)

    if (sortBy === 'price_asc') result.sort((a, b) => a.precio - b.precio)
    if (sortBy === 'price_desc') result.sort((a, b) => b.precio - a.precio)
    if (sortBy === 'featured') result.sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0))

    setFiltered(result)
  }, [search, brand, res, sortBy, products])

  return (
    <div className={`container ${styles.container}`}>
      <h1 className={styles.title}>Nuestras Smart TVs</h1>

      <div className={styles.filtersBar}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            placeholder="Buscar por modelo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <select value={brand} onChange={e => setBrand(e.target.value)} className={styles.select}>
          {BRANDS.map(b => <option key={b}>{b}</option>)}
        </select>

        <select value={res} onChange={e => setRes(e.target.value)} className={styles.select}>
          {RESOLUCIONES.map(r => <option key={r}>{r}</option>)}
        </select>

        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={styles.select}>
          <option value="default">Ordenar por</option>
          <option value="price_asc">Menor precio</option>
          <option value="price_desc">Mayor precio</option>
          <option value="featured">Destacados</option>
        </select>
      </div>

      <div className={styles.resultsCount}>
        <SlidersHorizontal size={15} />
        {filtered.length} producto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
      </div>

      {loading
        ? <div className="spinner" />
        : filtered.length > 0
          ? <div className="products-grid">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          : <div className={styles.noResults}>
              <span style={{ fontSize: '3rem' }}>📺</span>
              <p>No se encontraron Smart TVs con ese filtro.</p>
            </div>
      }
    </div>
  )
}