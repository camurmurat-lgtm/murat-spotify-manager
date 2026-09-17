/* Birce calm English kids playlist — ULTRA SOFT SLEEP EDIT
   LOCKED RULES
   - Public playlist
   - Exactly 60 tracks
   - 60 different primary artists
   - English children's repertoire only
   - Sleep / bedtime / very low-energy only
   - No dance, action-song, classroom, bouncy or bright pop arrangements
   - Existing playlist is revised in-place through Murat Spotify Manager / Vercel
*/

const BCE_NAME='LITTLE EARS, SOFT SKIES | CALM ENGLISH SONGS FOR KIDS';
const BCE_STRICT_TAG='Ultra-soft bedtime edit v1';
const BCE_DESC='Ultra-soft bedtime edit for little ears: 60 very calm English children’s songs, 60 different artists. No dance or high-energy tracks.';
const BCE_TARGET=60;
const BCE_SEARCH_GAP=550;
const BCE_CACHE_KEY='bce_ultrasoft_cache_v1';

async function bceApi(path,opt={},attempt=0){
  let tk=await token();
  if(!tk) throw new Error('Önce Spotify’a bağlan.');
  const run=()=>fetch('https://api.spotify.com/v1'+path,{
    ...opt,
    headers:{Authorization:'Bearer '+tk,'Content-Type':'application/json',...(opt.headers||{})}
  });
  let r=await run();
  if(r.status===401){tk=await refresh();r=await run()}
  if(r.status===429&&attempt<6){
    const sec=Math.max(2,Number(r.headers.get('Retry-After'))||3);
    status(`Spotify kota molası: ${sec} sn bekleniyor...`,'warn');
    await sleep(sec*1000);
    return bceApi(path,opt,attempt+1);
  }
  if(!r.ok){
    const tx=await r.text();
    throw new Error('Spotify API '+r.status+': '+tx);
  }
  if(r.status===204) return null;
  const tx=await r.text();
  if(!tx.trim()) return null;
  try{return JSON.parse(tx)}catch{return tx}
}

function bceNorm(s=''){
  return String(s).toLocaleLowerCase('en-US').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
}

function bceLoadCache(){
  try{return JSON.parse(localStorage.getItem(BCE_CACHE_KEY)||'{}')}catch{return {}}
}
function bceSaveCache(x){localStorage.setItem(BCE_CACHE_KEY,JSON.stringify(x))}

async function bceReplaceWith(id,uris){
  if(uris.length!==60) throw new Error(`Güvenlik: yazılacak parça sayısı ${uris.length}; 60 olmalı.`);
  await bceApi(`/playlists/${id}/items`,{method:'PUT',body:JSON.stringify({uris})});
}

async function bceFindPlaylist(){
  let url='/me/playlists?limit=50';
  while(url){
    const j=await bceApi(url.replace('https://api.spotify.com/v1',''));
    const found=(j?.items||[]).find(p=>p.name===BCE_NAME);
    if(found) return found;
    url=j?.next||null;
  }
  return null;
}

async function bceReadUniqueTracks(id){
  let url=`/playlists/${id}/items?limit=100`;
  const out=[];
  const used=new Set();
  while(url && out.length<60){
    const j=await bceApi(url.replace('https://api.spotify.com/v1',''));
    for(const row of (j?.items||[])){
      const t=row?.item||row?.track||row;
      if(!t?.uri) continue;
      const a=t.artists?.[0];
      const artistName=a?.name||'';
      const key=a?.id||bceNorm(artistName);
      if(!key||used.has(key)) continue;
      used.add(key);
      out.push({uri:t.uri,title:t.name||'',artistName,artistKey:bceNorm(artistName)});
      if(out.length===60) break;
    }
    url=j?.next||null;
  }
  return out;
}

function bceVersionOK(t){
  const n=bceNorm(t?.name||'');
  return !/(remix|sped up|slowed|karaoke|live|dance mix|party mix)/.test(n);
}

