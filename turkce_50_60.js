/* Türkçe 50'ler & 60'lar
   Curated from historical canon, period charts and enduring catalogue visibility.
   Rules: one playlist, one primary artist per track, target 40 tracks, minimum 32.
   The list is weighted toward culturally durable / widely accepted recordings, not lightweight novelty pop. */

const TR5060_PLAYLIST = "Türkçe 50'ler & 60'lar";
const TR5060_TARGET = 40;
const TR5060_MINIMUM = 32;

const TR5060_CANDIDATES = [
  ['Abdullah Yüce','Bu Ne Sevgi Ah'],
  ['Safiye Ayla','Gönül Şarkıları'],
  ['Müzeyyen Senar','Bir İhtimal Daha Var'],
  ['Zeki Müren','Manolyam'],
  ['Nesrin Sipahi','Bir Rüzgardır Gelir Geçer Sanmıştım'],

  ['İlham Gencer','Bak Bir Varmış Bir Yokmuş'],
  ['Tülay German','Burçak Tarlası'],
  ['Ajda Pekkan','Her Yerde Kar Var'],
  ['Yıldırım Gürses','Gençliğe Veda'],
  ['Mavi Işıklar','Helvacı'],
  ['Silüetler','Lorke Lorke'],
  ['Cahit Oben Dörtlüsü','Makaram Sarı Bağlar'],
  ['Selçuk Alagöz','Kaleden İndir Beni'],
  ['Ayla Dikmen',"Niksar'ın Fidanları"],
  ['Erol Büyükburç','Kara Kaş Gözlerin Elmas'],
  ['Tanju Okan','Katibim'],
  ['Alpay','Kara Tren'],
  ['Cem Karaca','Emrah'],
  ['Timur Selçuk','Ayrılanlar İçin'],
  ['Gönül Yazar','Arkadaşımın Aşkısın'],
  ['Ayten Alpman','Sensiz Olamam'],
  ['Berkant','Samanyolu'],
  ['Barış Manço','Kol Düğmeleri'],
  ['Özdemir Erdoğan','Kim Bilir'],
  ['Kamuran Akkor','Aşk Eski Bir Yalan'],
  ['Ömür Göksel','Yıllar Geçti Ardından'],
  ['Ertan Anapa','Bir Gün Sen de Unutursun'],
  ['Selçuk Ural','Ben de Sevdim Bir Zamanlar'],
  ['Semiramis Pekkan','Bu Ne Biçim Hayat'],
  ['Erkin Koray','Kızları da Alın Askere'],
  ['Hümeyra','Kördüğüm'],
  ['Moğollar','Dağ ve Çocuk'],
  ['Esin Afşar','Yoh Yoh'],
  ['Yaşar Güvenir','Sensiz Saadet Neymiş'],
  ['Selami Şahin','İnleyen Nağmeler'],
  ['Âşık Mahzuni Şerif','Yuh Yuh'],
  ['Âşık İhsani','Balta'],
  ['Modern Folk Üçlüsü','Ali Paşa Ağıtı'],
  ['Fikret Kızılok','Yumma Gözün Kör Gibi'],
  ['Gönül Akkor','Böyle Gelmiş Böyle Geçer Dünya'],

  /* Backups, only used if a main title is absent from Spotify's current catalogue */
  ['Rana Alagöz','Köyümüz'],
  ['Şehrazat','İki Gölge'],
  ['Dario Moreno','Her Akşam Votka Rakı ve Şarap'],
  ['Erol Evgin','Sen'],
  ['Metin Ersoy','Shake Sevgilim'],
  ['Cantekin','Sessiz Gece'],
  ['Saadet Sun','Sen Neredesin'],
  ['Ali Kocatepe','Aşka Özlem'],
  ['Gönül Turgut','Üzüntüyü Bırak Yaşamaya Bak'],
  ['Erkut Taçkın','Sevmek İstiyorum']
];

const TR5060_ALIASES = {
  'ilham gencer':['ilham gencer','bozkurt ilham gencer'],
  'cahit oben dortlusu':['cahit oben dortlusu','cahit oben 4','cahit oben dörtlüsü','cahit oben'],
  'cem karaca':['cem karaca','cem karaca & apaşlar','cem karaca apaslar','cem karaca ve apaşlar'],
  'baris manco':['baris manco','barış manço','baris manco kaygisizlar','barış manço kaygısızlar'],
  'asik mahzuni serif':['asik mahzuni serif','aşık mahzuni şerif','mahzuni serif'],
  'asik ihsani':['asik ihsani','aşık ihsani'],
  'modern folk uclusu':['modern folk uclusu','modern folk üçlüsü'],
  'siluetler':['siluetler','silüetler']
};

