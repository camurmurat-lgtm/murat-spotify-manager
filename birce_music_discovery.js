/* Birce — KÜÇÜK KULAKLAR, BÜYÜK DÜNYA
   PRESCHOOL / KINDERGARTEN CANON EDITION
   Focus: age 4
   - Songs commonly used in preschool / kindergarten settings
   - 16 global + 16 Turkish preschool staples
   - Children's channels/projects/choirs only
   - No adult mainstream repertoire
   - Fixed, pre-verified Spotify URIs
   - No runtime track search
*/

const BMD_NAME='KÜÇÜK KULAKLAR, BÜYÜK DÜNYA | 4+ MUSIC DISCOVERY';
const BMD_DESC='Age-4 preschool essentials: 32 widely used nursery, action, counting, animal, routine and sing-along songs from Türkiye and around the world. Children’s channels, kids’ projects and choirs only; no adult mainstream repertoire.';
const BMD_TRACKS=[
  // GLOBAL PRESCHOOL / KINDERGARTEN STAPLES
  {artist:'Super Simple Songs',title:'The Wheels On The Bus',uri:'spotify:track:1SJUpO4mu6kBUxVekSYPhu'},
  {artist:'Super Simple Songs',title:'Twinkle Twinkle Little Star',uri:'spotify:track:3N6kzbnfpTPB5J9NAGc1rU'},
  {artist:'Super Simple Songs',title:'Old MacDonald Had a Farm',uri:'spotify:track:7Aq3YV6jwjUfqbg56h1MCW'},
  {artist:'Super Simple Songs',title:'Head Shoulders Knees & Toes (Sing It)',uri:'spotify:track:5fdUlOSCgp4KfimGGwBTKv'},
  {artist:'Super Simple Songs',title:"If You're Happy and You Know It",uri:'spotify:track:2beeR72qyVu9RYvqKO3L3R'},
  {artist:'Super Simple Songs',title:'Five Little Ducks',uri:'spotify:track:5HF2zdaYT7zpQGrkg1hP4v'},
  {artist:'Super Simple Songs',title:'The Itsy Bitsy Spider',uri:'spotify:track:6d2DK7psYkREOWbBtYXKpk'},
  {artist:'Super Simple Songs',title:'Row Row Row Your Boat',uri:'spotify:track:4ofg4Jc82bXC8PdoMrglgg'},
  {artist:'Super Simple Songs',title:'The Alphabet Song',uri:'spotify:track:3m4GrlPEbawTr58KA3bXTg'},
  {artist:'Super Simple Songs',title:'Bingo',uri:'spotify:track:50z0nveVsgOFt1eKUQIMr5'},
  {artist:'Super Simple Songs',title:'Five Little Monkeys',uri:'spotify:track:475LPQIUiT6SqfwuqWYtU2'},
  {artist:'Little Baby Bum Nursery Rhyme Friends',title:'Hokey Pokey - Radio Edit',uri:'spotify:track:5p6LXN8w7d5uBH7RlNOSjd'},
  {artist:'Pinkfong',title:'Baby Shark',uri:'spotify:track:5ygDXis42ncn6kYG14lEVG'},
  {artist:'Super Simple Songs & Noodle & Pals',title:'One Little Finger',uri:'spotify:track:4jKlouPlVZOkuRwyBpgLPN'},
  {artist:'Super Simple Songs',title:'Open Shut Them',uri:'spotify:track:6jNrjFCd9h9jBdGomb7LRN'},
  {artist:'Super Simple Songs',title:'This Is The Way',uri:'spotify:track:7sUNw3iIr10ZVT3Ur5TOUM'},

  // TÜRKİYE PRESCHOOL / ANAOKULU STAPLES
  {artist:'Aleyna Ünyaylar',title:'Mini Mini Bir Kuş',uri:'spotify:track:44BCtmRfSPYGGtRvDVU1Rp'},
  {artist:'Sevimli Dostlar',title:'Küçük Kurbağa',uri:'spotify:track:0hdFrnmbLGQITkGYpkaRNA'},
  {artist:'Sevimli Dostlar',title:'Arı Vız Vız Vız',uri:'spotify:track:705wQB6pX3huy25l6kXA0c'},
  {artist:'Tatlış Tavşan',title:'Ali Babanın Çiftliği',uri:'spotify:track:1Fgd6K7nfktEmW2MZUyNAJ'},
  {artist:'Sevimli Dostlar',title:'Kırmızı Balık',uri:'spotify:track:5O9PhfV2jKtRVwlgQQQxs6'},
  {artist:'Sevimli Dostlar',title:'Bak Postacı Geliyor',uri:'spotify:track:4igBEQJJcHH6ktlt8jJlLc'},
  {artist:'Sevimli Dostlar',title:'Daha Dün Annemizin',uri:'spotify:track:25dTPsCAxJS5xfxdNFpDca'},
  {artist:'Sihirli Grup',title:'Yağ Satarım Bal Satarım',uri:'spotify:track:2lMtPSgBvAG7JEzxtUqvne'},
  {artist:'Çocuk şarkıları Superstar',title:'Fış Fış Kayıkçı',uri:'spotify:track:1tEw6mz7f6zESOi1nfiIeX'},
  {artist:'Furkiş TV',title:'Ellerim Tombik Tombik',uri:'spotify:track:0775W2kcSmoyXscxRnSRNH'},
  {artist:'Furkiş TV',title:'Pazara Gidelim',uri:'spotify:track:2gX0N2V96RKJWd0PkZKcGg'},
  {artist:'Furkiş TV',title:'Kutu Kutu Pense',uri:'spotify:track:7qKpxGbdL1ZnGTo9hOI1r5'},
  {artist:'Hakan Abi ve Gitarı Boncuk',title:'Ceviz Adam Şarkısı',uri:'spotify:track:3LP5FpRYAmOTw02WigmDBr'},
  {artist:'Aleyna Ünyaylar',title:'Oynaya Oynaya Gelin Çocuklar',uri:'spotify:track:7pCZxKqhAjobSicOcNfoBI'},
  {artist:'Pelin Meray',title:'Bir Dünya Bırakın',uri:'spotify:track:6K6quQ7EVBXXz1F135gxJB'},
  {artist:'Barış Bahçeci / Zeynep Bade Bahçeci / E.B.',title:'Tavşan Kaç',uri:'spotify:track:7t7m8v8KvcsLNp0y5hvtqr'}
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
  if(BMD_TRACKS.length!==32)throw new Error(`Güvenlik: seçki ${BMD_TRACKS.length} parça. 32 olmalı.`);
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
    status('4+ kreş / anaokulu klasikleri yazılıyor...\n16 global + 16 Türkiye, toplam 32 parça.');
    const p=await bmdFindOrCreate();
    await bmdApi(`/playlists/${p.id}/items`,{method:'PUT',body:JSON.stringify({uris:BMD_TRACKS.map(x=>x.uri)})});
    await bmdApi(`/playlists/${p.id}`,{method:'PUT',body:JSON.stringify({name:BMD_NAME,public:true,description:BMD_DESC})});
    status('Bitti. Tek liste güncellendi.\n32 parça: 16 global + 16 Türkiye.\nOdak: 4 yaş, kreş/anaokulu repertuvarı, hareket-sayma-hayvan-rutin-söyleme oyunları.','ok');
  }finally{
    if(btn)btn.disabled=false;
  }
}

const bmdBtn=$('birce-music-discovery');
if(bmdBtn)bmdBtn.onclick=safe(buildBirceMusicDiscovery);
