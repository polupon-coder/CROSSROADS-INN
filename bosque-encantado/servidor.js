'use strict';
// Servidor de BOSQUE ENCANTADO. Sirve la web (carpeta publico/) y lleva las partidas en
// memoria. Él aplica las reglas (motor.js) y mueve a los jugadores máquina; cada pantalla
// recibe en directo (Server-Sent Events) solo lo que su jugador puede ver. Sin dependencias.
// Uso: node servidor.js   (puerto: variable PORT, por defecto 3000)
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const M = require('./motor');

const PUERTO = Number(process.env.PORT) || 3000;
const PUBLICO = path.join(__dirname, 'publico');
const CADUCA = 6 * 60 * 60 * 1000; // las salas se borran tras seis horas sin movimiento
const PAUSA_MAQUINA = Number(process.env.PAUSA_MAQUINA ?? 1100); // ms que «piensa» la máquina
const PAUSA_RONDA = 12000; // ms entre el final de una ronda y el reparto de la siguiente
const NOMBRES_MAQUINA = ['Búho', 'Zorro', 'Ardilla', 'Ciervo', 'Tejón', 'Liebre', 'Erizo', 'Cuervo'];
// Las brujas que se pueden elegir (publico/personajes/). Con seis jugadores, una se repite.
const PERSONAJES = ['pelirroja', 'rubia', 'verde', 'azul', 'blanca'];

const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.ttf': 'font/ttf', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg', '.md': 'text/markdown; charset=utf-8',
};

// ---------- Salas ----------
// sala: { codigo, anfitrion (id), asientos: [{ id, token, nombre, maquina, oyentes:Set }],
//         opciones, partida (motor) | null, temporizador, t }
const salas = new Map();

