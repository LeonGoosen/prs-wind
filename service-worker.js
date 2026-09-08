/* WIND SIGHT PRS v3.8.11 — iOS Home Screen PWA data rescue worker.
 * Purpose: recover access to the isolated Home Screen web-app storage after
 * an older cached redirect response made Safari/WebKit reject navigations.
 *
 * CRITICAL DATA GUARANTEE: this worker NEVER reads, writes, clears, migrates,
 * or deletes localStorage or IndexedDB. It only replaces WIND SIGHT CacheStorage
 * entries and temporarily serves the read/export recovery page for app launches.
 *
 * This is a TEMPORARY rescue worker. After exporting the Home Screen app data,
 * redeploy the normal v3.8.11 Safari Hotfix worker before reopening the main app.
 */
const CACHE='wind-sight-pwa-rescue-1';
const BASE=new URL('./',self.location.href);
const ROOT_PATH=BASE.pathname;
const INDEX_PATH=new URL('index.html',BASE).pathname;
const RESCUE_URL=new URL('backup-before-update.html',BASE).href;

async function cleanRescueResponse(){
  const r=await fetch(new Request(RESCUE_URL,{cache:'reload',redirect:'error'}));
  if(!r.ok) throw new Error(`Rescue page fetch failed (${r.status})`);
  if(r.redirected) throw new Error('Refusing redirected rescue response');
  return r;
}

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    const response=await cleanRescueResponse();
    await cache.put(RESCUE_URL,response.clone());
    // Emergency recovery: activate immediately so the broken predecessor cannot
    // keep returning its cached redirected index.html response.
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const names=await caches.keys();
    await Promise.all(names
      .filter(name=>name.startsWith('wind-sight-')&&name!==CACHE)
      .map(name=>caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET') return;
  const url=new URL(request.url);
  if(url.origin!==BASE.origin) return;

  const isAppLaunch=request.mode==='navigate' &&
    (url.pathname===ROOT_PATH || url.pathname===INDEX_PATH || url.href===RESCUE_URL);
  if(!isAppLaunch) return;

  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const cached=await cache.match(RESCUE_URL);
    if(cached && !cached.redirected) return cached;
    return cleanRescueResponse();
  })());
});
