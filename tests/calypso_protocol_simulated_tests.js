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
function calypsoErrorInfo(e,stage="unknown"){
 const name=e?.name||"Error",msg=String(e?.message||e||"Unknown error"),m=msg.toLowerCase();
 let code="BLE_ERROR",label="Bluetooth error";
 if(name==="NotFoundError"){
   if(/cancel|dismiss|closed/.test(m)){code="SELECTION_CANCELLED";label="Device selection cancelled"}
   else if(/no.*device|not found|matching/.test(m)){code="NO_MATCHING_DEVICE";label="No matching device found"}
   else{code="NO_DEVICE_SELECTED";label="No device selected"}
 }else if(name==="NotAllowedError"||name==="SecurityError"||/permission|not allowed|denied/.test(m)){code="PERMISSION_DENIED";label="Bluetooth permission denied"}
 else if(stage.includes("connect")||name==="NetworkError"){code="CONNECTION_FAILED";label="GATT connection failed"}
 return {code,label,message:msg};
}

function dv(bytes){const a=Uint8Array.from(bytes);return new DataView(a.buffer)}
function assert(cond,msg){if(!cond)throw new Error(msg)}
let pass=0;
function t(name,fn){try{fn();console.log('PASS',name);pass++}catch(e){console.error('FAIL',name,e.message);process.exitCode=1}}
t('Mini 180D/2A39 sample decodes 5.69m/s 206deg 90%',()=>{const x=decodeCalypsoMiniDataPacket(dv([0x39,0x02,0xCE,0x00,0x09]));assert(Math.abs(x.speedMps-5.69)<1e-9,'speed');assert(x.directionDeg===206,'dir');assert(x.batteryPercent===90,'battery')});
t('Mini packet rejects short packet',()=>{let ok=false;try{decodeCalypsoMiniDataPacket(dv([1,2,3,4]))}catch(e){ok=true}assert(ok,'did not reject')});
t('Mini packet rejects impossible direction',()=>{let ok=false;try{decodeCalypsoMiniDataPacket(dv([0x39,0x02,0x91,0x01,0x09]))}catch(e){ok=true}assert(ok,'did not reject')});
t('Mini environmental speed 2A72 sample',()=>{assert(Math.abs(decodeCalypsoEnvSpeed(dv([0x39,0x02]))-5.69)<1e-9,'speed')});
t('Mini environmental direction 2A73 206deg sample',()=>{assert(Math.abs(decodeCalypsoEnvDirection(dv([0x78,0x50]))-206)<1e-9,'dir')});
t('Mini environmental direction 2A73 302deg sample',()=>{assert(Math.abs(decodeCalypsoEnvDirection(dv([0xF8,0x75]))-302)<1e-9,'dir')});
t('Legacy CUPS packet remains supported',()=>{const x=decodeCalypsoLegacyPacket(dv([0x39,0x02,0xCE,0x00,0x0F,0x0D,0,0]));assert(Math.abs(x.speedMps-5.69)<1e-9,'speed');assert(x.directionDeg===206,'dir');assert(x.batteryMv===3343,'battery mV')});
t('Legacy malformed battery rejected',()=>{let ok=false;try{decodeCalypsoLegacyPacket(dv([0x39,0x02,0xCE,0x00,0,0]))}catch(e){ok=true}assert(ok,'did not reject')});
t('Cancelled chooser classified',()=>{const x=calypsoErrorInfo({name:'NotFoundError',message:'User cancelled the requestDevice() chooser.'},'chooser');assert(x.code==='SELECTION_CANCELLED',x.code)});
t('No matching device classified',()=>{const x=calypsoErrorInfo({name:'NotFoundError',message:'No Bluetooth devices found matching filters'},'chooser');assert(x.code==='NO_MATCHING_DEVICE',x.code)});
t('Permission denied classified',()=>{const x=calypsoErrorInfo({name:'SecurityError',message:'Permission denied'},'chooser');assert(x.code==='PERMISSION_DENIED',x.code)});
t('Connection failure classified',()=>{const x=calypsoErrorInfo({name:'NetworkError',message:'GATT Server is disconnected'},'gatt_connect');assert(x.code==='CONNECTION_FAILED',x.code)});
console.log(`RESULT ${pass}/12 PASS`);
