/* Curated all-international 60s/70s psychedelic + global/ethnic playlist builder.
   Rule: exactly one track per artist, target 60 tracks, never write if fewer than 50 are found. */

const ELSEWHERE_TARGET = 60;
const ELSEWHERE_MINIMUM = 50;

const ELSEWHERE_CANDIDATES = [
  ['WITCH','Lazy Bones!!'],
  ['Amanaz','Khala My Friend'],
  ['Ngozi Family','Hold On'],
  ['Ofege',"It's Not Easy"],
  ['Blo','Chant to Mother Earth'],
  ['The Funkees','Akula Owu Onyeara'],
  ['Psychedelic Aliens',"We're Laughing"],
  ['Rob','Make It Fast, Make It Slow'],
  ['Fela Kuti','Water No Get Enemy'],
  ['William Onyeabor','Atomic Bomb'],
  ['Sir Victor Uwaifo','Guitar Boy'],
  ['Orchestre Poly-Rythmo de Cotonou','Gbeti Madjro'],
  ['Mulatu Astatke','Yègellé Tezeta'],
  ['Mahmoud Ahmed','Ere Mela Mela'],
  ['Alemayehu Eshete','Telantena Zare'],
  ['Osibisa','Music for Gong Gong'],
  ['Assagai','Telephone Girl'],
  ['Demon Fuzz','Hymn to Mother Earth'],
  ['Kourosh Yaghmaei','Gole Yakh'],
  ['Mehrpouya','Ghabileh-ye Leili'],
  ['Omar Khorshid','Rakset El Fadaa'],
  ['Elias Rahbani','Dance of Maria'],
  ['Ziad Rahbani','Abu Ali'],
  ['Issam Hajali','Ana Damir El Motakallim'],
  ['Ferkat Al Ard','Oghneya'],
  ['Ahmed Fakroun','Nisyan'],
  ['Nass El Ghiwane','Mahmouma'],
  ['Les Variations','Moroccan Roll'],
  ['Ananda Shankar','Dancing Drums'],
  ['Atomic Forest',"Obsession '77"],
  ["Flower Travellin' Band",'Satori Part I'],
  ['Speed, Glue & Shinki','Mr. Walking Drugstore Man'],
  ['Far East Family Band','Nipponjin'],
  ['The Mops',"I'm Just a Mops"],
  ['Kim Jung Mi','Haenim'],
  ['Shark Move','My Life'],
  ['Benny Soebardja','Wise World'],
  ['The Rollies','Bad News'],
  ['Os Mutantes','A Minha Menina'],
  ['Gal Costa','Tuareg'],
  ['Novos Baianos','A Menina Dança'],
  ['Secos & Molhados','Sangue Latino'],
  ['Los Jaivas','Mira Niñita'],
  ['Aguaturbia','Erotica'],
  ['Los Blops','Los Momentos'],
  ['Pescado Rabioso','Bajan'],
  ['Invisible','Durazno Sangrando'],
  ['Almendra','Color Humano'],
  ['Arco Iris','Mañana Campestre'],
  ["Los Dug Dug's",'Lost in My World'],
  ['La Revolución de Emiliano Zapata','Nasty Sex'],
  ['Traffic Sound','Meshkalina'],
  ['Laghonia','Bahia'],
  ['We All Together','Hey Revolution'],
  ['Los Shakers','Always You'],
  ['Juaneco y Su Combo','Ya Se Ha Muerto Mi Abuelo'],
  ['Los Destellos','Elsa'],
  ['Can','Vitamin C'],
  ['Amon Düül II','Archangel Thunderbird'],
  ['NEU!','Hallogallo'],
  ['Faust','Jennifer'],
  ['Popol Vuh','Aguirre I'],
  ['Agitation Free','You Play for Us Today'],
  ['Embryo','Radio Marrakesch'],
  ['Guru Guru','Der LSD-Marsch'],
  ['Area','Luglio, Agosto, Settembre (Nero)'],
  ["Aphrodite's Child",'The Four Horsemen'],
  ['Omega','Gyöngyhajú lány'],
  ['Group 1850','Mother No-Head'],
  ['Q65','The Life I Live'],
  ['The Savage Rose','Long Before I Was Born'],
  ["The Masters Apprentices",'War or Hands of Time'],
  ['Spectrum',"I'll Be Gone"],
  ['Human Instinct','Black Sally'],
  ['Black Merda','Cynthy-Ruth'],
  ['Rotary Connection','I Am the Black Gold of the Sun'],
  ['Funkadelic','Maggot Brain'],
  ['Shuggie Otis','Inspiration Information'],
  ['Cymande','Dove'],
  ['Exuma','Exuma, the Obeah Man'],
  ['Dr. John','Gris-Gris Gumbo Ya Ya'],
  ['Quintessence',"Shiva's Chant"],
  ['Third Ear Band','Druid One'],
  ['The Incredible String Band','A Very Cellular Song'],
  ['Kaleidoscope','Egyptian Gardens'],
  ["The Devil's Anvil",'Wala Dai'],
  ['Santana','Soul Sacrifice'],
  ['Silver Apples','Oscillations'],
  ['The United States of America','The American Metaphysical Circus'],
  ['Love','Alone Again Or'],
  ['The 13th Floor Elevators',"You're Gonna Miss Me"],
  ['Jefferson Airplane','White Rabbit'],
  ['The Jimi Hendrix Experience','Voodoo Child (Slight Return)']
];

