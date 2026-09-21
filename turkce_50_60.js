/* Türkçe 50'ler & 60'lar — Batı müziği temelli
   No sanat müziği, fantezi or arabesk.
   Focus: hafif Batı müziği, aranjman, rock'n'roll, twist, beat, psychedelia,
   early Turkish pop, Anadolu pop/rock, jazz/chanson-influenced recordings. */

const TR5060_PLAYLIST = "Türkçe 50'ler & 60'lar";
const TR5060_TARGET = 30;
const TR5060_MINIMUM = 24;

const TR5060_CANDIDATES = [
  ['İlham Gencer','Bak Bir Varmış Bir Yokmuş'],
  ['Erol Büyükburç','Kara Kaş Gözlerin Elmas'],
  ['Metin Ersoy','Vakit Yok Gemi Kalkıyor'],
  ['Dario Moreno','Her Akşam Votka Rakı ve Şarap'],
  ['Tülay German','Burçak Tarlası'],
  ['Ajda Pekkan','Her Yerde Kar Var'],
  ['Mavi Işıklar','Helvacı'],
  ['Silüetler','Lorke Lorke'],
  ['Cahit Oben Dörtlüsü','Makaram Sarı Bağlar'],
  ['Selçuk Alagöz','Kaleden İndir Beni'],
  ['Rana Alagöz','Konya Kabağı'],
  ['Ayla Dikmen',"Niksar'ın Fidanları"],
  ['Tanju Okan','Katibim'],
  ['Alpay','Kara Tren'],
  ['Berkant','Samanyolu'],
  ['Barış Manço','Kol Düğmeleri'],
  ['Cem Karaca','Emrah'],
  ['Erkin Koray','Kızları da Alın Askere'],
  ['Moğollar','Ilgaz'],
  ['Fikret Kızılok','Yumma Gözün Kör Gibi'],
  ['Hümeyra','Kördüğüm'],
  ['Timur Selçuk','Ayrılanlar İçin'],
  ['Özdemir Erdoğan','Kim Bilir'],
  ['Ömür Göksel','Yıllar Geçti Ardından'],
  ['Semiramis Pekkan','Bu Ne Biçim Hayat'],
  ['Selçuk Ural','Ben de Sevdim Bir Zamanlar'],
  ['Erkut Taçkın','Sevmek İstiyorum'],
  ['Ertan Anapa','Bir Gün Sen de Unutursun'],
  ['Şehrazat','İki Gölge'],
  ['Saadet Sun','Sen Neredesin'],

  /* backups */
  ['Cantekin','Sessiz Gece'],
  ['Metin Alkanlı','Karadut'],
  ['Haramiler','Arpa Buğday Daneler'],
  ['Mavi Çocuklar','Develi Daylar'],
  ['TPAO Batman Orkestrası','Meşelidir Enginde Dağlar'],
  ['Kanat Gür','İçimdesin']
];

const TR5060_ALIASES = {
  'ilham gencer':['ilham gencer','bozkurt ilham gencer'],
  'cahit oben dortlusu':['cahit oben dortlusu','cahit oben dörtlüsü','cahit oben'],
  'cem karaca':['cem karaca','cem karaca apaslar','cem karaca ve apaşlar','cem karaca & apaşlar'],
  'baris manco':['baris manco','barış manço','baris manco kaygisizlar','barış manço kaygısızlar'],
  'siluetler':['siluetler','silüetler'],
  'tpao batman orkestrası':['tpao batman orkestrası','t.p.a.o. batman orkestrası','tpao batman']
};

function tr5060Norm(s=''){
  return String(s).toLocaleLowerCase('tr-TR').normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i')
    .replace(/[^a-z0-9]+/g,' ').trim();
}
function tr5060Report(t,cls=''){
  const el=$('tr5060-report');
  if(el){el.className='status '+cls;el.textContent=t;}
  status(t,cls);
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
  const qs=[`track:${title} artist:${artist}`,`${artist} ${title}`];
  let best=null,bestScore=-1;
  for(const q of qs){
    const j=await api('/search?type=track&limit=7&q='+encodeURIComponent(q));
    for(const t of (j.tracks?.items||[])){
      if(!t?.uri || !tr5060ArtistOK(artist,t)) continue;
      const score=tr5060TitleScore(title,t.name);
      if(score>bestScore){best=t;bestScore=score;}
    }
    if(bestScore>=88) break;
    await sleep(120);
  }
  return bestScore>=65 ? best : null;
}
async function tr5060EnsurePlaylist(){
  await playlists();
  const sel=$('playlist');
  const wanted=tr5060Norm(TR5060_PLAYLIST);
  const opt=[...sel.options].find(o=>tr5060Norm((o.textContent||'').replace(/\s*\(\d+\)\s*$/,''))===wanted);
  if(opt){sel.value=opt.value;return opt.value;}
  tr5060Report(`“${TR5060_PLAYLIST}” playlisti oluşturuluyor...`);
  const j=await api('/me/playlists',{method:'POST',body:JSON.stringify({
    name:TR5060_PLAYLIST,
    public:false,
    description:"1950-1969: Batı müziği temelli Türkçe pop, beat, rock, twist, caz/chanson ve Anadolu pop/rock seçkisi. Sanat müziği, fantezi ve arabesk yok."
  })});
  await playlists(); $('playlist').value=j.id; return j.id;
}
async function buildTR5060(){
  const btn=$('tr5060'); btn.disabled=true;
  const uris=[], used=new Set(), missing=[];
  try{
    const id=await tr5060EnsurePlaylist();
    for(let i=0;i<TR5060_CANDIDATES.length && uris.length<TR5060_TARGET;i++){
      const [artist,title]=TR5060_CANDIDATES[i];
      tr5060Report(`Aranıyor: ${uris.length}/${TR5060_TARGET}\n${artist} — ${title}`);
      const t=await tr5060FindTrack(artist,title);
      if(!t){missing.push(`${artist} — ${title}`);continue;}
      const primary=t.artists?.[0]?.id || tr5060Norm(t.artists?.[0]?.name||artist);
      if(used.has(primary)) continue;
      used.add(primary); uris.push(t.uri);
      await sleep(120);
    }
    if(uris.length<TR5060_MINIMUM)
      throw new Error(`Listeye dokunmadım. ${uris.length} güvenli eşleşme bulundu; minimum ${TR5060_MINIMUM}.`);
    tr5060Report(`${uris.length} kayıt bulundu. Tek playlist olarak yazılıyor...`);
    await replaceWith(id,uris);
    tr5060Report(`Bitti. ${uris.length} şarkı, ${uris.length} farklı sanatçı. Sanat müziği/fantezi/arabesk yok; Batı müziği temelli 50'ler-60'lar seçkisi hazır.`,'ok');
    await playlists(); $('playlist').value=id;
  } catch(e){
    tr5060Report(e.message,'warn');
    throw e;
  } finally {btn.disabled=false;}
}
window.addEventListener('load',()=>{const btn=$('tr5060');if(btn) btn.onclick=safe(buildTR5060);});
