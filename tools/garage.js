const load=require('./harness');
const {T}=load();const {G,P,SAVE}=T;
function step(n){for(let i=0;i<n;i++){T.update(1/60);if(i%30===0){T.render();T.updateHud()}}}
let ok=true;const chk=(c,m)=>{if(!c){ok=false;console.log('FAIL',m)}else console.log('ok  ',m)};
step(30);chk(G.mode==='menu','menu');
T.act('garage');chk(G.mode==='garage'&&G.garFrom==='menu','garage from menu');
step(60);T.render();
let h=T.garageHTML();chk(h.includes('โรงรถ')&&h.split('class="bk').length>=5,'garage html has 4 cards');
chk(h.includes('🔒'),'locked state shown with 0 money');
T.act('buy','1');chk(SAVE.own.length===1&&SAVE.tips===0,'cannot buy with no money');
SAVE.tips=1500;h=T.garageHTML();chk(h.includes('ซื้อ ฿1,200'),'affordable shows buy');
T.act('buy','1');chk(G.buy===1&&SAVE.tips===1500&&!SAVE.own.includes(1),'first tap arms only');
chk(T.garageHTML().includes('แตะอีกครั้งเพื่อยืนยัน'),'confirm text');
T.act('buy','1');chk(SAVE.own.includes(1)&&SAVE.tips===300&&SAVE.bike===1,'second tap buys, deducts, selects');
T.act('ride','0');chk(SAVE.bike===0,'ride starter');
T.act('ride','2');chk(SAVE.bike===0,'cannot ride unowned');
T.act('buy','2');T.act('buy','2');chk(!SAVE.own.includes(2)&&SAVE.tips===300,'too poor for bike 2');
SAVE.tips=20000;T.act('buy','3');T.act('buy','3');chk(SAVE.own.includes(3)&&SAVE.bike===3&&SAVE.tips===12500,'bought bike 3');
T.act('back');chk(G.mode==='menu','back to menu');
T.act('select');T.act('garage');chk(G.garFrom==='select','garage from select');T.act('back');chk(G.mode==='select','back to select');
T.act('pick','0');chk(G.mode==='brief'&&T.garageHTML().length>0,'brief ok');
T.act('start');step(60*4);chk(G.mode==='playing','race with bike 3');
G.pos=T.FINISH_Z-T.PLAYER_Z-200;step(60*4);chk(G.mode==='result','result');
// unlock hint
SAVE.tips=0;SAVE.own=[0];SAVE.bike=0;
T.act('select');T.act('pick','0');T.act('start');step(60*4);
// force tip to cross 1200
const origTips=SAVE.tips;SAVE.tips=1100;G.pos=T.FINISH_Z-T.PLAYER_Z-200;step(60*4);
chk(G.res&&G.res.wallet===SAVE.tips,'wallet in result '+(G.res&&G.res.wallet));
console.log('unlock field:',JSON.stringify(G.res&&G.res.unlock),'tip',G.res&&G.res.tip);
console.log(JSON.stringify(SAVE));
console.log(ok?'ALL OK':'SOME FAILED');
