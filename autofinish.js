/* One-shot finish: auto-select the anthology and rebuild it with stricter matching. */

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

async function autoFinishAnthology(){
  if(!store.get()) return;
  if(localStorage.getItem('anthology_autofinish_v4')==='done') return;

  const sel=$('playlist');
  for(let i=0;i<30 && sel.options.length<=1;i++) await sleep(300);

  const target=[...sel.options].find(o=>_norm(o.textContent).startsWith('klasik turk muzigi antolojisi'));
  if(!target){
    status('Klasik Türk Müziği Antolojisi bulunamadı. Listeyi bir kez seçip sayfayı yenile.','warn');
    return;
  }

  sel.value=target.value;
  status('Antoloji son kez otomatik düzeltiliyor. Bu sayfayı açık bırak.');
  try{
    await buildAnthology();
    localStorage.setItem('anthology_autofinish_v4','done');
  }catch(e){
    status('Otomatik düzeltme tamamlanamadı: '+e.message,'warn');
  }
}

window.addEventListener('load',()=>setTimeout(autoFinishAnthology,1200));
