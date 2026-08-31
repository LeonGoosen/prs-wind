PRS WIND — Easy Mode Engine Prototype v1

This build connects the locked fast workflow to a conservative calculation engine.

Implemented:
- Targets in meters / cm / DOF
- Target shape capture
- Calypso MIN / AVG / MAX / NOW + AVG/NOW direction
- Multiple downrange observation points
- Multiple observations per point
- Multiple target-zone observations
- User-calibrated Long Grass and Bush evidence
- Published/general Tree evidence
- Dust/Smoke/Mirage direction evidence
- Conservative evidence fusion and conflict detection
- Target-relative DOF geometry
- Expected Kestrel WD cross-check
- LOW/BEST/HIGH full-value-equivalent stage planning values
- Kestrel MIN/MAX hold return
- Safe hold window
- Deterministic probability optimization of wind hold
- WIND P(hit) (horizontal wind uncertainty only)
- Shooter Intel sanity check only
- Stage Card
- Local storage / resume
- Clock/degree angle wheel

Important limitation:
The build intentionally does NOT invent near/mid/far ballistic wind-region weights.
Kestrel/Applied Ballistics remains ballistic authority through the MIN/MAX hold inputs.
The current Wind P(hit) is a horizontal wind-only probability, not total rifle P(hit).
