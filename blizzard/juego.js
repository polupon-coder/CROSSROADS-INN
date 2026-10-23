// BLIZZARD · prototipo del capítulo 1 (La llanura nevada).
// Todo se genera por código con formas facetadas; three.js (r128) llega como global THREE.
// Unidades: 1 B (la altura de Blizzard) = 1,6 unidades del mundo.
(() => {
"use strict";

// ─── Ajustes de juego ──────────────────────────────────────────────────────
const B = 1.6;
const GRAVEDAD = 22;
const V_SALTO = 8.9;          // salto normal: ≈ 1,1 B
const V_IMPULSO = 7.8;        // impulso de viento en el aire: ≈ +0,9 B
const V_ANDAR = 3.4, V_CORRER = 6.5, V_AGACHADO = 1.6;
const PASO = 0.8;             // escalones de hasta 0,5 B se suben sin saltar
const ANCHO_CAMINO = 13;      // a partir de aquí el viento frena

// Recorrido: el viento mantiene a Blizzard cerca de esta línea.
const CAMINO = [[0, 12], [0, -15], [-4, -42], [1, -70], [0, -100], [2, -125], [0, -150], [0, -180]];
const PLATAFORMA = { x: -4, z: -42, r: 5.4, alto: 0.7 };
const GRIETA = { z: -100, media: 3.3 };
const RELLANO = { z: -141, alto: 2.8 };
const FIN_Z = -166;

// ─── Utilidades ────────────────────────────────────────────────────────────
const rnd = (() => { let a = 20261023; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();
const lerp = THREE.MathUtils.lerp, clamp = THREE.MathUtils.clamp;
const suave = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
function lerpAngulo(a, b, t) { let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; return a + d * t; }

// Punto del recorrido más cercano: distancia lateral, normal hacia fuera y dirección de avance.
function enCamino(x, z) {
  let mejor = { d: Infinity };
  for (let i = 0; i < CAMINO.length - 1; i++) {
    const [ax, az] = CAMINO[i], [bx, bz] = CAMINO[i + 1];
    const vx = bx - ax, vz = bz - az, l2 = vx * vx + vz * vz;
    const t = clamp(((x - ax) * vx + (z - az) * vz) / l2, 0, 1);
    const px = ax + vx * t, pz = az + vz * t, dx = x - px, dz = z - pz, d = Math.hypot(dx, dz);
    if (d < mejor.d) { const l = Math.sqrt(l2); mejor = { d, nx: d ? dx / d : 0, nz: d ? dz / d : 0, fx: vx / l, fz: vz / l }; }
  }
  return mejor;
}

// x del recorrido a una z dada (el recorrido siempre avanza hacia z negativa).
function caminoX(z) {
  for (let i = 0; i < CAMINO.length - 1; i++) {
    const [ax, az] = CAMINO[i], [bx, bz] = CAMINO[i + 1];
    if (z <= az && z >= bz) return lerp(ax, bx, (z - az) / (bz - az));
  }
  return 0;
}

// ─── Terreno ───────────────────────────────────────────────────────────────
function alturaBase(x, z) {
  return 0.5 * Math.sin(x * 0.045 + 1.3) * Math.cos(z * 0.037) + 0.35 * Math.sin(x * 0.11 + z * 0.07) + 0.25 * Math.cos(z * 0.13 - x * 0.05);
}
const ALTURA_PLAT = alturaBase(PLATAFORMA.x, PLATAFORMA.z);
function alturaTerreno(x, z) {
  let h = alturaBase(x, z);
  const dp = Math.hypot(x - PLATAFORMA.x, z - PLATAFORMA.z);
  h = lerp(ALTURA_PLAT, h, suave(6, 10, dp));               // llano alrededor de la plataforma
  h += RELLANO.alto * suave(RELLANO.z + 0.4, RELLANO.z - 0.4, z);
  const lado = enCamino(x, z).d;
  h += Math.max(0, lado - 20) * 0.35;                         // laderas fuera del recorrido
  if (Math.abs(z - GRIETA.z) < GRIETA.media && Math.abs(x) < 90) h = -14;
  return h;
}

// ─── Escena ────────────────────────────────────────────────────────────────
const CIELO = new THREE.Color("#c9d8ee");
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.domElement.id = "lienzo";
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = CIELO;
scene.fog = new THREE.Fog(CIELO, 30, 650);
const camara = new THREE.PerspectiveCamera(55, 1, 0.1, 900);

scene.add(new THREE.HemisphereLight(0xe4ecff, 0x7f8fb4, 0.7));
const sol = new THREE.DirectionalLight(0xfff1de, 0.55);
sol.castShadow = true;
sol.shadow.mapSize.set(2048, 2048);
Object.assign(sol.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 120 });
sol.shadow.bias = -0.0008;
scene.add(sol, sol.target);

const plano = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.95, ...extra });

// Suelo nevado, con más detalle a lo largo del recorrido para que la grieta y el rellano tengan paredes netas.
{
  const geo = new THREE.PlaneGeometry(320, 330, 110, 330);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, 0, -85);
  const pos = geo.attributes.position, colores = [], nieve = new THREE.Color("#e9eef7"), sombra = new THREE.Color("#d3dcec"), pared = new THREE.Color("#7a89aa");
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), h = alturaTerreno(x, z);
    pos.setY(i, h);
    const c = h < -1 ? pared : nieve.clone().lerp(sombra, clamp(0.5 - alturaBase(x, z), 0, 1));
    colores.push(c.r, c.g, c.b);
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colores, 3));
  geo.computeVertexNormals();
  const suelo = new THREE.Mesh(geo, plano(0xffffff, { vertexColors: true }));
  suelo.receiveShadow = true;
  const lejos = new THREE.Mesh(new THREE.RingGeometry(150, 1400, 48, 1), plano("#eef2f9"));
  lejos.rotation.x = -Math.PI / 2;
  lejos.position.set(0, 0, -85);
  scene.add(suelo, lejos);
}

