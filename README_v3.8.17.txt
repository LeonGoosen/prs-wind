WIND SIGHT PRS v3.8.17 — Observation Controls
9 September 2026

STATUS: LIMITED-SCOPE PATCH. NOT FULL APPLICATION OR SCIENTIFIC UAT ACCEPTANCE.

This package fixes observation-control integrity and environmental/historical
report presentation. It DOES NOT resolve the two HIGH live-model findings from
the v3.8.16 deep audit. No aiming, trajectory, calibration, live wind-fusion,
probability or next-stage correction algorithm is changed or tuned.

CHANGES
- USE off/on no longer upgrades Unknown quality to Clear. USE stays selected
  by default on added rows, but an untouched Unknown row remains inactive.
- Clear/Approximate and older saved angles survive USE toggles unchanged.
- Observation quality replaces Direction quality. It is explicitly a general
  rating, used for each evidence type the selected behaviour supports in the
  environmental review. Existing weighting rules and old values are unchanged.
  Old ratings were not retrospectively reassessed as speed-confidence ratings.
- Quality can be deliberately selected on speed-only rows too. Cannot-determine
  behaviours are labelled as supplying no usable evidence, not speed-only.
- Stage record timing replaces Recency. It is a gap relative to the most recent
  completed stage in the current selection, not actual observation freshness.
  No capture timestamps or time-decay weights are invented.
- The environmental display while correcting a completed stage now reads its
  committed completion snapshot. Later mutable weather is not shown as history.
- Report details and the environmental review explicitly disclose the unresolved
  live-model capability mismatch.

STILL UNRESOLVED
F01: Direction-only observations can still affect the legacy live speed model.
F02: Speed-only saved angles can still affect the legacy live direction model.
Those functions are unchanged. Do not interpret this patch as resolving them or
as scientific validation of the firing solution or its displayed probabilities.

PRESERVED
Schema 4; local and IndexedDB storage/recovery implementation; historical writer;
full backup/export/import implementation; shooter decimal capture; FROM/TO wheel;
new-target DOF 0 / Confirmed defaults; manual wind workflow; branded assets;
Safari canonical-root redirect protection; existing Cloudflare build settings.
The service-worker version and cache identity change only to deliver this release.

DEPLOYMENT
1. In the ORIGINAL Home Screen app that contains your data, export a populated
   JSON backup. Check the file exists separately before updating.
2. Extract this ZIP; upload its contents beside index.html in the existing
   repository root, replacing matching files. Do not upload an enclosing folder.
3. Retain the same Worker, hostname, DNS and working commands:
   Build:   node build-cloudflare.cjs
   Deploy:  npx wrangler deploy --config ./wrangler.jsonc --assets ./public
   Version: npx wrangler versions upload --config ./wrangler.jsonc --assets ./public
   Root:    /
4. After successful deployment use DATA > CHECK APP UPDATE in the existing app.
   Save before applying, close other WIND SIGHT windows, and use the same original
   Home Screen icon. Check v3.8.17 and your expected saved record counts.
5. Check online reopen, a saved edit/reopen, and an offline reopen on the actual
   phone. Physical iPhone/Safari/PWA tests have not been performed here.

Do not clear browser website data, delete the installed app, import the earlier
empty Safari backup, or use the temporary rescue worker for routine updates.

PACKAGING
build-cloudflare.cjs publishes only the nine runtime assets into public/.
README/checksum files and node_modules remain outside that public asset set.
This package contains no user data and no credentials. No live system was changed.
