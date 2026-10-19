'use strict';
// Motor de BOSQUE ENCANTADO: el Capitalista de cartas (también llamado Presidente o Culo).
// Las reglas están en REGLAS.md. Este archivo no sabe nada de pantallas ni de red: recibe
// jugadas, comprueba que son válidas y cambia el estado de la partida.
//
// La baraja del bosque tiene 48 cartas, del 1 al 12, cuatro de cada número, con dibujos
// distintos (a, b, c, d) pero sin palos que cuenten. Los monstruos grandes son los más
// difíciles de quitarse de encima: el 12 es la carta más baja y el 1 la más alta.
// Cada carta es un número de 0 a 47: valor = n >> 2 es su fuerza (0 = la más baja, el 12;
// … 11 = la más alta, el 1) y copia = n & 3. VALORES da el número impreso de cada fuerza.
// La carta 3 (el 12 «d», el dragón rojo) abre la primera ronda.
//
// Una de las cartas es comodín: la 44 (el 1 «a»), el Espíritu del Bosque, la niña de hojas
// de la portada.
// Gana a todo: se lanza sola, sobre cualquier jugada (una carta, pareja, trío o cuatro), y
// limpia la mesa. No vale para abrir la primera ronda, que tiene que llevar el dragón rojo.

const VALORES = ['12', '11', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1'];
const PALOS = ['a', 'b', 'c', 'd'];
const CARTAS = VALORES.length * PALOS.length;
const MAXIMO = VALORES.length - 1; // fuerza de la carta más alta
const COMODIN = MAXIMO * 4; // el 1 «a»: el Espíritu del Bosque
const TOTAL = CARTAS; // cartas que se reparten (el comodín es una de ellas)
const TRES_DE_TREBOLES = 3; // la carta que abre la primera ronda: el dragón rojo (12 «d»)
const MIN_JUGADORES = 4;
const MAX_JUGADORES = 6;
const META = 10; // puntos para ganar la partida
// Puntos de cada ronda: 2 la Bruja Suprema, 1 la Alta Bruja y 0 las demás.
const PUNTOS_RANGO = { capitalista: 2, vicepresidente: 1 };

const valor = (c) => c >> 2;
const palo = (c) => c & 3;
const esComodin = (c) => c === COMODIN;
const nombreCarta = (c) => (esComodin(c) ? '★' : VALORES[valor(c)] + PALOS[palo(c)]);

// Fuerza de un valor según el orden vigente: con revolución se invierte.
const fuerza = (v, revolucion) => (revolucion ? MAXIMO - v : v);

// Rango de cada posición final, según el número de jugadores (tabla de REGLAS.md).
function rangos(n) {
  return Array.from({ length: n }, (_, i) => {
    if (i === 0) return 'capitalista';
    if (i === 1) return 'vicepresidente';
    if (i === n - 1) return 'culo';
    if (i === n - 2) return 'viceculo';
    return 'ciudadano';
  });
}

function barajar(cartas, azar = Math.random) {
  const b = cartas.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(azar() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

// De menor a mayor, con el comodín el último (es la carta más alta de todas).
const ordenarMano = (mano) => mano.sort((a, b) => (a === COMODIN) - (b === COMODIN) || a - b);

// ---------- Partida ----------

// jugadores: [{ nombre }]. La revolución forma parte siempre del juego y la partida acaba al
// final de la ronda en que alguien llega a la meta de puntos (10). opciones: { meta: 10 }.
function nuevaPartida(jugadores, opciones = {}, azar = Math.random) {
  const n = jugadores.length;
  if (n < MIN_JUGADORES || n > MAX_JUGADORES) throw new Error(`Hacen falta de ${MIN_JUGADORES} a ${MAX_JUGADORES} jugadores`);
  const p = {
    opciones: { meta: opciones.meta ?? META, revolucion: opciones.revolucion ?? true },
    jugadores: jugadores.map((j) => ({ nombre: j.nombre, mano: [], pasado: false, puntos: 0, rango: null })),
    ronda: 0,
    fase: 'jugando', // intercambio | jugando | finRonda | finPartida
    mesa: null, // { cartas, valor, cantidad, jugador }: el último grupo jugado
    debajo: [], // las jugadas anteriores de esta mesa (la última al final), para enseñarlas debajo
    descartes: 0, // cartas retiradas del centro en esta ronda
    turno: 0,
    ultimo: null, // quién hizo la última jugada de la mesa actual
    revolucion: false,
    abreConTres: false, // primera ronda: la primera jugada lleva el espíritu de hojas (carta 0)
    orden: [], // índices de jugadores en el orden en que se quedan sin cartas
    ultimaRonda: null, // { orden, puntos } de la ronda anterior
    intercambios: [], // [{ de, a, cartas }] hechos al empezar la ronda
    ofertas: [], // en la fase de intercambio: [{ de, a, n, cartas }] lo que eligen las brujas altas
    registro: [], // sucesos para mostrar: { tipo, … }
    ganador: null,
  };
  empezarRonda(p, azar);
  return p;
}

function anotar(p, suceso) {
  p.registro.push(suceso);
  if (p.registro.length > 60) p.registro.splice(0, p.registro.length - 60);
}

function empezarRonda(p, azar = Math.random) {
  const n = p.jugadores.length;
  p.ronda += 1;
  p.fase = 'jugando';
  p.mesa = null;
  p.debajo = [];
  p.descartes = 0;
  p.ultimo = null;
  p.revolucion = false;
  p.orden = [];
  p.intercambios = [];
  p.ofertas = [];
  for (const j of p.jugadores) { j.mano = []; j.pasado = false; }

  // Reparte toda la baraja de una en una, empezando por la izquierda de quien da.
  // En la primera ronda da cualquiera; después, el Culo.
  const reparte = p.ronda === 1 ? Math.floor(azar() * n) : p.jugadores.findIndex((j) => j.rango === 'culo');
  const mazo = barajar([...Array(TOTAL).keys()], azar);
  mazo.forEach((c, i) => p.jugadores[(reparte + 1 + i) % n].mano.push(c));
  for (const j of p.jugadores) ordenarMano(j.mano);

  if (p.ronda === 1) {
    p.abreConTres = true;
    p.turno = p.jugadores.findIndex((j) => j.mano.includes(TRES_DE_TREBOLES));
    anotar(p, { tipo: 'ronda', ronda: p.ronda, abre: p.turno });
  } else {
    // Antes de jugar, la Bruja Suprema y la Alta Bruja eligen qué cartas dan (ofrecer).
    p.abreConTres = false;
    p.fase = 'intercambio';
    const quien = (r) => p.jugadores.findIndex((j) => j.rango === r);
    for (const [alto, bajo, k] of [['capitalista', 'culo', 2], ['vicepresidente', 'viceculo', 1]]) {
      const a = quien(alto);
      const b = quien(bajo);
      if (a >= 0 && b >= 0) p.ofertas.push({ de: a, a: b, n: k, cartas: null });
    }
    p.turno = quien('capitalista');
    if (!p.ofertas.length) empezarJuego(p);
  }
}

// Una bruja alta elige las cartas que da a la baja. Cuando han elegido todas, se hace el
// intercambio y empieza el juego.
function ofrecer(p, i, cartas) {
  if (p.fase !== 'intercambio') return 'fase';
  const o = p.ofertas.find((x) => x.de === i && !x.cartas);
  if (!o) return 'turno';
  if (!Array.isArray(cartas) || cartas.length !== o.n || new Set(cartas).size !== o.n) return 'cantidad';
  if (!cartas.every((c) => p.jugadores[i].mano.includes(c))) return 'noTienes';
  o.cartas = cartas.slice().sort((a, b) => a - b);
  if (p.ofertas.every((x) => x.cartas)) { intercambiar(p); empezarJuego(p); }
  return null;
}

function empezarJuego(p) {
  p.fase = 'jugando';
  p.turno = p.jugadores.findIndex((j) => j.rango === 'capitalista');
  anotar(p, { tipo: 'ronda', ronda: p.ronda, abre: p.turno });
}

// Intercambio obligatorio, sobre la mano recién repartida y a la vez: las brujas bajas dan
// sus cartas más altas (las últimas de la mano ordenada, con el comodín el primero; la
// revolución no cuenta, cada ronda empieza con el orden normal) y las altas, las que eligieron.
function intercambiar(p) {
  const entregas = [];
  for (const o of p.ofertas) {
    entregas.push({ de: o.a, a: o.de, cartas: p.jugadores[o.a].mano.slice(-o.n) });
    entregas.push({ de: o.de, a: o.a, cartas: o.cartas });
  }
  for (const e of entregas) {
    const de = p.jugadores[e.de];
    de.mano = de.mano.filter((c) => !e.cartas.includes(c));
  }
  for (const e of entregas) p.jugadores[e.a].mano.push(...e.cartas);
  for (const j of p.jugadores) ordenarMano(j.mano);
  p.intercambios = entregas;
}

const conCartas = (p, i) => p.jugadores[i].mano.length > 0;

// Siguiente jugador en sentido horario (después de «desde») que cumple la condición.
function siguiente(p, desde, cumple) {
  const n = p.jugadores.length;
  for (let k = 1; k <= n; k++) {
    const i = (desde + k) % n;
    if (cumple(i)) return i;
  }
  return -1;
}

// ¿Es válido jugar estas cartas ahora? Devuelve null si sí, o el motivo si no.
function motivoInvalida(p, i, cartas) {
  if (p.fase !== 'jugando') return 'fase';
  if (p.turno !== i) return 'turno';
  if (!Array.isArray(cartas) || cartas.length < 1 || cartas.length > 4) return 'cantidad';
  if (new Set(cartas).size !== cartas.length) return 'repetidas';
  const mano = p.jugadores[i].mano;
  if (!cartas.every((c) => mano.includes(c))) return 'noTienes';
  if (cartas.some(esComodin)) {
    // El comodín va solo y vale sobre cualquier jugada; solo no puede abrir la primera ronda.
    if (cartas.length !== 1) return 'comodinSolo';
    if (!p.mesa && p.abreConTres) return 'tresDeTreboles';
    return null;
  }
  const v = valor(cartas[0]);
  if (!cartas.every((c) => valor(c) === v)) return 'mismoValor';
  if (p.mesa) {
    if (cartas.length !== p.mesa.cantidad) return 'mismaCantidad';
    if (fuerza(v, p.revolucion) <= fuerza(p.mesa.valor, p.revolucion)) return 'superior';
  } else if (p.abreConTres && !cartas.includes(TRES_DE_TREBOLES)) {
    return 'tresDeTreboles';
  }
  return null;
}

function jugar(p, i, cartas) {
  const motivo = motivoInvalida(p, i, cartas);
  if (motivo) return motivo;
  const j = p.jugadores[i];
  j.mano = j.mano.filter((c) => !cartas.includes(c));
  if (p.mesa) { p.descartes += p.mesa.cartas.length; p.debajo = p.debajo.concat([p.mesa.cartas]).slice(-2); }
  const comodin = esComodin(cartas[0]);
  const v = valor(cartas[0]);
  p.mesa = { cartas: cartas.slice().sort((a, b) => a - b), valor: v, cantidad: comodin && p.mesa ? p.mesa.cantidad : cartas.length, jugador: i, comodin };
  p.ultimo = i;
  p.abreConTres = false;
  anotar(p, { tipo: 'juega', jugador: i, cartas: p.mesa.cartas });

  if (cartas.length === 4 && !comodin && p.opciones.revolucion) {
    p.revolucion = !p.revolucion;
    anotar(p, { tipo: 'revolucion', jugador: i, activa: p.revolucion });
  }
  if (j.mano.length === 0) {
    p.orden.push(i);
    anotar(p, { tipo: 'termina', jugador: i, posicion: p.orden.length });
  }
  // Solo queda uno con cartas: ocupa el último puesto y se acaba la ronda.
  const quedan = p.jugadores.map((_, k) => k).filter((k) => conCartas(p, k));
  if (quedan.length <= 1) { terminarRonda(p, quedan[0]); return null; }

  // El comodín y la combinación más alta posible no se pueden superar: se limpia la mesa.
  if (comodin || fuerza(v, p.revolucion) === MAXIMO) { limpiar(p); return null; }
  avanzar(p);
  return null;
}

function pasar(p, i) {
  if (p.fase !== 'jugando') return 'fase';
  if (p.turno !== i) return 'turno';
  if (!p.mesa) return 'abres'; // quien abre la mesa tiene que jugar
  p.jugadores[i].pasado = true;
  anotar(p, { tipo: 'pasa', jugador: i });
  avanzar(p);
  return null;
}

// Tras una jugada o un pase: si todos los demás han pasado (o ya no tienen cartas),
// se limpia la mesa; si no, le toca al siguiente que sigue en esta mesa.
function avanzar(p) {
  const siguen = p.jugadores.some((j, k) => k !== p.ultimo && j.mano.length > 0 && !j.pasado);
  if (!siguen) { limpiar(p); return; }
  p.turno = siguiente(p, p.turno, (k) => conCartas(p, k) && !p.jugadores[k].pasado);
}

// Se retira el montón central. Abre quien hizo la última jugada o, si ya se quedó sin
// cartas, el siguiente en sentido horario que todavía tenga (aunque hubiera pasado).
function limpiar(p) {
  p.descartes += p.mesa ? p.mesa.cartas.length : 0;
  p.mesa = null;
  p.debajo = [];
  for (const j of p.jugadores) j.pasado = false;
  p.turno = conCartas(p, p.ultimo) ? p.ultimo : siguiente(p, p.ultimo, (k) => conCartas(p, k));
  anotar(p, { tipo: 'limpia', abre: p.turno });
}

function terminarRonda(p, ultimoEnTerminar) {
  if (ultimoEnTerminar !== undefined) p.orden.push(ultimoEnTerminar);
  const n = p.jugadores.length;
  const nombres = rangos(n);
  const puntos = Array(n).fill(0);
  p.orden.forEach((k, pos) => {
    p.jugadores[k].rango = nombres[pos];
    puntos[k] = PUNTOS_RANGO[nombres[pos]] || 0;
    p.jugadores[k].puntos += puntos[k];
  });
  p.ultimaRonda = { ronda: p.ronda, orden: p.orden.slice(), puntos };
  p.mesa = null;
  p.debajo = [];
  anotar(p, { tipo: 'finRonda', ronda: p.ronda, orden: p.orden.slice() });

  if (p.jugadores.some((j) => j.puntos >= p.opciones.meta)) {
    // Alguien llegó a la meta: gana quien más puntos tenga; en empate, quien quedó mejor en la última ronda.
    const posicion = (k) => p.orden.indexOf(k);
    const clasificacion = p.jugadores.map((_, k) => k)
      .sort((a, b) => p.jugadores[b].puntos - p.jugadores[a].puntos || posicion(a) - posicion(b));
    p.fase = 'finPartida';
    p.ganador = clasificacion[0];
    p.clasificacion = clasificacion;
  } else {
    p.fase = 'finRonda';
  }
}

function siguienteRonda(p, azar = Math.random) {
  if (p.fase !== 'finRonda') return 'fase';
  empezarRonda(p, azar);
  return null;
}

// ---------- Máquina ----------

// Elige la jugada de un jugador máquina: un array de cartas, o null para pasar.
// Juega los grupos más bajos sin romperlos y guarda las cartas altas para el final.
function jugadaMaquina(p, i) {
  const todas = p.jugadores[i].mano;
  const comodin = todas.find(esComodin);
  const mano = todas.filter((c) => !esComodin(c));
  const rev = p.revolucion;
  // El comodín se guarda: sale si es lo último, si con él se queda con un solo grupo, o si
  // no puede superar la mesa y ya le quedan pocas cartas.
  if (comodin !== undefined && !(p.abreConTres && !p.mesa)) {
    if (!mano.length) return [comodin];
    const valores = new Set(mano.map(valor));
    if (!p.mesa && valores.size === 1) return [comodin];
  }
  const grupos = new Map();
  for (const c of mano) {
    const v = valor(c);
    if (!grupos.has(v)) grupos.set(v, []);
    grupos.get(v).push(c);
  }
  const porFuerza = [...grupos.entries()].sort((a, b) => fuerza(a[0], rev) - fuerza(b[0], rev));
  const valida = (cartas) => motivoInvalida(p, i, cartas) === null;

  if (!p.mesa) {
    if (p.abreConTres) {
      const tres = grupos.get(0);
      return tres;
    }
    // Si puede quedarse sin cartas de una vez, lo hace.
    if (porFuerza.length === 1) return porFuerza[0][1];
    // Con dos grupos, si uno es imbatible, primero ese y luego el otro.
    const imbatible = porFuerza.find(([v]) => fuerza(v, rev) === MAXIMO);
    if (porFuerza.length === 2 && imbatible) return imbatible[1];
    // Abre con su grupo más bajo; si tiene cuatro iguales y la revolución le conviene, la usa.
    if (p.opciones.revolucion) {
      const cuatro = porFuerza.find(([, cs]) => cs.length === 4);
      const media = mano.reduce((s, c) => s + fuerza(valor(c), rev), 0) / mano.length;
      if (cuatro && media < MAXIMO / 2) return cuatro[1];
    }
    return porFuerza[0][1];
  }

  const k = p.mesa.cantidad;
  const minimo = fuerza(p.mesa.valor, rev);
  const candidatos = porFuerza.filter(([v, cs]) => cs.length >= k && fuerza(v, rev) > minimo);
  const usarComodin = comodin !== undefined && (todas.length <= 5 || k >= 3);
  if (!candidatos.length) return usarComodin ? [comodin] : null;
  // Si con esta jugada se queda sin cartas, adelante.
  const final = candidatos.find(([, cs]) => cs.length === mano.length);
  if (final && valida(final[1])) return final[1];

  // Prefiere un grupo exacto (no rompe parejas ni tríos).
  const exacto = candidatos.find(([, cs]) => cs.length === k);
  const mitad = mano.length > 6;
  let eleccion = exacto;
  if (!eleccion && !mitad) eleccion = candidatos[0]; // ya al final, rompe un grupo si hace falta
  if (!eleccion) return usarComodin ? [comodin] : null;
  // Guarda las cartas más altas mientras le queden muchas, salvo que la mesa ya sea alta.
  const f = fuerza(eleccion[0], rev);
  if (f >= MAXIMO - 1 && mitad && minimo < MAXIMO / 2) return null;
  if (p.opciones.revolucion && eleccion[1].length === 4 && k < 4) return null;
  const cartas = eleccion[1].slice(0, k);
  return valida(cartas) ? cartas : null;
}

// Qué cartas da un bot que es bruja alta: las más bajas (nunca el comodín).
function ofertaMaquina(p, i) {
  const o = p.ofertas.find((x) => x.de === i && !x.cartas);
  return o ? p.jugadores[i].mano.filter((c) => !esComodin(c)).slice(0, o.n) : null;
}

module.exports = {
  VALORES, PALOS, CARTAS, TOTAL, COMODIN, MAXIMO, TRES_DE_TREBOLES, META, PUNTOS_RANGO, MIN_JUGADORES, MAX_JUGADORES,
  valor, palo, fuerza, esComodin, nombreCarta, rangos, barajar,
  nuevaPartida, motivoInvalida, jugar, pasar, ofrecer, siguienteRonda, jugadaMaquina, ofertaMaquina,
};