// La montaña del templo, visible desde el principio (lámina 34).
{
  const monte = new THREE.Mesh(new THREE.ConeGeometry(130, 210, 5, 1), plano("#e6ecf6"));
  monte.position.set(-30, 90, -470);
  monte.rotation.y = 0.4;
  const pico = new THREE.Mesh(new THREE.ConeGeometry(70, 150, 4, 1), plano("#d9e2f0"));
  pico.position.set(60, 60, -430);
  scene.add(monte, pico);
}

// ─── Kit de rocas (lámina 81) y ruinas (82) ────────────────────────────────
const colisiones = []; // { x, z, r, techo }

function roca(x, z, ancho, alto) {
  // Bloque facetado: un prisma de 5 a 7 caras con la base ancha y los vértices desplazados.
  const lados = 5 + Math.floor(rnd() * 3);
  const geo = new THREE.CylinderGeometry(0.55 + rnd() * 0.3, 1, 1, lados, 2).toNonIndexed();
  geo.translate(0, 0.5, 0);
  const p = geo.attributes.position, desv = new Map();
  for (let i = 0; i < p.count; i++) {
    const clave = `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`;
    if (!desv.has(clave)) desv.set(clave, [(rnd() - 0.5) * 0.3, (rnd() - 0.5) * 0.18, (rnd() - 0.5) * 0.3]);
    const [dx, dy, dz] = desv.get(clave);
    p.setXYZ(i, p.getX(i) + dx, Math.max(0, p.getY(i) + dy), p.getZ(i) + dz);
  }
  geo.computeVertexNormals();
  const n = geo.attributes.normal, colores = [], piedra = new THREE.Color("#7b8496"), nieve = new THREE.Color("#eef3fa");
  for (let i = 0; i < p.count; i += 3) {
    const arriba = (n.getY(i) + n.getY(i + 1) + n.getY(i + 2)) / 3 > 0.55;
    const c = arriba ? nieve : piedra.clone().offsetHSL(0, 0, (rnd() - 0.5) * 0.08);
    for (let k = 0; k < 3; k++) colores.push(c.r, c.g, c.b);
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colores, 3));
  const m = new THREE.Mesh(geo, plano(0xffffff, { vertexColors: true }));
  const y = alturaTerreno(x, z);
  m.scale.set(ancho, alto, ancho * (0.8 + rnd() * 0.4));
  m.rotation.y = rnd() * Math.PI * 2;
  m.position.set(x, y - 0.15, z);
  m.rotation.x = (rnd() - 0.5) * 0.12;
  m.castShadow = m.receiveShadow = true;
  scene.add(m);
  geo.computeBoundingBox();
  colisiones.push({ x, z, r: ancho * 0.85, techo: y - 0.15 + geo.boundingBox.max.y * alto * 0.95 });
}

function monolito(x, z, alto, giro) {
  const g = new THREE.Group();
  const cuerpo = new THREE.Mesh(new THREE.BoxGeometry(1.6, alto, 1.1), plano("#7c8494"));
  cuerpo.position.y = alto / 2;
  const tapa = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.2, 1.2), plano("#f4f7fc"));
  tapa.position.y = alto + 0.05;
  // Runa del rombo con línea horizontal (lámina 80), grabada en la cara frontal.
  const runa = new THREE.Group();
  const trazo = (largo, x0, y0, ang) => { const t = new THREE.Mesh(new THREE.PlaneGeometry(0.07, largo), new THREE.MeshBasicMaterial({ color: "#3d4352" })); t.position.set(x0, y0, 0); t.rotation.z = ang; runa.add(t); };
  const a = 0.42, h = 0.8, lado = Math.hypot(a, h), ang = Math.atan2(a, h);
  trazo(lado, -a / 2, h / 2, -ang); trazo(lado, a / 2, h / 2, ang); trazo(lado, -a / 2, -h / 2, ang); trazo(lado, a / 2, -h / 2, -ang);
  trazo(a * 2, 0, 0, Math.PI / 2);
  runa.position.set(0, alto * 0.6, 0.56);
  g.add(cuerpo, tapa, runa);
  g.position.set(x, alturaTerreno(x, z) - 0.2, z);
  g.rotation.y = giro;
  g.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
  scene.add(g);
  colisiones.push({ x, z, r: 1.1, techo: g.position.y + alto });
}

