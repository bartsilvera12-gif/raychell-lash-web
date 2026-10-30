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
scripts/        Script que regenera index.html desde la fuente
vercel.json     Configuración de Vercel (cabeceras, caché, fallback de rutas)
```

El sitio es una SPA con ruteo por hash (`#/servicios`, `#/galeria`, …), así que no
necesita rutas en el servidor.

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

## Notas técnicas

- React se sirve desde `vendor/`, no desde un CDN externo; el runtime lo detecta y
  no hace ninguna descarga de terceros.
- Lo único externo que carga la página son las tipografías de Google Fonts.
- Las etiquetas `<title>`, `description` y Open Graph están en el `<head>` estático,
  para que WhatsApp, Facebook y los buscadores las lean sin ejecutar JavaScript.
