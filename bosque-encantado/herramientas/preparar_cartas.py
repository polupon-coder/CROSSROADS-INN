"""Prepara las ilustraciones del juego, recortadas como en REGIUM.
Las originales salen de la plantilla Ludotipia póker 88x63 (página 83x108 mm): se corta por
la línea de corte (63x88 mm centrada), con esquinas redondeadas de 3 mm, se gira para que la
figura quede de pie (vienen tumbadas) y se guarda en WebP con transparencia.
Uso: python3 -I herramientas/preparar_cartas.py [--de-pie] salida_dir ancho nombre=imagen [nombre=imagen ...]
--de-pie: la imagen ya viene derecha (las cartas de la baraja) y no se gira."""
import sys, os
from PIL import Image, ImageDraw

PAGE = (83.0, 108.0); CUT = (63.0, 88.0); RADIUS_MM = 3.0

def recortar(path, girar=True):
    im = Image.open(path).convert("RGB"); w, h = im.size
    land = w > h
    pw, ph = (PAGE[1], PAGE[0]) if land else PAGE
    cw, ch = (CUT[1], CUT[0]) if land else CUT
    sx, sy = w / pw, h / ph
    if abs(sx - sy) / sx > 0.01:
        print(f"AVISO {path}: proporción {w}x{h} no coincide con la plantilla")
    l, t = round((pw - cw) / 2 * sx), round((ph - ch) / 2 * sy)
    card = im.crop((l, t, l + round(cw * sx), t + round(ch * sy)))
    if girar:
        card = card.rotate(90, expand=True)  # en sentido antihorario
    return card.convert("RGBA"), sx

def preparar(path, out, ancho, girar=True):
    card, sx = recortar(path, girar)
    escala = ancho / card.size[0]
    card = card.resize((ancho, round(card.size[1] * escala)), Image.LANCZOS)
    m = Image.new("L", card.size, 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, card.size[0] - 1, card.size[1] - 1), radius=round(RADIUS_MM * sx * escala), fill=255)
    card.putalpha(m)
    card.save(out, "WEBP", quality=86)
    print(out, card.size, os.path.getsize(out))

if __name__ == "__main__":
    args = sys.argv[1:]
    girar = "--de-pie" not in args
    args = [a for a in args if a != "--de-pie"]
    salida, ancho = args[0], int(args[1])
    os.makedirs(salida, exist_ok=True)
    for par in args[2:]:
        nombre, imagen = par.split("=", 1)
        preparar(imagen, os.path.join(salida, nombre + ".webp"), ancho, girar)
