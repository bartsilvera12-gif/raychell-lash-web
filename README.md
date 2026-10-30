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
Dockerfile      Imagen con nginx para desplegar en Coolify
docker/         Configuración de nginx (caché, cabeceras, fallback de rutas)
vercel.json     Lo mismo, para cuando se despliega en Vercel
```

El sitio es una SPA con ruteo por hash (`#/servicios`, `#/galeria`, …), así que no
necesita rutas en el servidor.

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
- La foto de portada se precarga desde el `<head>`, así empieza a bajar sin
  esperar a que corra el JavaScript.
- Las etiquetas `<title>`, `description` y Open Graph están en el `<head>` estático,
  para que WhatsApp, Facebook y los buscadores las lean sin ejecutar JavaScript.
