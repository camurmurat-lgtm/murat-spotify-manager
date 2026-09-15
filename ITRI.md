# Itrî secular selection

Static deployment: no package installation, server, new secret or build command.
Keep index.html and the JS files at the Vercel project root. Open the deployed
Manager, connect Spotify, select the owned playlist with the exact name
“Buhurizade Mustafa Itrî Seküler Eserler”, then use the Itrî button.
The button replaces content only after at least four distinct works qualify.
It does not rename the playlist, change its visibility or modify other builders.

## Repertoire sources (checked 2026-09-15)

- TRT: https://nota.trt.net.tr/Sanatci/buhrizde-mustafa-efendi-itr
  Nevâ Kâr and Tûtî-i Mûcize-gûyem; also distinguishes famous religious works.
- Türkan Alvan and M. Hakan Alvan:
  https://www.sabahulkesi.com/2023/04/03/buhurizade-mustafa-itrinin-neva-kari/
  Câm Lâ’lindir Senin, Her Gördüğü Perîye Gönül Mübtelâ Olur,
  Gamzen Ki Ola Sâkî, Dil-i Pür-ıztırâbım, Nevâ Kâr and Tûtî.
- Ministry of National Education, Türk Müziği:
  https://kitap.eba.gov.tr/panel/dosyalar/upload/111/0/U_0_15_02_2019_13_25_32_603.pdf
  Lists Nühüft peşrev and saz semaisi among secular works.

“Secular” follows the repertoire/form classification; poetic imagery alone is
not a religious-work classifier. The eight candidates are a curated subset,
not a claim that all surviving compositions are represented on Spotify.

## Matching and safety

No first-result, popularity or artist-only fallback. Require a curated title
alias AND explicit Itri in the track, artist or album metadata. Reject religious
terms, medleys, remixes, taksim, local/unplayable/restricted items. Spotify does
not expose a reliable composer field: album attribution is supporting metadata,
not musicological proof. Conservative false negatives are intentionally skipped.
One recording per work, deduplicated by URI; minimum four different works.

Only the deployed Vercel Manager browser makes Spotify writes, using its existing
PKCE login. Itri has a separate bounded transport so the other builders' retry
rules are preserved. Requests are sequential, spaced 2.6 seconds, with bounded
read retries and Retry-After handling (seconds or HTTP date). Long cooldowns are
stored and pause immediately; rerun the same button after the displayed time.
Cache is versioned, account/market scoped, expires after 24 hours and is freshly
validated on reuse. Missing matches are never cached as successful.

Before writing: check exact name, ownership, snapshot; save old URIs locally.
One PUT of at most eight items, never clear then append. No retry on ambiguous
write network/5xx failures. Rerunning reads actual contents and skips an already
applied identical replacement. Post-write read must match the planned URI order.
Spotify replacement provides no compare-and-swap: the final snapshot check
reduces but cannot eliminate a concurrent edit from another device. Avoid editing
the target concurrently. A Web Lock excludes other Itri runs on the same origin;
controls are disabled while running. Other tabs/devices can still run older tools.

LocalStorage keys: itri-result-v1:<playlist> contains selected/missing and state;
itri-backup-v1:<playlist> contains previous URIs and snapshot. No tokens in these
reports. For recovery, inspect the backup and use Manager's existing manual URI
replacement tool. Never automatically overwrite after a verification mismatch.

API references:
- https://developer.spotify.com/documentation/web-api/concepts/rate-limits
- https://developer.spotify.com/documentation/web-api/reference/reorder-or-replace-playlists-tracks

## Verification

Run `node --test tests/itri.test.cjs`. Tests mock Spotify and never write to it.
Run `node --check` for scripts loaded by index.html. The pre-existing unescaped
apostrophe in Al'York in yerli_v3.js is repaired without changing its repertoire.
Live catalog coverage and playlist counts require a connected Spotify session;
passing automated tests is not evidence that a live playlist was updated.
