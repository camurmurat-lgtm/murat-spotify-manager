/* Spotify API response safety patch.
   Some successful Spotify write endpoints return an empty body with 200/204.
   The original api() always attempted response.json(), which can throw
   "Unexpected end of JSON input" after the write has already succeeded.
*/
api = async function(path,opt={},attempt=0){
  let tk=await token();
  if(!tk) throw new Error('Önce Spotify’a bağlan.');
  const run=()=>fetch('https://api.spotify.com/v1'+path,{
    ...opt,
    headers:{Authorization:'Bearer '+tk,'Content-Type':'application/json',...(opt.headers||{})}
  });
  let r=await run();
  if(r.status===401){tk=await refresh();r=await run()}
  if(r.status===429&&attempt<5){
    const sec=Math.max(1,Number(r.headers.get('Retry-After'))||2);
    status(`Spotify kısa bir mola istedi. ${sec} sn bekleniyor...`,'warn');
    await sleep(sec*1000);
    return api(path,opt,attempt+1);
  }
  if(!r.ok){
    const tx=await r.text();
    throw new Error('Spotify API '+r.status+': '+tx);
  }
  if(r.status===204) return null;
  const tx=await r.text();
  if(!tx.trim()) return null;
  try{return JSON.parse(tx)}catch{return tx}
};