// Colocación: rocas pequeñas cerca del camino, medianas a los lados, agujas y peñascos en los bordes.
for (let i = 0; i < 110; i++) {
  // Capítulo 1: casi vacío al principio, más denso hacia el final.
  const z = 8 - Math.sqrt(rnd()) * 190, ladoSigno = rnd() < 0.5 ? -1 : 1;
  const tipo = rnd();
  let dist, ancho, alto;
  if (tipo < 0.35) { dist = 4 + rnd() * 9; ancho = 0.5 + rnd() * 0.5; alto = 0.35 + rnd() * 0.6; }        // ≤ 1 B
  else if (tipo < 0.65) { dist = 8 + rnd() * 10; ancho = 1.4 + rnd() * 1.2; alto = 1.6 + rnd() * 1.8; }   // 1–2 B
  else if (tipo < 0.85) { dist = 19 + rnd() * 10; ancho = 2 + rnd() * 2; alto = 4 + rnd() * 3; }          // 3–4 B
  else { dist = 24 + rnd() * 25; ancho = 3 + rnd() * 3; alto = 9 + rnd() * 9; }                           // > 5 B
  const x = caminoX(z) + ladoSigno * dist;
  if (Math.abs(z - GRIETA.z) < GRIETA.media + ancho + 1) continue;
  if (Math.hypot(x - PLATAFORMA.x, z - PLATAFORMA.z) < PLATAFORMA.r + ancho + 2) continue;
  if (Math.abs(z - RELLANO.z) < ancho + 1.5) continue;
  roca(x + (rnd() - 0.5) * 3, z, ancho, alto);
}
// Algunas rocas de 1 B en mitad del camino, para practicar el salto.
[[1.5, -22], [-2, -58], [2.5, -84], [-1, -118], [1, -132]].forEach(([x, z]) => roca(x, z, 0.9, 1.2));
// Monolitos tallados que anuncian el final del capítulo.
monolito(-7, -150, 7.5, 0.3); monolito(7.5, -156, 9, -0.25); monolito(-8, -168, 8, 0.15); monolito(8.5, -172, 6.5, -0.2);

// Anillo de piedra abierto por arriba (lámina 32): la meta del prototipo.
{
  const anillo = new THREE.Mesh(new THREE.TorusGeometry(5.5, 1, 5, 20, Math.PI * 2 * 0.86), plano("#8a93a5"));
  anillo.rotation.z = Math.PI / 2 + Math.PI * 0.07;
  anillo.position.set(0, alturaTerreno(0, -180) + 5.6, -180);
  anillo.castShadow = true;
  scene.add(anillo);
}

// ─── Plataforma arcana del capítulo 1 (lámina 89) ─────────────────────────
{
  const g = new THREE.Group(), piedra = plano("#767e8e"), losas = 10;
  for (let i = 0; i < losas; i++) {
    if (i === 3 || i === 4) continue; // tramo derrumbado
    const ancho = Math.PI * 2 / losas;
    const losa = new THREE.Mesh(new THREE.CylinderGeometry(PLATAFORMA.r, PLATAFORMA.r, PLATAFORMA.alto, 3, 1, false, i * ancho + 0.02, ancho - 0.04), piedra);
    losa.position.y = PLATAFORMA.alto / 2 + (rnd() - 0.5) * 0.05;
    g.add(losa);
  }
  // Losas caídas del tramo roto.
  for (let k = 0; k < 4; k++) {
    const a = 3.5 * Math.PI * 2 / losas + (rnd() - 0.5) * 0.6, d = PLATAFORMA.r * (0.6 + rnd() * 0.6);
    const caida = new THREE.Mesh(new THREE.BoxGeometry(1.6 + rnd(), 0.6, 1.2 + rnd() * 0.6), piedra);
    caida.position.set(Math.sin(a) * d, 0.2, Math.cos(a) * d);
    caida.rotation.set((rnd() - 0.5) * 0.6, rnd() * 3, (rnd() - 0.5) * 0.6);
    g.add(caida);
  }
  g.position.set(PLATAFORMA.x, ALTURA_PLAT - 0.05, PLATAFORMA.z);
  g.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
  scene.add(g);
  colisiones.push({ x: PLATAFORMA.x, z: PLATAFORMA.z, r: PLATAFORMA.r, techo: ALTURA_PLAT - 0.05 + PLATAFORMA.alto, plataforma: true });
}