const ELSEWHERE_ALIASES = {
  'sir victor uwaifo':['victor uwaifo','sir victor uwaifo'],
  'orchestre poly rythmo de cotonou':['orchestre poly rythmo','poly rythmo'],
  'flower travellin band':['flower travellin band'],
  'speed glue shinki':['speed glue shinki'],
  'the jimi hendrix experience':['jimi hendrix','jimi hendrix experience'],
  'the incredible string band':['incredible string band'],
  'the masters apprentices':['masters apprentices'],
  'los dug dug s':['los dug dug'],
  'juaneco y su combo':['juaneco y su combo'],
  'secos molhados':['secos molhados'],
  'neu':['neu']
};

function elsewhereNorm(s=''){
  return String(s).toLocaleLowerCase('tr-TR').normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i')
    .replace(/[^a-z0-9]+/g,' ').trim();
}

function elsewhereArtistOK(expected, track){
  const en=elsewhereNorm(expected);
  const aliases=ELSEWHERE_ALIASES[en] || [en];
  const actual=(track?.artists||[]).map(a=>elsewhereNorm(a.name));
  return actual.some(a=>aliases.some(x=>a===x || a.includes(x) || x.includes(a)));
}

function elsewhereTitleScore(expected, actual){
  const e=elsewhereNorm(expected), a=elsewhereNorm(actual);
  if(a===e) return 100;
  if(a.includes(e) || e.includes(a)) return 80;
  const toks=e.split(/\s+/).filter(x=>x.length>2);
  if(!toks.length) return 0;
  return Math.round(60*toks.filter(x=>a.includes(x)).length/toks.length);
}

async function elsewhereFindTrack(artist,title){
  const queries=[
    `track:${title} artist:${artist}`,
    `${title} ${artist}`
  ];
  let best=null,bestScore=-1;
  for(const q of queries){
    const j=await api('/search?type=track&limit=10&q='+encodeURIComponent(q));
    for(const t of (j.tracks?.items||[])){
      if(!t?.uri || !elsewhereArtistOK(artist,t)) continue;
      const score=elsewhereTitleScore(title,t.name);
      if(score>bestScore){best=t;bestScore=score;}
    }
    if(bestScore>=80) break;
    await sleep(180);
  }
  return bestScore>=35 ? best : null;
}

function selectElsewherePlaylist(){
  const sel=$('playlist');
  if(sel.value){
    const txt=sel.options[sel.selectedIndex]?.textContent||'';
    if(elsewhereNorm(txt).includes('elsewhere')) return sel.value;
  }
  const opt=[...sel.options].find(o=>elsewhereNorm(o.textContent).includes('elsewhere'));
  if(opt){ sel.value=opt.value; return opt.value; }
  return '';
}

async function buildElsewhere(){
  const id=selectElsewherePlaylist();
  if(!id) throw new Error('Önce adında “Elsewhere” geçen playlisti seç.');
  const btn=$('elsewhere');
  btn.disabled=true;
  const uris=[];
  const usedArtists=new Set();
  const missing=[];
  try{
    for(let i=0;i<ELSEWHERE_CANDIDATES.length && uris.length<ELSEWHERE_TARGET;i++){
      const [artist,title]=ELSEWHERE_CANDIDATES[i];
      const artistKey=elsewhereNorm(artist);
      if(usedArtists.has(artistKey)) continue;
      status(`Global psychedelic liste hazırlanıyor: ${uris.length}/${ELSEWHERE_TARGET}\n${artist} — ${title}`);
      const t=await elsewhereFindTrack(artist,title);
      if(t){
        uris.push(t.uri);
        usedArtists.add(artistKey);
      }else{
        missing.push(`${artist} — ${title}`);
      }
      await sleep(220);
    }
    if(uris.length<ELSEWHERE_MINIMUM){
      throw new Error(`Güvenlik nedeniyle listeye dokunmadım. Yalnız ${uris.length} sağlam eşleşme bulundu; minimum ${ELSEWHERE_MINIMUM}.`);
    }
    status(`${uris.length} farklı sanatçı bulundu. Seçili liste tek sanatçı/tek şarkı kuralıyla yeniden yazılıyor...`);
    await replaceWith(id,uris);
    status(`Bitti. ${uris.length} şarkı, ${uris.length} farklı sanatçı. Yerli sanatçı yok; aynı sanatçı iki kez yok.${missing.length?` ${missing.length} aday güvenli eşleşmediği için atlandı.`:''}`,'ok');
    await playlists();
    $('playlist').value=id;
  } finally {
    btn.disabled=false;
  }
}

window.addEventListener('load',()=>{
  const btn=$('elsewhere');
  if(btn) btn.onclick=safe(buildElsewhere);
});
