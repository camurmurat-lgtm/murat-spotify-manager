/* Yeraltı Hattı v3
   KİLİTLİ KURAL SETİ
   - Playlist yazma: yalnız Murat Spotify Manager / Vercel
   - Yalnız Türkiye sahnesi
   - Pop / pop-rock yok
   - Anadolu rock / klasik yerli rock omurgası yok
   - Duman ve Adamlar istisna olarak serbest
   - Her ana sanatçıdan yalnızca 1 parça
   - ÇAMUR sabit seçim: İçerimdesin
   - Hedef 60, minimum 50
   - Spotify 429 kotasında işlem iptal olmaz: bekler ve aynı yerden devam eder
   - Bulunan kayıtlar tarayıcıda cache'lenir; yeniden çalıştırınca tekrar aranmaz
*/

const Y3_TARGET=60;
const Y3_MINIMUM=50;
const Y3_DELAY_MS=2600;
const Y3_CACHE_KEY='yerli_hatti_track_cache_v3';

const Y3_BLOCKED=new Set([
  'kargo','emre aydin','redd','vega','pilli bebek','malt','son feci bisiklet','neyse',
  'gripin','kolpa','model','seksendort','pinhani','manga','mor ve otesi','athena',
  'mabel matiz','melike sahin','ceylan ertem','goksel','teoman','feridun duzagac',
  'haluk levent','pera','yuksek sadakat',
  'erkin koray','cem karaca','baris manco','mogollar','selda bagcan','edip akbayram',
  'hardal','bunalim','kramp','whisky','mavi sakal','bulutsuzluk ozlemi','kesmeseker',
  'kurtalan ekspres','3 hurel','uc hurel','fikret kizilok','apaslar','mavi isiklar'
]);