// ─── Bastón (láminas 27 y 28) ──────────────────────────────────────────────
const madera = plano("#3b3633");
function crearBaston(etapa) {
  const g = new THREE.Group();
  const fuste = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.022, 1.95, 5), madera);
  fuste.position.y = 0.975;
  const arco = Math.PI * 2 * (0.12 + (etapa - 1) / 6 * 0.88);
  const remate = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.03, 4, 14, Math.min(arco, Math.PI * 2)), madera);
  remate.rotation.z = -Math.PI / 2 - arco / 2;
  remate.position.y = 1.95 + 0.11;
  g.add(fuste, remate);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}
const baston = crearBaston(1);
baston.position.set(PLATAFORMA.x, ALTURA_PLAT + PLATAFORMA.alto - 0.35, PLATAFORMA.z);
scene.add(baston);

// ─── Blizzard ──────────────────────────────────────────────────────────────
const oscuro = plano("#35312d"), tela = plano("#e2a514", { side: THREE.DoubleSide });
const blizzard = new THREE.Group(), cuerpo = new THREE.Group();
blizzard.add(cuerpo);
const piernas = [-1, 1].map(lado => {
  const pivote = new THREE.Group();
  pivote.position.set(lado * 0.12, 0.62, 0);
  const pierna = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.07, 0.56, 5), oscuro);
  pierna.position.y = -0.3;
  const bota = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.34, 4), oscuro);
  bota.rotation.x = Math.PI / 2;
  bota.position.set(0, -0.58, 0.1);
  pivote.add(pierna, bota);
  cuerpo.add(pivote);
  return pivote;
});
const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.25, 0.72, 6), oscuro);
torso.position.y = 0.98;
const capa = new THREE.Mesh(new THREE.ConeGeometry(0.62, 1.32, 9, 4, true, 0.38, Math.PI * 2 - 0.76), tela);
capa.position.y = 0.86;
const capaBase = Float32Array.from(capa.geometry.attributes.position.array);
const capucha = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.62, 6), tela);
capucha.position.set(0, 1.64, -0.03);
capucha.rotation.x = -0.22;
const hueco = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.14), new THREE.MeshBasicMaterial({ color: "#08080a" }));
hueco.rotation.z = Math.PI / 4;
hueco.scale.y = 1.5;
hueco.position.set(0, 1.55, 0.19);
const mano = new THREE.Group();
mano.position.set(0.4, 0.96, 0.14);
cuerpo.add(torso, capa, capucha, hueco, mano);
blizzard.traverse(o => { if (o.isMesh) o.castShadow = true; });
scene.add(blizzard);

// ─── Efectos: nieve que cae, espiral de viento, huellas ────────────────────
const copos = (() => {
  const n = 1600, pos = new Float32Array(n * 3);
  for (let i = 0; i < n * 3; i += 3) { pos[i] = (rnd() - 0.5) * 50; pos[i + 1] = rnd() * 22; pos[i + 2] = (rnd() - 0.5) * 50; }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const p = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.09, transparent: true, opacity: 0.85, depthWrite: false }));
  p.frustumCulled = false;
  scene.add(p);
  return p;
})();

const espiral = (() => {
  const n = 70, geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  const p = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.14, transparent: true, opacity: 0, depthWrite: false }));
  p.frustumCulled = false;
  scene.add(p);
  return p;
})();

const huellas = (() => {
  const forma = new THREE.Shape();
  forma.moveTo(0, -0.15);
  forma.quadraticCurveTo(0.07, -0.15, 0.06, -0.06);
  forma.quadraticCurveTo(0.03, -0.02, 0.055, 0.05);
  forma.quadraticCurveTo(0.05, 0.13, 0, 0.19);
  forma.quadraticCurveTo(-0.05, 0.13, -0.055, 0.05);
  forma.quadraticCurveTo(-0.03, -0.02, -0.06, -0.06);
  forma.quadraticCurveTo(-0.07, -0.15, 0, -0.15);
  const geo = new THREE.ShapeGeometry(forma), mat = new THREE.MeshBasicMaterial({ color: "#aebfdc", transparent: true, opacity: 0.75, depthWrite: false });
  const lista = [];
  for (let i = 0; i < 180; i++) { const m = new THREE.Mesh(geo, mat); m.visible = false; m.rotation.order = "YXZ"; scene.add(m); lista.push(m); }
  let siguiente = 0;
  return (x, z, rumbo) => {
    const m = lista[siguiente]; siguiente = (siguiente + 1) % lista.length;
    m.position.set(x, alturaTerreno(x, z) + 0.03, z);
    m.rotation.set(-Math.PI / 2, rumbo, Math.PI);
    m.visible = true;
  };
})();

