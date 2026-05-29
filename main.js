// main.js - Cat lingo emoji - AMB LECTURA I TIPS INTEGRATS

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.createElement('button');
  btn.textContent = '📱 Instal·la l\'App';
  btn.className = 'btn btn-sec';
  btn.style.position = 'fixed';
  btn.style.bottom = '80px';
  btn.style.right = '20px';
  btn.style.zIndex = '999';
  btn.onclick = () => {
    deferredPrompt.prompt();
    btn.remove();
  };
  document.body.appendChild(btn);
});

let musicaActivada = true;
let BIBLIOTECA_EMOJIS_BASE = [];
let FRASES_MINIJOC = [];
let CATEGORIES_EMOJI = {};
let EMOJIS_JUGABLES = [];

const EMOJIS_STARTER = [
  {emoji: "😀", nom_cat: "Somriure", categoria: "emocio", para_frases: ["riu", "content"], genere: "m"},
  {emoji: "😊", nom_cat: "Feliç", categoria: "emocio", para_frases: ["feliç", "content"], genere: "m"},
  {emoji: "😂", nom_cat: "Riure", categoria: "emocio", para_frases: ["riure", "riure"], genere: "m"},
  {emoji: "👨", nom_cat: "Home", categoria: "persona", para_frases: ["home", "pare"], genere: "m"},
  {emoji: "👩", nom_cat: "Dona", categoria: "persona", para_frases: ["dona", "mare"], genere: "f"},
  {emoji: "🐶", nom_cat: "Gos", categoria: "animal", para_frases: ["gos", "gosset"], genere: "m"},
  {emoji: "🏠", nom_cat: "Casa", categoria: "lloc", para_frases: ["casa", "casa meva"], genere: "f"},
  {emoji: "🍎", nom_cat: "Poma", categoria: "menjar", para_frases: ["poma", "fruita"], genere: "f"},
  {emoji: "🚗", nom_cat: "Cotxe", categoria: "transport", para_frases: ["cotxe", "anar"], genere: "m"},
  {emoji: "⚽", nom_cat: "Futbol", categoria: "esport", para_frases: ["futbol", "jugar"], genere: "m"}
];

let estat = {
  monedes: parseInt(localStorage.getItem('cat_monedes')) || 0,
  compres: JSON.parse(localStorage.getItem('cat_compres')) || [],
  emojisDesbloquejats: JSON.parse(localStorage.getItem('cat_emojis')) || ['😀','😊','😂','👨','👩','🐶','🏠','🍎','🚗','⚽'],
  personatge: JSON.parse(localStorage.getItem('cat_personatge')) || null,
  minijoc: {fraseObjectiu: null, emojisTriats: [], emojisDisponibles: [], modo: 'corta'},
  packs_botiga: []
};

const LANGS = {
  es: {app_titol: "Cat lingo emoji", monedes: "Monedas", tab_mapa: "Mundo", tab_missio: "Misión", tab_gremi: "Gremio", tab_lectura: "Lectura", tab_tips: "Tips", tab_botiga: "Tienda", biblioteca: "Biblioteca", biblioteca_desc: "Tots els personatges disponibles per les teves històries", biblioteca_cta: "💡 Compra packs de emoji en la tienda y desbloquea toda la biblioteca!", minijoc_titol: "Arma la frase", minijoc_desc: "Tria els emojis per formar la frase", comprovar: "Comprovar", correcte: "Correcte!", incorrecte: "No és així. Era:", no_prou_monedes: "No tens prou monedes!", comprat: "Comprat", tria_personatge: "Tria el teu personatge", nom_personatge: "Com et dius?", canviar_personatge: "Canviar Personatge", lectura_titol: "Lectura", lectura_btn: "Generar Lectura", tips_titol: "Tips", tips_btn: "Nou Tip"},
  ca: {app_titol: "Cat lingo emoji", monedes: "Monedes", tab_mapa: "Món", tab_missio: "Missió", tab_gremi: "Gremi", tab_lectura: "Lectura", tab_tips: "Tips", tab_botiga: "Botiga", biblioteca: "Biblioteca", biblioteca_desc: "Tots els personatges disponibles per les teves històries", biblioteca_cta: "💡 Compra packs d'emoji a la botiga i desbloqueja tota la biblioteca!", minijoc_titol: "Arma la frase", minijoc_desc: "Tria els emojis per formar la frase", comprovar: "Comprovar", correcte: "Correcte!", incorrecte: "No és així. Era:", no_prou_monedes: "No tens prou monedes!", comprat: "Comprat", tria_personatge: "Tria el teu personatge", nom_personatge: "Com et dius?", canviar_personatge: "Canviar Personatge", lectura_titol: "Lectura", lectura_btn: "Generar Lectura", tips_titol: "Tips", tips_btn: "Nou Tip"}
};

