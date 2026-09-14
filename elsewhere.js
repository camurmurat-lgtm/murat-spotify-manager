/* Between ÇAMUR & Elsewhere
   All-international 60s/70s psychedelic + global groove builder.
   Rules: target 60 tracks, minimum 50, one primary artist only, no Turkish or Korean acts. */

const ELSEWHERE_TARGET = 60;
const ELSEWHERE_MINIMUM = 50;

/* First choices deliberately favor globally known / widely streamed classics.
   Deeper global-psych cuts are backups so the list keeps its ethnic/psychedelic character without turning obscure. */
const ELSEWHERE_CANDIDATES = [
  ['Jefferson Airplane','White Rabbit'],
  ['The Doors','Riders on the Storm'],
  ['The Jimi Hendrix Experience','All Along the Watchtower'],
  ['Pink Floyd','Time'],
  ['The Beatles','Tomorrow Never Knows'],
  ['The Rolling Stones','Paint It, Black'],
  ['Cream','Sunshine of Your Love'],
  ['The Zombies','Time of the Season'],
  ['The Byrds','Eight Miles High'],
  ['The Beach Boys','Good Vibrations'],
  ['Procol Harum','A Whiter Shade of Pale'],
  ['Santana','Black Magic Woman'],
  ['The Moody Blues','Nights in White Satin'],
  ['Donovan','Hurdy Gurdy Man'],
  ['Iron Butterfly','In-A-Gadda-Da-Vida'],
  ['Shocking Blue','Venus'],
  ['Steppenwolf','Magic Carpet Ride'],
  ['Traffic','Dear Mr. Fantasy'],
  ['The Who','I Can See for Miles'],
  ['The Kinks','See My Friends'],
  ['Grateful Dead','Dark Star'],
  ['Big Brother & The Holding Company','Piece of My Heart'],
  ['The Chambers Brothers','Time Has Come Today'],
  ['Tommy James & The Shondells','Crimson and Clover'],
  ['Norman Greenbaum','Spirit in the Sky'],
  ['The Animals','House of the Rising Sun'],
  ["The Mamas & The Papas","California Dreamin'"],
  ['Buffalo Springfield',"For What It's Worth"],
  ['The Guess Who','American Woman'],
  ['The Yardbirds','Shapes of Things'],
  ['Hawkwind','Silver Machine'],
  ['David Bowie','Space Oddity'],
  ['Led Zeppelin','Kashmir'],
  ['Black Sabbath','Planet Caravan'],
  ['Deep Purple','Child in Time'],
  ['Yes','Roundabout'],
  ['King Crimson','21st Century Schizoid Man'],
  ['Fleetwood Mac','Albatross'],
  ['Electric Light Orchestra','Strange Magic'],
  ['Kraftwerk','Autobahn'],
  ['Funkadelic','Maggot Brain'],
  ['Sly & The Family Stone','Family Affair'],
  ['The Temptations',"Papa Was a Rollin' Stone"],
  ['Curtis Mayfield','Move On Up'],
  ['Isaac Hayes','Walk On By'],
  ['War','Low Rider'],
  ['Marvin Gaye','Inner City Blues (Make Me Wanna Holler)'],
  ['Rare Earth','I Just Want to Celebrate'],
  ['Manu Dibango','Soul Makossa'],
  ['Hugh Masekela','Grazing in the Grass'],
  ['Miriam Makeba','Pata Pata'],
  ['Bob Marley & The Wailers','Exodus'],
  ['Peter Tosh','Legalize It'],
  ['Jimmy Cliff','The Harder They Come'],
  ['Desmond Dekker','Israelites'],
  ['Jorge Ben Jor','Mas, Que Nada!'],
  ['Os Mutantes','A Minha Menina'],
  ['Fela Kuti','Water No Get Enemy'],
  ['Mulatu Astatke','Yègellé Tezeta'],
  ["Aphrodite's Child",'The Four Horsemen'],

  /* Backups */
  ['Can','Vitamin C'],
  ['NEU!','Hallogallo'],
  ['Amon Düül II','Archangel Thunderbird'],
  ['Popol Vuh','Aguirre I'],
  ['Ananda Shankar','Dancing Drums'],
  ['Kourosh Yaghmaei','Gole Yakh'],
  ['Omar Khorshid','Rakset El Fadaa'],
  ['Osibisa','Sunshine Day'],
  ['Cymande','Bra'],
  ['Chakachas','Jungle Fever'],
  ['The Incredible Bongo Band','Apache'],
  ["Booker T. & the M.G.'s",'Green Onions'],
  ['Mongo Santamaria','Watermelon Man'],
  ['Love','Alone Again Or'],
  ['The 13th Floor Elevators',"You're Gonna Miss Me"],
  ['The Electric Prunes','I Had Too Much to Dream (Last Night)'],
  ['The Velvet Underground','Venus in Furs'],
  ['Spirit','I Got a Line on You'],
  ['Blue Cheer','Summertime Blues'],
  ['Status Quo','Pictures of Matchstick Men'],
  ['The Crazy World of Arthur Brown','Fire'],
  ['Blind Faith',"Can't Find My Way Home"],
  ['Free','All Right Now'],
  ['Rotary Connection','I Am the Black Gold of the Sun'],
  ['Dr. John','Gris-Gris Gumbo Ya Ya'],
  ['Silver Apples','Oscillations'],
  ['Gong','Master Builder'],
  ['Soft Machine','Moon in June'],
  ['Area','Luglio, Agosto, Settembre (Nero)'],
  ['Omega','Gyöngyhajú lány'],
  ['Los Jaivas','Mira Niñita'],
  ['Traffic Sound','Meshkalina'],
  ['Los Destellos','Elsa'],
  ['Juaneco y Su Combo','Ya Se Ha Muerto Mi Abuelo'],
  ['Gilberto Gil','Expresso 2222'],
  ['Caetano Veloso','Alegria, Alegria'],
  ['Gal Costa','Tuareg'],
  ['Novos Baianos','A Menina Dança']
];