// ─── Interfaz ──────────────────────────────────────────────────────────────
const estilo = document.createElement("style");
estilo.textContent = `
  :root { --tinta: #1f2a3d; --tinta-suave: #4a5a75; --oro: #efb11c; --velo: rgba(225, 234, 247, .78); }
  html, body { height: 100%; margin: 0; overflow: hidden; background: #c9d8ee; }
  #lienzo { position: fixed; inset: 0; width: 100%; height: 100%; display: block; }
  .capa-ui { position: fixed; inset: 0; pointer-events: none; font-family: "Marcellus", Georgia, serif; color: var(--tinta); }
  #portada { position: fixed; inset: 0; display: grid; place-content: center; text-align: center; gap: 18px; background: var(--velo); pointer-events: auto; cursor: pointer; padding-inline: 16px; transition: opacity 1.2s ease; }
  #portada h1 { margin: 0; font-family: "Marcellus SC", Georgia, serif; font-weight: 400; font-size: clamp(48px, 12vw, 128px); letter-spacing: .32em; padding-left: .32em; line-height: 1; }
  #portada .sub { margin: 0; font-size: clamp(15px, 2.2vw, 20px); letter-spacing: .14em; color: var(--tinta-suave); text-transform: uppercase; }
  #portada .empezar { margin: 18px 0 0; font-size: 18px; }
  #portada .teclas { margin: 6px auto 0; display: grid; grid-template-columns: auto auto; gap: 6px 18px; text-align: left; font-family: system-ui, sans-serif; font-size: 14px; color: var(--tinta-suave); }
  #portada .teclas b { color: var(--tinta); font-weight: 600; text-align: right; }
  #portada .aviso { font-family: system-ui, sans-serif; font-size: 14px; color: var(--tinta-suave); max-width: 36ch; margin: 0 auto; }
  #rotulo { position: fixed; left: 50%; bottom: calc(48px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%); width: min(640px, calc(100% - 32px)); text-align: center; font-size: clamp(17px, 2.4vw, 22px); text-shadow: 0 0 12px rgba(255,255,255,.9); opacity: 0; transition: opacity .9s ease; }
  #ayuda { position: fixed; right: max(16px, env(safe-area-inset-right, 0px)); top: calc(14px + env(safe-area-inset-top, 0px)); font-family: system-ui, sans-serif; font-size: 12px; color: var(--tinta-suave); opacity: .8; }
  @media (prefers-reduced-motion: reduce) { #portada, #rotulo { transition: none; } }
`;
document.head.appendChild(estilo);
const fuentes = document.createElement("link");
fuentes.rel = "stylesheet";
fuentes.href = "https://fonts.googleapis.com/css2?family=Marcellus&family=Marcellus+SC&display=swap";
document.head.appendChild(fuentes);

const ui = document.createElement("div");
ui.className = "capa-ui";
const tactil = matchMedia("(pointer: coarse)").matches && !matchMedia("(pointer: fine)").matches;
ui.innerHTML = `
  <div id="portada" role="button" tabindex="0" aria-label="Empezar">
    <h1>BLIZZARD</h1>
    <p class="sub">Prototipo · Capítulo 1 · La llanura nevada</p>
    ${tactil ? `<p class="aviso">Este prototipo se juega con teclado, en un ordenador.</p>` : `
    <p class="empezar">Pulsa cualquier tecla para empezar</p>
    <div class="teclas">
      <b>W A S D / flechas</b><span>caminar</span>
      <b>Mayúsculas</b><span>correr</span>
      <b>Espacio</b><span>saltar</span>
      <b>C</b><span>agacharse</span>
      <b>E</b><span>viento (cuando tengas el bastón)</span>
    </div>`}
  </div>
  <div id="rotulo" aria-live="polite"></div>
  <div id="ayuda" hidden>WASD mover · Mayús correr · Espacio saltar · C agacharse · E viento</div>`;
document.body.appendChild(ui);
const portada = ui.querySelector("#portada"), rotulo = ui.querySelector("#rotulo"), ayuda = ui.querySelector("#ayuda");
let rotuloHasta = 0;
function rotular(texto, segundos = 5) { rotulo.textContent = texto; rotulo.style.opacity = 1; rotuloHasta = reloj + segundos; }

// ─── Controles ─────────────────────────────────────────────────────────────
const teclas = new Set();
const pulsadas = new Set(); // solo el fotograma en que se pulsan
let estado = "portada";
function empezar() {
  if (estado !== "portada" || tactil) return;
  estado = "juego";
  portada.style.opacity = 0;
  setTimeout(() => portada.remove(), 1300);
  ayuda.hidden = false;
  rotular("La llanura nevada", 4);
  setTimeout(() => !tieneBaston && rotular("Algo se alza a lo lejos, sobre la nieve.", 5), 5000);
}
addEventListener("keydown", e => {
  if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
  if (estado === "portada") { empezar(); return; }
  if (!teclas.has(e.code)) pulsadas.add(e.code);
  teclas.add(e.code);
});
addEventListener("keyup", e => teclas.delete(e.code));
addEventListener("blur", () => teclas.clear());
portada.addEventListener("click", empezar);
const tecla = (...c) => c.some(k => teclas.has(k));
const pulsada = (...c) => c.some(k => pulsadas.has(k));

