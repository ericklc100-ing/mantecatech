# 📺 MatecaTech — E-commerce de Smart TVs

**Tienda online especializada en Smart TVs con temática del Mundial 2026**

---

## 🚀 Setup Rápido

### 1. Clonar e instalar

```bash
cd matecatech
npm install
```

### 2. Crear proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) y crear un proyecto
2. En **Settings → API**, copiar:
   - `Project URL`
   - `anon public key`
3. Crear archivo `.env` en la raíz:

```env
VITE_SUPABASE_URL=https://TU_ID.supabase.co
VITE_SUPABASE_ANON_KEY=TU_ANON_KEY
VITE_WHATSAPP_NUMBER=5491100000000
VITE_ADMIN_EMAIL=tu@email.com
```

### 3. Ejecutar el Schema SQL

1. En Supabase, ir a **SQL Editor**
2. Copiar y pegar el contenido de `supabase_schema.sql`
3. Ejecutar el script

### 4. Configurar Storage

El script SQL ya crea el bucket `product-images`. Verificar en **Storage** que exista y sea público.

### 5. Hacerte admin

Después de crear tu cuenta en la app, ejecutar en el SQL Editor:

```sql
UPDATE public.profiles SET es_admin = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'tu@email.com');
```

### 6. Correr localmente

```bash
npm run dev
```

---

## 🌐 Deploy en Render

1. Subir el proyecto a un repositorio de GitHub
2. Ir a [render.com](https://render.com) → **New Web Service**
3. Conectar el repositorio
4. Configurar:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npx serve dist -s -l 10000`
5. Agregar las variables de entorno en **Environment**
6. Deploy 🚀

---

## 📁 Estructura del Proyecto

```
matecatech/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx          # Barra de navegación con carrito
│   │   │   └── Navbar.module.css
│   │   └── ui/
│   │       ├── ProductCard.jsx     # Card de producto con badge "Precio Mundial"
│   │       ├── ProductCard.module.css
│   │       ├── CartDrawer.jsx      # Drawer lateral del carrito
│   │       └── CartDrawer.module.css
│   ├── context/
│   │   ├── AuthContext.jsx         # Estado global de autenticación
│   │   └── CartContext.jsx         # Carrito con persistencia en localStorage
│   ├── hooks/
│   │   └── useShipping.js          # Cálculo de envío por GPS o código postal
│   ├── lib/
│   │   └── supabase.js             # Cliente de Supabase
│   ├── pages/
│   │   ├── Home.jsx                # Landing con hero y productos destacados
│   │   ├── Products.jsx            # Catálogo con filtros
│   │   ├── Auth.jsx                # Login / Registro
│   │   ├── Profile.jsx             # Panel del usuario
│   │   └── Admin.jsx               # Panel de administración
│   ├── styles/
│   │   └── globals.css             # Variables CSS y estilos globales
│   ├── App.jsx                     # Router principal
│   └── main.jsx                    # Entry point
├── supabase_schema.sql             # ⬅️ Ejecutar en Supabase SQL Editor
├── render.yaml                     # Config de deploy en Render
├── .env.example                    # Variables de entorno de ejemplo
└── package.json
```

---

## ⚙️ Funcionalidades

### 🛒 Carrito
- Persistencia en `localStorage`
- Context API con estado global
- Sincronización automática al hacer login

### 📍 Cálculo de Envío
- Por GPS (geolocalización del navegador)
- Por Código Postal
- Origen: Lomas del Mirador, GBA
- Bonificación para zona cercana
- Envío gratis por monto mínimo (configurable)

### 💬 Checkout por WhatsApp
- Crea pedido en Supabase con estado "Pendiente"
- Abre WhatsApp con mensaje formateado completo

### 👤 Panel de Usuario
- Editar perfil (nombre, dirección, teléfono)
- Ver historial de compras finalizadas

### 🔧 Panel Admin
- **Inventario:** CRUD completo + subida de imágenes a Supabase Storage
- **Pedidos:** Ver todos los pedidos, marcar como Finalizado o Cancelado
- **Configuración:** Editar precio por km, bonificaciones, envío gratis

---

## 🎨 Diseño

- **Azul Profundo:** `#003153`
- **Verde WhatsApp:** `#008F39`
- **Oro:** `#FFD700`
- **Fuentes:** Bebas Neue (display) + Barlow Condensed (títulos) + Barlow (body)

---

## 📱 WhatsApp

Configurar el número en `.env`:
```
VITE_WHATSAPP_NUMBER=5491100000000
```
Formato: código de país + código de área + número, sin espacios ni guiones.
Argentina: `54` + `9` + `11` + número = `5491112345678`
