// Editor de Blizzard: coloca piezas, nieblas y notas sobre el mundo del juego. Lo colocado se guarda en la
// base de datos del artefacto; Claude lo lee y lo pasa al juego.
(async () => {
  const $ = id => document.getElementById(id);
  const estado = (t, mal) => { $("estado").textContent = t; $("estado").classList.toggle("mal", !!mal); };
  const aviso = t => { const a = $("aviso"); a.textContent = t || ""; a.hidden = !t; };
  while (!window.__blizzard || !window.__blizzard.ed) await new Promise(r => setTimeout(r, 200));
  const E = window.__blizzard.ed, cam = E.camara, dom = E.renderer.domElement, scene = E.scene;

  // ── Vista ─────────────────────────────────────────────────────────────
  const orbit = new THREE.OrbitControls(cam, dom);
  orbit.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.PAN, RIGHT: THREE.MOUSE.PAN }; orbit.panSpeed = 2; orbit.zoomSpeed = 1.4;   // (la rueda pulsada arrastra la vista)
  // Rapidez: se dibuja solo cuando algo cambia (el mundo está quieto en el editor) y, mientras la vista se
  // mueve, a menos resolución; al pararse, nítido otra vez.
  const prAlta = Math.min(2, window.devicePixelRatio || 1), prBaja = Math.min(1, prAlta) * 0.7;
  let sucio = 2, prAhora = 0, quieto = 0;
  const resolucion = pr => { if (pr === prAhora) return; prAhora = pr; E.renderer.setPixelRatio(pr); E.renderer.setSize(innerWidth, innerHeight, false); };
  const marcar = () => { sucio = 2; };
  window.__edRender = () => { if (sucio <= 0) return false; sucio--; return true; };
  resolucion(prAlta);
  const moviendo = () => { marcar(); resolucion(prBaja); clearTimeout(quieto); quieto = setTimeout(() => { resolucion(prAlta); marcar(); }, 220); };
  for (const ev of ["pointermove", "pointerdown", "pointerup", "wheel", "keydown", "keyup", "resize"]) addEventListener(ev, marcar, { passive: true });
  setInterval(marcar, 500);   // (por si algo cambia sin aviso: la carga de piezas, las miniaturas)
  orbit.addEventListener("change", moviendo);
  orbit.enableDamping = true; orbit.dampingFactor = 0.25; orbit.maxPolarAngle = Math.PI * 0.495;
  const irA = z => { const x = E.caminoX(z), y = E.alturaTerreno(x, z); orbit.target.set(x, y + 1, z); cam.position.set(x + 10, y + 12, z + 18); orbit.update(); };
  // De entrada, el mundo entero en planta y sin niebla.
  cam.far = 6000; cam.updateProjectionMatrix();
  const planta = () => { const z = -760, x = E.caminoX(z), y = E.alturaTerreno(x, z); orbit.target.set(x, y, z); cam.position.set(x, y + 1250, z + 0.01); orbit.update(); };
  let conNiebla = false;
  const ponerNiebla = on => { conNiebla = on; $("niebla").textContent = "Niebla: " + (on ? "sí" : "no");
    if (scene.fog) { scene.fog.near = on ? 2 : 1e5; scene.fog.far = on ? 70 : 2e5; }
    (E.nieblaLago?.capas || []).forEach(m => m.visible = on); };
  // Bloques por santuario: solo se ve (y se dibuja) el tramo elegido.
  const S = E.santuarios, bloques = [["Todo", 60, -2040], ["1 · Bastón", 40, (S[0] + S[1]) / 2], ["2 · Rocas", (S[0] + S[1]) / 2, (S[1] + S[2]) / 2], ["3 · Puerta", (S[1] + S[2]) / 2, (S[2] + S[3]) / 2],
    ["4 · Giro", (S[2] + S[3]) / 2, (S[3] + S[4]) / 2], ["5 · Revelación", (S[3] + S[4]) / 2, (S[4] + S[5]) / 2], ["6 · Onda", (S[4] + S[5]) / 2, S[5] - 20], ["Pilares y lago", S[5] - 20, E.hielo.hasta], ["Cueva", E.hielo.hasta, E.cuevaZ - 40], ["Dunas tras la cueva", E.cuevaZ - 40, -2040]];
  const cajas = new Map(), _b = new THREE.Box3();
  const cajaDe = o => { if (!cajas.has(o)) { _b.setFromObject(o); cajas.set(o, _b.isEmpty() ? null : [_b.min.z, _b.max.z]); } return cajas.get(o); };
  let bloque = bloques[0];
  const verBloque = b => { bloque = b; const [, desde, hasta] = b, propios = new Set([...E.escenaEd.values()].map(v => v.g));
    for (const o of scene.children) { if (o === tcM || o === tcR || propios.has(o) || o.isLight || o.isCamera) continue; const c = cajaDe(o); if (!c) continue; if (o.userData.visEd === undefined) o.userData.visEd = o.visible; o.visible = o.userData.visEd && (b === bloques[0] || (c[1] > hasta - 15 && c[0] < desde + 15)); }   /* (lo que el juego tiene oculto sigue oculto) */
    if (!conNiebla) (E.nieblaLago?.capas || []).forEach(m => m.visible = false);
    const zc = (desde + hasta) / 2, x = E.caminoX(zc), y = E.alturaTerreno(x, zc), alto = Math.max(60, (desde - hasta) * 0.95);
    orbit.target.set(x, y, zc); cam.position.set(x, y + alto, zc + 0.01); orbit.update();
    document.querySelectorAll("#pestanas button").forEach(t => t.classList.toggle("activo", t.textContent === b[0])); };
  bloques.forEach(b => { const t = document.createElement("button"); t.textContent = b[0]; t.setAttribute("role", "tab"); t.onclick = () => verBloque(b); $("pestanas").appendChild(t); });
  ponerNiebla(false); planta();
  $("planta").onclick = () => verBloque(bloque); $("niebla").onclick = () => ponerNiebla(!conNiebla);
  const teclas = new Set();
  addEventListener("keydown", e => { if (e.target.closest("input, textarea, select")) return; teclas.add(e.key); atajo(e); });
  addEventListener("keyup", e => teclas.delete(e.key));
  const fwd = new THREE.Vector3(), lado = new THREE.Vector3();
  (function bucle() {
    const v = Math.max(0.6, cam.position.distanceTo(orbit.target) * 0.025);   // flechas: desplazan la vista por el recorrido (más deprisa cuanto más lejos)
    cam.getWorldDirection(fwd); fwd.y = 0; fwd.normalize(); lado.crossVectors(fwd, new THREE.Vector3(0, 1, 0));
    const d = new THREE.Vector3();
    if (teclas.has("ArrowUp")) d.add(fwd); if (teclas.has("ArrowDown")) d.sub(fwd); if (teclas.has("ArrowRight")) d.add(lado); if (teclas.has("ArrowLeft")) d.sub(lado);
    if (d.lengthSq()) { d.normalize().multiplyScalar(v); orbit.target.add(d); cam.position.add(d); }
    orbit.update(); requestAnimationFrame(bucle);
  })();

  // ── Datos ─────────────────────────────────────────────────────────────
  const items = new Map();   // id -> datos
  let col = null;
  const pendientes = new Map();
  // Deshacer: cada cambio guarda cómo estaba la pieza antes.
  const historial = [], ultimo = new Map(), copia = o => JSON.parse(JSON.stringify(o));
  const guardar = (it, sinHistorial) => {
    if (!sinHistorial) { const antes = ultimo.get(it.id) ?? null; if (!antes || JSON.stringify(antes) !== JSON.stringify(it)) { historial.push({ id: it.id, antes }); if (historial.length > 200) historial.shift(); ultimo.set(it.id, copia(it)); } }
    if (!col) return; clearTimeout(pendientes.get(it.id));
    pendientes.set(it.id, setTimeout(async () => { try { const { id, ...datos } = it; await col.doc(id).set(datos); estado("Guardado"); } catch (e) { estado("No se guardó: " + (e.message || e.code), true); } }, 350));
  };
  const borrarDato = async id => { if (!col) return; try { await col.doc(id).delete(); estado("Borrado"); } catch (e) { estado("No se borró: " + (e.message || e.code), true); } };

  // ── Piezas disponibles ────────────────────────────────────────────────
  const catalogo = [{ id: "esp:niebla", nombre: "Niebla", grupo: "Especial" }, { id: "esp:nota", nombre: "Nota para Claude", grupo: "Especial" }];
  Object.keys(E.MODELOS).forEach(n => catalogo.push({ id: "gltf:" + n, nombre: n.replace(/_/g, " "), grupo: "Modelos" }));
  catalogo.push({ id: "silueta:grande", nombre: "golem silueta grande", grupo: "Modelos" }, { id: "silueta:mediano", nombre: "golem silueta mediano", grupo: "Modelos" });   // (paseantes en la niebla: la flecha marca hacia dónde andan; el tono, con la opacidad del panel de material)
  Object.entries(E.KITS).forEach(([n, kit]) => kit.forEach((_, i) => catalogo.push({ id: `kit:${n}:${i}`, nombre: `${n} ${i + 1}`, grupo: "Piezas" })));
  // Miniaturas: cada pieza, dibujada aparte en pequeño (una a una, sin parar el editor).
  const rtT = new THREE.WebGLRenderTarget(112, 84), escT = new THREE.Scene(), camT = new THREE.PerspectiveCamera(32, 112 / 84, 0.01, 2000), buf = new Uint8Array(112 * 84 * 4), miniaturas = new Map(), cola = [];
  escT.background = new THREE.Color(0x3a4252); escT.add(new THREE.HemisphereLight(0xf2f4ff, 0x4a5262, 1.1)); { const dl = new THREE.DirectionalLight(0xffffff, 0.9); dl.position.set(3, 5, 4); escT.add(dl); }
  const hacerMiniatura = id => {
    const r0 = E.crearPiezaEd({ id: "__mini", tipo: "objeto", modelo: id, p: [0, 0, 0], r: [0, 0.6, 0], s: [1, 1, 1], colision: false }); if (!r0.g) return null;
    const g = r0.g; escT.add(g); const b = E.cajaReal(g), c = b.getCenter(new THREE.Vector3()), rad = b.getSize(new THREE.Vector3()).length() / 2, d = rad / Math.sin(THREE.MathUtils.degToRad(16)) * 0.92;   /* (encuadrada en su esfera) */
    camT.position.copy(c).add(new THREE.Vector3(0.62, 0.45, 0.64).normalize().multiplyScalar(d)); camT.lookAt(c); camT.near = d * 0.01; camT.far = d * 10; camT.updateProjectionMatrix();
    const R = E.renderer; R.setRenderTarget(rtT); R.render(escT, camT); R.readRenderTargetPixels(rtT, 0, 0, 112, 84, buf); R.setRenderTarget(null); escT.remove(g);
    const cv = document.createElement("canvas"); cv.width = 112; cv.height = 84; const x = cv.getContext("2d"), im = x.createImageData(112, 84);
    for (let y = 0; y < 84; y++) im.data.set(buf.subarray((83 - y) * 112 * 4, (84 - y) * 112 * 4), y * 112 * 4);
    x.putImageData(im, 0, 0); return cv.toDataURL();
  };
  const miniaturasDesde = performance.now() + 4000;   // (las miniaturas, cuando el mundo ya está a punto: no frenan la carga)
  const siguienteMiniatura = () => { if (window.SIN_MINIATURAS) return; if (performance.now() < miniaturasDesde) { setTimeout(siguienteMiniatura, miniaturasDesde - performance.now()); return; } const e = cola.shift(); if (!e) return; if (!miniaturas.has(e.id)) { try { miniaturas.set(e.id, hacerMiniatura(e.id)); } catch { miniaturas.set(e.id, null); } } if (miniaturas.get(e.id) && e.img.isConnected) e.img.src = miniaturas.get(e.id); setTimeout(siguienteMiniatura, 160); };
  let colocando = null;
  const pintarLista = () => {
    const q = $("buscar").value.trim().toLowerCase(), l = $("lista"); l.textContent = "";
    catalogo.filter(c => !q || c.nombre.includes(q)).forEach(c => { const b = document.createElement("button"), img = document.createElement("img"), nom = document.createElement("span"); img.alt = ""; nom.textContent = c.nombre; b.append(img, nom); b.title = c.grupo;
      if (!c.id.startsWith("esp:")) { if (miniaturas.get(c.id)) img.src = miniaturas.get(c.id); else { const vacia = !cola.length; cola.push({ id: c.id, img }); if (vacia) setTimeout(siguienteMiniatura, 30); } } else img.hidden = true; if (colocando === c.id) b.classList.add("activo");
      b.onclick = () => { colocando = colocando === c.id ? null : c.id; aviso(colocando ? `Haz clic en el escenario para colocar «${c.nombre}». Esc para cancelar.` : ""); pintarLista(); }; l.appendChild(b); });
  };
  $("buscar").oninput = pintarLista; pintarLista();

  // ── Selección y tiradores sobre la propia pieza ───────────────────────
  // Todo a la vez, sin cambiar de modo: arrastrar la pieza la mueve por el suelo; la flecha verde, arriba y abajo;
  // el anillo naranja de la base la gira (Mayús: de 15 en 15°); los cubos azules de las esquinas la escalan.
  const giz = new THREE.Group(); giz.visible = false; scene.add(giz);
  const matG = c => new THREE.MeshBasicMaterial({ color: c, depthTest: false, depthWrite: false, transparent: true, opacity: 0.92 });
  const asas = [], invisible = new THREE.MeshBasicMaterial({ visible: false });
  const asa = (m, tipo, pick) => { m.renderOrder = 999; m.userData.color = m.material.color.getHex(); giz.add(m); const q = pick || m; q.userData.asa = tipo; q.userData.vista = m; if (pick) giz.add(pick); asas.push(q); return m; };
  // Tres flechas desde lo alto de la pieza: roja X, verde Y (arriba y abajo), azul Z; cada una mueve solo por su eje.
  const ejes = new THREE.Group(); giz.add(ejes);
  for (const [color, dir] of [[0xef4444, new THREE.Vector3(1, 0, 0)], [0x4ade80, new THREE.Vector3(0, 1, 0)], [0x3b82f6, new THREE.Vector3(0, 0, 1)]]) {
    const f = new THREE.Group(), tallo = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.6, 10), matG(color)), punta = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.7, 18), matG(color)), pick = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 2.2, 8), invisible);
    tallo.position.y = 0.8; punta.position.y = 1.95; pick.position.y = 1.3;
    for (const m of [tallo, punta]) { m.renderOrder = 999; m.userData.color = color; f.add(m); }
    f.add(pick); pick.userData.asa = "eje"; pick.userData.eje = dir; pick.userData.vistas = [tallo, punta]; asas.push(pick);
    f.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); ejes.add(f);
  }
  const anillo = asa(new THREE.Mesh(new THREE.TorusGeometry(1, 0.02, 8, 96), matG(0xffb020)), "girar", new THREE.Mesh(new THREE.TorusGeometry(1, 0.1, 6, 64), invisible));
  anillo.userData.pick = asas[asas.length - 1];
  const esquinas = [0, 1, 2, 3].map(() => asa(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), matG(0xe5e7eb)), "escalar"));
  let gizG = null, cajaSel = new THREE.Box3(), anilloR = 0, anilloT = 0, sobre = null;
  const medirSel = () => { if (!gizG) return; cajaSel = (gizG.userData.inst ? E.cajaInstancia(gizG.userData.inst.m, gizG.userData.inst.i) : E.cajaReal(gizG)).clone(); };
  const colocarGiz = () => {
    if (!gizG || cajaSel.isEmpty()) { giz.visible = false; return; } giz.visible = true;
    const c = cajaSel.getCenter(new THREE.Vector3()), t = cajaSel.getSize(new THREE.Vector3()), k = Math.max(0.05, cam.position.distanceTo(c) * 0.032);
    const R = Math.hypot(t.x, t.z) / 2 + k * 0.6, T = k * 0.07;
    if (Math.abs(R - anilloR) > anilloR * 0.02 || Math.abs(T - anilloT) > anilloT * 0.15) { anilloR = R; anilloT = T;
      anillo.geometry.dispose(); anillo.geometry = new THREE.TorusGeometry(R, T, 8, 128); anillo.userData.pick.geometry.dispose(); anillo.userData.pick.geometry = new THREE.TorusGeometry(R, k * 0.35, 6, 64); }
    for (const m of [anillo, anillo.userData.pick]) { m.position.set(c.x, cajaSel.min.y + 0.05, c.z); m.rotation.set(Math.PI / 2, 0, 0); }
    ejes.position.set(c.x, cajaSel.max.y + k * 0.4, c.z); ejes.scale.setScalar(k);
    [[cajaSel.min.x, cajaSel.min.z], [cajaSel.max.x, cajaSel.min.z], [cajaSel.min.x, cajaSel.max.z], [cajaSel.max.x, cajaSel.max.z]].forEach(([x, z], i) => { esquinas[i].position.set(x, cajaSel.max.y, z); esquinas[i].scale.setScalar(k * 0.45); });
  };
  (function seguirGiz() { colocarGiz(); requestAnimationFrame(seguirGiz); })();
  const resaltar = q => { if (sobre === q) return; const vistas = s => s ? (s.userData.vistas || [s.userData.vista]) : [];
    for (const m of vistas(sobre)) m.material.color.setHex(m.userData.color); sobre = q; for (const m of vistas(q)) m.material.color.setHex(0xfde047);
    dom.style.cursor = q ? (q.userData.asa === "girar" ? "ew-resize" : q.userData.asa === "eje" ? "move" : "nwse-resize") : ""; };
  const tcM = giz, tcR = { dragging: false };
  window.__ed = { orbit, giz };
  const tc = { attach(g) { gizG = g; medirSel(); colocarGiz(); }, detach() { gizG = null; giz.visible = false; resaltar(null); }, setMode() {}, get dragging() { return !!arrastre; } };
  let sel = null;
  const grupoDe = id => E.escenaEd.get(id)?.g;
  const leerGrupoIt = it => { const g = grupoDe(it.id); if (!g) return; it.p = g.position.toArray().map(v => +v.toFixed(2));
    if ((it.tipo === "objeto" || it.tipo === "mundo")) { it.r = [g.rotation.x, g.rotation.y, g.rotation.z].map(v => +(v * 180 / Math.PI).toFixed(1)); it.s = g.scale.toArray().map(v => +v.toFixed(3)); } };
  const leerGrupo = () => leerGrupoIt(sel);
  // Selección múltiple: «sel» es la principal (lleva los tiradores); «extra», las demás, que la acompañan en todo.
  const extra = new Set(), marcos = new THREE.Group(); scene.add(marcos); let nombreBase = "";
  const cajaDeIt = it => { const g = grupoDe(it.id); if (!g) return null; return (g.userData.inst ? E.cajaInstancia(g.userData.inst.m, g.userData.inst.i) : E.cajaReal(g)).clone(); };
  const pintarMarcos = () => { for (const h of [...marcos.children]) { marcos.remove(h); h.geometry.dispose(); }
    for (const it of extra) { const b = cajaDeIt(it); if (!b || b.isEmpty()) continue; const h = new THREE.Box3Helper(b, 0x7dd3fc); h.material.depthTest = false; h.material.transparent = true; h.renderOrder = 998; marcos.add(h); }
    if (sel) $("selNombre").textContent = nombreBase + (extra.size ? ` (+${extra.size} más)` : ""); };
  const sumarSel = lista => { for (const it of lista) { if (!it) continue; if (!sel) { seleccionar(it, true); continue; } if (it !== sel) extra.add(it); } pintarMarcos(); };
  const restarSel = lista => { for (const it of lista) { if (!it) continue; if (it === sel) { const n = extra.values().next().value; if (n) extra.delete(n); seleccionar(n || null, true); } else extra.delete(it); } pintarMarcos(); };
  const rehacer = () => { const g = E.ponerEd(sel); if (g) tc.attach(g); guardar(sel); };
  const seleccionar = (it, mantener) => {
    if (!mantener) extra.clear();
    sel = it; $("sel").hidden = !it; if (!it) { extra.clear(); pintarMarcos(); tc.detach(); pintarNieblas(); return; }
    const g = grupoDe(it.id); if (g) tc.attach(g);
    const mundo = it.tipo === "mundo", obj = it.tipo === "objeto" || mundo; $("filaRot").hidden = !obj; $("filaEsc").hidden = !obj; $("filaObj").hidden = it.tipo !== "objeto"; $("filaMundo").hidden = !(mundo || it.tipo === "chispa"); $("ayudaMapa").hidden = false;
    $("filaNiebla").hidden = it.tipo !== "niebla"; $("filaNota").hidden = it.tipo !== "nota"; $("filaMat").hidden = !(it.tipo === "objeto" || (mundo && g && !g.userData.inst));
    pintarNieblas();
    if (!obj) tc.setMode("translate");
    $("selNombre").textContent = it.tipo === "trazo" ? "Trazo de " + ({ nieve: "nieve", acumulada: "nieve acumulada", espolvoreada: "nieve espolvoreada", niebla: "niebla" }[it.clase] || it.clase) : it.tipo === "chispa" ? "Chispa de luz · tramo " + (+it.id.slice(2).split("_")[0] + 1) + (it.oculto ? " (oculta)" : "") : it.tipo === "niebla" ? "Niebla" : it.tipo === "nota" ? "Nota para Claude" : it.tipo === "mundo" ? "Pieza del mundo" + (it.oculto ? " (oculta)" : "") : (catalogo.find(c => c.id === it.modelo)?.nombre || it.modelo);
    pintarCampos(); nombreBase = $("selNombre").textContent; pintarMarcos();
  };
  const campos = { px: ["p", 0], py: ["p", 1], pz: ["p", 2], rx: ["r", 0], ry: ["r", 1], rz: ["r", 2], sx: ["s", 0], sy: ["s", 1], sz: ["s", 2] };
  const pintarCampos = () => {
    if (!sel) return;
    for (const [k, [c, i]] of Object.entries(campos)) if (sel[c] && document.activeElement !== $(k)) $(k).value = sel[c][i];
    $("ocultoMundo").checked = !!sel.oculto; $("col").checked = sel.colision !== false; $("nieve").checked = !!sel.nieve; $("usaTinte").checked = !!sel.tinte; if (sel.tinte) $("tinte").value = sel.tinte;
    $("nRadio").value = sel.radio ?? 8; $("nAlto").value = sel.alto ?? 1.5; $("nDens").value = sel.densidad ?? 0.5; $("nColor").value = sel.color || "#efe6ee"; $("nota").value = sel.texto || "";
    // Material: lo retocado o, si no, lo que trae la pieza.
    const g = grupoDe(sel.id); let m0 = null; if (g) g.traverse(o => { if (!m0 && o.isMesh) m0 = o.userData.matOrig || o.material; }); if (Array.isArray(m0)) m0 = m0[0];
    const M = sel.mat || {}; $("mBrillo").value = M.brillo ?? (m0 && m0.roughness !== undefined ? 1 - m0.roughness : 0); $("mMetal").value = M.metal ?? (m0 && m0.metalness !== undefined ? m0.metalness : 0);
    $("mLuzI").value = M.luzI ?? 0; $("mLuz").value = M.luz || "#ffffff"; $("mOpac").value = M.opac ?? 1;
    for (const [k, v] of [["vBrillo", "mBrillo"], ["vMetal", "mMetal"], ["vLuzI", "mLuzI"], ["vOpac", "mOpac"], ["vRadio", "nRadio"], ["vAlto", "nAlto"], ["vDens", "nDens"]]) $(k).textContent = (+$(v).value).toFixed(2);
  };
  // ── Material: los deslizadores cambian la pieza al momento; al soltar, se guarda (y entra en «deshacer»).
  const leerMat = () => { sel.mat = { brillo: +$("mBrillo").value, metal: +$("mMetal").value, luzI: +$("mLuzI").value, luz: $("mLuz").value, opac: +$("mOpac").value }; };
  const verMat = () => { const g = grupoDe(sel.id); if (g) E.aplicarMatEd(g, sel); for (const [k, v] of [["vBrillo", "mBrillo"], ["vMetal", "mMetal"], ["vLuzI", "mLuzI"], ["vOpac", "mOpac"]]) $(k).textContent = (+$(v).value).toFixed(2); };
  for (const k of ["mBrillo", "mMetal", "mLuzI", "mOpac", "mLuz"]) { $(k).addEventListener("input", () => { if (!sel) return; leerMat(); verMat(); }); $(k).addEventListener("change", () => { if (!sel) return; leerMat(); verMat(); guardar(sel); }); }
  $("matOriginal").onclick = () => { if (!sel) return; delete sel.mat; sel.tinte = null; verMat(); pintarCampos(); guardar(sel); };
  // ── Nieblas: la lista de las puestas (clic: ir y elegirla) y una nueva donde mira la vista.
  const pintarNieblas = () => { const L = $("listaNieblas"); L.textContent = "";
    [...items.values()].filter(it => it.tipo === "niebla").sort((a, b) => b.p[2] - a.p[2]).forEach((it, i) => { const bt = document.createElement("button"); bt.textContent = "Niebla " + (i + 1) + " · z " + Math.round(it.p[2]); if (sel && sel.id === it.id) bt.classList.add("activo");
      bt.onclick = () => { orbit.target.set(it.p[0], it.p[1], it.p[2]); cam.position.set(it.p[0] + 12, it.p[1] + 14, it.p[2] + 18); orbit.update(); seleccionar(it); }; L.appendChild(bt); }); };
  $("nuevaNiebla").onclick = () => { const t = orbit.target, it = { id: nuevoId(), tipo: "niebla", p: [+t.x.toFixed(2), +E.alturaTerreno(t.x, t.z).toFixed(2), +t.z.toFixed(2)], radio: 8, alto: 1.5, densidad: 0.5, color: "#efe6ee" };
    items.set(it.id, it); E.ponerEd(it); guardar(it); seleccionar(it); };
  for (const [k, [c, i]] of Object.entries(campos)) $(k).addEventListener("change", () => { if (!sel || !sel[c]) return; const v = parseFloat($(k).value); if (!isFinite(v)) return; sel[c][i] = v; rehacer(); });
  $("col").onchange = () => { sel.colision = $("col").checked; rehacer(); };
  $("nieve").onchange = () => { sel.nieve = $("nieve").checked; rehacer(); };
  $("usaTinte").onchange = () => { sel.tinte = $("usaTinte").checked ? $("tinte").value : null; rehacer(); };
  $("tinte").onchange = () => { if ($("usaTinte").checked) { sel.tinte = $("tinte").value; rehacer(); } };
  [["nRadio", "radio", "vRadio"], ["nAlto", "alto", "vAlto"], ["nDens", "densidad", "vDens"]].forEach(([k, c, vk]) => {
    $(k).addEventListener("input", () => { const v = parseFloat($(k).value); if (isFinite(v) && sel) { sel[c] = v; $(vk).textContent = v.toFixed(2); const g = E.ponerEd(sel); if (g) tc.attach(g); } });
    $(k).addEventListener("change", () => { const v = parseFloat($(k).value); if (isFinite(v) && sel) { sel[c] = v; rehacer(); } }); });
  $("nColor").addEventListener("input", () => { if (!sel) return; sel.color = $("nColor").value; const g = E.ponerEd(sel); if (g) tc.attach(g); });
  $("nColor").onchange = () => { sel.color = $("nColor").value; rehacer(); };
  $("nota").addEventListener("input", () => { sel.texto = $("nota").value; guardar(sel); });
  const nuevoId = () => "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const dupIt = src => { const it = JSON.parse(JSON.stringify(src)); it.id = nuevoId(); it.oculto = false; it.p[0] += 3; it.p[2] += 3; items.set(it.id, it); const g = E.ponerEd(it); if (g) { g.visible = true; g.traverse(o => { if (o.isMesh) o.visible = true; }); } guardar(it); return it; };   /* (la copia, siempre visible: la del mundo salía invisible) */
  $("dup").onclick = () => { if (!sel) return; const todos = [sel, ...extra].filter(it => it.tipo !== "chispa"), nuevos = todos.map(dupIt); seleccionar(nuevos[0] || null); sumarSel(nuevos.slice(1)); };
  const borrarIt = it => { if (it.tipo === "mundo" || it.tipo === "chispa") { it.oculto = true; const g = E.ponerEd(it); guardar(it); return; }   /* (las del mundo se ocultan; «Devolver a su sitio» las recupera) */
    const id = it.id; historial.push({ id, antes: ultimo.get(id) ?? copia(it) }); ultimo.delete(id); E.quitarEd(id); items.delete(id); borrarDato(id); };
  const borrar = () => { if (!sel) return; const todos = [sel, ...extra]; seleccionar(null); todos.forEach(borrarIt); if (todos.length > 1) aviso(`${todos.length} piezas borradas`), setTimeout(() => aviso(""), 2500); };
  $("borrar").onclick = borrar;
  const deshacer = () => { const h = historial.pop(); if (!h) { aviso("No hay nada que deshacer."); setTimeout(() => aviso(""), 2000); return; } seleccionar(null);
    if (!h.antes) { E.quitarEd(h.id); items.delete(h.id); ultimo.delete(h.id); borrarDato(h.id); }
    else { const it = copia(h.antes); items.set(it.id, it); ultimo.set(it.id, copia(it)); E.ponerEd(it); guardar(it, true); }
    estado("Deshecho"); };
  $("deshacer").onclick = deshacer;
  $("restaurar").onclick = () => { if (sel && sel.tipo === "chispa") { const b = baseChispa.get(sel.id); if (b) sel.p = b.slice(); sel.oculto = false; rehacer(); pintarCampos(); return; } if (!sel || sel.tipo !== "mundo") return; const id = sel.id; historial.push({ id, antes: ultimo.get(id) ?? copia(sel) }); ultimo.delete(id); seleccionar(null); E.quitarEd(id); items.delete(id); borrarDato(id); };
  $("ocultoMundo").onchange = () => { sel.oculto = $("ocultoMundo").checked; rehacer(); };
  function atajo(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); deshacer(); return; }
    if (e.key === "Escape") { colocando = null; if (pincel) { pincel = null; pintarPinceles(); } aviso(""); pintarLista(); seleccionar(null); }
    if (!sel || !(sel.tipo === "objeto" || sel.tipo === "mundo")) { if ((e.key === "Delete" || e.key === "Backspace") && sel) borrar(); return; }
    if (e.key === "Delete" || e.key === "Backspace") borrar();
  }

  // ── Clic en el escenario: colocar o seleccionar ───────────────────────
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  const cajasMundo = new Map();
  const cajaMundo = o => { if (!cajasMundo.has(o)) { let b = null; const suelo = E.sueloMat();
      if (!o.isLight && !o.isCamera && !o.isInstancedMesh && !o.isPoints && !o.isSprite && !o.userData.pivoteEd) { let malla = false, esSuelo = false; o.traverse(m => { if (m.isMesh && !m.isInstancedMesh) { malla = true; if (m.material === suelo) esSuelo = true; } });
        if (malla && !esSuelo) { b = E.cajaReal(o); const t = b.getSize(new THREE.Vector3()); if (b.isEmpty() || Math.max(t.x, t.y, t.z) > 90) b = null; } }
      cajasMundo.set(o, b); } return cajasMundo.get(o); };
  let abajo = null, arrastre = null, huboArrastre = false, ultimoClic = null, avisoT = 0;
  // La clave de lo elegido, para saber cuál toca después al volver a hacer clic en el mismo sitio.
  const claveDeSel = () => sel ? "e:" + sel.id : null;   // (lo elegido ya está entre lo editado)
  const planoA = new THREE.Plane(), ptA = new THREE.Vector3();
  const rayoDe = e => { const r = dom.getBoundingClientRect(); ptr.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(ptr, cam); };
  const asaBajo = e => { if (!gizG || !giz.visible) return null; rayoDe(e); const h = ray.intersectObjects(asas, false)[0]; return h ? h.object : null; };
  const enPantalla = v => { const r = dom.getBoundingClientRect(), q = v.clone().project(cam); return [(q.x + 1) / 2 * r.width + r.left, (1 - q.y) / 2 * r.height + r.top]; };
  dom.addEventListener("pointerdown", e => { abajo = [e.clientX, e.clientY]; huboArrastre = false;
    if (e.button !== 0 || !sel || colocando) return;
    const g = grupoDe(sel.id); if (!g) return;
    const q = asaBajo(e), c = cajaSel.getCenter(new THREE.Vector3());
    const base = { g, x0: e.clientX, y0: e.clientY, rot0: g.rotation.y, esc0: g.scale.clone(), pos0: g.position.clone(), caja0: cajaSel.clone(),
      extras: [...extra].map(it => { const q = grupoDe(it.id); return q ? { it, g: q, p0: q.position.clone(), r0: q.rotation.y, s0: q.scale.clone() } : null; }).filter(Boolean) };
    if (q) { const tipo = q.userData.asa;
      if (tipo === "eje") { const ax = q.userData.eje, v = new THREE.Vector3(); cam.getWorldDirection(v); const n = ax.clone().cross(v.clone().cross(ax)); if (n.lengthSq() < 1e-8) n.copy(v); n.normalize();
        const o = new THREE.Vector3(); q.getWorldPosition(o); planoA.setFromNormalAndCoplanarPoint(n, o); if (!ray.ray.intersectPlane(planoA, ptA)) return; arrastre = { ...base, modo: "eje", ax, p0: ptA.clone() }; }
      else if (tipo === "girar") { planoA.set(new THREE.Vector3(0, 1, 0), -(cajaSel.min.y + 0.05)); if (!ray.ray.intersectPlane(planoA, ptA)) return; arrastre = { ...base, modo: "girar", c, a0: Math.atan2(ptA.z - c.z, ptA.x - c.x) }; }
      else { const cp = enPantalla(c); arrastre = { ...base, modo: "escalar", cp, d0: Math.max(4, Math.hypot(e.clientX - cp[0], e.clientY - cp[1])) }; }
    } else {
      rayoDe(e); const b = g.userData.inst ? E.cajaInstancia(g.userData.inst.m, g.userData.inst.i) : E.cajaReal(g); if (!ray.ray.intersectBox(b, ptA)) return;
      planoA.set(new THREE.Vector3(0, 1, 0), -g.position.y); ray.ray.intersectPlane(planoA, ptA);
      arrastre = { ...base, modo: e.shiftKey ? "girarL" : e.altKey ? "escalarL" : "mover", off: g.position.clone().sub(ptA), pend: true };   // (hasta que se mueve, es un clic: deja elegir lo de debajo)
    }
    if (!arrastre.pend) huboArrastre = true; orbit.enabled = false; dom.setPointerCapture(e.pointerId); e.preventDefault(); e.stopImmediatePropagation(); });
  dom.addEventListener("pointermove", e => {
    if (!arrastre) { if (e.buttons === 0) resaltar(asaBajo(e)); return; }
    const A = arrastre, g = A.g;
    if (A.pend) { if (Math.hypot(e.clientX - A.x0, e.clientY - A.y0) < 4) return; A.pend = false; huboArrastre = true; }
    if (A.modo === "mover") { rayoDe(e); if (ray.ray.intersectPlane(planoA, ptA)) { g.position.x = ptA.x + A.off.x; g.position.z = ptA.z + A.off.z; } }
    else if (A.modo === "eje") { rayoDe(e); if (ray.ray.intersectPlane(planoA, ptA)) g.position.copy(A.pos0).addScaledVector(A.ax, ptA.clone().sub(A.p0).dot(A.ax)); }
    else if (A.modo === "girar") { rayoDe(e); if (ray.ray.intersectPlane(planoA, ptA)) { let d = Math.atan2(ptA.z - A.c.z, ptA.x - A.c.x) - A.a0; if (e.shiftKey) d = Math.round(d / (Math.PI / 12)) * (Math.PI / 12); g.rotation.y = A.rot0 - d; } }
    else if (A.modo === "girarL") g.rotation.y = A.rot0 + (e.clientX - A.x0) * 0.012;
    else { const f = A.modo === "escalar" ? Math.max(0.02, Math.hypot(e.clientX - A.cp[0], e.clientY - A.cp[1]) / A.d0) : Math.exp(-(e.clientY - A.y0) * 0.006); g.scale.copy(A.esc0).multiplyScalar(f);
      cajaSel.min.copy(A.caja0.min).sub(A.pos0).multiplyScalar(f).add(A.pos0); cajaSel.max.copy(A.caja0.max).sub(A.pos0).multiplyScalar(f).add(A.pos0); }
    if (A.modo === "mover" || A.modo === "eje") { const dl = g.position.clone().sub(A.pos0); cajaSel.min.copy(A.caja0.min).add(dl); cajaSel.max.copy(A.caja0.max).add(dl); }
    g.updateMatrixWorld(true); leerGrupo(); pintarCampos(); if (g.userData.inst) E.ponerEd(sel);
    if (A.extras.length) { marcos.visible = false; const dl = g.position.clone().sub(A.pos0), dr = g.rotation.y - A.rot0, f = g.scale.x / (A.esc0.x || 1), c = Math.cos(dr), s = Math.sin(dr);   /* (las demás siguen a la principal: se mueven, giran y escalan alrededor de ella) */
      for (const X of A.extras) { const x = X.p0.x - A.pos0.x, y = X.p0.y - A.pos0.y, z = X.p0.z - A.pos0.z;
        X.g.position.set(A.pos0.x + dl.x + (x * c + z * s) * f, A.pos0.y + dl.y + y * f, A.pos0.z + dl.z + (-x * s + z * c) * f); X.g.rotation.y = X.r0 + dr; X.g.scale.copy(X.s0).multiplyScalar(f); X.g.updateMatrixWorld(true);
        if (X.g.userData.inst) { leerGrupoIt(X.it); E.ponerEd(X.it); } } } });
  dom.addEventListener("pointerup", () => { if (!arrastre) return; const pend = arrastre.pend, A = arrastre; arrastre = null; orbit.enabled = true; if (pend) return; leerGrupo(); rehacer(); medirSel();
    for (const X of A.extras) { leerGrupoIt(X.it); E.ponerEd(X.it); guardar(X.it); } marcos.visible = true; if (A.extras.length) pintarMarcos(); });
  dom.addEventListener("pointerup", e => {
    if (!abajo || huboArrastre || Math.hypot(e.clientX - abajo[0], e.clientY - abajo[1]) > 5 || e.button !== 0) return;
    const r = dom.getBoundingClientRect(); ptr.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(ptr, cam);
    if (colocando) {
      const hit = ray.intersectObjects(scene.children.filter(o => o !== giz && o.visible), true).find(h => h.object.isMesh && !(h.object.material && h.object.material.transparent && h.object.material.opacity < 0.3));
      if (!hit) return;
      const id = nuevoId(), p = hit.point.toArray().map(v => +v.toFixed(2));
      let it;
      if (colocando === "esp:niebla") it = { id, tipo: "niebla", p, radio: 8, alto: 1.5, densidad: 0.5, color: "#efe6ee" };
      else if (colocando === "esp:nota") it = { id, tipo: "nota", p, texto: "" };
      else { it = { id, tipo: "objeto", modelo: colocando, p, r: [0, 0, 0], s: [1, 1, 1], colision: true };
        const g = E.ponerEd(it); if (g) { const t = E.cajaReal(g).getSize(new THREE.Vector3()), k = +((colocando === "gltf:golem" || colocando === "gltf:golem_grande" || colocando.startsWith("silueta:") ? ({ "gltf:golem": 3.2, "gltf:golem_grande": 6.4, "silueta:grande": 10, "silueta:mediano": 5 }[colocando]) / Math.max(t.y, 0.001) : 3 / Math.max(t.x, t.y, t.z, 0.001))).toFixed(3); it.s = [k, k, k]; } }   // (de entrada, unos 3 m; el golem, el doble de alto que Blizzard)
      items.set(id, it); E.ponerEd(it); guardar(it); seleccionar(it);
      if (!e.shiftKey) { colocando = null; aviso(""); pintarLista(); }   // (con Mayús se siguen colocando)
      return;
    }
    // Todo se elige por su caja (muchas piezas del juego no responden a los rayos): lo ya editado, cada pieza
    // suelta del mundo y cada copia de las mallas instanciadas. Donde se solapan, primero la más pequeña;
    // otro clic en el mismo sitio pasa a la siguiente (como en 3ds Max).
    const visible = o => { for (let v = o; v; v = v.parent) if (!v.visible) return false; return true; };
    const entradas = [...E.escenaEd.values()].filter(v => v.g), tam = new THREE.Vector3(), cands = [];
    const tramo = b => { const o = ray.ray.origin, d = ray.ray.direction; let t0 = -Infinity, t1 = Infinity;
      for (const k of ["x", "y", "z"]) { if (Math.abs(d[k]) < 1e-12) { if (o[k] < b.min[k] || o[k] > b.max[k]) return null; continue; }
        let a = (b.min[k] - o[k]) / d[k], c = (b.max[k] - o[k]) / d[k]; if (a > c) [a, c] = [c, a]; t0 = Math.max(t0, a); t1 = Math.min(t1, c); }
      return t1 >= Math.max(t0, 0) ? [Math.max(t0, 0), t1] : null; };
    const probar = (b, que, clave, pri = 0) => { if (!b || b.isEmpty()) return; const t = tramo(b); if (!t) return; b.getSize(tam); cands.push({ que, clave, pri, t0: t[0], t1: t[1], vol: Math.max(tam.x, 0.05) * Math.max(tam.y, 0.05) * Math.max(tam.z, 0.05) }); };   // (pri: 0 piezas, 1 trazos, 2 ocultas: estas, solo si no hay otra cosa)
    for (const e of entradas) { if (!e.g.visible && e.it.tipo !== "mundo") continue; probar(e.g.userData.inst ? E.cajaInstancia(e.g.userData.inst.m, e.g.userData.inst.i) : E.cajaReal(e.g), { entrada: e }, "e:" + e.it.id, e.it.oculto ? 2 : e.it.tipo === "trazo" ? 1 : 0); }
    for (const u of E.unidadesMundo()) { if (!visible(u) || u.userData.enPivote) continue;
      if (u.isInstancedMesh) { if (u.material === E.sueloMat()) continue; for (let i = 0; i < u.count; i++) { if (entradas.some(e => e.g.userData.inst && e.g.userData.inst.m === u && e.g.userData.inst.i === i)) continue; const b = E.cajaInstancia(u, i), t = b.getSize(tam); if (Math.max(t.x, t.y, t.z) < 60) probar(b, { m: u, i }, "i:" + u.uuid + ":" + i); } }
      else probar(cajaMundo(u), { o: u }, "o:" + u.uuid); }
    // Las que el rayo cruza antes de salir de la más cercana se solapan en el clic: de menor a mayor; luego, por distancia.
    const lista = cands.sort((a, b) => a.pri - b.pri || a.vol - b.vol || a.t0 - b.t0).slice(0, 12);   /* (de la más pequeña a la más grande: las pequeñas se eligen a la primera) */
    let mejor = null;
    if (lista.length) { let k = 0;
      if (ultimoClic && Math.hypot(e.clientX - ultimoClic.x, e.clientY - ultimoClic.y) < 6 && sel) { const ahora = lista.findIndex(c => c.clave === claveDeSel()); if (ahora >= 0) k = (ahora + 1) % lista.length; }
      mejor = lista[k].que; if (lista.length > 1) aviso(`Pieza ${k + 1} de ${lista.length} aquí · otro clic en el mismo sitio elige la siguiente`), clearTimeout(avisoT), avisoT = setTimeout(() => aviso(""), 2500); }
    ultimoClic = { x: e.clientX, y: e.clientY };
    if (!mejor) { if (!e.shiftKey && !e.altKey) seleccionar(null); return; }
    const it = itemDe(mejor);
    if (e.shiftKey) sumarSel([it]); else if (e.altKey) restarSel([it]); else seleccionar(it);   /* (Mayús: suma a lo elegido; Alt: lo quita) */
  });
  const itemDe = que => { if (que.entrada) return items.get(que.entrada.it.id) || que.entrada.it;
    const firma = que.o ? E.firmaDe(que.o) : E.firmaInstancia(que.m, que.i), it = { id: (firma.inst ? "mi" : "m") + firma.n + "_" + firma.c.map(v => Math.round(v * 10)).join("_"), tipo: "mundo", firma, p: firma.c.slice(), r: [0, 0, 0], s: [1, 1, 1], oculto: false };
    const ya = items.get(it.id); if (ya) return ya; items.set(it.id, it); E.ponerEd(it, que.o || { m: que.m, i: que.i }); return it; };
  // Marco de selección: Ctrl (⌘ en Mac) y arrastrar. Con Mayús suma a lo elegido; con Alt, lo quita.
  const marco = document.createElement("div"); marco.style.cssText = "position:fixed;border:1px dashed #7dd3fc;background:rgba(125,211,252,0.12);pointer-events:none;display:none;z-index:50"; document.body.appendChild(marco);
  let caja2d = null;
  dom.addEventListener("pointerdown", e => { if (e.button !== 0 || !(e.ctrlKey || e.metaKey) || colocando || pincel) return;
    caja2d = { x0: e.clientX, y0: e.clientY, x1: e.clientX, y1: e.clientY, modo: e.shiftKey ? "sumar" : e.altKey ? "restar" : "nuevo" }; abajo = null; orbit.enabled = false; dom.setPointerCapture(e.pointerId); e.preventDefault(); e.stopImmediatePropagation(); }, { capture: true });
  dom.addEventListener("pointermove", e => { if (!caja2d) return; caja2d.x1 = e.clientX; caja2d.y1 = e.clientY; const C = caja2d;
    Object.assign(marco.style, { display: "block", left: Math.min(C.x0, C.x1) + "px", top: Math.min(C.y0, C.y1) + "px", width: Math.abs(C.x1 - C.x0) + "px", height: Math.abs(C.y1 - C.y0) + "px" }); e.stopImmediatePropagation(); }, { capture: true });
  dom.addEventListener("pointerup", e => { if (!caja2d) return; const C = caja2d; caja2d = null; marco.style.display = "none"; orbit.enabled = true; e.stopImmediatePropagation();
    const x0 = Math.min(C.x0, C.x1), x1 = Math.max(C.x0, C.x1), y0 = Math.min(C.y0, C.y1), y1 = Math.max(C.y0, C.y1); if (x1 - x0 < 4 && y1 - y0 < 4) return;
    const r = dom.getBoundingClientRect(), v = new THREE.Vector3(), dentro = b => { if (!b || b.isEmpty()) return false; b.getCenter(v).project(cam); if (v.z < -1 || v.z > 1) return false; const x = (v.x + 1) / 2 * r.width + r.left, y = (1 - v.y) / 2 * r.height + r.top; return x >= x0 && x <= x1 && y >= y0 && y <= y1; };
    const visible = o => { for (let q = o; q; q = q.parent) if (!q.visible) return false; return true; }, ques = [], tam = new THREE.Vector3();
    const entradas = [...E.escenaEd.values()].filter(q => q.g && q.g.visible);
    for (const q of entradas) if (dentro(q.g.userData.inst ? E.cajaInstancia(q.g.userData.inst.m, q.g.userData.inst.i) : E.cajaReal(q.g))) ques.push({ entrada: q });
    for (const u of E.unidadesMundo()) { if (!visible(u) || u.userData.enPivote) continue;
      if (u.isInstancedMesh) { if (u.material === E.sueloMat()) continue; for (let i = 0; i < u.count; i++) { if (entradas.some(q => q.g.userData.inst && q.g.userData.inst.m === u && q.g.userData.inst.i === i)) continue; const b = E.cajaInstancia(u, i); b.getSize(tam); if (Math.max(tam.x, tam.y, tam.z) < 60 && dentro(b)) ques.push({ m: u, i }); } }
      else if (dentro(cajaMundo(u))) ques.push({ o: u }); }
    if (ques.length > 400) { aviso(`Hay ${ques.length} piezas en el marco: se toman las 400 primeras.`); setTimeout(() => aviso(""), 3000); }
    const lista = ques.slice(0, 400).map(itemDe);
    if (C.modo === "sumar") sumarSel(lista); else if (C.modo === "restar") restarSel(lista); else { seleccionar(lista[0] || null); sumarSel(lista.slice(1)); }
    if (lista.length) { aviso(`${1 + extra.size} piezas elegidas`); setTimeout(() => aviso(""), 2500); } }, { capture: true });
  // Las chispas de luz del recorrido: se ven y se mueven como una pieza más (borrar las oculta).
  const baseChispa = new Map();
  // (se colocan cuando ya están puestas las piezas guardadas, igual que en el juego: así salen en el mismo sitio)
  const ponerChispas = () => { for (const c of E.chispasBase()) { baseChispa.set(c.id, c.p); if (!items.has(c.id)) { const it = { id: c.id, tipo: "chispa", p: c.p.slice() }; items.set(it.id, it); E.ponerEd(it); } } };
  const chispaSinCambio = it => it.tipo === "chispa" && !it.oculto && baseChispa.has(it.id) && it.p.every((v, i) => Math.abs(v - baseChispa.get(it.id)[i]) < 0.01);
  // ── Pinceles: nieve, nieve acumulada, nieve espolvoreada y niebla, pintadas arrastrando sobre el terreno ──
  let pincel = null, trazoEd = null, trazoT = 0;
  // El círculo del pincel bajo el ratón (del tamaño que pinta).
  const cursorPincel = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffb020, transparent: true, opacity: 0.9, depthTest: false, side: THREE.DoubleSide }));
  cursorPincel.renderOrder = 999; cursorPincel.visible = false; scene.add(cursorPincel);
  const pintarPinceles = () => { cursorPincel.visible = false; document.querySelectorAll("#pinceles button").forEach(b => b.classList.toggle("activo", b.dataset.pincel === pincel)); $("filaMov").hidden = pincel !== "niebla"; dom.style.cursor = pincel ? "crosshair" : ""; aviso(pincel ? "Pincel: arrastra sobre el terreno para pintar · Esc para dejarlo" : ""); };
  document.querySelectorAll("#pinceles button").forEach(b => b.onclick = () => { pincel = pincel === b.dataset.pincel ? null : b.dataset.pincel; colocando = null; pintarLista(); pintarPinceles(); });
  for (const [k, v, d] of [["pTam", "vTam", 1], ["pInt", "vInt", 2], ["pMov", "vMov", 2]]) $(k).addEventListener("input", () => { $(v).textContent = (+$(k).value).toFixed(d); });
  // Dónde pinta: la primera superficie que se ve bajo el ratón (terreno o pieza: rocas, plataformas, hielo…).
  let candidatos = null, candT = 0;
  const visibleDe = o => { for (let v = o; v; v = v.parent) if (!v.visible || v.userData.trazo || v.userData.chispa || v === giz || v === cursorPincel) return false; return true; };
  const listaCandidatos = () => { if (candidatos && performance.now() - candT < 4000) return candidatos; candT = performance.now(); candidatos = []; const suelo = E.sueloMat();
    scene.traverse(o => { if (!o.isMesh || o.isSkinnedMesh) return; const m = o.material; if (!m || Array.isArray(m) || m === suelo || m.type === "ShaderMaterial" || (m.transparent && m.opacity < 0.6) || m.depthWrite === false) return; if (!visibleDe(o)) return; if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); candidatos.push(o); });
    return candidatos; };
  const sueloBajo = e => { rayoDe(e); const o = ray.ray.origin, d = ray.ray.direction, en = t => [o.x + d.x * t, o.y + d.y * t, o.z + d.z * t]; let t0 = 0, t1 = null, paso = 1;
    for (let t = 0; t < 4000; t += paso) { const q = en(t); if (q[1] <= E.alturaTerreno(q[0], q[2])) { t1 = t; break; } t0 = t; paso = Math.min(10, paso * 1.06); }
    if (t1 !== null) for (let k = 0; k < 18; k++) { const tm = (t0 + t1) / 2, q = en(tm); if (q[1] <= E.alturaTerreno(q[0], q[2])) t1 = tm; else t0 = tm; }
    // (las piezas: rayo contra su malla, aunque en el juego no respondan a los rayos)
    let tm = t1 === null ? Infinity : t1; const hits = [], rc = THREE.Mesh.prototype.raycast, rci = THREE.InstancedMesh.prototype.raycast; ray.far = Math.min(tm, 4000);
    for (const m of listaCandidatos()) { hits.length = 0; try { (m.isInstancedMesh ? rci : rc).call(m, ray, hits); } catch {} for (const h of hits) if (h.distance < tm) tm = h.distance; }
    ray.far = Infinity; return tm === Infinity ? null : en(tm).map(v => +v.toFixed(2)); };
  dom.addEventListener("pointerdown", e => { if (!pincel || e.button !== 0) return; const q = sueloBajo(e); if (!q) { aviso("Apunta al terreno para pintar."); return; } aviso("Pintando…"); e.stopImmediatePropagation(); e.preventDefault(); orbit.enabled = false; try { dom.setPointerCapture(e.pointerId); } catch {}
    trazoEd = { id: nuevoId(), tipo: "trazo", clase: pincel, puntos: [q], r: +$("pTam").value, i: +$("pInt").value, mov: pincel === "niebla" ? +$("pMov").value : 0, p: [0, 0, 0] }; items.set(trazoEd.id, trazoEd); E.ponerEd(trazoEd); trazoT = performance.now(); }, true);
  dom.addEventListener("pointermove", e => { if (pincel && !trazoEd) { const q = sueloBajo(e); cursorPincel.visible = !!q; if (q) { cursorPincel.position.set(q[0], q[1] + 0.3, q[2]); cursorPincel.scale.setScalar(+$("pTam").value); } return; }
    if (!trazoEd) return; e.stopImmediatePropagation(); const q = sueloBajo(e); if (!q) return; cursorPincel.position.set(q[0], q[1] + 0.3, q[2]); const u = trazoEd.puntos[trazoEd.puntos.length - 1];
    if (Math.hypot(q[0] - u[0], q[2] - u[2]) >= Math.max(0.3, trazoEd.r * 0.35)) trazoEd.puntos.push(q);
    if (performance.now() - trazoT > 160) { trazoT = performance.now(); E.ponerEd(trazoEd); } }, true);
  dom.addEventListener("pointerup", e => { if (!trazoEd) return; e.stopImmediatePropagation(); const t = trazoEd; trazoEd = null; orbit.enabled = true; E.ponerEd(t); guardar(t); aviso("Trazo pintado (" + t.puntos.length + " puntos) · sigue arrastrando para otro · Esc para dejar el pincel"); }, true);
  verBloque(bloques[0]);
  // La base de datos se carga aparte: el editor responde desde el principio.
  (async () => {
    let db = null; try { db = window.claude ? await window.claude.use("db") : null; } catch { db = null; }
    col = db ? db.collection("escena") : null;
    if (!col) { estado("Sin guardado: abre esta página desde tu cuenta para que se guarde.", true); ponerChispas(); return; }
    try { const snap = await col.get(); snap.docs.forEach(d => { const it = { ...d.data(), id: d.id }; items.set(it.id, it); ultimo.set(it.id, copia(it)); E.ponerEd(it); }); estado(`${items.size} piezas · se guarda solo`); pintarNieblas(); }
    catch (e) { estado("No se pudo leer lo guardado: " + (e.message || e.code), true); }
    ponerChispas();
  })();

  // ── Publicar: avisa a Claude, que pasa la escena al juego ─────────────
  let com = null; try { com = window.claude ? await window.claude.use("comments") : null; } catch { com = null; }
  $("publicar").onclick = async () => {
    // El aviso sale en el mismo clic (si se espera a guardar todo antes, el navegador ya no lo deja enviar);
    // lo pendiente se guarda a la vez y Claude lo lee unos segundos después.
    for (const t of pendientes.values()) clearTimeout(t); pendientes.clear();
    const guardado = col ? Promise.all([...items.values()].filter(it => !chispaSinCambio(it)).map(it => { const { id, ...datos } = it; return col.doc(id).set(datos).catch(() => {}); })) : Promise.resolve();
    let puede = "off"; try { puede = com ? await com.canSendToClaude() : "off"; } catch {}
    const porChat = "Escríbele en el chat: «he publicado».";
    if (puede !== "available") { aviso((puede === "no_session" ? "Claude no está conectado ahora mismo. " : "No se puede avisar a Claude desde aquí. ") + porChat); await guardado; setTimeout(() => aviso(""), 9000); return; }
    try { await com.sendToClaude({ anchor: await com.anchorFor($("publicar")), text: `Publica la escena del editor en el juego (${items.size} piezas).` }); aviso("Enviado a Claude: en unos minutos estará en el juego."); }
    catch (e) { aviso("No se pudo avisar a Claude (" + (e.code || e.message) + "). " + porChat); }
    await guardado; estado(`${items.size} piezas · guardado`); setTimeout(() => aviso(""), 9000);
  };

})();
