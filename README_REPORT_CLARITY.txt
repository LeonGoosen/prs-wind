WIND SIGHT PRS / ZEALTECH
v3.8.13 — Report Clarity

DEPLOY THIS APPLICATION PACKAGE, NOT THE EVIDENCE ZIP.

Scope
Read-only completed-record report, descriptive recorded weather, safe input
creation defaults, MIN CORRECTION label, and explicit app-shell update controls.
No new reverse inference from shots, projected/actual aiming comparison,
trajectory weighting, firing-solution changes or probability-model validation.
Existing legacy calculation report remains available, clearly unvalidated.

What the report means
- Committed completion snapshots are the authoritative source where present.
- Missing values are not fabricated from live edits, zeroes or model outputs.
- Legacy records without a frozen snapshot are visible but excluded from the
  headline weather and score aggregates.
- Daily means use saved shooter AVG entries once per completed stage, not NOW,
  target counts, duration weighting or reconstructed whole-range weather.
- RECORDED does not mean independently verified ACTUAL.
- Day follows the device's local completion date, not the match's scheduled date.
- Direction uses a circular mean only after confirming a common zero reference
  when combining multiple stage readings. Opposing vectors have no unique mean.
- Shooter, downrange and target observations remain distinct local records.
- New saved-target setup table sorts by distance without rearranging saved data.

New-record defaults
New targets: DOF 0 degrees; range quality LRF / confirmed. Duplicating a stage
creates new zero DOFs but does not rewrite the original stage. Existing range
quality selections and historical bearings are preserved. New observation rows
are checked USE but keep Unknown quality: an untouched row is not evidence.
The SHOOT change is the existing CORRECTION label to MIN CORRECTION only.
Verify defaulted information before using it; a default is not a measurement.

Safe deployment
1. Export a populated full JSON backup from the ORIGINAL Home Screen app.
   Confirm that the external file exists. Do not import an empty Safari copy.
2. Upload the extracted files to the same repository root, replacing matching
   files. Keep the Worker, hostname, PWA icon/manifest and browser data unchanged.
3. Keep Cloudflare settings:
   Build: node build-cloudflare.cjs
   Deploy: npx wrangler deploy --config ./wrangler.jsonc --assets ./public
   Version: npx wrangler versions upload --config ./wrangler.jsonc --assets ./public
   Root: /
4. After successful deployment, open the original app online and allow the
   update to download. Close all WIND SIGHT tabs/windows, including the Home
   Screen app, then reopen the SAME original icon. Verify v3.8.13 in its header.
   A successful server deployment alone does not establish which shell the
   phone is using. A phone still showing v3.8.11 has not passed this acceptance.
5. Verify records, report dates, known scores, numeric zero, and save/reopen;
   then verify an offline reopen after a complete online load.
6. From v3.8.13 onward DATA > CHECK APP UPDATE reports loaded/active/waiting
   versions. APPLY SAVED UPDATE requires explicit consent, a successful save,
   an unchanged saved-data boundary and no other in-scope app window. The new
   control is not available retroactively in an already cached v3.8.11 page.

DO NOT CLEAR WEBSITE DATA. DO NOT DELETE/REINSTALL THE HOME SCREEN APP.
Do not routinely deploy the temporary rescue worker. A blocked update is not
permission to erase data. Keep the independent JSON backup.

Verification scope
128 named targeted checks/test groups passed. Real Chromium DOM, but storage
and service-worker interfaces simulated. Real local asset builder was run.
Native browser navigation was blocked in this environment. No physical iPhone,
Safari/PWA, live Cloudflare deployment, actual user-record reconciliation or
ballistic-model sign-off is claimed. This is not a full-app UAT guarantee.
