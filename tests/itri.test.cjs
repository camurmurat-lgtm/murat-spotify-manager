const {test}=require('node:test');
const assert=require('node:assert/strict');
const {works,eligible,choose,retryAt,transport,build,NAME}=require('../itri.js');
const id='A'.repeat(22);
const track=(i=0,overrides={})=>({type:'track',uri:'spotify:track:'+String(i).padStart(22,'0'),name:works[i].aliases[0],artists:[{name:'Itri'}],album:{name:'Itri'},...overrides});
function storage(){const map=new Map();return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};}
test('Turkish spelling accepted, no first-result fallback',()=>{
  assert.ok(eligible(works[0],track(0,{name:'Nevâ Kâr'})));
  assert.equal(choose(works[0],[track(0,{name:'Segah Tekbir'})]),null);
  assert.equal(eligible(works[0],track(0,{artists:[{name:'Other'}],album:{name:'Other'}})),false);
});
test('religious works / mixed titles / unplayable recordings fail closed',()=>{
  for(const name of ['Tekbîr','Salât-ı Ümmiye','Na’t','Naat','Âyin','İlahi','Tevşih','Durak','Medley','Taksim'])
    assert.equal(eligible(works[0],track(0,{name:'Neva Kar '+name})),false,name);
  for(const extra of [{is_local:true},{is_playable:false},{restrictions:{reason:'market'}},{type:'episode'},{uri:'bad'}])
    assert.equal(eligible(works[0],track(0,extra)),false);
});
test('Retry-After seconds, HTTP date, malformed fallback',()=>{
  assert.equal(retryAt('120',0),120000);
  assert.equal(retryAt('Thu, 01 Jan 1970 00:02:00 GMT',0),120000);
  assert.equal(retryAt('oops',0),60000);
});
function wire(responses){
  let time=100000,calls=0;const store=storage();
  const request=transport({storage:store,token:async()=>'mock',refresh:async()=>'mock2',now:()=>time,wait:async ms=>{time+=ms;},fetch:async()=>{calls++;const r=responses.shift();if(r instanceof Error)throw r;return {ok:r.status<300,status:r.status,headers:{get:()=>r.retry??null},json:async()=>({ok:true})};}});
  return {request,store,calls:()=>calls};
}
test('long 429 persists cooldown and blocks immediate retry',async()=>{
  const w=wire([{status:429,retry:'120'}]);
  await assert.rejects(w.request('/search'),/kotası/);
  await assert.rejects(w.request('/search'),/kotası/);
  assert.equal(w.calls(),1);
});
test('short 429 waits then resumes',async()=>{
  const w=wire([{status:429,retry:'3'},{status:200}]);
  assert.deepEqual(await w.request('/search'),{ok:true});assert.equal(w.calls(),2);
});
test('ambiguous writes never automatically retry',async()=>{
  for(const response of [new Error('network'),{status:503}]){
    const w=wire([response]);await assert.rejects(w.request('/playlists/'+id+'/items',{method:'PUT'}));assert.equal(w.calls(),1);
  }
});
function fixture({count=8,wrong=false,owner=false,change=false,mismatch=false,duplicate=false}={}){
  let writes=0,gets=0,contents=[track(7)],store=storage();
  const request=async(path,opt={})=>{
    if(path==='/me')return {id:'me',country:'TR'};
    if(path==='/playlists/'+id)return {name:wrong?'Elsewhere':NAME,owner:{id:owner?'other':'me'},snapshot_id:change&&++gets>1?'changed':'same'};
    if(path.startsWith('/search')){
      const q=new URL('https://example.test'+path).searchParams.get('q');
      const i=works.findIndex(w=>q.startsWith(w.aliases[0]));
      return {tracks:{items:i>=0&&i<count?[track(i,duplicate?{uri:track(0).uri}:{})]:[]}};
    }
    if(path.startsWith('/tracks/'))return track(Number(path.split('/').pop()));
    if(opt.method==='PUT'){writes++;contents=JSON.parse(opt.body).uris.map(uri=>track(Number(uri.split(':')[2])));return {snapshot_id:'new'};}
    if(path.includes('/items?'))return {items:(mismatch&&writes?[track(7)]:contents).map(item=>({item})),next:null};
    throw new Error('Unexpected request '+path);
  };
  return {args:{id,request,storage:store,report:()=>{}},writes:()=>writes};
}
test('wrong target / owner / too few works / duplicate URIs cannot write',async()=>{
  for(const options of [{wrong:true},{owner:true},{count:1},{duplicate:true}]){
    const f=fixture(options);await assert.rejects(build(f.args));assert.equal(f.writes(),0);
  }
});
test('snapshot changes abort before write',async()=>{
  const f=fixture({change:true});await assert.rejects(build(f.args),/değişti/);assert.equal(f.writes(),0);
});
test('one replacement, backup, verified report; rerun is idempotent',async()=>{
  const f=fixture();const r=await build(f.args);
  assert.equal(r.state,'verified');assert.equal(r.selected.length,8);assert.equal(f.writes(),1);
  assert.ok(f.args.storage.getItem('itri-backup-v1:'+id));
  await build(f.args);assert.equal(f.writes(),1);
});
test('post-write mismatch is reported without second write',async()=>{
  const f=fixture({mismatch:true});await assert.rejects(build(f.args),/doğrulanamadı/);assert.equal(f.writes(),1);
});
