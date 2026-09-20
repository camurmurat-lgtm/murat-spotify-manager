/* Birce — KÜÇÜK KULAKLAR, BÜYÜK DÜNYA
   STRICT KIDS-MUSIC EDITION
   - Only songs made specifically for children / family audiences
   - Only child-music artists, children's bands, children's channels/projects/choirs
   - No adult mainstream repertoire
   - Turkish + global
   - 30 fixed, pre-verified Spotify tracks
   - No runtime search
*/

const BMD_NAME='KÜÇÜK KULAKLAR, BÜYÜK DÜNYA | 4+ MUSIC DISCOVERY';
const BMD_DESC='A carefully curated first music library for ages 4+: 30 songs made specifically for children, from Türkiye and around the world. Children’s bands, choirs, family-music artists and trusted kids’ projects only; no adult mainstream repertoire.';
const BMD_TRACKS=[
  {artist:'Şubadap Çocuk',title:'Gökyüzünü İten Kuş',uri:'spotify:track:6twoBjXNT94NwNrKh3KXwx'},
  {artist:'Banu Kanıbelli',title:'Başka Dünya Yok',uri:'spotify:track:4DmkE8qsrYJMWpEe1LxPvN'},
  {artist:'Çocuk Korosu',title:'Nar Gibi Domates',uri:'spotify:track:764DT1IHrbyTbiJQeSCMRW'},
  {artist:'Pelin Meray',title:'Bir Dünya Bırakın',uri:'spotify:track:6K6quQ7EVBXXz1F135gxJB'},
  {artist:'Aleyna Ünyaylar',title:'Mini Mini Bir Kuş',uri:'spotify:track:44BCtmRfSPYGGtRvDVU1Rp'},
  {artist:'Kukuli',title:'Bir Varmış Bir Yokmuş',uri:'spotify:track:6FY5l87hbyyUjhl5EvPkrZ'},
  {artist:'Sevimli Dostlar',title:'Küçük Kurbağa',uri:'spotify:track:0hdFrnmbLGQITkGYpkaRNA'},
  {artist:'Milli Eğitim Bakanlığı ve TRT Çocuk Korosu',title:'İstanbul',uri:'spotify:track:0o9Nuivniq4l3fjefnkCAX'},

  {artist:'Raffi',title:'Baby Beluga',uri:'spotify:track:7zQFM7bHcyMh4QQFdBkjrE'},
  {artist:'Elizabeth Mitchell',title:'Little Bird, Little Bird',uri:'spotify:track:5mdDzJBkQ7Gz7ePDCB397w'},
  {artist:'Ella Jenkins',title:"You'll Sing a Song and I'll Sing a Song",uri:'spotify:track:3PyfzEyTIgqKdsXRyFTKOj'},
  {artist:'The Laurie Berkner Band',title:'We Are The Dinosaurs',uri:'spotify:track:21ryEt5nCkFjsHJHegnLOA'},
  {artist:'Caspar Babypants',title:'Stompy The Bear',uri:'spotify:track:5IcFRKTt7ftKDjNGprTtAt'},
  {artist:'Super Simple Songs',title:'Beddy-Bye Butterfly',uri:'spotify:track:1Vwa3ALXUjCpPkZ5fqeSHK'},
  {artist:'Charlie Hope',title:'Dreamland',uri:'spotify:track:517rXxVShokwizdDdPVQrJ'},
  {artist:'The Okee Dokee Brothers',title:'Can You Canoe?',uri:'spotify:track:0WhyyOzUomECzP2vkSLmJC'},
  {artist:'Kira Willey',title:'Colors',uri:'spotify:track:6g18AyNL855O1jb9V5mNCd'},
  {artist:'Frances England',title:'Mind of My Own',uri:'spotify:track:6dnaiQKE8p6zhG9eJNEhmp'},
  {artist:'Dan Zanes & Friends',title:'Catch That Train',uri:'spotify:track:5UGHoCI38GbldG6NOFG7AR'},
  {artist:'They Might Be Giants (For Kids)',title:'Alphabet of Nations',uri:'spotify:track:1G8DggfK35Le9svVcBQAEj'},
  {artist:'Renee & Jeremy',title:'Night Mantra',uri:'spotify:track:0oCn6GwV2v8MqabsgIvtFs'},
  {artist:'The Pop Ups',title:'On Air',uri:'spotify:track:5RGo6szDfkQ7hea0Rz44Nl'},
  {artist:'The Not-Its!',title:'KidQuake!',uri:'spotify:track:6sN0M6N1A1pGf33AttHQvL'},
  {artist:'Recess Monkey',title:'Tambourine Submarine',uri:'spotify:track:14qNy1D71SygWF3ZETvoHM'},
  {artist:'Justin Roberts',title:'Pop Fly',uri:'spotify:track:2KQkWvctbHu5S4G2m5e68Z'},
  {artist:'Lucy Kalantari & the Jazz Cats',title:'Are You Afraid of the Dark?',uri:'spotify:track:5ufNv2XxxQMCXJ0wvpLkv3'},
  {artist:'Jazzy Ash',title:'Throw Me Something Mista',uri:'spotify:track:69qDT5mii0S9wpg8mXlddN'},
  {artist:'Sonia De Los Santos',title:'Tan Feliz',uri:'spotify:track:2eC9LlDPbngv5XNirTic4R'},
  {artist:'Brady Rymer and the Little Band That Could',title:"Jump Up (It's a Good Day)",uri:'spotify:track:79bdAri3mWjJPmCV5DetHs'},
  {artist:'Gustafer Yellowgold',title:'I Jump On Cake',uri:'spotify:track:684Q1p8uDHLi5SKbOkg5Cx'}
];

