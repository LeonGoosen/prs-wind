WIND SIGHT PRS v3.8.2 — Wind-Hit Call Optimizer

CORE CHANGE
The shooter-facing WIND SIGHT CALL is now explicitly chosen to maximize WIND HIT
on 0.1 mil increments. The full 2-D impact model evaluates that exact selected call
as a secondary validation metric; it no longer silently chooses a different hold.

CALL CURVE
The BALLISTICS screen now includes an optional CALL CURVE diagnostic after solver
MIN/MAX holds exist. It shows nearby 0.1 mil candidate holds and their WIND HIT
percentages, highlighting the selected maximum. This makes it auditable that the
CALL is not merely the midpoint of MIN/MAX.

LIVE CALYPSO
When a live Calypso stream is stable, the speed posterior may narrow to the measured
recent variation. TREND and SHIFT states deliberately inflate uncertainty. A higher
WIND HIT is therefore earned only when the live evidence supports a tighter state.

OTHER
- Robust Hold is based on the WIND HIT plateau >=95% of the optimum.
- Confidence remains separate from hit probability.
- Live call hysteresis compares WIND HIT gain.
- Match-learning bias remains bounded and weighted.
- Shooter-facing holds remain one decimal.
