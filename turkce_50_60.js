/* Türkçe 1950-1959 — Batı müziği temelli
   Strict decade scope: 1950 through 1959 only.
   No sanat müziği, fantezi or arabesk.
   One explicit exception requested by user: Cahit Oben — Halimem (1965). */

const TR5060_PLAYLIST = "Türkçe 50'ler";
const TR5060_MINIMUM = 6;

const TR5060_CANDIDATES = [
  /* 1950s core */
  ['Celal İnce','Kalbimi Bu Şarkıya Döktüm'],
  ['Celal İnce','Çiftliğim'],
  ['Celal İnce','Bekleyeceğim'],
  ['Celal İnce','Hasret'],
  ['Celal İnce','Adım Adım'],
  ['Celal İnce','Sana Nerden Gönül Verdim'],
  ['Celal İnce','Ayrılık'],
  ['Celal İnce','Gönülden Şikayet'],
  ['Celal İnce','Başbaşa Kalınca'],
  ['Celal İnce','Yıllar Var Ki'],
  ['Zehra Eren','Aşk Denizi'],

  /* User-requested exception, historically 1965 */
  ['Cahit Oben','Halimem']
];

const TR5060_ALIASES={
  'cahit oben':['cahit oben','cahit oben 4','cahit oben 4 lusu'],
  'celal ince':['celal ince'],
  'zehra eren':['zehra eren']
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
  const e=tr5060Norm(expected), aliases=TR5060_ALIASES[e]||[e];
  const actual=(track?.artists||[]).map(a=>tr5060Norm(a.name));
  return actual.some(a=>aliases.some(x=>a===x||a.includes(x)||x.includes(a)));
}
function tr5060TitleScore(expected,actual){
  const e=tr5060Norm(expected),a=tr5060Norm(actual);
  if(a===e)return 100;
  if(a.includes(e)||e.includes(a))return 90;
  const toks=e.split(/\s+/).filter(x=>x.length>2);
  if(!toks.length)return 0;
  return Math.round(75*toks.filter(x=>a.includes(x)).length/toks.length);
}
async function tr5060FindTrack(artist,title){
  const titleVariants = artist==='Cahit Oben' && title==='Halimem'
    ? ['Halimem','Halime','Hoppalıvık Halimem']
    : [title];
  let best=null,bestScore=-1;
  for(const tv of titleVariants){
    const qs=[`track:${tv} artist:${artist}`,`${artist} ${tv}`];
    for(const q of qs){
      const j=await api('/search?type=track&limit=10&q='+encodeURIComponent(q));
      for(const t of (j.tracks?.items||[])){
        if(!t?.uri||!tr5060ArtistOK(artist,t))continue;
        const score=tr5060TitleScore(tv,t.name);
        if(score>bestScore){best=t;bestScore=score;}
      }
      if(bestScore>=90)break;
      await sleep(120);
    }
    if(bestScore>=90)break;
  }
  return bestScore>=65?best:null;
}
async function tr5060EnsurePlaylist(){
  await playlists();
  const sel=$('playlist'),wanted=tr5060Norm(TR5060_PLAYLIST);
  const opt=[...sel.options].find(o=>tr5060Norm((o.textContent||'').replace(/\s*\(\d+\)\s*$/,''))===wanted);
  if(opt){sel.value=opt.value;return opt.value;}
  tr5060Report(`“${TR5060_PLAYLIST}” oluşturuluyor...`);
  const j=await api('/me/playlists',{method:'POST',body:JSON.stringify({
    name:TR5060_PLAYLIST,
    public:false,
    description:"1950-1959 Batı müziği temelli Türkçe seçki. Sanat müziği, fantezi, arabesk yok. Cahit Oben - Halimem (1965) kullanıcı isteğiyle tek istisna."
  })});
  await playlists();$('playlist').value=j.id;return j.id;
}
async function buildTR5060(){
  const btn=$('tr5060');btn.disabled=true;
  const uris=[],seen=new Set(),missing=[];
  try{
    const id=await tr5060EnsurePlaylist();
    for(let i=0;i<TR5060_CANDIDATES.length;i++){
      const [artist,title]=TR5060_CANDIDATES[i];
      tr5060Report(`1950-1959 seçkisi aranıyor: ${i+1}/${TR5060_CANDIDATES.length}\n${artist} — ${title}`);
      const t=await tr5060FindTrack(artist,title);
      if(t&&!seen.has(t.uri)){seen.add(t.uri);uris.push(t.uri);}
      else if(!t)missing.push(`${artist} — ${title}`);
      await sleep(120);
    }
    if(uris.length<TR5060_MINIMUM)throw new Error(`Listeye dokunmadım. Yalnız ${uris.length} güvenli dönem kaydı bulundu; minimum ${TR5060_MINIMUM}.`);
    tr5060Report(`${uris.length} güvenli kayıt bulundu. Tek playlist olarak yazılıyor...`);
    await replaceWith(id,uris);
    const cahitMiss=missing.some(x=>x.startsWith('Cahit Oben'));
    tr5060Report(`Bitti. ${uris.length} kayıt yazıldı. Barış Manço, Erkin Koray ve diğer 60'lar isimleri çıkarıldı. 1950-1959 omurgası korundu.${cahitMiss?' Cahit Oben — Halimem Spotify kataloğunda güvenli eşleşmedi; listeye eklenmedi.':''}`,'ok');
    await playlists();$('playlist').value=id;
  }catch(e){tr5060Report(e.message,'warn');throw e;}
  finally{btn.disabled=false;}
}
window.addEventListener('load',()=>{const btn=$('tr5060');if(btn)btn.onclick=safe(buildTR5060);});
