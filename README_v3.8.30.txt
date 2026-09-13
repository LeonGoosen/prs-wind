WIND SIGHT PRS v3.8.30 — Shared Wind Input

PURPOSE
Use one shared shooter-wind summary as the source of truth for wind-speed values
shown inside each target's lower wind-input panel.

WHAT CHANGED
- The target's lower wind-speed boxes now reuse the exact same shared shooter record
  calculation already shown above the target.
- With saved condition windows, the boxes show LOW AVG / MEDIAN AVG / HIGH AVG.
- With no saved windows, they show the current/recorded MIN / AVG / MAX fallback.
- Target DOF is unchanged.
- The existing target-relative legacy angle is unchanged.
- Raw observed extremes and shared fixed-zero snapshot direction remain visible in
  the shared shooter record.
- The underlying firing-solution, probability, calibration, direction and hold
  calculation functions are unchanged.

EXAMPLE VERIFIED
Four saved windows:
  2 / 5 / 10 mph @ 100°
  5 / 8 / 18 mph @ 120°
  5 / 7 / 11 mph @ 130°
  2 / 5 / 16 mph @ 120°
Shared shooter record: 5.0 / 6.0 / 8.0 mph, raw extremes 2.0–18.0 mph,
snapshot FROM 119° (coherent).
Target lower wind-input boxes: the same 5.0 / 6.0 / 8.0 mph.
DOF remains 000° and the existing target-relative legacy angle remains 120° in the
verified fixture.

DATA / HISTORY
The display reads current stage data before freeze and the appropriate frozen
pre-shoot/completed record after freeze. It does not rewrite existing history.

DEPLOY
1. Export a populated JSON backup from the original Home Screen app and verify it.
2. Extract this ZIP and replace matching files in the existing repository root.
3. Keep the existing Worker, hostname, DNS and Cloudflare commands unchanged.
4. After successful deployment use DATA > CHECK APP UPDATE, then confirm v3.8.30.
5. Verify record counts, save/reopen and offline reopen.
Do not clear website data or delete the installed PWA.

TEST BOUNDARIES
Automated browser tests used system Chromium. Physical iPhone/Home-Screen PWA,
live Cloudflare deployment and native offline persistence still require device UAT.
