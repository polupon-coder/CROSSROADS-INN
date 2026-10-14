'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('../motor');

// Carta por nombre: c('8T') = ocho de tréboles, c('10C') = diez de corazones.
const c = (s) => M.VALORES.indexOf(s.slice(0, -1)) * 4 + M.PALOS.indexOf(s.slice(-1));
const cs = (...s) => s.map(c);

// Azar repetible para que las partidas de prueba sean siempre iguales.
function semilla(n) {
  return () => { n = (n * 1103515245 + 12345) % 2147483648; return n / 2147483648; };
}

const jugadores = (n) => Array.from({ length: n }, (_, i) => ({ nombre: `J${i}` }));

// Partida con manos fijas: la ronda está empezada y le toca a «turno».
function preparada(manos, { turno = 0, revolucion = false } = {}) {
  const p = M.nuevaPartida(jugadores(manos.length), { revolucion }, semilla(1));
  p.jugadores.forEach((j, i) => { j.mano = cs(...manos[i]).sort((a, b) => a - b); });
  p.turno = turno;
  p.abreConTres = false;
  return p;
}

test('se reparte toda la baraja y abre quien tiene el 3 de tréboles', () => {
  for (const n of [4, 5, 6]) {
    const p = M.nuevaPartida(jugadores(n), {}, semilla(n));
    const todas = p.jugadores.flatMap((j) => j.mano);
    assert.equal(todas.length, 52);
    assert.equal(new Set(todas).size, 52);
    const tamanos = p.jugadores.map((j) => j.mano.length);
    assert.ok(Math.max(...tamanos) - Math.min(...tamanos) <= 1);
    assert.ok(p.jugadores[p.turno].mano.includes(M.TRES_DE_TREBOLES));
    assert.ok(p.abreConTres);
  }
});

test('la primera jugada debe llevar el 3 de tréboles', () => {
  const p = M.nuevaPartida(jugadores(4), {}, semilla(7));
  const t = p.turno;
  const otra = p.jugadores[t].mano.find((x) => M.valor(x) !== 0);
  assert.equal(M.jugar(p, t, [otra]), 'tresDeTreboles');
  assert.equal(M.pasar(p, t), 'abres');
  assert.equal(M.jugar(p, t, [M.TRES_DE_TREBOLES]), null);
});

test('hay que jugar la misma cantidad y de valor superior', () => {
  const p = preparada([['8T', '8D', '5C'], ['10T', '10D', 'KC', '9P', '9T', '9D'], ['3T', '4T'], ['6T', '7T']]);
  assert.equal(M.jugar(p, 0, cs('8T', '5C')), 'mismoValor');
  assert.equal(M.jugar(p, 0, cs('8T', '8D')), null);
  assert.equal(p.turno, 1);
  assert.equal(M.jugar(p, 1, cs('KC')), 'mismaCantidad');
  assert.equal(M.jugar(p, 1, cs('9P', '9T', '9D')), 'mismaCantidad');
  assert.equal(M.jugar(p, 1, cs('10T', '10D')), null);
});

test('quien pasa queda fuera hasta que se limpia la mesa', () => {
  const p = preparada([['5T', 'KT'], ['6T', '7T'], ['8T', '9T'], ['4T', 'QT']]);
  M.jugar(p, 0, cs('5T'));
  M.pasar(p, 1);
  M.jugar(p, 2, cs('8T'));
  M.jugar(p, 3, cs('QT'));
  // Le tocaría a 1, pero pasó: va directo a 0.
  assert.equal(p.turno, 0);
  M.pasar(p, 0);
  M.pasar(p, 2);
  // Todos los demás han pasado: se limpia y abre quien jugó la última (3).
  assert.equal(p.mesa, null);
  assert.equal(p.turno, 3);
  assert.ok(p.jugadores.every((j) => !j.pasado));
});

test('la combinación más alta limpia la mesa y repite quien la jugó', () => {
  const p = preparada([['2T', '5T'], ['6T', '7T'], ['8T', '9T'], ['4T', 'QT']], { turno: 3 });
  M.jugar(p, 3, cs('4T'));
  M.jugar(p, 0, cs('2T'));
  assert.equal(p.mesa, null);
  assert.equal(p.turno, 0);
});

test('si nadie supera la última jugada de quien termina, abre el siguiente con cartas', () => {
  const p = preparada([['KT'], ['6T', '7T'], ['8T', '9T'], ['4T', 'QT']], { turno: 0 });
  M.jugar(p, 0, cs('KT'));
  assert.deepEqual(p.orden, [0]);
  assert.equal(p.turno, 1);
  M.pasar(p, 1);
  M.pasar(p, 2);
  M.pasar(p, 3);
  assert.equal(p.mesa, null);
  assert.equal(p.turno, 1); // el siguiente en sentido horario, aunque pasó
});

test('las cartas de quien termina se pueden superar', () => {
  const p = preparada([['JT'], ['QT', '7T'], ['8T', '9T'], ['4T', '5T']], { turno: 0 });
  M.jugar(p, 0, cs('JT'));
  assert.equal(M.jugar(p, 1, cs('QT')), null);
  assert.equal(p.ultimo, 1);
});

