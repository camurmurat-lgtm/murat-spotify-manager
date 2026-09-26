/* Original releases, not composition dates or digital album dates. See TURKCE_1950_1959.md. */
(function(root){
  'use strict';
  const NAME='Türkçe 1950-1959';
  const CURATION_READY=true;
  const CURATION_STATUS='Seçki hazır. 11 kayıt, tamamı 1950–1959 içinde yayımlanmış Türkçe Batı temelli popüler müzik/tango kayıtları.';
  const DESCRIPTION='1950–1959 içinde yayımlanmış Türkçe tango ve Batı temelli popüler kayıtlar. 11 kayıt; TSM, THM, türkü kökenli uyarlama ve dönem dışı kayıt yok. Sonraki dijital sürümler yalnızca özgün dönem kaydının arşiv aktarımı olarak kullanılır. Kaynaklar: murat-spotify-manager.vercel.app';
  const VERSION='tr50-2026-09-26-r2', COOLDOWN='tr50-cooldown-v1';
  const norm=s=>String(s||'').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i').replace(/[^a-z0-9]+/g,' ').trim();
  const names=[NAME,"Türkçe 50'ler","Türkçe 50'ler & 60'lar"].map(norm);
  const sources={
    h1950:'https://www.gastearsivi.com/gazete/hurriyet/1950-12-18/6',
    h1951:'https://www.gastearsivi.com/gazete/hurriyet/1951-06-29/5',
    h1952:'https://www.gastearsivi.com/gazete/hurriyet/1952-10-08/6',
    t1952:'https://www.gastearsivi.com/gazete/hurriyet/1952-12-24/7',
    h1953:'https://www.gastearsivi.com/gazete/hurriyet/1953-08-17/5',
    m1955:'https://www.gastearsivi.com/gazete/milliyet2/1955-04-18/6',
    c1955:'https://egazete.cumhuriyet.com.tr/katalog/192/1955/6/29/8',
    oriente:'https://oriente.de/en/catalogue/oriente-cds/221-old-world-tangos-vol-4-instanbul-tango-1927-1953-en',
    roll:'https://birartibir.org/wp-content/uploads/ROLL_2005_095.pdf',
    king:'https://music.apple.com/us/song/1803847722',
    tanyerliArchive:'https://www.tango-dj.at/archive/albums/Tas_Plaklarda_Tango-113631.html',
    tasPlakAlbum:'https://open.spotify.com/album/3zfumlvWrYrOcb1fHlFh1q'
  };
  // Admission rule: the original commercial release must be 1950-1959.
  // A later digital/CD release is accepted only as an archival transfer of that period recording.
  const records=[
    {title:'Şüphe',artist:'Şecaattin Tanyerli',spotifyTitle:'Şüphe',id:'0HTraIBvzOT9d082WrIDlt',artistId:'57hYuUFQFObppHdNNcLe6E',artistIds:['57hYuUFQFObppHdNNcLe6E','5W4dLupNvN3wRIKj77UMPZ'],albumId:'062qBUhWcAQmzoK8GbK5Ss',duration:211466,genre:'tango',release:[1950,1950],catalog:'Columbia 17883',adDate:'1950-12-18',ad:sources.h1950,transfer:sources.tanyerliArchive},
    {title:'Yıldızlar Düşerken',artist:'Şecaattin Tanyerli',spotifyTitle:'Yıldızlar Düşerken',id:'5Nza9FYzqEuiwsezuACKNy',artistId:'57hYuUFQFObppHdNNcLe6E',artistIds:['57hYuUFQFObppHdNNcLe6E','5W4dLupNvN3wRIKj77UMPZ'],albumId:'062qBUhWcAQmzoK8GbK5Ss',duration:184506,genre:'tango',release:[1950,1950],catalog:'Columbia 17883',adDate:'1950-12-18',ad:sources.h1950,transfer:sources.tanyerliArchive},
    {title:'Ayrılık',artist:'Celal İnce',spotifyTitle:'Ayrilik',id:'4HXOGTakOAbZBvarJEhUc3',artistId:'6iYEpOX1rs6ZhJQ7vstI4M',albumId:'2K79layPoJfzdW5IIy0f5r',duration:196026,genre:'tango',release:[1951,1951],catalog:'Sahibinin Sesi AX 2526',adDate:'1951-06-29',ad:sources.h1951,transfer:sources.oriente},
    {title:'Sana Nerden Gönül Verdim',artist:'Celal İnce',spotifyTitle:'Sana Nerden Gönül Verdim',id:'4e7Wg4gnZbHioDrfn3meDm',artistId:'6iYEpOX1rs6ZhJQ7vstI4M',albumId:'2K79layPoJfzdW5IIy0f5r',duration:167840,genre:'tango',release:[1952,1952],catalog:'Sahibinin Sesi AX 2561',adDate:'1952-10-08',ad:sources.h1952,transfer:sources.oriente},
    {title:'Yıllar Var Ki',artist:'Şecaattin Tanyerli',spotifyTitle:'Yillar Var Ki',id:'2wXGtTveOO25VdH0pZIbH0',artistId:'5l51fj1CAnSYjCcOFKHbEg',albumId:'2K79layPoJfzdW5IIy0f5r',duration:163066,genre:'tango',release:[1951,1952],catalog:'Columbia RT 17939',adDate:'1952-12-24',ad:sources.t1952,transfer:sources.oriente},
    {title:'Bir Eylül Akşamı',artist:'Şecaattin Tanyerli',spotifyTitle:'Bir Eylül Akşamı',id:'33keGC87LNc17r6Yf8Qbjp',artistId:'3p2mnN65fp5kzGocOd2CFR',albumId:'3zfumlvWrYrOcb1fHlFh1q',duration:212508,genre:'tango',release:[1952,1952],catalog:'Columbia RT 17939',adDate:'1952-12-24',ad:sources.t1952,transfer:sources.king},
    {title:'Hasret (Ayşe’ye)',artist:'Celal İnce',spotifyTitle:'Hasret / Tango',id:'0dqTdjVZeXNyoY7ZoZRdd4',artistId:'6iYEpOX1rs6ZhJQ7vstI4M',albumId:'0IZbJFiScjfiLZEmIZbsQu',duration:182026,genre:'tango',release:[1952,1953],catalog:'Sahibinin Sesi AX 2572',adDate:'1953-08-17',ad:sources.h1953,transfer:sources.roll},
    {title:'Bekleyeceğim',artist:'Celal İnce',spotifyTitle:'Bekleyeceğim / Slow',id:'7nzuux6RxCCjUhQQ3j05yO',artistId:'6iYEpOX1rs6ZhJQ7vstI4M',albumId:'0IZbJFiScjfiLZEmIZbsQu',duration:193106,genre:'slow',release:[1952,1953],catalog:'Sahibinin Sesi AX 2572',adDate:'1953-08-17',ad:sources.h1953,transfer:sources.roll},
    {title:'Perestiş',artist:'Celal İnce',spotifyTitle:'Prestij Tango',id:'0Bvq5hkjNnYf0oGUuu2U7P',artistId:'6iYEpOX1rs6ZhJQ7vstI4M',albumId:'0IZbJFiScjfiLZEmIZbsQu',duration:184000,genre:'tango',release:[1953,1955],catalog:'Sahibinin Sesi AX 2601',adDate:'1955-04-18',ad:sources.m1955,transfer:sources.roll},
    {title:'Yüzünde Göz İzleri Var',artist:'Şecaattin Tanyerli',spotifyTitle:'Yüzünde Göz İzleri Var',id:'64NvynGgbjAqWcV65FU2ma',artistId:'3p2mnN65fp5kzGocOd2CFR',albumId:'3zfumlvWrYrOcb1fHlFh1q',duration:200246,genre:'tango',release:[1955,1955],catalog:'Columbia 17979',adDate:'1955-06-29',ad:sources.c1955,transfer:sources.tasPlakAlbum},
    {title:'Beyaz Zambak',artist:'Şecaattin Tanyerli',spotifyTitle:'Beyaz Zambak',id:'02TyFXx0bgiFGlFBO7yJdt',artistId:'3p2mnN65fp5kzGocOd2CFR',albumId:'3zfumlvWrYrOcb1fHlFh1q',duration:201452,genre:'tango',release:[1955,1955],catalog:'Columbia 17979',adDate:'1955-06-29',ad:sources.c1955,transfer:sources.tasPlakAlbum}
  ].map(r=>Object.freeze({...r,artistIds:Object.freeze(r.artistIds||[r.artistId]),language:'tr',tradition:'western-popular',evidence:'contemporary-new-release-ad',recording:'original-transfer',uri:'spotify:track:'+r.id,release:Object.freeze(r.release)}));
  Object.freeze(records);
  function validateCatalog(list){
    if(!Array.isArray(list)||!list.length||list.length>100) throw new Error('Seçki boş veya geçersiz.');
    const seen=new Set();
    for(const r of list){
      const [from,to]=r.release||[];
      if(!Number.isInteger(from)||!Number.isInteger(to)||from<1950||to>1959||from>to||
        r.language!=='tr'||r.tradition!=='western-popular'||!['tango','slow','swing','jazz','early-pop','slow-fox','bolero'].includes(r.genre)||
        r.evidence!=='contemporary-new-release-ad'||r.recording!=='original-transfer'||!r.catalog||
        !/^https:\/\//.test(r.ad||'')||!/^https:\/\//.test(r.transfer||'')||
        !/^195\d-\d{2}-\d{2}$/.test(r.adDate||'')||
        ![r.id,r.artistId,r.albumId,...(r.artistIds||[])].every(x=>/^[A-Za-z0-9]{22}$/.test(x||''))||r.uri!=='spotify:track:'+r.id||seen.has(r.uri))
        throw new Error('Tarih/tür/kayıt kanıtı geçersiz: '+(r.title||'isimsiz kayıt'));
      seen.add(r.uri);
    }
  }
  function matches(r,t){
    const actualArtists=(t?.artists||[]).map(a=>a.id), expectedArtists=r.artistIds||[r.artistId];
    const artistsExact=actualArtists.length===expectedArtists.length&&actualArtists.every((id,i)=>id===expectedArtists[i]);
    // Reject relinking to an unreviewed album/master; never substitute a search result.
    return !!t&&t.type==='track'&&t.id===r.id&&t.uri===r.uri&&!t.linked_from&&!t.is_local&&t.is_playable!==false&&
      !Object.keys(t.restrictions||{}).length&&norm(t.name)===norm(r.spotifyTitle)&&
      t.album?.id===r.albumId&&artistsExact&&
      Number.isFinite(t.duration_ms)&&Math.abs(t.duration_ms-r.duration)<=2000;
  }
  function retryAt(value,now){
    if(value!==null&&String(value).trim()!==''&&Number.isFinite(Number(value))) return now+Math.max(1,Number(value))*1000;
    const date=Date.parse(value);return Number.isFinite(date)&&date>now?date:now+60000;
  }
  function transport({fetch:send,token,refresh,storage,now=Date.now}){
    return async function request(path,opt={}){
      const until=Number(storage.getItem(COOLDOWN))||0;
      if(until>now()) throw new Error('Spotify kota molası: '+new Date(until).toLocaleString('tr-TR')+' sonrasında tekrar dene.');
      if(!path.startsWith('/')||path.startsWith('//')) throw new Error('Geçersiz Spotify yolu.');
      let tk=await token();if(!tk) throw new Error('Önce Spotify’a bağlan.');
      const run=()=>send('https://api.spotify.com/v1'+path,{...opt,headers:{Authorization:'Bearer '+tk,'Content-Type':'application/json'}});
      const write=!!opt.method&&opt.method!=='GET';
      let response;
      try{
        response=await run();
        if(response.status===401){tk=await refresh();if(!tk)throw new Error('Oturum yenilenemedi.');response=await run();}
      }catch(e){throw new Error(write?'Yazma yanıtı alınamadı. Sonuç belirsiz; otomatik tekrar yazılmadı. Aynı düğme yalnızca sonucu kontrol edecek.':'Spotify okunamadı: '+e.message);}
      if(response.status===429){
        const resume=retryAt(response.headers.get('Retry-After'),now());storage.setItem(COOLDOWN,String(resume));
        throw new Error('Spotify kotası doldu. '+new Date(resume).toLocaleString('tr-TR')+' sonrasında tekrar dene; otomatik tekrar yapılmadı.');
      }
      if(!response.ok) throw new Error('Spotify '+response.status+(write?' — yazma doğrulanamadı; otomatik tekrar yapılmadı.':''));
      if(response.status===204) return null;
      try{return await response.json();}catch{throw new Error(write?'Yazma yanıtı çözülemedi; sonuç kontrolü gerekli.':'Spotify yanıtı okunamadı.');}
    };
  }
  async function findTarget(request,me,selected){
    if(selected){if(!/^[A-Za-z0-9]{22}$/.test(selected))throw new Error('Geçersiz playlist.');return selected;}
    const found=[];let offset=0;
    for(;;){
      const page=await request('/me/playlists?limit=50&offset='+offset);
      if(!Array.isArray(page.items)) throw new Error('Playlistler okunamadı.');
      found.push(...page.items.filter(p=>p&&p.owner?.id===me.id&&names.includes(norm(p.name))));
      if(!page.next)break;
      if(!page.items.length||offset>=10000)throw new Error('Playlist taraması tamamlanamadı.');offset+=page.items.length;
    }
    if(found.length!==1)throw new Error(found.length?'Birden fazla 1950’ler listesi var. Üstten güncellenecek listeyi seç.':'Mevcut Türkçe 1950-1959 listesini üstten seç.');
    return found[0].id;
  }
  async function readItems(request,id){
    const items=[];let offset=0;
    for(;;){
      const page=await request('/playlists/'+id+'/items?limit=50&offset='+offset);
      if(!Array.isArray(page.items))throw new Error('Playlist içeriği okunamadı.');
      for(const row of page.items){
        const t=row.item||row.track;
        if(!t||t.is_local||!/^spotify:(track|episode):[A-Za-z0-9]{22}$/.test(t.uri||''))throw new Error('Mevcut liste eksiksiz yedeklenemiyor; işlem durduruldu.');
        items.push({uri:t.uri,originalUri:t.linked_from?.uri||t.uri,name:t.name||'',type:t.type});
      }
      if(!page.next)break;
      if(!page.items.length||offset>=10000)throw new Error('Playlist içeriği eksik.');offset+=page.items.length;
    }
    return items;
  }
  const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  async function build({id,request,storage,report=()=>{},now=Date.now}){
    validateCatalog(records);
    const me=await request('/me');if(!me?.id)throw new Error('Spotify hesabı doğrulanamadı.');
    id=await findTarget(request,me,id);
    async function target(){
      const p=await request('/playlists/'+id);
      if(!p||p.owner?.id!==me.id||!names.includes(norm(p.name))||!p.snapshot_id) throw new Error('Seçili liste sana ait Türkçe 1950-1959 listesi olmalı. Listeye dokunulmadı.');
      return p;
    }
    const before=await target(), uris=records.map(r=>r.uri);
    report(records.length+' sabit kaydın Spotify sürümleri kontrol ediliyor…');
    for(const r of records){
      const t=await request('/tracks/'+r.id);
      if(!matches(r,t))throw new Error('Listeye dokunulmadı: '+r.artist+' — '+r.title+' için seçilen arşiv sürümü kullanılamıyor veya değişmiş.');
    }
    const old=await readItems(request,id), current=await target();
    if(before.snapshot_id!==current.snapshot_id)throw new Error('Hazırlık sırasında liste değişti. İşlem durduruldu.');
    const resultKey=VERSION+':result:'+me.id+':'+id;
    let previous;
    try{previous=JSON.parse(storage.getItem(resultKey)||'null');}catch{throw new Error('Önceki işlem kaydı okunamadı; güvenli devam edilemiyor.');}
    if(!same(old.map(t=>t.originalUri),uris)){
      if(previous&&['write-pending','verification-pending'].includes(previous.state))throw new Error('Önceki yazmanın sonucu belirsiz ve içerik seçkiyle eşleşmiyor. Otomatik yeniden yazma durduruldu; Spotify listesini kontrol et.');
      const backupKey=VERSION+':backup:'+me.id+':'+id+':'+current.snapshot_id;
      if(!storage.getItem(backupKey))storage.setItem(backupKey,JSON.stringify({at:now(),playlist:id,name:current.name,description:current.description,snapshot:current.snapshot_id,items:old}));
      storage.setItem(resultKey,JSON.stringify({state:'write-pending',uris,backupKey,at:now()}));
      report('Eski liste yedeklendi. '+records.length+' kayıt tek işlemle yazılıyor…');
      await request('/playlists/'+id+'/items',{method:'PUT',body:JSON.stringify({uris})});
      storage.setItem(resultKey,JSON.stringify({state:'verification-pending',uris,backupKey,at:now()}));
    }
    const actual=await readItems(request,id);
    if(!same(actual.map(t=>t.originalUri),uris))throw new Error('Yazma sonrası içerik/sıra doğrulanamadı. Otomatik tekrar yapılmadı.');
    const verifiedTarget=await target();
    if(verifiedTarget.name!==NAME||verifiedTarget.description!==DESCRIPTION){
      await request('/playlists/'+id,{method:'PUT',body:JSON.stringify({name:NAME,description:DESCRIPTION})});
      const metadata=await target();
      if(metadata.name!==NAME||metadata.description!==DESCRIPTION)throw new Error(records.length+' kayıt doğrulandı; playlist adı/açıklaması henüz doğrulanamadı.');
    }
    storage.setItem(resultKey,JSON.stringify({state:'verified',uris,at:now()}));
    report('Bitti. '+records.length+' kayıt ve sıraları Spotify’dan yeniden okunarak doğrulandı.\nTSM, THM ve 1950–1959 dışı kayıt yok.');
    return {id,uris,state:'verified'};
  }
  const exported={NAME,DESCRIPTION,VERSION,COOLDOWN,CURATION_READY,CURATION_STATUS,records,validateCatalog,matches,retryAt,transport,readItems,build};
  if(typeof module!=='undefined')module.exports=exported;
  if(typeof document!=='undefined')root.addEventListener('load',()=>{
    const button=document.getElementById('tr5060');if(!button)return;
    const list=document.getElementById('tr50-sources');
    if(list)for(const r of records){
      const li=document.createElement('li'), a=document.createElement('a');
      li.textContent=r.artist+' — '+r.title+' · '+r.catalog+' · ';
      a.href=r.ad;a.textContent=r.adDate+' yeni plak ilanı';a.target='_blank';a.rel='noopener noreferrer';li.appendChild(a);list.appendChild(li);
    }
    if(!CURATION_READY){
      button.disabled=true;
      button.textContent='Seçki henüz tamamlanmadı';
      const report=document.getElementById('tr5060-report');
      if(report)report.textContent=CURATION_STATUS;
      return;
    }
    let busy=false;
    button.onclick=safe(async()=>{
      if(busy)return;
      if(location.origin!=='https://murat-spotify-manager.vercel.app')throw new Error('Spotify güncellemesini yayındaki Murat Spotify Manager üzerinden yap.');
      if(!navigator.locks)throw new Error('Güvenli güncelleme için güncel Chrome veya Edge kullan.');
      await navigator.locks.request('tr50-manager-build',{ifAvailable:true},async lock=>{
        if(!lock)throw new Error('1950’ler işlemi başka bir sekmede sürüyor.');busy=true;
        const controls=[...document.querySelectorAll('button,select')].map(e=>[e,e.disabled]);controls.forEach(([e])=>e.disabled=true);
        const report=t=>{document.getElementById('tr5060-report').textContent=t;status(t);};
        try{
          const request=transport({fetch:root.fetch.bind(root),token,refresh,storage:localStorage});
          const result=await build({id:document.getElementById('playlist').value,request,storage:localStorage,report});
          const select=document.getElementById('playlist');let option=[...select.options].find(o=>o.value===result.id);
          if(!option){option=document.createElement('option');option.value=result.id;select.appendChild(option);}
          option.textContent=NAME+' ('+records.length+')';select.value=result.id;
        }catch(e){report(e.message);throw e;}
        finally{controls.forEach(([e,disabled])=>e.disabled=disabled);busy=false;}
      });
    });
  });
})(typeof window==='undefined'?globalThis:window);
