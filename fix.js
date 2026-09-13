/* Safety/quality patch for anthology matching and chronology. */

const COMPOSER_ORDER = [
  'Abdülkadir Merâgî','Gazi Giray Han','Hafız Post','Buhurizade Mustafa Itrî',
  'Kantemiroğlu','Tanburi Mustafa Çavuş','Zaharya','Ebubekir Ağa','Dilhayat Kalfa','Tab’î Mustafa Efendi',
  'Tanburi İsak','III. Selim','Küçük Mehmed Ağa','Abdülbaki Nasır Dede','İsmail Dede Efendi',
  'Dellalzade İsmail Efendi','Kazasker Mustafa İzzet Efendi','Tanburi Büyük Osman Bey','Zekai Dede',
  'Hacı Arif Bey','Nikogos Ağa','Tanburi Ali Efendi','Kemani Tatyos Efendi','Şevki Bey','İsmail Hakkı Bey',
  'Lem’i Atlı','Udi Nevres Bey','Tanburi Cemil Bey','Kaptanzade Ali Rıza Bey','Refik Fersan',
  'Sadettin Kaynak','Şerif İçli','Yesari Asım Arsoy','Münir Nurettin Selçuk','Selahattin Pınar','Osman Nihat Akın'
];

const COMPOSER_ALIASES = {
  'Abdülkadir Merâgî':['abdulkadir meragi','meragi'],'Gazi Giray Han':['gazi giray'],'Hafız Post':['hafiz post'],
  'Buhurizade Mustafa Itrî':['itri'],'Kantemiroğlu':['kantemiroglu','kantemir','cantemir'],'Tanburi Mustafa Çavuş':['mustafa cavus','tanburi mustafa'],
  'Zaharya':['zaharya'],'Ebubekir Ağa':['ebubekir','bekir aga','eyyubi bekir'],'Dilhayat Kalfa':['dilhayat'],'Tab’î Mustafa Efendi':['tabi mustafa','tabi'],
  'Tanburi İsak':['tanburi isak','isak'],'III. Selim':['iii selim','selim han','sultan selim','selim'],'Küçük Mehmed Ağa':['kucuk mehmed','kucuk mehmet'],
  'Abdülbaki Nasır Dede':['abdulbaki nasir','nasir dede'],'İsmail Dede Efendi':['ismail dede','dede efendi'],'Dellalzade İsmail Efendi':['dellalzade'],
  'Kazasker Mustafa İzzet Efendi':['kazasker mustafa izzet','mustafa izzet'],'Tanburi Büyük Osman Bey':['buyuk osman','tanburi buyuk osman'],'Zekai Dede':['zekai'],
  'Hacı Arif Bey':['haci arif','arif bey'],'Nikogos Ağa':['nikogos'],'Tanburi Ali Efendi':['tanburi ali'],'Kemani Tatyos Efendi':['tatyos'],'Şevki Bey':['sevki'],
  'İsmail Hakkı Bey':['ismail hakki'],'Lem’i Atlı':['lemi atli','lemi'],'Udi Nevres Bey':['udi nevres','nevres'],'Tanburi Cemil Bey':['tanburi cemil','cemil bey'],
  'Kaptanzade Ali Rıza Bey':['kaptanzade','ali riza'],'Refik Fersan':['refik fersan'],'Sadettin Kaynak':['sadettin kaynak'],'Şerif İçli':['serif icli'],
  'Yesari Asım Arsoy':['yesari asim','yesari'],'Münir Nurettin Selçuk':['munir nurettin','munir'],'Selahattin Pınar':['selahattin pinar'],'Osman Nihat Akın':['osman nihat']
};

function _norm(s=''){
  return String(s).toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i').replace(/[^a-z0-9]+/g,' ').trim();
}
function _tokens(s=''){return _norm(s).split(/\s+/).filter(Boolean)}
function _composer(item){return item[0].split(' — ')[0].trim()}
function _title(item){return (item[0].split(' — ')[1]||'').trim()}

ANTHOLOGY.sort((a,b)=>{
  const ai=COMPOSER_ORDER.indexOf(_composer(a)),bi=COMPOSER_ORDER.indexOf(_composer(b));
  return (ai<0?999:ai)-(bi<0?999:bi);
});

const FORM_WORDS=new Set(['pesrev','saz','semaisi','semai','beste','sarki','takim','taksim','agir','yuruk','kar']);
const STOP_WORDS=new Set(['eser','turk','musikisi','makaminda','makami','ve','bir']);
function _composerMatch(composer,hay){return (COMPOSER_ALIASES[composer]||[composer]).some(a=>hay.includes(_norm(a)))}
function _candidateScore(item,t){
  const composer=_composer(item),title=_title(item),tn=_norm(t?.name||''),artists=_norm((t?.artists||[]).map(a=>a.name).join(' ')),hay=(tn+' '+artists).trim();
  const composerOK=_composerMatch(composer,hay),titleNorm=_norm(title),titleCompact=titleNorm.replace(/\s/g,''),trackCompact=tn.replace(/\s/g,''),shortTitleOK=titleCompact.length>=3&&trackCompact.includes(titleCompact);
  const toks=_tokens(title).filter(w=>w.length>=3&&!STOP_WORDS.has(w)),strong=toks.filter(w=>!FORM_WORDS.has(w));
  const allHit=toks.filter(w=>tn.includes(w)).length,strongHit=strong.filter(w=>tn.includes(w)).length,allRatio=toks.length?allHit/toks.length:0,strongRatio=strong.length?strongHit/strong.length:0;
  let eligible=false;
  if(titleNorm==='eser') eligible=composerOK;
  else if(strong.length>=2) eligible=strongRatio>=0.6||(composerOK&&strongRatio>=0.4&&allRatio>=0.5);
  else if(strong.length===1) eligible=strongHit===1&&(composerOK||allRatio>=0.8);
  else if(toks.length>0) eligible=composerOK&&allRatio>=0.5;
  else eligible=composerOK&&shortTitleOK;
  if(!eligible) return -1;
  let score=strongRatio*120+allRatio*60+(composerOK?85:0)+(shortTitleOK?30:0); if(tn===titleNorm) score+=40; return score;
}

findTrack = async function(item,seen){
  let best=null,bestScore=-1;
  for(const q of item[1]){
    const j=await api('/search?type=track&limit=10&q='+encodeURIComponent(q));
    for(const t of (j.tracks?.items||[])){
      if(!t?.uri||seen.has(t.uri)) continue;
      const score=_candidateScore(item,t); if(score>bestScore){bestScore=score;best=t}
    }
    await sleep(140);
  }
  return bestScore>=0?best.uri:null;
};

playlists = async function(){
  const before=$('status').textContent;
  if(!before.startsWith('Bitti.')) status('Listeler yükleniyor...');
  let url='/me/playlists?limit=50'; const all=[];
  while(url){const j=await api(url.replace('https://api.spotify.com/v1',''));all.push(...j.items);url=j.next}
  const s=$('playlist'),previous=s.value;
  s.innerHTML='<option value="">Liste seç</option>'+all.map(p=>`<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');
  if(previous&&all.some(p=>p.id===previous)) s.value=previous;
  if(!before.startsWith('Bitti.')) status(all.length+' playlist bulundu.','ok');
};
