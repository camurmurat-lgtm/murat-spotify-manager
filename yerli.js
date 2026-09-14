/* Between ÇAMUR & Elsewhere: Yeraltı Hattı
   Yerli alternatif/underground seçki.
   Kurallar: hedef 60, minimum 50, her ana sanatçıdan 1 parça, pop ağırlığı yok.
   ÇAMUR sabit seçim: İçerimdesin. Duman ve Adamlar listede olabilir. */

const YERLI_TARGET = 60;
const YERLI_MINIMUM = 50;

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
  ['Kesmeşeker','Tut Beni Düşmeden'],
  ['Pilli Bebek','Fotoğraf'],
  ['Mavi Sakal','İki Yol'],
  ['Malt','Deprem'],
  ['Redd','Nefes Bile Almadan'],
  ['Vega','Serzenişte'],
  ['Hayko Cepkin','Sandık'],
  ['Pentagram','Bir'],
  ['Rashit','Dinozor'],
  ['Bubituzak','Kimsin Sen'],
  ['No Land','Aramızda'],
  ['İnsanlar','Kime Ne'],
  ['Elektro Hafız','Destur'],
  ['Kim Ki O','Dans'],
  ['Büyük Ev Ablukada','Hayaletler'],
  ['Son Feci Bisiklet','Bikinisinde Astronomi'],
  ['Kargo','Yıldızların Altında'],
  ['Bulutsuzluk Özlemi','Sözlerimi Geri Alamam'],
  ['Hardal','Nasıl? Ne Zaman?'],
  ['Bunalım','Taş Var Köpek Yok'],
  ['Kramp','Lan N’oldu'],
  ['Whisky','Yak Bizi'],
  ['Dr. Skull','Rules'],
  ['Murder King','Susma'],
  ['Black Tooth','Drink and Pass Out'],
  ['Pitch Black Process','Heroes of 2023'],
  ['Kaptan Kadavra','Nefes'],
  ['Rain To Rust','Stillborn Flowers'],
  ['Affet Robot','Rüya'],
  ['Apartmanlar','Son'],
  ['Neyse','Hokkabaz'],
  ['Sapan','Bir An İçin'],
  ['Gren','Senin Yüzünden'],
  ['Direc-t','Ama Sen Varsın'],
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
  ['Sonic Boom','Yalnızlık'],
  ['Kozmonotosman','Marmara'],
  ['Second','Rüya'],
  ['Soft Analog','Buzlar Çözülmeden'],
  ['Sufle','Pus'],
  ['Madrigal','Dip'],
  ['Journers','Düş'],
  ['Kozmik Birliktelik','Gece'],
  ['Lara Di Lara','Hazineler İçindesin'],
  ['Melike Şahin','Diva Yorgun'],
  ['Mabel Matiz','Toy'],
  ['BaBa ZuLa','Bir Sana Bir De Bana']
];

const YERLI_ALIASES = {
  'camur':['camur','çamur'],
  'baba zula':['baba zula','baba zula'],
  'hey douglas':['hey douglas'],
  'the ringo jets':['the ringo jets','ringo jets'],
  'ah kosmos':['ah kosmos'],
  'buyuk ev ablukada':['buyuk ev ablukada','büyük ev ablukada'],
  'son feci bisiklet':['son feci bisiklet'],
  'korhan futaci ve kara orkestra':['korhan futaci ve kara orkestra','korhan futacı ve kara orkestra'],
  'rain to rust':['rain to rust']
};

function yerliNorm(s=''){
  return String(s).toLocaleLowerCase('tr-TR').normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i')
    .replace(/[^a-z0-9]+/g,' ').trim();
}

function yerliArtistOK(expected, track){
  const en=yerliNorm(expected);
  const aliases=YERLI_ALIASES[en] || [en];
  const actual=(track?.artists||[]).map(a=>yerliNorm(a.name));
  return actual.some(a=>aliases.some(x=>a===yerliNorm(x) || a.includes(yerliNorm(x)) || yerliNorm(x).includes(a)));
}

function yerliTitleScore(expected, actual){
  const e=yerliNorm(expected), a=yerliNorm(actual);
  if(a===e) return 100;
  if(a.includes(e) || e.includes(a)) return 85;
  const toks=e.split(/\s+/).filter(x=>x.length>2);
  if(!toks.length) return 0;
  return Math.round(70*toks.filter(x=>a.includes(x)).length/toks.length);
}

async function yerliFindTrack(artist,title){
  const queries=[`track:${title} artist:${artist}`,`${artist} ${title}`];
  let best=null,bestScore=-1;
  for(const q of queries){
    const j=await api('/search?type=track&limit=10&q='+encodeURIComponent(q));
    for(const t of (j.tracks?.items||[])){
      if(!t?.uri || !yerliArtistOK(artist,t)) continue;
      const score=yerliTitleScore(title,t.name);
      if(score>bestScore){best=t;bestScore=score;}
    }
    if(bestScore>=85) break;
    await sleep(160);
  }
  return bestScore>=60 ? best : null;
}

function selectYerliPlaylist(){
  const sel=$('playlist');
  const wanted=[...sel.options].find(o=>{
    const n=yerliNorm(o.textContent);
    return n.includes('yeralti hatti') || n.includes('yeraltı hattı');
  });
  if(wanted){sel.value=wanted.value;return wanted.value;}
  if(sel.value){
    const txt=yerliNorm(sel.options[sel.selectedIndex]?.textContent||'');
    if(txt.includes('yeralti') || txt.includes('yeraltı')) return sel.value;
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
  const missing=[];
  try{
    for(let i=0;i<YERLI_CANDIDATES.length && uris.length<YERLI_TARGET;i++){
      const [artist,title]=YERLI_CANDIDATES[i];
      status(`Yeraltı Hattı hazırlanıyor: ${uris.length}/${YERLI_TARGET}\n${artist} — ${title}`);
      const t=await yerliFindTrack(artist,title);
      if(!t){missing.push(`${artist} — ${title}`);await sleep(180);continue;}
      const primaryId=t.artists?.[0]?.id || yerliNorm(t.artists?.[0]?.name||artist);
      if(usedPrimaryArtists.has(primaryId)) continue;
      uris.push(t.uri);
      usedPrimaryArtists.add(primaryId);
      await sleep(180);
    }
    if(uris.length<YERLI_MINIMUM){
      throw new Error(`Listeye dokunmadım. Yalnız ${uris.length} güvenli ve farklı sanatçı eşleşmesi bulundu; minimum ${YERLI_MINIMUM}.`);
    }
    status(`${uris.length} şarkı bulundu. Her biri farklı ana sanatçı. Yeraltı Hattı yeniden yazılıyor...`);
    await replaceWith(id,uris);
    status(`Bitti. ${uris.length} şarkı, ${uris.length} farklı sanatçı. ÇAMUR seçimi “İçerimdesin”. Aynı ana sanatçı tekrar etmiyor.${missing.length?` ${missing.length} aday güvenli eşleşmediği için atlandı.`:''}`,'ok');
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
