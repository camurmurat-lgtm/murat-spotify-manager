/* Between ÇAMUR & Elsewhere: Yeraltı Hattı
   KİLİTLİ KURAL SETİ:
   - Yalnızca Türkiye sahnesinden sanatçılar
   - Pop / pop-rock yok
   - Anadolu rock / klasik yerli rock omurgası yok
   - Duman ve Adamlar önceki açık isteğe göre istisna olarak serbest
   - Her ana sanatçıdan yalnızca 1 parça
   - ÇAMUR sabit seçim: İçerimdesin
   - Hedef 60, minimum 50
   - Spotify 429'a karşı yavaş ve kontrollü sorgulama
*/

const YERLI_TARGET = 60;
const YERLI_MINIMUM = 50;
const YERLI_GAP_MS = 1800;

const YERLI_BLOCKED_ARTISTS = new Set([
  /* pop / pop-rock / ana akım alternatif */
  'kargo','emre aydin','redd','vega','pilli bebek','malt','son feci bisiklet','neyse',
  'sapan','gren','direc t','soft analog','gripin','kolpa','model','seksendort','pinhani',
  'manga','mor ve otesi','athena','mabel matiz','melike sahin','ceylan ertem','goksel',
  'teoman','feridun duzagac','haluk levent','pera','yuksek sadakat',

  /* Anadolu rock / klasik yerli rock hattı */
  'erkin koray','cem karaca','baris manco','mogollar','selda bagcan','edip akbayram',
  'hardal','bunalim','kramp','whisky','mavi sakal','bulutsuzluk ozlemi','kesmeseker',
  'kurtalan ekspres','3 hurel','uc hurel','fikret kizilok','apaslar','mavi isiklar'
]);

const YERLI_CANDIDATES = [
  ['ÇAMUR','İçerimdesin'],
  ['Replikas','Köledoyuran'],
  ['Nekropsi','Mi Kubbesi'],
  ['Baba Zula','Cecom'],
  ['Gevende','Nem'],
  ['Jakuzi','Koca Bir Saçmalık'],
  ['She Past Away','Rituel'],
  ['Ductape','Veil of Lies'],
  ['Lalalar','İsyanlar'],
  ['Gaye Su Akyol','İstikrarlı Hayal Hakikattir'],
  ['Islandman','Agit'],
  ['Hey! Douglas','Durduramazsın'],
  ['The Ringo Jets','Spring of War'],
  ['Palmiyeler','Senden Haber Yok'],
  ['Hedonutopia','Yakamoz Sandalı'],
  ['Ah! Kosmos','Stay'],
  ['Peyk','Don Kafa'],
  ['Duman','Belki Alışman Lazım'],
  ['Adamlar','Rüyalarda Buruşmuşuz'],
  ['Kurban','Yalan'],
  ['Çilekeş','Y.O.K.'],
  ['Hayko Cepkin','Sandık'],
  ['Pentagram','Bir'],
  ['Rashit','Dinozor'],
  ['Bubituzak','Kimsin Sen'],
  ['No Land','Aramızda'],
  ['İnsanlar','Kime Ne'],
  ['Elektro Hafız','Destur'],
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
  ['Kırıka','Kaba Saz'],
  ['Hayvanlar Alemi','Guarana Superpower'],
  ['Zen','Derya'],
  ['Kozmonotosman','Marmara'],
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
  ['Sattas','Bundan Sonra']
];

const YERLI_ALIASES = {
  'camur':['camur','çamur'],
  'baba zula':['baba zula'],
  'hey douglas':['hey douglas'],
  'the ringo jets':['the ringo jets','ringo jets'],
  'ah kosmos':['ah kosmos'],
  'buyuk ev ablukada':['buyuk ev ablukada','büyük ev ablukada'],
  'korhan futaci ve kara orkestra':['korhan futaci ve kara orkestra','korhan futacı ve kara orkestra'],
  'rain to rust':['rain to rust'],
  'yok oyle kararli seyler':['yok oyle kararli seyler','yok öyle kararlı şeyler'],
  'cemiyette pisiyorum':['cemiyette pisiyorum','cemiyette pişiyorum'],
  'fairuz derin bulut':['fairuz derin bulut'],
  '2 5 bz':['2 5 bz','2/5 bz']
};

function yerliNorm(s=''){
  return String(s).toLocaleLowerCase('tr-TR').normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i')
    .replace(/[^a-z0-9]+/g,' ').trim();
}

const YERLI_ALLOWED_ARTISTS = new Set(YERLI_CANDIDATES.map(([artist])=>yerliNorm(artist)));

function yerliBlocked(name=''){
  return YERLI_BLOCKED_ARTISTS.has(yerliNorm(name));
}

function yerliArtistOK(expected, track){
  const expectedNorm=yerliNorm(expected);
  if(!YERLI_ALLOWED_ARTISTS.has(expectedNorm) || yerliBlocked(expected)) return false;
  const aliases=YERLI_ALIASES[expectedNorm] || [expectedNorm];
  const actual=(track?.artists||[]).map(a=>yerliNorm(a.name));
  if(actual.some(a=>YERLI_BLOCKED_ARTISTS.has(a))) return false;
  return actual.some(a=>aliases.some(x=>{
    const xn=yerliNorm(x);
    return a===xn || a.includes(xn) || xn.includes(a);
  }));
}

function yerliTitleScore(expected, actual){
  const e=yerliNorm(expected), a=yerliNorm(actual);
  if(a===e) return 100;
  if(a.includes(e) || e.includes(a)) return 85;
  const toks=e.split(/\s+/).filter(x=>x.length>2);
  if(!toks.length) return 0;
  return Math.round(70*toks.filter(x=>a.includes(x)).length/toks.length);
}

