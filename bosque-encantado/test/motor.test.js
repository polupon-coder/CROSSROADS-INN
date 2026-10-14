'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('../motor');

// Carta por nombre: c('6-a') = el primer 6, c('10-c') = el tercer 10.
const c = (s) => { const [v, k] = s.split('-'); return M.VALORES.indexOf(v) * 4 + M.PALOS.indexOf(k); };
const cs = (...s) => s.map(c);

// Azar repetible para que las partidas de prueba sean siempre iguales.
function semilla(n) {
  return () => { n = (n * 1103515245 + 12345) % 2147483648; return n / 2147483648; };
}

const jugadores = (n) => Array.from({ length: n }, (_, i) => ({ nombre: `J${i}` }));

// Partida con manos fijas: la ronda está empezada y le toca a «turno».
function preparada(manos, { turno = 0, revolucion = true } = {}) {
  const p = M.nuevaPartida(jugadores(manos.length), { revolucion }, semilla(1));
  p.jugadores.forEach((j, i) => { j.mano = cs(...manos[i]).sort((a, b) => a - b); });
  p.turno = turno;
  p.abreConTres = false;
  return p;
}

test('se reparte toda la baraja y abre quien tiene el primer 1', () => {
  for (const n of [4, 5, 6]) {
    const p = M.nuevaPartida(jugadores(n), {}, semilla(n));
    const todas = p.jugadores.flatMap((j) => j.mano);
    assert.equal(todas.length, M.CARTAS);
    assert.equal(new Set(todas).size, M.CARTAS);
    const tamanos = p.jugadores.map((j) => j.mano.length);
    assert.ok(Math.max(...tamanos) - Math.min(...tamanos) <= 1);
    assert.ok(p.jugadores[p.turno].mano.includes(M.TRES_DE_TREBOLES));
    assert.ok(p.abreConTres);
  }
});

test('la primera jugada debe llevar el primer 1', () => {
  const p = M.nuevaPartida(jugadores(4), {}, semilla(7));
  const t = p.turno;
  const otra = p.jugadores[t].mano.find((x) => M.valor(x) !== 0);
  assert.equal(M.jugar(p, t, [otra]), 'tresDeTreboles');
  assert.equal(M.pasar(p, t), 'abres');
  assert.equal(M.jugar(p, t, [M.TRES_DE_TREBOLES]), null);
});

test('hay que jugar la misma cantidad y de valor superior', () => {
  const p = preparada([['6-a', '6-b', '3-c'], ['8-a', '8-b', '11-c', '7-d', '7-a', '7-b'], ['1-a', '2-a'], ['4-a', '5-a']]);
  assert.equal(M.jugar(p, 0, cs('6-a', '3-c')), 'mismoValor');
  assert.equal(M.jugar(p, 0, cs('6-a', '6-b')), null);
  assert.equal(p.turno, 1);
  assert.equal(M.jugar(p, 1, cs('11-c')), 'mismaCantidad');
  assert.equal(M.jugar(p, 1, cs('7-d', '7-a', '7-b')), 'mismaCantidad');
  assert.equal(M.jugar(p, 1, cs('8-a', '8-b')), null);
});

test('quien pasa queda fuera hasta que se limpia la mesa', () => {
  const p = preparada([['3-a', '11-a'], ['4-a', '5-a'], ['6-a', '7-a'], ['2-a', '10-a']]);
  M.jugar(p, 0, cs('3-a'));
  M.pasar(p, 1);
  M.jugar(p, 2, cs('6-a'));
  M.jugar(p, 3, cs('10-a'));
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
  const p = preparada([['12-a', '3-a'], ['4-a', '5-a'], ['6-a', '7-a'], ['2-a', '10-a']], { turno: 3 });
  M.jugar(p, 3, cs('2-a'));
  M.jugar(p, 0, cs('12-a'));
  assert.equal(p.mesa, null);
  assert.equal(p.turno, 0);
});

test('si nadie supera la última jugada de quien termina, abre el siguiente con cartas', () => {
  const p = preparada([['11-a'], ['4-a', '5-a'], ['6-a', '7-a'], ['2-a', '10-a']], { turno: 0 });
  M.jugar(p, 0, cs('11-a'));
  assert.deepEqual(p.orden, [0]);
  assert.equal(p.turno, 1);
  M.pasar(p, 1);
  M.pasar(p, 2);
  M.pasar(p, 3);
  assert.equal(p.mesa, null);
  assert.equal(p.turno, 1); // el siguiente en sentido horario, aunque pasó
});

test('las cartas de quien termina se pueden superar', () => {
  const p = preparada([['9-a'], ['10-a', '5-a'], ['6-a', '7-a'], ['2-a', '3-a']], { turno: 0 });
  M.jugar(p, 0, cs('9-a'));
  assert.equal(M.jugar(p, 1, cs('10-a')), null);
  assert.equal(p.ultimo, 1);
});

