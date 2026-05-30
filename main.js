// main.js - Cat lingo emoji - Versió sense Personatges

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

let BIBLIOTECA_EMOJIS_BASE = [];
let FRASES_MINIJOC = [];
let CATEGORIES_EMOJI = {};
let EMOJIS_JUGABLES = [];

// Starter pack mínim perquè no peti si falten JSON
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
  progres: JSON.parse(localStorage.getItem('cat_progres')) || {respostesCorrectes: 0, nivellActualMapa: 1},
  energia: parseInt(localStorage.getItem('cat_energia')) || 100,
  ultimaRecargaEnergia: parseInt(localStorage.getItem('cat_ultima_energia')) || Date.now(),
  minijoc: {fraseObjectiu: null, emojisTriats: [], emojisDisponibles: []},
  packs_botiga: []
};

const LANGS = {
  ca: {
    app_titol: "Cat lingo emoji", monedes: "Monedes", tab_mapa: "Món", tab_missio: "Missió",
    tab_gremi: "Gremi", tab_lectura: "Lectura", tab_tips: "Tips", tab_botiga: "Botiga",
    biblioteca: "Biblioteca", biblioteca_desc: "Tots els emojis disponibles",
    biblioteca_cta: "💡 Compra packs d'emoji a la botiga i desbloqueja tota la biblioteca!",
    minijoc_titol: "Arma la frase", minijoc_desc: "Tria els emojis per formar la frase",
    comprovar: "Comprovar", correcte: "Correcte!", incorrecte: "No és així. Era:",
    no_prou_monedes: "No tens prou monedes!", comprat: "Comprat",
    lectura_titol: "Lectura", lectura_btn: "Generar Lectura",
    tips_titol: "Tips", tips_btn: "Nou Tip",
    nivell: "Nivell", desbloquejat: "Desbloquejat!", et_falten: "Et falten", frases: "frases",
    energy_low: "No tens prou energia! Espera o completa una missió."
  }
};

let idioma = localStorage.getItem('cat_idioma') || 'ca';
let LANG = LANGS[idioma];

function vibrar() { if (navigator.vibrate) navigator.vibrate(20); }
function quitarSkinTone(emoji) { return emoji.replace(/[\u{1F3FB}-\u{1F3FF}]/u, ''); }
function mostrarModal(text) {
  document.getElementById('modalText').textContent = text;
  document.getElementById('modal').classList.remove('hidden');
}
function tancarModal() {
  document.getElementById('modal').classList.add('hidden');
}

// Converteix nivell numèric 1-3->a1, 4-6->a2, 7+->b1
function mapaNivellALletra(num) {
  if (num <= 3) return 'a1';
  if (num <= 6) return 'a2';
  return 'b1';
}

function actualitzarStats() {
  guardarEstat();
}

// ===== INICIALITZACIÓ =====
document.addEventListener('DOMContentLoaded', async () => {
  aplicarIdioma();
  await carregarDades();
  actualitzarUI();
  carregarMapa();
  carregarBotiga();
  carregarTips();
  cargarLectura();
  mostrarBibliotecaTab('diccionari', null);
});

function aplicarIdioma() {
  document.getElementById('app-titol').textContent = LANG.app_titol;
  document.getElementById('tab-mapa-txt').textContent = LANG.tab_mapa;
  document.getElementById('tab-missio-txt').textContent = LANG.tab_missio;
  document.getElementById('tab-gremi-txt').textContent = LANG.tab_gremi;
  document.getElementById('tab-lectura-txt').textContent = LANG.tab_lectura;
  document.getElementById('tab-tips-txt').textContent = LANG.tab_tips;
  document.getElementById('tab-botiga-txt').textContent = LANG.tab_botiga;
  document.getElementById('btn-lectura').textContent = LANG.lectura_btn;
}

function actualitzarUI() {
  document.getElementById('monedes').textContent = estat.monedes;
  document.getElementById('energia-display').textContent = estat.energia;
  actualitzarBarraProgres();
}

function actualitzarBarraProgres() {
  const respostesActuals = estat.progres.respostesCorrectes % 25;
  const percentatge = (respostesActuals / 25) * 100;
  const barra = document.getElementById('progres-barra');
  if (barra) barra.style.width = percentatge + '%';
}

function canviarTab(tab, e) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  const tabEl = document.getElementById('tab-'+tab);
  if(!tabEl) return;
  tabEl.classList.add('active');
  if(e) e.target.closest('.nav-item').classList.add('active');

  if(tab === 'mapa') carregarMapa();
  if(tab === 'missio') carregarMissioTab();
  if(tab === 'gremi') mostrarBibliotecaTab('diccionari', null);
  if(tab === 'lectura') cargarLectura();
  if(tab === 'tips') carregarTips();
  if(tab === 'botiga') carregarBotiga();
}

function guardarEstat() {
  localStorage.setItem('cat_monedes', estat.monedes);
  localStorage.setItem('cat_compres', JSON.stringify(estat.compres));
  localStorage.setItem('cat_emojis', JSON.stringify(estat.emojisDesbloquejats));
  localStorage.setItem('cat_progres', JSON.stringify(estat.progres));
  localStorage.setItem('cat_energia', estat.energia);
  localStorage.setItem('cat_ultima_energia', estat.ultimaRecargaEnergia);
}

// ===== CARREGAR DADES =====
async function carregarDades() {
  try {
    const res = await fetch('./data/biblioteca_emojis.json');
    if(res.ok) BIBLIOTECA_EMOJIS_BASE = await res.json();
  } catch(err) { BIBLIOTECA_EMOJIS_BASE = []; }

  let packsComprats = [];
  try {
    const resBotiga = await fetch('./data/botiga_emojis.json');
    if(resBotiga.ok) {
      const dataBotiga = await resBotiga.json();
      estat.packs_botiga = dataBotiga;
      packsComprats = dataBotiga.filter(p => estat.compres.includes(p.id));
    }
  } catch(err) { estat.packs_botiga = []; packsComprats = []; }

  EMOJIS_JUGABLES = [...EMOJIS_STARTER,...BIBLIOTECA_EMOJIS_BASE];
  packsComprats.forEach(pack => {
    if(pack.emojis) EMOJIS_JUGABLES = EMOJIS_JUGABLES.concat(pack.emojis);
  });
  EMOJIS_JUGABLES = EMOJIS_JUGABLES.filter((v,i,a)=>a.findIndex(t=>(t.emoji===v.emoji))===i);

  CATEGORIES_EMOJI = {};
  EMOJIS_JUGABLES.forEach(e => {
    const cat = e.categoria || 'altres';
    if (!CATEGORIES_EMOJI[cat]) CATEGORIES_EMOJI[cat] = [];
    if (!CATEGORIES_EMOJI[cat].includes(e.emoji)) CATEGORIES_EMOJI[cat].push(e.emoji);
  });

  try {
    const res = await fetch('./data/minijoc_frases.json');
    if(res.ok) {
      const data = await res.json();
      FRASES_MINIJOC = data.frases || [];
    }
  } catch(err) { FRASES_MINIJOC = []; }
}

