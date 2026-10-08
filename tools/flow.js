const load=require('./harness');
const {T}=load();
const {G,P,inp}=T;
function step(n){for(let i=0;i<n;i++){T.update(1/60);if(i%30===0){T.render();T.updateHud()}}}
let ok=true;const chk=(c,m)=>{if(!c){ok=false;console.log('FAIL',m)}else console.log('ok  ',m)};
step(60);chk(G.mode==='menu','boot in menu');
T.act('select');chk(G.mode==='select','select mode');step(120);
T.act('pick','3');chk(G.mode==='brief'&&T.SEL===3,'picked stage 4');step(60);
T.act('start');chk(G.mode==='countdown','countdown');step(60*4);chk(G.mode==='playing','playing');
// lazy: never steer, gear stays
for(let i=0;i<60*120&&G.mode!=='result';i++){T.update(1/60);if(i%60===0){T.render();T.updateHud()}}
chk(G.mode==='result','lazy run ends in result ('+G.why+', hearts '+P.hearts+', t='+G.t.toFixed(1)+')');
chk(G.res===null&&(G.why==='crash'||G.why==='bust'),'lazy driver fails (never steering)');
T.act('retry');chk(G.mode==='countdown','retry restarts');step(60*4);
// pause path
T.setMode('paused');T.act('select');chk(G.mode==='select','select from pause');
T.act('pick','0');T.act('start');step(60*4);chk(G.mode==='playing'&&T.SEL===0,'stage 1 started');
// finish the race artificially
G.pos=T.FINISH_Z-T.PLAYER_Z-200;step(60*4);
chk(G.mode==='result'&&G.res&&G.res.tip>0,'finish -> result with tips '+(G.res&&G.res.tip));
T.act('next');chk(G.mode==='brief'&&T.SEL===1,'next -> stage 2 brief');
T.act('start');step(60*4);chk(G.mode==='playing','stage 2 racing');
T.act('menu');chk(G.mode==='menu','menu');
// every stage finish records
for(let s=0;s<4;s++){T.act('select');T.act('pick',String(s));T.act('start');step(60*4);G.pos=T.FINISH_Z-T.PLAYER_Z-200;step(60*4);chk(G.mode==='result'&&G.res,'stage '+(s+1)+' result')}
console.log(JSON.stringify(T.SAVE));
console.log(ok?'ALL OK':'SOME FAILED');
