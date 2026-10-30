# Reychell Lash — sitio web

Sitio estático de Reychell Lash (extensiones de pestañas, San Lorenzo, Paraguay),
listo para desplegar en Vercel sin paso de build.

## Estructura

```
index.html      Página principal (generada desde source/reychell-lash-v2.dc.html)
support.js      Runtime que interpreta la plantilla y la monta con React
vendor/         React y ReactDOM 18.3.1 (UMD) servidos desde el propio dominio
assets/         Fotos y logos
source/         Archivo .dc.html original (fuente editable)
scripts/        Scripts de mantenimiento (regenerar index.html, optimizar fotos)
admin/          Panel de administración (se entra por /admin)
config.js       Datos de conexión a Supabase (valores públicos)
supabase/       El SQL que crea el schema raychelllashweb
Dockerfile      Imagen con nginx para desplegar en Coolify
docker/         Configuración de nginx (caché, cabeceras, fallback de rutas)
vercel.json     Lo mismo, para cuando se despliega en Vercel
```

El sitio es una SPA con ruteo por hash (`#/servicios`, `#/galeria`, …), así que no
necesita rutas en el servidor.

## Panel de administración

Se entra por `/admin` con una cuenta de Supabase Auth. Desde ahí se editan los
servicios, Sobre Reychell, la galería, los instructores y los datos de contacto,
sin tocar el código.

### Puesta en marcha (una sola vez)

Si ya corriste el SQL antes y después se agregaron tablas nuevas (por ejemplo
la tabla de precios), volvé a correr `supabase/schema.sql` entero: crea lo que
falte y no toca lo que ya está cargado.

1. **Crear las tablas.** Pegar `supabase/schema.sql` entero en el SQL Editor de
   Supabase y ejecutar. Crea el schema `raychelllashweb` con su contenido
   inicial —el mismo que ya tiene la página— y el bucket de imágenes. Termina
   avisándole a PostgREST que recargue, así ve las tablas nuevas sin reiniciar
   nada. Se puede correr más de una vez sin duplicar nada.
2. **Exponer el schema en la API.** En el Supabase self-hosted, agregar
   `raychelllashweb` a la variable `PGRST_DB_SCHEMAS` del servicio `rest`
   (queda, por ejemplo, `public,storage,graphql_public,raychelllashweb`) y
   reiniciar ese servicio. Sin esto la API responde `PGRST106`.
3. **Crear la cuenta.** En Studio → Authentication → Users → Add user, con el
   correo `admin@raychelllash.com` y una contraseña. Ese correo ya está cargado
   en la tabla `raychelllashweb.admins`; para sumar a otra persona, agregar su
   correo a esa tabla.

### Qué se puede editar

| Sección | Qué permite |
|---|---|
| Servicios | Agregar, editar, ordenar y borrar servicios, con foto, detalle, nombre y precio. Incluye la tabla de precios de abajo: los grupos (Retoque, Diseños especiales, Extras) y sus renglones |
| Sobre Reychell | Los bloques de texto y las fotos (la principal y la tira del final) |
| Galería | Agregar fotos, marcar cuáles son destacadas para el carrusel del inicio |
| Configuración | Foto de portada, WhatsApp, ubicación, horarios y redes sociales |

El WhatsApp que se carga en Configuración es el que usan el botón flotante, los
enlaces de cada servicio, la tabla de precios y el pie de página.

### Las fotos

Van al bucket `raychelllash` de Supabase. Antes de subirlas, el panel las achica
y las convierte a WebP en el navegador, así una foto sacada con el celular no
termina pesando varios megas en la página. De la galería se guardan dos tamaños:
uno grande para el visor ampliado y uno chico para la grilla.

Las fotos que ya venían con la página siguen sirviéndose desde `assets/` hasta
que se reemplacen desde el panel.

### Si Supabase no responde

La página pública no se rompe: muestra el contenido que trae el propio
`index.html`, que es el mismo con el que se sembró la base.

## Desplegar en Coolify

El repositorio trae un `Dockerfile` que sirve el sitio con nginx, con el caché de
las fotos y las cabeceras de seguridad ya configurados.

