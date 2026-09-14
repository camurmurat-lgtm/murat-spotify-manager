/* Between ÇAMUR & Elsewhere
   International 60s/70s psychedelic + global groove builder.
   Rules: target 60 tracks, minimum 50, one primary artist only, no Turkish or Korean acts.
   Revision 4: first choices now strongly favor charted / globally heard records. */

const ELSEWHERE_TARGET = 60;
const ELSEWHERE_MINIMUM = 50;

const ELSEWHERE_CANDIDATES = [
  ['Jefferson Airplane','White Rabbit'],
  ['The Doors','Light My Fire'],
  ['The Jimi Hendrix Experience','All Along the Watchtower'],
  ['Pink Floyd','Time'],
  ['The Beatles','Tomorrow Never Knows'],
  ['The Rolling Stones','Paint It, Black'],
  ['Cream','Sunshine of Your Love'],
  ['The Zombies','Time of the Season'],
  ['The Byrds','Eight Miles High'],
  ['The Beach Boys','Good Vibrations'],
  ['Procol Harum','A Whiter Shade of Pale'],
  ['Santana','Oye Como Va'],
  ['The Moody Blues','Nights in White Satin'],
  ['Donovan','Hurdy Gurdy Man'],
  ['Iron Butterfly','In-A-Gadda-Da-Vida'],
  ['Shocking Blue','Venus'],
  ['Steppenwolf','Magic Carpet Ride'],
  ['Traffic','Paper Sun'],
  ['The Who','I Can See for Miles'],
  ['The Kinks','See My Friends'],
  ['Small Faces','Itchycoo Park'],
  ['The Crazy World of Arthur Brown','Fire'],
  ['Tommy James & The Shondells','Crimson and Clover'],
  ['Norman Greenbaum','Spirit in the Sky'],
  ['The Animals','House of the Rising Sun'],
  ["The Mamas & The Papas","California Dreamin'"],
  ['Buffalo Springfield',"For What It's Worth"],
  ['The Guess Who','American Woman'],
  ['The Yardbirds','Shapes of Things'],
  ['Strawberry Alarm Clock','Incense and Peppermints'],
  ['The Electric Prunes','I Had Too Much to Dream (Last Night)'],
  ['Scott McKenzie','San Francisco (Be Sure to Wear Flowers in Your Hair)'],
  ['Status Quo','Pictures of Matchstick Men'],
  ['David Bowie','Space Oddity'],
  ['Led Zeppelin','Kashmir'],
  ['Black Sabbath','Paranoid'],
  ['Deep Purple','Hush'],
  ['Yes','Roundabout'],
  ['Electric Light Orchestra','Strange Magic'],
  ['Kraftwerk','Autobahn'],
  ['Sly & The Family Stone','Family Affair'],
  ['The Temptations',"Papa Was a Rollin' Stone"],
  ['Curtis Mayfield','Move On Up'],
  ['Isaac Hayes','Walk On By'],
  ['War','Low Rider'],
  ['Rare Earth','Get Ready'],
  ['Manu Dibango','Soul Makossa'],
  ['Hugh Masekela','Grazing in the Grass'],
  ['Miriam Makeba','Pata Pata'],
  ['Bob Marley & The Wailers','No Woman, No Cry'],
  ['Jimmy Cliff','Wonderful World, Beautiful People'],
  ['Desmond Dekker','Israelites'],
  ["Sergio Mendes & Brasil '66",'Mas Que Nada'],
  ['Osibisa','Sunshine Day'],
  ['Chakachas','Jungle Fever'],
  ['Mongo Santamaria','Watermelon Man'],
  ["Booker T. & the M.G.'s",'Green Onions'],
  ["Aphrodite's Child",'Rain and Tears'],
  ['George Harrison','My Sweet Lord'],
  ['Focus','Hocus Pocus'],

  /* Backups, still well-known / charted or canonical */
  ['Fleetwood Mac','Albatross'],
  ['Golden Earring','Radar Love'],
  ['Hot Butter','Popcorn'],
  ['Jean-Michel Jarre','Oxygene, Pt. 4'],
  ['Funkadelic','One Nation Under a Groove'],
  ['Love','Alone Again Or'],
  ['The 13th Floor Elevators',"You're Gonna Miss Me"],
  ['The Chambers Brothers','Time Has Come Today'],
  ['Hawkwind','Silver Machine'],
  ['Free','All Right Now'],
  ['Canned Heat','On the Road Again'],
  ['The Spencer Davis Group','Gimme Some Lovin\''],
  ['Ten Years After',"I'd Love to Change the World"],
  ['Edgar Winter Group','Frankenstein'],
  ['The Edgar Winter Group','Free Ride'],
  ['Os Mutantes','A Minha Menina'],
  ['Fela Kuti','Water No Get Enemy'],
  ['Kourosh Yaghmaei','Gole Yakh'],
  ['Can','Vitamin C'],
  ['Ananda Shankar','Dancing Drums']
];

const ELSEWHERE_ALIASES = {
  'the jimi hendrix experience':['the jimi hendrix experience','jimi hendrix'],
  'the mamas the papas':['the mamas the papas','the mamas & the papas'],
  'bob marley the wailers':['bob marley the wailers','bob marley & the wailers'],
  'sergio mendes brasil 66':['sergio mendes brasil 66','sergio mendes & brasil 66','sérgio mendes & brasil 66'],
  'booker t the m g s':['booker t the m g s','booker t & the m g s','booker t. & the m.g.s.'],
  'the edgar winter group':['the edgar winter group','edgar winter group'],
  'edgar winter group':['edgar winter group','the edgar winter group']
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
  if(a.includes(e) || e.includes(a)) return 88;
  const toks=e.split(/\s+/).filter(x=>x.length>2);
  if(!toks.length) return 0;
  return Math.round(75*toks.filter(x=>a.includes(x)).length/toks.length);
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
    if(bestScore>=88) break;
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
      status(`Elsewhere kalite turu: ${uris.length}/${ELSEWHERE_TARGET}\n${artist} — ${title}`);
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
    status(`${uris.length} güçlü eşleşme bulundu. Her biri farklı ana sanatçı. Liste Vercel Manager üzerinden yeniden yazılıyor...`);
    await replaceWith(id,uris);
    status(`Bitti. ${uris.length} şarkı, ${uris.length} farklı sanatçı. Bu tur chart görmüş / dünya çapında yaygın dinlenmiş kayıtlara ağırlık verildi.${missing.length?` ${missing.length} aday güvenli eşleşmediği için atlandı.`:''}`,'ok');
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