let idioma = localStorage.getItem('cat_idioma') || 'ca';
let LANG = LANGS[idioma];

const PERSONATGES_JUGADOR = [
  {id: 'joven', emoji: '👦', nom: 'Joven'},
  {id: 'jova', emoji: '👧', nom: 'Jova'},
  {id: 'noi', emoji: '👦', nom: 'Noi'},
  {id: 'noia', emoji: '👧', nom: 'Noia'},
  {id: 'home', emoji: '👨', nom: 'Home'},
  {id: 'dona', emoji: '👩', nom: 'Dona'}
];

const NIVELL_MINIJOC = {minEmojis: 2, maxEmojis: 5, nivelActual: parseInt(localStorage.getItem('cat_nivell_minijoc')) || 1};

function vibrar() { if (navigator.vibrate) navigator.vibrate(20); }
function quitarSkinTone(emoji) { return emoji.replace(/[\u{1F3FB}-\u{1F3FF}]/u, ''); }

function mostrarModal(text) {
  document.getElementById('modalText').textContent = text;
  document.getElementById('modal').classList.remove('hidden');
}
function tancarModal() { document.getElementById('modal').classList.add('hidden'); }

async function carregarDades() {
  try {
    const res = await fetch('data/biblioteca_emojis.json');
    BIBLIOTECA_EMOJIS_BASE = await res.json();
  } catch(err) { BIBLIOTECA_EMOJIS_BASE = []; }

  let packsComprats = [];
  try {
    const resBotiga = await fetch('data/botiga_emojis.json');
    const dataBotiga = await resBotiga.json();
    packsComprats = dataBotiga.filter(p => estat.compres.includes(p.id));
  } catch(err) { packsComprats = []; }

  EMOJIS_JUGABLES = [...EMOJIS_STARTER,...BIBLIOTECA_EMOJIS_BASE];
  packsComprats.forEach(pack => { EMOJIS_JUGABLES = EMOJIS_JUGABLES.concat(pack.emojis); });
  EMOJIS_JUGABLES = EMOJIS_JUGABLES.filter((v,i,a)=>a.findIndex(t=>(t.emoji===v.emoji))===i);

  CATEGORIES_EMOJI = {};
  EMOJIS_JUGABLES.forEach(e => {
    const cat = e.categoria || 'altres';
    if (!CATEGORIES_EMOJI[cat]) CATEGORIES_EMOJI[cat] = [];
    if (!CATEGORIES_EMOJI[cat].includes(e.emoji)) { CATEGORIES_EMOJI[cat].push(e.emoji); }
  });

  try {
    const res = await fetch('data/minijoc_frases.json');
    const data = await res.json();
    FRASES_MINIJOC = data.frases;
  } catch(err) { FRASES_MINIJOC = []; }
}

document.addEventListener('DOMContentLoaded', async () => {
  aplicarIdioma();
  await carregarDades();
  actualitzarUI();
  canviarTab('missionPanel', null);
});

function aplicarIdioma() {
  document.getElementById('title').textContent = LANG.app_titol;
  document.getElementById('text-monedes').textContent = LANG.monedes;
  document.getElementById('tab-mapa-txt').textContent = LANG.tab_mapa;
  document.getElementById('tab-missio-txt').textContent = LANG.tab_missio;
  document.getElementById('tab-gremi-txt').textContent = LANG.tab_gremi;
  document.getElementById('tab-lectura-txt').textContent = LANG.tab_lectura;
  document.getElementById('tab-tips-txt').textContent = LANG.tab_tips;
  document.getElementById('tab-botiga-txt').textContent = LANG.tab_botiga;
}

