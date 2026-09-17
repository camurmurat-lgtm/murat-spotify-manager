/* Birce public kids playlist 1: calm English children songs
   RULES
   - Public playlist, follow-friendly naming
   - English-language children's songs only
   - Calm / bedtime / gentle-play mood
   - One primary artist per track, no artist repeats
   - Built only through Murat Spotify Manager / Vercel
*/

const BCE_NAME='LITTLE QUIET HOURS | CALM ENGLISH SONGS FOR KIDS';
const BCE_DESC='Gentle English children’s songs for quiet play, winding down and bedtime. One song per artist, carefully selected for little listeners.';
const BCE_TARGET=30;
const BCE_MINIMUM=22;
const BCE_DELAY=900;

const BCE_CANDIDATES=[
 ['Raffi','Baby Beluga'],
 ['The Laurie Berkner Band','Moon Moon Moon'],
 ['Elizabeth Mitchell','Little Bird, Little Bird'],
 ['Caspar Babypants','Night Night'],
 ['Charlie Hope','You Are My Sunshine'],
 ['Frances England','All the Ways'],
 ['Lucy Kalantari & the Jazz Cats','Are You Afraid of the Dark?'],
 ['The Okee Dokee Brothers','Through the Woods'],
 ['Lisa Loeb','Rainbow Connection'],
 ['Super Simple Songs','Twinkle Twinkle Little Star'],
 ['The Kiboomers','Five Little Ducks'],
 ['The Wiggles','Rock-A-Bye Your Bear'],
 ['Sesame Street','Sing'],
 ['Cocomelon','Yes Yes Bedtime Song'],
 ['Maple Leaf Learning','Good Night'],
 ['Bounce Patrol','Twinkle Twinkle Little Star'],
 ['Patty Shukla','I Love You'],
 ['Kidz Bop Kids','You Are My Sunshine'],
 ['Nursery Rhymes 123','Hush Little Baby'],
 ['The Pop Ups','Box of Crayons'],
 ['Dog on Fleas','Sleepytime'],
 ['Justin Roberts','Mama Is Sad'],
 ['They Might Be Giants','Sleepwalkers'],
 ['Dan Zanes','Catch That Train!'],
 ['Peter, Paul and Mommy','Puff, the Magic Dragon'],
 ['The Learning Station','Peace Like a River'],
 ['Kidsongs','The Bear Went Over the Mountain'],
 ['Cedarmont Kids','This Old Man'],
 ['The Countdown Kids','Brahms Lullaby'],
 ['Mother Goose Club','Rock-a-bye Baby'],
 ['Music Together','Hello Everybody'],
 ['The Juicebox Jukebox','Kindness'],
 ['Emily Arrow','The Dot Song'],
 ['Koo Koo Kanga Roo','Nap Time'],
 ['Rockabye Baby!','Here Comes the Sun'],
 ['The Singing Walrus','Goodbye Song'],
 ['The Mik Maks','Goodnight'],
 ['Howdytoons','Sleepy Dinosaur'],
 ['The Bumble Nums','Goodnight Song'],
 ['Pinkfong','Twinkle Twinkle Little Star']
];

function bceNorm(s=''){
  return s.toLocaleLowerCase('en-US').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
}

function bceVersionOK(t){
  const n=bceNorm(t.name||'');
  return !/(remix|sped up|slowed|karaoke|instrumental|live)/.test(n);
}

async function bceFindTrack(artist,title){
  const q=`track:${title} artist:${artist}`;
  const j=await api('/search?type=track&limit=5&q='+encodeURIComponent(q));
  const wantArtist=bceNorm(artist), wantTitle=bceNorm(title);
  for(const t of (j.tracks?.items||[])){
    if(!t?.uri||!bceVersionOK(t)) continue;
    const primary=bceNorm(t.artists?.[0]?.name||'');
    const gotTitle=bceNorm(t.name||'');
    if(primary===wantArtist && (gotTitle===wantTitle || gotTitle.includes(wantTitle) || wantTitle.includes(gotTitle))) return t;
  }
  return null;
}

async function bceFindOrCreatePlaylist(){
  let url='/me/playlists?limit=50';
  while(url){
    const j=await api(url.replace('https://api.spotify.com/v1',''));
    const found=(j.items||[]).find(p=>p.name===BCE_NAME);
    if(found) return found;
    url=j.next;
  }
  return api('/me/playlists',{method:'POST',body:JSON.stringify({name:BCE_NAME,public:true,description:BCE_DESC})});
}

async function buildBirceCalmEnglish(){
  const btn=$('birce-calm-en');
  if(btn) btn.disabled=true;
  try{
    status('Sakin İngilizce çocuk listesi hazırlanıyor...');
    const picked=[];
    const usedArtists=new Set();
    let missing=0;
    for(let i=0;i<BCE_CANDIDATES.length && picked.length<BCE_TARGET;i++){
      const [artist,title]=BCE_CANDIDATES[i];
      const ak=bceNorm(artist);
      if(usedArtists.has(ak)) continue;
      status(`Çocuk listesi taranıyor: ${i+1}/${BCE_CANDIDATES.length}\n${artist} — ${title}`);
      const t=await bceFindTrack(artist,title);
      if(t){picked.push(t.uri);usedArtists.add(bceNorm(t.artists?.[0]?.name||artist));} else missing++;
      await sleep(BCE_DELAY);
    }
    if(picked.length<BCE_MINIMUM) throw new Error(`Yeterli güvenli eşleşme bulunamadı (${picked.length}). Listeye dokunulmadı.`);
    const p=await bceFindOrCreatePlaylist();
    await replaceWith(p.id,picked);
    await api(`/playlists/${p.id}`,{method:'PUT',body:JSON.stringify({name:BCE_NAME,public:true,description:BCE_DESC})});
    status(`Bitti. ${picked.length} şarkı, ${picked.length} farklı sanatçı. Liste herkese açık: ${BCE_NAME}${missing?` • ${missing} aday eşleşmedi.`:''}`,'ok');
    await playlists();
    $('playlist').value=p.id;
  } finally {
    if(btn) btn.disabled=false;
  }
}

const bceBtn=$('birce-calm-en');
if(bceBtn) bceBtn.onclick=safe(buildBirceCalmEnglish);
