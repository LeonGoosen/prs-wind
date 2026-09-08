WIND SIGHT PRS v3.8.11 — Input Stability
ZealTech

Standalone static web app, NOT a WordPress plugin. No build step is required.

CHANGED: fixed autosave status footprint; Confirmed hides and disables both
range/size uncertainty contributions; explicit added observations auto-tick USE.
Untouched placeholder observations remain non-contributing.

IMPORTANT: the underlying WIND HIT statistical distribution has NOT been
replaced. The user-reported 50% WIND HIT / 32% IMPACT scenario is not yet verified
against the actual saved stage. Read QA_REPORT_v3.8.11.txt for the math review.
This is not an empirically calibrated hit-probability or physical-phone sign-off.

UPDATE
1. Export your existing full JSON backup and verify it exists independently.
2. Deploy ALL extracted files to the SAME existing app project and URL.
3. Open online, allow the update to load, close old app tabs/PWA windows and
   reopen. Confirm v3.8.11 in the visible header.
4. Check profiles/matches, try typing and switching target quality, verify a
   save/reopen, and test the actual phone offline after a complete online load.
Do not clear website storage, uninstall the PWA or change the hostname to update.

Existing localStorage and IndexedDB keys/schema are preserved. This update does
not reconstruct calibration values that an older version previously misassigned.
