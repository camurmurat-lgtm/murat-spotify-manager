/* Robust one-shot finish for mobile/desktop. */

if (typeof COMPOSER_ALIASES !== 'undefined') {
  COMPOSER_ALIASES['Ebubekir Ağa']=['ebubekir','bekir aga','eyyubi bekir'];
}

findTrack = async function(item,seen){
  let best=null,bestScore=-1;
  const queries=item[1]||[];
  for(let i=0;i<queries.length;i++){
    const j=await api('/search?type=track&limit=8&q='+encodeURIComponent(queries[i]));
    for(const t of (j.tracks?.items||[])){
      if(!t?.uri||seen.has(t.uri)) continue;
      const score=_candidateScore(item,t);
      if(score>bestScore){bestScore=score;best=t}
    }
    if(bestScore>=170) return best.uri;
    await sleep(320);
  }
  return bestScore>=0?best.uri:null;
};

let autoFinishStarted=false;
async function autoFinishAnthology(){
  if(autoFinishStarted) return;
  if(!store.get()) return;
  const sel=$('playlist');
  if(!sel || sel.options.length<=1) return;

  const target=[...sel.options].find(o=>_norm(o.textContent).startsWith('klasik turk muzigi antolojisi'));
  if(!target) return;

  autoFinishStarted=true;
  sel.value=target.value;
  status('Antoloji otomatik düzeltiliyor. Bu sayfayı açık bırak.');
  try{
    await buildAnthology();
    status('Bitti. Antoloji düzeltilmiş eşleştirmelerle yeniden kuruldu.','ok');
  }catch(e){
    autoFinishStarted=false;
    status('Otomatik düzeltme tamamlanamadı: '+e.message,'warn');
  }
}

window.addEventListener('load',()=>{
  setTimeout(autoFinishAnthology,1200);
  const timer=setInterval(()=>{
    if(autoFinishStarted){clearInterval(timer);return;}
    autoFinishAnthology();
  },2000);
  setTimeout(()=>clearInterval(timer),30000);
});
