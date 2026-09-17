/* Birce public kids playlist 1: calm English children songs
   LOCKED RULES
   - Public playlist with an original English name
   - English-language children's songs only
   - Calm / quiet-play / wind-down / bedtime mood
   - One primary artist per track, no artist repeats
   - Exactly 60 tracks required
   - Built only through Murat Spotify Manager / Vercel
*/

const BCE_NAME='LITTLE EARS, SOFT SKIES | CALM ENGLISH SONGS FOR KIDS';
const BCE_DESC='A gentle world of English children’s songs for quiet play, winding down and bedtime. 60 songs, 60 different artists, made for little ears.';
const BCE_TARGET=60;
const BCE_MINIMUM=60;
const BCE_DELAY=1200;

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
 ['CoComelon','Yes Yes Bedtime Song'],
 ['Maple Leaf Learning','Good Night'],
 ['Bounce Patrol','Twinkle Twinkle Little Star'],
 ['Patty Shukla','I Love You'],
 ['Nursery Rhymes 123','Hush Little Baby'],
 ['The Pop Ups','Box of Crayons'],
 ['Dog on Fleas','Sleepytime'],
 ['Justin Roberts','Mama Is Sad'],
 ['They Might Be Giants','Sleepwalkers'],
 ['The Learning Station','Peace Like a River'],
 ['Kidsongs','The Bear Went Over the Mountain'],
 ['Cedarmont Kids','This Old Man'],
 ['The Countdown Kids','Brahms Lullaby'],
 ['Mother Goose Club','Rock-a-bye Baby'],
 ['Music Together','Hello Everybody'],
 ['The Juicebox Jukebox','Kindness'],
 ['Emily Arrow','The Dot Song'],
 ['Koo Koo Kanga Roo','Nap Time'],
 ['The Singing Walrus','Goodbye Song'],
 ['The Mik Maks','Goodnight'],
 ['Howdytoons','Sleepy Dinosaur'],
 ['Pinkfong','Twinkle Twinkle Little Star'],
 ['Red Grammer','Teaching Peace'],
 ['Tom Chapin','Family Tree'],
 ['Jim Gill','May There Always Be Sunshine'],
 ['Ella Jenkins',"You'll Sing a Song and I'll Sing a Song"],
 ['Charlotte Diamond','Four Hugs a Day'],
 ['Sharon, Lois & Bram','Skinnamarink'],
 ['Renee & Jeremy','Night Mantra'],
 ['Kira Willey','Colors'],
 ['Bari Koral','Fly Like a Butterfly'],
 ['Mister G','Dreamtime'],
 ['Milkshake','Bottle of Sunshine'],
 ['Tim Kubart','Sunday Crafternoon'],
 ['Lunch Money','Are You a Rabbit?'],
 ['Gustafer Yellowgold',"I'm From the Sun"],
 ['Alina Celeste','Little Bird'],
 ['Laura Doherty','Butterfly'],
 ['Sukey Molloy','I Am Happy'],
 ['Pancake Manor','Twinkle Twinkle Little Star'],
 ['Dave and Ava','Twinkle Twinkle Little Star'],
 ['Little Baby Bum Nursery Rhyme Friends','Twinkle Twinkle Little Star'],
 ['ChuChu TV','Twinkle Twinkle Little Star'],
 ['LooLoo Kids','Twinkle Twinkle Little Star'],
 ['HooplaKidz','Hush Little Baby'],
 ['HeyKids','Twinkle Twinkle Little Star'],
 ['Kids TV 123','The Solar System Song'],
 ['Peter, Paul and Mommy','Puff, the Magic Dragon'],
 ['The Harmonica Pocket','Ladybug One'],
 ['The Whizpops','Sea Blue Sea'],
 ['Walter Martin',"We Like the Zoo ('Cause We're Animals Too)"],
 ['Rabbit!','Peace'],
 ['Vered','Good Morning My Love'],
 ['Sara Lovell','Night Life'],
 ['The Nields','Anna Kick a Hole in the Sky'],
 ['SteveSongs','On a Flying Guitar'],
 ['Farmer Jason','Forest Rhymes'],
 ['Alphabet Rockers','Shine'],
 ['The Relative Minors','One More Book'],
 ['Lard Dog & The Band of Shy','Dreamers'],
 ['The Good Ms. Padgett','Say Goodnight'],
 ['The Terrible Twos','Amelia Minor'],
 ['The Dream Jam Band','Moon Dreams'],
 ['The Hipwaders','Hey Josie'],
 ['The Jimmies','Bedhead'],
 ['Little Angel','Bedtime Song'],
 ['Bebefinn','Good Night'],
 ['KiiYii','Twinkle Twinkle Little Star'],
 ['The Wonder Kids','You Are My Sunshine'],
 ['The Hit Crew Kids','You Are My Sunshine'],
 ['Baby Joy Joy','Twinkle Twinkle Little Star'],
 ['The GiggleBellies','Twinkle Twinkle Little Star'],
 ['KidsCamp','Twinkle Twinkle Little Star'],
 ['Junior Squad','Twinkle Twinkle Little Star'],
 ['The Little Sunshine Kids','You Are My Sunshine'],
 ['The Rainbow Collections','Twinkle Twinkle Little Star'],
 ['Theś?','__unused__']
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
      if(title==='__unused__') continue;
      const ak=bceNorm(artist);
      if(usedArtists.has(ak)) continue;
      status(`Çocuk listesi taranıyor: ${i+1}/${BCE_CANDIDATES.length}\n${artist} — ${title}\n${picked.length}/60 güvenli eşleşme`);
      const t=await bceFindTrack(artist,title);
      if(t){
        const actualArtist=bceNorm(t.artists?.[0]?.name||artist);
        if(!usedArtists.has(actualArtist)){
          picked.push(t.uri);
          usedArtists.add(actualArtist);
        }
      } else missing++;
      await sleep(BCE_DELAY);
    }
    if(picked.length<BCE_MINIMUM) throw new Error(`60 farklı sanatçı tamamlanamadı (${picked.length}/60). Listeye dokunulmadı.`);
    const p=await bceFindOrCreatePlaylist();
    await replaceWith(p.id,picked.slice(0,60));
    await api(`/playlists/${p.id}`,{method:'PUT',body:JSON.stringify({name:BCE_NAME,public:true,description:BCE_DESC})});
    status(`Bitti. 60 şarkı, 60 farklı sanatçı. Liste herkese açık: ${BCE_NAME}${missing?` • ${missing} aday eşleşmedi.`:''}`,'ok');
    await playlists();
    $('playlist').value=p.id;
  } finally {
    if(btn) btn.disabled=false;
  }
}

const bceBtn=$('birce-calm-en');
if(bceBtn) bceBtn.onclick=safe(buildBirceCalmEnglish);
