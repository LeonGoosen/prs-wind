WIND SIGHT PRS v3.8.24 — Field UI Polish

Deploy the extracted files to the existing repository root.
Keep the existing Worker, hostname, DNS and Cloudflare commands unchanged.

Changes in this release:
- Active-stage timer is session-scoped in the UI so stale persisted activation timestamps no longer display multi-hour/day timers after reopening the app.
- Legacy-model warnings are collapsed into a compact DETAILS disclosure by default.
- Saved wind-condition snapshot direction is interpreted conservatively:
  * SINGLE: one saved window.
  * COHERENT: resultant shown only when R >= 0.85 and maximum pairwise angle separation <= 45 degrees.
  * MIXED: no single angle is promoted; resultant shown only as contextual information when R >= 0.65 and separation <= 90 degrees.
  * VARIABLE: no single direction is shown.
- Saved MIN/MAX envelope behavior is unchanged.
- Legacy firing-solution mathematics are unchanged.

Before deployment, export a populated JSON backup. Do not clear Safari website data or delete the Home Screen app.