test('fin de ronda: rangos, puntos e intercambio de cartas', () => {
  const p = preparada([['1-a'], ['2-a', '3-a'], ['4-a', '5-a'], ['6-a', '7-a', '8-a']], { turno: 0 });
  M.jugar(p, 0, cs('1-a')); // 0 termina primero
  M.jugar(p, 1, cs('2-a'));
  M.jugar(p, 2, cs('4-a'));
  M.jugar(p, 3, cs('6-a'));
  M.pasar(p, 1);
  M.pasar(p, 2); // se limpia: abre 3
  M.jugar(p, 3, cs('7-a'));
  M.jugar(p, 1, cs('3-a')); // 5 < 9: no vale
  M.pasar(p, 1);
  M.jugar(p, 2, cs('5-a')); // tampoco
  M.pasar(p, 2); // abre 3 de nuevo
  M.jugar(p, 3, cs('8-a')); // 3 termina segundo
  M.jugar(p, 1, cs('3-a')); // 5 < 10
  M.pasar(p, 1);
  M.pasar(p, 2); // limpia; 3 ya no tiene cartas: abre el siguiente, 0 terminó, así que 1
  assert.equal(p.turno, 1);
  M.jugar(p, 1, cs('3-a')); // 1 termina tercero; queda 2, último
  assert.equal(p.fase, 'finRonda');
  assert.deepEqual(p.orden, [0, 3, 1, 2]);
  assert.deepEqual(p.jugadores.map((j) => j.rango), ['capitalista', 'viceculo', 'culo', 'vicepresidente']);
  assert.deepEqual(p.jugadores.map((j) => j.puntos), [2, 0, 0, 1]);

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
  assert.equal(new Set(todas).size, M.CARTAS);
  // Lo que da el Culo es al menos tan alto como todo lo que se queda.
  const resto = p.jugadores[2].mano.filter((x) => !e(0, 2).includes(x));
  assert.ok(Math.min(...e(2, 0).map(M.valor)) >= Math.max(...resto.map(M.valor)));
});

test('revolución: cuatro iguales invierten el orden', () => {
  const p = preparada([['3-a', '3-b', '3-c', '3-d', '11-a'], ['1-a', '12-a'], ['6-a', '7-a'], ['2-a', '10-a']], { revolucion: true });
  M.jugar(p, 0, cs('3-a', '3-b', '3-c', '3-d'));
  assert.ok(p.revolucion);
  M.pasar(p, 1);
  M.pasar(p, 2);
  M.pasar(p, 3);
  M.jugar(p, 0, cs('11-a'));
  assert.equal(M.jugar(p, 1, cs('12-a')), 'superior'); // ahora el 2 es la más baja
  assert.equal(M.jugar(p, 1, cs('1-a')), null); // y el 3 la más alta: limpia la mesa
  assert.equal(p.mesa, null);
});

test('sin la variante, cuatro iguales no cambian el orden', () => {
  const p = preparada([['3-a', '3-b', '3-c', '3-d', '11-a'], ['1-a', '12-a'], ['6-a', '7-a'], ['2-a', '10-a']], { revolucion: false });
  M.jugar(p, 0, cs('3-a', '3-b', '3-c', '3-d'));
  assert.equal(p.revolucion, false);
});

test('partidas completas solo con máquinas, de 4 a 6, hasta 10 puntos', () => {
  for (const n of [4, 5, 6]) {
    for (const s of [1, 2]) {
      const azar = semilla(n * 10 + s);
      const p = M.nuevaPartida(jugadores(n), {}, azar);
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
      // Cada ronda reparte 3 puntos (2 + 1) y la partida acaba en cuanto alguien llega a 10.
      const total = p.jugadores.reduce((s, j) => s + j.puntos, 0);
      assert.equal(total, 3 * p.ronda);
      assert.ok(Math.max(...p.jugadores.map((j) => j.puntos)) >= 10);
      assert.ok(p.ronda >= 5);
      assert.equal(p.ganador, p.clasificacion[0]);
    }
  }
});

test('puntos por rango: 2 la Bruja Suprema, 1 la Alta Bruja y 0 las demás', () => {
  const p = preparada([['1-a'], ['2-a'], ['3-a'], ['4-a', '5-a']]);
  M.jugar(p, 0, cs('1-a'));
  M.jugar(p, 1, cs('2-a'));
  M.jugar(p, 2, cs('3-a'));
  assert.equal(p.fase, 'finRonda');
  assert.deepEqual(p.jugadores.map((j) => j.puntos), [2, 1, 0, 0]);
});

test('se gana al llegar a 10 puntos; en empate, quien quedó mejor en la última ronda', () => {
  const p = preparada([['1-a'], ['2-a'], ['3-a'], ['4-a', '5-a']]);
  p.jugadores[1].puntos = 9; // con 1 punto más llega a 10
  M.jugar(p, 0, cs('1-a'));
  M.jugar(p, 1, cs('2-a'));
  M.jugar(p, 2, cs('3-a'));
  assert.equal(p.fase, 'finPartida');
  assert.equal(p.ganador, 1); // 10 frente a 2
  const q = preparada([['1-a'], ['2-a'], ['3-a'], ['4-a', '5-a']]);
  q.jugadores[0].puntos = 8;
  q.jugadores[1].puntos = 9;
  M.jugar(q, 0, cs('1-a'));
  M.jugar(q, 1, cs('2-a'));
  M.jugar(q, 2, cs('3-a'));
  assert.equal(q.jugadores[0].puntos, 10);
  assert.equal(q.jugadores[1].puntos, 10);
  assert.equal(q.ganador, 0); // empate a 10: gana la Bruja Suprema de esta ronda
});
