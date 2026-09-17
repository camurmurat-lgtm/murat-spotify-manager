/* Birce playlist 1 — STRICT SLEEP EDITION v3
   Rules:
   - exactly 60 tracks
   - exactly 60 different primary artists
   - English / international children's bedtime context only
   - ultra-soft, sleepy, lullaby, night-time mood only
   - no dance, party, action, classroom, bright/upbeat material
   - no Spotify track search at runtime
   - only read curated, currently-valid kids/baby sleep playlists + one final write
*/

const BCE_NAME='LITTLE EARS, SOFT SKIES | CALM ENGLISH SONGS FOR KIDS';
const BCE_DESC='Ultra-soft English children’s bedtime songs for winding down and sleep. 60 tracks, 60 different artists; no upbeat, dance or action songs.';
const BCE_TARGET=60;

async function bceApi(path,opt={},attempt=0){
  let tk=await token();
  if(!tk) throw new Error('Önce Spotify’a bağlan.');
  const run=()=>fetch('https://api.spotify.com/v1'+path,{...opt,headers:{Authorization:'Bearer '+tk,'Content-Type':'application/json',...(opt.headers||{})}});
  let r=await run();
  if(r.status===401){tk=await refresh();r=await run()}
  if(r.status===429&&attempt<5){const sec=Math.max(1,Number(r.headers.get('Retry-After'))||2);status(`Spotify kısa bir mola istedi. ${sec} sn bekleniyor...`,'warn');await sleep(sec*1000);return bceApi(path,opt,attempt+1)}
  if(!r.ok){const tx=await r.text();const e=new Error('Spotify API '+r.status+': '+tx);e.status=r.status;throw e}
  if(r.status===204)return null;
  const tx=await r.text();if(!tx.trim())return null;try{return JSON.parse(tx)}catch{return tx}
}

async function bceReplaceWith(id,uris){
  if(uris.length!==60)throw new Error(`Güvenlik: ${uris.length} parça var; 60 olmalı.`);
  await bceApi(`/playlists/${id}/items`,{method:'PUT',body:JSON.stringify({uris})});
}

function bceNorm(s=''){
  return String(s).toLocaleLowerCase('en-US').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
}

/* Only exact tracks that were actually resolved and checked in Spotify. */
const BCE_ANCHORS=[
  {artist:'Raffi',title:'Thanks A Lot',uri:'spotify:track:5BJsDGBjQXRZoWkS8t9n1a'},
  {artist:'The Laurie Berkner Band',title:'Goodnight - Lullaby Version',uri:'spotify:track:7qrXQVznkh7TZmUorSMSPl'},
  {artist:'Elizabeth Mitchell',title:'Sleep Eye',uri:'spotify:track:14FcnjzhhpjLBg8UnjbtGp'},
  {artist:'Renee & Jeremy',title:'Night Mantra',uri:'spotify:track:0oCn6GwV2v8MqabsgIvtFs'},
  {artist:'Caspar Babypants',title:'Just for You',uri:'spotify:track:56tfCkVs0KJgF7qmGoc2oL'}
];

/* Current public Spotify pools found specifically for kids/baby bedtime/lullaby use.
   Any source that later disappears is skipped instead of killing the build. */
const BCE_SOURCES=[
  '13ByLTMlo9I2P8PAEAmst1',  // Bedtime Songs for Kids | Lullabies & Sleeping Music for Children
  '32pBUlWO909eGfPjVnXZFP',  // İngilizce Ninniler
  '4eYYDhGZfCsLq3ljtsJrlg',  // Bebek Gelişim - Uyku Vakti - İngilizce
  '440TFhyKHcDNfDaFUwEe8N',  // English lullabies
  '7cbgAPfTOPAcSTI98EtxyT',  // bebek ingilizce ninnileri uyumadan once
  '7pE9tEaPsGc1pCDdGd16Uw',  // İngilizce bebek şarkılar
  '4yrl12iSPsOvzzlV7OY5QH',  // İngilizce bebek şarkıları
  '3PhMDrT6PcuhmpZN98wg59',  // Çocuklar için ingilizce şarkılar — only strict sleep titles survive
  '57WUzxs0u7TXrjCxN5Kc8b',  // İngilizce çocuk şarkıları — only strict sleep titles survive
  '1lFcewWGTwKXGGQFqUB5Yy'   // Bebekler için ingilizce şarkılar — only strict sleep titles survive
];

const BCE_SLEEP_STRONG=[
  'lullaby','lullabies','sleep','sleepy','bedtime','goodnight','good night','hush','cradle','slumber','dream','dreaming','dreamland','night night','nighttime','night time','rock a bye','rockabye','twinkle','star light','starlight','moon','moonlight','lavender','rest','soothing','gentle','quiet','calm','serenade','pretty little horses','brahms','all through the night','golden slumbers','sleep baby sleep'
].map(bceNorm);

const BCE_ENERGY_BLOCK=[
  'dance','dancing','party','happy','fun','playtime','play time','play along','run','running','jump','jumping','move','moving','clap','clapping','shake','wiggle','march','boogie','workout','exercise','celebrate','celebration','morning','good morning','hello song','wheels on the bus','bus song','dinosaur','action song','fast and slow','upbeat','energy','energetic','adventure','birthday','hamsterdance','tidy up','clean it up','head shoulders knees','if you re happy','five little monkeys','ants go marching','open shut','goldfish','airplane song','baby shark','old macdonald','hokey pokey','row row row your boat','bingo','abc song','alphabet song','finger family','days of the week','colors song','counting song'
].map(bceNorm);

