import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/ui/ProductCard'
import { Trophy, Zap, Star, Tv } from 'lucide-react'
import { Link } from 'react-router-dom'
import styles from './Home.module.css'

// Importaciones de Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [banners, setBanners] = useState([]);
  const [eslogan, setEslogan] = useState('');

  useEffect(() => {
    // 1. Cargar Banners con todos los nuevos campos (link_url, show_badge, etc.)
    supabase.from('banners').select('*').order('order_index')
      .then(({ data }) => setBanners(data || []));

    // 2. Cargar Eslogan
    supabase.from('config_envio').select('eslogan_principal').eq('id', 1).single()
      .then(({ data }) => setEslogan(data?.eslogan_principal));

    // 3. Cargar Productos Destacados
    supabase.from('products')
      .select('*')
      .gt('stock', 0)
      .order('destacado', { ascending: false })
      .limit(8) 
      .then(({ data }) => {
        setProducts(data || [])
        setLoading(false)
      })
  }, [])

  return (
    <div className={styles.homeWrapper}>
      
      {/* SECCIÓN 1: CARRUSEL DINÁMICO MEJORADO */}
      <section className={styles.heroCarousel}>
        <Swiper 
          modules={[Autoplay, Pagination, EffectFade]} 
          effect="fade"
          autoplay={{ delay: 6000, disableOnInteraction: false }} 
          pagination={{ clickable: true }}
          className={styles.mySwiper}
        >
          {banners.length > 0 ? (
            banners.map((b) => (
              <SwiperSlide key={b.id}>
                <div 
                  className={styles.mainSlide} 
                  style={{ backgroundImage: `url(${b.image_url})` }}
                >
                  <div className={styles.slideOverlay}>
                    <div className="container">
                      <div className={styles.slideContent}>
                        
                        {/* LÓGICA DE ETIQUETA (BADGE) ON/OFF Y COLOR DINÁMICO */}
                        {b.show_badge && (
                          <div 
                            className={styles.heroBadge} 
                            style={{ backgroundColor: b.badge_color || '#ffcc00' }}
                          >
                            <Trophy size={16} /> 
                            <span>{b.badge_text || 'FIFA WORLD CUP 2026™'}</span>
                          </div>
                        )}
                        
                        <h1 className={styles.heroTitle}>
                          {b.title}
                        </h1>
                        
                        <p className={styles.heroSub}>
                          {b.subtitle}
                        </p>
                        
                        <div className={styles.heroActions}>
                          {/* LÓGICA DE LINK PERSONALIZADO */}
                          <Link 
                            to={b.link_url || "/productos"} 
                            className="btn btn-gold"
                          >
                            <Tv size={20} style={{marginRight: '8px'}} />
                            {b.button_text || 'Ver Catálogo'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))
          ) : (
            <SwiperSlide>
              <div className={styles.heroFallback}>
                <div className="container">
                  <h1 className={styles.heroTitle}>MANTECA<span className={styles.heroGold}>TECH</span></h1>
                  <p className={styles.heroSub}>Cargando las mejores ofertas...</p>
                </div>
              </div>
            </SwiperSlide>
          )}
        </Swiper>
      </section>

      {/* SECCIÓN 2: BARRA DE ESLOGAN */}
      <div className={styles.sloganBar}>
        <div className="container">
          <p className={styles.sloganText}>
            {eslogan || "La tecnología que tu pasión merece, cerca de tu casa."}
          </p>
        </div>
      </div>

      {/* SECCIÓN 3: FEATURES (ICONOS) */}
      <section className={styles.features}>
        <div className="container">
          <div className={styles.featureGrid}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}><Zap /></div>
              <div className={styles.featureText}>
                <h4>Entrega Rápida</h4>
                <p>Envíos a todo el GBA</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}><Star /></div>
              <div className={styles.featureText}>
                <h4>Garantía Oficial</h4>
                <p>12 meses de cobertura</p>
              </div>
            </div>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}><Trophy /></div>
              <div className={styles.featureText}>
                <h4>Precio Mundial</h4>
                <p>Ofertas imbatibles</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 4: PRODUCTOS DESTACADOS */}
      <section className={styles.productsSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitleMain}>DESTACADOS</h2>
            <Link to="/productos" className={styles.btnVerTodos}>Ver todos →</Link>
          </div>

          {loading ? (
            <div className={styles.loaderContainer}><div className="spinner" /></div>
          ) : (
            <div className={styles.productGrid}>
              {products.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SECCIÓN 5: BANNER MUNDIAL INFERIOR */}
      <section className={styles.worldcupBanner}>
        <div className="container">
          <div className={styles.bannerInner}>
            <div className={styles.bannerTextContainer}>
              <h2 className={styles.bannerTitle}>¿TU TV ESTÁ LISTA?</h2>
              <p className={styles.bannerSub}>Llevate la tuya con envío express al GBA</p>
            </div>
            <Link to="/productos" className="btn btn-gold">
              <Tv size={18} /> Ver Ofertas
            </Link>
          </div>
        </div>
      </section>

 
    </div>
  )
}