WIND SIGHT PRS v3.8.11 — Safari Service Worker Hotfix
Date: 2026-09-08

Purpose
-------
Fix iOS Safari error:
  “Safari can’t open the page. Response served by service worker has redirections.”

Root cause
----------
The previous service worker cached /index.html. Cloudflare Workers Static Assets uses
canonical HTML handling that can redirect /index.html to /. Safari rejects a redirected
Response when it is returned by a service worker for navigation.

Changes
-------
1. service-worker.js
   - New cache: wind-sight-v3811-safari-hotfix-1
   - Caches the canonical root URL (/) rather than /index.html.
   - Never stores or serves a redirected shell response.
   - Direct /index.html navigations are answered with the non-redirected canonical root.
   - Does not touch localStorage or IndexedDB.

2. wrangler.jsonc
   - Keeps Worker name prs-wind and compatibility date 2026-09-08.
   - Sets assets.html_handling to "none" so /index.html is served directly, not redirected.
   - Sets assets.not_found_handling to "single-page-application" so / serves index.html with 200.

3. backup-before-update.html
   - Existing read/export functions preserved.
   - Adds a Safari recovery button that unregisters only the service worker at this app scope
     and deletes only cache names beginning wind-sight-.
   - It does NOT clear localStorage and does NOT delete IndexedDB.

Application code
----------------
index.html and the application calculation/data logic are unchanged from the supplied v3.8.11.
Visible app version remains v3.8.11.

Cloudflare settings
-------------------
Build command:
  node build-cloudflare.cjs

Deploy command:
  npx wrangler deploy --config ./wrangler.jsonc --assets ./public

Version command:
  npx wrangler versions upload --config ./wrangler.jsonc --assets ./public

Root directory:
  /

Recovery after successful deployment
------------------------------------
1. In normal Safari open:
   https://prs-wind.leogoos.workers.dev/backup-before-update.html
2. READ SAVED COPIES.
3. Export at least one readable current copy and confirm the JSON file exists in Files/Downloads.
4. Press REPAIR SAFARI & REOPEN APP.
5. The utility removes only the offline service-worker/cache layer and opens the canonical root.
6. Confirm WIND SIGHT PRS v3.8.11 opens and your rifle/ammo/match data are present.

DO NOT clear Safari website data or delete the PWA before performing the backup/recovery step.
