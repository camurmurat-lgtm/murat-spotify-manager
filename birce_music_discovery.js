/* Birce — KÜÇÜK KULAKLAR, BÜYÜK DÜNYA
   Curated 4+ music discovery list.
   - One public playlist only
   - 32 fixed, pre-verified Spotify tracks
   - Turkish + global repertoire
   - Children's classics, folk, jazz, world, thoughtful pop and classical
   - No runtime search and no source-playlist scan
   - Quality over quantity
*/

const BMD_NAME='KÜÇÜK KULAKLAR, BÜYÜK DÜNYA | 4+ MUSIC DISCOVERY';
const BMD_DESC='4 yaş çevresi için nitelikli ilk müzik kütüphanesi: Türkiye ve dünyadan çocuk klasiklerinden folk, jazz, world, pop ve klasik müziğe uzanan 32 seçki. Güçlü melodi, kültürel hafıza ve gerçek icracılar.';
const BMD_TRACKS=[
  {artist:'Barış Manço',title:'Arkadaşım Eşşek',uri:'spotify:track:5KQ2Erk5YRy7QxgBkZmetv'},
  {artist:'Raffi & Yo-Yo Ma',title:'Baby Beluga - 40th Anniversary Version',uri:'spotify:track:40oUxbmsYW6a62kmuJgsEv'},
  {artist:'The Beatles',title:'Yellow Submarine - Remastered 2009',uri:'spotify:track:50xwQXPtfNZFKFeZ0XePWc'},
  {artist:'Şubadap Çocuk',title:'Gökyüzünü İten Kuş',uri:'spotify:track:6twoBjXNT94NwNrKh3KXwx'},
  {artist:'Ella Jenkins',title:"You'll Sing a Song and I'll Sing a Song",uri:'spotify:track:3PyfzEyTIgqKdsXRyFTKOj'},
  {artist:'Louis Armstrong',title:'What A Wonderful World',uri:'spotify:track:29U7stRjqHU6rMiS8BfaI9'},
  {artist:'Zülfü Livaneli',title:'Güneş Topla Benim İçin',uri:'spotify:track:1fNK4C7QHDZZOAY3euAgyB'},
  {artist:'Kermit',title:'Rainbow Connection',uri:'spotify:track:4Fx3LVYQXplhz70cfoqbgq'},
  {artist:'Elizabeth Mitchell',title:'You Are My Sunshine',uri:'spotify:track:10CsMKlayFJOj4Lai9tAvm'},
  {artist:'Aşık Veysel',title:'Uzun İnce Bir Yoldayım',uri:'spotify:track:7jquDCB0srCKiBJp0GuUDx'},
  {artist:'Peter, Paul and Mary',title:'Puff, the Magic Dragon',uri:'spotify:track:3hqsBLMAqJqrhr434Z7WlA'},
  {artist:'Incesaz',title:'Üskudara Gider İken',uri:'spotify:track:2l1dzHBaJ0pH7s2wW1rU8n'},
  {artist:'João Gilberto',title:'O Pato',uri:'spotify:track:1IRLklzYuWHqlQDNYw4Xgv'},
  {artist:'Selda Bağcan',title:'Çemberimde Gül Oya',uri:'spotify:track:2DcHSuRoTeMZxoFlyFkQS6'},
  {artist:'Harry Belafonte',title:'Banana Boat (Day-O)',uri:'spotify:track:4fHDlIntTsRGSyTg5UYZYC'},
  {artist:'Kardeş Türküler & Erkan Oğur',title:'Bahçada Yeşil Çınar / Gazel',uri:'spotify:track:1J8N6EGHKdI3B0tcNFYbAe'},
  {artist:'Miriam Makeba',title:'Pata Pata',uri:'spotify:track:1BLXxFPDL2BT37nHKD7KrA'},
  {artist:'Ezginin Günlüğü',title:'Ebruli',uri:'spotify:track:7araPz4GtnJZLmK0X4coln'},
  {artist:'Bob Marley & The Wailers',title:'Three Little Birds - B Is For Bob Version',uri:'spotify:track:6j4VnaRGkAmQkew4eKaPEl'},
  {artist:'Nil Karaibrahimgil',title:'Kanatlarım Var Ruhumda',uri:'spotify:track:6WFiu2h2yeFaK2XVOeLgcG'},
  {artist:'Bobby McFerrin',title:"Don't Worry Be Happy",uri:'spotify:track:4hObp5bmIJ3PP3cKA9K9GY'},
  {artist:'Sezen Aksu',title:'Gülümse',uri:'spotify:track:5fejcHsVRZuxHu0XpCeiqf'},
  {artist:'Ella Fitzgerald',title:'A-Tisket, A-Tasket',uri:'spotify:track:5935p4F2K5crvwdc6mBLPg'},
  {artist:'Yeni Türkü',title:'Telli Telli',uri:'spotify:track:7qP8QUB0XDbiER6nGu7Qr8'},
  {artist:'Henri Salvador',title:'Une chanson douce',uri:'spotify:track:1fzVYRFjXzmuVS5Qb2DxB1'},
  {artist:'Cahit Berkay',title:'Selvi Boylum Al Yazmalım',uri:'spotify:track:3Bnxj2aIdu5o75SZD5sjSy'},
  {artist:'Camille Saint-Saëns / Yo-Yo Ma / Kathryn Stott',title:'The Swan',uri:'spotify:track:2LKMUX3iN0tQOvggbalydj'},
  {artist:'Mozart / Fazıl Say',title:'Ah, vous dirai-je maman - Theme',uri:'spotify:track:5l8q7SVxGQ1NYXTe20OuK1'},
  {artist:"Israel Kamakawiwo'ole",title:'Somewhere Over The Rainbow/What A Wonderful World',uri:'spotify:track:25U7raB3ZSszayTYClh4hF'},
  {artist:'Melike Demirağ',title:'Arkadaş',uri:'spotify:track:1pZ7rNVMH3LmoQtoPjHfdh'},
  {artist:'Çocuk Korosu',title:'Küçük Oduncular',uri:'spotify:track:7adC7XhJs5N881UHORGqxj'},
  {artist:'Pelin Meray',title:'Bir Dünya Bırakın',uri:'spotify:track:6K6quQ7EVBXXz1F135gxJB'}
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
  const artists=new Set(BMD_TRACKS.map(x=>x.artist.toLocaleLowerCase('tr-TR').trim()));
  if(uris.size!==BMD_TRACKS.length)throw new Error('Güvenlik: tekrarlanan parça bulundu.');
  if(artists.size!==BMD_TRACKS.length)throw new Error('Güvenlik: tekrarlanan ana sanatçı etiketi bulundu.');
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
    status('Küçük Kulaklar, Büyük Dünya hazırlanıyor...\n32 sabit ve doğrulanmış kayıt tek seferde yazılacak.');
    const p=await bmdFindOrCreate();
    await bmdApi(`/playlists/${p.id}/items`,{method:'PUT',body:JSON.stringify({uris:BMD_TRACKS.map(x=>x.uri)})});
    await bmdApi(`/playlists/${p.id}`,{method:'PUT',body:JSON.stringify({name:BMD_NAME,public:true,description:BMD_DESC})});
    status(`Bitti. Tek liste hazır.\n32 parça / 32 farklı sanatçı etiketi.\nTürkiye + dünya, çocuk klasikleri + folk + jazz + world + pop + klasik. Runtime araması yok.`,'ok');
  }finally{
    if(btn)btn.disabled=false;
  }
}

const bmdBtn=$('birce-music-discovery');
if(bmdBtn)bmdBtn.onclick=safe(buildBirceMusicDiscovery);
