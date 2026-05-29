// main.js - Cat lingo emoji - Mapa 100 nivells + Progrés 25 frases per desbloquejar
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
  progres: JSON.parse(localStorage.getItem('cat_progres')) || {respostesCorrectes: 0, nivellActualMapa: 1},
  packs_botiga: []
};

const LANGS = {
  es: {
    app_titol: "Cat lingo emoji", monedes: "Monedas", tab_mapa: "Mundo", tab_missio: "Misión", tab_gremi: "Gremio",
    tab_lectura: "Lectura", tab_tips: "Tips", tab_botiga: "Tienda", biblioteca: "Biblioteca",
    biblioteca_desc: "Tots els personatges disponibles per les teves històries",
    biblioteca_cta: "💡 Compra packs de emoji en la tienda y desbloquea toda la biblioteca!",
    minijoc_titol: "Arma la frase", minijoc_desc: "Tria els emojis per formar la frase", comprovar: "Comprovar",
    correcte: "Correcte!", incorrecte: "No és així. Era:", no_prou_monedes: "No tens prou monedes!",
    comprat: "Comprat", tria_personatge: "Tria el teu personatge", nom_personatge: "Com et dius?",
    canviar_personatge: "Canviar Personatge", lectura_titol: "Lectura", lectura_btn: "Generar Lectura",
    tips_titol: "Tips", tips_btn: "Nou Tip", nivell: "Nivell", desbloquejat: "Desbloquejat!", et_falten: "Et falten", frases: "frases"
  },
  ca: {
    app_titol: "Cat lingo emoji", monedes: "Monedes", tab_mapa: "Món", tab_missio: "Missió", tab_gremi: "Gremi",
    tab_lectura: "Lectura", tab_tips: "Tips", tab_botiga: "Botiga", biblioteca: "Biblioteca",
    biblioteca_desc: "Tots els personatges disponibles per les teves històries",
    biblioteca_cta: "💡 Compra packs d'emoji a la botiga i desbloqueja tota la biblioteca!",
    minijoc_titol: "Arma la frase", minijoc_desc: "Tria els emojis per formar la frase", comprovar: "Comprovar",
    correcte: "Correcte!", incorrecte: "No és així. Era:", no_prou_monedes: "No tens prou monedes!",
    comprat: "Comprat", tria_personatge: "Tria el teu personatge", nom_personatge: "Com et dius?",
    canviar_personatge: "Canviar Personatge", lectura_titol: "Lectura", lectura_btn: "Generar Lectura",
    tips_titol: "Tips", tips_btn: "Nou Tip", nivell: "Nivell", desbloquejat: "Desbloquejat!", et_falten: "Et falten", frases: "frases"
  }
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

const NIVELL_MINIJOC = {minEmojis: 2, maxEmojis: 5};

function vibrar() { if (navigator.vibrate) navigator.vibrate(20); }
function quitarSkinTone(emoji) { return emoji.replace(/[\u{1F3FB}-\u{1F3FF}]/u, ''); }
function mostrarModal(text) { document.getElementById('modalText').textContent = text; document.getElementById('modal').classList.remove('hidden'); }
function tancarModal() { document.getElementById('modal').classList.add('hidden'); }
const esperarElemento = (id, callback, intentos = 20) => {
  const el = document.getElementById(id);
  if (el) { callback(el); }
  else if (intentos > 0) { setTimeout(() => esperarElemento(id, callback, intentos - 1), 50); }
};

async function carregarDades() {
  try {
    const res = await fetch('data/biblioteca_emojis.json');
    BIBLIOTECA_EMOJIS_BASE = await res.json();
  } catch(err) { BIBLIOTECA_EMOJIS_BASE = []; }

  let packsComprats = [];
  try {
    const resBotiga = await fetch('data/botiga_emojis.json');
    const dataBotiga = await resBotiga.json();
    estat.packs_botiga = dataBotiga;
    packsComprats = dataBotiga.filter(p => estat.compres.includes(p.id));
  } catch(err) { estat.packs_botiga = []; packsComprats = []; }

  EMOJIS_JUGABLES = [...EMOJIS_STARTER,...BIBLIOTECA_EMOJIS_BASE];
  packsComprats.forEach(pack => { EMOJIS_JUGABLES = EMOJIS_JUGABLES.concat(pack.emojis); });
  EMOJIS_JUGABLES = EMOJIS_JUGABLES.filter((v,i,a)=>a.findIndex(t=>(t.emoji===v.emoji))===i);

  CATEGORIES_EMOJI = {};
  EMOJIS_JUGABLES.forEach(e => {
    const cat = e.categoria || 'altres';
    if (!CATEGORIES_EMOJI[cat]) CATEGORIES_EMOJI[cat] = [];
    if (!CATEGORIES_EMOJI[cat].includes(e.emoji)) CATEGORIES_EMOJI[cat].push(e.emoji);
  });

  try {
    const res = await fetch('data/minijoc_frases.json');
    const data = await res.json();
    FRASES_MINIJOC = data.frases;
  } catch(err) { FRASES_MINIJOC = []; }
}

function aplicarIdioma() {
  document.getElementById('app-titol').textContent = LANG.app_titol;
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
  const tabEl = document.getElementById('tab-' + tab);
  if(!tabEl) { console.error('Tab no existe:', 'tab-' + tab); return; }
  tabEl.classList.add('active');
  if(e) e.target.closest('.nav-item').classList.add('active');
  if(tab === 'mapa') carregarMapa();
  if(tab === 'missio') carregarMissioTab();
  if(tab === 'gremi') mostrarGremi('personatges', e);
  if(tab === 'lectura') mostrarLecturaTab();
  if(tab === 'tips') mostrarTipsTab();
  if(tab === 'botiga') carregarBotiga();
}

function carregarMapa() {
  const mapaDiv = document.getElementById('mapa');
  if (!mapaDiv) return;
  let html = `<h3 style="text-align:center; margin-bottom:15px;">🗺️ ${LANG.nivell} ${estat.progres.nivellActualMapa}</h3>`;
  html += `<p style="text-align:center; color:#888; margin-bottom:20px;">${estat.progres.respostesCorrectes}/25 ${LANG.frases} per pujar</p>`;
  html += `<div class="capitol-grid">`;
  for(let i = 1; i <= 100; i++) {
    const desbloquejat = i <= estat.progres.nivellActualMapa;
    const actual = i === estat.progres.nivellActualMapa;
    html += `<div class="capitol-card ${!desbloquejat? 'locked' : ''}" onclick="${desbloquejat? `jugarNivellMapa(${i})` : ''}">
      <div class="capitol-icona">${desbloquejat? '✅' : '🔒'}</div>
      <h3>${LANG.nivell} ${i}</h3>
      <p>${desbloquejat? (actual? 'Jugar' : 'Completat') : `${LANG.et_falten} ${25 - (estat.progres.respostesCorrectes % 25)} ${LANG.frases}`}</p>
    </div>`;
  }
  html += `</div>`;
  mapaDiv.innerHTML = html;
}

function jugarNivellMapa(nivell) {
  if(nivell!== estat.progres.nivellActualMapa) {
    mostrarModal(`Juga al ${LANG.nivell} ${estat.progres.nivellActualMapa} primer`);
    return;
  }
  mostrarModal(`Entra al minijoc i completa 25 frases per desbloquejar el ${LANG.nivell} ${nivell + 1}`);
  canviarTab('gremi', null);
  setTimeout(() => mostrarGremi('biblioteca', null), 100);
  setTimeout(() => mostrarBibliotecaTab('minijocs', null), 200);
}

function carregarMissioTab() {
  const cont = document.getElementById('missio-contenidor');
  if(!cont) return;
  const frasesPerNivell = 25;
  const respostesActuals = estat.progres.respostesCorrectes % frasesPerNivell;
  const falten = frasesPerNivell - respostesActuals;
  const percentatge = (respostesActuals / frasesPerNivell) * 100;

  cont.innerHTML = `
  <div class="gremi-item" style="text-align:center;">
    <h3>🎯 ${LANG.nivell} ${estat.progres.nivellActualMapa}</h3>
    <p style="color:#888; margin:15px 0;">${LANG.et_falten} ${falten} ${LANG.frases} per desbloquejar el ${LANG.nivell} ${estat.progres.nivellActualMapa + 1}</p>
    <div style="background:#222; border-radius:10px; height:20px; overflow:hidden; margin:20px 0;">
      <div style="background:linear-gradient(90deg, var(--accent), var(--accent2)); height:100%; width:${percentatge}%; transition:width 0.3s;"></div>
    </div>
    <p style="font-size:14px; color:#aaa;">Progrés: ${respostesActuals}/25</p>
    <button class="btn" onclick="canviarTab('gremi', null); setTimeout(()=>mostrarGremi('biblioteca', null), 50); setTimeout(()=>mostrarBibliotecaTab('minijocs', null), 100);" style="margin-top:15px;">Anar a Minijoc</button>
  </div>`;
}

function guardarEstat() {
  localStorage.setItem('cat_monedes', estat.monedes);
  localStorage.setItem('cat_compres', JSON.stringify(estat.compres));
  localStorage.setItem('cat_emojis', JSON.stringify(estat.emojisDesbloquejats));
  localStorage.setItem('cat_personatge', JSON.stringify(estat.personatge));
  localStorage.setItem('cat_progres', JSON.stringify(estat.progres));
}

function actualitzarUI() {
  const spanMonedes = document.getElementById('monedes');
  if(spanMonedes) spanMonedes.firstChild.textContent = estat.monedes + ' ';
}

function mostrarGremi(tab, e) {
  document.querySelectorAll('#tab-gremi .sub-tab-btn').forEach(b => b.classList.remove('active'));
  if(e) e.target.classList.add('active');
  const cont = document.getElementById('gremi-contenidor');
  if(!cont) return;
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

  if(tab === 'biblioteca') {
    cont.innerHTML = `
    <div class="sub-tabs" style="margin-bottom:20px;">
      <button class="sub-tab-btn active" onclick="mostrarBibliotecaTab('diccionari', event)">Diccionari</button>
      <button class="sub-tab-btn" onclick="mostrarBibliotecaTab('minijocs', event)">Minijocs</button>
    </div>
    <div id="biblioteca-content"></div>`;
    mostrarBibliotecaTab('diccionari', null);
  }
}

function mostrarBibliotecaTab(tab, e) {
  document.querySelectorAll('#gremi-contenidor .sub-tab-btn').forEach(btn => btn.classList.remove('active'));
  if(e) e.target.classList.add('active');
  const cont = document.getElementById('biblioteca-content');
  if(!cont) return;

  if(tab === 'diccionari') {
    const desbloquejats = new Set(estat.emojisDesbloquejats || []);
    let html = `<h3 style="text-align:center; margin-bottom:10px;">${LANG.biblioteca}</h3>`;
    html += `<p style="text-align:center; color:#888; margin-bottom:20px; font-size:14px;">${LANG.biblioteca_desc}</p>`;
    html += `<div style="background:linear-gradient(135deg, #FF6B35, #FF8C42); padding:12px; border-radius:12px; margin-bottom:20px; text-align:center; font-weight:700; font-size:14px;">${LANG.biblioteca_cta}</div>`;

    for (const [cat, emojis] of Object.entries(CATEGORIES_EMOJI)) {
      html += `<h4 style="margin:15px 0 8px; color:#4CAF50; text-transform:capitalize;">${cat}</h4>`;
      html += `<div class="emoji-grid">`;
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
        html += `<div class="emoji-item" style="opacity:${opacidad}; filter:${filtro}; pointer-events:${pointer};">
          <div class="emoji-large">${emoji}</div>
          <div class="emoji-name" style="color:${colorTexto};">${nom}</div>
          <div style="font-size:10px; color:${colorParaules}; margin-top:4px;">${paraules}</div>
        </div>`;
      });
      html += `</div>`;
    }
    cont.innerHTML = html;
  }

  if(tab === 'minijocs') {
    cont.innerHTML = `
    <h3 style="text-align:center;">${LANG.minijoc_titol}</h3>
    <p id="minijoc-nivell" style="color:#4CAF50; font-weight:bold; margin:8px 0; text-align:center;">${LANG.nivell} ${estat.progres.nivellActualMapa}</p>
    <p style="color:#888; margin:12px 0; text-align:center;">${LANG.minijoc_desc}</p>
    <div id="minijoc-frase" style="background:#222; padding:15px; border-radius:12px; min-height:50px; margin-bottom:15px; text-align:center; font-size:18px;">Prem "Nova frase" per començar</div>
    <button class="btn btn-sec" onclick="novaFraseMinijoc()" style="margin-bottom:15px; width:100%;">Nova frase</button>
    <div id="minijoc-emojis" class="emoji-grid" style="grid-template-columns:repeat(5,1fr);"></div>
    <div id="minijoc-triats" style="background:#222; padding:15px; border-radius:12px; min-height:50px; margin:15px 0; text-align:center; font-size:24px;"></div>
    <button class="btn" onclick="comprovarMinijoc()" style="width:100%;">${LANG.comprovar}</button>
    <div id="minijoc-feedback" style="margin-top:15px; text-align:center;"></div>`;
    novaFraseMinijoc();
  }
}