function canviarTab(tab, e) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById(tab).classList.add('active');
  if(e && e.target) e.target.closest('.nav-item').classList.add('active');

  if(tab === 'menuPrincipal') {carregarMapa();}
  if(tab === 'missionPanel') {carregarMissioTab();}
  if(tab === 'gremioPanel') {mostrarGremi('biblioteca', e);}
  if(tab === 'lecturaPanel') {mostrarLecturaTab();}
  if(tab === 'tipsPanel') {mostrarTipsTab();}
  if(tab === 'botigaPanel') {carregarBotiga();}
}

function carregarMapa() {
  const mapaDiv = document.getElementById('mapa');
  if (!mapaDiv) return;
  mapaDiv.innerHTML = `<div style="text-align:center; padding:40px; color:#888;">
    <h3>🗺️ Mapa</h3><p>Ara mateix el joc se centra en el minijoc i la biblioteca.</p>
  </div>`;
}
function carregarMissioTab() { novaFraseMinijoc(); }

function guardarEstat() {
  localStorage.setItem('cat_monedes', estat.monedes);
  localStorage.setItem('cat_compres', JSON.stringify(estat.compres));
  localStorage.setItem('cat_emojis', JSON.stringify(estat.emojisDesbloquejats));
  localStorage.setItem('cat_personatge', JSON.stringify(estat.personatge));
  localStorage.setItem('cat_nivell_minijoc', NIVELL_MINIJOC.nivelActual);
}
function actualitzarUI() {
  document.getElementById('coins').innerHTML = `🪙 ${estat.monedes} <span id="text-monedes">${LANG.monedes}</span>`;
}

// GREMI
function mostrarGremi(tab, e) {
  document.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
  if(e) e.target.classList.add('active');
  const cont = document.getElementById('gremioContent');
  cont.innerHTML = '';

  if(tab === 'personatges') {
    if(!estat.personatge) {
      let html = `<h3 style="text-align:center; margin-bottom:20px;">${LANG.tria_personatge}</h3>`;
      html += `<div style="display:grid; grid-template-columns:repeat(2,1fr); gap:15px; max-width:300px; margin:0 auto;">`;
      PERSONATGES_JUGADOR.forEach(p => {
        html += `<button class="btn" style="font-size:48px; padding:20px;" onclick="seleccionarPersonatge('${p.id}')">${p.emoji}<div style="font-size:14px; margin-top:5px;">${p.nom}</div></button>`;
      });
      html += `</div><div style="margin-top:20px; text-align:center;">
        <input type="text" id="nom-jugador" placeholder="${LANG.nom_personatge}" style="padding:10px; width:80%; border-radius:8px; border:none; background:#2a2a2a; color:#fff;">
      </div>`;
      cont.innerHTML = html;
    } else {
      cont.innerHTML = `<div class="gremi-item" style="grid-column:1/-1; text-align:center;">
        <div style="font-size:64px;">${estat.personatge.emoji}</div>
        <h3 style="margin:10px 0;">${estat.personatge.nom}</h3>
        <p style="color:#888;">${estat.personatge.nom_cat}</p>
        <button class="btn btn-sec" style="margin-top:15px;" onclick="canviarPersonatge()">${LANG.canviar_personatge}</button>
      </div>`;
    }
  }
  if(tab === 'biblioteca') { mostrarBibliotecaTab('diccionari'); }
  if(tab === 'minijocs') { mostrarBibliotecaTab('minijocs'); }
}