async function bceFindExact(artist,title){
  const cache=bceLoadCache();
  const ck=bceNorm(artist)+'|'+bceNorm(title);
  if(cache[ck]) return cache[ck];
  const q=`track:${title} artist:${artist}`;
  const j=await bceApi('/search?type=track&limit=5&q='+encodeURIComponent(q));
  const wantArtist=bceNorm(artist), wantTitle=bceNorm(title);
  for(const t of (j?.tracks?.items||[])){
    if(!t?.uri||!bceVersionOK(t)) continue;
    const gotArtist=bceNorm(t.artists?.[0]?.name||'');
    const gotTitle=bceNorm(t.name||'');
    if(gotArtist===wantArtist && (gotTitle===wantTitle || gotTitle.includes(wantTitle) || wantTitle.includes(gotTitle))){
      const hit={uri:t.uri,artistName:t.artists?.[0]?.name||artist,title:t.name||title};
      cache[ck]=hit;bceSaveCache(cache);return hit;
    }
  }
  return null;
}

/* Same-artist swaps that were individually verified as markedly softer. */
const BCE_FIXED_SAME_ARTIST={
  'raffi':'spotify:track:5BJsDGBjQXRZoWkS8t9n1a',
  'the laurie berkner band':'spotify:track:7qrXQVznkh7TZmUorSMSPl',
  'elizabeth mitchell':'spotify:track:14FcnjzhhpjLBg8UnjbtGp',
  'caspar babypants':'spotify:track:56tfCkVs0KJgF7qmGoc2oL',
  'super simple songs':'spotify:track:41wAY6EPq2Q9JzECLBxxfK',
  'renee jeremy':'spotify:track:0oCn6GwV2v8MqabsgIvtFs',
  'pinkfong':'spotify:track:7ym9HmMdwD6nudwHTF47Zx',
  'kira willey':'spotify:track:0sJ0GRcPJtwhmEDEJeHX5b'
};

/* Artists whose selected track is not strict enough for sleep mode. */
const BCE_REPLACE_ARTISTS=new Set([
  'the okee dokee brothers','the kiboomers','the wiggles','sesame street','bounce patrol',
  'the pop ups','they might be giants','the learning station','kidsongs','cedarmont kids',
  'music together','the juicebox jukebox','emily arrow','koo koo kanga roo','the singing walrus',
  'howdytoons','red grammer','tom chapin','ella jenkins','charlotte diamond','sharon lois bram',
  'bari koral','milkshake','tim kubart','lunch money','gustafer yellowgold','sukey molloy',
  'dave and ava','chuchu tv','looloo kids','heykids','kids tv 123','the gigglebellies',
  'kidscamp','junior squad'
]);

/* Replacement pool researched from bedtime/lullaby catalogues and Spotify's lullaby ecosystem.
   One artist is used at most once. */
const BCE_SLEEP_POOL=[
  ['Daniel Tiger’s Neighborhood','The Day Is Done'],
  ['Itty Bitty Beats','Fairy Lullaby'],
  ['JJ Heller','Dream Sweetly'],
  ['Laura Veirs','Prairie Lullaby'],
  ['Claudia Robin Gunn','Wrap Me Up'],
  ['Christine Brown','Beautiful Dreamer'],
  ['Wayne Gratz','Night Night Teddy'],
  ['PIAMINO','My Little Love'],
  ['Daniel Ketchum','Child of Light'],
  ['Jim Brickman','All the Pretty Little Horses'],
  ['Kendra Logozar','Little One'],
  ['Nursery Rhymes ABC',"Lavender's Blue Lullaby"],
  ['Sleep Well Singers','Are You Sleeping'],
  ['The Night Owl','Baa Baa Black Sheep'],
  ['Mag Brithen','All the Pretty Little Horses'],
  ['Nokto Music','Hush Little Baby'],
  ['Baby Lulu','I Love You'],
  ['Sesame Club','Baa Baa Black Sheep'],
  ['Brown Owl Plays','Rock-a-Bye Baby'],
  ["Baby's Dreamworld","Brahms' Lullaby"],
  ['Lullaby Babyzzz','Hush Now'],
  ['Wonderful Lullabies','Lullaby No. 12'],
  ['Zee Zee Sleeps','Mummy Love You'],
  ["Kids' Choice",'Dreams'],
  ["Tom's Music Box",'Lullaby and Good Night'],
  ['Sleepy Shepherd','Dreaming Of My Baby'],
  ['Orion The Owl',"Orion's Lullaby"],
  ['Adam Hart','Rock-a-bye Baby'],
  ['Lullaby Time','Brahms Lullaby'],
  ['J. L. Marshall','Sleep Well Little One'],
  ['Emma Donovan','I Can Sing a Rainbow'],
  ['The Lucky Band','Goodnight My Love'],
  ['The BeatBuds',"It's Time To Sleep"],
  ['Blake Wonders','The Goodnight Song'],
  ['Music with Michal','Good Night'],
  ['The Tallest Kid in the Room','The World Will Sing a Song for You'],
  ['Kiri and Lou','Who Is Sleepy Now?'],
  ['The Rainbow Collections','Moonbeams'],
  ['Hap Palmer','Sleep On'],
  ['Debi Derryberry','Slumberland']
];