function mostrarLecturaTab() {
  const cont = document.getElementById('lectura-contenidor');
  if(!cont) return;
  cont.innerHTML = `
  <h3 style="text-align:center; margin-bottom:15px;">${LANG.lectura_titol} - ${LANG.nivell} ${estat.progres.nivellActualMapa}</h3>
  <div id="lectura-content" style="background:#1a1a1a; padding:20px; border-radius:12px; min-height:150px; font-size:16px; line-height:1.6; margin-bottom:15px;">
    Prem "${LANG.lectura_btn}" per generar una lectura nova
  </div>
  <button class="btn" onclick="generarLectura()" style="width:100%;">${LANG.lectura_btn}</button>`;
}

function generarTextLectura(nivell, lang) {
  const nivellClau = Math.min(Math.ceil(nivell / 33) + 1, 3);
  const D = LECTURA_CONTENT[nivellClau];
  let parts = [];
  parts.push(rand(D.intros));
  for(let i=0; i<3; i++) {
    let frase = rand(D.subjectes) " " rand(D.accions) " " rand(D.objectes) " " rand(D.llocs) + ".";
    parts.push(frase);
  }
  parts.push(rand(D.connectors) + ", " + rand(D.subjectes).toLowerCase() + " + rand(D.estats) + ".");
  parts.push(rand(D.tancaments));
  return parts.join(" ");
}

function generarLectura() {
  const text = generarTextLectura(estat.progres.nivellActualMapa, idioma);
  document.getElementById('lectura-content').textContent = text;
}

function mostrarTipsTab() {
  const cont = document.getElementById('tips-contenidor');
  if(!cont) return;
  cont.innerHTML = `
  <h3 style="text-align:center; margin-bottom:15px;">${LANG.tips_titol} - ${LANG.nivell} ${estat.progres.nivellActualMapa}</h3>
  <div id="tips-content" style="background:#1a1a1a; padding:20px; border-radius:12px; min-height:100px; font-size:16px; line-height:1.6; margin-bottom:15px;">
    Prem "${LANG.tips_btn}" per un tip nou
  </div>
  <button class="btn" onclick="generarTip()" style="width:100%;">${LANG.tips_btn}</button>`;
}

function generarTip() {
  const tip = generarTipGramatica(idioma);
  document.getElementById('tips-content').textContent = tip;
}

function novaFraseMinijoc() {
  if (!FRASES_MINIJOC || FRASES_MINIJOC.length === 0) return;
  const emojisDisponibles = EMOJIS_JUGABLES;
  if (emojisDisponibles.length < 2) {
    esperarElemento('minijoc-frase', el => el.textContent = "Error: no hi ha emojis per jugar.");
    esperarElemento('minijoc-emojis', el => el.innerHTML = '');
    return;
  }
  const plantilla = FRASES_MINIJOC[Math.floor(Math.random() * FRASES_MINIJOC.length)];
  const { text, solucio } = generarFraseDinamica(plantilla, emojisDisponibles.map(e => e.emoji));
  estat.minijoc.fraseObjectiu = { text, solucio };
  estat.minijoc.emojisTriats = [];
  esperarElemento('minijoc-frase', el => el.textContent = text);
  esperarElemento('minijoc-triats', el => el.textContent = '');
  esperarElemento('minijoc-feedback', el => el.innerHTML = '');
  esperarElemento('minijoc-nivell', el => el.textContent = `${LANG.nivell} ${estat.progres.nivellActualMapa}`);
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
    html += `<div class="emoji-item" onclick="triarEmojiMinijoc(${i})">
      <div class="emoji-large">${emoji}</div>
      <div class="emoji-name">${emojiData?.nom_cat || ''}</div>
    </div>`;
  });
  esperarElemento('minijoc-emojis', el => el.innerHTML = html);
}

