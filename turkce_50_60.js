/* Türkçe 1950-1959 — sıkı kürasyon
   Batı müziği temelli Türkçe popüler müzik.
   Sanat müziği, fantezi, arabesk yok. Sayı doldurmak için parça eklenmez.
   Cahit Oben — Halimem (1965), kullanıcı isteğiyle tek tarih dışı istisnadır.
*/

const TR50_PLAYLIST = "Türkçe 1950-1959";

/* Spotify'da tek tek doğrulanmış kayıtlar.
   Tarih omurgası: 1950'ler. */
const TR50_CORE = [
  { artist:"Celal İnce", title:"Kalbim Yalnız Seni Sevecek", uri:"spotify:track:4qwJYsiydtvCXbToB3vnEU" },
  { artist:"Celal İnce", title:"Bekleyeceğim", uri:"spotify:track:7nzuux6RxCCjUhQQ3j05yO" },

  { artist:"Zehra Eren", title:"Aşk Denizi", uri:"spotify:track:6dFOuPhpLh7RZZFZPfbXTy" },
  { artist:"Zehra Eren", title:"Dinle Sevgili", uri:"spotify:track:3ntsf3bw7KPu3UkLOZ8c3E" },

  { artist:"Şecaattin Tanyerli", title:"Yüzünde Göz İzleri Var", uri:"spotify:track:6Szk3gouCZq38dYqKg1saM" },
  { artist:"Şecaattin Tanyerli", title:"Beyaz Zambak", uri:"spotify:track:5Pm9hgRL9DrL3CuiV4UtgC" },

  { artist:"Dario Moreno", title:"Ali (Entarisi Ala Benziyor)", uri:"spotify:track:4jzZaq2gVdyxUn11hMyUSm" },
  { artist:"Dario Moreno", title:"Kalenin Bedenleri", uri:"spotify:track:3Az0krJ194BFmAjjY3EFw7" }
];

function tr50Norm(s=''){
  return String(s).toLocaleLowerCase('tr-TR').normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'').replace(/ı/g,'i')
    .replace(/[^a-z0-9]+/g,' ').trim();
}

function tr50Report(t, cls=''){
  const el = $('tr5060-report');
  if(el){ el.className = 'status ' + cls; el.textContent = t; }
  status(t, cls);
}

async function tr50FindHalimem(){
  const queries = [
    'track:Halimem artist:Cahit Oben',
    'track:Halime artist:Cahit Oben',
    '"Hoppalıvık Halimem" "Cahit Oben"',
    'Cahit Oben Halimem'
  ];
  for(const q of queries){
    const j = await api('/search?type=track&limit=10&q=' + encodeURIComponent(q));
    for(const t of (j.tracks?.items || [])){
      const artists = (t.artists || []).map(a => tr50Norm(a.name));
      const name = tr50Norm(t.name);
      const artistOK = artists.some(a => a === 'cahit oben' || a.includes('cahit oben'));
      const titleOK = name.includes('halim');
      if(t.uri && artistOK && titleOK) return t.uri;
    }
    await sleep(120);
  }
  return null;
}

async function tr50EnsurePlaylist(){
  await playlists();
  const sel = $('playlist');
  const accepted = new Set([
    tr50Norm("Türkçe 1950-1959"),
    tr50Norm("Türkçe 50'ler"),
    tr50Norm("Türkçe 50'ler & 60'lar")
  ]);

  const opt = [...sel.options].find(o => {
    const clean = (o.textContent || '').replace(/\s*\(\d+\)\s*$/,'');
    return accepted.has(tr50Norm(clean));
  });

  if(opt){
    sel.value = opt.value;
    /* Eski deneme adları varsa aynı playlist'i yeniden kullan ve adını düzelt. */
    try{
      await api('/playlists/' + opt.value, {
        method:'PUT',
        body:JSON.stringify({
          name:TR50_PLAYLIST,
          description:"1950-1959 Batı müziği temelli Türkçe popüler müzik seçkisi. Sanat müziği, fantezi ve arabesk yok. Cahit Oben — Halimem (1965) yalnızca kullanıcı isteğiyle tarih dışı istisnadır."
        })
      });
    }catch(_){}
    return opt.value;
  }

  tr50Report('“' + TR50_PLAYLIST + '” playlisti oluşturuluyor...');
  const j = await api('/me/playlists',{
    method:'POST',
    body:JSON.stringify({
      name:TR50_PLAYLIST,
      public:false,
      description:"1950-1959 Batı müziği temelli Türkçe popüler müzik seçkisi. Sanat müziği, fantezi ve arabesk yok. Cahit Oben — Halimem (1965) yalnızca kullanıcı isteğiyle tarih dışı istisnadır."
    })
  });
  await playlists();
  $('playlist').value = j.id;
  return j.id;
}

async function buildTR5060(){
  const btn = $('tr5060');
  btn.disabled = true;
  try{
    const id = await tr50EnsurePlaylist();

    const uris = TR50_CORE.map(x => x.uri);
    tr50Report('8 doğrulanmış 1950’ler kaydı hazır. Cahit Oben — Halimem için Spotify kataloğu kontrol ediliyor...');

    const halimem = await tr50FindHalimem();
    if(halimem) uris.push(halimem);

    tr50Report(uris.length + ' kayıt tek playlist olarak yazılıyor...');
    await replaceWith(id, uris);

    const note = halimem
      ? ' Cahit Oben — Halimem de tek tarih dışı istisna olarak eklendi.'
      : ' Cahit Oben — Halimem için Spotify’da güvenli orijinal eşleşme bulunamadı; yanlış bir cover koymadım.';

    tr50Report(
      'Bitti. ' + uris.length + ' kayıt. Sayı doldurma yok; yalnızca doğrulanmış 1950’ler omurgası.' + note,
      'ok'
    );

    await playlists();
    $('playlist').value = id;
  } catch(e){
    tr50Report(e.message, 'warn');
    throw e;
  } finally {
    btn.disabled = false;
  }
}

window.addEventListener('load', () => {
  const btn = $('tr5060');
  if(btn) btn.onclick = safe(buildTR5060);
});
