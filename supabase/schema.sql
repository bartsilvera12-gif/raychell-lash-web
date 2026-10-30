-- =====================================================================
--  Reychell Lash — panel de administracion
--  Schema propio: raychelllashweb
--
--  Pegar entero en el SQL Editor de Supabase y ejecutar. Se puede correr
--  mas de una vez: no duplica datos ni pisa lo que ya este cargado.
--
--  No toca public ni ningun otro schema de aplicacion. La unica excepcion
--  es el bucket de imagenes (ultima seccion), que por como funciona
--  Supabase Storage vive si o si en el schema `storage`; todo lo de ahi
--  esta acotado al bucket 'raychelllash' y no afecta a otros buckets.
-- =====================================================================

create schema if not exists raychelllashweb;

-- ---------------------------------------------------------------------
-- 1. Quien es administrador
-- ---------------------------------------------------------------------

create table if not exists raychelllashweb.admins (
  email      text primary key,
  created_at timestamptz not null default now()
);

insert into raychelllashweb.admins (email)
values ('admin@raychelllash.com')
on conflict (email) do nothing;

-- Lee el email del JWT que manda PostgREST. No depende del schema auth:
-- si el token no trae email, devuelve false.
-- SECURITY DEFINER a proposito: asi puede leer la tabla admins sin que la
-- politica de la propia tabla se llame a si misma.
create or replace function raychelllashweb.is_admin()
returns boolean
language sql
stable
security definer
set search_path = raychelllashweb, pg_catalog
as $$
  select exists (
    select 1
    from raychelllashweb.admins a
    where lower(a.email) = lower(
      coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'email', '')
    )
  );
$$;

revoke all on function raychelllashweb.is_admin() from public;

-- Marca de tiempo de la ultima edicion.
create or replace function raychelllashweb.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 2. Tablas de contenido
-- ---------------------------------------------------------------------

