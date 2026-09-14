WIND SIGHT PRS v3.8.31 — Ballistics Clarity

BASELINE
Built from the supplied v3.8.30 Shared Wind Input ZIP.

CHANGE
Ballistics now has one compact card per target:
- target name and distance;
- MIN / AVG / MAX wind, to one decimal, from the same v3.8.30 shared-record source;
- DOF degrees and the unchanged target-relative angle;
- Solver MIN hold and Solver MAX hold, using the original field IDs, input
  precision, capture, validation and save paths.
Duplicate shared/legacy panels, raw-extreme/coherence details, repeated explanatory
paragraphs, clock text and the Ballistics-only call-curve display were removed.
The original underlying functions, stored data and other screens are preserved.
A short source line makes clear when AVG means the median of saved averages.
Existing known-model warnings remain in a collapsed DETAILS disclosure.

NOT CHANGED
No model, firing solution, target-angle formula, wind-summary statistic, importer,
storage engine, record schema, frozen-history rule, or migration was changed.
Raw MIN/MAX and individual condition records are retained in the existing wind
records; they have only been removed from this duplicated Ballistics display.
The Production Guarded limitations remain open. This is not scientific model
validation or full-application/physical-phone acceptance.

DEPLOY
1. Export a populated JSON backup from the original Home Screen app and confirm
   it exists before updating.
2. Extract this ZIP and replace matching files at the existing repository root.
3. Keep Cloudflare settings, Worker, hostname and DNS unchanged:
   Build: node build-cloudflare.cjs
   Deploy: npx wrangler deploy --config ./wrangler.jsonc --assets ./public
   Version: npx wrangler versions upload --config ./wrangler.jsonc --assets ./public
   Root: /
4. After deployment, use DATA > CHECK APP UPDATE. Save before applying, close
   other WIND SIGHT windows and reopen the SAME original Home Screen icon.
5. Confirm v3.8.31, your records, both hold fields and offline reopening.
DO NOT clear website data, delete the installed app, or import an empty backup.

No live deployment or actual user data was changed while preparing this package.