// ===== MAPA 100 NIVELLS =====
function carregarMapa() {
  const mapaDiv = document.getElementById('mapa');
  if(!mapaDiv) return;
  mapaDiv.innerHTML = '';

  let html = `<h3 style="text-align:center; margin-bottom:15px;">${LANG.nivell} ${estat.progres.nivellActualMapa}</h3>`;
  html += `<p style="text-align:center; color:#888; margin-bottom:20px;">${estat.progres.respostesCorrectes % 25}/25 ${LANG.frases} per pujar</p>`;
  html += `<div class="capitol-grid">`;

  for(let i=1; i<=100; i++) {
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

function jugarNivellMapa(n) {
  if(n!== estat.progres.nivellActualMapa) {
    mostrarModal(`Juga al ${LANG.nivell} ${estat.progres.nivellActualMapa} primer`);
    return;
  }
  mostrarModal(`Entra al minijoc i completa 25 frases per desbloquejar el ${LANG.nivell} ${n + 1}`);
  canviarTab('gremi', null);
  setTimeout(() => mostrarBibliotecaTab('minijocs', null), 100);
}

// ===== MISSIÓ =====
function carregarMissioTab() {
  const cont = document.getElementById('missio-contenidor');
  if(!cont) return;
  const respostesActuals = estat.progres.respostesCorrectes % 25;
  const falten = 25 - respostesActuals;
  const percentatge = (respostesActuals / 25) * 100;
  cont.innerHTML = `
    <div class="gremi-item" style="text-align:center;">
      <h3>🎯 ${LANG.nivell} ${estat.progres.nivellActualMapa}</h3>
      <p style="color:#888; margin:15px 0;">${LANG.et_falten} ${falten} ${LANG.frases} per desbloquejar el ${LANG.nivell} ${estat.progres.nivellActualMapa + 1}</p>
      <div style="background:#222; border-radius:10px; height:20px; overflow:hidden; margin:20px 0;">
        <div style="background:linear-gradient(90deg, var(--accent), var(--accent2)); height:100%; width:${percentatge}%;"></div>
      </div>
      <p style="font-size:14px; color:#aaa;">Progrés: ${respostesActuals}/25</p>
      <button class="btn" onclick="canviarTab('gremi', null); setTimeout(()=>mostrarBibliotecaTab('minijocs', null), 100);" style="margin-top:15px;">Anar a Minijoc</button>
    </div>
  `;
}

// ===== GREMI = BIBLIOTECA =====
function mostrarBibliotecaTab(tab, e) {
  document.querySelectorAll('#tab-gremi.sub-tab-btn').forEach(btn => btn.classList.remove('active'));
  if(e) e.target.classList.add('active');
  const cont = document.getElementById('gremi-contenidor');
  if(!cont) return;

  if(tab === 'diccionari') {
    const desbloquejats = new Set(estat.emojisDesbloquejats || []);
    let html = `<h3 style="text-align:center; margin-bottom:10px;">${LANG.biblioteca}</h3>`;
    html += `<p style="text-align:center; color:#888; margin-bottom:20px; font-size:14px;">${LANG.biblioteca_desc}</p>`;
    html += `<div style="background:linear-gradient(135deg, var(--accent), var(--accent2)); padding:12px; border-radius:12px; margin-bottom:20px; text-align:center; font-weight:700; font-size:14px;">${LANG.biblioteca_cta}</div>`;

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
        html += `<div class="emoji-item" style="opacity:${opacidad}; filter:${filtro}; pointer-events:${pointer};">
          <div class="emoji-large">${emoji}</div>
          <div class="emoji-name" style="color:${colorTexto};">${nom}</div>
          <div style="font-size:10px; color:#aaa; margin-top:4px;">${paraules}</div>
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
      <div id="minijoc-feedback" style="margin-top:15px; text-align:center;"></div>
    `;
    novaFraseMinijoc();
  }
}

// ===== MINIJOC =====
function novaFraseMinijoc() {
  if (!FRASES_MINIJOC || FRASES_MINIJOC.length === 0) {
    document.getElementById('minijoc-frase').textContent = "No hi ha frases carregades";
    return;
  }
  const emojisDisponibles = EMOJIS_JUGABLES;
  if (emojisDisponibles.length < 2) {
    document.getElementById('minijoc-frase').textContent = "Compra més emojis per jugar!";
    return;
  }
  const plantilla = FRASES_MINIJOC[Math.floor(Math.random() * FRASES_MINIJOC.length)];
  const { text, solucio } = generarFraseDinamica(plantilla, emojisDisponibles.map(e => e.emoji));
  estat.minijoc.fraseObjectiu = { text, solucio };
  estat.minijoc.emojisTriats = [];
  document.getElementById('minijoc-frase').textContent = text;
  document.getElementById('minijoc-triats').textContent = '';
  document.getElementById('minijoc-feedback').innerHTML = '';
  document.getElementById('minijoc-nivell').textContent = `${LANG.nivell} ${estat.progres.nivellActualMapa}`;
  generarEmojisParaFraseCorta({solucio});
}

function generarFraseDinamica(plantilla, emojisJugador) {
  let text = plantilla.text;
  let solucio = [];
  for (const cat of plantilla.categories) {
    const emojisDisponibles = (CATEGORIES_EMOJI[cat] || []).filter(eBase =>
      emojisJugador.some(eJug => quitarSkinTone(eJug) === quitarSkinTone(eBase))
    );
    if (!emojisDisponibles || emojisDisponibles.length === 0) {
      return generarFraseDinamica(FRASES_MINIJOC[Math.floor(Math.random() * FRASES_MINIJOC.length)], emojisJugador);
    }
    const emojiElegit = emojisDisponibles[Math.floor(Math.random() * emojisDisponibles.length)];
    const article = plantilla.generes?.[cat] === 'f'? 'La' : 'El';
    text = text.replace(`{${cat}}`, `${article} ${EMOJIS_JUGABLES.find(e=>e.emoji===emojiElegit)?.nom_cat || emojiElegit}`);
    solucio.push(emojiElegit);
  }
  return { text, solucio };
}

function generarEmojisParaFraseCorta(frase) {
  const emojisJugador = EMOJIS_JUGABLES.map(e => e.emoji);
  const emojisFalsos = emojisJugador.filter(e =>!frase.solucio.some(eSol => quitarSkinTone(e) === quitarSkinTone(eSol))).sort(() => 0.5 - Math.random()).slice(0, 10 - frase.solucio.length);
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

function triarEmojiMinijoc(index) {
  vibrar();
  const emoji = estat.minijoc.emojisDisponibles[index];
  const maxEmojis = estat.minijoc.fraseObjectiu.solucio.length;
  if (estat.minijoc.emojisTriats.length < maxEmojis) {
    estat.minijoc.emojisTriats.push(emoji);
    document.getElementById('minijoc-triats').textContent = estat.minijoc.emojisTriats.join(' ');
  }
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

// ===== LECTURA =====
const BANCO_VOCAB = {
  a1: {
    la_ciencia_facil: {
      persones: ["La Maria", "En Joan", "L'Ana", "En Pau", "La Sara", "En Lluc", "La Berta", "En Pol"],
      llocs: ["laboratori", "escola", "casa", "museu", "biblioteca", "parc", "aula", "jardí"],
      objectes: ["telescopi", "llibre", "ulleres", "llum", "planta", "aigua", "glop", "roca", "microscopi", "mapa", "llupa", "tub"],
      temps: ["avui", "al matí", "ahir", "ara", "demà", "a la tarda", "a la nit", "aviat"],
      verbs: ["mira", "busca", "troba", "estudia", "llegeix", "toca", "agafa", "mostra", "observa", "apunta", "pregunt", "aprèn"],
      conectores: ["Després", "Llavors", "A més", "Però", "Així que", "Finalment", "També", "Quan"],
      marcadors_temporals: ["Primer", "Després", "Llavors", "Mentre", "Quan", "Al final", "Ara", "Abans"],
      pronoms: ["Ell", "Ella", "Aquest", "Aquesta", "La Maria també", "En Joan també"],
      causa_efecte: ["Per això", "Així que", "Per tant", "Com que", "Però", "Tot i que"],
      atmosfera: ["llum tènue", "silenci", "curiositat", "calma", "brillantor", "pau"],
      detalls: ["olor de paper vell", "veu baixa", "brillantor del vidre", "soroll suau", "resplendor blanca"],
      tancaments: ["ara sap que aprendre també és un plaer", "va descobrir que la ciència està a tot arreu", "va entendre que preguntar obre portes"]
    },
    l_esport_facil: {
      persones: ["En Pau", "La Laura", "En Marc", "La Sílvia", "En Roger", "La Mireia", "En Oriol", "La Clàudia"],
      llocs: ["parc", "piscina", "camp", "gimnàs", "pista", "platja", "carrer", "estadi"],
      objectes: ["pilota", "sabates", "aigua", "samarrera", "gorra", "bicicleta", "corda", "raqueta", "casco", "guants", "toalla", "xiulet"],
      temps: ["avui", "al matí", "a la tarda", "després", "ara", "diumenge", "ahir", "cada dia"],
      verbs: ["corre", "juga", "neda", "salta", "beu", "agafa", "llança", "patea", "pedala", "escalfa", "descansa", "guanya"],
      conectores: ["Després", "Llavors", "A més", "Però", "Així que", "Finalment", "També", "Quan"],
      marcadors_temporals: ["Primer", "Després", "Llavors", "Mentre", "Quan", "Al final", "Ara", "Abans"],
      pronoms: ["Ell", "Ella", "Aquest", "Aquesta", "En Pau també", "La Laura també"],
      causa_efecte: ["Per això", "Així que", "Per tant", "Com que", "Però", "Tot i que"],
      atmosfera: ["aire fresc", "sol brillant", "vent suau", "energia", "alegria", "ritme"],
      detalls: ["olor de gespa mullada", "soroll de pilotes", "so de l’aigua", "riu de gent", "respiració tranquila"],
      tancaments: ["va tornar a casa amb el cos content", "va entendre que moure’s també cura", "va guardar aquell moment per sempre"]
    },
    la_festa_major: {
      persones: ["La Núria", "En Jordi", "L'Eva", "En Luis", "La Paula", "En Bernat", "La Gisela", "En Martí"],
      llocs: ["plaça", "carrer", "parc", "barri", "escenari", "carpa", "església", "avinguda"],
      objectes: ["música", "ball", "castell", "gegant", "capgròs", "banderola", "foc", "dolç", "tambor", "corona", "sardana", "caramels"],
      temps: ["avui", "aquest cap de setmana", "ahir", "ara", "a la nit", "diumenge", "demà", "tot el dia"],
      verbs: ["balla", "mira", "menja", "canta", "riu", "va", "juga", "celebra", "surt", "acompanya", "disfruta", "aplaudix"],
      conectores: ["Després", "Llavors", "A més", "Però", "Així que", "Finalment", "També", "Quan"],
      marcadors_temporals: ["Primer", "Després", "Llavors", "Mentre", "Quan", "Al final", "Ara", "Abans"],
      pronoms: ["Ell", "Ella", "Aquest", "Aquesta", "La Núria també", "En Jordi també"],
      causa_efecte: ["Per això", "Així que", "Per tant", "Com que", "Però", "Tot i que"],
      atmosfera: ["colors", "alegria", "foc", "llum", "soroll alegre", "vida"],
      detalls: ["olor de castanyes", "so de gralles", "riu de gent", "brillantor dels focs", "veus llunyanes"],
      tancaments: ["va tornar a casa amb el cor content", "va guardar aquell record per sempre", "va saber que tornarà l’any que ve"]
    },
    el_dinar_català: {
      persones: ["La Marta", "En David", "La Carla", "En Toni", "La Júlia", "En Ferran", "La Mar", "En Sergi"],
      llocs: ["casa", "restaurant", "mercat", "cuina", "bar", "terrassa", "menjador", "taula"],
      objectes: ["pa", "tomàquet", "oli", "pernil", "formatge", "fruita", "aigua", "arròs", "peix", "verdura", "cullereta", "plat"],
      temps: ["al migdia", "avui", "ahir", "ara", "al vespre", "diumenge", "demà", "sovint"],
      verbs: ["menja", "beu", "compra", "cuina", "prova", "talla", "posa", "pren", "serveix", "parteix", "barreja", "tasta"],
      conectores: ["Després", "Llavors", "A més", "Però", "Així que", "Finalment", "També", "Quan"],
      marcadors_temporals: ["Primer", "Després", "Llavors", "Mentre", "Quan", "Al final", "Ara", "Abans"],
      pronoms: ["Ell", "Ella", "Aquest", "Aquesta", "La Marta també", "En David també"],
      causa_efecte: ["Per això", "Així que", "Per tant", "Com que", "Però", "Tot i que"],
      atmosfera: ["olor de casa", "calor", "pau", "gust dolç", "sabor salat", "calma"],
      detalls: ["olor de pa torrat", "gust de tomàquet fresc", "so de coberteria", "color roig viu", "gust dolç al final"],
      tancaments: ["va acabar amb un somriure ple", "va entendre que dinar bé també és estimar-se", "va guardar el gust per demà"]
    }
  },
  a2: {
    la_historia_cat: {
      persones: ["La Marta", "En David", "La Carla", "En Jordi", "La Núria", "En Bernat", "La Sílvia", "En Roger"],
      llocs: ["museu", "monument", "carrer antic", "biblioteca", "castell", "plaça", "església", "arxiu"],
      objectes: ["quadre", "document", "mapa", "llibre", "espasa", "moneda", "foto", "estatua", "pergamí", "ploma", "clau", "bústia"],
      temps: ["ahir", "la setmana passada", "fa un any", "demà", "al matí", "recentment", "fa poc", "abans"],
      verbs: ["visita", "llegeix", "descobreix", "explica", "mira", "estudia", "aprèn", "mostra", "busca", "troba", "consulta", "recorda"],
      conectores: ["Després", "Llavors", "A més", "Però", "Així que", "Finalment", "També", "Quan"],
      marcadors_temporals: ["Primer", "Després", "Llavors", "Mentre", "Quan", "Al final", "Ara", "Abans"],
      pronoms: ["Ell", "Ella", "Aquest", "Aquesta", "La Marta també", "En David també"],
      causa_efecte: ["Per això", "Així que", "Per tant", "Com que", "Però", "Tot i que"],
      atmosfera: ["polsegós", "silenci antic", "llum groga", "misteri", "pau", "respecte"],
      detalls: ["olor de pergamí vell", "so de passes llunyanes", "llum que entra per la finestra", "text quasi esborrat"],
      tancaments: ["va entendre que el passat també parla", "va sortir amb una pregunta nova al cap", "va sentir que formava part d’aquella història"]
    },
        el_cine_i_musica: {
      persones: ["En Alex", "La Núria", "En Toni", "La Sílvia", "En Pol", "La Berta", "En Marc", "La Laura"],
      llocs: ["cinema", "teatre", "sala", "casa", "escenari", "auditori", "estudi", "festival"],
      objectes: ["pel·lícula", "cançó", "guitarra", "entrada", "palomites", "refresc", "cartell", "altaveu", "micròfon", "pantalla", "butaca", "escena"],
      temps: ["ahir", "avui", "demà", "aquest cap de setmana", "a la nit", "a la tarda", "recentment", "sovint"],
      verbs: ["mira", "escolta", "toca", "canta", "compra", "balla", "riuen", "aplaudixen", "grava", "edita", "assaja", "estrena"],
      conectores: ["Després", "Llavors", "A més", "Però", "Així que", "Finalment", "També", "Quan"],
      marcadors_temporals: ["Primer", "Després", "Llavors", "Mentre", "Quan", "Al final", "Ara", "Abans"],
      pronoms: ["Ell", "Ella", "Aquest", "Aquesta", "En Alex també", "La Núria també"],
      causa_efecte: ["Per això", "Així que", "Per tant", "Com que", "Però", "Tot i que"],
      atmosfera: ["foscor", "so envolupant", "llum de pantalla", "emoció", "ritme", "magia"],
      detalls: ["olor de palomites", "so del començament", "llum que baixa", "aplaudiment final"],
      tancaments: ["va sortir taral·lejant la cançó", "va guardar aquella escena al cap", "va entendre per què li agrada tant"]
    },
    la_gastronomia: {
      persones: ["En Pere", "La Júlia", "En Marc", "La Laura", "En Ferran", "La Mar", "En Sergi", "La Clàudia"],
      llocs: ["restaurant", "mercat", "cuina", "fira", "parada", "bar", "terrassa", "tenda"],
      objectes: ["pa amb tomàquet", "crema catalana", "calçot", "escudella", "vi", "cava", "formatge", "fruita", "oli", "salsa", "postres", "cullera"],
      temps: ["avui", "ahir", "demà", "aquest mes", "al migdia", "al vespre", "diumenge", "sovint"],
      verbs: ["prova", "cuina", "compra", "menja", "beu", "prepara", "serveix", "tasta", "corta", "barreja", "ofereix", "gaudeix"],
      conectores: ["Després", "Llavors", "A més", "Però", "Així que", "Finalment", "També", "Quan"],
      marcadors_temporals: ["Primer", "Després", "Llavors", "Mentre", "Quan", "Al final", "Ara", "Abans"],
      pronoms: ["Ell", "Ella", "Aquest", "Aquesta", "En Pere també", "La Júlia també"],
      causa_efecte: ["Per això", "Així que", "Per tant", "Com que", "Però", "Tot i que"],
      atmosfera: ["olor de forn", "gust dolç", "calor de cuina", "color viu", "sabor intens", "pau"],
      detalls: ["gust de crema cremada", "olor de julivert fresc", "color daurat", "textura suau"],
      tancaments: ["va acabar llepant-se els dits", "va prometre repetir el plat", "va entendre que menjar bé és una festa"]
    },
    la_moda_i_estil: {
      persones: ["La Carla", "En Alex", "La Eva", "En David", "La Mireia", "En Oriol", "La Gisela", "En Martí"],
      llocs: ["botiga", "carrer", "casa", "mercat", "vestidor", "aparador", "desfilada", "armari"],
      objectes: ["camisa", "pantalons", "sabates", "barret", "bufanda", "bossa", "ulleres", "rellotge", "jaqueta", "faldilla", "cinturó", "mirall"],
      temps: ["avui", "ahir", "demà", "aquest mes", "a la tarda", "diumenge", "sovint", "ara"],
      verbs: ["compra", "prova", "posa", "mira", "tria", "combina", "porta", "regala", "canvia", "lluix", "neteja", "ordena"],
      conectores: ["Després", "Llavors", "A més", "Però", "Així que", "Finalment", "També", "Quan"],
      marcadors_temporals: ["Primer", "Després", "Llavors", "Mentre", "Quan", "Al final", "Ara", "Abans"],
      pronoms: ["Ell", "Ella", "Aquest", "Aquesta", "La Carla també", "En Alex també"],
      causa_efecte: ["Per això", "Així que", "Per tant", "Com que", "Però", "Tot i que"],
      atmosfera: ["llum clara", "color suau", "estil net", "ordre", "elegància", "calma"],
      detalls: ["reflex al mirall", "teixit suau al tacte", "color que combina", "brillantor del metall"],
      tancaments: ["va sortir amb un somriure nou", "va entendre que vestir-se també és parlar", "va guardar aquella peça per ocasions especials"]
    }
  },
  b1: {
    la_diada_i_tradicio: {
      persones: ["La Sofía", "En Pere", "La Júlia", "En Toni", "La Núria", "En Bernat", "La Sílvia", "En Roger"],
      llocs: ["plaça Sant Jaume", "balcó", "carrer", "palau", "parlament", "avinguda", "escenari", "monument"],
      objectes: ["senyera", "rosa", "llibre", "castell humà", "trabucaire", "sardana", "cant", "discurs", "corona", "pancarta", "banderola", "ram"],
      temps: ["l’11 de setembre", "aquest any", "cada any", "recentment", "al matí", "a la tarda", "ahir", "demà"],
      verbs: ["celebra", "canta", "balla", "aixeca", "porta", "llegeix", "recorda", "honora", "defensa", "reuneix", "marxa", "commemora"],
      conectores: ["Tanmateix", "A més", "Però", "Així que", "Finalment", "També", "Quan", "Per tant"],
      marcadors_temporals: ["Primer", "Després", "Llavors", "Mentre", "Quan", "Al final", "Ara", "Abans"],
      pronoms: ["Ell", "Ella", "Aquest", "Aquesta", "La Sofía també", "En Pere també"],
      causa_efecte: ["Per tant", "Així que", "Com que", "Tot i que", "Encara que", "Malgrat que"],
      atmosfera: ["orgull", "respecte", "veu col·lectiva", "silenci solemne", "llum de tarda", "memòria"],
      detalls: ["so de la sardana", "olor de rosa fresca", "veu que tremola", "silenci compartit"],
      tancaments: ["va sentir que formava part de quelcom gran", "va guardar la rosa com un record", "va entendre per què tornava cada any"]
    },
    la_ciencia_i_tecnologia: {
      persones: ["En Alex", "La Marta", "En David", "La Núria", "En Pol", "La Berta", "En Marc", "La Laura"],
      llocs: ["laboratori", "universitat", "empresa", "conferència", "despatx", "aula", "centre", "fira"],
      objectes: ["ordinador", "robot", "aplicació", "dada", "experiment", "informe", "prova", "resultat", "sensor", "codi", "gràfic", "pantalla"],
      temps: ["aquest mes", "recentment", "avui", "la setmana passada", "ahir", "demà", "sovint", "ara"],
      verbs: ["investiga", "analitza", "presenta", "desenvolupa", "prova", "publica", "descobreix", "explica", "programa", "mesura", "compara", "avalua"],
      conectores: ["Tanmateix", "A més", "Però", "Així que", "Finalment", "També", "Quan", "Per tant"],
      marcadors_temporals: ["Primer", "Després", "Llavors", "Mentre", "Quan", "Al final", "Ara", "Abans"],
      pronoms: ["Ell", "Ella", "Aquest", "Aquesta", "En Alex també", "La Marta també"],
      causa_efecte: ["Per tant", "Així que", "Com que", "Tot i que", "Encara que", "Malgrat que"],
      atmosfera: ["llum freda", "silenci concentrat", "ritme ràpid", "curiositat", "precisió", "descoberta"],
      detalls: ["brillantor de la pantalla", "soroll suau del ventilador", "llum verda d’un led", "olor de plàstic nou"],
      tancaments: ["va veure una porta nova oberta", "va entendre que preguntar val la pena", "va guardar el gràfic com un trofeu"]
    },
    el_cinema_català: {
      persones: ["La Carla", "En Jordi", "La Eva", "En Pere", "La Mireia", "En Oriol", "La Gisela", "En Martí"],
      llocs: ["festival", "cinema", "estudi", "premi", "sala", "teatre", "catifa vermella", "auditori"],
      objectes: ["pel·lícula", "guió", "actor", "càmera", "premi", "cartell", "entrevista", "crítica", "escena", "so", "muntatge", "trofeu"],
      temps: ["aquest mes", "l’any passat", "recentment", "avui", "ahir", "demà", "sovint", "a la nit"],
      verbs: ["dirigeix", "interpreta", "guanya", "presenta", "grava", "edita", "estrena", "analitza", "produeix", "narrar", "filma", "reconeix"],
      conectores: ["Tanmateix", "A més", "Però", "Així que", "Finalment", "També", "Quan", "Per tant"],
      marcadors_temporals: ["Primer", "Després", "Llavors", "Mentre", "Quan", "Al final", "Ara", "Abans"],
      pronoms: ["Ell", "Ella", "Aquest", "Aquesta", "La Carla també", "En Jordi també"],
      causa_efecte: ["Per tant", "Així que", "Com que", "Tot i que", "Encara que", "Malgrat que"],
      atmosfera: ["llum tènue", "aplaudiment", "emoció continguda", "magia", "silenci abans de començar", "orgull"],
      detalls: ["brillantor de la catifa", "so del micròfon", "llum dels focus", "murmuri del públic"],
      tancaments: ["va sortir amb el nom a la boca", "va guardar el trofeu com un somni", "va entendre que contar històries cura"]
    },
    la_musica_i_festivals: {
      persones: ["En Toni", "La Júlia", "En Marc", "La Laura", "En Ferran", "La Mar", "En Sergi", "La Clàudia"],
      llocs: ["festival", "escenari", "plaça", "sala de concerts", "auditori", "carrer", "parc", "platja"],
      objectes: ["concert", "grup", "cançó", "micròfon", "guitarra", "entrada", "públic", "so", "bateria", "baix", "teclat", "altaveu"],
      temps: ["aquest estiu", "la setmana passada", "avui", "demà", "a la nit", "diumenge", "sovint", "ara"],
      verbs: ["toca", "canta", "organitza", "assisteix", "grava", "balla", "acompanya", "compon", "assaja", "mescla", "presenta", "gaudeix"],
      conectores: ["Tanmateix", "A més", "Però", "Així que", "Finalment", "També", "Quan", "Per tant"],
      marcadors_temporals: ["Primer", "Després", "Llavors", "Mentre", "Quan", "Al final", "Ara", "Abans"],
      pronoms: ["Ell", "Ella", "Aquest", "Aquesta", "En Toni també", "La Júlia també"],
      causa_efecte: ["Per tant", "Així que", "Com que", "Tot i que", "Encara que", "Malgrat que"],
      atmosfera: ["so potent", "llum de colors", "energia", "ritme", "alegria", "complicitat"],
      detalls: ["vibració del baix", "olor de gespa trepitjada", "llum que banya la cara", "veu que s’uneix al cor"],
      tancaments: ["va marxar amb la cançó al cap", "va entendre que la música uneix", "va guardar aquell moment com un tresor"]
    }
  }
};

// ===== SISTEMA D'ENERGIA =====

// Regenera 1 punt cada 5 minuts
function recargarEnergia() {
  const MAX_ENERGIA = 100;
  const MINUTOS_POR_PUNTO = 5;

  let ara = Date.now();
  let diffMinuts = Math.floor((ara - estat.ultimaRecargaEnergia) / 60000);
  let puntsARecuperar = Math.floor(diffMinuts / MINUTOS_POR_PUNTO);

  if (puntsARecuperar > 0) {
    estat.energia = Math.min(MAX_ENERGIA, estat.energia + puntsARecuperar);
    estat.ultimaRecargaEnergia += puntsARecuperar * MINUTOS_POR_PUNTO * 60000;
    guardarEstat();
  }
}

// Recarregar a 100 per 50 monedes
function recargarConMonedes() {
  const COSTE = 50;
  const MAX_ENERGIA = 100;

  if (estat.monedes < COSTE) {
    mostrarModal(LANG.no_prou_monedes);
    return;
  }
  if (estat.energia >= MAX_ENERGIA) {
    mostrarModal("Ja tens l’energia al màxim");
    return;
  }

  vibrar();
  estat.monedes -= COSTE;
  estat.energia = MAX_ENERGIA;
  estat.ultimaRecargaEnergia = Date.now();

  guardarEstat();
  actualitzarUI();
  cargarLectura();
  mostrarModal("Energia recarregada a 100!");
}

// ===== LECTURA =====

function cargarLectura() {
  recargarEnergia();

  let num = estat.progres.nivellActualMapa;
  let nivell = mapaNivellALletra(num);
  let contextos = BANCO_VOCAB[nivell];

  if (!contextos) {
    document.getElementById('lectura-contenidor').innerHTML = "Encara no hi ha lectures d’aquest nivell.";
    return;
  }

  let primerTema = Object.keys(contextos)[0].replace(/_/g,' ').replace(/^la |^el /,'');
  let minutsPerSeguent = 5 - Math.floor((Date.now() - estat.ultimaRecargaEnergia) / 60000) % 5;
  if (estat.energia >= 100) minutsPerSeguent = 0;

  document.getElementById('lectura-contenidor').innerHTML = `
    <div style="text-align:center; padding:20px; opacity:0.8;">
      <div style="font-size:48px; margin-bottom:10px;">📖</div>
      <div style="font-size:16px; margin-bottom:10px;">
        Nivell ${nivell.toUpperCase()} - ${primerTema}
      </div>
      <div style="font-size:14px; opacity:0.7; margin-bottom:10px;">
        Energia: ${estat.energia}/100
      </div>
      ${estat.energia < 100?
        `<div style="font-size:12px; opacity:0.6; margin-bottom:10px;">Següent punt en ${minutsPerSeguent} min</div>` :
        ''}
      <div style="font-size:14px; opacity:0.7; margin:10px 0;">
        Generar Lectura costa 10 energia
      </div>
      ${estat.energia < 100 && estat.monedes >= 50?
        `<button class="btn btn-sec" onclick="recargarConMonedes()" style="width:100%; margin-top:10px;">
          ⚡ Recarregar a 100 per 50 🪙
        </button>` : ''}
    </div>
  `;
}

function generarLectura() {
  if (estat.energia < 10) return mostrarModal(LANG.energy_low);
  estat.energia -= 10;
  estat.ultimaRecargaEnergia = Date.now();
  guardarEstat();
  actualitzarUI();

  let num = estat.progres.nivellActualMapa;
  let nivell = mapaNivellALletra(num);
  let contextos = BANCO_VOCAB[nivell];

  if (!contextos) {
    document.getElementById('lectura-contenidor').innerHTML = "Encara no hi ha lectures d’aquest nivell.";
    return;
  }

  let keys = Object.keys(contextos);
  let temaKey = keys[Math.floor(Math.random() * keys.length)];
  let h = contextos[temaKey];
  let protagonista = h.persones[Math.floor(Math.random() * h.persones.length)];
  let pronom = protagonista.startsWith("La")? "ella" : "ell";

  let get = arr => arr[Math.floor(Math.random() * arr.length)];

  let lloc = get(h.llocs);
  let verb1 = get(h.verbs);
  let obj1 = get(h.objectes);
  let verb2 = get(h.verbs);
  let obj2 = get(h.objectes);
  let verb3 = get(h.verbs);
  let obj3 = get(h.objectes);

  let text = `${protagonista} ${verb1} ${obj1} pel ${lloc}. `;
  text += `Eren ${get(h.temps)} i tot tenia un toc de ${get(h.atmosfera)}. `;
  text += `${get(h.conectores)}, ${pronom} va sentir ${get(h.detalls)}. `; // <- aquí el fix
  text += `${get(h.causa_efecte)}, ${pronom} va haver de ${verb2} ${obj2}. `;
  text += `Així que ${pronom} ${verb3} ${obj3}. `;
  text += get(h.tancaments) + ".";

  let vocab = [...new Set([...h.llocs,...h.objectes,...h.verbs])].sort(() => 0.5 - Math.random()).slice(0, 6);
  let textAmbHighlight = text;
  vocab.forEach(p => {
    const re = new RegExp(`\\b${p}\\b`, 'gi');
    textAmbHighlight = textAmbHighlight.replace(re, `<span style="color:#4CAF50; font-weight:bold;">${p}</span>`);
  });

  let nota = nivell === "a1"? "Nota: En català posem l'article abans del nom: <i>la casa, el llibre</i>" :
             nivell === "a2"? "Nota: Usem el passat perifràstic: <i>vaig anar, va estudiar</i>" :
             "Nota: El subjuntiu s'usa després de <i>que</i>: <i>vull que vinguis</i>";

  let vocabHTML = vocab.map(p =>
    `<div style="display:flex; justify-content:space-between; margin:4px 0; font-size:15px;">
      <span style="color:#4CAF50;">${p}</span>
      <span style="opacity:0.8;">${p}</span>
    </div>`
  ).join('');

  document.getElementById('lectura-contenidor').innerHTML = `
    <div style="margin-bottom:15px; line-height:1.8; font-size:16px; text-align:justify;">${textAmbHighlight}</div>
    <div style="background:#1f1f1f; padding:14px; border-radius:10px; margin-bottom:15px;">
      <div style="color:#4CAF50; font-weight:bold; font-size:16px; margin-bottom:10px;">
        Vocabulari del tema: ${temaKey.replace(/_/g,' ').replace(/^la |^el /,'')}
      </div>
      ${vocabHTML}
    </div>
    <div style="background:#1a2a1a; padding:12px; border-radius:8px; margin-bottom:15px; font-size:14px; border-left:3px solid #4CAF50;">
      ${nota}
    </div>
    <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;">
      <div style="font-weight:bold; margin-bottom:6px;">Pregunta de comprensió:</div>
      <div>Què descobreix ${protagonista} al final de la història?</div>
    </div>
  `;
  guardarEstat();
}

// ===== TIPS =====
const dadesTips = {
  a1: [
    {truc: "El per masculí singular, La per femení singular", exemple: "El gat, La gata"},
    {truc: "Els per masculí plural, Les per femení plural", exemple: "Els gats, Les gates"},
    {truc: "Un/Una per indefinits singulars", exemple: "Un llibre, Una taula"},
    {truc: "Uns/Unes per indefinits plurals", exemple: "Uns llibres, Unes taules"},
    {truc: "Jo + verb en 1a persona singular", exemple: "Jo parlo"},
    {truc: "Tu + verb en 2a persona singular", exemple: "Tu parles"},
    {truc: "Ell/ella + verb en 3a persona singular", exemple: "Ell parla"},
    {truc: "Nosaltres + verb en 1a persona plural", exemple: "Nosaltres parlem"},
    {truc: "Vosaltres + verb en 2a persona plural", exemple: "Vosaltres parleu"},
    {truc: "Ells/elles + verb en 3a persona plural", exemple: "Ells parlen"},
    {truc: "Ser = ésser permanent", exemple: "Jo sóc català"},
    {truc: "Estar = estat temporal", exemple: "Estic cansat"},
    {truc: "Tenir = possessió", exemple: "Tinc un llibre"},
    {truc: "Fer = acció", exemple: "Faig els deures"},
    {truc: "Anar = moviment", exemple: "Vaig a casa"},
    {truc: "Bon dia per saludar al matí", exemple: "Bon dia! Com estàs?"},
    {truc: "Bona tarda per saludar a la tarda", exemple: "Bona tarda!"},
    {truc: "Bona nit per acomiadar-se", exemple: "Bona nit!"},
    {truc: "Si us plau = por favor", exemple: "Si us plau, ajuda'm"},
    {truc: "Gràcies = gracias", exemple: "Gràcies per tot"},
    {truc: "De res = de nada", exemple: "De res!"},
    {truc: "Quant costa? per preguntar preu", exemple: "Quant costa això?"},
    {truc: "Quant és? per preguntar hora", exemple: "Quant és?"},
    {truc: "On és? per preguntar lloc", exemple: "On és el lavabo?"},
    {truc: "Com et dius? per preguntar nom", exemple: "Com et dius?"},
    {truc: "Em dic = me llamo", exemple: "Em dic Joan"},
    {truc: "Quin/quina per preguntar qualitat", exemple: "Quin color t’agrada?"},
    {truc: "Quants/quantes per preguntar quantitat", exemple: "Quants anys tens?"},
    {truc: "Aquest/aqueste/aquests/aquestes = este/esta/estos/estas", exemple: "Aquest llibre"},
    {truc: "Aquell/aquella/aquells/aquelles = aquel/aquella/aquellos/aquellas", exemple: "Aquell cotxe"}
  ],
  a2: [
    {truc: "NY es pronuncia com ñ d'espanyol", exemple: "Any = Añ, Seny = Señ"},
    {truc: "Bon dia = Buenos días", exemple: "Bon dia! Com estàs?"},
    {truc: "Passat perifràstic: vaig + infinitiu", exemple: "Vaig menjar"},
    {truc: "Futur pròxim: anar a + infinitiu", exemple: "Vaig a estudiar"},
    {truc: "Pronoms febles van davant del verb", exemple: "Me'l dono"},
    {truc: "Negació: no + verb", exemple: "No parlo"},
    {truc: "Interrogació: posar el verb davant", exemple: "Parles català?"},
    {truc: "Perquè = porque pregunta/resposta", exemple: "Perquè sí"},
    {truc: "Per a = para + infinitiu", exemple: "És per a tu"},
    {truc: "De + nom = de", exemple: "El llibre de Joan"},
    {truc: "A + nom = a", exemple: "Vaig a casa"},
    {truc: "En + lloc = en", exemple: "Estic en classe"},
    {truc: "Amb + nom = con", exemple: "Amb amics"},
    {truc: "Sense + nom = sin", exemple: "Sense sucre"},
    {truc: "Molt + adjectiu = muy", exemple: "Molt bonic"},
    {truc: "Massa + nom = demasiado", exemple: "Massa feina"},
    {truc: "Poc + nom = poco", exemple: "Poc temps"},
    {truc: "Gaire + nom = mucho en negació", exemple: "No tinc gaire temps"},
    {truc: "Encara = todavía", exemple: "Encara no"},
    {truc: "Ja = ya", exemple: "Ja he acabat"},
    {truc: "Tampoc = tampoco", exemple: "Jo tampoc"},
    {truc: "Ni... ni = ni... ni", exemple: "Ni cafè ni te"},
    {truc: "O... o = o... o", exemple: "O vens o no"},
    {truc: "I = y", exemple: "Pa i vi"},
    {truc: "Però = pero", exemple: "Vinc però tard"},
    {truc: "Que = que", exemple: "Crec que sí"},
    {truc: "Quan = cuando", exemple: "Quan arribis"},
    {truc: "Si = si", exemple: "Si vols"},
    {truc: "Com = como", exemple: "Com estàs?"}
  ],
  b1: [
    {truc: "Apòstrof L' D' N' S' davant vocal", exemple: "L'home, D'aigua, N'hi ha, S'obre"},
    {truc: "Accent greu È Ò obre el so de la vocal", exemple: "Pèra, Còp, Tròs"},
    {truc: "Accent agut É Ó tanca el so de la vocal", exemple: "Café, Córrer, Nóvio"},
    {truc: "È vs É canvia el significat", exemple: "Pès = pes, Pés = pies"},
    {truc: "Subjuntiu present: que + verb", exemple: "Vull que vinguis"},
    {truc: "Condicional: verb + ia/ies/ia/íem/íeu/ien", exemple: "Vindria"},
    {truc: "Pronom hi = en/aquí", exemple: "Hi vaig"},
    {truc: "Pronom en = de", exemple: "En vull"},
    {truc: "Pronom ho = neutre", exemple: "Ho sé"},
    {truc: "Combinació pronom + pronom", exemple: "Me'l, Te'l, Se'l"},
    {truc: "Passat perifràstic per accions puntuals", exemple: "Ahir vaig anar"},
    {truc: "Imperfet per accions habituals passades", exemple: "Abans anava"},
    {truc: "Perifrasi incoativa: posar-se a + infinitiu", exemple: "Es va posar a ploure"},
    {truc: "Perifrasi durativa: estar + gerundi", exemple: "Estic llegint"},
    {truc: "Gerundi = -ant/-ent", exemple: "Cantant, Bevent"},
    {truc: "Participi = -at/-it/-ut", exemple: "Parlat, Begut"},
    {truc: "Relatius: que, qui, el qual", exemple: "El llibre que llegeixo"},
    {truc: "Comparatiu: més/menys... que", exemple: "Més gran que tu"}
  ]
};

let tipsUsats = {a1: [], a2: [], b1: []};

function carregarTips() {
  let num = estat.progres.nivellActualMapa;
  let nivell = mapaNivellALletra(num);
  let llistatTips = dadesTips[nivell];

  const cont = document.getElementById('tips-contenidor');
  if (!llistatTips || llistatTips.length === 0) {
    cont.innerHTML = `<div style="text-align:center; opacity:0.6; padding:40px;">Encara no hi ha tips per aquest nivell</div>`;
    return;
  }

  if (tipsUsats[nivell].length >= llistatTips.length) {
    tipsUsats[nivell] = [];
  }

  let indexDisponibles = llistatTips.map((_, i) => i).filter(i =>!tipsUsats[nivell].includes(i));
  let indexAleatori = indexDisponibles[Math.floor(Math.random()*indexDisponibles.length)];
  tipsUsats[nivell].push(indexAleatori);

  let tip = llistatTips[indexAleatori];
  cont.innerHTML = `
    <div style="background:#1a1a1a; padding:20px; border-radius:12px; margin-bottom:15px;">
      <div style="font-size:18px; margin-bottom:10px;">💡 ${tip.truc}</div>
      <div style="opacity:0.7; font-size:14px;">Exemple: ${tip.exemple}</div>
    </div>
    <button class="btn" onclick="carregarTips()" style="width:100%;">Següent Tip</button>
  `;
}

// ===== BOTIGA =====
async function carregarBotiga() {
  const cont = document.getElementById('botiga-contenidor');
  try {
    const res = await fetch('./data/botiga_emojis.json');
    if(res.ok) {
      const data = await res.json();
      estat.packs_botiga = data;
      renderitzarBotiga();
    }
  } catch(e) {
    cont.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:#f44336;">Error: ${e.message}</div>`;
  }
}

function renderitzarBotiga() {
  const cont = document.getElementById('botiga-contenidor');
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
      <button class="btn ${comprat? 'btn-sec' : ''}" onclick="comprarPack('${pack.id}', ${pack.preu}, event)" ${comprat? 'disabled' : ''}>
        ${comprat? LANG.comprat : `🪙 ${pack.preu}`}
      </button>
    `;
    cont.appendChild(card);
  });
}

async function comprarPack(id, preu, event) {
  if (event) event.stopPropagation();
  if (estat.monedes < preu) { mostrarModal(LANG.no_prou_monedes); return; }
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

// REGISTRAR SERVICE WORKER
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW error:', err));
}
      