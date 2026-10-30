#!/usr/bin/env python3
"""Optimiza las imagenes de assets/ para la web.

Convierte las fotos a WebP (bastante mas liviano que JPEG con la misma calidad
visual), achica las que estaban mas grandes de lo que el sitio llega a mostrar,
y deja aparte un JPEG 1200x630 para la vista previa al compartir el enlace
(WhatsApp y Facebook no muestran WebP de forma confiable).

Uso:  python3 scripts/optimize-images.py [carpeta_assets]
"""
import os
import sys
from PIL import Image

ASSETS = sys.argv[1] if len(sys.argv) > 1 else "assets"

# Las fotos que el sitio usa. El resto se borra.
PHOTOS = (
    ["portada-sm", "portada-lg"]
    + [f"foto-{i}-{s}" for i in range(1, 8) for s in ("md", "lg")]
    + [f"foto-{i}-sm" for i in (1, 4, 6, 7)]
    + [f"srv-{n}-md" for n in ("natural", "clasico", "hibrido", "volumen")]
)
KEEP_AS_IS = {"ojos-abiertos.svg", "ojos-cerrados-sm.png", "reychell-logo-circular.png"}

# Ancho/alto maximo segun para que se usa cada tamano.
MAX_DIM = {"sm": 240, "md": 760, "lg": 1200}
QUALITY = 76
LOGO_PX = 192          # se muestra a 76px como maximo; 192 cubre pantallas 2x
OG_SIZE = (1200, 630)  # vista previa al compartir


def resized(im, limit):
    if max(im.size) <= limit:
        return im
    r = limit / max(im.size)
    return im.resize((round(im.width * r), round(im.height * r)), Image.LANCZOS)


def main():
    saved_before = saved_after = 0

    for name in PHOTOS:
        src = os.path.join(ASSETS, name + ".jpg")
        if not os.path.exists(src):
            print("falta:", src)
            continue
        im = resized(Image.open(src).convert("RGB"), MAX_DIM[name.rsplit("-", 1)[1]])
        im.save(os.path.join(ASSETS, name + ".webp"), "WEBP", quality=QUALITY, method=6)
        saved_before += os.path.getsize(src)
        saved_after += os.path.getsize(os.path.join(ASSETS, name + ".webp"))

    # Vista previa para redes sociales, recortada al centro.
    portada = Image.open(os.path.join(ASSETS, "portada-lg.jpg")).convert("RGB")
    ratio = max(OG_SIZE[0] / portada.width, OG_SIZE[1] / portada.height)
    portada = portada.resize(
        (round(portada.width * ratio), round(portada.height * ratio)), Image.LANCZOS
    )
    left = (portada.width - OG_SIZE[0]) // 2
    top = (portada.height - OG_SIZE[1]) // 3  # un poco mas arriba que el centro
    portada.crop((left, top, left + OG_SIZE[0], top + OG_SIZE[1])).save(
        os.path.join(ASSETS, "og-portada.jpg"), "JPEG", quality=82,
        optimize=True, progressive=True,
    )

    # El logo venia a 679x759 pesando medio mega para mostrarse a 40px.
    logo_path = os.path.join(ASSETS, "reychell-logo-circular.png")
    logo = Image.open(logo_path).convert("RGBA")
    logo = logo.resize((LOGO_PX, round(LOGO_PX * logo.height / logo.width)), Image.LANCZOS)
    logo.quantize(colors=160, method=Image.FASTOCTREE).save(logo_path, "PNG", optimize=True)

    # El PNG de los ojos cerrados tiene pocos colores planos: se deja en PNG
    # (en WebP pesaba mas) pero con la paleta reducida.
    ojos_path = os.path.join(ASSETS, "ojos-cerrados-sm.png")
    ojos = Image.open(ojos_path).convert("RGBA")
    ojos.quantize(colors=128, method=Image.FASTOCTREE).save(ojos_path, "PNG", optimize=True)

    # Fuera todo lo que el sitio ya no pide.
    keep = {n + ".webp" for n in PHOTOS} | KEEP_AS_IS | {"og-portada.jpg"}
    for f in sorted(os.listdir(ASSETS)):
        if f not in keep:
            os.remove(os.path.join(ASSETS, f))
            print("borrado:", f)

    print(f"\nfotos: {saved_before/1024:.0f}K -> {saved_after/1024:.0f}K")
    total = sum(os.path.getsize(os.path.join(ASSETS, f)) for f in os.listdir(ASSETS))
    print(f"assets/ total: {total/1024/1024:.2f} MB")


if __name__ == "__main__":
    main()
