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
    nivell: "Nivell", desbloquejat: "Desbloquejat!", et_falten: "Et falten", frases: "frases"
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

// ===== INICIALITZACIÓ =====
document.addEventListener('DOMContentLoaded', async () => {
  aplicarIdioma();
  await carregarDades();
  actualitzarUI();
  carregarMapa();
  carregarBotiga();
  carregarTips();
  carregarLectura();
  mostrarBibliotecaTab('diccionari', null);
});

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
  const tabEl = document.getElementById('tab-'+tab);
  if(!tabEl) return;
  tabEl.classList.add('active');
  if(e) e.target.closest('.nav-item').classList.add('active');

  if(tab === 'mapa') carregarMapa();
  if(tab === 'missio') carregarMissioTab();
  if(tab === 'gremi') mostrarBibliotecaTab('diccionari', null);
  if(tab === 'lectura') carregarLectura();
  if(tab === 'tips') carregarTips();
  if(tab === 'botiga') carregarBotiga();
}

function guardarEstat() {
  localStorage.setItem('cat_monedes', estat.monedes);
  localStorage.setItem('cat_compres', JSON.stringify(estat.compres));
  localStorage.setItem('cat_emojis', JSON.stringify(estat.emojisDesbloquejats));
  localStorage.setItem('cat_progres', JSON.stringify(estat.progres));
}

