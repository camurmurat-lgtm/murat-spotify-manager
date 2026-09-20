/* Birce playlist 1 — ULTRA-SOFT FIXED EDITION
   Locked rules:
   - Existing LITTLE EARS, SOFT SKIES playlist is updated in place
   - Only pre-verified exact Spotify track URIs
   - No runtime track search, no source-playlist scan
   - Ultra-soft / bedtime / lullaby / winding-down only
   - One primary performer per track, no performer repeats
   - Quality beats count: deliberately reduced to 19 tracks
*/

const BCE_NAME='LITTLE EARS, SOFT SKIES | CALM ENGLISH SONGS FOR KIDS';
const BCE_DESC='Ultra-soft bedtime songs for little ears: 19 hand-picked, low-energy children’s lullabies and gentle family songs. No upbeat, dance, action or classroom tracks. One performer per song.';

const BCE_FIXED=[
  {artist:'Raffi',title:'Thanks A Lot',uri:'spotify:track:5BJsDGBjQXRZoWkS8t9n1a'},
  {artist:'The Laurie Berkner Band',title:'Goodnight - Lullaby Version',uri:'spotify:track:7qrXQVznkh7TZmUorSMSPl'},
  {artist:'Elizabeth Mitchell',title:'Sleep Eye',uri:'spotify:track:14FcnjzhhpjLBg8UnjbtGp'},
  {artist:'Renee & Jeremy',title:'Night Mantra',uri:'spotify:track:0oCn6GwV2v8MqabsgIvtFs'},
  {artist:'Caspar Babypants',title:'Just for You',uri:'spotify:track:56tfCkVs0KJgF7qmGoc2oL'},
  {artist:'JJ Heller',title:'Dream Sweetly',uri:'spotify:track:3YfneEUM11WLG9v6rgS65e'},
  {artist:'Super Simple Songs',title:'Sweet Dreams',uri:'spotify:track:2Sxsvk4k4pIjZ22rmpdhYk'},
  {artist:'The Countdown Kids',title:"Brahms' Lullaby",uri:'spotify:track:2ypOmuHnMcpyXuvjiQesja'},
  {artist:'The Rainbow Collections',title:'Twinkle, Twinkle Little Star',uri:'spotify:track:4vot6ovLZyIaInEZvNAIyY'},
  {artist:'Debi Derryberry',title:'Slumberland',uri:'spotify:track:7DvAfegzIZxA2PEtEufYL8'},
  {artist:'Hap Palmer',title:'Sleep On',uri:'spotify:track:3ef6ncF1D5Tlunh02hdeUb'},
  {artist:'Charlie Hope',title:'Dreamland',uri:'spotify:track:517rXxVShokwizdDdPVQrJ'},
  {artist:'Rabbit Island',title:"It's Time",uri:'spotify:track:1EdBh3K1vvRaqPZ53RPTKL'},
  {artist:'Elin & the Lullaby Orchestra',title:"Close your eyes, it's time to sleep",uri:'spotify:track:19pXK5KlhI2XBHPDVVdBzg'},
  {artist:'Nursery Rhymes 123',title:'Hush Little Baby',uri:'spotify:track:1e7c8gV3mxz1s4J3l563h5'},
  {artist:'Nursery Rhymes ABC',title:'Time To Go To Sleep',uri:'spotify:track:0Y4YI5YrmwctjCMJXeZlYd'},
  {artist:'Lisa Loeb',title:'Rainbow Connection',uri:'spotify:track:3AiABhW3nCU7sggm1nvgfr'},
  {artist:'Blake Wonders',title:'The Goodnight Song (Lullaby Version)',uri:'spotify:track:7jFOFrlSj3znEMExavcj0h'},
  {artist:'Christina Perri',title:'you are my sunshine',uri:'spotify:track:4cNpO3kF8rqcH8G3huFCJp'}
];

async function bceApi(path,opt={},attempt=0){
  let tk=await token();
  if(!tk) throw new Error('Önce Spotify’a bağlan.');
  const run=()=>fetch('https://api.spotify.com/v1'+path,{...opt,headers:{Authorization:'Bearer '+tk,'Content-Type':'application/json',...(opt.headers||{})}});
  let r=await run();
  if(r.status===401){tk=await refresh();r=await run()}
  if(r.status===429&&attempt<5){
    const sec=Math.max(1,Number(r.headers.get('Retry-After'))||2);
    status(`Spotify kısa bir mola istedi. ${sec} sn bekleniyor...`,'warn');
    await sleep(sec*1000);
    return bceApi(path,opt,attempt+1);
  }
  if(!r.ok){
    const tx=await r.text();
    throw new Error('Spotify API '+r.status+': '+tx);
  }
  if(r.status===204)return null;
  const tx=await r.text();
  if(!tx.trim())return null;
  try{return JSON.parse(tx)}catch{return tx}
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

function bceValidateFixed(){
  const artists=new Set(BCE_FIXED.map(x=>x.artist.toLocaleLowerCase('en-US').trim()));
  const uris=new Set(BCE_FIXED.map(x=>x.uri));
  if(artists.size!==BCE_FIXED.length)throw new Error('Güvenlik: sanatçı tekrarı bulundu. Listeye dokunulmadı.');
  if(uris.size!==BCE_FIXED.length)throw new Error('Güvenlik: parça tekrarı bulundu. Listeye dokunulmadı.');
}

async function buildBirceCalmEnglish(){
  const btn=$('birce-calm-en');
  if(btn)btn.disabled=true;
  try{
    bceValidateFixed();
    const p=await bceFindPlaylist();
    if(!p)throw new Error('Mevcut LITTLE EARS, SOFT SKIES listesi bulunamadı. Yeni liste oluşturulmadı.');
    status('Ultra-soft sabit seçki yazılıyor...\n19 parça / 19 farklı sanatçı. Runtime araması yok.');
    await bceApi(`/playlists/${p.id}/items`,{method:'PUT',body:JSON.stringify({uris:BCE_FIXED.map(x=>x.uri)})});
    await bceApi(`/playlists/${p.id}`,{method:'PUT',body:JSON.stringify({name:BCE_NAME,public:true,description:BCE_DESC})});
    const preview=BCE_FIXED.map((x,i)=>`${i+1}. ${x.artist} — ${x.title}`).join('\n');
    status(`Bitti. Liste 19 ultra-soft parçaya indirildi.\n19 şarkı / 19 farklı sanatçı.\nHareketli parçalar tamamen çıkarıldı; sadece önceden doğrulanmış sabit kayıtlar yazıldı.\n\n${preview}`,'ok');
  }finally{
    if(btn)btn.disabled=false;
  }
}

const bceBtn=$('birce-calm-en');
if(bceBtn)bceBtn.onclick=safe(buildBirceCalmEnglish);
