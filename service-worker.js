/* Competition Core shell only. Never touches localStorage or IndexedDB.
 * No skipWaiting: updates must not interrupt an open stage or mix app versions.
 */
const CACHE='wind-sight-v3811-competition-core';
const SHELL=['./','./index.html','./manifest.webmanifest','./apple-touch-icon.png','./icon-192.png','./icon-512.png','./wind-sight-icon.png','./zealtech-transparent.png'];
const BASE=new URL('./',self.location.href);
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 // cache:'reload' bypasses stale HTTP cache during installation. A failed shell fetch
 // fails the install; the previous active version remains available.
 await cache.addAll(SHELL.map(path=>new Request(new URL(path,BASE),{cache:'reload'})));
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const names=await caches.keys();
 await Promise.all(names.filter(name=>name.startsWith('wind-sight-')&&name!==CACHE).map(name=>caches.delete(name)));
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==BASE.origin)return;
 const appNavigation=request.mode==='navigate'&&[BASE.pathname,new URL('index.html',BASE).pathname].includes(url.pathname);
 const shellPath=SHELL.find(path=>new URL(path,BASE).pathname===url.pathname);
 if(!appNavigation&&!shellPath)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  const canonical=appNavigation?new URL('index.html',BASE):new URL(shellPath,BASE);
  const cached=await cache.match(canonical.href);
  if(cached)return cached;
  // Cache eviction is possible. Fetch the actual request, but never populate a
  // versioned shell cache with a potentially newer, mixed-version response.
  return fetch(request);
 })());
});
