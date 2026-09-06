# WIND SIGHT PRS v3.8.6 — Calypso Calibration

## Added
- Dedicated CALYPSO CALIBRATION panel.
- Side-by-side comparison trials against a reference instrument (default Kestrel).
- Records Anemotracker damping as test context only.
- Conservative speed calibration: offset-only for narrow data; linear scale + offset only with >=3 trials and >=3 mph span, with a safety bound on scale.
- Circular direction-offset estimation.
- Quality states: INSUFFICIENT DATA, MARGINAL, VALIDATED.
- Calibration is OFF by default and only changes live readings after explicit enable.
- Raw speed/direction remain retained at runtime for diagnostics.
- Calibration values are included in copyable BLE diagnostics.
- WDOT-* identity is recognized as the Mini AB family and WDOT- is included in strict discovery.

## Validation policy
VALIDATED requires >=5 speed trials, >=5 mph observed speed span, speed RMSE <=0.5 mph, and if direction comparisons are supplied, direction residual <=5 degrees. These are WIND SIGHT acceptance thresholds, not manufacturer certification.

## Important
The Mini AB wind-data GATT service/characteristic remains physically unverified for the user's WDOT-93D48C device. v3.8.6 does not invent or decode an unknown wind service. Existing v3.8.5 Mini/CUPS protocol support remains unchanged.