function mostrarBibliotecaTab(tab, e) {
  document.querySelectorAll('#gremioPanel.sub-tab-btn').forEach(btn => btn.classList.remove('active'));
  if(e) e.target.classList.add('active');
  const cont = document.getElementById('gremioContent');

  if(tab === 'diccionari') {
    const desbloquejats = new Set(estat.emojisDesbloquejats || []);
    let html = `<h3 style="text-align:center; margin-bottom:10px;">${LANG.biblioteca}</h3>`;
    html += `<p style="text-align:center; color:#888; margin-bottom:20px; font-size:14px;">${LANG.biblioteca_desc}</p>`;
    html += `<div style="background:linear-gradient(135deg, var(--accent), var(--accent2)); padding:12px; border-radius:12px; margin-bottom:20px; text-align:center; font-weight:700; font-size:14px;">${LANG.biblioteca_cta}</div>`;
    for (const [cat, emojis] of Object.entries(CATEGORIES_EMOJI)) {
      html += `<h4 style="margin:15px 0 8px; color:#4CAF50; text-transform:capitalize;">${cat}</h4>`;
      html += `<div style="display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-bottom:20px;">`;
      emojis.forEach(emoji => {
        const info = EMOJIS_JUGABLES.find(e => e.emoji === emoji);
        const nom = info? info.nom_cat : emoji;
        const paraules = info? info.para_frases.join(', ') : '';
        const comprat = desbloquejats.has(emoji);
        const opacidad = comprat? '1' : '0.12';
        const filtro = comprat? '' : 'grayscale(1) brightness(0.4)';
        const pointer = comprat? 'pointer' : 'not-allowed';
        const colorTexto = comprat? '#fff' : '#444';
        const colorParaules = comprat? '#aaa' : '#222';
        html += `<div style="text-align:center; padding:12px 8px; background:#1a1a1a; border-radius:10px; opacity:${opacidad}; filter:${filtro}; pointer-events:${pointer};">
          <div style="font-size:42px; margin-bottom:6px;">${emoji}</div>
          <div style="font-size:13px; font-weight:600; color:${colorTexto};">${nom}</div>
          <div style="font-size:10px; color:${colorParaules}; margin-top:4px;">${paraules}</div>
        </div>`;
      });
      html += `</div>`;
    }
    cont.innerHTML = html;
  }

  if(tab === 'minijocs') {
    cont.innerHTML = `
      <h3>${LANG.minijoc_titol}</h3>
      <p id="minijoc-nivell" style="color:#4CAF50; font-weight:bold; margin:8px 0;">Nivell ${NIVELL_MINIJOC.nivelActual} - ${NIVELL_MINIJOC.minEmojis} emojis</p>
      <p style="color:var(--text-sec); margin:12px 0;">${LANG.minijoc_desc}</p>
      <div id="minijoc-frase" style="background:#222; padding:15px; border-radius:12px; min-height:50px; margin-bottom:15px; text-align:center; font-size:18px;">
        Prem "Nova frase" per començar
      </div>
      <button class="btn btn-sec" onclick="novaFraseMinijoc()" style="margin-bottom:15px;">Nova frase</button>
      <div id="minijoc-emojis" class="emoji-grid"></div>
      <div id="minijoc-triats" style="background:#222; padding:15px; border-radius:12px; min-height:50px; margin:15px 0; text-align:center; font-size:24px;"></div>
      <button class="btn" onclick="comprovarMinijoc()">${LANG.comprovar}</button>
      <div id="minijoc-feedback" style="margin-top:15px;"></div>
    `;
    novaFraseMinijoc();
  }
}

// PESTANYA LECTURA
function mostrarLecturaTab() {
  const cont = document.getElementById('lecturaContent');
  cont.innerHTML = `
    <h3 style="text-align:center; margin-bottom:15px;">${LANG.lectura_titol}</h3>
    <div id="lectura-content" style="background:#1a1a1a; padding:20px; border-radius:12px; min-height:150px; font-size:16px; line-height:1.6; margin-bottom:15px;">
      Prem "${LANG.lectura_btn}" per generar una lectura nova
    </div>
    <button class="btn" onclick="generarLectura()" style="width:100%;">${LANG.lectura_btn}</button>
  `;
}
function generarLectura() {
  const text = generarTextLectura(1, idioma);
  document.getElementById('lectura-content').textContent = text;
}