async function bmdApi(path,opt={},attempt=0){
  let tk=await token();
  if(!tk)throw new Error('Önce Spotify’a bağlan.');
  const run=()=>fetch('https://api.spotify.com/v1'+path,{...opt,headers:{Authorization:'Bearer '+tk,'Content-Type':'application/json',...(opt.headers||{})}});
  let r=await run();
  if(r.status===401){tk=await refresh();r=await run()}
  if(r.status===429&&attempt<5){
    const sec=Math.max(1,Number(r.headers.get('Retry-After'))||2);
    status(`Spotify kısa bir mola istedi. ${sec} sn bekleniyor...`,'warn');
    await sleep(sec*1000);
    return bmdApi(path,opt,attempt+1);
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

async function bmdFindPlaylist(){
  let url='/me/playlists?limit=50';
  while(url){
    const j=await bmdApi(url.replace('https://api.spotify.com/v1',''));
    const found=(j?.items||[]).find(p=>p.name===BMD_NAME);
    if(found)return found;
    url=j?.next||null;
  }
  return null;
}

function bmdValidate(){
  if(BMD_TRACKS.length!==30)throw new Error(`Güvenlik: seçki ${BMD_TRACKS.length} parça. 30 olmalı.`);
  const uris=new Set(BMD_TRACKS.map(x=>x.uri));
  if(uris.size!==BMD_TRACKS.length)throw new Error('Güvenlik: tekrarlanan parça bulundu.');
}

async function bmdFindOrCreate(){
  const old=await bmdFindPlaylist();
  if(old)return old;
  return bmdApi('/me/playlists',{method:'POST',body:JSON.stringify({name:BMD_NAME,public:true,description:BMD_DESC})});
}

async function buildBirceMusicDiscovery(){
  const btn=$('birce-music-discovery');
  if(btn)btn.disabled=true;
  try{
    bmdValidate();
    status('Küçük Kulaklar, Büyük Dünya yeniden kuruluyor...\nYalnızca çocuklar için yapılmış 30 doğrulanmış kayıt yazılacak.');
    const p=await bmdFindOrCreate();
    await bmdApi(`/playlists/${p.id}/items`,{method:'PUT',body:JSON.stringify({uris:BMD_TRACKS.map(x=>x.uri)})});
    await bmdApi(`/playlists/${p.id}`,{method:'PUT',body:JSON.stringify({name:BMD_NAME,public:true,description:BMD_DESC})});
    status('Bitti. Tek liste güncellendi.\n30 parça. Tamamı çocuklar için üretilmiş çocuk müziği; yetişkin mainstream repertuvarı yok.\nTürkiye + dünya, runtime araması yok.','ok');
  }finally{
    if(btn)btn.disabled=false;
  }
}

const bmdBtn=$('birce-music-discovery');
if(bmdBtn)bmdBtn.onclick=safe(buildBirceMusicDiscovery);
