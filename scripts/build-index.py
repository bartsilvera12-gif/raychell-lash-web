import re, sys, pathlib
src = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8")
out = pathlib.Path(sys.argv[2])

m = re.search(r"<helmet>(.*?)</helmet>\s*", src, re.S)
helmet = m.group(1).strip()
body = src[:m.start()] + src[m.end():]

# extract pieces from helmet
style = re.search(r"<style>.*?</style>", helmet, re.S).group(0)
links = "\n".join(re.findall(r"<link[^>]*>", helmet))
fonts = links

head_extra = f"""<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Reychell Lash | Belleza en cada mirada</title>
<meta name="description" content="Reychell Lash — belleza de la mirada y servicios de pestañas en San Lorenzo, Paraguay. Trabajos reales, atención al detalle y un resultado pensado para vos.">
<meta name="theme-color" content="#FFF8F3">
<meta name="robots" content="index, follow">
<meta property="og:site_name" content="Reychell Lash">
<meta property="og:title" content="Reychell Lash | Belleza en cada mirada">
<meta property="og:description" content="Un espacio dedicado a realzar tu mirada con atención al detalle.">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_PY">
<meta property="og:image" content="assets/portada-lg.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Reychell Lash | Belleza en cada mirada">
<meta name="twitter:description" content="Un espacio dedicado a realzar tu mirada con atención al detalle.">
<meta name="twitter:image" content="assets/portada-lg.jpg">
<link rel="icon" href="assets/reychell-logo-circular.png" type="image/png">
<link rel="apple-touch-icon" href="assets/reychell-logo-circular.png">
{fonts}
{style}
<!-- React 18.3.1 (UMD) servido localmente: el runtime lo detecta y no descarga nada de un CDN externo -->
<script src="vendor/react.production.min.js"></script>
<script src="vendor/react-dom.production.min.js"></script>
<script src="support.js"></script>"""

body = body.replace("""<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="./support.js"></script>""", head_extra, 1)

# noscript fallback right after <body>
noscript = """<noscript>
  <div style="font-family:system-ui,sans-serif;color:#483936;background:#FFF8F3;padding:40px 24px;text-align:center;line-height:1.7">
    <h1 style="font-weight:400">Reychell Lash</h1>
    <p>Para ver el sitio completo necesitás activar JavaScript.</p>
    <p>Escribinos por <a href="https://wa.me/595984053323">WhatsApp (0984 053 323)</a> o por
       <a href="https://www.instagram.com/reychell_lash/">Instagram</a>.</p>
  </div>
</noscript>
"""
body = body.replace("<html>", '<html lang="es">', 1)
body = body.replace("<body>\n", "<body>\n" + noscript, 1)
out.write_text(body, encoding="utf-8")
print("wrote", out, len(body), "bytes")
