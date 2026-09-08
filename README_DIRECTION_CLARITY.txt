WIND SIGHT PRS / ZEALTECH
v3.8.12 - Direction Clarity

RELEASE SCOPE
This is a wind-direction interface and explanatory-label update, not a new
ballistic, spatial-wind, confidence or hit-probability calculation model.
The existing aiming and probability algorithms are unchanged and unvalidated.
The previously identified speed-only/direction-only cross-use, pooled-direction
interpretation, spatial-weighting and probability-model issues are not repaired
by this release. The UI labels make these limitations explicit.

WHAT CHANGED
- Wind wheels retain clock faces and now show both WIND FROM and MOVING TO.
- Shooter AVG/NOW: edit FROM; TO is a linked read-only display.
- Observation: edit MOVING TO; FROM is a linked read-only display.
- One arrow shows actual movement, from tail (FROM) to arrowhead (TO).
- Clock marks include degrees. Labels use the same fixed zero, not an inferred
  compass north or a silently changed target reference.
- DOF retains a distinct bearing-only wheel; no FROM/TO wind conversion there.
- Inline direction fields show both conventions as well.
- Blank means not entered; it is not silently changed to 000 degrees.
- CANCEL discards wheel edits; DONE applies only a deliberately edited angle.
- Local readings remain identified by location. Notices explicitly state that
  different local wind speeds/directions can all be valid.
- Legacy model outputs are identified as unvalidated. Different local winds
  are not described as proof of a bad observation.

EXISTING DATA
There is no schema change and no automatic re-interpretation of saved angles.
Previously saved TO 88 stays TO 88; it displays the equivalent FROM 268.
This cannot determine whether you historically intended a saved TO value to mean
FROM. Review questionable old entries; nothing is silently flipped by 180 degrees.
Normal saves still update timestamps/version metadata as in the existing app.

DEPLOYMENT - SAME WORKER, HOSTNAME AND ORIGINAL HOME SCREEN APP
1. In the original Home Screen app where the populated data is visible, export
   a full JSON backup. Verify the file exists in Files/Downloads and keep a
   separate copy. Do not import the earlier empty Safari-browser copies.
2. Extract this ZIP and upload its contents to the existing repository root,
   replacing matching files. Keep these existing Cloudflare commands:
   Build:   node build-cloudflare.cjs
   Deploy:  npx wrangler deploy --config ./wrangler.jsonc --assets ./public
   Version: npx wrangler versions upload --config ./wrangler.jsonc --assets ./public
   Root:    /
   The included Wrangler config and build helper are unchanged from the working
   Safari hotfix. The builder publishes 9 application assets, not node_modules.
3. After successful Cloudflare deployment, open the original Home Screen app
   online, allow it to check for the update, then close all open instances and
   reopen the same icon. Confirm v3.8.12 and your populated records. Because the
   production worker does not force activation, an older client can hold an
   update waiting. Do not delete the app or clear website data.

This is the normal production service worker, not the temporary rescue worker.
Do not run the Safari repair control as a routine update step.
Do not change DNS, hostnames, start_url, manifest identity or storage settings.

DEVICE ACCEPTANCE STILL REQUIRED
Check FROM/TO labels, drag and exact typing, CANCEL/DONE, original data counts,
a save/close/reopen, and an offline reopen after a complete online load.
No physical iPhone/Safari/PWA or live Cloudflare deployment was tested here.
Automated UI checks used Chromium and simulated storage/SW registration. The
service-worker checks simulated lifecycle and network boundaries separately.
Automated engineering checks are not scientific model or competition sign-off.