// PESTANYA TIPS
function mostrarTipsTab() {
  const cont = document.getElementById('tipsContent');
  cont.innerHTML = `
    <h3 style="text-align:center; margin-bottom:15px;">${LANG.tips_titol}</h3>
    <div id="tips-content" style="background:#1a1a1a; padding:20px; border-radius:12px; min-height:100px; font-size:16px; line-height:1.6; margin-bottom:15px;">
      Prem "${LANG.tips_btn}" per un tip nou
    </div>
    <button class="btn" onclick="generarTip()" style="width:100%;">${LANG.tips_btn}</button>
  `;
}
function generarTip() {
  const tip = generarTipGramatica(idioma);
  document.getElementById('tips-content').textContent = tip;
}

// MINIJOC
function novaFraseMinijoc() {
  if (!FRASES_MINIJOC || FRASES_MINIJOC.length === 0) return;
  const emojisDisponibles = EMOJIS_JUGABLES;
  if (emojisDisponibles.length < 2) {
    document.getElementById('minijoc-frase').textContent = "Error: no hi ha emojis per jugar.";
    document.getElementById('minijoc-emojis').innerHTML = '';
    return;
  }
  const plantilla = FRASES_MINIJOC[Math.floor(Math.random() * FRASES_MINIJOC.length)];
  const { text, solucio } = generarFraseDinamica(plantilla, emojisDisponibles.map(e => e.emoji));
  estat.minijoc.fraseObjectiu = { text, solucio };
  estat.minijoc.emojisTriats = [];
  document.getElementById('minijoc-frase').textContent = text;
  document.getElementById('minijoc-triats').textContent = '';
  document.getElementById('minijoc-feedback').innerHTML = '';
  document.getElementById('minijoc-nivell').textContent = `Nivell ${NIVELL_MINIJOC.nivelActual} - ${solucio.length} emojis`;
  generarEmojisParaFraseCorta({solucio});
}

function generarEmojisParaFraseCorta(frase) {
  const emojisJugador = EMOJIS_JUGABLES.map(e => e.emoji);
  const emojisFalsos = emojisJugador
.filter(e =>!frase.solucio.some(eSol => quitarSkinTone(e) === quitarSkinTone(eSol)))
.sort(() => 0.5 - Math.random()).slice(0, 10 - frase.solucio.length);
  const emojisAMostrar = [...frase.solucio,...emojisFalsos].sort(() => 0.5 - Math.random());
  estat.minijoc.emojisDisponibles = emojisAMostrar;
  let html = '';
  emojisAMostrar.forEach((emoji, i) => {
    const emojiData = EMOJIS_JUGABLES.find(e => quitarSkinTone(e.emoji) === quitarSkinTone(emoji));
    html += `<div class="emoji-item" onclick="triarEmojiMinijoc(${i})" style="cursor:pointer;">
      <div class="emoji-large">${emoji}</div>
      <div class="emoji-name">${emojiData?.nom_cat || ''}</div>
    </div>`;
  });
  document.getElementById('minijoc-emojis').innerHTML = html;
}

function obtenirArticle(emoji) {
  const emojiData = EMOJIS_JUGABLES.find(e => quitarSkinTone(e.emoji) === quitarSkinTone(emoji));
  if (!emojiData ||!emojiData.genere) return emojiData?.nom_cat || emoji;
  const nom = emojiData.nom_cat;
  const article = emojiData.genere === 'f'? 'La' : 'El';
  return `${article} ${nom}`;
}

function generarFraseDinamica(plantilla, emojisJugador) {
  let text = plantilla.text;
  let solucio = [];
  for (const cat of plantilla.categories) {
    const emojisDisponibles = CATEGORIES_EMOJI[cat].filter(eBase =>
      emojisJugador.some(eJug => quitarSkinTone(eJug) === quitarSkinTone(eBase))
    );
    if (!emojisDisponibles || emojisDisponibles.length === 0) {
      return generarFraseDinamica(FRASES_MINIJOC[Math.floor(Math.random() * FRASES_MINIJOC.length)], emojisJugador);
    }
    const emojiElegit = emojisDisponibles[Math.floor(Math.random() * emojisDisponibles.length)];
    text = text.replace(`{${cat}}`, obtenirArticle(emojiElegit));
    solucio.push(emojiElegit);
  }
  return { text, solucio };
}

