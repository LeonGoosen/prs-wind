WIND SIGHT PRS v3.0 UX Rebuild
JavaScript syntax: /mnt/data/wind_sight_prs_v3_0_ux_rebuild/_check.js:386
function obsHTML(o,where,pi,oi){return `<div class="obs"><div class="cardhead"><strong>Observation ${oi+1}</strong><button class="btn danger small" onclick="removeObs('${where}',${pi},${oi})">REMOVE</button></div><div class="grid two"><label>Indicator<select id="oi_${where}_${pi}_${oi}" onchange="changeIndicator('${where}',${pi},${oi},this.value)">${Object.keys(behavior).map(x=>`<option ${x===o.indicator?"selected":""}>${x}</option>`).join("