async function bceUltraSoftRevision(){
  const p=await bceFindPlaylist();
  if(!p) throw new Error('LITTLE EARS, SOFT SKIES listesi bulunamadı.');
  const current=await bceReadUniqueTracks(p.id);
  if(current.length!==60) throw new Error(`Önce liste 60 farklı sanatçıya sabitlenmeli. Şu an ${current.length}.`);

  if((p.description||'').includes(BCE_STRICT_TAG)){
    status('Liste zaten ultra-soft uyku sürümünde. 60 şarkı / 60 farklı sanatçı doğrulandı.','ok');
    return;
  }

  status('Ultra-soft uyku denetimi başladı. Hareketli parçalar ayıklanıyor...');
  const result=current.map(x=>({...x}));
  const used=new Set(current.map(x=>x.artistKey));
  let fixedCount=0;

  /* First, soften known artists with exact pre-verified URIs. */
  for(let i=0;i<result.length;i++){
    const fixed=BCE_FIXED_SAME_ARTIST[result[i].artistKey];
    if(fixed && result[i].uri!==fixed){result[i].uri=fixed;fixedCount++}
  }

  /* Then replace artists whose selected songs are too active for strict sleep mode. */
  const targets=[];
  for(let i=0;i<result.length;i++) if(BCE_REPLACE_ARTISTS.has(result[i].artistKey)) targets.push(i);

  let poolPos=0;
  for(let n=0;n<targets.length;n++){
    const idx=targets[n];
    const old=result[idx];
    used.delete(old.artistKey);
    let replacement=null;
    while(poolPos<BCE_SLEEP_POOL.length && !replacement){
      const [artist,title]=BCE_SLEEP_POOL[poolPos++];
      const ak=bceNorm(artist);
      if(used.has(ak)) continue;
      status(`Uyku modu revizyonu: ${n+1}/${targets.length}\n${old.artistName} — ${old.title} çıkarılıyor\nYerine ultra-soft parça aranıyor...`);
      const hit=await bceFindExact(artist,title);
      await sleep(BCE_SEARCH_GAP);
      if(hit){replacement={uri:hit.uri,title:hit.title,artistName:hit.artistName,artistKey:bceNorm(hit.artistName)}}
    }
    if(!replacement) throw new Error(`Ultra-soft yedek havuzu yetmedi. Listeye dokunulmadı. ${n}/${targets.length} değişim hazırlandı.`);
    result[idx]=replacement;
    used.add(replacement.artistKey);
  }

  const unique=new Set(result.map(x=>x.artistKey));
  if(result.length!==60||unique.size!==60) throw new Error(`Güvenlik kontrolü geçmedi: ${result.length} şarkı / ${unique.size} sanatçı. Listeye dokunulmadı.`);

  await bceReplaceWith(p.id,result.map(x=>x.uri));
  await bceApi(`/playlists/${p.id}`,{method:'PUT',body:JSON.stringify({
    name:BCE_NAME,
    public:true,
    description:`${BCE_DESC} ${BCE_STRICT_TAG}`
  })});
  status(`Bitti. Ultra-soft uyku revizyonu uygulandı. 60 şarkı, 60 farklı sanatçı. ${targets.length} hareketli/orta tempolu seçim çıkarıldı; ${fixedCount} parça aynı sanatçının daha sakin kaydıyla değiştirildi.`,'ok');
}

async function buildBirceCalmEnglish(){
  const btn=$('birce-calm-en');
  if(btn) btn.disabled=true;
  try{await bceUltraSoftRevision()}finally{if(btn)btn.disabled=false}
}

const bceBtn=$('birce-calm-en');
if(bceBtn) bceBtn.onclick=safe(buildBirceCalmEnglish);