// ─── Estado de Blizzard ────────────────────────────────────────────────────
const pos = new THREE.Vector3(0, alturaTerreno(0, 8), 8);
const vel = new THREE.Vector3();
let rumbo = Math.PI, enSuelo = true, coyote = 0, impulsoUsado = false, tieneBaston = false;
let fase = 0, ultimoPaso = 0, rachaViento = 0, efectoEspiral = 0;
let seguro = pos.clone(), seguroReloj = 0;
let rescate = null, arrodillado = 0, reloj = 0, avisoGrieta = false, avisoRellano = false, finMostrado = false;
let yawCamara = Math.PI;

function sueloEn(x, z, pies) {
  let h = alturaTerreno(x, z), sobre = null;
  for (const c of colisiones) {
    if (c.techo <= pies + PASO && c.techo > h && Math.hypot(x - c.x, z - c.z) < c.r * (c.plataforma ? 1 : 0.8)) { h = c.techo; sobre = c; }
  }
  return { h, sobre };
}

function moverHorizontal(dx, dz) {
  const prueba = (x, z) => alturaTerreno(x, z) <= pos.y + PASO;
  if (prueba(pos.x + dx, pos.z + dz)) { pos.x += dx; pos.z += dz; }
  else if (prueba(pos.x + dx, pos.z)) { pos.x += dx; vel.z = 0; }
  else if (prueba(pos.x, pos.z + dz)) { pos.z += dz; vel.x = 0; }
  else { vel.x = vel.z = 0; }
  for (const c of colisiones) {
    const ex = pos.x - c.x, ez = pos.z - c.z, d = Math.hypot(ex, ez), r = c.r + 0.25;
    if (d < r && pos.y < c.techo - PASO && d > 0.001) { pos.x = c.x + ex / d * r; pos.z = c.z + ez / d * r; }
  }
}

function empezarRescate() {
  rescate = { t: 0, desde: pos.clone(), hacia: seguro.clone() };
  vel.set(0, 0, 0);
  efectoEspiral = 2;
  if (!tieneBaston) rotular("El viento te recoge. Necesitarás algo más para cruzar.", 5);
}