function triarEmojiMinijoc(index) {
  vibrar();
  const emoji = estat.minijoc.emojisDisponibles[index];
  const maxEmojis = estat.minijoc.fraseObjectiu.solucio.length;
  if (estat.minijoc.emojisTriats.length < maxEmojis) {
    estat.minijoc.emojisTriats.push(emoji);
    actualitzarTriatsMinijoc();
  }
}

function actualitzarTriatsMinijoc() {
  const div = document.getElementById('minijoc-triats');
  div.textContent = estat.minijoc.emojisTriats.join(' ');
}

function comprovarMinijoc() {
  vibrar();
  const frase = estat.minijoc.fraseObjectiu;
  const solucioCorrecta = frase.solucio.map(quitarSkinTone).join('');
  const triatsCorrecte = estat.minijoc.emojisTriats.map(quitarSkinTone).join('');
  const esCorrecte = solucioCorrecta === triatsCorrecte;
  const feedback = document.getElementById('minijoc-feedback');
  if (esCorrecte) {
    feedback.innerHTML = `<p style="color:#4CAF50; font-weight:bold;">${LANG.correcte}</p>`;
    estat.monedes += 5;
    actualitzarUI();
    guardarEstat();
  } else {
    feedback.innerHTML = `<p style="color:#f44336; font-weight:bold;">${LANG.incorrecte} ${frase.solucio.join(' ')}</p>`;
  }
  setTimeout(() => novaFraseMinijoc(), 2000);
}

function seleccionarPersonatge(id) {
  const p = PERSONATGES_JUGADOR.find(x => x.id === id);
  const nomInput = document.getElementById('nom-jugador')?.value.trim();
  estat.personatge = { id: p.id, emoji: p.emoji, nom: nomInput || 'Jugador', nom_cat: p.nom };
  guardarEstat();
  mostrarGremi('personatges', null);
}

function canviarPersonatge() {
  estat.personatge = null;
  guardarEstat();
  mostrarGremi('personatges', null);
}

// BOTIGA
async function carregarBotiga() {
  const cont = document.getElementById('botigaContent');
  try {
    const res = await fetch('data/botiga_emojis.json');
    const data = await res.json();
    estat.packs_botiga = data;
    renderitzarBotiga();
  } catch(e) {
    console.error(e);
    cont.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:#f44336;">Error: ${e.message}</div>`;
  }
}

function renderitzarBotiga() {
  const cont = document.getElementById('botigaContent');
  if (!cont ||!estat.packs_botiga) return;
  cont.innerHTML = '';
  estat.packs_botiga.forEach(pack => {
    const comprat = estat.compres.includes(pack.id);
    const card = document.createElement('div');
    card.className = 'capitol-card';
    card.innerHTML = `
      <div class="capitol-icona">🎁</div>
      <h3>${pack.nom}</h3>
      <p style="color:var(--text-sec); margin:8px 0;">${pack.descripcio}</p>
      <p style="font-size:24px;">${pack.emojis.map(e => e.emoji).join(' ')}</p>
      <button class="btn ${comprat? 'btn-sec' : ''}"
              onclick="comprarPack('${pack.id}', ${pack.preu}, event)"
              ${comprat? 'disabled' : ''}>
        ${comprat? LANG.comprat : `🪙 ${pack.preu}`}
      </button>
    `;
    cont.appendChild(card);
  });
}

async function comprarPack(id, preu, event) {
  if (event) event.stopPropagation();
  if (estat.monedes < preu) {
    mostrarModal(LANG.no_prou_monedes);
    return;
  }
  vibrar();
  estat.monedes -= preu;
  estat.compres.push(id);
  const pack = estat.packs_botiga.find(p => p.id === id);
  if (pack) {
    pack.emojis.forEach(e => {
      if (!estat.emojisDesbloquejats.includes(e.emoji)) {
        estat.emojisDesbloquejats.push(e.emoji);
      }
    });
    await carregarDades();
  }
  NIVELL_MINIJOC.nivelActual = Math.min(NIVELL_MINIJOC.nivelActual + 1, NIVELL_MINIJOC.maxEmojis);
  guardarEstat();
  actualitzarUI();
  renderitzarBotiga();
  mostrarModal("Pack desbloquejat!");
}

