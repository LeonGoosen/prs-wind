WIND SIGHT PRS v3.8.29 — Target Record Clarity

SCOPE
Read-only field-record presentation inside each target card. The existing firing,
probability, calibration, solver, storage and import implementations are unchanged.
This is not the requested integration of window summaries into a firing solution.

TARGET FIELD RECORD
Before a stage is frozen, the panel reads that stage's saved shooter windows.
LOW / MEDIAN / HIGH describe the window averages. Original MIN/MAX are retained
as raw extremes. The direction keeps its original shared zero reference; it is not
converted into a target-relative direction. Each target is explicitly labelled as
showing the same shared shooter record, not a target-local measurement.
One current window is shown only when no saved windows exist, with different labels.
After a pre-shoot/complete snapshot, the panel reads the appropriate frozen record.
Missing frozen data is not filled from later edits. Original records are not rewritten.

The existing legacy solver panel stays separate and uses exactly its existing
inputs. Capturing a new window updates the field-record panel, not that solver.
Known legacy-model limitations remain open; no scientific or competition sign-off
is given by this UI release. The field panel is not a recommendation of solver inputs.

INSTALL
1. Export a populated JSON backup from the ORIGINAL Home Screen app and verify it
   exists in Files/Downloads. Do not import the old empty Safari copy.
2. Extract this ZIP. Replace matching files at the existing repository root.
3. Retain existing Worker, hostname, DNS and Cloudflare build settings:
   Build: node build-cloudflare.cjs
   Deploy: npx wrangler deploy --config ./wrangler.jsonc --assets ./public
   Version: npx wrangler versions upload --config ./wrangler.jsonc --assets ./public
   Root: /
4. Wait for successful deployment. In the original app use DATA > CHECK APP UPDATE.
   Save first; close other app windows before applying. Confirm v3.8.29.
5. Check record counts, target field source, save/reopen, and offline reopen.
Do not delete the installed PWA or clear website data. No live deployment was made.

BASELINE
App HTML: supplied /mnt/data/work3828/index.html (v3.8.28).
Deployment scaffold and worker: last complete supplied v3.8.27 package.
The v3.8.28 update-flow HTML patch is retained byte-for-byte in its functions.
Worker version/cache identity and package metadata updated for this release.
The separately deployed v3.8.28 service-worker bytes were not supplied here, so no
byte-for-byte claim is made against those unseen bytes.

TEST BOUNDARIES
Real Chromium rendering via set_content with explicitly simulated storage/bootstrap.
Native-origin browser navigation was attempted but blocked by the environment.
Service-worker network/cache/client behaviour was simulated. No physical iPhone,
real installed update, live production-origin storage or native Files acceptance.
No new firing simulations and no inferred real-world probability validation.