-- Servicios (los efectos del catalogo)
create table if not exists raychelllashweb.services (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  description    text not null default '',
  price          text not null default '',
  image_url      text not null default '',
  -- background-position de la foto, para encuadrar un recorte que no quede
  -- bien centrado. 'center' sirve para casi todas.
  image_position text not null default 'center',
  position       integer not null default 0,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Sobre Reychell: los bloques de texto
create table if not exists raychelllashweb.about_blocks (
  id         uuid primary key default gen_random_uuid(),
  label      text not null,
  body       text not null default '',
  position   integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Sobre Reychell: las fotos.
--   slot 'retrato' -> la foto grande al lado del texto (se usa la primera)
--   slot 'tira'    -> la fila de fotos del final de la pagina
create table if not exists raychelllashweb.about_images (
  id         uuid primary key default gen_random_uuid(),
  image_url  text not null default '',
  alt        text not null default '',
  slot       text not null default 'tira',
  position   integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint about_images_slot_check check (slot in ('retrato', 'tira'))
);

-- Galeria.
--   is_featured -> ademas aparece en el carrusel del inicio
--   is_wide     -> ocupa el doble de ancho en la grilla de la galeria
--   image_url   -> tamano grande (carrusel y visor ampliado)
--   thumb_url   -> tamano chico (grilla y miniaturas del carrusel)
create table if not exists raychelllashweb.gallery_images (
  id          uuid primary key default gen_random_uuid(),
  image_url   text not null default '',
  thumb_url   text not null default '',
  -- tamano muy chico, solo para las miniaturas del carrusel del inicio
  mini_url    text not null default '',
  label       text not null default '',
  is_featured boolean not null default false,
  is_wide     boolean not null default false,
  -- proporcion del recorte en la grilla; '3/4' sirve para casi todas
  ratio       text not null default '3/4',
  position    integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Tabla de precios: los grupos (Retoque, Disenos especiales, Extras) y sus
-- renglones. El campo ask es como se nombra el grupo en el mensaje de
-- WhatsApp: "Me interesa " || ask.
create table if not exists raychelllashweb.price_groups (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  ask        text not null default '',
  position   integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists raychelllashweb.price_items (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references raychelllashweb.price_groups (id) on delete cascade,
  label      text not null,
  price      text not null default '',
  position   integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Configuracion general. Una sola fila, siempre id = 1.
create table if not exists raychelllashweb.settings (
  id              integer primary key default 1,
  cover_image_url text not null default '',
  whatsapp        text not null default '',
  address         text not null default '',
  hours           text not null default '',
  instagram_url   text not null default '',
  facebook_url    text not null default '',
  updated_at      timestamptz not null default now(),
  constraint settings_single_row check (id = 1)
);

-- Triggers de updated_at
do $$
declare t text;
begin
  foreach t in array array['services', 'about_blocks', 'about_images',
                           'gallery_images', 'price_groups', 'price_items',
                           'settings']
  loop
    execute format('drop trigger if exists touch_updated_at on raychelllashweb.%I', t);
    execute format(
      'create trigger touch_updated_at before update on raychelllashweb.%I
       for each row execute function raychelllashweb.touch_updated_at()', t);
  end loop;
end $$;

create index if not exists services_position_idx       on raychelllashweb.services (position);
create index if not exists about_blocks_position_idx   on raychelllashweb.about_blocks (position);
create index if not exists about_images_slot_idx       on raychelllashweb.about_images (slot, position);
create index if not exists gallery_images_position_idx on raychelllashweb.gallery_images (position);
create index if not exists price_groups_position_idx  on raychelllashweb.price_groups (position);
create index if not exists price_items_group_idx      on raychelllashweb.price_items (group_id, position);

-- ---------------------------------------------------------------------
-- 3. Permisos y RLS
--    La pagina publica lee con la anon key; solo un admin logueado escribe.
-- ---------------------------------------------------------------------

grant usage on schema raychelllashweb to anon, authenticated;
grant execute on function raychelllashweb.is_admin() to anon, authenticated;

grant select on raychelllashweb.services, raychelllashweb.about_blocks,
                raychelllashweb.about_images, raychelllashweb.gallery_images,
                raychelllashweb.price_groups, raychelllashweb.price_items,
                raychelllashweb.settings
  to anon, authenticated;

grant insert, update, delete on raychelllashweb.services,
                raychelllashweb.about_blocks, raychelllashweb.about_images,
                raychelllashweb.gallery_images, raychelllashweb.price_groups,
                raychelllashweb.price_items, raychelllashweb.settings
  to authenticated;

grant select on raychelllashweb.admins to authenticated;

alter table raychelllashweb.admins         enable row level security;
alter table raychelllashweb.services       enable row level security;
alter table raychelllashweb.about_blocks   enable row level security;
alter table raychelllashweb.about_images   enable row level security;
alter table raychelllashweb.gallery_images enable row level security;
alter table raychelllashweb.price_groups   enable row level security;
alter table raychelllashweb.price_items    enable row level security;
alter table raychelllashweb.settings       enable row level security;

do $$
declare t text;
begin
  -- Contenido: lo lee cualquiera, lo edita solo un admin.
  foreach t in array array['services', 'about_blocks', 'about_images',
                           'gallery_images', 'price_groups', 'price_items',
                           'settings']
  loop
    execute format('drop policy if exists lectura_publica on raychelllashweb.%I', t);
    execute format('drop policy if exists escritura_admin on raychelllashweb.%I', t);

    execute format(
      'create policy lectura_publica on raychelllashweb.%I
       for select to anon, authenticated using (true)', t);

    execute format(
      'create policy escritura_admin on raychelllashweb.%I
       for all to authenticated
       using (raychelllashweb.is_admin())
       with check (raychelllashweb.is_admin())', t);
  end loop;
end $$;

-- La lista de admins solo la ve un admin.
drop policy if exists admins_solo_admin on raychelllashweb.admins;
create policy admins_solo_admin on raychelllashweb.admins
  for select to authenticated using (raychelllashweb.is_admin());

-- ---------------------------------------------------------------------
-- 4. Contenido inicial
--    Solo se carga si la tabla esta vacia, asi que volver a correr este
--    archivo no pisa nada de lo que se haya editado desde el panel.
--    Las imagenes apuntan a los archivos que ya vienen con la pagina;
--    al subir una nueva desde el panel se reemplazan por una URL del bucket.
-- ---------------------------------------------------------------------

insert into raychelllashweb.services (name, description, price, image_url, image_position, position)
select * from (values
  ('Efecto natural',       'Realza tu mirada con un acabado natural y elegante. Ideal para el día a día.', 'Gs. 100.000', 'assets/srv-natural-md.webp',  'center',    0),
  ('Efecto clásico',       'Más longitud y definición. Un look sutil pero impactante.',                     'Gs. 120.000', 'assets/srv-clasico-md.webp',  '72% 62%',   1),
  ('Efecto híbrido',       'La combinación perfecta entre lo natural y el volumen.',                        'Gs. 130.000', 'assets/srv-hibrido-md.webp',  'center',    2),
  ('Efecto volumen',       'Máxima densidad y profundidad en tu mirada.',                                   'Gs. 150.000', 'assets/srv-volumen-md.webp',  'center',    3),
  ('Efecto mega volumen',  'Para una mirada más intensa y espectacular.',                                   'Gs. 170.000', 'assets/foto-7-md.webp',       'center',    4)
) as v
where not exists (select 1 from raychelllashweb.services);

insert into raychelllashweb.about_blocks (label, body, position)
select * from (values
  ('Su historia',             'Espacio reservado para que Reychell cuente, con sus palabras, cómo llegó a dedicarse a la belleza de la mirada.', 0),
  ('Su manera de trabajar',   'Cada cita empieza eligiendo el efecto —natural, clásico, híbrido, volumen o mega volumen— según la forma de tus ojos y el cuidado que puedas darles.', 1),
  ('Su formación',            'Reservado para la formación confirmada por Reychell. No se publica nada sin su validación.', 2),
  ('Su enfoque de atención',  'Espacio para explicar cómo acompaña a cada clienta antes, durante y después del servicio.', 3)
) as v
where not exists (select 1 from raychelllashweb.about_blocks);

insert into raychelllashweb.about_images (image_url, alt, slot, position)
select * from (values
  ('assets/foto-3-md.webp', 'Reychell durante una sesión de extensiones', 'retrato', 0),
  ('assets/foto-5-md.webp', 'El espacio de trabajo durante una sesión',   'tira',    0),
  ('assets/foto-6-md.webp', 'Aplicación pelo a pelo con pinzas',          'tira',    1),
  ('assets/foto-2-md.webp', 'Resultado de un set de volumen',             'tira',    2)
) as v
where not exists (select 1 from raychelllashweb.about_images);

insert into raychelllashweb.gallery_images (image_url, thumb_url, mini_url, label, is_featured, is_wide, ratio, position)
select * from (values
  ('assets/foto-1-lg.webp', 'assets/foto-1-md.webp', 'assets/foto-1-sm.webp', 'Volumen · mirada completa',      true,  false, '1/1',   0),
  ('assets/foto-7-lg.webp', 'assets/foto-7-md.webp', 'assets/foto-7-sm.webp', 'Efecto natural · plano cerrado', true,  false, '3/4',   1),
  ('assets/foto-2-lg.webp', 'assets/foto-2-md.webp', '',                      'Abanicos de volumen',            false, true,  '16/11', 2),
  ('assets/foto-4-lg.webp', 'assets/foto-4-md.webp', 'assets/foto-4-sm.webp', 'Efecto clásico · detalle',       true,  false, '3/4',   3),
  ('assets/foto-6-lg.webp', 'assets/foto-6-md.webp', 'assets/foto-6-sm.webp', 'Aplicación pelo a pelo',         true,  false, '3/4',   4),
  ('assets/foto-3-lg.webp', 'assets/foto-3-md.webp', '',                      'Sesión en el estudio',           false, false, '3/4',   5),
  ('assets/foto-5-lg.webp', 'assets/foto-5-md.webp', '',                      'Cuidado durante la sesión',      false, false, '3/4',   6)
) as v
where not exists (select 1 from raychelllashweb.gallery_images);

-- Los renglones se cuelgan de su grupo por el titulo. Si los grupos ya
-- existen, el with no devuelve filas y no se inserta ningun renglon.
with g as (
  insert into raychelllashweb.price_groups (title, ask, position)
  select * from (values
    ('Retoque',             'un retoque',          0),
    ('Diseños especiales',  'un diseño especial',  1),
    ('Extras',              'uno de los extras',   2)
  ) as v
  where not exists (select 1 from raychelllashweb.price_groups)
  returning id, title
)
insert into raychelllashweb.price_items (group_id, label, price, position)
select g.id, i.label, i.price, i.position
from g
join (values
  ('Retoque',            '15 días',                    'Gs. 60.000',  0),
  ('Retoque',            '21 días',                    'Gs. 80.000',  1),
  ('Retoque',            '30 días',                    'Gs. 100.000', 2),
  ('Diseños especiales', 'Efecto wispy',               'Gs. 180.000', 0),
  ('Diseños especiales', 'Kim Kardashian',             'Gs. 180.000', 1),
  ('Diseños especiales', 'Fox eyes',                   'Gs. 180.000', 2),
  ('Extras',             'Retiro de pestañas',         'Gs. 40.000',  0),
  ('Extras',             'Limpieza facial + pestañas', 'Gs. 120.000', 1)
) as i (title, label, price, position) on i.title = g.title;

insert into raychelllashweb.settings (id, cover_image_url, whatsapp, address, hours, instagram_url, facebook_url)
select 1, 'assets/portada-lg.webp', '595984053323',
       'San Lorenzo, Paraguay · dirección exacta al confirmar tu cita.',
       'Pendiente de confirmación.',
       'https://www.instagram.com/reychell_lash/',
       'https://www.facebook.com/profile.php?id=61596141145825'
where not exists (select 1 from raychelllashweb.settings);

-- ---------------------------------------------------------------------
-- 5. Bucket de imagenes
--
--    OJO: esta es la unica parte que escribe fuera de raychelllashweb.
--    Supabase Storage guarda los buckets en el schema `storage`, no hay
--    forma de evitarlo. Las cuatro politicas estan filtradas por
--    bucket_id = 'raychelllash', asi que no tocan ningun otro bucket.
--    Si preferis, salteate esta seccion y crea el bucket a mano desde
--    Studio (Storage -> New bucket -> nombre 'raychelllash', publico).
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('raychelllash', 'raychelllash', true)
on conflict (id) do update set public = true;

drop policy if exists raychelllash_lectura   on storage.objects;
drop policy if exists raychelllash_subir     on storage.objects;
drop policy if exists raychelllash_actualizar on storage.objects;
drop policy if exists raychelllash_borrar    on storage.objects;

create policy raychelllash_lectura on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'raychelllash');

create policy raychelllash_subir on storage.objects
  for insert to authenticated
  with check (bucket_id = 'raychelllash' and raychelllashweb.is_admin());

create policy raychelllash_actualizar on storage.objects
  for update to authenticated
  using (bucket_id = 'raychelllash' and raychelllashweb.is_admin())
  with check (bucket_id = 'raychelllash' and raychelllashweb.is_admin());

create policy raychelllash_borrar on storage.objects
  for delete to authenticated
  using (bucket_id = 'raychelllash' and raychelllashweb.is_admin());

-- ---------------------------------------------------------------------
-- 6. Avisarle a PostgREST
--
--    PostgREST guarda en memoria la estructura de la base. Sin este aviso
--    sigue sin ver las tablas recien creadas y responde 404 (PGRST205)
--    aunque esten ahi.
--
--    'reload config' es para cuando se acaba de agregar raychelllashweb a
--    la lista de schemas expuestos. Si esa lista viene de una variable de
--    entorno, igual hace falta reiniciar el servicio rest.
-- ---------------------------------------------------------------------

notify pgrst, 'reload config';
notify pgrst, 'reload schema';