function actualitzarUI() {
  document.getElementById('monedes').innerHTML = `${estat.monedes} <span id="text-monedes">${LANG.monedes}</span>`;
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
const lectures = {
  a1: [
    {
      titol: "Un dia a la ciutat",
      text: "La Maria es desperta a les vuit del matí. Fa sol i el cel és blau. Ella es renta la cara i es vesteix. Pren el cafè amb pa i mantega. Surt de casa i tanca la porta. Va caminant cap a la feina. Saluda els seus veïns pel carrer. Compra un diari al quiosc. Arriba a l’oficina a les nou. Treballa amb l’ordinador tot el dia.",
      vocabulari: [
        {cat:"es desperta",es:"se despierta"},
        {cat:"es vesteix",es:"se viste"},
        {cat:"quiosc",es:"quiosco"},
        {cat:"ordinador",es:"ordenador"},
        {cat:"veïns",es:"vecinos"},
        {cat:"matí",es:"mañana"},
        {cat:"renta",es:"lava"},
        {cat:"mantega",es:"mantequilla"},
        {cat:"surt",es:"sale"},
        {cat:"camina",es:"camina"}
      ],
      pregunta: "A quina hora arriba la Maria a la feina?",
      resposta: "A les nou"
    }
  ],
  a2: [
    {
      titol: "Un cap de setmana diferent",
      text: "Dissabte passat vaig anar al cinema amb els meus amics. Vam veure una pel·lícula d’acció molt divertida. Després vam anar a sopar a un restaurant italià. Jo vaig demanar pizza i ells van demanar pasta. Mentre menjàvem, parlàvem de les vacances d’estiu. Vam decidir que aniríem a la platja l’agost. Diumenge vaig llevar-me tard i vaig esmorzar amb la meva família. A la tarda vaig netejar la meva habitació. Vaig escoltar música mentre ho feia. Va ser un cap de setmana molt relaxant.",
      vocabulari: [
        {cat:"cap de setmana",es:"fin de semana"},
        {cat:"vam veure",es:"vimos"},
        {cat:"mentre",es:"mientras"},
        {cat:"aniríem",es:"iríamos"},
        {cat:"llevar-me",es:"levantarme"},
        {cat:"dissabte",es:"sábado"},
        {cat:"pel·lícula",es:"película"},
        {cat:"demanar",es:"pedir"},
        {cat:"esmorzar",es:"desayunar"},
        {cat:"relaxant",es:"relajante"}
      ],
      pregunta: "Què van decidir fer l’agost?",
      resposta: "Anar a la platja"
    }
  ],
  b1: [
    {
      titol: "Una decisió important",
      text: "Fa temps que penso que hauria de canviar de feina. El meu cap no em tracta gaire bé i no estic content. M’agradaria trobar una feina on pugui créixer professionalment. He estat buscant ofertes per internet aquesta setmana. He trobat una empresa que em sembla interessant. Si m’acceptessin, hauria de treballar més hores. Però també guanyaria més diners i aprendria coses noves. Els meus pares em diuen que ho pensi bé abans de decidir. Jo crec que el més important és ser feliç amb el que fas. Demà trucaré per demanar una entrevista.",
      vocabulari: [
        {cat:"hauria de",es:"debería"},
        {cat:"pugui",es:"pueda"},
        {cat:"si m’acceptessin",es:"si me aceptaran"},
        {cat:"guanyaria",es:"ganaría"},
        {cat:"el que fas",es:"lo que haces"},
        {cat:"tracta",es:"trata"},
        {cat:"créixer",es:"crecer"},
        {cat:"ofertes",es:"ofertas"},
        {cat:"important",es:"importante"},
        {cat:"entrevista",es:"entrevista"}
      ],
      pregunta: "Què farà demà l’usuari?",
      resposta: "Trucarà per demanar una entrevista"
    }
  ]
};

let lecturesUsades = {a1: [], a2: [], b1: []};

function carregarLectura() {
  const cont = document.getElementById('lectura-contenidor');
  cont.innerHTML = `
    <h3 style="text-align:center; margin-bottom:15px;">${LANG.lectura_titol} - ${LANG.nivell} ${estat.progres.nivellActualMapa}</h3>
    <div id="lectura-content" style="background:#1a1a1a; padding:20px; border-radius:12px; min-height:150px; font-size:16px; line-height:1.6; margin-bottom:15px;">
      Prem "${LANG.lectura_btn}" per generar una lectura nova
    </div>
    <button class="btn" onclick="generarLectura()" style="width:100%;">${LANG.lectura_btn}</button>
  `;
}

function generarLectura() {
  let num = estat.progres.nivellActualMapa;
  let nivell = mapaNivellALletra(num);
  let llistatLectures = lectures[nivell];

  if (!llistatLectures || llistatLectures.length === 0) {
    document.getElementById('lectura-content').innerHTML = "Encara no hi ha lectures d’aquest nivell.";
    return;
  }

  if (lecturesUsades[nivell].length >= llistatLectures.length) {
    lecturesUsades[nivell] = [];
  }

  let indexDisponibles = llistatLectures.map((_, i) => i).filter(i =>!lecturesUsades[nivell].includes(i));
  let indexAleatori = indexDisponibles[Math.floor(Math.random()*indexDisponibles.length)];
  lecturesUsades[nivell].push(indexAleatori);

  let lectura = llistatLectures[indexAleatori];

  let vocabulariHTML = lectura.vocabulari.map(v =>
    `<div style="display:flex; justify-content:space-between; margin:4px 0; font-size:14px;">
      <span style="color:#4CAF50;">${v.cat}</span>
      <span style="opacity:0.7;">${v.es}</span>
    </div>`
  ).join('');

  let html = `
    <div style="margin-bottom:15px;">
      <h4 style="margin:0 0 12px 0; color:#4CAF50; font-size:18px;">${lectura.titol}</h4>
      <p style="margin:0 0 15px 0; text-align:justify;">${lectura.text}</p>
    </div>
    <div style="background:rgba(255,255,255,0.05); padding:12px; border-radius:8px; margin-bottom:15px;">
      <strong style="color:#4CAF50;">Vocabulari nou:</strong>
      ${vocabulariHTML}
    </div>
    <div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;">
      <strong>Pregunta:</strong> ${lectura.pregunta}<br>
      <span style="opacity:0.6; font-size:14px;">Resposta: ${lectura.resposta}</span>
    </div>
  `;

  document.getElementById('lectura-content').innerHTML = html;
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

function actualitzarUI() {
  document.getElementById('monedes').innerHTML = `🪙 ${estat.monedes} <span id="text-monedes">${LANG.monedes}</span>`;
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