const ELSEWHERE_ALIASES = {
  'the jimi hendrix experience':['the jimi hendrix experience','jimi hendrix'],
  'big brother the holding company':['big brother the holding company','big brother & the holding company'],
  'the mamas the papas':['the mamas the papas','the mamas & the papas'],
  'bob marley the wailers':['bob marley the wailers','bob marley & the wailers'],
  'booker t the m g s':['booker t the m g s','booker t & the m g s','booker t. & the m.g.s.'],
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
  if(a.includes(e) || e.includes(a)) return 85;
  const toks=e.split(/\s+/).filter(x=>x.length>2);
  if(!toks.length) return 0;
  return Math.round(70*toks.filter(x=>a.includes(x)).length/toks.length);
}

async function elsewhereFindTrack(artist,title){
  const queries=[`track:${title} artist:${artist}`,`${artist} ${title}`];
  let best=null,bestScore=-1;
  for(const q of queries){
    const j=await api('/search?type=track&limit=10&q='+encodeURIComponent(q));
    for(const t of (j.tracks?.items||[])){
      if(!t?.uri || !elsewhereArtistOK(artist,t)) continue;
      const score=elsewhereTitleScore(title,t.name);
      if(score>bestScore){best=t;bestScore=score;}
    }
    if(bestScore>=85) break;
    await sleep(160);
  }
  return bestScore>=60 ? best : null;
}

function selectElsewherePlaylist(){
  const sel=$('playlist');
  const exact=[...sel.options].find(o=>elsewhereNorm(o.textContent).startsWith('between camur elsewhere'));
  if(exact){sel.value=exact.value;return exact.value;}
  if(sel.value){
    const txt=sel.options[sel.selectedIndex]?.textContent||'';
    if(elsewhereNorm(txt).includes('elsewhere')) return sel.value;
  }
  return '';
}

async function buildElsewhere(){
  const id=selectElsewherePlaylist();
  if(!id) throw new Error('“Between ÇAMUR & Elsewhere” listesini seç.');
  const btn=$('elsewhere');
  btn.disabled=true;
  const uris=[];
  const usedPrimaryArtists=new Set();
  const missing=[];
  try{
    for(let i=0;i<ELSEWHERE_CANDIDATES.length && uris.length<ELSEWHERE_TARGET;i++){
      const [artist,title]=ELSEWHERE_CANDIDATES[i];
      status(`Elsewhere hazırlanıyor: ${uris.length}/${ELSEWHERE_TARGET}\n${artist} — ${title}`);
      const t=await elsewhereFindTrack(artist,title);
      if(!t){missing.push(`${artist} — ${title}`);await sleep(180);continue;}
      const primaryId=t.artists?.[0]?.id || elsewhereNorm(t.artists?.[0]?.name||artist);
      if(usedPrimaryArtists.has(primaryId)) continue;
      uris.push(t.uri);
      usedPrimaryArtists.add(primaryId);
      await sleep(180);
    }
    if(uris.length<ELSEWHERE_MINIMUM){
      throw new Error(`Listeye dokunmadım. Yalnız ${uris.length} güvenli ve farklı sanatçı eşleşmesi bulundu; minimum ${ELSEWHERE_MINIMUM}.`);
    }
    status(`${uris.length} şarkı bulundu. Her biri farklı ana sanatçı. Liste Vercel Manager üzerinden yeniden yazılıyor...`);
    await replaceWith(id,uris);
    status(`Bitti. ${uris.length} şarkı, ${uris.length} farklı sanatçı. Tamamı yabancı; aynı ana sanatçı tekrar etmiyor.${missing.length?` ${missing.length} aday güvenli eşleşmediği için atlandı.`:''}`,'ok');
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
