/* WIND SIGHT PRS v3.8.13 Report Clarity; Safari redirect hotfix retained.
 * Competition Core shell only. Never touches localStorage or IndexedDB.
 * No automatic skipWaiting. Explicit activation requires a sole requesting window.
 *
 * Cloudflare's default HTML handling can redirect /index.html -> /. Safari will
 * reject a redirected Response returned by a service worker for navigation.
 * This worker therefore caches and serves the canonical root URL only and never
 * places redirected responses in the versioned shell cache.
 */
const RELEASE='3.8.13';
const CACHE='wind-sight-v3813-report-clarity-1';
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
  if(new URL(url).href===ROOT){
    const text=await response.clone().text();
    if(!text.includes('const APP_VERSION="'+RELEASE+'"'))throw new Error('App-shell version mismatch. The existing offline version is retained; retry the update after deployment finishes.');
  }
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

/* Activation is explicit and rejected while any other scoped app window is open.
 * Cache installation still must finish before a waiting worker can receive this.
 * Never reload clients or touch profile/match storage from the service worker.
 */
self.addEventListener('message',event=>{
 const port=event.ports?.[0],reply=data=>{if(port)port.postMessage(data);};
 if(event.data?.type==='WSP_GET_VERSION'){reply({version:RELEASE,cache:CACHE});return;}
 if(event.data?.type!=='WSP_ACTIVATE_SAFELY')return;
 event.waitUntil((async()=>{
  try{
   const source=event.source;
   if(!source?.id){reply({ok:false,message:'A same-origin app window is required.'});return;}
   const client=await self.clients.get(source.id),url=client?.url?new URL(client.url):null;
   if(!url||url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname)){reply({ok:false,message:'The requesting page is outside this app.'});return;}
   if(event.data.expectedVersion!==RELEASE){reply({ok:false,message:'Downloaded version changed. Check for updates again.'});return;}
   const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
   const others=windows.filter(c=>{try{const u=new URL(c.url);return c.id!==source.id&&u.origin===BASE.origin&&u.pathname.startsWith(BASE.pathname);}catch(e){return false;}});
   if(others.length){reply({ok:false,message:'Close '+others.length+' other WIND SIGHT window(s) first. No update was forced.'});return;}
   reply({ok:true,version:RELEASE});await self.skipWaiting();
  }catch(e){reply({ok:false,message:'Activation could not be completed: '+e.message});}
 })());
});
