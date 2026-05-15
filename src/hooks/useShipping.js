import { useState } from 'react'
import { supabase } from '../lib/supabase'

// Coordenadas origen: Lomas del Mirador, Buenos Aires
const ORIGEN = { lat: -34.6586, lng: -58.5166 }

function calcDistanciaKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function useShipping() {
  const [shipping, setShipping] = useState(null)
  const [loadingShip, setLoadingShip] = useState(false)
  const [shipError, setShipError] = useState(null)

  async function calcularEnvio({ lat, lng, cp, subtotal }) {
    setLoadingShip(true)
    setShipError(null)

    try {
      const { data: config } = await supabase.from('config_envio').select('*').eq('id', 1).single()
      if (!config) throw new Error('No se pudo obtener la configuración de envío')

      // Envío gratis por monto mínimo
      if (subtotal >= (config.envio_gratis_minimo || 150000)) {
        setShipping({ costo: 0, mensaje: '🎉 ¡Envío gratis por compra superior a $' + config.envio_gratis_minimo.toLocaleString('es-AR') + '!', distancia: 0 })
        setLoadingShip(false)
        return
      }

      let distancia = 0
      let costo = 0
      let mensaje = ''

      if (lat && lng) {
        distancia = calcDistanciaKm(ORIGEN.lat, ORIGEN.lng, lat, lng)
      } else if (cp) {
        // Geocodificación simple por CP para CABA
        const esCABA = config.cp_validos?.some(v => cp.startsWith(v.substring(0, 4)))
        if (esCABA) distancia = 8 // promedio CABA
        else distancia = 25 // fuera de CABA estimado
      }

      const enZonaBonificacion = distancia <= (config.radio_bonificacion || 10)

      if (enZonaBonificacion) {
        const costoBruto = distancia * config.precio_por_km
        costo = Math.max(0, costoBruto - config.monto_bonificacion)
        mensaje = `📍 Zona bonificada (${distancia.toFixed(1)} km) — Descuento aplicado`
      } else {
        costo = distancia * config.precio_por_km
        mensaje = `🚚 Envío a ${distancia.toFixed(1)} km de distancia`
      }

      setShipping({ costo: Math.round(costo), mensaje, distancia: distancia.toFixed(1) })
    } catch (err) {
      setShipError(err.message)
    } finally {
      setLoadingShip(false)
    }
  }

  return { shipping, loadingShip, shipError, calcularEnvio }
}
