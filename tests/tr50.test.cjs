const {test}=require('node:test');
const assert=require('node:assert/strict');
const c=require('../turkce_50_60.js');
const id='123456789012345678901A';
const memory=()=>{const values=new Map();return {values,getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};};
const track=r=>({type:'track',id:r.id,uri:r.uri,name:r.spotifyTitle,artists:[{id:r.artistId}],album:{id:r.albumId,release_date:'2021-11-11'},duration_ms:r.duration,is_playable:true});
function fixture(options={}){
  const storage=options.storage||memory(),calls=[];
  const original={uri:'spotify:track:AAAAAAAAAAAAAAAAAAAAAA',name:'Eski kayıt',type:'track'};
  let items=options.items||[original],snapshot='before',name=c.NAME,description='Halimem istisna',writes=0,reads=0;
  async function request(path,opt={}){
    calls.push({path,...opt});
    if(path==='/me')return {id:'owner'};
    if(path.startsWith('/me/playlists'))return {items:[{id,name:c.NAME,owner:{id:'owner'}}],next:null};
    if(path.startsWith('/tracks/')){const r=c.records.find(x=>path.endsWith(x.id));return options.badTrack?{...track(r),album:{id:'wrong'}}:track(r);}
    if(path==='/playlists/'+id){
      if(opt.method){({name,description}=JSON.parse(opt.body));return null;}
      reads++;
      return {id,name:options.wrongName?'AYVALIK':name,description,owner:{id:options.wrongOwner?'other':'owner'},snapshot_id:options.changed&&reads>1?'changed':snapshot};
    }
    if(path==='/playlists/'+id+'/items'&&opt.method==='PUT'){
      writes++;
      assert.ok([...storage.values.keys()].some(k=>k.includes(':backup:')),'backup precedes write');
      if(options.throwWrite)throw new Error('network');
      items=JSON.parse(opt.body).uris.map(uri=>({uri,name:'verified',type:'track'}));snapshot='after';
      if(options.badAfter)items.reverse();return {snapshot_id:snapshot};
    }
    if(path.startsWith('/playlists/'+id+'/items?')){
      const offset=Number(new URL('https://example.com'+path).searchParams.get('offset'));
      return {items:items.slice(offset,offset+50).map(item=>({item})),next:offset+50<items.length?'next':null};
    }
    throw new Error('Unexpected '+path);
  }
  return {storage,calls,request,run:()=>c.build({id:options.auto?'':id,request,storage}),writes:()=>writes};
}
test('catalog requires in-decade original Turkish Western recordings and evidence',()=>{
  c.validateCatalog(c.records);
  for(const change of [{release:[1949,1952]},{release:[1950,1960]},{release:[]},{release:[1952,1951]},{language:'en'},{tradition:'folk'},{tradition:'turkish-classical'},{recording:'rerecording'},{evidence:'composition-date'},{ad:''},{transfer:''}]){
    assert.throws(()=>c.validateCatalog([{...c.records[0],...change}]));
  }
  assert.throws(()=>c.validateCatalog([c.records[0],c.records[0]]));
  assert.throws(()=>c.validateCatalog([]));
});
test('digital reissue year allowed; unreviewed master/artist/relink rejected',()=>{
  const r=c.records[0],t=track(r);assert.equal(c.matches(r,t),true);
  for(const change of [{name:'Another title'},{artists:[{id:'other'}]},{album:{id:'other'}},{linked_from:{uri:r.uri}},{is_playable:false},{restrictions:{reason:'market'}},{duration_ms:90000},{uri:'spotify:track:wrong'}])assert.equal(c.matches(r,{...t,...change}),false);
});
test('one content PUT, complete backup, readback and exception-free description',async()=>{
  const f=fixture();const result=await f.run();assert.equal(result.state,'verified');assert.equal(f.writes(),1);
  assert.equal(f.calls.filter(x=>x.path.startsWith('/tracks/')).length,6);
  assert.equal(f.calls.some(x=>x.path.includes('/search')),false);
  const backup=JSON.parse([...f.storage.values].find(([k])=>k.includes(':backup:'))[1]);assert.equal(backup.description,'Halimem istisna');assert.equal(backup.items.length,1);
  const meta=f.calls.find(x=>x.path==='/playlists/'+id&&x.method==='PUT');assert.equal(JSON.parse(meta.body).description,c.DESCRIPTION);
  await f.run();assert.equal(f.writes(),1,'second run does not replace again');
});
test('finds unique existing owned target when selection is empty',async()=>{const f=fixture({auto:true});assert.equal((await f.run()).id,id);});
test('wrong owner/name/master or concurrent modification never writes',async()=>{
  for(const option of ['wrongOwner','wrongName','badTrack','changed']){const f=fixture({[option]:true});await assert.rejects(f.run());assert.equal(f.calls.some(x=>x.method),false,option);}
});
test('backs up more than 50 items preserving duplicates and order',async()=>{
  const items=Array.from({length:112},(_,i)=>({uri:'spotify:track:'+String(i%11).padStart(22,'0'),name:String(i),type:'track'}));
  const f=fixture({items});await f.run();const backup=JSON.parse([...f.storage.values].find(([k])=>k.includes(':backup:'))[1]);
  assert.deepEqual(backup.items.map(x=>x.uri),items.map(x=>x.uri));
});
test('incomplete backup and storage failure abort before any mutation',async()=>{
  const f=fixture({items:[{uri:'spotify:local:bad',is_local:true}]});await assert.rejects(f.run());assert.equal(f.writes(),0);
  const g=fixture({storage:{values:new Map(),getItem:()=>null,setItem:()=>{throw new Error('quota');}}});await assert.rejects(g.run(),/quota/);assert.equal(g.calls.some(x=>x.method),false);
});
test('ambiguous write persists guard; later click does not blindly retry',async()=>{
  const f=fixture({throwWrite:true});await assert.rejects(f.run(),/network/);assert.equal(f.writes(),1);
  await assert.rejects(f.run(),/belirsiz/);assert.equal(f.writes(),1);
});
test('wrong readback is not success and cannot trigger another replacement',async()=>{
  const f=fixture({badAfter:true});await assert.rejects(f.run(),/doğrulanamadı/);assert.equal(f.writes(),1);
  await assert.rejects(f.run(),/belirsiz/);assert.equal(f.writes(),1);
});
test('ambiguous write already applied can be verified without another content PUT',async()=>{
  const storage=memory();storage.setItem(c.VERSION+':result:owner:'+id,JSON.stringify({state:'write-pending'}));
  const f=fixture({storage,items:c.records.map(track)});assert.equal((await f.run()).state,'verified');assert.equal(f.writes(),0);
});
test('429 stores Retry-After; subsequent calls respect cooldown without network',async()=>{
  const storage=memory();let calls=0;
  const request=c.transport({fetch:async()=>{calls++;return {status:429,ok:false,headers:{get:()=> '120'}};},token:async()=> 'redacted',refresh:async()=> 'redacted',storage,now:()=>100000});
  await assert.rejects(request('/me'),/kotası/);assert.equal(storage.getItem(c.COOLDOWN),'220000');
  await assert.rejects(request('/me'),/kota/);assert.equal(calls,1);
});
test('network and 5xx writes are never retried',async()=>{
  for(const fail of [async()=>{throw new Error('network');},async()=>({status:503,ok:false})]){
    let calls=0;const request=c.transport({fetch:async()=>{calls++;return fail();},token:async()=> 'redacted',refresh:async()=> 'redacted',storage:memory()});
    await assert.rejects(request('/playlists/'+id+'/items',{method:'PUT',body:'{}'}));assert.equal(calls,1);
  }
});
test('401 refresh is limited to one retry after explicit rejection',async()=>{
  let calls=0,refreshes=0;const request=c.transport({fetch:async()=>++calls===1?{status:401}:{status:204,ok:true},token:async()=> 'redacted',refresh:async()=>{refreshes++;return 'redacted';},storage:memory()});
  assert.equal(await request('/me'),null);assert.equal(calls,2);assert.equal(refreshes,1);
});

test('incomplete curation cannot install a browser write handler',()=>{
  const fs=require('node:fs'),vm=require('node:vm');
  const button={disabled:false,textContent:''},report={textContent:''};
  let onLoad;
  const window={addEventListener:(event,fn)=>{assert.equal(event,'load');onLoad=fn;}};
  const document={getElementById:id=>id==='tr5060'?button:id==='tr5060-report'?report:null};
  // No safe/token/fetch globals: the incomplete path must stop before installing any writer.
  vm.runInNewContext(fs.readFileSync(require.resolve('../turkce_50_60.js'),'utf8'),{window,document});
  onLoad();
  assert.equal(c.CURATION_READY,false);
  assert.equal(button.disabled,true);
  assert.equal(button.onclick,undefined);
  assert.match(report.textContent,/tamamlanmadı/);
  assert.match(fs.readFileSync(require.resolve('../index.html'),'utf8'),/id="tr5060"[^>]*disabled/);
});
