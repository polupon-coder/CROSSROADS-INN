// BLIZZARD · capa y capucha generadas por código (láminas 7, 11, 75 y 119).
// Se ajustan al cuerpo de Tripo, que mide 0,98 de alto con los pies en y = 0.
// Uso: const capa = BlizzardCapa.crear(); figura.add(capa.grupo);
//      cada fotograma: capa.actualizar(reloj, empuje)   (empuje 0 = quieta, 1 = viento fuerte)
(() => {
"use strict";
const AMARILLO = "#e8ae12", NEGRO = "#09090b";
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;

// Perfil de la capa de arriba (cuello) a abajo: altura, radio y media abertura delantera.
const PERFIL = [
  { y: 0.670, r: 0.070, abre: 0.25 },
  { y: 0.645, r: 0.135, abre: 0.30 },
  { y: 0.605, r: 0.175, abre: 0.36 },
  { y: 0.540, r: 0.210, abre: 0.46 },
  { y: 0.350, r: 0.250, abre: 0.62 },
  { y: 0.180, r: 0.290, abre: 0.78 },
  { y: 0.050, r: 0.320, abre: 0.86 },
];
const SEGMENTOS = 18;   // pliegues alrededor
const FONDO = 0.72;     // la capa es algo más estrecha de delante a atrás que de lado a lado

function color(hex, lineal) { const c = new THREE.Color(hex); return lineal ? c.convertSRGBToLinear() : c; }

function crearCapa(lineal) {
  const filas = PERFIL.length, cols = SEGMENTOS + 1;
  const base = new Float32Array(filas * cols * 3);
  for (let f = 0; f < filas; f++) {
    const p = PERFIL[f], t = f / (filas - 1);
    for (let c = 0; c < cols; c++) {
      const u = c / SEGMENTOS;
      // Ángulo desde el frente (+z): de «abre» a 2π − «abre», pasando por la espalda (π).
      const ang = lerp(p.abre, Math.PI * 2 - p.abre, u);
      // Pliegues facetados: radios alternos, más marcados abajo; el pliegue central de la
      // espalda (lámina 11) hunde la tela en forma de V.
      const pliegue = (c % 2 ? 1 : -1) * 0.13 * Math.min(1, t * 1.6) * (1 + 0.6 * Math.max(0, -Math.cos(ang)));
      const espalda = Math.exp(-Math.pow((ang - Math.PI) / 0.22, 2)) * 0.14 * Math.min(1, t * 1.6);
      const r = p.r * (1 + pliegue - espalda);
      const i = (f * cols + c) * 3;
      base[i] = Math.sin(ang) * r;
      base[i + 1] = p.y;
      base[i + 2] = Math.cos(ang) * r * FONDO - 0.01;
    }
  }
  const indices = [];
  for (let f = 0; f < filas - 1; f++)
    for (let c = 0; c < SEGMENTOS; c++) {
      const a = f * cols + c, b = a + 1, d = a + cols, e = d + 1;
      indices.push(a, d, b, b, d, e);
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(base.slice(), 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  const malla = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: color(AMARILLO, lineal), flatShading: true, roughness: 0.9, side: THREE.DoubleSide }));
  return { malla, base, filas, cols };
}

function crearCapucha(lineal) {
  const g = new THREE.Group(), tela = new THREE.MeshStandardMaterial({ color: color(AMARILLO, lineal), flatShading: true, roughness: 0.9, side: THREE.DoubleSide });
  // Cono de 7 caras con la punta algo hacia atrás (lámina 75).
  const cono = new THREE.ConeGeometry(0.125, 0.27, 7, 3, true);
  const p = cono.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i), t = (y + 0.135) / 0.27;              // 0 abajo, 1 punta
    p.setZ(i, p.getZ(i) * 1.15 - t * t * 0.07);
    p.setX(i, p.getX(i) * (1 - t * 0.1));
    if (p.getZ(i) < 0) p.setZ(i, p.getZ(i) * (1 + 0.22 * (1 - t) * (1 - t)));   // volumen de la nuca
  }
  cono.computeVertexNormals();
  const capucha = new THREE.Mesh(cono, tela);
  capucha.position.set(0, 0.78, -0.015);
  // Hueco de la cara: rombo negro hundido en la parte delantera.
  const rombo = new THREE.Shape();
  rombo.moveTo(0, 0.075); rombo.lineTo(0.042, 0.0); rombo.lineTo(0, -0.06); rombo.lineTo(-0.042, 0.0); rombo.lineTo(0, 0.075);
  const hueco = new THREE.Mesh(new THREE.ShapeGeometry(rombo), new THREE.MeshBasicMaterial({ color: NEGRO, side: THREE.DoubleSide }));
  hueco.position.set(0, 0.765, 0.058);
  hueco.rotation.x = -0.45;
  // Cuello: pliegues en abanico desde el broche (láminas 75 y 134).
  const cuello = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.135, 0.05, 9, 1, true), tela);
  cuello.position.set(0, 0.665, -0.01);
  cuello.scale.z = 0.85;
  const broche = new THREE.Mesh(new THREE.IcosahedronGeometry(0.014, 0), new THREE.MeshStandardMaterial({ color: color("#b8870c", lineal), flatShading: true }));
  broche.position.set(0, 0.655, 0.105);
  g.add(capucha, hueco, cuello, broche);
  return g;
}

// lineal: true si el renderer usa salida sRGB (como con los modelos GLB).
function crear({ lineal = false } = {}) {
  const grupo = new THREE.Group();
  const capa = crearCapa(lineal), capucha = crearCapucha(lineal);
  grupo.add(capa.malla, capucha);
  grupo.traverse(o => { if (o.isMesh) o.castShadow = true; });
  const pos = capa.malla.geometry.attributes.position;
  // La capa se echa hacia atrás y se abre con la velocidad o el viento; la parte baja ondea.
  function actualizar(reloj, empuje = 0) {
    const { base, filas, cols } = capa;
    for (let f = 0; f < filas; f++) {
      const t = f / (filas - 1), t2 = t * t;
      for (let c = 0; c < cols; c++) {
        const i = (f * cols + c) * 3, x = base[i], y = base[i + 1], z = base[i + 2];
        const ola = Math.sin(reloj * 6 + c * 0.9) * 0.012 * t * (0.3 + empuje);
        pos.setXYZ(f * cols + c, x * (1 + t2 * empuje * 0.25), y + t2 * empuje * 0.12, z - t2 * empuje * 0.32 + ola);
      }
    }
    pos.needsUpdate = true;
    capa.malla.geometry.computeVertexNormals();
  }
  actualizar(0, 0);
  return { grupo, actualizar };
}

window.BlizzardCapa = { crear };
})();
