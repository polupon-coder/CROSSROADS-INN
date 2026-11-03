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
  orbit.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.PAN, RIGHT: THREE.MOUSE.PAN }; orbit.panSpeed = 1.6; orbit.zoomSpeed = 1.4;   // (la rueda pulsada arrastra la vista)
  E.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); E.renderer.setSize(innerWidth, innerHeight, false);
  orbit.enableDamping = true; orbit.dampingFactor = 0.12; orbit.maxPolarAngle = Math.PI * 0.495;
  const irA = z => { const x = E.caminoX(z), y = E.alturaTerreno(x, z); orbit.target.set(x, y + 1, z); cam.position.set(x + 10, y + 12, z + 18); orbit.update(); };
  // De entrada, el mundo entero en planta y sin niebla.
  cam.far = 6000; cam.updateProjectionMatrix();
  const planta = () => { const z = -760, x = E.caminoX(z), y = E.alturaTerreno(x, z); orbit.target.set(x, y, z); cam.position.set(x, y + 1250, z + 0.01); orbit.update(); };
  let conNiebla = false;
  const ponerNiebla = on => { conNiebla = on; $("niebla").textContent = "Niebla: " + (on ? "sí" : "no");
    if (scene.fog) { scene.fog.near = on ? 2 : 1e5; scene.fog.far = on ? 70 : 2e5; }
    (E.nieblaLago?.capas || []).forEach(m => m.visible = on); };
  // Bloques por santuario: solo se ve (y se dibuja) el tramo elegido.
  const S = E.santuarios, bloques = [["Todo", 60, -1600], ["1 · Bastón", 40, (S[0] + S[1]) / 2], ["2 · Rocas", (S[0] + S[1]) / 2, (S[1] + S[2]) / 2], ["3 · Puerta", (S[1] + S[2]) / 2, (S[2] + S[3]) / 2],
    ["4 · Giro", (S[2] + S[3]) / 2, (S[3] + S[4]) / 2], ["5 · Revelación", (S[3] + S[4]) / 2, (S[4] + S[5]) / 2], ["6 · Onda", (S[4] + S[5]) / 2, S[5] - 20], ["Pilares y lago", S[5] - 20, E.hielo.hasta], ["Cueva", E.hielo.hasta, E.cuevaZ - 40]];
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
    const v = 0.6;   // flechas: desplazan la vista por el recorrido
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
  const siguienteMiniatura = () => { if (window.SIN_MINIATURAS) return; const e = cola.shift(); if (!e) return; if (!miniaturas.has(e.id)) { try { miniaturas.set(e.id, hacerMiniatura(e.id)); } catch { miniaturas.set(e.id, null); } } if (miniaturas.get(e.id) && e.img.isConnected) e.img.src = miniaturas.get(e.id); setTimeout(siguienteMiniatura, 160); };
  let colocando = null;
  const pintarLista = () => {
    const q = $("buscar").value.trim().toLowerCase(), l = $("lista"); l.textContent = "";
    catalogo.filter(c => !q || c.nombre.includes(q)).forEach(c => { const b = document.createElement("button"), img = document.createElement("img"), nom = document.createElement("span"); img.alt = ""; nom.textContent = c.nombre; b.append(img, nom); b.title = c.grupo;
      if (!c.id.startsWith("esp:")) { if (miniaturas.get(c.id)) img.src = miniaturas.get(c.id); else { const vacia = !cola.length; cola.push({ id: c.id, img }); if (vacia) setTimeout(siguienteMiniatura, 30); } } else img.hidden = true; if (colocando === c.id) b.classList.add("activo");
      b.onclick = () => { colocando = colocando === c.id ? null : c.id; aviso(colocando ? `Haz clic en el escenario para colocar «${c.nombre}». Esc para cancelar.` : ""); pintarLista(); }; l.appendChild(b); });
  };
  $("buscar").oninput = pintarLista; pintarLista();

  // ── Selección y gizmo ─────────────────────────────────────────────────
  // Sobre la pieza, a la vez: flechas para moverla y anillos para girarla (como en 3ds Max). Escalar, con su botón o R.
  // Como en 3ds Max: un solo manejador a la vez (mover W, girar E, escalar R), grande y claro.
  const tcM = new THREE.TransformControls(cam, dom), tcR = { dragging: false }; tcM.setSize(1.7); scene.add(tcM);
  window.__ed = { orbit, tcM };
  const tc = { attach(g) { tcM.attach(g); }, detach() { tcM.detach(); }, setMode(m) { tcM.setMode(m); }, get dragging() { return tcM.dragging; } };
  for (const t of [tcM]) { t.addEventListener("dragging-changed", e => { orbit.enabled = !e.value; if (!e.value && sel) { leerGrupo(); rehacer(); } }); t.addEventListener("objectChange", () => { if (sel) { leerGrupo(); pintarCampos(); } }); }
  let sel = null;
  const grupoDe = id => E.escenaEd.get(id)?.g;
  const leerGrupo = () => { const g = grupoDe(sel.id); if (!g) return; sel.p = g.position.toArray().map(v => +v.toFixed(2));
    if ((sel.tipo === "objeto" || sel.tipo === "mundo")) { sel.r = [g.rotation.x, g.rotation.y, g.rotation.z].map(v => +(v * 180 / Math.PI).toFixed(1)); sel.s = g.scale.toArray().map(v => +v.toFixed(3)); } };
  const rehacer = () => { const g = E.ponerEd(sel); if (g) tc.attach(g); guardar(sel); };
  const seleccionar = it => {
    sel = it; $("sel").hidden = !it; if (!it) { tc.detach(); return; }
    const g = grupoDe(it.id); if (g) tc.attach(g);
    const mundo = it.tipo === "mundo", obj = it.tipo === "objeto" || mundo; $("modos").hidden = !obj; $("filaRot").hidden = !obj; $("filaEsc").hidden = !obj; $("filaObj").hidden = it.tipo !== "objeto"; $("filaMundo").hidden = !mundo; $("ayudaMapa").hidden = false;
    $("filaNiebla").hidden = it.tipo !== "niebla"; $("filaNota").hidden = it.tipo !== "nota";
    if (!obj) tc.setMode("translate");
    $("selNombre").textContent = it.tipo === "niebla" ? "Niebla" : it.tipo === "nota" ? "Nota para Claude" : it.tipo === "mundo" ? "Pieza del mundo" + (it.oculto ? " (oculta)" : "") : (catalogo.find(c => c.id === it.modelo)?.nombre || it.modelo);
    pintarCampos();
  };
  const campos = { px: ["p", 0], py: ["p", 1], pz: ["p", 2], rx: ["r", 0], ry: ["r", 1], rz: ["r", 2], sx: ["s", 0], sy: ["s", 1], sz: ["s", 2] };
  const pintarCampos = () => {
    if (!sel) return;
    for (const [k, [c, i]] of Object.entries(campos)) if (sel[c] && document.activeElement !== $(k)) $(k).value = sel[c][i];
    $("ocultoMundo").checked = !!sel.oculto; $("col").checked = sel.colision !== false; $("nieve").checked = !!sel.nieve; $("usaTinte").checked = !!sel.tinte; if (sel.tinte) $("tinte").value = sel.tinte;
    $("nRadio").value = sel.radio ?? 8; $("nAlto").value = sel.alto ?? 1.5; $("nDens").value = sel.densidad ?? 0.5; $("nColor").value = sel.color || "#efe6ee"; $("nota").value = sel.texto || "";
  };
  for (const [k, [c, i]] of Object.entries(campos)) $(k).addEventListener("change", () => { if (!sel || !sel[c]) return; const v = parseFloat($(k).value); if (!isFinite(v)) return; sel[c][i] = v; rehacer(); });
  $("col").onchange = () => { sel.colision = $("col").checked; rehacer(); };
  $("nieve").onchange = () => { sel.nieve = $("nieve").checked; rehacer(); };
  $("usaTinte").onchange = () => { sel.tinte = $("usaTinte").checked ? $("tinte").value : null; rehacer(); };
  $("tinte").onchange = () => { if ($("usaTinte").checked) { sel.tinte = $("tinte").value; rehacer(); } };
  [["nRadio", "radio"], ["nAlto", "alto"], ["nDens", "densidad"]].forEach(([k, c]) => $(k).addEventListener("change", () => { const v = parseFloat($(k).value); if (isFinite(v)) { sel[c] = v; rehacer(); } }));
  $("nColor").onchange = () => { sel.color = $("nColor").value; rehacer(); };
  $("nota").addEventListener("input", () => { sel.texto = $("nota").value; guardar(sel); });
  document.querySelectorAll("#modos button").forEach(b => b.onclick = () => modo(b.dataset.modo));
  const modo = m => { tc.setMode(m); document.querySelectorAll("#modos button").forEach(b => b.classList.toggle("activo", b.dataset.modo === m)); };
  const nuevoId = () => "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  $("dup").onclick = () => { if (!sel) return; const it = JSON.parse(JSON.stringify(sel)); it.id = nuevoId(); it.p[0] += 2; it.p[2] += 2; items.set(it.id, it); E.ponerEd(it); guardar(it); seleccionar(it); };
  const borrar = () => { if (!sel) return; if (sel.tipo === "mundo") { sel.oculto = true; rehacer(); seleccionar(null); return; }   /* (las del mundo se ocultan; «Devolver a su sitio» las recupera) */
    const id = sel.id; historial.push({ id, antes: ultimo.get(id) ?? copia(sel) }); ultimo.delete(id); seleccionar(null); E.quitarEd(id); items.delete(id); borrarDato(id); };
  $("borrar").onclick = borrar;
  const deshacer = () => { const h = historial.pop(); if (!h) { aviso("No hay nada que deshacer."); setTimeout(() => aviso(""), 2000); return; } seleccionar(null);
    if (!h.antes) { E.quitarEd(h.id); items.delete(h.id); ultimo.delete(h.id); borrarDato(h.id); }
    else { const it = copia(h.antes); items.set(it.id, it); ultimo.set(it.id, copia(it)); E.ponerEd(it); guardar(it, true); }
    estado("Deshecho"); };
  $("deshacer").onclick = deshacer;
  $("restaurar").onclick = () => { if (!sel || sel.tipo !== "mundo") return; const id = sel.id; historial.push({ id, antes: ultimo.get(id) ?? copia(sel) }); ultimo.delete(id); seleccionar(null); E.quitarEd(id); items.delete(id); borrarDato(id); };
  $("ocultoMundo").onchange = () => { sel.oculto = $("ocultoMundo").checked; rehacer(); };
  function atajo(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); deshacer(); return; }
    if (e.key === "Escape") { colocando = null; aviso(""); pintarLista(); seleccionar(null); }
    if (!sel || !(sel.tipo === "objeto" || sel.tipo === "mundo")) { if ((e.key === "Delete" || e.key === "Backspace") && sel) borrar(); return; }
    if (e.key === "w") modo("translate"); if (e.key === "e") modo("rotate"); if (e.key === "r") modo("scale");
    if (e.key === "Delete" || e.key === "Backspace") borrar();
  }

  // ── Clic en el escenario: colocar o seleccionar ───────────────────────
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  const cajasMundo = new Map();
  const cajaMundo = o => { if (!cajasMundo.has(o)) { let b = null; const suelo = E.sueloMat();
      if (!o.isLight && !o.isCamera && !o.isInstancedMesh && !o.isPoints && !o.isSprite && !o.userData.pivoteEd) { let malla = false, esSuelo = false; o.traverse(m => { if (m.isMesh && !m.isInstancedMesh) { malla = true; if (m.material === suelo) esSuelo = true; } });
        if (malla && !esSuelo) { b = E.cajaReal(o); const t = b.getSize(new THREE.Vector3()); if (b.isEmpty() || Math.max(t.x, t.y, t.z) > 90) b = null; } }
      cajasMundo.set(o, b); } return cajasMundo.get(o); };
  let abajo = null, arrastre = null;
  // Sobre el mapa, con la propia pieza: arrastrar la mueve por el suelo; con Mayús la gira; con Alt la escala.
  const planoA = new THREE.Plane(), ptA = new THREE.Vector3();
  const rayoDe = e => { const r = dom.getBoundingClientRect(); ptr.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(ptr, cam); };
  dom.addEventListener("pointerdown", e => { abajo = [e.clientX, e.clientY];
    if (e.button !== 0 || !sel || colocando || tcM.axis || tcM.dragging) return;
    const g = grupoDe(sel.id); if (!g) return; rayoDe(e);
    const b = g.userData.inst ? E.cajaInstancia(g.userData.inst.m, g.userData.inst.i) : E.cajaReal(g); if (!ray.ray.intersectBox(b, ptA)) return;
    planoA.set(new THREE.Vector3(0, 1, 0), -g.position.y); ray.ray.intersectPlane(planoA, ptA);
    arrastre = { g, modo: e.shiftKey ? "girar" : e.altKey ? "escalar" : "mover", x0: e.clientX, y0: e.clientY, off: g.position.clone().sub(ptA), rot0: g.rotation.y, esc0: g.scale.clone() };
    orbit.enabled = false; dom.setPointerCapture(e.pointerId); e.preventDefault(); });
  dom.addEventListener("pointermove", e => { if (!arrastre) return; const A = arrastre, g = A.g;
    if (A.modo === "mover") { rayoDe(e); if (ray.ray.intersectPlane(planoA, ptA)) { g.position.x = ptA.x + A.off.x; g.position.z = ptA.z + A.off.z; } }
    else if (A.modo === "girar") g.rotation.y = A.rot0 + (e.clientX - A.x0) * 0.012;
    else g.scale.copy(A.esc0).multiplyScalar(Math.exp(-(e.clientY - A.y0) * 0.006));
    g.updateMatrixWorld(true); leerGrupo(); pintarCampos(); if (g.userData.inst) E.ponerEd(sel); });
  dom.addEventListener("pointerup", () => { if (!arrastre) return; arrastre = null; orbit.enabled = true; leerGrupo(); rehacer(); });
  dom.addEventListener("pointerup", e => {
    if (!abajo || Math.hypot(e.clientX - abajo[0], e.clientY - abajo[1]) > 5 || e.button !== 0 || tc.dragging) return;
    const r = dom.getBoundingClientRect(); ptr.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(ptr, cam);
    if (colocando) {
      const hit = ray.intersectObjects(scene.children.filter(o => o !== tcM && o !== tcR && o.visible), true).find(h => h.object.isMesh && !(h.object.material && h.object.material.transparent && h.object.material.opacity < 0.3));
      if (!hit) return;
      const id = nuevoId(), p = hit.point.toArray().map(v => +v.toFixed(2));
      let it;
      if (colocando === "esp:niebla") it = { id, tipo: "niebla", p, radio: 8, alto: 1.5, densidad: 0.5, color: "#efe6ee" };
      else if (colocando === "esp:nota") it = { id, tipo: "nota", p, texto: "" };
      else { it = { id, tipo: "objeto", modelo: colocando, p, r: [0, 0, 0], s: [1, 1, 1], colision: true };
        const g = E.ponerEd(it); if (g) { const t = E.cajaReal(g).getSize(new THREE.Vector3()), k = +(3 / Math.max(t.x, t.y, t.z, 0.001)).toFixed(3); it.s = [k, k, k]; } }   // (de entrada, unos 3 m)
      items.set(id, it); E.ponerEd(it); guardar(it); seleccionar(it);
      if (!e.shiftKey) { colocando = null; aviso(""); pintarLista(); }   // (con Mayús se siguen colocando)
      return;
    }
    // Todo se elige por su caja (muchas piezas del juego no responden a los rayos): lo ya editado, cada pieza
    // suelta del mundo y cada copia de las mallas instanciadas; gana la más cercana.
    const visible = o => { for (let v = o; v; v = v.parent) if (!v.visible) return false; return true; };
    const entradas = [...E.escenaEd.values()].filter(v => v.g), pt = new THREE.Vector3(); let mejor = null, dm = Infinity;
    const probar = (b, que) => { if (b && !b.isEmpty() && ray.ray.intersectBox(b, pt)) { const d = pt.distanceTo(ray.ray.origin); if (d < dm) { dm = d; mejor = que; } } };
    for (const e of entradas) { if (!e.g.visible && e.it.tipo !== "mundo") continue; probar(e.g.userData.inst ? E.cajaInstancia(e.g.userData.inst.m, e.g.userData.inst.i) : E.cajaReal(e.g), { entrada: e }); }
    for (const u of E.unidadesMundo()) { if (!visible(u) || u.userData.enPivote) continue;
      if (u.isInstancedMesh) { if (u.material === E.sueloMat()) continue; for (let i = 0; i < u.count; i++) { if (entradas.some(e => e.g.userData.inst && e.g.userData.inst.m === u && e.g.userData.inst.i === i)) continue; const b = E.cajaInstancia(u, i), t = b.getSize(pt.clone()); if (Math.max(t.x, t.y, t.z) < 60) probar(b, { m: u, i }); } }
      else probar(cajaMundo(u), { o: u }); }
    if (!mejor) { seleccionar(null); return; }
    if (mejor.entrada) { seleccionar(items.get(mejor.entrada.it.id) || mejor.entrada.it); return; }
    const firma = mejor.o ? E.firmaDe(mejor.o) : E.firmaInstancia(mejor.m, mejor.i), it = { id: (firma.inst ? "mi" : "m") + firma.n + "_" + firma.c.map(v => Math.round(v * 10)).join("_"), tipo: "mundo", firma, p: firma.c.slice(), r: [0, 0, 0], s: [1, 1, 1], oculto: false };
    const ya = items.get(it.id); if (ya) { seleccionar(ya); return; }
    items.set(it.id, it); E.ponerEd(it, mejor.o || { m: mejor.m, i: mejor.i }); seleccionar(it);
  });
  verBloque(bloques[0]);
  // La base de datos se carga aparte: el editor responde desde el principio.
  (async () => {
    let db = null; try { db = window.claude ? await window.claude.use("db") : null; } catch { db = null; }
    col = db ? db.collection("escena") : null;
    if (!col) { estado("Sin guardado: abre esta página desde tu cuenta para que se guarde.", true); return; }
    try { const snap = await col.get(); snap.docs.forEach(d => { const it = { ...d.data(), id: d.id }; items.set(it.id, it); ultimo.set(it.id, copia(it)); E.ponerEd(it); }); estado(`${items.size} piezas · se guarda solo`); }
    catch (e) { estado("No se pudo leer lo guardado: " + (e.message || e.code), true); }
  })();

  // ── Publicar: avisa a Claude, que pasa la escena al juego ─────────────
  let com = null; try { com = window.claude ? await window.claude.use("comments") : null; } catch { com = null; }
  $("publicar").onclick = async () => {
    for (const t of pendientes.values()) clearTimeout(t);
    for (const it of items.values()) { if (!col) break; const { id, ...datos } = it; try { await col.doc(id).set(datos); } catch {} }   // (todo guardado antes de avisar)
    let puede = "off"; try { puede = com ? await com.canSendToClaude() : "off"; } catch {}
    if (puede !== "available") { aviso("Claude no está atento ahora. Escríbele en el chat: «publica la escena del editor»."); setTimeout(() => aviso(""), 7000); return; }
    try { await com.sendToClaude({ anchor: await com.anchorFor($("publicar")), text: `Publica la escena del editor en el juego (${items.size} piezas).` }); aviso("Enviado a Claude: en unos minutos estará en el juego."); }
    catch (e) { aviso("No se pudo enviar: " + (e.message || e.code) + ". Escríbele en el chat: «publica la escena del editor»."); }
    setTimeout(() => aviso(""), 7000);
  };

})();
