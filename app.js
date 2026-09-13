const CLIENT_ID='b69eccc6d93e42b5bd9e78d9d3edba99';
const SCOPES=['user-read-private','playlist-read-private','playlist-read-collaborative','playlist-modify-private','playlist-modify-public'].join(' ');
const $=id=>document.getElementById(id);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const status=(t,cls='')=>{$('status').className='status '+cls;$('status').textContent=t};
const redirectUri=()=>location.origin+location.pathname;
const store={get:()=>{try{return JSON.parse(localStorage.getItem('spotify_tokens')||'null')}catch{return null}},set:x=>localStorage.setItem('spotify_tokens',JSON.stringify(x)),clear:()=>localStorage.removeItem('spotify_tokens')};

const ANTHOLOGY=[
['Abdülkadir Merâgî — Rast Kâr-ı Muhteşem',['Rast Kar-ı Muhteşem Abdülkadir Meragi','Abdülkadir Meragi Rast Kar']],
['Abdülkadir Merâgî — Rast Nakış',['Abdülkadir Meragi Rast Nakış','Abdulkadir Meragi Rast Nakis']],
['Abdülkadir Merâgî — Nihâvend-i Kebîr Kâr',['Nihavend-i Kebir Kar Abdülkadir Meragi','Abdulkadir Meragi Nihavend Kebir Kar']],
['Abdülkadir Merâgî — Ağır Semai / Pençgâh',['Abdulkadir Meragi Agir Semai Pencgah','Abdülkadir Meragi Ağır Semai']],
['Gazi Giray Han — Mahur Peşrevi',['Mahur Peşrev Gazi Giray Han','Gazi Giray Han Mahur Pesrevi']],
['Gazi Giray Han — Rast Semai Lenk',['Rast Semai Lenk Gazi Giray Han','Gazi Giray Han Rast Semai']],
['Gazi Giray Han — Nihavend Saz Semaisi',['Nihavend Saz Semaisi Gazi Giray Han','Gazi Giray Han Nihavend']],
['Hafız Post — Gelse O Şuh Meclise',['Gelse O Şuh Meclise Hafız Post','Gelse O Suh Meclise Hafiz Post']],
['Buhurizade Mustafa Itrî — Neva Kâr',['Neva Kar Itri','Buhurizade Mustafa Itri Neva Kar']],
['Buhurizade Mustafa Itrî — Segâh Tekbir',['Segah Tekbir Itri','Buhurizade Mustafa Itri Tekbir']],
['Buhurizade Mustafa Itrî — Na’t',['Nat Itri','Na’t Buhurizade Mustafa Itri']],
['Buhurizade Mustafa Itrî — Segâh Yürük Semai',['Segah Yuruk Semai Itri','Itri Segah Yürük Semai']],
['Tanburi Mustafa Çavuş — Dök Zülfünü Meydana Gel',['Dök Zülfünü Meydana Gel Tanburi Mustafa Çavuş','Dok Zulfunu Meydana Gel Tanburi Mustafa Cavus']],
['Tanburi Mustafa Çavuş — Hisarbuselik Şarkı',['Hisarbuselik Şarkı Tanburi Mustafa Çavuş','Hisarbuselik Sarki Tanburi Mustafa Cavus']],
['Kantemiroğlu — Peşrev',['Kantemiroğlu Peşrev','Dimitrie Cantemir Pesrev']],
['Kantemiroğlu — Saz Semaisi',['Kantemiroğlu Saz Semaisi','Dimitrie Cantemir Saz Semai']],
['Dilhayat Kalfa — Evcara Peşrev',['Evcara Peşrev Dilhayat Kalfa','Dilhayat Kalfa Evcara Pesrev']],
['Dilhayat Kalfa — Evcara Saz Semaisi',['Evcara Saz Semaisi Dilhayat Kalfa','Dilhayat Kalfa Evcara Saz Semaisi']],
['Zaharya — Ağır Semai',['Zaharya Ağır Semai','Zaharya Agir Semai']],
['Zaharya — Beste',['Zaharya Beste klasik Türk musikisi','Zaharya beste']],
['Ebubekir Ağa — Segâh Yürük Semai',['Segah Yürük Semai Ebubekir Ağa','Segah Yuruk Semai Ebubekir Aga']],
['Ebubekir Ağa — Mahur Beste',['Mahur Beste Ebubekir Ağa','Mahur Beste Eyyubi Bekir Aga']],
['Tab’î Mustafa Efendi — Peşrev',['Tabi Mustafa Efendi Peşrev','Tabi Mustafa Pesrev']],
['III. Selim — Suzidilara Peşrev',['Suzidilara Peşrev III Selim','III. Selim Suzidilara Pesrev']],
['III. Selim — Suzidilara Beste',['Suzidilara Beste III Selim','Sultan Selim Han III Suz-i Dilara Beste']],
['III. Selim — Hüzzam Şarkı',['Hüzzam Şarkı III Selim','Huzzam Sarki III Selim']],
['Tanburi İsak — Peşrev',['Tanburi İsak Peşrev','Tanburi Isak Pesrev']],
['Tanburi İsak — Saz Semaisi',['Tanburi İsak Saz Semaisi','Tanburi Isak Saz Semai']],
['Abdülbaki Nasır Dede — Peşrev',['Abdülbaki Nasır Dede Peşrev','Abdulbaki Nasir Dede Pesrev']],
['Küçük Mehmed Ağa — Süznak Yürük Semai',['Süznak Yürük Semai Küçük Mehmed Ağa','Suznak Yuruk Semai Kucuk Mehmed Aga']],
['İsmail Dede Efendi — Yine Bir Gülnihal',['Yine Bir Gülnihal Dede Efendi','Yine Bir Gulnihal Dede Efendi']],
['İsmail Dede Efendi — Baharın Zamanı Geldi',['Baharın Zamanı Geldi Dede Efendi','Baharin Zamani Geldi Dede Efendi']],
['İsmail Dede Efendi — Gözümde Daim Hayal-i Cana',['Gözümde Daim Hayali Cana Dede Efendi','Gozumde Daim Hayali Cana Dede Efendi']],
['İsmail Dede Efendi — Ey Büt-i Nev Eda',['Ey Büt-i Nev Eda Dede Efendi','Ey But-i Nev Eda Dede Efendi']],
['İsmail Dede Efendi — Zülfündedir Benim Baht-ı Siyahım',['Zülfündedir Benim Bahtı Siyahım Dede Efendi','Zulfundedir Benim Bahti Siyahim Dede Efendi']],
['İsmail Dede Efendi — Rast Kâr-ı Nâtık',['Rast Kar-ı Natık Dede Efendi','Rast Kar-i Natik Dede Efendi']],
['Dellalzade İsmail Efendi — Tahir Aksak Şarkı',['Tahir Aksak Şarkı Dellalzade İsmail Efendi','Tahir Aksak Sarki Dellalzade Ismail Efendi']],
['Dellalzade İsmail Efendi — Süznak Devr-i Kebir Beste',['Süznak Devr-i Kebir Beste Dellalzade İsmail Efendi','Suznak Devr-i Kebir Beste Dellalzade']],
['Tanburi Büyük Osman Bey — Peşrev',['Tanburi Büyük Osman Bey Peşrev','Buyuk Osman Bey Pesrev']],
['Tanburi Büyük Osman Bey — Saz Semaisi',['Tanburi Büyük Osman Bey Saz Semaisi','Buyuk Osman Bey Saz Semai']],
['Kazasker Mustafa İzzet Efendi — Eser',['Kazasker Mustafa İzzet Efendi Türk musikisi','Mustafa İzzet Efendi beste']],
['Zekai Dede — Acemkürdi Takım',['Acemkurdi Zekai Dede Efendi','Zekai Dede Acemkurdi']],
['Zekai Dede — Mualla Gavs-i Sübhani',['Mualla Gavs-i Sübhani Zekai Dede','Zekai Dede Mualla Gavs']],
['Hacı Arif Bey — Olmaz İlaç Sine-i Sad Pareme',['Olmaz İlaç Sine-i Sad Pareme Hacı Arif Bey','Olmaz Ilac Sine-i Sad Pareme Haci Arif Bey']],
['Hacı Arif Bey — Bakmıyor Çeşm-i Siyah',['Bakmıyor Çeşmi Siyah Hacı Arif Bey','Bakmiyor Cesmi Siyah Haci Arif Bey']],
['Hacı Arif Bey — Muntazır Teşrifine',['Muntazır Teşrifine Hacı Arif Bey','Muntazir Tesrifine Haci Arif Bey']],
['Hacı Arif Bey — Nihavend Şarkı',['Nihavend Şarkı Hacı Arif Bey','Nihavend Sarki Haci Arif Bey']],
['Nikogos Ağa — Şarkı',['Nikogos Ağa Şarkı Türk musikisi','Nikogos Aga Sarki']],
['Tanburi Ali Efendi — Saz Semaisi',['Tanburi Ali Efendi Saz Semaisi','Tanburi Ali Efendi Saz Semai']],
['Şevki Bey — Nedendir Bu Dil-i Zârın Figânı',['Nedendir Bu Dil-i Zarin Figani Şevki Bey','Nedendir Bu Dil Sevki Bey']],
['Şevki Bey — Hicran Oku Sinemi Deler',['Hicran Oku Sinemi Deler Şevki Bey','Hicran Oku Sinem Deler Sevki Bey']],
['Şevki Bey — Aman Saki',['Aman Saki Şevki Bey','Aman Saki Sevki Bey']],
['Kemani Tatyos Efendi — Gamzedeyim Deva Bulmam',['Gamzedeyim Deva Bulmam Tatyos Efendi','Kemani Tatyos Gamzedeyim']],
['Kemani Tatyos Efendi — Kürdilihicazkâr Saz Semaisi',['Kürdilihicazkar Saz Semaisi Tatyos Efendi','Kurdilihicazkar Saz Semai Tatyos']],
['Kemani Tatyos Efendi — Karcığar Peşrev',['Karcigar Peşrev Tatyos Efendi','Karcigar Pesrev Kemani Tatyos']],
['Lem’i Atlı — Dinlendi Başım Dün Gece',['Dinlendi Başım Dün Gece Lemi Atlı','Dinlendi Basim Dun Gece Lemi Atli']],
['Lem’i Atlı — Sorulmasın Bana Ye’sim',['Sorulmasın Bana Yesim Lemi Atlı','Sorulmasin Bana Yesim Lemi Atli']],
['Udi Nevres Bey — Hüzzam Saz Semaisi',['Hüzzam Saz Semaisi Udi Nevres Bey','Huzzam Saz Semai Udi Nevres']],
['Udi Nevres Bey — Peşrev',['Udi Nevres Bey Peşrev','Udi Nevres Pesrev']],
['Tanburi Cemil Bey — Çeçen Kızı',['Çeçen Kızı Tanburi Cemil Bey','Cecen Kizi Tanburi Cemil Bey']],
['Tanburi Cemil Bey — Nihavend Taksim',['Nihavend Taksim Tanburi Cemil Bey','Tanburi Cemil Nihavend Taksim']],
['Tanburi Cemil Bey — Kürdilihicazkâr Peşrev',['Kürdilihicazkar Peşrev Tanburi Cemil Bey','Kurdilihicazkar Pesrev Tanburi Cemil']],
['Tanburi Cemil Bey — Hicazkâr Saz Semaisi',['Hicazkar Saz Semaisi Tanburi Cemil Bey','Hicazkar Saz Semai Tanburi Cemil']],
['Tanburi Cemil Bey — Isfahan Peşrev',['Isfahan Peşrev Tanburi Cemil Bey','Isfahan Pesrev Tanburi Cemil']],
['Kaptanzade Ali Rıza Bey — Yıldızların Altında',['Yıldızların Altında Kaptanzade Ali Rıza Bey','Yildizlarin Altinda Kaptanzade Ali Riza']],
['İsmail Hakkı Bey — Fikrimin İnce Gülü',['Fikrimin İnce Gülü İsmail Hakkı Bey','Fikrimin Ince Gulu Ismail Hakki Bey']],
['Refik Fersan — Nihavend Saz Semaisi',['Nihavend Saz Semaisi Refik Fersan','Refik Fersan Nihavend Saz Semai']],
['Refik Fersan — Saz Semaisi',['Refik Fersan Saz Semaisi','Refik Fersan Saz Semai']],
['Sadettin Kaynak — Enginde Yavaş Yavaş',['Enginde Yavaş Yavaş Sadettin Kaynak','Enginde Yavas Yavas Sadettin Kaynak']],
['Sadettin Kaynak — Yanık Ömer',['Yanık Ömer Sadettin Kaynak','Yanik Omer Sadettin Kaynak']],
['Sadettin Kaynak — Muhabbet Bağına Girdim Bu Gece',['Muhabbet Bağına Girdim Bu Gece Sadettin Kaynak','Muhabbet Bagina Girdim Sadettin Kaynak']],
['Münir Nurettin Selçuk — Dönülmez Akşamın Ufkundayız',['Dönülmez Akşamın Ufkundayız Münir Nurettin Selçuk','Donulmez Aksamin Ufkundayiz Munir Nurettin']],
['Münir Nurettin Selçuk — Kalamış',['Kalamış Münir Nurettin Selçuk','Kalamis Munir Nurettin Selcuk']],
['Münir Nurettin Selçuk — Aziz İstanbul',['Aziz İstanbul Münir Nurettin Selçuk','Aziz Istanbul Munir Nurettin']],
['Münir Nurettin Selçuk — Endülüs’te Raks',['Endülüste Raks Münir Nurettin Selçuk','Enduluste Raks Munir Nurettin']],
['Selahattin Pınar — Nereden Sevdim O Zalim Kadını',['Nereden Sevdim O Zalim Kadını Selahattin Pınar','Nereden Sevdim O Zalim Kadini Selahattin Pinar']],
['Selahattin Pınar — Bir Bahar Akşamı Rastladım Size',['Bir Bahar Akşamı Rastladım Size Selahattin Pınar','Bir Bahar Aksami Rastladim Size Selahattin Pinar']],
['Selahattin Pınar — Kalbim Yine Üzgün',['Kalbim Yine Üzgün Selahattin Pınar','Kalbim Yine Uzgun Selahattin Pinar']],
['Yesari Asım Arsoy — Biz Heybeli’de Her Gece',['Biz Heybelide Her Gece Yesari Asım Arsoy','Biz Heybelide Her Gece Yesari Asim']],
['Yesari Asım Arsoy — Ada Sahillerinde Bekliyorum',['Ada Sahillerinde Bekliyorum Yesari Asım Arsoy','Ada Sahillerinde Bekliyorum Yesari Asim']],
['Yesari Asım Arsoy — Ömrüm Seni Sevmekle Nihayet Bulacaktır',['Ömrüm Seni Sevmekle Nihayet Bulacaktır Yesari Asım Arsoy','Omrum Seni Sevmekle Nihayet Bulacaktir Yesari Asim']],
['Osman Nihat Akın — Bir İhtimal Daha Var',['Bir İhtimal Daha Var Osman Nihat Akın','Bir Ihtimal Daha Var Osman Nihat Akin']],
['Osman Nihat Akın — Yine Bu Yıl Ada Sensiz',['Yine Bu Yıl Ada Sensiz Osman Nihat Akın','Yine Bu Yil Ada Sensiz Osman Nihat Akin']],
['Şerif İçli — Şarkı',['Şerif İçli klasik Türk musikisi','Serif Icli sarki']]
];

