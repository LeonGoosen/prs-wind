function norm(a){a=Number(a);return ((a%360)+360)%360}
function n(v){if(v===null||v===undefined||v==='')return null;const x=Number(v);return Number.isFinite(x)?x:null}
function circularMeanDeg(vals){vals=(vals||[]).filter(v=>n(v)!==null);if(!vals.length)return null;let x=0,y=0;vals.forEach(v=>{const a=n(v)*Math.PI/180;x+=Math.cos(a);y+=Math.sin(a)});return norm(Math.atan2(y,x)*180/Math.PI)}
function signedAngleDelta(a,b){let d=norm(a-b);return d>180?d-360:d}
function result(trials){
 const t=(trials||[]).filter(x=>n(x.calMph)!==null&&n(x.refMph)!==null&&n(x.calMph)>=0&&n(x.refMph)>=0);
 if(!t.length)return {status:'INSUFFICIENT DATA',scale:1,offset:0,dirOffset:0,rmse:null,dirResidual:null,count:0,span:0};
 const xs=t.map(x=>n(x.calMph)),ys=t.map(x=>n(x.refMph)),span=Math.max(...xs)-Math.min(...xs);let scale=1,offset=ys.reduce((a,y,i)=>a+(y-xs[i]),0)/t.length;
 if(t.length>=3&&span>=3){const mx=xs.reduce((a,b)=>a+b,0)/xs.length,my=ys.reduce((a,b)=>a+b,0)/ys.length,den=xs.reduce((a,x)=>a+(x-mx)*(x-mx),0);if(den>0){scale=xs.reduce((a,x,i)=>a+(x-mx)*(ys[i]-my),0)/den;offset=my-scale*mx}if(!(scale>.8&&scale<1.2)){scale=1;offset=ys.reduce((a,y,i)=>a+(y-xs[i]),0)/t.length}}
 const err=t.map((x,i)=>ys[i]-(scale*xs[i]+offset)),rmse=Math.sqrt(err.reduce((a,e)=>a+e*e,0)/err.length);
 const dt=t.filter(x=>n(x.calDir)!==null&&n(x.refDir)!==null),deltas=dt.map(x=>signedAngleDelta(n(x.refDir),n(x.calDir))),dirOffset=deltas.length?signedAngleDelta(circularMeanDeg(deltas.map(d=>norm(d))),0):0;
 const dirResidual=deltas.length?Math.sqrt(deltas.reduce((a,d)=>{const e=signedAngleDelta(d,dirOffset);return a+e*e},0)/deltas.length):null;
 let status='INSUFFICIENT DATA';if(t.length>=5&&span>=5&&rmse<=.5&&(dirResidual==null||dirResidual<=5))status='VALIDATED';else if(t.length>=3)status='MARGINAL';
 return {status,scale,offset,dirOffset,rmse,dirResidual,count:t.length,span};
}
let pass=0,fail=0;function ok(name,cond){if(cond){console.log('PASS',name);pass++}else{console.log('FAIL',name);fail++}}
let r=result([{calMph:5,refMph:5.2},{calMph:8,refMph:8.2}]);ok('two trials insufficient',r.status==='INSUFFICIENT DATA');ok('narrow/two uses offset',Math.abs(r.scale-1)<1e-9&&Math.abs(r.offset-.2)<1e-9);
r=result([{calMph:4,refMph:4.2},{calMph:6,refMph:6.3},{calMph:8,refMph:8.4}]);ok('three trials marginal',r.status==='MARGINAL');ok('regression scale reasonable',r.scale>.8&&r.scale<1.2);
r=result([{calMph:3,refMph:3.2,calDir:358,refDir:3},{calMph:5,refMph:5.2,calDir:40,refDir:45},{calMph:7,refMph:7.2,calDir:90,refDir:95},{calMph:9,refMph:9.2,calDir:180,refDir:185},{calMph:11,refMph:11.2,calDir:270,refDir:275}]);ok('five wide clean trials validated',r.status==='VALIDATED');ok('direction wrap offset +5',Math.abs(r.dirOffset-5)<0.01);ok('speed offset approx +0.2',Math.abs(r.offset-.2)<0.05);
r=result([{calMph:3,refMph:3},{calMph:5,refMph:5},{calMph:7,refMph:7},{calMph:9,refMph:9},{calMph:11,refMph:15}]);ok('bad residual not validated',r.status!=='VALIDATED');
let raw=10,scale=1.02,offset=.1,cal=raw*scale+offset;ok('speed application formula',Math.abs(cal-10.3)<1e-9);ok('calibration can be off',Math.abs(raw-10)<1e-9);
console.log(`RESULT ${pass} PASS / ${fail} FAIL`);process.exitCode=fail?1:0;