const Y3_CANDIDATES=[
  ['ÇAMUR','İçerimdesin'],
  ['Replikas','Köledoyuran'],
  ['Nekropsi','Mi Kubbesi'],
  ['Gevende','Nem'],
  ['Jakuzi','Koca Bir Saçmalık'],
  ['She Past Away','Rituel'],
  ['Ductape','Veil of Lies'],
  ['Lalalar','İsyanlar'],
  ['The Ringo Jets','Spring of War'],
  ['Hedonutopia','Yakamoz Sandalı'],
  ['Ah! Kosmos','Stay'],
  ['Peyk','Don Kafa'],
  ['Duman','Belki Alışman Lazım'],
  ['Adamlar','Rüyalarda Buruşmuşuz'],
  ['Kurban','Yalan'],
  ['Çilekeş','Y.O.K.'],
  ['Rashit','Dinozor'],
  ['Bubituzak','Kimsin Sen'],
  ['No Land','Aramızda'],
  ['İnsanlar','Kime Ne'],
  ['Kim Ki O','Dans'],
  ['Büyük Ev Ablukada','Hayaletler'],
  ['Dr. Skull','Rules'],
  ['Murder King','Susma'],
  ['Black Tooth','Drink and Pass Out'],
  ['Pitch Black Process','Heroes of 2023'],
  ['Kaptan Kadavra','Nefes'],
  ['Rain To Rust','Stillborn Flowers'],
  ['Affet Robot','Rüya'],
  ['Apartmanlar','Son'],
  ['Mekanik','Bazen'],
  ['Konstrukt','Dolunay'],
  ['Korhan Futacı ve Kara Orkestra','Kara'],
  ['123','Arve'],
  ['Ethnique Punch','Vur'],
  ['Grup Ses','Bosphorus'],
  ['Geeva Flava','Burning Bridges'],
  ['Ayyuka','Som Amores'],
  ['Hayvanlar Alemi','Guarana Superpower'],
  ['Zen','Derya'],
  ['Second','Rüya'],
  ['Lara Di Lara','Hazineler İçindesin'],
  ['Kafabindünya','Obi'],
  ['Yok Öyle Kararlı Şeyler','Nefes Almak Zor'],
  ['Eskiz','Rüyalar'],
  ['Dengesiz Herifler','İstanbul'],
  ['Radical Noise','Plan-B'],
  ['Pickpocket','Falling'],
  ['Cemiyette Pişiyorum','Et Rengi'],
  ['Dinar Bandosu','Saykodelikdeşik'],
  ['Fairuz Derin Bulut','Arabesk'],
  ['Haossaa','Çözülme'],
  ['2/5 BZ','No Pasaran'],
  ['Kilink','Zehir'],
  ['Padme','Bugün'],
  ['Kana Kana','Kayıp'],
  ['The Flabbies','Red'],
  ['The Away Days','Your Colour'],
  ['Post Dial','Night'],
  ['Mind Shifter','Ghosts'],
  ['Pitohui','Gölge'],
  ['Badmixday','Unut'],
  ['Brek','Gece'],
  ['Tampon','Punk'],
  ['Kaos','Kaos'],
  ['The Clown','No Future'],
  ['Sattas','Bundan Sonra'],
  ['Palmiyeler','Derine'],
  ['Kırıka','Kaba Saz'],
  ['Elektro Hafız','Destur'],
  ['BaBa ZuLa','Cecom'],
  ['Hayko Cepkin','Sandık'],
  ['Pentagram','Bir'],
  ['The Madcap','Stepped On A Lego'],
  ['Al'York','Golden Table'],
  ['Sonic Boom','Yalnızlık'],
  ['Kozmonotosman','Marmara'],
  ['Objektif','Künye'],
  ['Haunted','Geceler'],
  ['Furtherial','Destroying At Dawn']
];

const Y3_ALIASES={
  'camur':['camur','çamur'],
  'baba zula':['baba zula','baba zula'],
  'ah kosmos':['ah kosmos'],
  'buyuk ev ablukada':['buyuk ev ablukada','büyük ev ablukada'],
  'korhan futaci ve kara orkestra':['korhan futaci ve kara orkestra','korhan futacı ve kara orkestra'],
  'yok oyle kararli seyler':['yok oyle kararli seyler','yok öyle kararlı şeyler'],
  'cemiyette pisiyorum':['cemiyette pisiyorum','cemiyette pişiyorum'],
  'fairuz derin bulut':['fairuz derin bulut'],
  '2 5 bz':['2 5 bz','2/5 bz'],
  'the ringo jets':['the ringo jets','ringo jets']
};

function y3norm(s=''){
  return String(s).toLocaleLowerCase('tr-TR').normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i')
    .replace(/[^a-z0-9]+/g,' ').trim();
}
function y3blocked(name=''){return Y3_BLOCKED.has(y3norm(name));}
function y3aliases(name=''){const n=y3norm(name);return (Y3_ALIASES[n]||[n]).map(y3norm);}
function y3artistOK(expected,t){
  if(y3blocked(expected))return false;
  const aliases=y3aliases(expected);
  const actual=(t?.artists||[]).map(a=>y3norm(a.name));
  if(actual.some(a=>Y3_BLOCKED.has(a)))return false;
  return actual.some(a=>aliases.some(x=>a===x||a.includes(x)||x.includes(a)));
}
function y3versionOK(name=''){
  const n=y3norm(name);
  return !['remix','live','canli','akustik','acoustic','sped up','slowed','karaoke'].some(x=>n.includes(y3norm(x)));
}
function y3titleScore(expected,actual){
  const e=y3norm(expected),a=y3norm(actual);
  if(a===e)return 100;
  if(a.includes(e)||e.includes(a))return 85;
  const toks=e.split(/\s+/).filter(x=>x.length>2);
  if(!toks.length)return 0;
  return Math.round(70*toks.filter(x=>a.includes(x)).length/toks.length);
}
function y3cacheGet(){try{return JSON.parse(localStorage.getItem(Y3_CACHE_KEY)||'{}')}catch{return {}}}
function y3cacheSet(x){localStorage.setItem(Y3_CACHE_KEY,JSON.stringify(x));}

async function y3api(path){
  for(let outer=0;outer<10;outer++){
    try{return await api(path);}
    catch(e){
      const msg=String(e?.message||e);
      if(!msg.includes('Spotify API 429'))throw e;
      const sec=Math.min(180,45+outer*15);
      status(`Spotify arama kotası dolu. Listeye dokunulmadı. ${sec} saniye bekleyip aynı yerden otomatik devam ediyorum...`,'warn');
      await sleep(sec*1000);
    }
  }
  throw new Error('Spotify arama kotası uzun süre kapalı kaldı. Mevcut listeye dokunulmadı; daha sonra aynı düğmeye basınca cache üzerinden kaldığı yerden devam eder.');
}

function y3choose(expectedTitle,items=[]){
  const pool=items.filter(t=>t?.uri&&y3versionOK(t.name));
  if(!pool.length)return null;
  let best=null,bestScore=-1;
  for(const t of pool){
    const ts=y3titleScore(expectedTitle,t.name);
    if(ts>bestScore){best=t;bestScore=ts;}
  }
  if(bestScore>=60)return best;
  return pool.map(t=>{
    const p=Number.isFinite(t.popularity)?t.popularity:25;
    return {t,score:100-Math.abs(p-22)};
  }).sort((a,b)=>b.score-a.score)[0]?.t||null;
}

async function y3resolve(artist,title,cache){
  const key=y3norm(artist)+'|'+y3norm(title);
  const cached=cache[key];
  if(cached?.uri)return cached;
  if(y3blocked(artist))return null;
  const q='artist:'+artist;
  const j=await y3api('/search?type=track&limit=10&q='+encodeURIComponent(q));
  const same=(j.tracks?.items||[]).filter(t=>y3artistOK(artist,t));
  const picked=y3choose(title,same);
  if(!picked)return null;
  const out={uri:picked.uri,id:picked.id,name:picked.name,artist:picked.artists?.[0]?.name||artist};
  cache[key]=out;
  y3cacheSet(cache);
  return out;
}

function y3selectPlaylist(){
  const sel=$('playlist');
  const wanted=[...sel.options].find(o=>y3norm(o.textContent).includes('yeralti hatti'));
  if(wanted){sel.value=wanted.value;return wanted.value;}
  if(sel.value&&y3norm(sel.options[sel.selectedIndex]?.textContent||'').includes('yeralti'))return sel.value;
  return '';
}

async function buildYerliV3(){
  const id=y3selectPlaylist();
  if(!id)throw new Error('Önce “Yeraltı Hattı” listesini seç.');
  const btn=$('yerli');
  btn.disabled=true;
  const cache=y3cacheGet();
  const uris=[];
  const usedArtists=new Set();
  const missing=[];
  try{
    for(let i=0;i<Y3_CANDIDATES.length&&uris.length<Y3_TARGET;i++){
      const [artist,title]=Y3_CANDIDATES[i];
      if(y3blocked(artist))continue;
      status(`Yeraltı Hattı hazırlanıyor: ${uris.length}/${Y3_TARGET}\n${artist} — ${title}\nBulunan kayıtlar cache'e alınıyor; kota olursa otomatik beklenecek.`);
      const t=await y3resolve(artist,title,cache);
      if(!t){missing.push(`${artist} — ${title}`);await sleep(Y3_DELAY_MS);continue;}
      const aid=y3norm(t.artist);
      if(usedArtists.has(aid))continue;
      uris.push(t.uri);
      usedArtists.add(aid);
      await sleep(Y3_DELAY_MS);
    }
    if(uris.length<Y3_MINIMUM){
      throw new Error(`Listeye dokunmadım. Şimdilik ${uris.length} güvenli farklı sanatçı bulundu; minimum ${Y3_MINIMUM}. Bulunanlar cache'de. Aynı düğmeyle devam edebilirsin.`);
    }
    status(`${uris.length} farklı sanatçı hazır. Şimdi yalnızca playlist yazma isteği gönderiliyor...`);
    await replaceWith(id,uris);
    status(`Bitti. ${uris.length} şarkı / ${uris.length} farklı sanatçı. Pop-pop rock ve Anadolu rock filtresi aktif. ÇAMUR: İçerimdesin.${missing.length?` ${missing.length} aday katalogda eşleşmedi.`:''}`,'ok');
    await playlists();
    $('playlist').value=id;
  } finally {btn.disabled=false;}
}

window.addEventListener('load',()=>{
  const btn=$('yerli');
  if(btn)btn.onclick=safe(buildYerliV3);
});