function tr5060Norm(s=''){
  return String(s).toLocaleLowerCase('tr-TR').normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i')
    .replace(/[^a-z0-9]+/g,' ').trim();
}

function tr5060ArtistOK(expected,track){
  const e=tr5060Norm(expected);
  const aliases=TR5060_ALIASES[e] || [e];
  const actual=(track?.artists||[]).map(a=>tr5060Norm(a.name));
  return actual.some(a=>aliases.some(x=>a===x || a.includes(x) || x.includes(a)));
}

function tr5060TitleScore(expected,actual){
  const e=tr5060Norm(expected), a=tr5060Norm(actual);
  if(a===e) return 100;
  if(a.includes(e) || e.includes(a)) return 88;
  const toks=e.split(/\s+/).filter(x=>x.length>2);
  if(!toks.length) return 0;
  return Math.round(75*toks.filter(x=>a.includes(x)).length/toks.length);
}

async function tr5060FindTrack(artist,title){
  const queries=[`track:${title} artist:${artist}`,`${artist} ${title}`];
  let best=null,bestScore=-1;
  for(const q of queries){
    const j=await api('/search?type=track&limit=10&q='+encodeURIComponent(q));
    for(const t of (j.tracks?.items||[])){
      if(!t?.uri || !tr5060ArtistOK(artist,t)) continue;
      const score=tr5060TitleScore(title,t.name);
      if(score>bestScore){best=t;bestScore=score;}
    }
    if(bestScore>=88) break;
    await sleep(150);
  }
  return bestScore>=65 ? best : null;
}

async function tr5060EnsurePlaylist(){
  await playlists();
  const sel=$('playlist');
  const wanted=tr5060Norm(TR5060_PLAYLIST);
  let opt=[...sel.options].find(o=>tr5060Norm((o.textContent||'').replace(/\s*\(\d+\)\s*$/,''))===wanted);
  if(opt){sel.value=opt.value;return opt.value;}
  status(`“${TR5060_PLAYLIST}” oluşturuluyor...`);
  const me=await api('/me');
  const j=await api('/users/'+encodeURIComponent(me.id)+'/playlists',{method:'POST',body:JSON.stringify({
    name:TR5060_PLAYLIST,
    public:false,
    description:"1950-1969 Türkiye: kalıcı, kabul görmüş ve güçlü Türkçe kayıtlar. Murat Spotify Manager seçkisi."
  })});
  await playlists();
  $('playlist').value=j.id;
  return j.id;
}

async function buildTR5060(){
  const btn=$('tr5060');
  btn.disabled=true;
  const uris=[];
  const usedPrimaryArtists=new Set();
  const missing=[];
  try{
    const id=await tr5060EnsurePlaylist();
    for(let i=0;i<TR5060_CANDIDATES.length && uris.length<TR5060_TARGET;i++){
      const [artist,title]=TR5060_CANDIDATES[i];
      status(`Türkçe 50'ler & 60'lar hazırlanıyor: ${uris.length}/${TR5060_TARGET}\n${artist} — ${title}`);
      const t=await tr5060FindTrack(artist,title);
      if(!t){missing.push(`${artist} — ${title}`);await sleep(150);continue;}
      const primaryId=t.artists?.[0]?.id || tr5060Norm(t.artists?.[0]?.name||artist);
      if(usedPrimaryArtists.has(primaryId)) continue;
      uris.push(t.uri);
      usedPrimaryArtists.add(primaryId);
      await sleep(160);
    }
    if(uris.length<TR5060_MINIMUM){
      throw new Error(`Listeye dokunmadım. Yalnız ${uris.length} güvenli ve farklı sanatçı eşleşmesi bulundu; minimum ${TR5060_MINIMUM}.`);
    }
    status(`${uris.length} güçlü kayıt bulundu. Tek liste halinde Spotify'a yazılıyor...`);
    await replaceWith(id,uris);
    status(`Bitti. ${uris.length} şarkı, ${uris.length} farklı sanatçı. Türkçe 50'ler & 60'lar seçkisi hazır.${missing.length?` ${missing.length} aday güvenli eşleşmediği için atlandı.`:''}`,'ok');
    await playlists();
    $('playlist').value=id;
  } finally {
    btn.disabled=false;
  }
}

window.addEventListener('load',()=>{
  const btn=$('tr5060');
  if(btn) btn.onclick=safe(buildTR5060);
});
