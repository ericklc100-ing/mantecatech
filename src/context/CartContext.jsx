import { createContext, useContext, useEffect, useReducer } from 'react'

const CartContext = createContext({})

const CART_KEY = 'matecatech_cart'

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const existing = state.find(i => i.id === action.product.id)
      if (existing) {
        return state.map(i =>
          i.id === action.product.id
            ? { ...i, cantidad: Math.min(i.cantidad + 1, action.product.stock) }
            : i
        )
      }
      return [...state, { ...action.product, cantidad: 1 }]
    }
    case 'REMOVE':
      return state.filter(i => i.id !== action.id)
    case 'UPDATE_QTY':
      return state.map(i =>
        i.id === action.id ? { ...i, cantidad: Math.max(1, Math.min(action.qty, i.stock)) } : i
      )
    case 'CLEAR':
      return []
    case 'LOAD':
      return action.items
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const saved = (() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || [] } catch { return [] }
  })()

  const [items, dispatch] = useReducer(cartReducer, saved)

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (product) => dispatch({ type: 'ADD', product })
  const removeItem = (id) => dispatch({ type: 'REMOVE', id })
  const updateQty = (id, qty) => dispatch({ type: 'UPDATE_QTY', id, qty })
  const clearCart = () => dispatch({ type: 'CLEAR' })

  const totalItems = items.reduce((s, i) => s + i.cantidad, 0)
  const subtotal = items.reduce((s, i) => s + i.precio * i.cantidad, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