function obtenirArticle(emoji) {
  const emojiData = EMOJIS_JUGABLES.find(e => quitarSkinTone(e.emoji) === quitarSkinTone(emoji));
  if (!emojiData ||!emojiData.genere) return emojiData?.nom_cat || emoji;
  const nom = emojiData.nom_cat;
  const article = emojiData.genere === 'f'? 'La' : 'El';
  return `${article} ${nom}`;
}

function generarFraseDinamica(plantilla, emojisJugador, intentos = 0) {
  if (intentos > 5) return { text: "Tria emojis", solucio: ['😀','😊'] };
  let text = plantilla.text;
  let solucio = [];
  for (const cat of plantilla.categories) {
    const emojisDisponibles = CATEGORIES_EMOJI[cat]?.filter(eBase => emojisJugador.some(eJug => quitarSkinTone(eJug) === quitarSkinTone(eBase))) || [];
    if (!emojisDisponibles || emojisDisponibles.length === 0) {
      const novaPlantilla = FRASES_MINIJOC[Math.floor(Math.random() * FRASES_MINIJOC.length)];
      return generarFraseDinamica(novaPlantilla, emojisJugador, intentos + 1);
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
  if(div) div.textContent = estat.minijoc.emojisTriats.join(' ');
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
    estat.progres.respostesCorrectes += 1;
    if(estat.progres.respostesCorrectes % 25 === 0 && estat.progres.nivellActualMapa < 100) {
      estat.progres.nivellActualMapa += 1;
      mostrarModal(`${LANG.desbloquejat} ${LANG.nivell} ${estat.progres.nivellActualMapa}!`);
    }
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
  estat.personatge = {
    id: p.id,
    emoji: p.emoji,
    nom: nomInput || 'Jugador',
    nom_cat: p.nom
  };
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
  const cont = document.getElementById('botiga-contenidor');
  if(!cont) return;
  if(!estat.packs_botiga || estat.packs_botiga.length === 0) {
    try {
      const res = await fetch('data/botiga_emojis.json');
      estat.packs_botiga = await res.json();
    } catch(e) {
      cont.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:#f44336;">Error carregant botiga</div>`;
      return;
    }
  }
  renderitzarBotiga();
}

function renderitzarBotiga() {
  const cont = document.getElementById('botiga-contenidor');
  if (!cont ||!estat.packs_botiga) return;
  cont.innerHTML = '';
  estat.packs_botiga.forEach(pack => {
    const comprat = estat.compres.includes(pack.id);
    const card = document.createElement('div');
    card.className = 'capitol-card';
    card.innerHTML = `
      <div class="capitol-icona">🎁</div>
      <h3>${pack.nom}</h3>
      <p>${pack.descripcio}</p>
      <p style="font-size:24px; margin:10px 0;">${pack.emojis.map(e => e.emoji).join(' ')}</p>
      <button class="btn ${comprat? 'btn-sec' : ''}" onclick="comprarPack('${pack.id}', ${pack.preu}, event)" ${comprat? 'disabled' : ''}>
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
      if (!estat.emojisDesbloquejats.includes(e.emoji)) estat.emojisDesbloquejats.push(e.emoji);
    });
    await carregarDades();
  }
  guardarEstat();
  actualitzarUI();
  renderitzarBotiga();
  mostrarModal("Pack desbloquejat!");
}

// GENERADORS
const LECTURA_CONTENT = {
 1: {
    subjectes: ["El gat", "La noia", "El nen", "La casa", "El gos", "La mare", "El pare", "La nena", "El llibre", "La taula"],
    accions: ["menja", "llegeix", "corre", "dorm", "juga", "veu", "canta", "camina", "salta", "riu"],
    objectes: ["una poma", "un llibre", "una cançó", "una història", "a casa", "al parc", "amb alegria", "tranquil·lament", "bé", "ràpid"],
    llocs: ["al jardí", "a l’escola", "a Girona", "a la Costa Brava", "a casa", "al carrer", "al parc", "a la platja"],
    estats: ["és feliç", "està cansat", "està content", "riu", "és bonic", "és tranquil", "està bé", "somriu"],
    connectors: ["Després", "A la tarda", "Al matí", "Més tard", "També", "I", "Ara", "Ahir"],
    intros: ["Avui és un bon dia.", "Aquesta és una història curta.", "Mira què passa a Girona.", "Comença la història."],
    tancaments: ["Fi de la història.", "Així acaba.", "Fins demà.", "Segueix practicant!", "Molt bé!"]
  },
 2: {
    subjectes: ["La família", "El professor", "Els amics", "La ciutat de Girona", "El mercat", "El veí", "La Costa Brava"],
    accions: ["explica", "organitza", "treballa", "cuina", "camina", "prepara", "ensenya", "escriu", "llegeix", "balla"],
    objectes: ["una història", "el sopar de calçots", "una cançó tradicional", "una llegenda", "amb cura", "cada setmana", "sovint"],
    llocs: ["a la plaça de Girona", "a l’oficina", "al barri vell", "a l’escola", "a la Costa Brava", "al restaurant", "al museu"],
    estats: ["està orgullós", "és important", "és necessari", "riu fort", "està cansat", "és bonic", "és interessant"],
    connectors: ["Mentrestant", "Per això", "A més", "Després de dinar", "Aquell dia", "A la nit", "Al final"],
    intros: ["Aquesta història passa a Girona.", "Avui parlem de la Costa Brava.", "Comença un nou dia de festa."],
    tancaments: ["La història continua demà.", "Així va anar.", "Fins la propera.", "Bon treball!"]
  },
 3: {
    subjectes: ["La societat catalana", "El govern", "La cultura", "L’astronomia", "La història", "La tecnologia", "L’art"],
    accions: ["transforma", "analitza", "desenvolupa", "influencia", "demostra", "qüestiona", "explica", "compara"],
    objectes: ["el futur", "les idees", "el canvi", "amb profunditat", "constantment", "amb claredat", "amb èxit", "sempre"],
    llocs: ["en aquest context", "a nivell global", "dins la comunitat", "en aquests anys", "a Girona", "a la Costa Brava"],
    estats: ["és complex", "és necessari", "és evident", "és possible", "és interessant", "és important", "és clar"],
    connectors: ["Per tant", "Tanmateix", "Així doncs", "En conseqüència", "No obstant això", "D’altra banda", "A més a més"],
    intros: ["Analitzem un fet important de Catalunya.", "Aquesta reflexió ens porta a Girona.", "Comencem amb una idea clau."],
    tancaments: ["Aquesta és la conclusió.", "Fins aquí la lectura.", "Segueix aprenent.", "Molt bé!"]
  }
};

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
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

// INICIALITZACIÓ
document.addEventListener('DOMContentLoaded', async () => {
  aplicarIdioma();
  await carregarDades();
  actualitzarUI();
  canviarTab('gremi', null);
});
 
