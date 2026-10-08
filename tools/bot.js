const load=require('./harness');
const fs=require('fs');
const {T,canvas}=load();
const {G,P,inp}=T;
function look(seg0,n){let m=0;for(let i=0;i<n;i++){const s=T.segs[Math.min(T.segs.length-1,seg0+i)];m=Math.max(m,Math.abs(s.curve))}return m}
function blockInfo(x,pz,hor){
  let best=null;
  for(const c of G.traffic){const dz=c.z-pz;if(dz>-200&&dz<hor&&Math.abs(c.x-x)<.5&&(!best||dz<best.dz))best={k:'car',dz:Math.round(dz),x:+c.x.toFixed(2)}}
  for(const o of G.obs){if(o.knock)continue;const dz=o.z-pz;if(dz>-200&&dz<hor&&Math.abs(o.x-x)<(o.w+.22)/2+.1&&(!best||dz<best.dz))best={k:o.type,dz:Math.round(dz),x:+o.x.toFixed(2)}}
  return best;
}
// distance (in player travel) until the first thing that would hit a bike centred at x; cars that pull away don't count
function blockD(x,pz,hor,tight,v){
  const cm=tight?.41:.5,om=tight?.05:.1;
  let d=hor;
  for(const c of G.traffic){const dz=c.z-pz;if(dz>-200&&dz<hor&&Math.abs(c.x-x)<cm){
    const rel=v-c.speed;const eff=rel>300?Math.max(0,dz)*v/rel:1e9;if(eff<d)d=eff}}
  for(const o of G.obs){if(o.knock)continue;const dz=o.z-pz;if(dz>-200&&dz<d&&Math.abs(o.x-x)<(o.w+.22)/2+om)d=Math.max(0,dz)}
  return d;
}
function blockInfo(x,pz,hor){
  let best=null;
  for(const c of G.traffic){const dz=c.z-pz;if(dz>-200&&dz<hor&&Math.abs(c.x-x)<.5&&(!best||dz<best.dz))best={k:'car',dz:Math.round(dz),x:+c.x.toFixed(2)}}
  for(const o of G.obs){if(o.knock)continue;const dz=o.z-pz;if(dz>-200&&dz<hor&&Math.abs(o.x-x)<(o.w+.22)/2+.1&&(!best||dz<best.dz))best={k:o.type,dz:Math.round(dz),x:+o.x.toFixed(2)}}
  return best;
}
// distance (in player travel) until the first thing that would hit a bike centred at x; cars that pull away don't count
function blockD(x,pz,hor,margin,v){
  let d=hor;
  for(const c of G.traffic){const dz=c.z-pz;if(dz>-200&&dz<hor&&Math.abs(c.x-x)<.40+margin){
    const rel=v-c.speed;const eff=rel>300?Math.max(0,dz)*v/rel:1e9;if(eff<d)d=eff}}
  for(const o of G.obs){if(o.knock)continue;const dz=o.z-pz;if(dz>-200&&dz<d&&Math.abs(o.x-x)<(o.w+.22)/2+.06+margin)d=Math.max(0,dz)}
  return d;
}
let tgtLane=.5;
function bot(opts){
  const pz=T.pzOf(),v=Math.max(G.speed,2500),hor=v*(opts.look||2.4);
  const cur=blockD(tgtLane,pz,hor,false,v);
  if(cur<hor*.85){
    const a=blockD(-.5,pz,hor,false,v),b=blockD(.5,pz,hor,false,v);
    let best=a>b?-.5:.5,bd=Math.max(a,b);
    if(bd<v*1.3&&!opts.noSqueeze){ // both lanes shut: look for a gap between things
      for(const x of [0,-.8,.85,-.25,.25]){const d=blockD(x,pz,hor,true,v);if(d>bd+1500){bd=d;best=x}}
    }
    if(bd>cur+800)tgtLane=best;
  }
  inp.drag=Math.max(-1,Math.min(1,(tgtLane-P.x)*5));
  const si=Math.floor(pz/T.SEG);
  const cf=T.STAGE.cf;
  const BK=T.BIKES[T.SAVE.bike]||T.BIKES[0];
  const c=look(si,40)*cf;
  const GR=[.6,.8,1,1.2,1.4];
  const Rr=g=>{const sp0=7500*GR[g]/12000,sp=sp0*BK.spd;return sp0*sp0*c/(BK.cor*Math.max(.6,Math.min(1.2,.45+sp))*(1+(BK.cor-1)*.6))};
  let want=4;if(opts.gear!==undefined)want=opts.gear;else{while(want>1&&Rr(want)>(opts.thr||2.0))want--}
  if(P.gear<want)T.doGear(1);else if(P.gear>want)T.doGear(-1);
  if(P.tanks>0&&P.nitroT<=0&&look(si,125)<1.2&&!(opts.noNitro))T.doNitro();
}
function run(opts,snap){
  opts=opts||{};
  T.SAVE.bike=opts.bike||0;
  if(opts.stage!==undefined&&opts.stage!==T.SEL)T.swapStage(opts.stage);
  T.startRace();tgtLane=.5;const dt=1/60;let f=0;
  const snaps=snap||{};const counted=new WeakSet();let hits=0,police=0,maxPress=0,lastPol=false;const ring=[];let minGap=999;let scr=0;const gt=[0,0,0,0,0];
  for(;f<60*260;f++){
    bot(opts);T.update(dt);
    if(f%45===0||snaps[f]){T.render();T.updateHud()}
    if(snaps[f]){fs.writeFileSync(snaps[f]+'.png',canvas.toBuffer('image/png'))}
    const pz=T.pzOf();
    if(P.scrape)scr++;if(G.mode==='playing')gt[P.gear]++;
    if(opts.debug){const hor=Math.max(G.speed,2500)*2.4;ring.push({t:+G.t.toFixed(2),x:+P.x.toFixed(2),tl:tgtLane,v:Math.round(G.speed),g:P.gear,L:blockInfo(-.5,pz,hor),R:blockInfo(.5,pz,hor),cur:T.segAt(pz).curve.toFixed(1),inv:+P.inv.toFixed(1)});if(ring.length>100)ring.shift()}
    for(const o of G.obs){if(o.knock&&!counted.has(o)&&o.kt>.3&&Math.abs(o.z-pz)<350&&Math.abs(o.x-P.x)<.7){counted.add(o);hits++;if(opts.debug)opts.debug.push({type:o.type,ox:+o.x.toFixed(2),at:[ring[ring.length-1],ring[Math.max(0,ring.length-30)],ring[Math.max(0,ring.length-60)],ring[0]]})}}
    if(G.police&&!lastPol)police++;lastPol=!!G.police;
    if(G.police&&G.police.gap<minGap)minGap=G.police.gap;
    if(G.police&&G.police.press>maxPress)maxPress=G.police.press;
    if(opts.trace)opts.trace(f);
    if(G.mode==='result')break;
    if(opts.until&&f>=opts.until)break;
  }
  return {bike:T.SAVE.bike,st:T.SEL+1,mode:G.mode,t:G.res?+G.res.time.toFixed(1):+G.t.toFixed(1),rank:G.res?G.res.rank:0,why:G.why,hearts:P.hearts,obsHits:hits,near:P.near,drafted:+P.drafted.toFixed(1),esc:G.escN,pol:police,maxPress:+maxPress.toFixed(2),minGap:Math.round(minGap),tips:G.res?G.res.tip:0,scr:+(scr/60).toFixed(1),gear:gt.map(x=>Math.round(x/60)).join('/'),riv:G.rv.map(r=>r.fin===null?'-':+r.fin.toFixed(0)).join(',')};
}
module.exports={run,T,G,P,canvas};
if(require.main===module){
  const N=+process.argv[2]||6, only=process.argv[3]!==undefined?+process.argv[3]:-1;
  const opts=process.argv[4]?JSON.parse(process.argv[4]):{};
  for(let st=0;st<T.STAGES.length;st++){
    if(only>=0&&st!==only)continue;
    const res=[];
    for(let i=0;i<N;i++)res.push(run(Object.assign({stage:st},opts)));
    for(const r of res)console.log(JSON.stringify(r));
    const fin=res.filter(r=>r.rank>0);
    console.log(`== stage ${st+1} ${T.STAGES[st].name}: finished ${fin.length}/${N} avgRank ${(fin.reduce((a,r)=>a+r.rank,0)/Math.max(1,fin.length)).toFixed(2)} avgT ${(fin.reduce((a,r)=>a+r.t,0)/Math.max(1,fin.length)).toFixed(1)} obsHits/run ${(res.reduce((a,r)=>a+r.obsHits,0)/N).toFixed(2)} bust ${res.filter(r=>r.why==='bust').length} crash ${res.filter(r=>r.why==='crash').length} escapes ${res.reduce((a,r)=>a+r.esc,0)}`);
  }
}