// ============ GENERADORS INTEGRATS ============

const LECTURA_CONTENT = {
 1: {
    subjectes: ["El gat", "La noia", "El nen", "La casa", "El gos", "La mare", "El pare", "La nena", "El llibre", "La taula", "El sol", "La lluna", "La música", "El teatre", "La flor", "El cotxe", "La platja", "El parc", "L’escola", "El carrer"],
    accions: ["menja", "llegeix", "corre", "dorm", "juga", "veu", "canta", "camina", "salta", "riu", "parla", "escolta", "mira", "agafa", "balla", "pinta", "escriu", "neteja", "cuina", "neda"],
    objectes: ["una poma", "un llibre", "una cançó", "una història", "a casa", "al parc", "amb alegria", "tranquil·lament", "bé", "ràpid", "sempre", "avui", "cada dia", "amb cura", "junt"],
    llocs: ["al jardí", "a l’escola", "a Girona", "a la Costa Brava", "a casa", "al carrer", "al parc", "a la platja", "al bosc", "al teatre", "al museu", "a la ciutat"],
    estats: ["és feliç", "està cansat", "està content", "riu", "és bonic", "és tranquil", "està bé", "somriu", "descansa", "és divertit"],
    connectors: ["Després", "A la tarda", "Al matí", "Més tard", "També", "I", "Ara", "Ahir", "Avui", "Demà"],
    intros: ["Avui és un bon dia.", "Aquesta és una història curta.", "Mira què passa a Girona.", "Comença la història.", "Avui aprenem algo nou."],
    tancaments: ["Fi de la història.", "Així acaba.", "Fins demà.", "Segueix practicant!", "Molt bé!", "Bon treball!"]
  },
 2: {
    subjectes: ["La família", "El professor", "Els amics", "La ciutat de Girona", "El mercat", "El veí", "La Costa Brava", "L’escola", "El teatre", "La música catalana", "La llegenda", "La festa major", "El calçot", "El castell"],
    accions: ["explica", "organitza", "treballa", "cuina", "camina", "prepara", "ensenya", "escriu", "llegeix", "balla", "neteja", "pinta", "construeix", "visita", "celebra"],
    objectes: ["una història", "el sopar de calçots", "una cançó tradicional", "una llegenda", "amb cura", "cada setmana", "sovint", "amb alegria", "tranquil·lament", "bé", "junt", "a poc a poc"],
    llocs: ["a la plaça de Girona", "a l’oficina", "al barri vell", "a l’escola", "a la Costa Brava", "al restaurant", "al museu Dalí", "a la biblioteca", "al teatre", "a la platja"],
    estats: ["està orgullós", "és important", "és necessari", "riu fort", "està cansat", "és bonic", "és interessant", "és tradicional", "és especial", "és divertit"],
    connectors: ["Mentrestant", "Per això", "A més", "Després de dinar", "Aquell dia", "A la nit", "Al final", "També", "I després", "Durant la festa"],
    intros: ["Aquesta història passa a Girona.", "Avui parlem de la Costa Brava.", "Comença un nou dia de festa.", "Aquesta setmana celebrem algo.", "Mira aquesta llegenda catalana."],
    tancaments: ["La història continua demà.", "Així va anar.", "Fins la propera.", "Bon treball!", "Segueix així!", "Molt bé!"]
  },
 3: {
    subjectes: ["La societat catalana", "El govern", "La cultura", "L’astronomia", "La història", "La tecnologia", "L’art", "La ciència", "El teatre clàssic", "La música modal", "El turisme", "La Costa Brava", "El patrimoni"],
    accions: ["transforma", "analitza", "desenvolupa", "influencia", "demostra", "qüestiona", "explica", "compara", "proposa", "avalua", "considera", "presenta", "celebra", "conserva"],
    objectes: ["el futur", "les idees", "el canvi", "amb profunditat", "constantment", "amb claredat", "amb èxit", "sempre", "en detall", "a fons", "amb cura", "la tradició"],
    llocs: ["en aquest context", "a nivell global", "dins la comunitat", "en aquests anys", "a Girona", "a la Costa Brava", "en aquest cas", "a nivell local", "en aquest moment"],
    estats: ["és complex", "és necessari", "és evident", "és possible", "és interessant", "és important", "és clar", "és difícil", "és útil", "és nou", "és tradicional"],
    connectors: ["Per tant", "Tanmateix", "Així doncs", "En conseqüència", "No obstant això", "D’altra banda", "A més a més", "Per exemple", "En resum"],
    intros: ["Analitzem un fet important de Catalunya.", "Aquesta reflexió ens porta a Girona.", "Comencem amb una idea clau sobre la Costa Brava.", "Avui parlem d’astronomia i art."],
    tancaments: ["Aquesta és la conclusió.", "Fins aquí la lectura.", "Segueix aprenent.", "Molt bé!", "Excel·lent treball!"]
  }
};

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function generarTextLectura(nivell, lang) {
  const D = LECTURA_CONTENT[nivell];
  let parts = [];
  parts.push(rand(D.intros));
  for(let i=0; i<3; i++) {
    let frase = rand(D.subjectes) + " + rand(D.accions) + " + rand(D.objectes) + " + rand(D.llocs) + ".";
    parts.push(frase);
  }
  parts.push(rand(D.connectors) + ", " + rand(D.subjectes).toLowerCase() + " + rand(D.estats) + ".");
  parts.push(rand(D.tancaments));
  return parts.join(" ");
}

const TIPS_CONTENT = {
  ca: [
    "En català, l'article definit 'el' es contrau amb 'a' i forma 'al'. Ex: Vaig al parc.",
    "El passat perifràstic s'usa molt: 'vaig menjar' en comptes de 'menjí'.",
    "Els pronoms febles van davant del verb: 'me'l dono'.",
    "El plural femení acaba en -es: la casa, les cases.",
    "Per dir l'hora: 'És la una' però 'Són les dues'.",
        "Els dies de la setmana no porten majúscula en català.",
    "El diminutiu -et/-eta: gos > gosset, casa > caseta.",
    "La preposició 'de' + article: de + el = del. Ex: el llibre del nen.",
    "Els colors concorden en gènere i nombre: camisa blanca, camises blanques.",
    "Per preguntar: poses 'que' al final. Ex: Vens, que?",
    "El català té dièresi: veïnat, lingüística.",
    "Els numerals 11-15 són irregulars: onze, dotze, tretze, catorze, quinze.",
    "Els possessius van davant: la meva casa, els teus llibres.",
    "Els verbs 'ser' i 'estar' són diferents: Sóc català, Estic cansat.",
    "Els comparatius: més... que, menys... que, tan... com."
  ],
  es: [
    "En catalán, el artículo definido 'el' se contrae con 'a' y forma 'al'. Ej: Vaig al parc.",
    "El pasado perifrástico se usa mucho: 'vaig menjar' en lugar de 'menjí'.",
    "Los pronombres débiles van delante del verbo: 'me'l dono'.",
    "El plural femenino acaba en -es: la casa, les cases.",
    "Para decir la hora: 'És la una' pero 'Són les dues'.",
    "Los días de la semana no llevan mayúscula en catalán.",
    "El diminutivo -et/-eta: gos > gosset, casa > caseta.",
    "La preposición 'de' + artículo: de + el = del. Ej: el libro del niño.",
    "Los colores concuerdan en género y número: camisa blanca, camises blanques.",
    "Para preguntar: pones 'que' al final. Ej: Vens, que?",
    "El catalán tiene diéresis: veïnat, lingüística.",
    "Los numerales 11-15 son irregulares: onze, dotze, tretze, catorze, quinze.",
    "Los posesivos van delante: la meva casa, els teus llibres.",
    "Los verbos 'ser' y 'estar' son diferentes: Sóc català, Estic cansat.",
    "Los comparativos: més... que, menys... que, tan... com."
  ]
};

function generarTipGramatica(lang) {
  const tips = TIPS_CONTENT[lang] || TIPS_CONTENT['ca'];
  return tips[Math.floor(Math.random() * tips.length)];
}

// REGISTRAR SERVICE WORKER
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW error:', err));
}