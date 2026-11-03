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
    for (const o of scene.children) { if (o === tc || propios.has(o) || o.isLight || o.isCamera) continue; const c = cajaDe(o); if (!c) continue; o.visible = b === bloques[0] || (c[1] > hasta - 15 && c[0] < desde + 15); }
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
  let db = null;
  try { db = window.claude ? await window.claude.use("db") : null; } catch { db = null; }
  const col = db ? db.collection("escena") : null;
  if (!col) estado("Sin guardado: abre esta página desde tu cuenta para que se guarde.", true);
  if (col) {
    try { const snap = await col.get(); snap.docs.forEach(d => { const it = { ...d.data(), id: d.id }; items.set(it.id, it); E.ponerEd(it); }); estado(`${items.size} piezas cargadas · se guarda solo`); }
    catch (e) { estado("No se pudo leer lo guardado: " + (e.message || e.code), true); }
  }
  const pendientes = new Map();
  const guardar = it => {
    if (!col) return; clearTimeout(pendientes.get(it.id));
    pendientes.set(it.id, setTimeout(async () => { try { const { id, ...datos } = it; await col.doc(id).set(datos); estado("Guardado"); } catch (e) { estado("No se guardó: " + (e.message || e.code), true); } }, 350));
  };
  const borrarDato = async id => { if (!col) return; try { await col.doc(id).delete(); estado("Borrado"); } catch (e) { estado("No se borró: " + (e.message || e.code), true); } };

  // ── Piezas disponibles ────────────────────────────────────────────────
  const catalogo = [{ id: "esp:niebla", nombre: "Niebla", grupo: "Especial" }, { id: "esp:nota", nombre: "Nota para Claude", grupo: "Especial" }];
  Object.keys(E.MODELOS).forEach(n => catalogo.push({ id: "gltf:" + n, nombre: n.replace(/_/g, " "), grupo: "Modelos" }));
  Object.entries(E.KITS).forEach(([n, kit]) => kit.forEach((_, i) => catalogo.push({ id: `kit:${n}:${i}`, nombre: `${n} ${i + 1}`, grupo: "Piezas" })));
  let colocando = null;
  const pintarLista = () => {
    const q = $("buscar").value.trim().toLowerCase(), l = $("lista"); l.textContent = "";
    catalogo.filter(c => !q || c.nombre.includes(q)).forEach(c => { const b = document.createElement("button"); b.textContent = c.nombre; b.title = c.grupo; if (colocando === c.id) b.classList.add("activo");
      b.onclick = () => { colocando = colocando === c.id ? null : c.id; aviso(colocando ? `Haz clic en el escenario para colocar «${c.nombre}». Esc para cancelar.` : ""); pintarLista(); }; l.appendChild(b); });
  };
  $("buscar").oninput = pintarLista; pintarLista();

  // ── Selección y gizmo ─────────────────────────────────────────────────
  const tc = new THREE.TransformControls(cam, dom); scene.add(tc);
  tc.addEventListener("dragging-changed", e => { orbit.enabled = !e.value; if (!e.value && sel) { leerGrupo(); rehacer(); } });
  tc.addEventListener("objectChange", () => { if (sel) { leerGrupo(); pintarCampos(); } });
  let sel = null;
  const grupoDe = id => E.escenaEd.get(id)?.g;
  const leerGrupo = () => { const g = grupoDe(sel.id); if (!g) return; sel.p = g.position.toArray().map(v => +v.toFixed(2));
    if (sel.tipo === "objeto") { sel.r = [g.rotation.x, g.rotation.y, g.rotation.z].map(v => +(v * 180 / Math.PI).toFixed(1)); sel.s = g.scale.toArray().map(v => +v.toFixed(3)); } };
  const rehacer = () => { const g = E.ponerEd(sel); if (g) tc.attach(g); guardar(sel); };
  const seleccionar = it => {
    sel = it; $("sel").hidden = !it; if (!it) { tc.detach(); return; }
    const g = grupoDe(it.id); if (g) tc.attach(g);
    const obj = it.tipo === "objeto"; $("modos").hidden = !obj; $("filaRot").hidden = !obj; $("filaEsc").hidden = !obj; $("filaObj").hidden = !obj;
    $("filaNiebla").hidden = it.tipo !== "niebla"; $("filaNota").hidden = it.tipo !== "nota";
    if (!obj) tc.setMode("translate");
    $("selNombre").textContent = it.tipo === "niebla" ? "Niebla" : it.tipo === "nota" ? "Nota para Claude" : (catalogo.find(c => c.id === it.modelo)?.nombre || it.modelo);
    pintarCampos();
  };
  const campos = { px: ["p", 0], py: ["p", 1], pz: ["p", 2], rx: ["r", 0], ry: ["r", 1], rz: ["r", 2], sx: ["s", 0], sy: ["s", 1], sz: ["s", 2] };
  const pintarCampos = () => {
    if (!sel) return;
    for (const [k, [c, i]] of Object.entries(campos)) if (sel[c] && document.activeElement !== $(k)) $(k).value = sel[c][i];
    $("col").checked = sel.colision !== false; $("nieve").checked = !!sel.nieve; $("usaTinte").checked = !!sel.tinte; if (sel.tinte) $("tinte").value = sel.tinte;
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
  const borrar = () => { if (!sel) return; const id = sel.id; seleccionar(null); E.quitarEd(id); items.delete(id); borrarDato(id); };
  $("borrar").onclick = borrar;
  function atajo(e) {
    if (e.key === "Escape") { colocando = null; aviso(""); pintarLista(); seleccionar(null); }
    if (!sel || sel.tipo !== "objeto") { if ((e.key === "Delete" || e.key === "Backspace") && sel) borrar(); return; }
    if (e.key === "w") modo("translate"); if (e.key === "e") modo("rotate"); if (e.key === "r") modo("scale");
    if (e.key === "Delete" || e.key === "Backspace") borrar();
  }

  // ── Clic en el escenario: colocar o seleccionar ───────────────────────
  const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
  let abajo = null;
  dom.addEventListener("pointerdown", e => { abajo = [e.clientX, e.clientY]; });
  dom.addEventListener("pointerup", e => {
    if (!abajo || Math.hypot(e.clientX - abajo[0], e.clientY - abajo[1]) > 5 || e.button !== 0 || tc.dragging) return;
    const r = dom.getBoundingClientRect(); ptr.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(ptr, cam);
    if (colocando) {
      const hit = ray.intersectObjects(scene.children.filter(o => o !== tc && o.visible), true).find(h => h.object.isMesh && !(h.object.material && h.object.material.transparent && h.object.material.opacity < 0.3));
      if (!hit) return;
      const id = nuevoId(), p = hit.point.toArray().map(v => +v.toFixed(2));
      let it;
      if (colocando === "esp:niebla") it = { id, tipo: "niebla", p, radio: 8, alto: 1.5, densidad: 0.5, color: "#efe6ee" };
      else if (colocando === "esp:nota") it = { id, tipo: "nota", p, texto: "" };
      else { it = { id, tipo: "objeto", modelo: colocando, p, r: [0, 0, 0], s: [1, 1, 1], colision: true };
        const g = E.ponerEd(it); if (g) { const t = new THREE.Box3().setFromObject(g).getSize(new THREE.Vector3()), k = +(3 / Math.max(t.x, t.y, t.z, 0.001)).toFixed(3); it.s = [k, k, k]; } }   // (de entrada, unos 3 m)
      items.set(id, it); E.ponerEd(it); guardar(it); seleccionar(it);
      if (!e.shiftKey) { colocando = null; aviso(""); pintarLista(); }   // (con Mayús se siguen colocando)
      return;
    }
    const grupos = [...E.escenaEd.values()].filter(v => v.g).map(v => v.g);
    const hit = ray.intersectObjects(grupos, true)[0];
    if (!hit) { seleccionar(null); return; }
    let o = hit.object; while (o.parent && !grupos.includes(o)) o = o.parent;
    const entrada = [...E.escenaEd.values()].find(v => v.g === o); if (entrada) seleccionar(items.get(entrada.it.id) || entrada.it);
  });
  if (col) estado(`${items.size} piezas · se guarda solo`);
  verBloque(bloques[0]);

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
