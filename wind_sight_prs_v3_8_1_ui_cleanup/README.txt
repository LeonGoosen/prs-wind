WIND SIGHT PRS v3.8.1 — Accuracy Core + Calypso Instrument

Major scientific consistency and performance correction release. Calibration A/B/D is connected to the prediction engine, double wind-angle application is removed, frozen match snapshots are authoritative, Monte Carlo L/R ambiguity and distribution-based match learning are used, live calculations are accelerated, telemetry is separated to IndexedDB, and a standalone premium Calypso-only instrument screen is added.

See UAT_REPORT_v3.8.1.txt.


v3.8.1 UI cleanup:
- Calypso device management remains on CALYPSO screen; Live Stage uses a compact read-only sensor strip.
- Removed duplicate Stage Card from SHOOT.
- WIND HIT is now the primary probability metric; EST. IMPACT remains secondary until full impact calibration is empirically validated.
- Collapsed single-value ROBUST intervals (e.g. 0.8–0.8 R -> 0.8 R).
