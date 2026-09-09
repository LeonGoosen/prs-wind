WIND SIGHT PRS
v3.8.14 — Daily Review

Scope
- Repairs historical correction writes so score/post-stage corrections cannot pull unrelated mutable values into committed history.
- Aligns Match Dashboard scoring with Reports: unscored stages are not silently treated as zero.
- Rejects malformed completion snapshots, impossible completion timestamps and score values outside 0–1,000,000 during import.
- Preserves numeric zero scores in completed-stage review.
- Rebuilds Reports into: executive day summary, stage timeline, conditions by location, near-to-far target history, and compact stage details.
- Target history shows saved projected hold and the final hold recorded for that completed stage, sorted near to far.
- Keeps shooter/downrange/target conditions separate. Different local wind speeds or directions are not automatically treated as errors.
- Labels observation-behaviour ranges as retrospective local inference/evidence; it does not pool those locations into one wind.
- Existing firing-solution, trajectory, calibration, live-fusion and hit-probability algorithms are unchanged.

Safe update
1. Export a populated JSON backup from the original Home Screen app and verify it exists.
2. Upload the extracted application files to the existing repository root.
3. Keep the existing Cloudflare Worker, URL, build/deploy commands and DNS.
4. After Cloudflare succeeds, use the existing app update flow or close all WIND SIGHT windows and reopen the same Home Screen icon.
5. Confirm v3.8.14 and your record counts. Do not clear website data or delete the installed PWA.