function bceHasAny(hay,arr){return arr.some(x=>hay.includes(x))}

function bceSleepScore(t){
  const title=bceNorm(t?.name||'');
  const album=bceNorm(t?.album?.name||'');
  const all=title+' '+album;
  if(!t?.uri||t?.explicit)return -999;
  if(bceHasAny(title,BCE_ENERGY_BLOCK))return -999;
  let score=0;
  if(bceHasAny(title,BCE_SLEEP_STRONG))score+=120;
  if(bceHasAny(album,BCE_SLEEP_STRONG))score+=45;
  if(/instrumental|piano|music box|acoustic|harp|soft|gentle/.test(all))score+=20;
  if(/lullaby|sleep|bedtime|goodnight|good night|hush|cradle|slumber|brahms/.test(title))score+=45;
  if((t.duration_ms||0)>=60000&&(t.duration_ms||0)<=600000)score+=5;
  return score;
}

async function bceReadPlaylist(id){
  let url=`/playlists/${id}/items?limit=100`;
  const out=[];
  while(url){
    const j=await bceApi(url.replace('https://api.spotify.com/v1',''));
    for(const row of (j?.items||[])){
      const t=row?.item||row?.track||null;
      if(t?.uri)out.push(t);
    }
    url=j?.next||null;
  }
  return out;
}

async function bceReadPlaylistSafe(id){
  try{return await bceReadPlaylist(id)}
  catch(e){
    if(e?.status===404||e?.status===403){return []}
    throw e;
  }
}

async function bceFindPlaylist(){
  let url='/me/playlists?limit=50';
  while(url){
    const j=await bceApi(url.replace('https://api.spotify.com/v1',''));
    const found=(j?.items||[]).find(p=>p.name===BCE_NAME);
    if(found)return found;
    url=j?.next||null;
  }
  return null;
}

async function buildBirceCalmEnglish(){
  const btn=$('birce-calm-en');if(btn)btn.disabled=true;
  try{
    status('Ultra-soft uyku listesi baştan kuruluyor...\nSadece bedtime/lullaby kaynakları taranıyor.');
    const picked=[];
    const usedArtists=new Set();
    const usedUris=new Set();

    for(const a of BCE_ANCHORS){
      const k=bceNorm(a.artist);
      if(usedArtists.has(k)||usedUris.has(a.uri))continue;
      usedArtists.add(k);usedUris.add(a.uri);picked.push({uri:a.uri,artist:a.artist,title:a.title,score:999});
    }

    const pool=[];
    let liveSources=0;
    for(let s=0;s<BCE_SOURCES.length;s++){
      status(`Ultra-soft kaynaklar taranıyor: ${s+1}/${BCE_SOURCES.length}\n${picked.length}/60 sabit seçim hazır.`);
      const tracks=await bceReadPlaylistSafe(BCE_SOURCES[s]);
      if(!tracks.length)continue;
      liveSources++;
      for(const t of tracks){
        const artist=t.artists?.[0]?.name||'';
        const artistKey=t.artists?.[0]?.id||bceNorm(artist);
        const score=bceSleepScore(t);
        if(score<120)continue;
        pool.push({uri:t.uri,artist,title:t.name||'',artistKey,score,popularity:t.popularity||0});
      }
    }

    pool.sort((a,b)=>b.score-a.score||b.popularity-a.popularity||a.title.localeCompare(b.title));

    for(const c of pool){
      if(picked.length>=BCE_TARGET)break;
      const k=c.artistKey||bceNorm(c.artist);
      if(!k||usedArtists.has(k)||usedUris.has(c.uri))continue;
      usedArtists.add(k);usedUris.add(c.uri);picked.push(c);
    }

    if(picked.length<60)throw new Error(`Ultra-soft filtre 60 farklı sanatçıya ulaşmadı (${picked.length}/60). ${liveSources} kaynak erişilebildi. Listeye dokunulmadı.`);

    const p=await bceFindPlaylist();
    if(!p)throw new Error('Mevcut LITTLE EARS, SOFT SKIES listesi bulunamadı. Yeni liste oluşturulmadı.');

    const final60=picked.slice(0,60);
    await bceReplaceWith(p.id,final60.map(x=>x.uri));
    await bceApi(`/playlists/${p.id}`,{method:'PUT',body:JSON.stringify({name:BCE_NAME,public:true,description:BCE_DESC})});

    const preview=final60.slice(0,8).map((x,i)=>`${i+1}. ${x.artist} — ${x.title}`).join('\n');
    status(`Bitti. Liste baştan kuruldu.\n60 şarkı / 60 farklı sanatçı.\n${liveSources} erişilebilir uyku kaynağı tarandı; hareketli başlıklar dışlandı.\n\nİlk seçimler:\n${preview}`,'ok');
  }finally{if(btn)btn.disabled=false}
}

const bceBtn=$('birce-calm-en');if(bceBtn)bceBtn.onclick=safe(buildBirceCalmEnglish);
