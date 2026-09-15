/* Secular Itri only. Independent of the anthology / Yeraltı rule sets.
 * Sources and operational constraints: ITRI.md. No first-result fallback. */
(function(root){
  'use strict';
  const norm=s=>String(s||'').toLocaleLowerCase('tr-TR').normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i').replace(/[^a-z0-9]+/g,' ').trim();
  const compact=s=>norm(s).replace(/ /g,'');
  const NAME='Buhurizade Mustafa Itrî Seküler Eserler';
  const MINIMUM=4, CACHE='itri-secular-v1', COOLDOWN='itri-cooldown-v1';
  const works=[
    ['neva','Nevâ Kâr',['Neva Kar','Gülbün-i İyş Midemed']],
    ['tuti','Tûtî-i Mûcize-gûyem Ne Desem Lâf Değil',['Tuti-i Mucize Guyem Ne Desem Laf Degil','Tuti Mucize Guyem Ne Desem Laf Degil','Tut-i Mucize Guyem Ne Desem Laf Degil']],
    ['cam','Câm Lâ’lindir Senin',['Cam Lalindir Senin']],
    ['peri','Her Gördüğü Perîye Gönül Mübtelâ Olur',['Her Gordugu Periye Gonul Mubtela Olur']],
    ['gamzen','Gamzen Ki Ola Sâkî-i Çeşm-i Siyeh-i Mest',['Gamzen Ki Ola Saki']],
    ['dil','Dil-i Pür-ıztırâbım Mevce-i Seyl-âbdır Sensiz',['Dil-i Pur Iztirabim','Dili Pur Iztirabim']],
    ['nuhuft-p','Nühüft Peşrev',['Nuhuft Pesrev','Nuhuft Pesrevi']],
    ['nuhuft-s','Nühüft Saz Semaisi',['Nuhuft Saz Semaisi']]
  ].map(([id,title,aliases])=>({id,title,aliases}));
  const blocked=/\b(tekbir|salat|salati|salavat|sala|salasi|ilahi|ilahisi|ayin|ayini|naat|nat|tevsih|durak|ezan|kuran|quran|mevlid|mevlit|mevlevi|zikir|zikr|dua|tasavvuf|sufi|remix|medley|potpuri|taksim)\b/;
  function eligible(w,t){
    if(!t || t.type!=='track' || !/^spotify:track:[A-Za-z0-9]{22}$/.test(t.uri||'') ||
      t.is_local || t.is_playable===false || t.restrictions || !t.artists?.length) return false;
    const title=norm(t.name), metadata=norm([t.name,t.album?.name,...t.artists.map(a=>a.name)].join(' '));
    if(blocked.test(metadata) || /\bna t\b/.test(metadata)) return false;
    // Spotify has no reliable composer field. Require explicit Itri attribution
    // in title/artist/album AND a curated work title, never only a makam/form.
    if(!/\bitri\b/.test(metadata)) return false;
    return w.aliases.some(a=>compact(title).includes(compact(a)));
  }
  function choose(w,items){
    return items.filter(t=>eligible(w,t)).sort((a,b)=>
      Number(compact(b.name)===compact(w.title))-Number(compact(a.name)===compact(w.title)) ||
      String(a.uri).localeCompare(String(b.uri)))[0]||null;
  }
  function retryAt(value,now){
    if(value!==null && String(value).trim()!=='' && Number.isFinite(Number(value)))
      return now+Math.max(1,Number(value))*1000;
    const date=Date.parse(value);
    return Number.isFinite(date)&&date>now?date:now+60000;
  }
  function transport({fetch:send,token,refresh,storage,wait,now=Date.now,report=()=>{}}){
    let last=0;
    return async function request(path,opt={}){
      const write=opt.method==='PUT';
      for(let attempt=0;attempt<4;attempt++){
        const until=Number(storage.getItem(COOLDOWN))||0;
        if(until>now()) throw new Error('Spotify kotası kapalı. '+new Date(until).toLocaleString('tr-TR')+' sonrasında aynı düğmeyle devam et.');
        await wait(Math.max(0,last+2600-now()));
        let tk=await token();
        if(!tk) throw new Error('Önce Spotify’a bağlan.');
        const run=()=>{last=now();return send('https://api.spotify.com/v1'+path,{...opt,headers:{Authorization:'Bearer '+tk,'Content-Type':'application/json'}})};
        let r;
        try {r=await run();if(r.status===401){tk=await refresh();r=await run();}}
        catch(e){
          if(write) throw new Error('Yazma yanıtı alınamadı; sonuç belirsiz. Listeyi kontrol et ve aynı düğmeyle yeniden doğrula.');
          if(attempt===3) throw e;
          await wait(2000*2**attempt);continue;
        }
        if(r.status===429){
          const resume=retryAt(r.headers.get('Retry-After'),now());
          storage.setItem(COOLDOWN,String(resume));
          if(resume-now()>60000 || attempt===3) throw new Error('Spotify kotası doldu. İlerleme saklandı. '+new Date(resume).toLocaleString('tr-TR')+' sonrasında tekrar dene.');
          report('Spotify kota molası: '+Math.ceil((resume-now())/1000)+' saniye.');
          await wait(Math.max(0,resume-now()));continue;
        }
        if(!r.ok){
          if(!write && r.status>=500 && attempt<3){await wait(2000*2**attempt);continue;}
          throw new Error('Spotify '+r.status+(write?' — yazma sonucu doğrulanamadı; listeyi kontrol et.':''));
        }
        return r.status===204?null:r.json();
      }
      throw new Error('Deneme sınırına ulaşıldı. Aynı düğmeyle devam et.');
    };
  }
  async function build({id,request,storage,report,now=Date.now}){
    if(!/^[A-Za-z0-9]{22}$/.test(id||'')) throw new Error('Önce Itrî Seküler Eserler listesini seç.');
    const me=await request('/me');
    async function target(){
      const p=await request('/playlists/'+id);
      if(norm(p.name)!==norm(NAME)||p.owner?.id!==me.id) throw new Error('Seçili liste sana ait “'+NAME+'” olmalı.');
      return p;
    }
    const before=await target();
    const key=CACHE+':'+me.id+':'+(me.country||'');
    let cache={};try{cache=JSON.parse(storage.getItem(key)||'{}')||{};}catch{}
    const selected=[],missing=[],seen=new Set();
    for(const w of works){
      report('Itrî seçkisi hazırlanıyor: '+w.title);
      let t=null,c=cache[w.id];
      if(c && now()-c.at<86400000 && eligible(w,c.track)){
        // Revalidate cached metadata / availability in the current market.
        const fresh=await request('/tracks/'+c.track.uri.split(':')[2]);
        if(eligible(w,fresh)) t=fresh;
      }
      if(!t){
        for(const q of [w.aliases[0]+' Itri',w.aliases[0]]){
          const j=await request('/search?type=track&limit=10&q='+encodeURIComponent(q));
          t=choose(w,j.tracks?.items||[]);if(t)break;
        }
      }
      if(!t||seen.has(t.uri)){missing.push(w.title);continue;}
      cache[w.id]={at:now(),track:t};storage.setItem(key,JSON.stringify(cache));
      selected.push({work:w.title,uri:t.uri,name:t.name,artists:t.artists.map(a=>a.name)});seen.add(t.uri);
    }
    const result={playlist:id,selected,missing,state:'prepared'};
    const resultKey='itri-result-v1:'+id;
    storage.setItem(resultKey,JSON.stringify(result));
    report(selected.length+' farklı eser eşleşti. Eşleşmeyenler: '+(missing.join('; ')||'yok'));
    if(selected.length<MINIMUM) throw new Error('Listeye dokunulmadı: '+selected.length+' farklı eser bulundu; en az '+MINIMUM+' gerekli. Eşleşmeyenler: '+missing.join('; '));
    const current=await target();
    if(!before.snapshot_id||current.snapshot_id!==before.snapshot_id) throw new Error('Hazırlık sırasında liste değişti. Listeye dokunulmadı; tekrar başlat.');
    const old=await request('/playlists/'+id+'/items?limit=100');
    // Refuse an incomplete backup instead of silently dropping a larger list.
    if(old.next) throw new Error('Liste 100 parçayı aşıyor. Otomatik değiştirme durduruldu.');
    const oldUris=old.items.map(x=>(x.item||x.track)?.uri);
    if(oldUris.some(u=>!u)) throw new Error('Mevcut liste tam okunamadı. Listeye dokunulmadı.');
    const finalTarget=await target();
    if(finalTarget.snapshot_id!==current.snapshot_id) throw new Error('Liste değişti. Tekrar başlat.');
    const uris=selected.map(x=>x.uri);
    if(JSON.stringify(oldUris)!==JSON.stringify(uris)){
      storage.setItem('itri-backup-v1:'+id,JSON.stringify({at:now(),snapshot:current.snapshot_id,uris:oldUris}));
      result.state='write-pending';storage.setItem(resultKey,JSON.stringify(result));
      // Exactly one replacement, never clear-then-append or an ambiguous retry.
      await request('/playlists/'+id+'/items',{method:'PUT',body:JSON.stringify({uris})});
    }
    result.state='verification-pending';storage.setItem(resultKey,JSON.stringify(result));
    const after=await request('/playlists/'+id+'/items?limit=100');
    const actual=after.items.map(x=>{const t=x.item||x.track;return t?.linked_from?.uri||t?.uri;});
    if(after.next||JSON.stringify(actual)!==JSON.stringify(uris)) throw new Error('Yazma sonrası içerik doğrulanamadı. Otomatik tekrar yazılmadı; listeyi kontrol et.');
    result.state='verified';storage.setItem(resultKey,JSON.stringify(result));
    report('Bitti. '+uris.length+' farklı din dışı Itrî eseri doğrulandı.\n'+selected.map(x=>x.work+' — '+x.artists.join(', ')).join('\n')+'\nEşleşmeyenler: '+(missing.join('; ')||'yok'));
    return result;
  }
  const exports={norm,works,eligible,choose,retryAt,transport,build,NAME};
  if(typeof module!=='undefined') module.exports=exports;
  if(typeof document!=='undefined'){
    root.addEventListener('load',()=>{
      let busy=false;
      document.getElementById('itri').onclick=safe(async()=>{
        if(busy)return;
        if(location.protocol!=='https:'||!location.hostname.endsWith('.vercel.app')) throw new Error('Bu işlem Vercel üzerindeki Murat Spotify Manager’dan çalıştırılmalı.');
        if(!navigator.locks) throw new Error('Güvenli çalışma için güncel Chrome veya Edge kullan.');
        await navigator.locks.request('itri-manager-build',{ifAvailable:true},async lock=>{
          if(!lock) throw new Error('Itrî işlemi başka bir sekmede sürüyor.');
          busy=true;
          const controls=[...document.querySelectorAll('button,select')].map(e=>[e,e.disabled]);
          controls.forEach(([e])=>e.disabled=true);
          const report=t=>{document.getElementById('itri-report').textContent=t;status(t);};
          try{
            const request=transport({fetch:window.fetch.bind(window),token,refresh,storage:localStorage,wait:sleep,report});
            await build({id:document.getElementById('playlist').value,request,storage:localStorage,report});
          }catch(e){report(e.message);throw e;}
          finally{controls.forEach(([e,disabled])=>e.disabled=disabled);busy=false;}
        });
      });
    });
  }
})(typeof window==='undefined'?globalThis:window);