const nuevoCodigo = () => {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let c;
  do c = Array.from({ length: 5 }, () => letras[crypto.randomInt(letras.length)]).join('');
  while (salas.has(c));
  return c;
};
const nuevoToken = () => crypto.randomBytes(18).toString('base64url');
const limpiarNombre = (s) => String(s ?? '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 18);

// La primera bruja libre o, si están todas cogidas, la menos repetida.
function personajeLibre(sala) {
  const usos = (p) => sala.asientos.filter((a) => a.personaje === p).length;
  return PERSONAJES.slice().sort((a, b) => usos(a) - usos(b))[0];
}

function asientoMaquina(sala) {
  const usados = new Set(sala.asientos.map((a) => a.nombre));
  const nombre = NOMBRES_MAQUINA.find((n) => !usados.has(n)) || `Bot ${sala.asientos.length + 1}`;
  return { id: nuevoToken(), token: null, nombre, maquina: true, personaje: personajeLibre(sala), oyentes: new Set() };
}

// Lo que ve cada jugador: todo lo público y solo su propia mano.
function vista(sala, yo) {
  const p = sala.partida;
  const idx = sala.asientos.findIndex((a) => a.id === yo);
  const v = {
    codigo: sala.codigo,
    yo: idx,
    anfitrion: sala.asientos.findIndex((a) => a.id === sala.anfitrion),
    opciones: sala.opciones,
    asientos: sala.asientos.map((a) => ({ nombre: a.nombre, maquina: a.maquina, personaje: a.personaje, conectado: a.maquina || a.oyentes.size > 0 })),
    partida: null,
  };
  if (!p) return v;
  v.partida = {
    ronda: p.ronda,
    fase: p.fase,
    turno: p.turno,
    mesa: p.mesa,
    descartes: p.descartes,
    revolucion: p.revolucion,
    abreConTres: p.abreConTres,
    orden: p.orden,
    ultimaRonda: p.ultimaRonda,
    ganador: p.ganador,
    clasificacion: p.clasificacion ?? null,
    proximaRonda: sala.proximaRonda ?? null,
    jugadores: p.jugadores.map((j) => ({ cartas: j.mano.length, pasado: j.pasado, puntos: j.puntos, rango: j.rango })),
    mano: idx >= 0 ? p.jugadores[idx].mano : [],
    // De los intercambios, cada uno ve qué cartas exactas dio y recibió; del resto, cuántas.
    intercambios: p.intercambios.map((e) => ({ de: e.de, a: e.a, cartas: e.de === idx || e.a === idx ? e.cartas : e.cartas.length })),
    registro: p.registro.slice(-30),
  };
  return v;
}

function difundir(sala) {
  sala.t = Date.now();
  for (const a of sala.asientos) {
    if (!a.oyentes.size) continue;
    const datos = `data: ${JSON.stringify(vista(sala, a.id))}\n\n`;
    for (const res of a.oyentes) res.write(datos);
  }
}

// Tras cada cambio: si le toca a una máquina, juega tras una pausa; si acabó la ronda,
// la siguiente se reparte sola al cabo de unos segundos.
function programar(sala) {
  clearTimeout(sala.temporizador);
  sala.proximaRonda = null;
  const p = sala.partida;
  if (!p) return;
  if (p.fase === 'finRonda') {
    sala.proximaRonda = Date.now() + PAUSA_RONDA;
    sala.temporizador = setTimeout(() => { M.siguienteRonda(p); programar(sala); difundir(sala); }, PAUSA_RONDA);
    return;
  }
  if (p.fase !== 'jugando' || !sala.asientos[p.turno].maquina) return;
  sala.temporizador = setTimeout(() => {
    const cartas = M.jugadaMaquina(p, p.turno);
    if (!cartas || M.jugar(p, p.turno, cartas)) M.pasar(p, p.turno);
    programar(sala);
    difundir(sala);
  }, PAUSA_MAQUINA);
}

function accion(sala, asiento, a) {
  const idx = sala.asientos.indexOf(asiento);
  const esAnfitrion = asiento.id === sala.anfitrion;
  const p = sala.partida;
  switch (a.tipo) {
    case 'personaje': {
      // Antes de empezar, cada uno elige su bruja entre las que no tiene otro.
      if (p || !PERSONAJES.includes(a.personaje)) return 'personaje';
      if (sala.asientos.some((o) => o !== asiento && o.personaje === a.personaje)) return 'cogido';
      asiento.personaje = a.personaje;
      return null;
    }
    case 'maquina': {
      if (!esAnfitrion || p) return 'anfitrion';
      if (sala.asientos.length >= M.MAX_JUGADORES) return 'llena';
      sala.asientos.push(asientoMaquina(sala));
      return null;
    }
    case 'quitar': {
      // Antes de empezar, el anfitrión puede quitar un asiento (máquina o persona).
      if (!esAnfitrion || p) return 'anfitrion';
      const k = Number(a.asiento);
      if (!(k >= 0 && k < sala.asientos.length) || sala.asientos[k].id === sala.anfitrion) return 'asiento';
      const [fuera] = sala.asientos.splice(k, 1);
      for (const res of fuera.oyentes) res.end();
      return null;
    }
    case 'empezar': {
      if (!esAnfitrion || p) return 'anfitrion';
      if (sala.asientos.length < M.MIN_JUGADORES) return 'pocos';
      sala.partida = M.nuevaPartida(sala.asientos, sala.opciones);
      return null;
    }
    case 'jugar': return p ? M.jugar(p, idx, Array.isArray(a.cartas) ? a.cartas.map(Number) : []) : 'fase';
    case 'pasar': return p ? M.pasar(p, idx) : 'fase';
    case 'siguienteRonda': {
      if (!esAnfitrion || !p) return 'anfitrion';
      return M.siguienteRonda(p);
    }
    case 'sustituir': {
      // El anfitrión puede pasar a la máquina el asiento de alguien que se ha ido.
      if (!esAnfitrion) return 'anfitrion';
      const otro = sala.asientos[Number(a.asiento)];
      if (!otro || otro.maquina || otro.oyentes.size) return 'asiento';
      otro.maquina = true;
      otro.token = null;
      return null;
    }
    case 'revancha': {
      if (!esAnfitrion || !p || p.fase !== 'finPartida') return 'anfitrion';
      sala.partida = M.nuevaPartida(sala.asientos, sala.opciones);
      return null;
    }
    default: return 'accion';
  }
}

setInterval(() => {
  const ahora = Date.now();
  for (const [c, s] of salas) {
    if (ahora - s.t > CADUCA) { clearTimeout(s.temporizador); salas.delete(c); }
  }
}, 30 * 60 * 1000).unref();

// ---------- HTTP ----------
function leerJson(req) {
  return new Promise((ok, mal) => {
    let n = 0;
    const trozos = [];
    req.on('data', (c) => {
      n += c.length;
      if (n > 10000) { mal(new Error('demasiado grande')); req.destroy(); } else trozos.push(c);
    });
    req.on('end', () => { try { ok(JSON.parse(Buffer.concat(trozos).toString('utf8') || '{}')); } catch (e) { mal(e); } });
    req.on('error', mal);
  });
}

const json = (res, codigo, obj) => {
  res.writeHead(codigo, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
};

function servirArchivo(res, ruta) {
  const archivo = path.normalize(path.join(PUBLICO, ruta));
  if (!archivo.startsWith(PUBLICO + path.sep)) return json(res, 404, { error: 'no existe' });
  fs.readFile(archivo, (err, datos) => {
    if (err) return json(res, 404, { error: 'no existe' });
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(archivo)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(datos);
  });
}

const buscar = (codigo, token) => {
  const sala = salas.get(String(codigo || '').toUpperCase());
  const asiento = sala && token ? sala.asientos.find((a) => a.token === token) : null;
  return { sala, asiento };
};

const servidor = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  try {
    if (url.pathname === '/healthz') return json(res, 200, { ok: true });

    if (req.method === 'POST' && url.pathname === '/api/crear') {
      const { nombre } = await leerJson(req);
      if (!limpiarNombre(nombre)) return json(res, 400, { error: 'nombre' });
      const codigo = nuevoCodigo();
      const asiento = { id: nuevoToken(), token: nuevoToken(), nombre: limpiarNombre(nombre), maquina: false, personaje: PERSONAJES[0], oyentes: new Set() };
      salas.set(codigo, { codigo, anfitrion: asiento.id, asientos: [asiento], opciones: {}, partida: null, t: Date.now() });
      return json(res, 200, { codigo, token: asiento.token });
    }

    if (req.method === 'POST' && url.pathname === '/api/unirse') {
      const { codigo, nombre } = await leerJson(req);
      const { sala } = buscar(codigo);
      if (!sala) return json(res, 404, { error: 'sala' });
      if (sala.partida) return json(res, 409, { error: 'empezada' });
      if (sala.asientos.length >= M.MAX_JUGADORES) return json(res, 409, { error: 'llena' });
      if (!limpiarNombre(nombre)) return json(res, 400, { error: 'nombre' });
      const asiento = { id: nuevoToken(), token: nuevoToken(), nombre: limpiarNombre(nombre), maquina: false, personaje: personajeLibre(sala), oyentes: new Set() };
      sala.asientos.push(asiento);
      difundir(sala);
      return json(res, 200, { codigo: sala.codigo, token: asiento.token });
    }

    if (req.method === 'GET' && url.pathname === '/api/escuchar') {
      const { sala, asiento } = buscar(url.searchParams.get('sala'), url.searchParams.get('token'));
      if (!asiento) return json(res, 404, { error: 'sala' });
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
      asiento.oyentes.add(res);
      difundir(sala); // los demás ven que se ha conectado
      const latido = setInterval(() => res.write(': latido\n\n'), 25000);
      req.on('close', () => {
        clearInterval(latido);
        asiento.oyentes.delete(res);
        if (salas.has(sala.codigo)) difundir(sala);
      });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/accion') {
      const a = await leerJson(req);
      const { sala, asiento } = buscar(a.sala, a.token);
      if (!asiento) return json(res, 404, { error: 'sala' });
      const error = accion(sala, asiento, a);
      if (error) return json(res, 400, { error });
      programar(sala);
      difundir(sala);
      return json(res, 200, { ok: true });
    }

    if (req.method === 'GET') {
      const ruta = url.pathname === '/' || url.pathname === '/en' ? '/index.html' : decodeURIComponent(url.pathname);
      return servirArchivo(res, ruta);
    }
    json(res, 404, { error: 'no existe' });
  } catch (e) {
    json(res, 400, { error: String(e.message || e) });
  }
});

if (require.main === module) servidor.listen(PUERTO, () => console.log(`BOSQUE ENCANTADO escuchando en el puerto ${PUERTO}`));
module.exports = { servidor, salas };