1. En Coolify: *New Resource → Application → Public/Private Repository*.
2. Elegí este repositorio y la rama `main`.
3. En *Build Pack* seleccioná **Dockerfile** (no Nixpacks).
4. En *Domains* poné `https://raychelllash.com`.
5. Deploy.

Antes de desplegar, en el DNS del dominio:

- El registro `A` de `raychelllash.com` tiene que apuntar a la IP del servidor
  de Coolify.
- El `CNAME` de `www` tiene que apuntar a `raychelllash.com`.
- Si el DNS está en Cloudflare, dejá los dos en **DNS only** (nube gris) para el
  primer despliegue: con el proxy activado Coolify no puede completar el desafío
  de Let's Encrypt y se queda sin certificado. Si después querés activar el
  proxy, poné antes el SSL de Cloudflare en **Full (strict)**.

## Desplegar en Vercel

Opción A — desde el panel de Vercel:

1. Entrá a https://vercel.com/new e importá este repositorio de GitHub.
2. En *Framework Preset* elegí **Other**.
3. Dejá *Build Command* y *Output Directory* vacíos (es un sitio estático).
4. Deploy.

Opción B — desde la terminal:

```bash
npm i -g vercel
```

```bash
vercel
```

```bash
vercel --prod
```

## Probar en local

```bash
python3 -m http.server 4321
```

Después abrí http://localhost:4321 en el navegador.

## Editar el contenido

Los textos, precios, fotos y preguntas frecuentes viven en el bloque
`<script type="text/x-dc">` al final de `index.html` (constantes `SERVICE_SLOTS`,
`PRICE_GROUPS`, `GALLERY`, `FAQS`, `LEGAL`). Para un cambio puntual se puede editar
`index.html` directamente.

Si en cambio editás el archivo original `source/reychell-lash-v2.dc.html`, regenerá
la página con:

```bash
python3 scripts/build-index.py source/reychell-lash-v2.dc.html index.html
```

El número de WhatsApp por defecto (`595984053323`) está en el mismo bloque, en
`renderVals()`.

## Fotos

Las fotos están en WebP, redimensionadas al tamaño máximo con el que el sitio
las llega a mostrar. En conjunto pesan 478 KB en la primera carga, frente a los
1,4 MB de los JPEG originales.

Si agregás fotos nuevas en JPEG, copialas a `assets/` siguiendo la convención de
nombres (`-sm` miniatura, `-md` tamaño normal, `-lg` para el visor ampliado) y
corré:

```bash
python3 scripts/optimize-images.py
```

El script convierte a WebP, achica lo que esté más grande de lo necesario,
regenera `assets/og-portada.jpg` (la vista previa al compartir el enlace, que se
deja en JPEG porque WhatsApp y Facebook no muestran WebP de forma confiable) y
borra de `assets/` todo lo que el sitio no usa. La lista de fotos que el sitio
usa está al principio del script, en `PHOTOS`.

## Notas técnicas

- React se sirve desde `vendor/`, no desde un CDN externo; el runtime lo detecta y
  no hace ninguna descarga de terceros.
- Lo único externo que carga la página son las tipografías de Google Fonts.
- El contenido editable se lee de Supabase con la anon key, que es pública por
  diseño: lo que protege de verdad son las políticas RLS del schema. Solo un
  correo que esté en `raychelllashweb.admins` puede escribir.
- El fondo de rayos del hero es SideRays, de [React Bits](https://reactbits.dev),
  portado a JavaScript plano en `vendor/side-rays.js`: los shaders van tal cual,
  solo cambia el envoltorio de React por `window.SideRays.montar(caja, opciones)`.
  Se monta únicamente en el inicio y en pantallas de escritorio, se apaga al
  cambiar de página o cuando la pestaña queda oculta, y si el navegador no tiene
  WebGL simplemente no aparece. Los valores están en el método `rayos()` del
  bloque de script de `index.html`.
- La foto de portada se precarga desde el `<head>`, así empieza a bajar sin
  esperar a que corra el JavaScript.
- Las etiquetas `<title>`, `description` y Open Graph están en el `<head>` estático,
  para que WhatsApp, Facebook y los buscadores las lean sin ejecutar JavaScript.
