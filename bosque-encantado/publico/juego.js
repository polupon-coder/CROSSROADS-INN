'use strict';
// Pantalla de BOSQUE ENCANTADO. El servidor manda en directo lo que ve este jugador
// (/api/escuchar) y aquí se dibuja; las jugadas se mandan a /api/accion.

// ─────────────────────────────────────────────────────────────────────────
// CARTAS CON DIBUJO: publico/cartas/01-a.webp … 12-d.webp (número y copia).
// Si se pone false, se dibujan solas con su número. El reverso es cartas/dorso.webp.
// ─────────────────────────────────────────────────────────────────────────
const CARTAS_CON_IMAGEN = true;
const DORSO_CON_IMAGEN = true;

// La baraja del bosque: 48 cartas del 1 (la más baja) al 12 (la más alta), cuatro de cada.
// Por fuerza, de la más baja a la más alta: los monstruos grandes son los más difíciles de quitarse.
const VALORES = ['12', '11', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1'];
const DRAGON_ROJO = 3; // la carta que abre la primera ronda (12 «d»)
const COPIAS = ['a', 'b', 'c', 'd'];
const MAXIMO = VALORES.length - 1;
const valor = (c) => c >> 2;
const copia = (c) => COPIAS[c & 3];
const fuerza = (v, rev) => (rev ? MAXIMO - v : v);

const TEXTOS = {
  es: {
    lema: 'Quédate sin cartas antes que nadie y reina sobre el bosque',
    tuNombre: 'Tu nombre', crear: 'Crear partida', o: 'o únete a una', codigo: 'Código de la partida', unirse: 'Unirse',
    reglas: 'Reglas', sala: 'Sala de espera', codigoSala: 'Código:', copiar: 'Enlace para invitar', copiado: 'Enlace copiado',
    tuBruja: 'Elige tu bruja', brujas: { pelirroja: 'Pelirroja', rubia: 'Rubia', verde: 'Verde', azul: 'Azul', blanca: 'Blanca' },
    anadirMaquina: '+ Añadir bot',
    empezar: 'Empezar', anfitrion: 'anfitrión', maquina: 'bot', tu: 'tú', ausente: 'desconectado',
    faltan: (n) => `Faltan ${n} jugador${n === 1 ? '' : 'es'} (de 4 a 6). Añade bots o invita a amigos.`,
    esperaAnfitrion: 'Esperando a que el anfitrión empiece la partida…',
    menu: 'Menú', puntos: 'Puntos', jugar: 'Jugar', pasar: 'Pasar', registro: 'Lo que ha pasado', cerrar: 'Cerrar', verMesa: 'Ver la mesa',
    ronda: (r) => `Ronda ${r} · a 10 puntos`, revolucionActiva: '¡Revolución!',
    cartas: (n) => `${n} carta${n === 1 ? '' : 's'}`, haPasado: 'ha pasado', termino: (p) => `terminó ${p}.º`,
    mesaVacia: 'Mesa vacía', jugo: (n) => `${n} jugó`, tusPuntos: 'Puntos',
    tuTurnoAbre: 'Te toca abrir: juega una carta, pareja, trío o cuatro iguales.',
    tuTurnoTres: 'Abres la partida: tu jugada debe llevar el dragón rojo (el 12 que brilla).',
    tuTurnoSupera: (k) => `Te toca: supera con ${k === 1 ? 'una carta' : k + ' cartas iguales'} más alta${k === 1 ? '' : 's'}, o pasa.`,
    turnoDe: (n) => `Le toca a ${n}`, hasPasado: 'Has pasado: esperas a que se limpie la mesa.', hasTerminado: (p) => `¡Has terminado ${p}.º! Mira cómo acaban los demás.`,
    finRonda: (r) => `Fin de la ronda ${r}`, eres: (r) => `Eres ${r}`, finPartida: 'Fin de la partida', gana: (n) => `¡${n} gana la partida!`,
    posicion: 'Pos.', jugador: 'Jugador', rango: 'Rango', ptsRonda: 'Ronda', total: 'Total',
    siguienteEn: (s) => `La siguiente ronda se reparte en ${s} s.`, repartir: 'Repartir ya', revancha: 'Otra partida', esperaRevancha: 'El anfitrión puede empezar otra partida.',
    diste: (n) => `Has dado a ${n}`, recibiste: (n) => `Has recibido de ${n}`, intercambioTitulo: 'Intercambio de cartas', deAcuerdo: 'De acuerdo',
    sustituir: 'Que juegue un bot',
    errores: {
      nombre: 'Escribe tu nombre.', sala: 'No existe esa partida.', empezada: 'Esa partida ya ha empezado.', llena: 'La partida está llena (6 jugadores).',
      tresDeTreboles: 'Tu primera jugada debe llevar el dragón rojo (el 12 que brilla).', mismaCantidad: 'Tienes que jugar el mismo número de cartas.',
      superior: 'Tiene que ser de un valor más alto.', mismoValor: 'Todas las cartas deben ser del mismo valor.', abres: 'Abres la mesa: no puedes pasar.',
      turno: 'No es tu turno.', cogido: 'Esa bruja ya la tiene otro jugador.', red: 'Sin conexión con el servidor. Reintentando…',
    },
    rangos: { capitalista: 'Bruja Suprema', vicepresidente: 'Alta Bruja', ciudadano: 'Bruja', viceculo: 'Bruja Aprendiz', culo: 'Bruja Limpiaollas' },
    eresRango: { capitalista: 'la Bruja Suprema', vicepresidente: 'Alta Bruja', ciudadano: 'Bruja', viceculo: 'Bruja Aprendiz', culo: 'Bruja Limpiaollas' },
    sucesos: {
      ronda: (e, n) => `— Ronda ${e.ronda}: abre ${n(e.abre)} —`,
      juega: (e, n, c) => `${n(e.jugador)} juega ${c(e.cartas)}`,
      pasa: (e, n) => `${n(e.jugador)} pasa`,
      limpia: (e, n) => `Se limpia la mesa; abre ${n(e.abre)}`,
      termina: (e, n) => `${n(e.jugador)} se queda sin cartas (${e.posicion}.º)`,
      revolucion: (e, n) => (e.activa ? `¡${n(e.jugador)} hace la revolución! El orden se invierte` : `${n(e.jugador)} deshace la revolución`),
      finRonda: (e) => `— Fin de la ronda ${e.ronda} —`,
    },
  },
  en: {
    lema: 'Run out of cards before anyone else and rule the forest',
    tuNombre: 'Your name', crear: 'Create game', o: 'or join one', codigo: 'Game code', unirse: 'Join',
    reglas: 'Rules', sala: 'Waiting room', codigoSala: 'Code:', copiar: 'Invite link', copiado: 'Link copied',
    tuBruja: 'Choose your witch', brujas: { pelirroja: 'Redhead', rubia: 'Blonde', verde: 'Green', azul: 'Blue', blanca: 'White' },
    anadirMaquina: '+ Add bot',
    empezar: 'Start', anfitrion: 'host', maquina: 'bot', tu: 'you', ausente: 'disconnected',
    faltan: (n) => `${n} more player${n === 1 ? '' : 's'} needed (4 to 6). Add bots or invite friends.`,
    esperaAnfitrion: 'Waiting for the host to start the game…',
    menu: 'Menu', puntos: 'Scores', jugar: 'Play', pasar: 'Pass', registro: 'What happened', cerrar: 'Close', verMesa: 'See the table',
    ronda: (r) => `Round ${r} · first to 10 points`, revolucionActiva: 'Revolution!',
    cartas: (n) => `${n} card${n === 1 ? '' : 's'}`, haPasado: 'passed', termino: (p) => `finished #${p}`,
    mesaVacia: 'Empty table', jugo: (n) => `${n} played`, tusPuntos: 'Points',
    tuTurnoAbre: 'Your lead: play a single, pair, three or four of a kind.',
    tuTurnoTres: 'You open the game: your play must include the red dragon (the glowing 12).',
    tuTurnoSupera: (k) => `Your turn: beat it with ${k === 1 ? 'a higher card' : k + ' higher matching cards'}, or pass.`,
    turnoDe: (n) => `${n}'s turn`, hasPasado: 'You passed: wait until the table is cleared.', hasTerminado: (p) => `You finished #${p}! Watch the others finish.`,
    finRonda: (r) => `End of round ${r}`, eres: (r) => `You are ${r}`, finPartida: 'Game over', gana: (n) => `${n} wins the game!`,
    posicion: 'Pos.', jugador: 'Player', rango: 'Rank', ptsRonda: 'Round', total: 'Total',
    siguienteEn: (s) => `Next round is dealt in ${s} s.`, repartir: 'Deal now', revancha: 'New game', esperaRevancha: 'The host can start a new game.',
    diste: (n) => `You gave ${n}`, recibiste: (n) => `You received from ${n}`, intercambioTitulo: 'Card exchange', deAcuerdo: 'OK',
    sustituir: 'Let a bot play',
    errores: {
      nombre: 'Enter your name.', sala: 'That game does not exist.', empezada: 'That game has already started.', llena: 'The game is full (6 players).',
      tresDeTreboles: 'Your first play must include the red dragon (the glowing 12).', mismaCantidad: 'You must play the same number of cards.',
      superior: 'It must be a higher value.', mismoValor: 'All cards must have the same value.', abres: 'You lead: you cannot pass.',
      turno: 'It is not your turn.', cogido: 'Another player already has that witch.', red: 'No connection to the server. Retrying…',
    },
    rangos: { capitalista: 'Supreme Witch', vicepresidente: 'High Witch', ciudadano: 'Witch', viceculo: 'Apprentice Witch', culo: 'Pot-Scrubber Witch' },
    eresRango: { capitalista: 'the Supreme Witch', vicepresidente: 'a High Witch', ciudadano: 'a Witch', viceculo: 'an Apprentice Witch', culo: 'the Pot-Scrubber Witch' },
    sucesos: {
      ronda: (e, n) => `— Round ${e.ronda}: ${n(e.abre)} leads —`,
      juega: (e, n, c) => `${n(e.jugador)} plays ${c(e.cartas)}`,
      pasa: (e, n) => `${n(e.jugador)} passes`,
      limpia: (e, n) => `Table cleared; ${n(e.abre)} leads`,
      termina: (e, n) => `${n(e.jugador)} is out of cards (#${e.posicion})`,
      revolucion: (e, n) => (e.activa ? `${n(e.jugador)} starts a revolution! The order is reversed` : `${n(e.jugador)} undoes the revolution`),
      finRonda: (e) => `— End of round ${e.ronda} —`,
    },
  },
};

const REGLAS = {
  es: `<h2>Reglas</h2>
<p>De 4 a 6 jugadores, con la baraja del bosque: 48 cartas, del 1 al 12, cuatro de cada número. El objetivo de cada ronda es <b>quedarse sin cartas lo antes posible</b>.</p>
<h3>Valor de las cartas</h3>
<p>De menor a mayor: <b>12 11 10 9 8 7 6 5 4 3 2 1</b>. Los monstruos grandes son los más difíciles de quitarse de encima. Solo cuenta el número, no el dibujo.</p>
<h3>Jugadas</h3>
<p>Quien abre la mesa juega una carta, una pareja, un trío o cuatro iguales. Los demás, en sentido horario, deben <b>superarla</b> con la misma cantidad de cartas iguales de valor más alto, o <b>pasar</b>. Quien pasa queda fuera hasta que se limpie la mesa.</p>
<p>Cuando todos los demás han pasado, se limpia la mesa y abre quien hizo la última jugada (si ya no tiene cartas, el siguiente que tenga). La jugada más alta posible (unos) limpia la mesa al momento.</p>
<p>En la primera ronda abre quien tiene el <b>dragón rojo</b> (un 12), y su jugada debe llevarlo.</p>
<h3>Rangos e intercambio</h3>
<p>Según el orden en que os quedáis sin cartas: <b>Bruja Suprema, Alta Bruja, (Brujas), Bruja Aprendiz y Bruja Limpiaollas</b>. Al empezar la ronda siguiente, la Limpiaollas da sus 2 cartas más altas a la Suprema y recibe sus 2 más bajas; la Aprendiz da su carta más alta a la Alta Bruja y recibe su más baja. Abre la Bruja Suprema.</p>
<h3>Puntos</h3>
<p>En cada ronda, la <b>Bruja Suprema gana 2 puntos</b> y la <b>Alta Bruja 1 punto</b>; las demás, ninguno. La partida acaba al final de la ronda en que alguien llega a <b>10 puntos</b>: gana quien más tenga y, en empate, quien quedó mejor en esa ronda.</p>
<h3>Revolución</h3>
<p>Jugar cuatro cartas iguales invierte el orden (el 12 pasa a ser la más alta y el 1 la más baja) hasta el final de la ronda. Otros cuatro iguales lo devuelven a la normalidad.</p>`,
  en: `<h2>Rules</h2>
<p>4 to 6 players, with the forest deck: 48 cards, numbered 1 to 12, four of each. The goal of each round is to <b>run out of cards as soon as possible</b>.</p>
<h3>Card values</h3>
<p>Lowest to highest: <b>12 11 10 9 8 7 6 5 4 3 2 1</b>. The big monsters are the hardest to get rid of. Only the number counts, not the picture.</p>
<h3>Plays</h3>
<p>Whoever leads plays a single card, a pair, three or four of a kind. Going clockwise, the others must <b>beat it</b> with the same number of matching cards of a higher value, or <b>pass</b>. A player who passes is out until the table is cleared.</p>
<p>When everyone else has passed, the table is cleared and whoever played last leads (if they are out of cards, the next player who still has some). The highest possible play (ones) clears the table at once.</p>
<p>In the first round, the holder of the <b>red dragon</b> (a 12) leads, and that play must include it.</p>
<h3>Ranks and card exchange</h3>
<p>By the order in which you run out: <b>Supreme Witch, High Witch, (Witches), Apprentice Witch and Pot-Scrubber Witch</b>. At the start of the next round, the Pot-Scrubber gives her 2 highest cards to the Supreme Witch and gets the Supreme's 2 lowest; the Apprentice gives her highest card to the High Witch and gets her lowest. The Supreme Witch leads.</p>
<h3>Scoring</h3>
<p>Each round, the <b>Supreme Witch scores 2 points</b> and the <b>High Witch 1 point</b>; the rest score nothing. The game ends after the round in which someone reaches <b>10 points</b>: the highest total wins and ties go to whoever placed better in that round.</p>
<h3>Revolution</h3>
<p>Playing four of a kind reverses the order (12 becomes highest, 1 lowest) until the end of the round. Another four of a kind restores it.</p>`,
};

// ---------- Estado ----------
let idioma = idiomaInicial();
let t = TEXTOS[idioma];
let sala = null; // { codigo, token }
let v = null; // lo último que mandó el servidor
let elegidas = new Set();
let fuente = null;
let rondaVista = 0; // para avisar del intercambio una vez por ronda
let finVisto = null;
let cuentaAtras = null;

const $ = (id) => document.getElementById(id);
const nombreDe = (i) => (v && v.asientos[i] ? v.asientos[i].nombre : '?');
const esc = (s) => String(s).replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);