function randomString(n=64){const a='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';let s='';const b=new Uint8Array(n);crypto.getRandomValues(b);for(const x of b)s+=a[x%a.length];return s}
function base64url(buf){return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
async function challenge(v){return base64url(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v)))}
async function connect(){const verifier=randomString();sessionStorage.setItem('pkce_verifier',verifier);const ch=await challenge(verifier);const u=new URL('https://accounts.spotify.com/authorize');u.searchParams.set('client_id',CLIENT_ID);u.searchParams.set('response_type','code');u.searchParams.set('redirect_uri',redirectUri());u.searchParams.set('scope',SCOPES);u.searchParams.set('code_challenge_method','S256');u.searchParams.set('code_challenge',ch);location.href=u.toString()}
async function exchange(code){const verifier=sessionStorage.getItem('pkce_verifier');if(!verifier)throw new Error('PKCE doğrulama anahtarı bulunamadı. Tekrar bağlan.');const body=new URLSearchParams({client_id:CLIENT_ID,grant_type:'authorization_code',code,redirect_uri:redirectUri(),code_verifier:verifier});const r=await fetch('https://accounts.spotify.com/api/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});if(!r.ok)throw new Error('Spotify token hatası: '+await r.text());const j=await r.json();store.set({...j,expires_at:Date.now()+j.expires_in*1000});sessionStorage.removeItem('pkce_verifier');history.replaceState({},'',location.pathname);return j}
async function refresh(){const t=store.get();if(!t?.refresh_token)throw new Error('Spotify bağlantısı yok.');const body=new URLSearchParams({client_id:CLIENT_ID,grant_type:'refresh_token',refresh_token:t.refresh_token});const r=await fetch('https://accounts.spotify.com/api/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});if(!r.ok)throw new Error('Oturum yenilenemedi. Tekrar Spotify’a bağlan.');const j=await r.json();const n={...t,...j,refresh_token:j.refresh_token||t.refresh_token,expires_at:Date.now()+j.expires_in*1000};store.set(n);return n.access_token}
async function token(){const t=store.get();if(!t)return null;if(Date.now()<((t.expires_at||0)-60000))return t.access_token;return refresh()}
async function api(path,opt={},attempt=0){let tk=await token();if(!tk)throw new Error('Önce Spotify’a bağlan.');const run=()=>fetch('https://api.spotify.com/v1'+path,{...opt,headers:{Authorization:'Bearer '+tk,'Content-Type':'application/json',...(opt.headers||{})}});let r=await run();if(r.status===401){tk=await refresh();r=await run()}if(r.status===429&&attempt<5){const sec=Math.max(1,Number(r.headers.get('Retry-After'))||2);status(`Spotify kısa bir mola istedi. ${sec} sn bekleniyor...`,'warn');await sleep(sec*1000);return api(path,opt,attempt+1)}if(!r.ok){const tx=await r.text();throw new Error('Spotify API '+r.status+': '+tx)}if(r.status===204)return null;return r.json()}

async function profile(){const me=await api('/me');$('who').textContent='Bağlı: '+(me.display_name||me.id);return me}
function escapeHtml(s=''){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
async function playlists(){status('Listeler yükleniyor...');let url='/me/playlists?limit=50';const all=[];while(url){const j=await api(url.replace('https://api.spotify.com/v1',''));all.push(...j.items);url=j.next}const s=$('playlist');const previous=s.value;s.innerHTML='<option value="">Liste seç</option>'+all.map(p=>`<option value="${p.id}">${escapeHtml(p.name)} (${p.items?.total??0})</option>`).join('');if(previous&&all.some(p=>p.id===previous))s.value=previous;status(all.length+' playlist bulundu.','ok')}
function parseItems(){const out=[];for(const raw of $('items').value.split(/\s+/)){const x=raw.trim();if(!x)continue;if(/^spotify:track:[A-Za-z0-9]+$/.test(x))out.push(x);else{const m=x.match(/open\.spotify\.com\/track\/([A-Za-z0-9]+)/);if(m)out.push('spotify:track:'+m[1])}}return [...new Set(out)]}
function updateCount(){$('count').textContent=parseItems().length+' parça'}
async function addBatches(id,uris){for(let i=0;i<uris.length;i+=100){const batch=uris.slice(i,i+100);status(`${i+1}-${Math.min(i+100,uris.length)} / ${uris.length} ekleniyor...`);await api(`/playlists/${id}/items`,{method:'POST',body:JSON.stringify({uris:batch})})}}
async function replaceWith(id,uris){if(!uris.length)throw new Error('Eklenecek parça bulunamadı.');const first=uris.slice(0,100);await api(`/playlists/${id}/items`,{method:'PUT',body:JSON.stringify({uris:first})});if(uris.length>100)await addBatches(id,uris.slice(100))}
async function replaceAll(){const id=$('playlist').value;if(!id)throw new Error('Önce playlist seç.');const uris=parseItems();if(!uris.length)throw new Error('Parça listesi boş.');status(`Listeye ${uris.length} parça sırayla yazılıyor...`);await replaceWith(id,uris);status(`Tamamlandı. ${uris.length} parça seçili listeye sırasıyla yazıldı.`,'ok');await playlists();$('playlist').value=id}
async function appendAll(){const id=$('playlist').value;if(!id)throw new Error('Önce playlist seç.');const uris=parseItems();if(!uris.length)throw new Error('Parça listesi boş.');await addBatches(id,uris);status(`Tamamlandı. ${uris.length} parça listenin sonuna eklendi.`,'ok');await playlists();$('playlist').value=id}
async function clearAll(){const id=$('playlist').value;if(!id)throw new Error('Önce playlist seç.');if(!confirm('Seçili playlist tamamen boşaltılsın mı?'))return;await api(`/playlists/${id}/items`,{method:'PUT',body:JSON.stringify({uris:[]})});status('Playlist boşaltıldı.','ok');await playlists();$('playlist').value=id}
async function createPlaylist(){const name=$('newName').value.trim();if(!name)throw new Error('Yeni liste adı yaz.');const j=await api('/me/playlists',{method:'POST',body:JSON.stringify({name,public:false,description:'Murat Spotify Manager ile oluşturuldu'})});status('Yeni playlist oluşturuldu: '+j.name,'ok');$('newName').value='';await playlists();$('playlist').value=j.id}

async function findTrack(item,seen){for(const q of item[1]){const j=await api('/search?type=track&limit=5&q='+encodeURIComponent(q));const tracks=j.tracks?.items||[];for(const t of tracks){if(t?.uri&&!seen.has(t.uri))return t.uri}await sleep(120)}return null}
async function buildAnthology(){const id=$('playlist').value;if(!id)throw new Error('Önce “Klasik Türk Müziği Antolojisi” listesini seç.');$('anthology').disabled=true;const uris=[];const seen=new Set();let missing=0;try{for(let i=0;i<ANTHOLOGY.length;i++){status(`Antoloji hazırlanıyor: ${i+1}/${ANTHOLOGY.length}\n${ANTHOLOGY[i][0]}`);const uri=await findTrack(ANTHOLOGY[i],seen);if(uri){seen.add(uri);uris.push(uri)}else missing++;await sleep(300)}status(`${uris.length} kayıt bulundu. Spotify’a kronolojik sırayla yazılıyor...`);await replaceWith(id,uris);status(`Bitti. ${uris.length} kayıt kronolojik sırayla eklendi.${missing?` ${missing} başlık Spotify aramasında eşleşmedi.`:''}`,'ok');await playlists();$('playlist').value=id}catch(e){throw e}finally{$('anthology').disabled=false}}

async function boot(){try{const qs=new URLSearchParams(location.search);if(qs.get('error'))throw new Error('Spotify yetkisi reddedildi: '+qs.get('error'));if(qs.get('code')){status('Spotify bağlantısı tamamlanıyor...');await exchange(qs.get('code'))}if(store.get()){await profile();await playlists()}else status('Spotify’a bağlanarak başla.')}catch(e){status(e.message,'warn')}}
function safe(fn){return async()=>{try{await fn()}catch(e){status(e.message,'warn')}}}
$('connect').onclick=connect;$('disconnect').onclick=()=>{store.clear();$('who').textContent='Bağlı değil';$('playlist').innerHTML='<option value="">Önce Spotify\'a bağlan</option>';status('Bağlantı bu tarayıcıdan kaldırıldı.');};$('reload').onclick=safe(playlists);$('replace').onclick=safe(replaceAll);$('append').onclick=safe(appendAll);$('clear').onclick=safe(clearAll);$('create').onclick=safe(createPlaylist);$('anthology').onclick=safe(buildAnthology);$('items').addEventListener('input',updateCount);boot();