function yerliVersionOK(name=''){
  const n=yerliNorm(name);
  return !['remix','live','canli','akustik','acoustic','sped up','slowed','karaoke'].some(x=>n.includes(yerliNorm(x)));
}

function chooseUndergroundFallback(items=[]){
  const pool=items.filter(t=>t?.uri && yerliVersionOK(t.name));
  if(!pool.length) return null;
  return pool.map(t=>{
    const p=Number.isFinite(t.popularity)?t.popularity:28;
    const target=24;
    return {t,score:100-Math.abs(p-target)};
  }).sort((a,b)=>b.score-a.score)[0]?.t || null;
}

async function yerliApi(path,longRetry=0){
  try{
    return await api(path);
  }catch(e){
    const msg=String(e?.message||e);
    if(msg.includes('Spotify API 429') && longRetry<2){
      const waitMs=longRetry===0?30000:60000;
      status(`Spotify kota sınırına geldi. ${Math.round(waitMs/1000)} sn güvenli bekleme yapılıyor; listeye henüz dokunulmadı...`,'warn');
      await sleep(waitMs);
      return yerliApi(path,longRetry+1);
    }
    throw e;
  }
}

async function yerliFindTrack(artist,title){
  if(yerliBlocked(artist)) return {track:null,fallback:false};

  const q=`track:${title} artist:${artist}`;
  const j=await yerliApi('/search?type=track&limit=10&q='+encodeURIComponent(q));
  let best=null,bestScore=-1;
  for(const t of (j.tracks?.items||[])){
    if(!t?.uri || !yerliArtistOK(artist,t) || !yerliVersionOK(t.name)) continue;
    const score=yerliTitleScore(title,t.name);
    if(score>bestScore){best=t;bestScore=score;}
  }
  if(bestScore>=60) return {track:best,fallback:false};
  if(yerliNorm(artist)==='camur') return {track:null,fallback:false};

  await sleep(YERLI_GAP_MS);
  const a=await yerliApi('/search?type=track&limit=10&q='+encodeURIComponent(`artist:${artist}`));
  const sameArtist=(a.tracks?.items||[]).filter(t=>yerliArtistOK(artist,t));
  const fallback=chooseUndergroundFallback(sameArtist);
  return {track:fallback,fallback:!!fallback};
}

function selectYerliPlaylist(){
  const sel=$('playlist');
  const wanted=[...sel.options].find(o=>yerliNorm(o.textContent).includes('yeralti hatti'));
  if(wanted){sel.value=wanted.value;return wanted.value;}
  if(sel.value){
    const txt=yerliNorm(sel.options[sel.selectedIndex]?.textContent||'');
    if(txt.includes('yeralti')) return sel.value;
  }
  return '';
}

async function buildYerli(){
  const id=selectYerliPlaylist();
  if(!id) throw new Error('Önce “Yeraltı Hattı” listesini seç.');
  const btn=$('yerli');
  btn.disabled=true;
  const uris=[];
  const usedPrimaryArtists=new Set();
  const usedExpectedArtists=new Set();
  const missing=[];
  const fallbacks=[];
  try{
    status('Spotify kota koruması açık. Liste yavaş ama güvenli biçimde hazırlanıyor...','warn');
    await sleep(2500);

    for(let i=0;i<YERLI_CANDIDATES.length && uris.length<YERLI_TARGET;i++){
      const [artist,title]=YERLI_CANDIDATES[i];
      const expectedKey=yerliNorm(artist);
      if(yerliBlocked(artist) || usedExpectedArtists.has(expectedKey)) continue;
      usedExpectedArtists.add(expectedKey);

      status(`Yeraltı Hattı hazırlanıyor: ${uris.length}/${YERLI_TARGET}\n${artist} — ${title}\nKota koruması aktif.`);
      const found=await yerliFindTrack(artist,title);
      const t=found.track;
      if(!t){missing.push(`${artist} — ${title}`);await sleep(YERLI_GAP_MS);continue;}

      const primaryId=t.artists?.[0]?.id || yerliNorm(t.artists?.[0]?.name||artist);
      if(usedPrimaryArtists.has(primaryId)){await sleep(YERLI_GAP_MS);continue;}
      uris.push(t.uri);
      usedPrimaryArtists.add(primaryId);
      if(found.fallback) fallbacks.push(`${artist} → ${t.name}`);
      await sleep(YERLI_GAP_MS);
    }

    if(uris.length<YERLI_MINIMUM){
      throw new Error(`Listeye dokunmadım. Yalnız ${uris.length} güvenli ve farklı sanatçı eşleşmesi bulundu; minimum ${YERLI_MINIMUM}.`);
    }

    status(`${uris.length} şarkı bulundu. Pop/pop-rock ve Anadolu rock filtreleri açık. Liste şimdi tek seferde yeniden yazılıyor...`);
    await replaceWith(id,uris);
    status(`Bitti. ${uris.length} şarkı, ${uris.length} farklı sanatçı. ÇAMUR seçimi “İçerimdesin”. Pop/pop-rock + Anadolu rock blok listesi aktif.${fallbacks.length?` ${fallbacks.length} sanatçıda aynı sanatçı içinden kontrollü alternatif seçildi.`:''}${missing.length?` ${missing.length} aday bulunamadı.`:''}`,'ok');
    await playlists();
    $('playlist').value=id;
  } finally {
    btn.disabled=false;
  }
}

window.addEventListener('load',()=>{
  const btn=$('yerli');
  if(btn) btn.onclick=safe(buildYerli);
});