function idiomaInicial() {
  try {
    const g = localStorage.getItem('idioma');
    if (g in TEXTOS) return g;
  } catch {}
  if (location.pathname.startsWith('/en')) return 'en';
  return (navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en';
}

// ---------- Cartas ----------
// En pequeño el número del dibujo no se lee, así que se repite en una chapa en la esquina.
function htmlCarta(c, extra = '') {
  const vv = VALORES[valor(c)];
  if (CARTAS_CON_IMAGEN) {
    const archivo = `${vv.padStart(2, '0')}-${copia(c)}`;
    return `<span class="carta imagen ${extra}" style="background-image:url(cartas/${archivo}.webp)" title="${vv}" data-carta="${c}"><span class="chapa">${vv}</span></span>`;
  }
  return `<span class="carta ${extra}" title="${vv}" data-carta="${c}">
    <span class="esquina">${vv}</span><span class="centro">${vv}</span><span class="esquina abajo">${vv}</span></span>`;
}
const htmlDorso = () => `<span class="dorso${DORSO_CON_IMAGEN ? ' imagen' : ''}"${DORSO_CON_IMAGEN ? ' style="background-image:url(cartas/dorso.webp)"' : ''}></span>`;
// Carta de estado del rango (publico/estados/): la bruja más o menos contenta.
const htmlEstado = (rango, clase = 'estado-mini') => (rango ? `<span class="${clase} rango-${rango}" style="background-image:url(estados/${rango}.webp)" title="${t.rangos[rango]}" role="img" aria-label="${t.rangos[rango]}"></span>` : '');
const PERSONAJES = ['pelirroja', 'rubia', 'verde', 'azul', 'blanca'];
// Retrato del personaje de un jugador y, en su esquina, la brujita de estado en círculo si ya tiene rango.
const htmlRetrato = (personaje, rango, clase = 'retrato') => {
  const retrato = `<span class="${clase}" style="background-image:url(personajes/${personaje}.webp)"></span>`;
  return rango ? `<span class="retrato-y-estado">${retrato}${htmlEstado(rango, 'estado-circulo')}</span>` : retrato;
};
const textoCartas = (cs) => (typeof cs === 'number' ? t.cartas(cs) : cs.map((c) => VALORES[valor(c)]).join(' '));

// ---------- Red ----------
async function api(ruta, cuerpo) {
  const r = await fetch(ruta, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || 'red');
  return d;
}
const accion = (tipo, datos = {}) => api('/api/accion', { sala: sala.codigo, token: sala.token, tipo, ...datos })
  .catch((e) => nota(t.errores[e.message] || e.message));

function guardarSala(s) {
  sala = s;
  try { localStorage.setItem('sala:' + s.codigo, s.token); } catch {}
  const u = new URL(location.href);
  u.searchParams.set('sala', s.codigo);
  history.replaceState(null, '', u);
  escuchar();
}

function escuchar() {
  if (fuente) fuente.close();
  fuente = new EventSource(`/api/escuchar?sala=${encodeURIComponent(sala.codigo)}&token=${encodeURIComponent(sala.token)}`);
  fuente.onmessage = (ev) => { v = JSON.parse(ev.data); pintar(); };
  fuente.onerror = () => {
    // Si el servidor contesta que la sala no existe (se reinició o caducó), el navegador
    // cierra la conexión: vuelve al inicio. Si solo se cortó la red, reintenta solo.
    if (fuente.readyState === EventSource.CLOSED) olvidarSala();
    else nota(t.errores.red);
  };
}

function olvidarSala() {
  if (fuente) fuente.close();
  try { localStorage.removeItem('sala:' + sala.codigo); } catch {}
  sala = null; v = null; enPortada = false;
  history.replaceState(null, '', location.pathname);
  pintar();
  $('error-inicio').textContent = t.errores.sala;
}

// ---------- Dibujo ----------
function pintarTextos() {
  document.documentElement.lang = idioma;
  for (const el of document.querySelectorAll('[data-t]')) {
    const x = t[el.dataset.t];
    if (typeof x === 'string') el.textContent = x;
  }
  for (const b of document.querySelectorAll('[data-idioma]')) b.setAttribute('aria-pressed', b.dataset.idioma === idioma);
  $('texto-reglas').innerHTML = REGLAS[idioma];
  // El título dibujado, en el idioma elegido: «Bosque Encantado» o «Enchanted Forest».
  const sufijo = idioma === 'en' ? '-en' : '';
  const nombre = idioma === 'en' ? 'Enchanted Forest' : 'Bosque Encantado';
  $('titulo-portada').src = `titulo-blanco${sufijo}.webp`; $('titulo-portada').alt = nombre;
  $('titulo-barra').src = `titulo-barra${sufijo}.webp`; $('titulo-barra').alt = nombre;
  document.title = nombre.toUpperCase();
  $('boton-menu').setAttribute('aria-label', t.menu);
  $('boton-menu').title = t.menu;
}

// Al abrir el juego se ve solo la portada, hasta que se pulsa Jugar.
let enPortada = true;
function pintar() {
  const pantalla = !v ? (enPortada ? 'portada' : 'inicio') : v.partida ? 'mesa' : 'espera';
  for (const id of ['portada', 'inicio', 'espera', 'mesa']) $(id).hidden = id !== pantalla;
  // Al cambiar de pantalla, se empieza por arriba (si no, la mesa se abre donde estaba la sala).
  if (pantalla !== pintar.anterior) { pintar.anterior = pantalla; window.scrollTo(0, 0); }
  if (pantalla === 'espera') pintarEspera();
  if (pantalla === 'mesa') pintarMesa();
}

function pintarEspera() {
  const soyAnfitrion = v.yo === v.anfitrion;
  $('codigo-sala').textContent = v.codigo;
  $('asientos').innerHTML = v.asientos.map((a, i) => `<li>
      ${htmlRetrato(a.personaje, null, 'retrato-mini')}
      <span class="nombre">${esc(a.nombre)}</span>
      <span class="etiqueta">${[i === v.yo && t.tu, i === v.anfitrion && t.anfitrion, a.maquina && t.maquina, !a.conectado && t.ausente].filter(Boolean).join(' · ')}</span>
      ${soyAnfitrion && i !== v.anfitrion ? `<button class="quitar" type="button" data-quitar="${i}" aria-label="✕">✕</button>` : ''}
    </li>`).join('');
  const cogidos = new Set(v.asientos.filter((_, i) => i !== v.yo).map((a) => a.personaje));
  $('elegir-personaje').innerHTML = PERSONAJES.map((p) => `<button type="button" class="retrato-boton${v.asientos[v.yo].personaje === p ? ' elegido' : ''}"
      data-personaje="${p}" aria-pressed="${v.asientos[v.yo].personaje === p}" ${cogidos.has(p) ? 'disabled' : ''}
      style="background-image:url(personajes/${p}.webp)" aria-label="${t.brujas[p]}" title="${t.brujas[p]}"></button>`).join('');
  $('controles-anfitrion').hidden = !soyAnfitrion;
  $('anadir-maquina').disabled = v.asientos.length >= 6;
  const faltan = 4 - v.asientos.length;
  $('empezar').disabled = faltan > 0;
  $('aviso-espera').textContent = faltan > 0 ? t.faltan(faltan) : soyAnfitrion ? '' : t.esperaAnfitrion;
}

function estadoJugador(p, i) {
  const j = p.jugadores[i];
  const pos = p.orden.indexOf(i);
  if (pos >= 0) return t.termino(pos + 1);
  if (j.pasado) return t.haPasado;
  return htmlNumCartas(j.cartas);
}
// Cartas en la mano: un reverso pequeño y el número en grande.
const htmlNumCartas = (n) => `<span class="num-cartas" title="${t.cartas(n)}"><span class="mini-dorso" aria-hidden="true"></span><b>${n}</b></span>`;
// Puntos: el número entre dos hojitas.
const htmlPuntos = (n) => `<span class="cuenta-hojas" title="${t.tusPuntos}: ${n}"><span class="hojita"></span><span class="cuenta">${n}</span><span class="hojita espejo"></span></span>`;

function pintarMesa() {
  const p = v.partida;
  const n = v.asientos.length;
  const yo = v.yo;
  $('ronda').textContent = t.ronda(p.ronda);
  $('revolucion-activa').hidden = !p.revolucion;

  // Rivales, en el orden en que juegan después de ti: retrato, nombre y cuántas cartas les quedan.
  const rivales = [];
  for (let k = 1; k < n; k++) rivales.push((yo + k) % n);
  $('rivales').style.setProperty('--rivales', rivales.length);
  $('rivales').innerHTML = rivales.map((i) => {
    const j = p.jugadores[i];
    const a = v.asientos[i];
    const clases = ['asiento', p.fase === 'jugando' && p.turno === i && 'turno', j.pasado && 'pasado', p.orden.includes(i) && 'fuera'].filter(Boolean).join(' ');
    return `<div class="${clases}">
      <div class="asiento-cabeza">
        ${htmlRetrato(a.personaje, j.rango)}
        <div class="asiento-info">
          <div class="nombre">${esc(a.nombre)}</div>
          ${j.rango ? `<span class="rango">${t.rangos[j.rango]}</span>` : ''}
          <div class="meta">${estadoJugador(p, i)}</div>
          ${!a.conectado ? `<div class="desconectado">${t.ausente}${yo === v.anfitrion ? ` · <button class="enlace" type="button" data-sustituir="${i}">${t.sustituir}</button>` : ''}</div>` : ''}
        </div>
        ${htmlPuntos(j.puntos)}
      </div>
    </div>`;
  }).join('');

  // El claro: la última jugada en grande, y de quién es.
  // Bajo la carta jugada, una franja del color de la bruja que la ha jugado.
  $('monton').innerHTML = p.mesa
    ? `<div class="jugada" data-personaje="${v.asientos[p.mesa.jugador].personaje}"><div class="jugada-cartas">${p.mesa.cartas.map((c) => htmlCarta(c)).join('')}</div><span class="franja"></span></div>`
    : `<span class="hueco-carta">${t.mesaVacia}</span>`;
  $('quien').innerHTML = p.mesa ? `${htmlRetrato(v.asientos[p.mesa.jugador].personaje, null, 'retrato-mini')}<span>${esc(t.jugo(nombreDe(p.mesa.jugador)))}</span>` : '';

  // Yo.
  const mia = p.jugadores[yo];
  $('yo').className = 'yo' + (p.fase === 'jugando' && p.turno === yo ? ' turno' : '');
  $('yo').innerHTML = `${htmlRetrato(v.asientos[yo].personaje, mia.rango)}
    <div><div class="nombre">${esc(v.asientos[yo].nombre)}</div>
    ${mia.rango ? `<span class="rango">${t.rangos[mia.rango]}</span>` : ''}
    <div class="meta">${p.orden.includes(yo) || mia.pasado ? estadoJugador(p, yo) : htmlNumCartas(mia.cartas)}</div></div>
    ${htmlPuntos(mia.puntos)}`;

  // Quita de la selección las cartas que ya no tengo.
  elegidas = new Set([...elegidas].filter((c) => p.mano.includes(c)));
  const miTurno = p.fase === 'jugando' && p.turno === yo;
  const posibles = miTurno ? valoresJugables(p) : null;
  const orden = p.mano.slice().sort((a, b) => fuerza(valor(a), p.revolucion) - fuerza(valor(b), p.revolucion) || a - b);
  $('mano').style.setProperty('--n', Math.max(orden.length, 1));
  $('mano').style.setProperty('--mitad', Math.max(Math.ceil(orden.length / 2), 1));
  $('mano').innerHTML = orden.map((c) => {
    const extra = [elegidas.has(c) && 'elegida', posibles && !posibles.has(valor(c)) && 'apagada', p.abreConTres && c === DRAGON_ROJO && 'abre'].filter(Boolean).join(' ');
    return htmlCarta(c, extra).replace('<span class="carta', '<button type="button" class="carta').replace(/<\/span>$/, '</button>');
  }).join('');

  // Mensaje y botones.
  let msg = '';
  if (p.fase === 'jugando') {
    if (miTurno) msg = p.mesa ? t.tuTurnoSupera(p.mesa.cantidad) : p.abreConTres ? t.tuTurnoTres : t.tuTurnoAbre;
    else if (p.orden.includes(yo)) msg = t.hasTerminado(p.orden.indexOf(yo) + 1);
    else if (mia.pasado) msg = t.hasPasado;
    else msg = t.turnoDe(nombreDe(p.turno));
  }
  $('mensaje').textContent = msg;
  $('mensaje').className = 'mensaje' + (miTurno ? ' tuyo' : '');
  $('jugar').disabled = !miTurno || motivo(p, [...elegidas]) !== null;
  $('pasar').disabled = !miTurno || !p.mesa;
  const titulo = idioma === 'en' ? 'ENCHANTED FOREST' : 'BOSQUE ENCANTADO';
  document.title = miTurno ? `● ${t.jugar}! · ${titulo}` : titulo;

  // Registro.
  const c = (cs) => textoCartas(cs);
  $('registro').innerHTML = p.registro.slice().reverse().map((e) => `<li>${esc(t.sucesos[e.tipo]?.(e, nombreDe, c) ?? '')}</li>`).join('');

  pintarPuntos();
  pintarFin(p); // primero: al empezar la ronda cierra la ventana de fin
  avisarIntercambio(p);
}

// Valores con los que este jugador puede jugar ahora (para atenuar el resto).
function valoresJugables(p) {
  const cuenta = new Map();
  for (const c of p.mano) cuenta.set(valor(c), (cuenta.get(valor(c)) || 0) + 1);
  const ok = new Set();
  for (const [vv, k] of cuenta) {
    if (!p.mesa) { if (!p.abreConTres || vv === valor(DRAGON_ROJO)) ok.add(vv); continue; }
    if (k >= p.mesa.cantidad && fuerza(vv, p.revolucion) > fuerza(p.mesa.valor, p.revolucion)) ok.add(vv);
  }
  return ok;
}

// Las mismas comprobaciones que el servidor, para avisar antes de mandar la jugada.
function motivo(p, cartas) {
  if (cartas.length < 1 || cartas.length > 4) return 'cantidad';
  const vv = valor(cartas[0]);
  if (!cartas.every((c) => valor(c) === vv)) return 'mismoValor';
  if (p.mesa) {
    if (cartas.length !== p.mesa.cantidad) return 'mismaCantidad';
    if (fuerza(vv, p.revolucion) <= fuerza(p.mesa.valor, p.revolucion)) return 'superior';
  } else if (p.abreConTres && !cartas.includes(DRAGON_ROJO)) return 'tresDeTreboles';
  return null;
}

function elegir(c) {
  const p = v.partida;
  const vv = valor(c);
  const mismas = p.mano.filter((x) => valor(x) === vv);
  if (elegidas.size && valor([...elegidas][0]) !== vv) elegidas.clear();
  if (p.mesa && p.turno === v.yo) {
    // Hay que igualar la cantidad: un toque elige de golpe las cartas necesarias de ese valor.
    const k = p.mesa.cantidad;
    if (elegidas.has(c)) elegidas.clear();
    else if (mismas.length >= k) { elegidas = new Set([c, ...mismas.filter((x) => x !== c).slice(0, k - 1)]); }
    else elegidas = new Set([c]);
  } else if (elegidas.has(c)) elegidas.delete(c);
  else elegidas.add(c);
  pintarMesa();
}

function pintarPuntos() {
  const p = v.partida;
  const filas = p.jugadores.map((j, i) => ({ i, j })).sort((a, b) => b.j.puntos - a.j.puntos);
  $('tabla-puntos').innerHTML = `<tr><th>${t.jugador}</th><th>${t.rango}</th><th class="num">${t.total}</th></tr>` +
    filas.map(({ i, j }) => `<tr><td>${esc(nombreDe(i))}</td><td>${j.rango ? t.rangos[j.rango] : '—'}</td><td class="num">${j.puntos}</td></tr>`).join('');
}

function avisarIntercambio(p) {
  if (p.ronda === rondaVista) return;
  rondaVista = p.ronda;
  elegidas.clear();
  const dado = p.intercambios.find((e) => e.de === v.yo);
  const recibido = p.intercambios.find((e) => e.a === v.yo);
  if (!dado || !recibido) return;
  // Ventana de hojas con las cartas en grande; se cierra sola a los 10 s o con «De acuerdo».
  const html = (cs) => cs.map((c) => htmlCarta(c)).join('');
  $('intercambio-diste').textContent = t.diste(nombreDe(dado.a));
  $('intercambio-recibiste').textContent = t.recibiste(nombreDe(recibido.de));
  $('intercambio-dadas').innerHTML = html(dado.cartas);
  $('intercambio-recibidas').innerHTML = html(recibido.cartas);
  const d = $('intercambio');
  if (!d.open && !$('fin').open) d.showModal();
  clearTimeout(avisarIntercambio.cierre);
  avisarIntercambio.cierre = setTimeout(() => { if (d.open) d.close(); }, 10000);
}

function pintarFin(p) {
  const dlg = $('fin');
  clearInterval(cuentaAtras);
  if (p.fase === 'jugando') { if (dlg.open) dlg.close(); return; }
  const clave = `${p.ronda}:${p.fase}`;
  const soyAnfitrion = v.yo === v.anfitrion;
  const final = p.fase === 'finPartida';
  $('fin-titulo').textContent = final ? t.gana(nombreDe(p.ganador)) : t.finRonda(p.ronda);
  const mio = p.jugadores[v.yo].rango;
  $('fin-estado').innerHTML = final
    ? `<span class="estado-grande" style="background-image:url(personajes/${v.asientos[p.ganador].personaje}.webp)"></span>`
    : mio ? `${htmlEstado(mio, 'estado-grande')}<p>${t.eres(t.eresRango[mio])}</p>` : '';
  const orden = final ? p.clasificacion : p.ultimaRonda.orden;
  $('tabla-fin').innerHTML = `<tr><th>${t.posicion}</th><th>${t.jugador}</th><th>${t.rango}</th><th class="num">${t.ptsRonda}</th><th class="num">${t.total}</th></tr>` +
    orden.map((i, k) => `<tr class="${k === 0 ? 'ganador' : ''}"><td>${k + 1}</td><td>${esc(nombreDe(i))}</td><td class="con-estado">${htmlEstado(p.jugadores[i].rango)}${t.rangos[p.jugadores[i].rango]}</td>
      <td class="num">+${p.ultimaRonda.puntos[i]}</td><td class="num">${p.jugadores[i].puntos}</td></tr>`).join('');
  const boton = $('fin-boton');
  boton.hidden = !soyAnfitrion;
  boton.textContent = final ? t.revancha : t.repartir;
  boton.onclick = () => accion(final ? 'revancha' : 'siguienteRonda');
  const nota = $('fin-nota');
  if (final) nota.textContent = soyAnfitrion ? '' : t.esperaRevancha;
  else {
    const tic = () => { nota.textContent = t.siguienteEn(Math.max(0, Math.ceil((p.proximaRonda - Date.now()) / 1000))); };
    tic();
    cuentaAtras = setInterval(tic, 500);
  }
  if (finVisto !== clave) { finVisto = clave; if (!dlg.open) dlg.showModal(); }
}

let temporizadorNota = null;
function nota(texto, ms = 3500, html = false) {
  const el = $('nota');
  if (html) el.innerHTML = texto; else el.textContent = texto;
  el.hidden = false;
  clearTimeout(temporizadorNota);
  temporizadorNota = setTimeout(() => { el.hidden = true; }, ms);
}

// ---------- Eventos ----------
for (const b of document.querySelectorAll('[data-idioma]')) {
  b.addEventListener('click', () => {
    idioma = b.dataset.idioma;
    t = TEXTOS[idioma];
    try { localStorage.setItem('idioma', idioma); } catch {}
    pintarTextos();
    pintar();
  });
}
// Las opciones del menú cierran el menú y abren su ventana.
for (const b of document.querySelectorAll('[data-abrir]')) b.addEventListener('click', () => {
  const menu = b.closest('#menu');
  if (menu) menu.close();
  const d = $(b.dataset.abrir); d.showModal(); d.scrollTop = 0;
});

function recordarNombre() {
  const nombre = $('nombre').value.trim();
  try { localStorage.setItem('nombre', nombre); } catch {}
  return nombre;
}
$('jugar-portada').addEventListener('click', () => {
  enPortada = false;
  pintar();
  if (!$('nombre').value) $('nombre').focus();
});
$('crear').addEventListener('click', async () => {
  $('error-inicio').textContent = '';
  try { guardarSala(await api('/api/crear', { nombre: recordarNombre() })); } catch (e) { $('error-inicio').textContent = t.errores[e.message] || e.message; }
});
$('unirse').addEventListener('click', async () => {
  $('error-inicio').textContent = '';
  const codigo = $('codigo').value.trim().toUpperCase();
  let token = null;
  try { token = localStorage.getItem('sala:' + codigo); } catch {}
  if (token) return guardarSala({ codigo, token });
  try { guardarSala(await api('/api/unirse', { codigo, nombre: recordarNombre() })); } catch (e) { $('error-inicio').textContent = t.errores[e.message] || e.message; }
});
$('copiar').addEventListener('click', () => {
  const u = `${location.origin}${location.pathname}?sala=${v.codigo}`;
  navigator.clipboard?.writeText(u).then(() => nota(t.copiado), () => nota(u));
});
$('anadir-maquina').addEventListener('click', () => accion('maquina'));
$('elegir-personaje').addEventListener('click', (e) => { const b = e.target.closest('[data-personaje]'); if (b && !b.disabled) accion('personaje', { personaje: b.dataset.personaje }); });
$('asientos').addEventListener('click', (e) => { const b = e.target.closest('[data-quitar]'); if (b) accion('quitar', { asiento: Number(b.dataset.quitar) }); });
$('empezar').addEventListener('click', () => accion('empezar'));
$('mano').addEventListener('click', (e) => { const b = e.target.closest('[data-carta]'); if (b) elegir(Number(b.dataset.carta)); });
$('rivales').addEventListener('click', (e) => { const b = e.target.closest('[data-sustituir]'); if (b) accion('sustituir', { asiento: Number(b.dataset.sustituir) }); });
$('jugar').addEventListener('click', () => { const cs = [...elegidas]; elegidas.clear(); accion('jugar', { cartas: cs }); });
$('pasar').addEventListener('click', () => { elegidas.clear(); accion('pasar'); });

// ---------- Arranque ----------
// Cada botón usa una de las cuatro simetrías del panel de hojas, alternándolas en orden.
document.querySelectorAll('.boton').forEach((b, i) => { b.dataset.variante = ['', 'h', 'v', 'hv'][i % 4]; });
pintarTextos();
try { $('nombre').value = localStorage.getItem('nombre') || ''; } catch {}
{
  const codigo = (new URLSearchParams(location.search).get('sala') || '').toUpperCase();
  let token = null;
  if (codigo) {
    $('codigo').value = codigo;
    try { token = localStorage.getItem('sala:' + codigo); } catch {}
  }
  if (token) guardarSala({ codigo, token });
  pintar();
}