function actualizar(dt) {
  reloj += dt;
  const c = enCamino(pos.x, pos.z);

  // Cámara dirigida: sigue la dirección del recorrido, no la del jugador.
  const yawObjetivo = Math.atan2(-c.fx, -c.fz);
  yawCamara = lerpAngulo(yawCamara, yawObjetivo, 1 - Math.exp(-dt * 1.2));
  const adelante = new THREE.Vector3(-Math.sin(yawCamara), 0, -Math.cos(yawCamara));
  const derecha = new THREE.Vector3(-adelante.z, 0, adelante.x);

  if (rescate) {
    // El viento lo lleva en una curva suave hasta el último punto seguro (lámina 29).
    rescate.t = Math.min(1, rescate.t + dt / 1.9);
    const t = suave(0, 1, rescate.t), alto = Math.max(rescate.desde.y, rescate.hacia.y) + 5;
    const a = rescate.desde, b = rescate.hacia;
    pos.set(lerp(a.x, b.x, t), (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * alto + t * t * b.y, lerp(a.z, b.z, t));
    efectoEspiral = Math.max(efectoEspiral, 0.5);
    if (rescate.t >= 1) { rescate = null; enSuelo = true; }
  } else if (estado === "arrodillado") {
    arrodillado += dt;
    if (arrodillado > 0.9 && baston.parent !== mano) {
      mano.add(baston);
      baston.position.set(0, -0.85, 0);
      baston.rotation.set(0.12, 0, -0.08);
      efectoEspiral = 1.2;
    }
    if (arrodillado > 1.8) {
      estado = "juego"; tieneBaston = true;
      rotular("Has encontrado el bastón. En el aire, pulsa E: el viento te impulsa hacia arriba.", 7);
    }
  } else if (estado === "juego" || estado === "fin") {
    // Movimiento relativo a la cámara.
    const ix = (tecla("KeyD", "ArrowRight") ? 1 : 0) - (tecla("KeyA", "ArrowLeft") ? 1 : 0);
    const iz = (tecla("KeyW", "ArrowUp") ? 1 : 0) - (tecla("KeyS", "ArrowDown") ? 1 : 0);
    const deseo = new THREE.Vector3().addScaledVector(adelante, iz).addScaledVector(derecha, ix);
    if (deseo.lengthSq() > 1) deseo.normalize();
    const agachado = tecla("KeyC", "ControlLeft") && enSuelo;
    const rapidez = agachado ? V_AGACHADO : tecla("ShiftLeft", "ShiftRight") ? V_CORRER : V_ANDAR;
    deseo.multiplyScalar(rapidez);

    // Límite del mundo: un viento de cara que crece poco a poco y devuelve al camino.
    rachaViento = clamp((c.d - ANCHO_CAMINO) / 5, 0, 1);
    if (rachaViento > 0) {
      const haciaFuera = deseo.x * c.nx + deseo.z * c.nz;
      if (haciaFuera > 0) { deseo.x -= c.nx * haciaFuera * rachaViento; deseo.z -= c.nz * haciaFuera * rachaViento; }
      deseo.x -= c.nx * rachaViento * 2.2; deseo.z -= c.nz * rachaViento * 2.2;
    }

    const agarre = enSuelo ? 12 : 2.5;
    vel.x = lerp(vel.x, deseo.x, 1 - Math.exp(-dt * agarre));
    vel.z = lerp(vel.z, deseo.z, 1 - Math.exp(-dt * agarre));

    coyote = enSuelo ? 0.12 : Math.max(0, coyote - dt);
    if (pulsada("Space") && coyote > 0 && !agachado) { vel.y = V_SALTO; enSuelo = false; coyote = 0; impulsoUsado = false; }
    if (pulsada("KeyE", "KeyJ") && !enSuelo && tieneBaston && !impulsoUsado) {
      vel.y = Math.max(vel.y, 0) * 0.5 + V_IMPULSO; impulsoUsado = true; efectoEspiral = 0.8;
    }

    moverHorizontal(vel.x * dt, vel.z * dt);
    vel.y -= GRAVEDAD * dt;
    pos.y += vel.y * dt;
    const s = sueloEn(pos.x, pos.z, pos.y);
    if (pos.y <= s.h) { pos.y = s.h; vel.y = 0; enSuelo = true; }
    else enSuelo = pos.y - s.h < 0.05 && vel.y <= 0;

    if (pos.y < -3) empezarRescate();

    // Punto seguro para el rescate.
    seguroReloj += dt;
    if (enSuelo && seguroReloj > 0.3 && Math.abs(pos.z - GRIETA.z) > GRIETA.media + 3 && c.d < ANCHO_CAMINO) { seguro.copy(pos); seguroReloj = 0; }

    // Recoger el bastón.
    if (!tieneBaston && s.sobre && s.sobre.plataforma && Math.hypot(pos.x - PLATAFORMA.x, pos.z - PLATAFORMA.z) < 1.1) {
      estado = "arrodillado"; arrodillado = 0; vel.set(0, 0, 0);
      rumbo = Math.atan2(PLATAFORMA.x - pos.x, PLATAFORMA.z - pos.z) || rumbo;
    }

    if (!avisoGrieta && pos.z < GRIETA.z + 14 && tieneBaston) { avisoGrieta = true; rotular("Una grieta corta el paso. Corre, salta y usa el viento.", 6); }
    if (!avisoRellano && pos.z < RELLANO.z + 8 && pos.z > RELLANO.z) { avisoRellano = true; rotular("Demasiado alto para un salto normal.", 4); }
    if (!finMostrado && pos.z < FIN_Z && pos.y > RELLANO.alto - 1) { finMostrado = true; estado = "fin"; rotular("Fin del prototipo. El camino sigue hacia la montaña.", 9); }

    // Orientación y huellas.
    const v = Math.hypot(vel.x, vel.z);
    if (v > 0.3) rumbo = lerpAngulo(rumbo, Math.atan2(vel.x, vel.z), 1 - Math.exp(-dt * 10));
    fase += v * dt * 2.4;
    if (enSuelo && v > 0.4 && !s.sobre && Math.floor(fase / Math.PI) !== ultimoPaso) {
      ultimoPaso = Math.floor(fase / Math.PI);
      const lado = ultimoPaso % 2 ? 0.13 : -0.13;
      huellas(pos.x + Math.cos(rumbo) * lado, pos.z - Math.sin(rumbo) * lado, rumbo);
    }
    animar(dt, v, agachado);
  }
  pulsadas.clear();

  blizzard.position.copy(pos);
  blizzard.rotation.y = rumbo;
  if (rescate || estado === "arrodillado") animar(dt, 0, false);

  // Cámara: detrás y algo por encima, mirando un poco por delante del personaje.
  const ojo = new THREE.Vector3().copy(pos).addScaledVector(adelante, -7.2).add(new THREE.Vector3(0, 3.6, 0));
  camara.position.lerp(ojo, 1 - Math.exp(-dt * 4));
  const mira = new THREE.Vector3().copy(pos).addScaledVector(adelante, 4).add(new THREE.Vector3(0, 1.1, 0));
  camara.lookAt(mira);

  sol.position.set(pos.x - 18, pos.y + 30, pos.z + 12);
  sol.target.position.copy(pos);

  efectos(dt, adelante);
  if (reloj > rotuloHasta) rotulo.style.opacity = 0;
}

// Postura del cuerpo y capa que ondea con la velocidad y el viento.
function animar(dt, v, agachado) {
  const paso = Math.sin(fase) * 0.55 * clamp(v / 3, 0, 1);
  let alturaCuerpo = 0, inclinacion = 0, piernaA = paso, piernaB = -paso;
  if (!enSuelo && !rescate) { piernaA = -0.7; piernaB = 0.3; }
  if (agachado) { alturaCuerpo = -0.28; piernaA = piernaB = -0.9; inclinacion = 0.25; }
  if (estado === "arrodillado") { alturaCuerpo = -0.42; piernaA = -1.4; piernaB = 0.2; inclinacion = 0.35; }
  if (rescate) { piernaA = piernaB = 0.15; inclinacion = -0.1; }
  cuerpo.position.y = lerp(cuerpo.position.y, alturaCuerpo, 1 - Math.exp(-dt * 12));
  cuerpo.rotation.x = lerp(cuerpo.rotation.x, inclinacion + clamp(v / V_CORRER, 0, 1) * 0.12, 1 - Math.exp(-dt * 8));
  piernas[0].rotation.x = lerp(piernas[0].rotation.x, piernaA, 1 - Math.exp(-dt * 14));
  piernas[1].rotation.x = lerp(piernas[1].rotation.x, piernaB, 1 - Math.exp(-dt * 14));

  const p = capa.geometry.attributes.position, alto = 1.32;
  const empuje = clamp(v / V_CORRER, 0, 1) * 0.45 + rachaViento * 0.35 + (enSuelo ? 0 : 0.2) + (rescate ? 0.3 : 0);
  for (let i = 0; i < p.count; i++) {
    const bx = capaBase[i * 3], by = capaBase[i * 3 + 1], bz = capaBase[i * 3 + 2];
    const t = clamp((alto / 2 - by) / alto, 0, 1), t2 = t * t;
    const ola = Math.sin(reloj * 7 + Math.atan2(bx, bz) * 2) * 0.05 * t * (0.4 + empuje);
    p.setXYZ(i, bx * (1 + t2 * empuje * 0.3), by + t2 * empuje * 0.35, bz - t2 * empuje * 0.75 + ola);
  }
  p.needsUpdate = true;
  capa.geometry.computeVertexNormals();
}

function efectos(dt, adelante) {
  // Copos alrededor de la cámara; el viento de cara los empuja hacia Blizzard.
  const c = enCamino(pos.x, pos.z), arr = copos.geometry.attributes.position.array;
  const vx = -0.6 - c.nx * rachaViento * 9, vz = 0.3 - c.nz * rachaViento * 9;
  for (let i = 0; i < arr.length; i += 3) {
    arr[i] += vx * dt; arr[i + 1] -= 1.1 * dt; arr[i + 2] += vz * dt;
    if (arr[i + 1] < 0) arr[i + 1] += 22;
    if (arr[i] < -25) arr[i] += 50; else if (arr[i] > 25) arr[i] -= 50;
    if (arr[i + 2] < -25) arr[i + 2] += 50; else if (arr[i + 2] > 25) arr[i + 2] -= 50;
  }
  copos.geometry.attributes.position.needsUpdate = true;
  copos.position.set(camara.position.x, pos.y - 4, camara.position.z);

  // Espiral blanca del viento mágico (impulso, rescate, límite del mundo).
  efectoEspiral = Math.max(0, efectoEspiral - dt);
  const intensidad = Math.max(clamp(efectoEspiral, 0, 1), rachaViento * 0.8);
  espiral.material.opacity = intensidad * 0.9;
  const e = espiral.geometry.attributes.position.array, n = e.length / 3;
  const centro = rachaViento > efectoEspiral ? new THREE.Vector3(pos.x + c.nx * 1.2, pos.y, pos.z + c.nz * 1.2) : pos;
  for (let i = 0; i < n; i++) {
    const k = i / n, ang = reloj * 9 + k * Math.PI * 6, r = 0.55 + k * 0.35;
    e[i * 3] = centro.x + Math.cos(ang) * r; e[i * 3 + 1] = centro.y + k * 2.1 - 0.1; e[i * 3 + 2] = centro.z + Math.sin(ang) * r;
  }
  espiral.geometry.attributes.position.needsUpdate = true;
}

// ─── Bucle ─────────────────────────────────────────────────────────────────
function ajustar() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camara.aspect = w / h;
  camara.updateProjectionMatrix();
}
addEventListener("resize", ajustar);
ajustar();
camara.position.set(0, pos.y + 3.6, pos.z + 7.2);

let anterior = performance.now();
function bucle(ahora) {
  const dt = Math.min(0.05, (ahora - anterior) / 1000);
  anterior = ahora;
  actualizar(dt);
  renderer.render(scene, camara);
  requestAnimationFrame(bucle);
}
requestAnimationFrame(bucle);
// Gancho de pruebas: simula segundos de juego con teclas mantenidas, sin esperar al render.
window.__blizzard = {
  pos, get estado() { return estado; }, get tieneBaston() { return tieneBaston; }, get rescatando() { return !!rescate; },
  simular(segundos, mantenidas = [], alInicio = []) {
    mantenidas.forEach(k => teclas.add(k)); alInicio.forEach(k => pulsadas.add(k));
    for (let t = 0; t < segundos; t += 1 / 60) {
      if (t > 0.3) alInicio.forEach(k => { if (!pulsadas.has(k) && Math.abs(vel.y) < 0.6 && !enSuelo) pulsadas.add(k); });
      actualizar(1 / 60);
    }
    mantenidas.forEach(k => teclas.delete(k));
  },
};
})();
