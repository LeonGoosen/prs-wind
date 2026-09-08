/* WIND SIGHT PRS v3.8.12 Direction Clarity; Safari redirect hotfix retained.
 * Competition Core shell only. Never touches localStorage or IndexedDB.
 * No skipWaiting: updates must not interrupt an open stage or mix app versions.
 *
 * Cloudflare's default HTML handling can redirect /index.html -> /. Safari will
 * reject a redirected Response returned by a service worker for navigation.
 * This worker therefore caches and serves the canonical root URL only and never
 * places redirected responses in the versioned shell cache.
 */
const CACHE='wind-sight-v3812-direction-clarity-1';
const BASE=new URL('./',self.location.href);
const ROOT=BASE.href;
const INDEX_PATH=new URL('index.html',BASE).pathname;
const SHELL=[
  ROOT,
  new URL('manifest.webmanifest',BASE).href,
  new URL('apple-touch-icon.png',BASE).href,
  new URL('icon-192.png',BASE).href,
  new URL('icon-512.png',BASE).href,
  new URL('wind-sight-icon.png',BASE).href,
  new URL('zealtech-transparent.png',BASE).href
];

async function fetchClean(url,cacheMode='reload'){
  const response=await fetch(new Request(url,{cache:cacheMode,redirect:'error'}));
  if(!response.ok)throw new Error(`Shell fetch failed: ${new URL(url).pathname} (${response.status})`);
  if(response.redirected)throw new Error(`Refusing redirected shell response: ${new URL(url).pathname}`);
  return response;
}

self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  // Do not cache /index.html. Cache only the canonical root document and
  // non-HTML assets so Safari is never handed a cached redirect response.
  for(const url of SHELL){
    const response=await fetchClean(url,'reload');
    await cache.put(url,response.clone());
  }
})()));

self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const names=await caches.keys();
  await Promise.all(names.filter(name=>name.startsWith('wind-sight-')&&name!==CACHE).map(name=>caches.delete(name)));
  await self.clients.claim();
})()));

self.addEventListener('fetch',event=>{
  const request=event.request;
  const url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==BASE.origin)return;

  const appNavigation=request.mode==='navigate'&&(url.pathname===BASE.pathname||url.pathname===INDEX_PATH);
  if(appNavigation){
    event.respondWith((async()=>{
      const cache=await caches.open(CACHE);
      const cached=await cache.match(ROOT);
      if(cached&&!cached.redirected)return cached;
      // Always fetch the canonical root; never return a redirecting /index.html response.
      return fetchClean(ROOT,'no-store');
    })());
    return;
  }

  const canonical=SHELL.find(item=>new URL(item).pathname===url.pathname);
  if(!canonical)return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const cached=await cache.match(canonical);
    if(cached&&!cached.redirected)return cached;
    return fetchClean(canonical,'no-store');
  })());
});