test('fin de ronda: rangos, puntos e intercambio de cartas', () => {
  const p = preparada([['3T'], ['4T', '5T'], ['6T', '7T'], ['8T', '9T', '10T']], { turno: 0 });
  M.jugar(p, 0, cs('3T')); // 0 termina primero
  M.jugar(p, 1, cs('4T'));
  M.jugar(p, 2, cs('6T'));
  M.jugar(p, 3, cs('8T'));
  M.pasar(p, 1);
  M.pasar(p, 2); // se limpia: abre 3
  M.jugar(p, 3, cs('9T'));
  M.jugar(p, 1, cs('5T')); // 5 < 9: no vale
  M.pasar(p, 1);
  M.jugar(p, 2, cs('7T')); // tampoco
  M.pasar(p, 2); // abre 3 de nuevo
  M.jugar(p, 3, cs('10T')); // 3 termina segundo
  M.jugar(p, 1, cs('5T')); // 5 < 10
  M.pasar(p, 1);
  M.pasar(p, 2); // limpia; 3 ya no tiene cartas: abre el siguiente, 0 terminó, así que 1
  assert.equal(p.turno, 1);
  M.jugar(p, 1, cs('5T')); // 1 termina tercero; queda 2, último
  assert.equal(p.fase, 'finRonda');
  assert.deepEqual(p.orden, [0, 3, 1, 2]);
  assert.deepEqual(p.jugadores.map((j) => j.rango), ['capitalista', 'viceculo', 'culo', 'vicepresidente']);
  assert.deepEqual(p.jugadores.map((j) => j.puntos), [3, 1, 0, 2]);

  M.siguienteRonda(p, semilla(3));
  assert.equal(p.ronda, 2);
  assert.equal(p.turno, 0); // abre el Capitalista
  assert.equal(p.abreConTres, false);
  const e = (de, a) => p.intercambios.find((x) => x.de === de && x.a === a).cartas;
  // El Culo (2) da sus dos más altas al Capitalista (0) y recibe sus dos más bajas.
  assert.equal(e(2, 0).length, 2);
  assert.equal(e(0, 2).length, 2);
  assert.equal(e(1, 3).length, 1);
  assert.equal(e(3, 1).length, 1);
  for (const x of e(2, 0)) assert.ok(p.jugadores[0].mano.includes(x));
  for (const x of e(0, 2)) assert.ok(p.jugadores[2].mano.includes(x));
  const todas = p.jugadores.flatMap((j) => j.mano);
  assert.equal(new Set(todas).size, 52);
  // Lo que da el Culo es al menos tan alto como todo lo que se queda.
  const resto = p.jugadores[2].mano.filter((x) => !e(0, 2).includes(x));
  assert.ok(Math.min(...e(2, 0).map(M.valor)) >= Math.max(...resto.map(M.valor)));
});

test('revolución: cuatro iguales invierten el orden', () => {
  const p = preparada([['5T', '5D', '5C', '5P', 'KT'], ['3T', '2T'], ['8T', '9T'], ['4T', 'QT']], { revolucion: true });
  M.jugar(p, 0, cs('5T', '5D', '5C', '5P'));
  assert.ok(p.revolucion);
  M.pasar(p, 1);
  M.pasar(p, 2);
  M.pasar(p, 3);
  M.jugar(p, 0, cs('KT'));
  assert.equal(M.jugar(p, 1, cs('2T')), 'superior'); // ahora el 2 es la más baja
  assert.equal(M.jugar(p, 1, cs('3T')), null); // y el 3 la más alta: limpia la mesa
  assert.equal(p.mesa, null);
});

test('sin la variante, cuatro iguales no cambian el orden', () => {
  const p = preparada([['5T', '5D', '5C', '5P', 'KT'], ['3T', '2T'], ['8T', '9T'], ['4T', 'QT']]);
  M.jugar(p, 0, cs('5T', '5D', '5C', '5P'));
  assert.equal(p.revolucion, false);
});

test('partidas completas solo con máquinas, de 4 a 6, con y sin revolución', () => {
  for (const n of [4, 5, 6]) {
    for (const revolucion of [false, true]) {
      const azar = semilla(n * 10 + (revolucion ? 1 : 0));
      const p = M.nuevaPartida(jugadores(n), { rondas: 5, revolucion }, azar);
      let pasos = 0;
      while (p.fase !== 'finPartida') {
        if (p.fase === 'finRonda') { assert.equal(M.siguienteRonda(p, azar), null); continue; }
        const t = p.turno;
        assert.ok(p.jugadores[t].mano.length > 0, 'le toca a alguien sin cartas');
        const cartas = M.jugadaMaquina(p, t);
        if (cartas) assert.equal(M.jugar(p, t, cartas), null);
        else assert.equal(M.pasar(p, t), null);
        assert.ok(++pasos < 5000, 'la partida no termina');
      }
      assert.equal(p.ronda, 5);
      const total = p.jugadores.reduce((s, j) => s + j.puntos, 0);
      assert.equal(total, 5 * (n * (n - 1)) / 2);
      assert.equal(p.ganador, p.clasificacion[0]);
    }
  }
});

test('desempate por la última ronda', () => {
  const p = preparada([['3T'], ['4T'], ['5T'], ['6T', '7T']]);
  p.opciones.rondas = 1;
  p.ronda = 1;
  p.jugadores[1].puntos = 3; // llega con ventaja
  M.jugar(p, 0, cs('3T'));
  M.jugar(p, 1, cs('4T'));
  M.jugar(p, 2, cs('5T'));
  assert.equal(p.fase, 'finPartida');
  // 0: 3 puntos, 1: 3 + 2 = 5 puntos
  assert.equal(p.ganador, 1);
  // Reconstruye el empate: 0 y 1 con 3 puntos, gana 0 por quedar mejor.
  const q = preparada([['3T'], ['4T'], ['5T'], ['6T', '7T']]);
  q.opciones.rondas = 1;
  q.ronda = 1;
  q.jugadores[1].puntos = 1;
  M.jugar(q, 0, cs('3T'));
  M.jugar(q, 1, cs('4T'));
  M.jugar(q, 2, cs('5T'));
  assert.equal(q.jugadores[0].puntos, q.jugadores[1].puntos);
  assert.equal(q.ganador, 0);
});
