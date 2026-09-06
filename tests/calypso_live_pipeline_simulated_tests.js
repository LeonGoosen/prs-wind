
const calypsoRuntime={battery:null,model:'UP10',firmware:'2.x',envSpeedMps:null,envDirDeg:null,lastError:'',diagnostics:{}};
let ingested=[];let diag=[];
function calDiag(x){diag.push(x);Object.assign(calypsoRuntime.diagnostics,x)}
function ingestCalypsoReading(speedMps,directionDeg,batteryMv,meta){ingested.push({speedMps,directionDeg,batteryMv,meta})}
function dv(bytes){const a=Uint8Array.from(bytes);return new DataView(a.buffer)}
function assert(c,m){if(!c)throw new Error(m)}
let pass=0;function t(n,f){try{f();console.log('PASS',n);pass++}catch(e){console.error('FAIL',n,e.message);process.exitCode=1}}
function packetHex(dv,max=20){if(!dv)return "";const a=new Uint8Array(dv.buffer,dv.byteOffset,dv.byteLength);return [...a.slice(0,max)].map(x=>x.toString(16).padStart(2,"0")).join(" ")}
function validateWind(speedMps,directionDeg,source){
 if(!Number.isFinite(speedMps)||speedMps<0||speedMps>60)throw new Error(`${source}: invalid wind speed ${speedMps}`);
 if(directionDeg!=null&&(!Number.isFinite(directionDeg)||directionDeg<0||directionDeg>360))throw new Error(`${source}: invalid wind direction ${directionDeg}`);
}
function decodeCalypsoMiniDataPacket(dv){
 if(!dv||dv.byteLength<5)throw new Error(`Mini 0x2A39 packet must be at least 5 bytes; received ${dv?.byteLength||0}`);
 const speedMps=dv.getUint16(0,true)/100,directionDeg=dv.getUint16(2,true),batteryRaw=dv.getUint8(4);
 validateWind(speedMps,directionDeg,"Mini 0x2A39");
 if(batteryRaw>10)throw new Error(`Mini 0x2A39 battery field out of range: ${batteryRaw}`);
 return {speedMps,directionDeg,batteryPercent:batteryRaw*10};
}
function decodeCalypsoEnvSpeed(dv){if(!dv||dv.byteLength<2)throw new Error("Mini 0x2A72 speed packet shorter than 2 bytes");const speedMps=dv.getUint16(0,true)/100;validateWind(speedMps,null,"Mini 0x2A72");return speedMps}
function decodeCalypsoEnvDirection(dv){if(!dv||dv.byteLength<2)throw new Error("Mini 0x2A73 direction packet shorter than 2 bytes");const directionDeg=dv.getUint16(0,true)/100;validateWind(0,directionDeg,"Mini 0x2A73");return directionDeg}
function decodeCalypsoLegacyPacket(dv){
 if(!dv||dv.byteLength<6)throw new Error("CUPS 4.0 packet shorter than 6 bytes");
 const speedMps=dv.getUint16(0,true)/100,directionDeg=dv.getUint16(2,true),batteryMv=dv.getUint16(4,true);validateWind(speedMps,directionDeg,"CUPS 4.0");
 if(batteryMv<1500||batteryMv>6000)throw new Error(`CUPS 4.0 battery millivolts out of range: ${batteryMv}`);
 return {speedMps,directionDeg,batteryMv};
}
function recordPacket(dv){calDiag({packetLength:dv?.byteLength??null,packetHex:packetHex(dv)})}
function onCalypsoMiniData(ev){try{const dv=ev.target.value;recordPacket(dv);const x=decodeCalypsoMiniDataPacket(dv);calypsoRuntime.battery=x.batteryPercent;ingestCalypsoReading(x.speedMps,x.directionDeg,null,{deviceName:calypsoRuntime.model,firmware:calypsoRuntime.firmware});calDiag({stage:"live",code:"LIVE_READINGS",message:"Valid Mini wind notifications received."})}catch(e){calypsoRuntime.lastError=e.message||String(e);calDiag({stage:"decode_failed",code:"MALFORMED_PACKET",message:calypsoRuntime.lastError})}}
function onCalypsoEnvSpeed(ev){try{const dv=ev.target.value;recordPacket(dv);calypsoRuntime.envSpeedMps=decodeCalypsoEnvSpeed(dv);ingestCalypsoReading(calypsoRuntime.envSpeedMps,calypsoRuntime.envDirDeg,null,{deviceName:calypsoRuntime.model,firmware:calypsoRuntime.firmware});calDiag({stage:"live",code:"LIVE_READINGS",message:"Valid Mini Environmental Sensing notifications received."})}catch(e){calypsoRuntime.lastError=e.message||String(e);calDiag({stage:"decode_failed",code:"MALFORMED_PACKET",message:calypsoRuntime.lastError})}}
function onCalypsoEnvDir(ev){try{const dv=ev.target.value;recordPacket(dv);calypsoRuntime.envDirDeg=decodeCalypsoEnvDirection(dv)}catch(e){calypsoRuntime.lastError=e.message||String(e);calDiag({stage:"decode_failed",code:"MALFORMED_PACKET",message:calypsoRuntime.lastError})}}
function onCalypsoLegacy(ev){try{const dv=ev.target.value;recordPacket(dv);const x=decodeCalypsoLegacyPacket(dv);ingestCalypsoReading(x.speedMps,x.directionDeg,x.batteryMv);calDiag({stage:"live",code:"LIVE_READINGS",message:"Valid CUPS 4.0 notifications received."})}catch(e){calypsoRuntime.lastError=e.message||String(e);calDiag({stage:"decode_failed",code:"MALFORMED_PACKET",message:calypsoRuntime.lastError})}}

t('2A39 handler feeds live pipeline',()=>{ingested=[];onCalypsoMiniData({target:{value:dv([0x39,0x02,0xCE,0x00,0x09])}});assert(ingested.length===1,'ingest count');assert(Math.abs(ingested[0].speedMps-5.69)<1e-9,'speed');assert(ingested[0].directionDeg===206,'dir');assert(calypsoRuntime.battery===90,'battery');assert(calypsoRuntime.diagnostics.code==='LIVE_READINGS','diag')});
t('Environmental handlers feed speed + referenced raw direction pipeline',()=>{ingested=[];onCalypsoEnvDir({target:{value:dv([0x78,0x50])}});onCalypsoEnvSpeed({target:{value:dv([0x39,0x02])}});assert(ingested.length===1,'ingest count');assert(Math.abs(ingested[0].speedMps-5.69)<1e-9,'speed');assert(Math.abs(ingested[0].directionDeg-206)<1e-9,'dir')});
t('Malformed Mini packet never enters live pipeline',()=>{ingested=[];onCalypsoMiniData({target:{value:dv([1,2,3])}});assert(ingested.length===0,'unexpected ingest');assert(calypsoRuntime.diagnostics.code==='MALFORMED_PACKET','diag')});
t('Legacy CUPS handler feeds live pipeline',()=>{ingested=[];onCalypsoLegacy({target:{value:dv([0x39,0x02,0xCE,0x00,0x0F,0x0D,0,0])}});assert(ingested.length===1,'ingest count');assert(ingested[0].batteryMv===3343,'battery mV')});
console.log(`RESULT ${pass}/4 PASS`);
