'use strict';
// Motor de BOSQUE ENCANTADO: el Capitalista de cartas (también llamado Presidente o Culo).
// Las reglas están en REGLAS.md. Este archivo no sabe nada de pantallas ni de red: recibe
// jugadas, comprueba que son válidas y cambia el estado de la partida.
//
// Las cartas son números de 0 a 51: valor = n >> 2 (0 = 3, 1 = 4, … 11 = As, 12 = 2) y
// palo = n & 3 (0 tréboles, 1 diamantes, 2 corazones, 3 picas). El 3 de tréboles es el 0.

const VALORES = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
const PALOS = ['T', 'D', 'C', 'P'];
const TRES_DE_TREBOLES = 0;
const MIN_JUGADORES = 4;
const MAX_JUGADORES = 6;

const valor = (c) => c >> 2;
const palo = (c) => c & 3;
const nombreCarta = (c) => VALORES[valor(c)] + PALOS[palo(c)];

// Fuerza de un valor según el orden vigente: con revolución se invierte.
const fuerza = (v, revolucion) => (revolucion ? 12 - v : v);

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

const ordenarMano = (mano) => mano.sort((a, b) => a - b);

// ---------- Partida ----------

// jugadores: [{ nombre }]. opciones: { rondas: 5 (0 = sin límite), revolucion: false }.
function nuevaPartida(jugadores, opciones = {}, azar = Math.random) {
  const n = jugadores.length;
  if (n < MIN_JUGADORES || n > MAX_JUGADORES) throw new Error(`Hacen falta de ${MIN_JUGADORES} a ${MAX_JUGADORES} jugadores`);
  const p = {
    opciones: { rondas: opciones.rondas ?? 5, revolucion: !!opciones.revolucion },
    jugadores: jugadores.map((j) => ({ nombre: j.nombre, mano: [], pasado: false, puntos: 0, rango: null })),
    ronda: 0,
    fase: 'jugando', // jugando | finRonda | finPartida
    mesa: null, // { cartas, valor, cantidad, jugador }: el último grupo jugado
    descartes: 0, // cartas retiradas del centro en esta ronda
    turno: 0,
    ultimo: null, // quién hizo la última jugada de la mesa actual
    revolucion: false,
    abreConTres: false, // primera ronda: la primera jugada lleva el 3 de tréboles
    orden: [], // índices de jugadores en el orden en que se quedan sin cartas
    ultimaRonda: null, // { orden, puntos } de la ronda anterior
    intercambios: [], // [{ de, a, cartas }] hechos al empezar la ronda
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
  p.descartes = 0;
  p.ultimo = null;
  p.revolucion = false;
  p.orden = [];
  p.intercambios = [];
  for (const j of p.jugadores) { j.mano = []; j.pasado = false; }

  // Reparte toda la baraja de una en una, empezando por la izquierda de quien da.
  // En la primera ronda da cualquiera; después, el Culo.
  const reparte = p.ronda === 1 ? Math.floor(azar() * n) : p.jugadores.findIndex((j) => j.rango === 'culo');
  const mazo = barajar([...Array(52).keys()], azar);
  mazo.forEach((c, i) => p.jugadores[(reparte + 1 + i) % n].mano.push(c));
  for (const j of p.jugadores) ordenarMano(j.mano);

  if (p.ronda === 1) {
    p.abreConTres = true;
    p.turno = p.jugadores.findIndex((j) => j.mano.includes(TRES_DE_TREBOLES));
  } else {
    p.abreConTres = false;
    intercambiar(p);
    p.turno = p.jugadores.findIndex((j) => j.rango === 'capitalista');
  }
  anotar(p, { tipo: 'ronda', ronda: p.ronda, abre: p.turno });
}

// Intercambio obligatorio: se eligen las cartas sobre la mano recién repartida y se
// entregan a la vez. Las de menor y mayor valor son las primeras y últimas de la mano
// ordenada (la revolución no cuenta: cada ronda empieza con el orden normal).
function intercambiar(p) {
  const quien = (r) => p.jugadores.findIndex((j) => j.rango === r);
  const pares = [['culo', 'capitalista', 2], ['viceculo', 'vicepresidente', 1]];
  const entregas = [];
  for (const [bajo, alto, k] of pares) {
    const b = quien(bajo);
    const a = quien(alto);
    if (b < 0 || a < 0) continue;
    entregas.push({ de: b, a, cartas: p.jugadores[b].mano.slice(-k) }); // las más altas
    entregas.push({ de: a, a: b, cartas: p.jugadores[a].mano.slice(0, k) }); // las más bajas
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
  if (p.mesa) p.descartes += p.mesa.cartas.length;
  const v = valor(cartas[0]);
  p.mesa = { cartas: cartas.slice().sort((a, b) => a - b), valor: v, cantidad: cartas.length, jugador: i };
  p.ultimo = i;
  p.abreConTres = false;
  anotar(p, { tipo: 'juega', jugador: i, cartas: p.mesa.cartas });

  if (cartas.length === 4 && p.opciones.revolucion) {
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

  // La combinación más alta posible no se puede superar: se limpia la mesa.
  if (fuerza(v, p.revolucion) === 12) { limpiar(p); return null; }
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
    puntos[k] = n - 1 - pos; // tantos puntos como jugadores terminan detrás
    p.jugadores[k].puntos += puntos[k];
  });
  p.ultimaRonda = { ronda: p.ronda, orden: p.orden.slice(), puntos };
  p.mesa = null;
  anotar(p, { tipo: 'finRonda', ronda: p.ronda, orden: p.orden.slice() });

  if (p.opciones.rondas && p.ronda >= p.opciones.rondas) {
    // Gana quien más puntos tenga; en empate, quien quedó mejor en la última ronda.
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
  const mano = p.jugadores[i].mano;
  const rev = p.revolucion;
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
    const imbatible = porFuerza.find(([v]) => fuerza(v, rev) === 12);
    if (porFuerza.length === 2 && imbatible) return imbatible[1];
    // Abre con su grupo más bajo; si tiene cuatro iguales y la revolución le conviene, la usa.
    if (p.opciones.revolucion) {
      const cuatro = porFuerza.find(([, cs]) => cs.length === 4);
      const media = mano.reduce((s, c) => s + fuerza(valor(c), rev), 0) / mano.length;
      if (cuatro && media < 5.5) return cuatro[1];
    }
    return porFuerza[0][1];
  }

  const k = p.mesa.cantidad;
  const minimo = fuerza(p.mesa.valor, rev);
  const candidatos = porFuerza.filter(([v, cs]) => cs.length >= k && fuerza(v, rev) > minimo);
  if (!candidatos.length) return null;
  // Si con esta jugada se queda sin cartas, adelante.
  const final = candidatos.find(([, cs]) => cs.length === mano.length);
  if (final && valida(final[1])) return final[1];

  // Prefiere un grupo exacto (no rompe parejas ni tríos).
  const exacto = candidatos.find(([, cs]) => cs.length === k);
  const mitad = mano.length > 6;
  let eleccion = exacto;
  if (!eleccion && !mitad) eleccion = candidatos[0]; // ya al final, rompe un grupo si hace falta
  if (!eleccion) return null;
  // Guarda las cartas más altas mientras le queden muchas, salvo que la mesa ya sea alta.
  const f = fuerza(eleccion[0], rev);
  if (f >= 11 && mitad && minimo < 7) return null;
  if (p.opciones.revolucion && eleccion[1].length === 4 && k < 4) return null;
  const cartas = eleccion[1].slice(0, k);
  return valida(cartas) ? cartas : null;
}

module.exports = {
  VALORES, PALOS, TRES_DE_TREBOLES, MIN_JUGADORES, MAX_JUGADORES,
  valor, palo, fuerza, nombreCarta, rangos, barajar,
  nuevaPartida, motivoInvalida, jugar, pasar, siguienteRonda, jugadaMaquina,
};
