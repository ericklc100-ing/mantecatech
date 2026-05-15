-- =====================================================
-- MATECATECH — Supabase Schema Completo
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================

-- 1. TABLA PRODUCTS
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  descripcion text,
  precio numeric(10,2) not null,
  stock integer not null default 0,
  imagen_url text,
  resolucion text,         -- ej: '4K UHD', '8K', 'Full HD'
  sistema_operativo text,  -- ej: 'Android TV 13', 'Google TV'
  marca text,
  pulgadas integer,
  destacado boolean default false,
  badge text,              -- ej: 'Precio Mundial', 'Oferta', 'Nuevo'
  created_at timestamptz default now()
);

-- 2. TABLA PROFILES (extiende auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  nombre text,
  telefono text,
  direccion text,
  ciudad text,
  codigo_postal text,
  historial_compras jsonb default '[]'::jsonb,
  es_admin boolean default false,
  created_at timestamptz default now()
);

-- 3. TABLA ORDERS
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  detalles_carrito jsonb not null,  -- array de {product_id, nombre, cantidad, precio_unitario}
  direccion_entrega text,
  costo_envio numeric(10,2) default 0,
  subtotal numeric(10,2) not null,
  total numeric(10,2) not null,
  estado text default 'Pendiente' check (estado in ('Pendiente','Finalizado','Cancelado')),
  metodo_pago text default 'WhatsApp',
  notas text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. TABLA CONFIG_ENVIO
create table if not exists public.config_envio (
  id integer primary key default 1,  -- solo 1 fila
  precio_por_km numeric(10,2) default 150,
  radio_bonificacion integer default 10,    -- km
  monto_bonificacion numeric(10,2) default 500,
  cp_validos text[] default array['1000','1001','1002','1437'],
  envio_gratis_minimo numeric(10,2) default 150000,
  lat_origen numeric default -34.6586,   -- Lomas del Mirador
  lng_origen numeric default -58.5166,
  updated_at timestamptz default now()
);

-- Insertar configuración default
insert into public.config_envio (id) values (1) on conflict (id) do nothing;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.config_envio enable row level security;

-- Products: todos pueden leer, solo admin escribe
create policy "products_public_read" on public.products
  for select using (true);

create policy "products_admin_all" on public.products
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and es_admin = true)
  );

-- Profiles: solo el propio usuario o admin
create policy "profiles_own" on public.profiles
  for all using (auth.uid() = id);

create policy "profiles_admin_read" on public.profiles
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and es_admin = true)
  );

-- Orders: usuario ve los suyos, admin ve todos
create policy "orders_own_read" on public.orders
  for select using (auth.uid() = user_id);

create policy "orders_insert_any" on public.orders
  for insert with check (true);

create policy "orders_admin_all" on public.orders
  for all using (
    exists (select 1 from public.profiles where id = auth.uid() and es_admin = true)
  );

-- Config envío: todos leen, solo admin modifica
create policy "config_envio_public_read" on public.config_envio
  for select using (true);

create policy "config_envio_admin_write" on public.config_envio
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and es_admin = true)
  );

-- =====================================================
-- TRIGGER: Auto-crear perfil al registrarse
-- =====================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, nombre)
  values (new.id, new.raw_user_meta_data->>'nombre')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================================================
-- TRIGGER: Actualizar historial de compras al finalizar
-- =====================================================
create or replace function public.sync_order_to_profile()
returns trigger language plpgsql security definer as $$
begin
  if new.estado = 'Finalizado' and old.estado != 'Finalizado' and new.user_id is not null then
    update public.profiles
    set historial_compras = historial_compras || jsonb_build_object(
      'order_id', new.id,
      'total', new.total,
      'fecha', new.updated_at,
      'items', new.detalles_carrito
    )
    where id = new.user_id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_order_finalized on public.orders;
create trigger on_order_finalized
  after update on public.orders
  for each row execute procedure public.sync_order_to_profile();

-- =====================================================
-- STORAGE: Bucket para imágenes de productos
-- =====================================================
insert into storage.buckets (id, name, public) 
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product_images_public_read" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "product_images_admin_upload" on storage.objects
  for insert with check (
    bucket_id = 'product-images' and
    exists (select 1 from public.profiles where id = auth.uid() and es_admin = true)
  );

create policy "product_images_admin_delete" on storage.objects
  for delete using (
    bucket_id = 'product-images' and
    exists (select 1 from public.profiles where id = auth.uid() and es_admin = true)
  );

-- =====================================================
-- DATOS DE PRUEBA (Productos Smart TVs)
-- =====================================================
insert into public.products (nombre, descripcion, precio, stock, resolucion, sistema_operativo, marca, pulgadas, destacado, badge, imagen_url) values
('Samsung Crystal 4K 55"', 'Viví el Mundial en casa con la claridad de 4K Crystal. Procesador Crystal 4K, HDR10+, PurColor. La pantalla ideal para vivir cada gol.', 289999, 15, '4K UHD', 'Tizen OS', 'Samsung', 55, true, 'Precio Mundial', 'https://images.samsung.com/ar/televisions/uhd-4k-tv/cu7000/UA55CU7000GXZS_001_Front_Black.jpg'),
('LG OLED C3 65"', 'Panel OLED evo con colores perfectos y negro absoluto. Dolby Vision IQ, Dolby Atmos, Gaming Hub. El mejor OLED para el mundial.', 749999, 8, '4K UHD OLED', 'webOS 23', 'LG', 65, true, 'Premium', 'https://www.lg.com/ar/images/tvs/md07562685/gallery/medium01.jpg'),
('TCL QLED 4K 50"', 'QLED con Google TV. Quantum Dot, HDR Pro, 60Hz. Smart TV completa con todas las apps del mundial.', 189999, 20, '4K QLED', 'Google TV', 'TCL', 50, false, 'Más Vendido', null),
('Philips Ambilight 58"', 'Tecnología Ambilight exclusiva + 4K UHD. La experiencia de estadio en tu living. P5 Engine, HDR10+.', 359999, 10, '4K UHD', 'Google TV', 'Philips', 58, true, 'Precio Mundial', null),
('Noblex Smart 43"', 'Smart TV accesible con todas las funciones. Full HD, Android TV, Google Assistant. La opción inteligente.', 129999, 30, 'Full HD', 'Android TV 11', 'Noblex', 43, false, null, null),
('Sony BRAVIA XR 75"', 'Procesador XR Cognitive Intelligence. 4K 120Hz, HDMI 2.1, VRR. Pantalla de 75" para una experiencia de cine.', 1199999, 5, '4K UHD', 'Google TV', 'Sony', 75, true, 'Top de Línea', null);

-- =====================================================
-- HACER ADMIN AL PRIMER USUARIO (ejecutar después de registrarte)
-- Reemplaza 'tu@email.com' con tu email
-- =====================================================
-- update public.profiles set es_admin = true
-- where id = (select id from auth.users where email = 'tu@email.com');
